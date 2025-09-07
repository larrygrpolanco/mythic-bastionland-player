/**
 * worldStore.js - Reactive World State Management
 * 
 * This store provides the reactive bridge between the game engine and UI components.
 * It manages world initialization, action execution, and state updates while maintaining
 * the separation between UI-agnostic game logic and Svelte reactivity.
 * 
 * Core Philosophy:
 * - Single source of truth for world state
 * - UI components only interact through this store
 * - Game engine remains UI-agnostic
 * - All state changes flow through reactive stores
 */

import { writable, derived } from 'svelte/store';
import { initWorld } from '../game/World.js';
import { initializeTurnSystem, getTurnSystemStatus } from '../game/TurnManager.js';
import { executeAction } from '../game/systems/ActionSystem.js';
import { buildDecisionContext, buildUIContext } from '../game/context/ContextAssembler.js';

// Import JSON data
import roomsData from '../data/rooms.json';
import marinesData from '../data/marines.json';

/**
 * Core world state store
 */
export const worldStore = writable(null);

/**
 * Derived stores for specific UI needs
 */
export const gameReady = derived(worldStore, $world => {
	return $world && $world.metadata?.status === 'PLAYING';
});

export const currentPhase = derived(worldStore, $world => {
	return $world?.metadata?.phase || 'Phase 0';
});

export const gameStatusStore = derived(worldStore, $world => {
	if (!$world) {
		return { 
			status: 'INITIALIZING',
			phase: 'Phase 0',
			error: null 
		};
	}
	
	return {
		status: $world.metadata?.status || 'UNKNOWN',
		phase: $world.metadata?.phase || 'Phase 0',
		error: $world.metadata?.error || null,
		totalEntities: $world.metadata?.totalEntities || 0
	};
});

export const turnSystemStore = derived(worldStore, $world => {
	if (!$world) return null;
	return getTurnSystemStatus($world);
});

export const activeCharacterStore = derived([worldStore, turnSystemStore], ([$world, $turnSystem]) => {
	if (!$world || !$turnSystem?.activeCharacterId) return null;
	
	const characterId = $turnSystem.activeCharacterId;
	const marine = $world.components?.isMarine?.[characterId];
	const timer = $turnSystem.characterTimers?.[characterId];
	
	if (!marine || !timer) return null;
	
	return {
		entityId: characterId,
		name: marine.name,
		rank: marine.rank,
		isActive: timer.isActive,
		isReady: timer.isReady,
		timer: timer.timer,
		speed: timer.speed
	};
});

/**
 * Initialize the world from JSON data
 */
export async function initializeWorld() {
	console.log('🌍 Initializing world store...');
	
	try {
		// Create world from JSON data
		const world = initWorld(roomsData, marinesData);
		
		// Initialize turn system
		const turnResult = initializeTurnSystem(world);
		if (!turnResult.success) {
			throw new Error(`Turn system initialization failed: ${turnResult.error}`);
		}
		
		// Update world status
		world.metadata.status = 'PLAYING';
		world.metadata.phase = 'Phase 0';
		
		// Set the world in the store
		worldStore.set(world);
		
		console.log('✅ World store initialized successfully');
		console.log('🎯 Turn system active character:', turnResult.activeCharacterId);
		
		return { success: true };
		
	} catch (error) {
		console.error('❌ World initialization failed:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Execute a character action
 * @param {number} characterId - Character entity ID
 * @param {object} action - Action object { type, target?, parameters? }
 * @returns {object} Action execution result
 */
export function executeCharacterAction(characterId, action) {
	console.log(`🎮 Store executing action: ${action.type} for character ${characterId}`);
	
	// Get current world state
	let currentWorld;
	const unsubscribe = worldStore.subscribe(world => currentWorld = world);
	unsubscribe();
	
	if (!currentWorld) {
		console.error('❌ No world state available');
		return { success: false, error: 'World not initialized' };
	}
	
	// Execute action through game engine
	const result = executeAction(currentWorld, characterId, action);
	
	if (result.success) {
		// Update world store to trigger reactivity
		worldStore.update(world => {
			// World is already modified by reference in the game engine
			// Just trigger reactivity by returning the same world
			return world;
		});
		
		console.log('✅ Action executed successfully:', result.actionResult?.message || 'No message');
	} else {
		console.error('❌ Action execution failed:', result.errors);
	}
	
	return result;
}

/**
 * Get decision context for the active character
 * @returns {object|null} Decision context or null if no active character
 */
export function getActiveCharacterContext() {
	let currentWorld, activeCharacter;
	
	const unsubscribe1 = worldStore.subscribe(world => currentWorld = world);
	const unsubscribe2 = activeCharacterStore.subscribe(char => activeCharacter = char);
	unsubscribe1();
	unsubscribe2();
	
	if (!currentWorld || !activeCharacter) {
		return null;
	}
	
	return buildUIContext(currentWorld, activeCharacter.entityId);
}

/**
 * Get full decision context for any character (for debugging/AI)
 * @param {number} characterId - Character entity ID
 * @returns {object|null} Full decision context
 */
export function getCharacterDecisionContext(characterId) {
	let currentWorld;
	const unsubscribe = worldStore.subscribe(world => currentWorld = world);
	unsubscribe();
	
	if (!currentWorld) {
		return null;
	}
	
	return buildDecisionContext(currentWorld, characterId);
}

/**
 * Advance time until a character is ready (for debugging)
 */
export function advanceTime() {
	console.log('⏰ Advancing time...');
	
	worldStore.update(world => {
		if (!world?.turnSystem) {
			console.warn('⚠️ No turn system available');
			return world;
		}
		
		// Simple time advancement - just decrement all timers by their speed
		Object.keys(world.turnSystem.characterTimers).forEach(entityIdStr => {
			const entityId = parseInt(entityIdStr);
			const timer = world.turnSystem.characterTimers[entityId];
			
			if (timer.timer > 0) {
				timer.timer = Math.max(0, timer.timer - timer.speed);
				timer.isReady = timer.timer <= 0;
			}
		});
		
		// Update active character
		const turnStatus = getTurnSystemStatus(world);
		world.turnSystem.activeCharacterId = turnStatus.activeCharacterId;
		
		console.log('⏰ Time advanced, new active character:', world.turnSystem.activeCharacterId);
		return world;
	});
}

/**
 * Reset world state (for debugging)
 */
export function resetWorld() {
	console.log('🔄 Resetting world...');
	worldStore.set(null);
}

/**
 * Get all marines with current status
 */
export const marinesStore = derived(worldStore, $world => {
	if (!$world) return [];
	
	const marines = [];
	const marineEntityIds = Object.keys($world.components?.isMarine || {}).map(Number);
	
	for (const entityId of marineEntityIds) {
		const marine = $world.components.isMarine[entityId];
		const position = $world.components.position?.[entityId];
		const health = $world.components.health?.[entityId];
		const timer = $world.turnSystem?.characterTimers?.[entityId];
		
		marines.push({
			entityId,
			name: marine?.name || 'Unknown',
			rank: marine?.rank || 'Unknown',
			location: position?.roomId || 'unknown',
			health: {
				current: health?.current || 100,
				max: health?.max || 100,
				percentage: Math.round(((health?.current || 100) / (health?.max || 100)) * 100)
			},
			turnStatus: {
				timer: timer?.timer || 0,
				speed: timer?.speed || 5,
				isReady: timer?.isReady || false,
				isActive: timer?.isActive || false
			}
		});
	}
	
	return marines.sort((a, b) => a.name.localeCompare(b.name));
});

/**
 * Get all rooms with current status
 */
export const roomsStore = derived(worldStore, $world => {
	if (!$world) return [];
	
	const rooms = [];
	const roomEntityIds = Object.keys($world.components?.isRoom || {}).map(Number);
	
	for (const entityId of roomEntityIds) {
		const room = $world.components.isRoom[entityId];
		const position = $world.components.position?.[entityId];
		const environment = $world.components.environment?.[entityId];
		const doors = $world.components.doors?.[entityId];
		
		// Count marines in this room
		const marinesInRoom = [];
		const marineEntityIds = Object.keys($world.components?.isMarine || {}).map(Number);
		for (const marineId of marineEntityIds) {
			const marinePosition = $world.components.position?.[marineId];
			if (marinePosition?.roomId === room.id) {
				const marine = $world.components.isMarine[marineId];
				marinesInRoom.push({
					entityId: marineId,
					name: marine?.name || 'Unknown'
				});
			}
		}
		
		rooms.push({
			entityId,
			id: room?.id || 'unknown',
			name: room?.name || 'Unknown Room',
			description: room?.description || 'No description',
			position: {
				x: position?.x || 0,
				y: position?.y || 0
			},
			environment: {
				lighting: environment?.lighting || 'normal',
				temperature: environment?.temperature || 20,
				hazards: environment?.hazards || []
			},
			connections: doors?.connections || [],
			marinesPresent: marinesInRoom
		});
	}
	
	return rooms.sort((a, b) => a.name.localeCompare(b.name));
});

/**
 * Debug function: Get complete world state info
 */
export function getWorldDebugInfo() {
	let currentWorld;
	const unsubscribe = worldStore.subscribe(world => currentWorld = world);
	unsubscribe();
	
	if (!currentWorld) {
		return { error: 'No world state available' };
	}
	
	return {
		metadata: currentWorld.metadata,
		turnSystem: currentWorld.turnSystem,
		componentCounts: {
			isMarine: Object.keys(currentWorld.components?.isMarine || {}).length,
			isRoom: Object.keys(currentWorld.components?.isRoom || {}).length,
			position: Object.keys(currentWorld.components?.position || {}).length,
			health: Object.keys(currentWorld.components?.health || {}).length,
		},
		totalEntities: currentWorld.metadata?.totalEntities || 0
	};
}

/**
 * Debug function: Log current world state
 */
export function debugWorldState() {
	console.group('🌍 World State Debug');
	
	const debugInfo = getWorldDebugInfo();
	console.log('Debug info:', debugInfo);
	
	let currentWorld;
	const unsubscribe = worldStore.subscribe(world => currentWorld = world);
	unsubscribe();
	
	if (currentWorld) {
		console.log('Full world object:', currentWorld);
	}
	
	console.groupEnd();
}
