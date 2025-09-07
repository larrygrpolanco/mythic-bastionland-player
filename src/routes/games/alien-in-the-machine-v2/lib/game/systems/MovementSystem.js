/**
 * MovementSystem.js - Character Movement Logic
 * 
 * This system handles all character movement between rooms, including validation
 * of connections, updating position components, and applying movement effects.
 * 
 * Core Philosophy:
 * - Pure movement logic, no turn system integration (handled by ActionSystem)
 * - Validates room connections and accessibility
 * - Updates world state immediately upon successful execution
 * - Same movement rules for human and AI characters
 */

import { getComponent, hasComponent, getRoomEntityByRoomId } from '../World.js';

/**
 * Execute a movement action
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} actionData - Validated action data from ActionValidator
 * @returns {object} Movement execution result
 */
export function executeMove(world, characterId, actionData) {
	console.log(`🚶 Executing movement: ${actionData.character.name} -> target ${actionData.target}`);
	
	// Get current character position
	const currentPosition = getComponent(world, characterId, 'position');
	if (!currentPosition) {
		return {
			success: false,
			errors: ['Character has no position component'],
			type: 'missing_component'
		};
	}
	
	// Get target room information
	const targetRoomComponent = getComponent(world, actionData.target, 'isRoom');
	if (!targetRoomComponent) {
		return {
			success: false,
			errors: ['Target is not a valid room'],
			type: 'invalid_target'
		};
	}
	
	// Validate movement is possible (already done by validator, but double-check)
	const validationResult = validateMovement(world, characterId, actionData.target);
	if (!validationResult.valid) {
		return {
			success: false,
			errors: validationResult.errors,
			type: 'validation_failed'
		};
	}
	
	// Store previous position for logging
	const previousRoomId = currentPosition.roomId;
	const previousRoomName = getPreviousRoomName(world, previousRoomId);
	
	// Update character position
	currentPosition.roomId = targetRoomComponent.id;
	// Keep existing x,y coordinates or set to room defaults
	if (!currentPosition.x && !currentPosition.y) {
		currentPosition.x = 0;
		currentPosition.y = 0;
	}
	
	// Apply movement type effects
	const movementEffects = applyMovementEffects(world, characterId, actionData);
	
	// Create movement result
	const result = {
		success: true,
		movementType: actionData.type,
		characterName: actionData.character.name,
		fromRoom: {
			id: previousRoomId,
			name: previousRoomName
		},
		toRoom: {
			id: targetRoomComponent.id,
			name: targetRoomComponent.name
		},
		effects: movementEffects,
		message: generateMovementMessage(actionData, previousRoomName, targetRoomComponent.name)
	};
	
	console.log(`✅ Movement successful: ${result.message}`);
	return result;
}

/**
 * Validate that movement between rooms is possible
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {number} targetRoomEntityId - Target room entity ID
 * @returns {object} Validation result
 */
function validateMovement(world, characterId, targetRoomEntityId) {
	const errors = [];
	
	// Get character's current position
	const position = getComponent(world, characterId, 'position');
	if (!position?.roomId) {
		errors.push('Character has no current room');
		return { valid: false, errors };
	}
	
	// Get current room entity
	const currentRoomEntityId = getRoomEntityByRoomId(world, position.roomId);
	if (!currentRoomEntityId) {
		errors.push(`Current room not found: ${position.roomId}`);
		return { valid: false, errors };
	}
	
	// Check if target room exists
	const targetRoom = getComponent(world, targetRoomEntityId, 'isRoom');
	if (!targetRoom) {
		errors.push('Target room does not exist');
		return { valid: false, errors };
	}
	
	// Check if there's a connection from current room to target room
	const currentRoomDoors = getComponent(world, currentRoomEntityId, 'doors');
	if (!currentRoomDoors?.connections) {
		errors.push('Current room has no connections');
		return { valid: false, errors };
	}
	
	const connection = currentRoomDoors.connections.find(conn => 
		conn.targetRoomId === targetRoom.id
	);
	
	if (!connection) {
		errors.push(`No connection from ${position.roomId} to ${targetRoom.name}`);
		return { valid: false, errors };
	}
	
	// TODO: Future phases can add more validation:
	// - Door locked/blocked status
	// - Character physical condition requirements
	// - Environmental hazards blocking passage
	
	return { valid: true, errors: [] };
}

/**
 * Apply effects based on movement type
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} actionData - Action data
 * @returns {string[]} Array of effect descriptions
 */
function applyMovementEffects(world, characterId, actionData) {
	const effects = [];
	
	switch (actionData.type) {
		case 'MOVE_CAREFUL':
			// Careful movement might provide better observation
			effects.push('moved_carefully');
			// TODO: In future phases, this could:
			// - Reduce noise generation
			// - Increase chance to notice things in new room
			// - Reduce chance of triggering hazards
			break;
			
		case 'MOVE_QUICK':
			// Quick movement might be noisier but faster
			effects.push('moved_quickly');
			// TODO: In future phases, this could:
			// - Generate more noise
			// - Reduce observation chance
			// - Increase chance of accidents
			break;
			
		case 'MOVE':
		default:
			// Standard movement has no special effects
			effects.push('moved_normally');
			break;
	}
	
	return effects;
}

/**
 * Generate a human-readable movement message
 * @param {object} actionData - Action data
 * @param {string} fromRoomName - Source room name
 * @param {string} toRoomName - Target room name
 * @returns {string} Movement message
 */
function generateMovementMessage(actionData, fromRoomName, toRoomName) {
	const characterName = actionData.character.name;
	
	switch (actionData.type) {
		case 'MOVE_CAREFUL':
			return `${characterName} carefully moved from ${fromRoomName} to ${toRoomName}`;
		case 'MOVE_QUICK':
			return `${characterName} quickly moved from ${fromRoomName} to ${toRoomName}`;
		case 'MOVE':
		default:
			return `${characterName} moved from ${fromRoomName} to ${toRoomName}`;
	}
}

/**
 * Get the name of a room by its ID
 * @param {object} world - The world object
 * @param {string} roomId - Room ID
 * @returns {string} Room name or 'Unknown Room'
 */
function getPreviousRoomName(world, roomId) {
	const roomEntityId = getRoomEntityByRoomId(world, roomId);
	if (!roomEntityId) {
		return 'Unknown Room';
	}
	
	const roomComponent = getComponent(world, roomEntityId, 'isRoom');
	return roomComponent?.name || 'Unknown Room';
}

/**
 * Get movement options for a character (used by ActionBuilder)
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of movement options
 */
export function getMovementOptions(world, characterId) {
	const options = [];
	const position = getComponent(world, characterId, 'position');
	
	if (!position?.roomId) {
		return options;
	}
	
	const currentRoomEntityId = getRoomEntityByRoomId(world, position.roomId);
	if (!currentRoomEntityId) {
		return options;
	}
	
	const doors = getComponent(world, currentRoomEntityId, 'doors');
	if (!doors?.connections) {
		return options;
	}
	
	for (const connection of doors.connections) {
		const targetRoomEntityId = getRoomEntityByRoomId(world, connection.targetRoomId);
		if (targetRoomEntityId) {
			const targetRoom = getComponent(world, targetRoomEntityId, 'isRoom');
			
			options.push({
				targetEntityId: targetRoomEntityId,
				targetRoomId: connection.targetRoomId,
				targetRoomName: targetRoom?.name || connection.targetRoomId,
				direction: connection.direction,
				baseCost: connection.cost || 8,
				connection
			});
		}
	}
	
	return options;
}

/**
 * Check if a character can move to a specific room
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {string} targetRoomId - Target room ID (not entity ID)
 * @returns {boolean} True if movement is possible
 */
export function canMoveTo(world, characterId, targetRoomId) {
	const targetRoomEntityId = getRoomEntityByRoomId(world, targetRoomId);
	if (!targetRoomEntityId) {
		return false;
	}
	
	const validation = validateMovement(world, characterId, targetRoomEntityId);
	return validation.valid;
}

/**
 * Get all characters in the same room as the specified character
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of character information in same room
 */
export function getCharactersInSameRoom(world, characterId) {
	const position = getComponent(world, characterId, 'position');
	if (!position?.roomId) {
		return [];
	}
	
	const charactersInRoom = [];
	const marineEntityIds = Object.keys(world.components.isMarine || {}).map(Number);
	
	for (const entityId of marineEntityIds) {
		if (entityId === characterId) continue; // Skip self
		
		const otherPosition = getComponent(world, entityId, 'position');
		if (otherPosition?.roomId === position.roomId) {
			const marine = getComponent(world, entityId, 'isMarine');
			charactersInRoom.push({
				entityId,
				name: marine?.name || 'Unknown',
				rank: marine?.rank || 'Unknown'
			});
		}
	}
	
	return charactersInRoom;
}

/**
 * Debug function: Get detailed movement information for a character
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Movement debug information
 */
export function debugMovementInfo(world, characterId) {
	const position = getComponent(world, characterId, 'position');
	const character = getComponent(world, characterId, 'isMarine');
	
	console.group(`🔍 Movement debug for ${character?.name || characterId}`);
	
	const info = {
		characterId,
		characterName: character?.name || 'Unknown',
		currentRoom: position?.roomId || 'Unknown',
		movementOptions: getMovementOptions(world, characterId),
		charactersInRoom: getCharactersInSameRoom(world, characterId)
	};
	
	console.log('Current position:', position);
	console.log('Movement options:', info.movementOptions);
	console.log('Others in room:', info.charactersInRoom);
	
	console.groupEnd();
	
	return info;
}
