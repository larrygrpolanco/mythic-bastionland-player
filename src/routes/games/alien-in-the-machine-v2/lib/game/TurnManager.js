/**
 * TurnManager.js - Tick-Based Turn System
 * 
 * Core turn management system using priority queue and tick-based timing.
 * This is a foundational system built from day 1, not retrofitted like V1.
 * 
 * Core Philosophy:
 * - Actions directly cost time ticks
 * - Speed determines how quickly timers count down  
 * - Turn order emerges naturally from readiness times
 * - Simple priority queue handles all edge cases
 * 
 * Key Innovation: Unified Decision Pipeline
 * - Human and AI characters use identical turn mechanics
 * - Same validation, same costs, same timing
 * - Only the decision-maker differs (UI vs LLM)
 */

import { getComponent, hasComponent, getEntitiesWithComponent } from './World.js';

/**
 * Initialize the turn system for all characters in the world
 * @param {object} world - The world object
 * @returns {object} Result with success status
 */
export function initializeTurnSystem(world) {
	console.log('⏰ Initializing turn system...');
	
	// Get all marine entities (characters that can take turns)
	const marineEntityIds = getEntitiesWithComponent(world, 'isMarine');
	
	if (marineEntityIds.length === 0) {
		console.warn('⚠️ No marines found to initialize turn system');
		return { success: false, error: 'No characters available' };
	}
	
	// Initialize character timers and turn queue
	world.turnSystem = {
		characterTimers: {},
		gameTick: 0,
		activeCharacterId: null,
		turnQueue: []
	};
	
	// Set up each character in the turn system
	marineEntityIds.forEach(entityId => {
		const speedComponent = getComponent(world, entityId, 'speed');
		const marineComponent = getComponent(world, entityId, 'isMarine');
		
		if (!speedComponent || !marineComponent) {
			console.warn(`⚠️ Character ${entityId} missing required components for turn system`);
			return;
		}
		
		// Initialize character timer
		world.turnSystem.characterTimers[entityId] = {
			timer: 0,  // Start ready to act
			speed: speedComponent.current,
			name: marineComponent.name,
			isReady: true,
			isActive: false
		};
		
		// Add to turn queue
		world.turnSystem.turnQueue.push({
			characterId: entityId,
			readyAt: 0,  // All start ready
			speed: speedComponent.current
		});
		
		console.log(`⚡ Initialized turn system for ${marineComponent.name} (speed: ${speedComponent.current})`);
	});
	
	// Sort turn queue by readiness (lowest readyAt first)
	sortTurnQueue(world);
	
	// Set first active character
	setNextActiveCharacter(world);
	
	console.log(`✅ Turn system initialized with ${marineEntityIds.length} characters`);
	return { success: true, activeCharacterId: world.turnSystem.activeCharacterId };
}

/**
 * Sort the turn queue by readyAt time (ascending)
 * @param {object} world - The world object
 */
function sortTurnQueue(world) {
	world.turnSystem.turnQueue.sort((a, b) => {
		// Primary sort: readyAt time (lower = sooner)
		if (a.readyAt !== b.readyAt) {
			return a.readyAt - b.readyAt;
		}
		
		// Secondary sort: higher speed goes first in ties
		return b.speed - a.speed;
	});
}

/**
 * Get the next character who should act (lowest timer/readyAt)
 * @param {object} world - The world object
 * @returns {number|null} Entity ID of next character to act, or null
 */
export function getNextCharacterToAct(world) {
	if (!world.turnSystem?.turnQueue || world.turnSystem.turnQueue.length === 0) {
		return null;
	}
	
	// Check if first character in queue is ready (readyAt <= gameTick)
	const nextInQueue = world.turnSystem.turnQueue[0];
	if (nextInQueue && nextInQueue.readyAt <= world.turnSystem.gameTick) {
		return nextInQueue.characterId;
	}
	
	return null;
}

/**
 * Set the next active character based on turn queue
 * @param {object} world - The world object
 */
function setNextActiveCharacter(world) {
	// Clear current active character
	const currentActiveId = world.turnSystem.activeCharacterId;
	if (currentActiveId && world.turnSystem.characterTimers[currentActiveId]) {
		world.turnSystem.characterTimers[currentActiveId].isActive = false;
	}
	
	// Get next character to act
	const nextCharacterId = getNextCharacterToAct(world);
	world.turnSystem.activeCharacterId = nextCharacterId;
	
	// Update character timer states
	Object.keys(world.turnSystem.characterTimers).forEach(entityIdStr => {
		const entityId = parseInt(entityIdStr);
		const timer = world.turnSystem.characterTimers[entityId];
		
		timer.isReady = timer.timer <= 0;
		timer.isActive = entityId === nextCharacterId;
	});
	
	if (nextCharacterId) {
		console.log(`👤 Next active character: ${world.turnSystem.characterTimers[nextCharacterId]?.name} (ID: ${nextCharacterId})`);
	}
}

/**
 * Execute an action and apply its tick cost to the character
 * @param {object} world - The world object
 * @param {number} characterId - ID of character taking action
 * @param {number} actionCost - Tick cost of the action
 * @returns {object} Result with success status
 */
export function executeAction(world, characterId, actionCost) {
	if (!world.turnSystem?.characterTimers?.[characterId]) {
		return { success: false, error: `Character ${characterId} not found in turn system` };
	}
	
	const characterTimer = world.turnSystem.characterTimers[characterId];
	
	// Validate character is ready to act
	if (characterTimer.timer > 0) {
		return { success: false, error: `Character ${characterTimer.name} not ready (timer: ${characterTimer.timer})` };
	}
	
	// Apply action cost to character's timer
	characterTimer.timer += actionCost;
	characterTimer.isReady = false;
	characterTimer.isActive = false;
	
	// Update turn queue - find this character and update their readyAt time
	const queueEntry = world.turnSystem.turnQueue.find(entry => entry.characterId === characterId);
	if (queueEntry) {
		queueEntry.readyAt = world.turnSystem.gameTick + actionCost;
	}
	
	// Resort turn queue after action
	sortTurnQueue(world);
	
	// Set next active character
	setNextActiveCharacter(world);
	
	console.log(`⚡ Action executed: ${characterTimer.name} (+${actionCost} ticks, timer now: ${characterTimer.timer})`);
	return { 
		success: true, 
		newActiveCharacterId: world.turnSystem.activeCharacterId,
		actionCost 
	};
}

/**
 * Advance time by one tick, updating all character timers
 * @param {object} world - The world object
 * @returns {object} Result with characters that became ready
 */
export function advanceTick(world) {
	if (!world.turnSystem) {
		return { success: false, error: 'Turn system not initialized' };
	}
	
	world.turnSystem.gameTick++;
	const newlyReadyCharacters = [];
	
	// Update all character timers based on their speed
	Object.keys(world.turnSystem.characterTimers).forEach(entityIdStr => {
		const entityId = parseInt(entityIdStr);
		const timer = world.turnSystem.characterTimers[entityId];
		
		// Countdown timer by character's speed
		if (timer.timer > 0) {
			timer.timer -= timer.speed;
			
			// Check if character became ready
			if (timer.timer <= 0) {
				timer.timer = 0;  // Don't go negative
				timer.isReady = true;
				newlyReadyCharacters.push({
					entityId,
					name: timer.name
				});
			}
		}
	});
	
	// Set next active character if none currently active
	if (!world.turnSystem.activeCharacterId || world.turnSystem.characterTimers[world.turnSystem.activeCharacterId]?.timer > 0) {
		setNextActiveCharacter(world);
	}
	
	if (newlyReadyCharacters.length > 0) {
		console.log(`⏰ Tick ${world.turnSystem.gameTick}: ${newlyReadyCharacters.map(c => c.name).join(', ')} became ready`);
	}
	
	return { 
		success: true, 
		gameTick: world.turnSystem.gameTick,
		newlyReady: newlyReadyCharacters,
		activeCharacterId: world.turnSystem.activeCharacterId
	};
}

/**
 * Get current turn system status for UI display
 * @param {object} world - The world object
 * @returns {object} Turn system status
 */
export function getTurnSystemStatus(world) {
	if (!world.turnSystem) {
		return { 
			initialized: false,
			error: 'Turn system not initialized'
		};
	}
	
	return {
		initialized: true,
		gameTick: world.turnSystem.gameTick,
		activeCharacterId: world.turnSystem.activeCharacterId,
		characterTimers: world.turnSystem.characterTimers,
		turnQueue: world.turnSystem.turnQueue.map(entry => ({
			...entry,
			name: world.turnSystem.characterTimers[entry.characterId]?.name || 'Unknown'
		}))
	};
}

/**
 * Get detailed information about a specific character's turn status
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Character turn status
 */
export function getCharacterTurnStatus(world, characterId) {
	if (!world.turnSystem?.characterTimers?.[characterId]) {
		return { found: false, error: `Character ${characterId} not in turn system` };
	}
	
	const timer = world.turnSystem.characterTimers[characterId];
	const queuePosition = world.turnSystem.turnQueue.findIndex(entry => entry.characterId === characterId);
	
	return {
		found: true,
		entityId: characterId,
		name: timer.name,
		timer: timer.timer,
		speed: timer.speed,
		isReady: timer.isReady,
		isActive: timer.isActive,
		queuePosition: queuePosition + 1,  // 1-based position
		ticksUntilReady: Math.max(0, timer.timer)
	};
}

/**
 * Force advance time until at least one character is ready
 * Useful for handling situations where all characters are on cooldown
 * @param {object} world - The world object
 * @returns {object} Result with ticks advanced
 */
export function advanceUntilCharacterReady(world) {
	if (!world.turnSystem) {
		return { success: false, error: 'Turn system not initialized' };
	}
	
	let ticksAdvanced = 0;
	const maxTicks = 100;  // Safety limit to prevent infinite loops
	
	// Keep advancing until someone is ready or we hit the limit
	while (ticksAdvanced < maxTicks) {
		// Check if any character is already ready
		const readyCharacter = getNextCharacterToAct(world);
		if (readyCharacter) {
			break;
		}
		
		// Advance one tick
		advanceTick(world);
		ticksAdvanced++;
	}
	
	if (ticksAdvanced >= maxTicks) {
		console.warn('⚠️ Maximum tick advancement reached, possible infinite loop');
		return { success: false, error: 'Maximum tick advancement reached' };
	}
	
	console.log(`⏰ Advanced ${ticksAdvanced} ticks until character ready`);
	return { 
		success: true, 
		ticksAdvanced,
		activeCharacterId: world.turnSystem.activeCharacterId
	};
}

/**
 * Debug function: Get complete turn system state
 * @param {object} world - The world object
 * @returns {object} Complete turn system debug info
 */
export function getDebugTurnInfo(world) {
	if (!world.turnSystem) {
		return { error: 'Turn system not initialized' };
	}
	
	return {
		gameTick: world.turnSystem.gameTick,
		activeCharacterId: world.turnSystem.activeCharacterId,
		characterCount: Object.keys(world.turnSystem.characterTimers).length,
		characterTimers: world.turnSystem.characterTimers,
		turnQueue: world.turnSystem.turnQueue,
		queueOrder: world.turnSystem.turnQueue.map(entry => ({
			name: world.turnSystem.characterTimers[entry.characterId]?.name || 'Unknown',
			entityId: entry.characterId,
			readyAt: entry.readyAt,
			speed: entry.speed
		}))
	};
}
