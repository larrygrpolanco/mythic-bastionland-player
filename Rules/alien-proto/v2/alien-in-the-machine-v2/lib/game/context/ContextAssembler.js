/**
 * ContextAssembler.js - Decision Context Assembly
 * 
 * This is the core of the unified decision pipeline. It builds identical context
 * for both human UI and AI decision-making, ensuring perfect consistency between
 * human and AI game experiences.
 * 
 * Core Philosophy:
 * - Same context for human UI and AI prompts
 * - Rich, actionable information for decision-making
 * - Context drives action generation and validation
 * - Single source of truth for game state perception
 */

import { getComponent, hasComponent, getAllMarines, getAllRooms, getRoomEntityByRoomId, getEntityDebugInfo } from '../World.js';
import { getTurnSystemStatus, getCharacterTurnStatus } from '../TurnManager.js';
import { generateAvailableActions } from './ActionBuilder.js';
import { compileAIPrompt, compileUIText, CHARACTER_TEMPLATES, ENVIRONMENT_TEMPLATES, AI_PROMPT_TEMPLATES } from './PromptTemplates.js';
import { getMissionContext } from '../systems/MissionSystem.js';

/**
 * Build complete decision context for a character
 * This is used by both human UI and AI decision-making
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID making the decision
 * @returns {object} Complete decision context
 */
export function buildDecisionContext(world, characterId) {
	console.log(`🧠 Building decision context for character ${characterId}...`);
	
	const context = {
		// Core character information
		character: getCharacterContext(world, characterId),
		
		// Current environment and situation
		environment: getEnvironmentContext(world, characterId),
		
		// Available actions with costs and targets
		availableActions: generateAvailableActions(world, characterId),
		
		// Other characters and their status
		otherCharacters: getOtherCharactersContext(world, characterId),
		
		// Turn system status
		turnSystem: getTurnContext(world, characterId),
		
		// Mission objectives and status
		mission: getMissionContext(world, characterId),
		
		// World state information
		worldState: getWorldStateContext(world),
		
		// Context metadata
		metadata: {
			characterId,
			timestamp: Date.now(),
			gameTick: world.turnSystem?.gameTick || 0,
			contextType: 'decision',
			phase: world.metadata?.phase || 'Unknown'
		}
	};
	
	console.log(`✅ Decision context built: ${context.availableActions.length} actions available`);
	return context;
}

/**
 * Get character-specific context information
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Character context
 */
function getCharacterContext(world, characterId) {
	const marine = getComponent(world, characterId, 'isMarine');
	const position = getComponent(world, characterId, 'position');
	const health = getComponent(world, characterId, 'health');
	const speed = getComponent(world, characterId, 'speed');
	const skills = getComponent(world, characterId, 'skills');
	const personality = getComponent(world, characterId, 'personality');
	const inventory = getComponent(world, characterId, 'inventory');
	
	if (!marine) {
		console.warn(`⚠️ Character ${characterId} is not a marine`);
		return null;
	}
	
	return {
		entityId: characterId,
		name: marine.name,
		rank: marine.rank,
		
		// Physical state
		health: {
			current: health?.current || 100,
			max: health?.max || 100,
			percentage: Math.round(((health?.current || 100) / (health?.max || 100)) * 100)
		},
		
		// Movement and timing
		speed: {
			current: speed?.current || 5,
			base: speed?.base || 5,
			modifiers: speed?.modifiers || []
		},
		
		// Location information
		location: {
			roomId: position?.roomId || 'unknown',
			coordinates: {
				x: position?.x || 0,
				y: position?.y || 0
			}
		},
		
		// Skills and capabilities
		skills: {
			technical: skills?.technical || 3,
			combat: skills?.combat || 3,
			medical: skills?.medical || 3
		},
		
		// Personality and motivation
		personality: {
			traits: personality?.traits || [],
			background: personality?.background || '',
			motivation: personality?.motivation || ''
		},
		
		// Equipment and inventory
		inventory: {
			items: inventory?.items || [],
			capacity: inventory?.capacity || 10,
			used: (inventory?.items || []).length
		}
	};
}

/**
 * Get environment context for character's current location
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Environment context
 */
function getEnvironmentContext(world, characterId) {
	const position = getComponent(world, characterId, 'position');
	
	if (!position?.roomId) {
		return {
			currentRoom: null,
			error: 'Character has no position'
		};
	}
	
	// Get current room entity
	const roomEntityId = getRoomEntityByRoomId(world, position.roomId);
	if (!roomEntityId) {
		return {
			currentRoom: null,
			error: `Room not found: ${position.roomId}`
		};
	}
	
	const room = getComponent(world, roomEntityId, 'isRoom');
	const environment = getComponent(world, roomEntityId, 'environment');
	const doors = getComponent(world, roomEntityId, 'doors');
	
	// Find other entities in the same room
	const entitiesInRoom = findEntitiesInRoom(world, position.roomId, characterId);
	
	return {
		currentRoom: {
			entityId: roomEntityId,
			id: room?.id || position.roomId,
			name: room?.name || 'Unknown Room',
			description: room?.description || 'No description available',
			
			// Environmental conditions
			conditions: {
				lighting: environment?.lighting || 'normal',
				atmosphere: environment?.atmosphere || 'normal',
				temperature: environment?.temperature || 20,
				hazards: environment?.hazards || []
			},
			
			// Available exits
			exits: (doors?.connections || []).map(conn => ({
				direction: conn.direction,
				targetRoomId: conn.targetRoomId,
				cost: conn.cost || 8,
				description: conn.description || `Exit to ${conn.targetRoomId}`
			})),
			
			// Other entities in room
			entities: entitiesInRoom
		}
	};
}

/**
 * Find all entities in the same room as the character (excluding the character)
 * @param {object} world - The world object
 * @param {string} roomId - Room ID to search in
 * @param {number} excludeCharacterId - Character ID to exclude from results
 * @returns {object[]} Array of entity information
 */
function findEntitiesInRoom(world, roomId, excludeCharacterId) {
	const entities = [];
	
	// Find other marines in the room
	const marines = getAllMarines(world);
	for (const marine of marines) {
		if (marine.entityId !== excludeCharacterId && marine.position?.roomId === roomId) {
			entities.push({
				entityId: marine.entityId,
				type: 'marine',
				name: marine.marine?.name || 'Unknown Marine',
				rank: marine.marine?.rank || 'Unknown',
				description: `${marine.marine?.rank || 'Marine'} ${marine.marine?.name || 'Unknown'}`
			});
		}
	}
	
	// TODO: In future phases, add items, furniture, etc.
	// For now, just return marines
	
	return entities;
}

/**
 * Get context about other characters in the game
 * @param {object} world - The world object
 * @param {number} characterId - Current character entity ID
 * @returns {object[]} Array of other character contexts
 */
function getOtherCharactersContext(world, characterId) {
	const marines = getAllMarines(world);
	const otherCharacters = [];
	
	for (const marine of marines) {
		if (marine.entityId === characterId) {
			continue;  // Skip current character
		}
		
		const turnStatus = getCharacterTurnStatus(world, marine.entityId);
		
		otherCharacters.push({
			entityId: marine.entityId,
			name: marine.marine?.name || 'Unknown',
			rank: marine.marine?.rank || 'Unknown',
			location: marine.position?.roomId || 'unknown',
			
			// Turn status
			isReady: turnStatus.isReady || false,
			isActive: turnStatus.isActive || false,
			timer: turnStatus.timer || 0,
			speed: turnStatus.speed || 5,
			
			// Health status (visible to others)
			healthStatus: getVisibleHealthStatus(marine.health),
			
			// Distance (same room, adjacent room, far)
			distance: calculateDistance(world, characterId, marine.entityId)
		});
	}
	
	return otherCharacters;
}

/**
 * Get turn system context relevant to decision-making
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Turn context
 */
function getTurnContext(world, characterId) {
	const turnStatus = getTurnSystemStatus(world);
	const characterTurnStatus = getCharacterTurnStatus(world, characterId);
	
	return {
		// Current turn state
		gameTick: turnStatus.gameTick || 0,
		isMyTurn: characterTurnStatus.isActive || false,
		isReady: characterTurnStatus.isReady || false,
		
		// Character timing
		myTimer: characterTurnStatus.timer || 0,
		mySpeed: characterTurnStatus.speed || 5,
		queuePosition: characterTurnStatus.queuePosition || 0,
		ticksUntilReady: characterTurnStatus.ticksUntilReady || 0,
		
		// Turn queue overview (for tactical planning)
		nextUp: turnStatus.turnQueue ? turnStatus.turnQueue.slice(0, 3).map(entry => ({
			name: entry.name || 'Unknown',
			readyAt: entry.readyAt,
			isMe: entry.characterId === characterId
		})) : []
	};
}

/**
 * Get general world state context
 * @param {object} world - The world object
 * @returns {object} World state context
 */
function getWorldStateContext(world) {
	const rooms = getAllRooms(world);
	const marines = getAllMarines(world);
	
	return {
		// Overall game state
		phase: world.metadata?.phase || 'Unknown',
		status: world.metadata?.status || 'Unknown',
		
		// Entity counts
		totalRooms: rooms.length,
		totalMarines: marines.length,
		totalEntities: world.metadata?.totalEntities || 0,
		
		// Room layout (for navigation planning)
		knownRooms: rooms.map(room => ({
			id: room.room?.id || 'unknown',
			name: room.room?.name || 'Unknown Room',
			hasConnections: (room.doors?.connections || []).length > 0
		}))
	};
}

/**
 * Get visible health status for other characters
 * @param {object} healthComponent - Health component data
 * @returns {string} Visible health status
 */
function getVisibleHealthStatus(healthComponent) {
	if (!healthComponent) {
		return 'unknown';
	}
	
	const percentage = (healthComponent.current / healthComponent.max) * 100;
	
	if (percentage >= 90) return 'healthy';
	if (percentage >= 70) return 'lightly_wounded';
	if (percentage >= 50) return 'wounded';
	if (percentage >= 30) return 'badly_wounded';
	if (percentage > 0) return 'critical';
	return 'unconscious';
}

/**
 * Calculate relative distance between two characters
 * @param {object} world - The world object
 * @param {number} characterId1 - First character entity ID
 * @param {number} characterId2 - Second character entity ID
 * @returns {string} Distance descriptor
 */
function calculateDistance(world, characterId1, characterId2) {
	const pos1 = getComponent(world, characterId1, 'position');
	const pos2 = getComponent(world, characterId2, 'position');
	
	if (!pos1 || !pos2) {
		return 'unknown';
	}
	
	if (pos1.roomId === pos2.roomId) {
		return 'same_room';
	}
	
	// TODO: In future phases, calculate actual room distance
	// For now, just return different_room
	return 'different_room';
}

/**
 * Build simplified context for UI display with template-generated text
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Simplified context for UI
 */
export function buildUIContext(world, characterId) {
	const context = buildDecisionContext(world, characterId);
	
	// Generate template-compiled UI text
	const uiText = compileUIText(context);
	
	// Return simplified version for UI rendering with template text
	return {
		...context,
		
		// Template-generated UI text
		uiText,
		
		// Legacy fields for backwards compatibility
		character: context.character,
		currentRoom: context.environment.currentRoom,
		availableActions: context.availableActions,
		turnStatus: context.turnSystem,
		
		// Simplified other characters info
		teammates: context.otherCharacters.map(char => ({
			name: char.name,
			location: char.location,
			isReady: char.isReady,
			isActive: char.isActive,
			healthStatus: char.healthStatus
		}))
	};
}

/**
 * Build context specifically formatted for AI prompts with template-generated text
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} AI-formatted context with complete prompt
 */
export function buildAIContext(world, characterId) {
	const context = buildDecisionContext(world, characterId);
	
	// Generate template-compiled AI prompt
	const compiledPrompt = compileAIPrompt(context);
	
	// Format for AI consumption with template-based text
	return {
		...context,
		
		// Complete AI prompt from templates
		compiledPrompt,
		
		// Legacy fields for backwards compatibility (now template-based)
		situationSummary: generateSituationSummaryFromTemplates(context),
		actionSummary: generateActionSummaryFromTemplates(context.availableActions),
		tacticalSummary: generateTacticalSummaryFromTemplates(context)
	};
}

/**
 * Generate human-readable situation summary for AI
 * @param {object} context - Decision context
 * @returns {string} Situation summary
 */
function generateSituationSummary(context) {
	const char = context.character;
	const room = context.environment.currentRoom;
	
	if (!char || !room) {
		return 'Unable to assess current situation due to missing information.';
	}
	
	let summary = `You are ${char.name}, a ${char.rank} in the Colonial Marines. `;
	summary += `You are currently in the ${room.name}. `;
	summary += `Your health is at ${char.health.percentage}%. `;
	
	if (context.turnSystem.isMyTurn) {
		summary += `It is your turn to act. `;
	} else {
		summary += `You need to wait ${context.turnSystem.ticksUntilReady} more ticks before you can act. `;
	}
	
	if (context.environment.currentRoom.entities.length > 0) {
		const others = context.environment.currentRoom.entities.map(e => e.name).join(', ');
		summary += `Also present: ${others}. `;
	}
	
	return summary;
}

/**
 * Generate action summary for AI
 * @param {object[]} actions - Available actions array
 * @returns {string} Action summary
 */
function generateActionSummary(actions) {
	if (actions.length === 0) {
		return 'No actions are currently available.';
	}
	
	let summary = `You have ${actions.length} available actions: `;
	const actionDescriptions = actions.map(action => 
		`${action.name} (${action.cost} ticks)`
	);
	
	summary += actionDescriptions.join(', ');
	summary += '.';
	
	return summary;
}

/**
 * Generate tactical summary for AI decision-making
 * @param {object} context - Decision context
 * @returns {string} Tactical summary
 */
function generateTacticalSummary(context) {
	const turnInfo = context.turnSystem;
	const nextUp = turnInfo.nextUp.filter(entry => !entry.isMe).slice(0, 2);
	
	let summary = `Tactical situation: Game tick ${turnInfo.gameTick}. `;
	
	if (nextUp.length > 0) {
		const nextNames = nextUp.map(entry => entry.name).join(' and ');
		summary += `After your action, ${nextNames} will act next. `;
	}
	
	const teammates = context.otherCharacters.filter(char => char.distance === 'same_room');
	if (teammates.length > 0) {
		const readyTeammates = teammates.filter(char => char.isReady);
		if (readyTeammates.length > 0) {
			summary += `${readyTeammates.length} teammate(s) in your room are ready to act. `;
		}
	}
	
	return summary;
}

/**
 * Generate template-based situation summary for AI
 * @param {object} context - Decision context
 * @returns {string} Template-based situation summary
 */
function generateSituationSummaryFromTemplates(context) {
	const char = context.character;
	const room = context.environment.currentRoom;
	
	if (!char || !room) {
		return 'Unable to assess current situation due to missing information.';
	}
	
	// Use CHARACTER_TEMPLATES for consistent character status
	const characterStatus = CHARACTER_TEMPLATES.STATUS.compile({
		name: char.name,
		rank: char.rank,
		health: char.health.percentage,
		roomName: room.name,
		speed: char.speed.current
	});
	
	// Use ENVIRONMENT_TEMPLATES for room description
	const roomDescription = ENVIRONMENT_TEMPLATES.ROOM_DESCRIPTION.compile({
		roomName: room.name,
		description: room.description,
		lighting: room.conditions.lighting,
		temperature: room.conditions.temperature
	});
	
	let summary = characterStatus + ' ' + roomDescription;
	
	if (context.environment.currentRoom.entities.length > 0) {
		const entitiesDescription = ENVIRONMENT_TEMPLATES.ENTITIES.compile({
			entities: context.environment.currentRoom.entities
		});
		summary += ' ' + entitiesDescription;
	}
	
	return summary;
}

/**
 * Generate template-based action summary for AI
 * @param {object[]} actions - Available actions array
 * @returns {string} Template-based action summary
 */
function generateActionSummaryFromTemplates(actions) {
	if (actions.length === 0) {
		return 'No actions are currently available.';
	}
	
	// Use AI_PROMPT_TEMPLATES for action listing
	return AI_PROMPT_TEMPLATES.AVAILABLE_ACTIONS.compile({
		availableActions: actions
	});
}

/**
 * Generate template-based tactical summary for AI
 * @param {object} context - Decision context
 * @returns {string} Template-based tactical summary
 */
function generateTacticalSummaryFromTemplates(context) {
	const turnInfo = context.turnSystem;
	
	// Use TURN_TEMPLATES for consistent turn status
	const turnStatus = AI_PROMPT_TEMPLATES.SITUATION_HEADER.compile(context);
	
	return turnStatus;
}

/**
 * Debug function: Get complete context information
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Debug context with additional information
 */
export function debugBuildContext(world, characterId) {
	console.group(`🔍 Building debug context for character ${characterId}`);
	
	const context = buildDecisionContext(world, characterId);
	const debugInfo = {
		...context,
		debug: {
			characterExists: hasComponent(world, characterId, 'isMarine'),
			worldState: world.metadata,
			rawCharacterData: getEntityDebugInfo(world, characterId)
		}
	};
	
	console.log('Context built:', debugInfo);
	console.groupEnd();
	
	return debugInfo;
}
