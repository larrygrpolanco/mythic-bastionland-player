/**
 * ActionValidator.js - Action Validation System
 * 
 * This module validates actions before they are executed, ensuring game rules
 * are enforced consistently for both human and AI players. This is a critical
 * part of the unified decision pipeline.
 * 
 * Core Philosophy:
 * - Same validation rules apply to human and AI actions
 * - Prevent invalid actions rather than handle them after execution
 * - Clear error messages for debugging and user feedback
 * - Fast validation that doesn't modify world state
 */

import { getComponent, hasComponent, getRoomEntityByRoomId } from '../World.js';
import { getCharacterTurnStatus } from '../TurnManager.js';
import { getActionType, validateActionTarget } from './ActionTypes.js';
import { calculateActionCost } from './ActionCosts.js';

/**
 * Validation result structure
 * @typedef {object} ValidationResult
 * @property {boolean} valid - Whether the action is valid
 * @property {string[]} errors - Array of error messages (if invalid)
 * @property {string[]} warnings - Array of warning messages
 * @property {object} actionData - Processed action data (if valid)
 */

/**
 * Validate an action before execution
 * @param {object} world - The world object
 * @param {number} characterId - ID of character attempting action
 * @param {object} action - Action object { type, target?, parameters? }
 * @returns {ValidationResult} Validation result
 */
export function validateAction(world, characterId, action) {
	const result = {
		valid: false,
		errors: [],
		warnings: [],
		actionData: null
	};
	
	// Basic input validation
	if (!world) {
		result.errors.push('World object is required');
		return result;
	}
	
	if (!characterId || typeof characterId !== 'number') {
		result.errors.push('Valid character ID is required');
		return result;
	}
	
	if (!action || !action.type) {
		result.errors.push('Action object with type is required');
		return result;
	}
	
	// Character existence validation
	if (!hasComponent(world, characterId, 'isMarine')) {
		result.errors.push(`Character ${characterId} does not exist or is not a marine`);
		return result;
	}
	
	// Turn system validation
	const turnStatus = getCharacterTurnStatus(world, characterId);
	if (!turnStatus.found) {
		result.errors.push(`Character ${characterId} is not in the turn system`);
		return result;
	}
	
	if (!turnStatus.isReady) {
		result.errors.push(`Character ${turnStatus.name} is not ready (${turnStatus.ticksUntilReady} ticks remaining)`);
		return result;
	}
	
	// Action type validation
	const actionType = getActionType(action.type);
	if (!actionType) {
		result.errors.push(`Unknown action type: ${action.type}`);
		return result;
	}
	
	// Component requirements validation
	const componentErrors = validateComponentRequirements(world, characterId, actionType);
	result.errors.push(...componentErrors);
	
	// Target validation
	const targetErrors = validateTarget(world, characterId, action, actionType);
	result.errors.push(...targetErrors);
	
	// Condition validation (game state requirements)
	const conditionErrors = validateConditions(world, characterId, action, actionType);
	result.errors.push(...conditionErrors);
	
	// If we have errors, validation failed
	if (result.errors.length > 0) {
		return result;
	}
	
	// Action is valid - prepare processed action data
	const character = getComponent(world, characterId, 'isMarine');
	const characterSkills = getComponent(world, characterId, 'skills');
	const characterPosition = getComponent(world, characterId, 'position');
	const environment = getEnvironmentForPosition(world, characterPosition);
	
	// Calculate final action cost
	const finalCost = calculateActionCost(
		action.type, 
		{ name: character.name, skills: characterSkills }, 
		environment
	);
	
	result.actionData = {
		type: action.type,
		characterId,
		target: action.target || null,
		parameters: action.parameters || {},
		cost: finalCost,
		actionType,
		character,
		timestamp: Date.now()
	};
	
	// Add any warnings
	if (finalCost !== actionType.baseCost) {
		const modifier = finalCost - actionType.baseCost;
		const direction = modifier > 0 ? 'increased' : 'decreased';
		result.warnings.push(`Action cost ${direction} by ${Math.abs(modifier)} ticks due to character/environment modifiers`);
	}
	
	result.valid = true;
	console.log(`✅ Action validated: ${character.name} can perform ${action.type} (cost: ${finalCost} ticks)`);
	return result;
}

/**
 * Validate that character has required components for an action
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} actionType - Action type definition
 * @returns {string[]} Array of error messages
 */
function validateComponentRequirements(world, characterId, actionType) {
	const errors = [];
	
	if (!actionType.requirements?.components) {
		return errors;  // No component requirements
	}
	
	for (const requiredComponent of actionType.requirements.components) {
		if (!hasComponent(world, characterId, requiredComponent)) {
			errors.push(`Character missing required component: ${requiredComponent}`);
		}
	}
	
	return errors;
}

/**
 * Validate action target
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} action - Action object
 * @param {object} actionType - Action type definition
 * @returns {string[]} Array of error messages
 */
function validateTarget(world, characterId, action, actionType) {
	const errors = [];
	
	// Check if action requires a target
	if (actionType.requiresTarget) {
		if (!action.target) {
			errors.push(`Action ${actionType.name} requires a target`);
			return errors;
		}
		
		// Validate target exists and is correct type
		if (!validateActionTarget(world, actionType.id, action.target)) {
			errors.push(`Invalid target for action ${actionType.name}: ${action.target}`);
		}
		
		// Additional target-specific validation
		if (actionType.targetType === 'ROOM') {
			const roomValidation = validateRoomTarget(world, characterId, action.target);
			errors.push(...roomValidation);
		}
		
	} else {
		// Action doesn't require target, but warn if one was provided
		if (action.target) {
			// This isn't an error, but could be a warning
			// For now, we'll allow it silently
		}
	}
	
	return errors;
}

/**
 * Validate room target for movement actions
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {number} targetRoomEntityId - Target room entity ID
 * @returns {string[]} Array of error messages
 */
function validateRoomTarget(world, characterId, targetRoomEntityId) {
	const errors = [];
	
	const characterPosition = getComponent(world, characterId, 'position');
	if (!characterPosition) {
		errors.push('Character has no position component');
		return errors;
	}
	
	// Find current room entity
	const currentRoomEntityId = getRoomEntityByRoomId(world, characterPosition.roomId);
	if (!currentRoomEntityId) {
		errors.push(`Character's current room not found: ${characterPosition.roomId}`);
		return errors;
	}
	
	// Check if target room is connected to current room
	const currentRoomDoors = getComponent(world, currentRoomEntityId, 'doors');
	if (!currentRoomDoors?.connections) {
		errors.push('Current room has no door connections');
		return errors;
	}
	
	// Get target room component to find its ID
	const targetRoomComponent = getComponent(world, targetRoomEntityId, 'isRoom');
	if (!targetRoomComponent) {
		errors.push('Target is not a valid room');
		return errors;
	}
	
	// Check if there's a connection to the target room
	const connection = currentRoomDoors.connections.find(conn => 
		conn.targetRoomId === targetRoomComponent.id
	);
	
	if (!connection) {
		errors.push(`No connection from current room to target room: ${targetRoomComponent.name}`);
	}
	
	return errors;
}

/**
 * Validate action conditions (game state requirements)
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} action - Action object
 * @param {object} actionType - Action type definition
 * @returns {string[]} Array of error messages
 */
function validateConditions(world, characterId, action, actionType) {
	const errors = [];
	
	if (!actionType.requirements?.conditions) {
		return errors;  // No condition requirements
	}
	
	for (const condition of actionType.requirements.conditions) {
		switch (condition) {
			case 'target_visible':
				// For now, assume all entities in same room are visible
				// This will be expanded in later phases
				break;
				
			case 'target_accessible':
				// For now, assume all visible entities are accessible
				// This will be expanded in later phases
				break;
				
			case 'target_searchable':
				// For now, rooms and items are searchable
				// This will be expanded in later phases
				break;
				
			case 'has_radio':
				// For now, assume all marines have radios
				// This will be expanded when equipment is implemented
				break;
				
			default:
				console.warn(`⚠️ Unknown condition: ${condition}`);
		}
	}
	
	return errors;
}

/**
 * Get environment data for a character's position
 * @param {object} world - The world object
 * @param {object} positionComponent - Position component data
 * @returns {object} Environment data
 */
function getEnvironmentForPosition(world, positionComponent) {
	if (!positionComponent?.roomId) {
		return { lighting: 'normal', hazards: [] };
	}
	
	const roomEntityId = getRoomEntityByRoomId(world, positionComponent.roomId);
	if (!roomEntityId) {
		return { lighting: 'normal', hazards: [] };
	}
	
	const environmentComponent = getComponent(world, roomEntityId, 'environment');
	return {
		lighting: environmentComponent?.lighting || 'normal',
		hazards: environmentComponent?.hazards || [],
		atmosphere: environmentComponent?.atmosphere || 'normal',
		temperature: environmentComponent?.temperature || 20
	};
}

/**
 * Quick validation check - just returns boolean
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} action - Action object
 * @returns {boolean} True if action is valid
 */
export function isActionValid(world, characterId, action) {
	const result = validateAction(world, characterId, action);
	return result.valid;
}

/**
 * Validate multiple actions at once
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object[]} actions - Array of action objects
 * @returns {ValidationResult[]} Array of validation results
 */
export function validateActions(world, characterId, actions) {
	if (!Array.isArray(actions)) {
		return [{ valid: false, errors: ['Actions must be an array'], warnings: [], actionData: null }];
	}
	
	return actions.map(action => validateAction(world, characterId, action));
}

/**
 * Get validation summary for debugging
 * @param {ValidationResult} result - Validation result
 * @returns {string} Human-readable summary
 */
export function getValidationSummary(result) {
	if (result.valid) {
		const warnings = result.warnings.length > 0 ? ` (${result.warnings.length} warnings)` : '';
		return `✅ Valid${warnings}`;
	} else {
		return `❌ Invalid: ${result.errors.join(', ')}`;
	}
}

/**
 * Debug function: Validate an action and log detailed results
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} action - Action object
 * @returns {ValidationResult} Validation result with debug logging
 */
export function debugValidateAction(world, characterId, action) {
	console.group(`🔍 Validating action: ${action.type}`);
	
	const result = validateAction(world, characterId, action);
	
	console.log('Character ID:', characterId);
	console.log('Action:', action);
	console.log('Result:', getValidationSummary(result));
	
	if (result.errors.length > 0) {
		console.log('Errors:', result.errors);
	}
	
	if (result.warnings.length > 0) {
		console.log('Warnings:', result.warnings);
	}
	
	if (result.actionData) {
		console.log('Processed Action Data:', result.actionData);
	}
	
	console.groupEnd();
	
	return result;
}
