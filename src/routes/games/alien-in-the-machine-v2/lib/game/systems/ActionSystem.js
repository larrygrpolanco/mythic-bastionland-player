/**
 * ActionSystem.js - Action Execution Coordinator
 * 
 * This system coordinates the execution of all validated actions by delegating
 * to specialized systems and managing the turn system integration. It is the
 * single entry point for all action execution.
 * 
 * Core Philosophy:
 * - Single coordination point for all action execution
 * - Delegates to specialized systems for actual logic
 * - Integrates with turn system for tick costs
 * - Same execution path for human and AI actions
 */

import { validateAction } from '../actions/ActionValidator.js';
import { executeAction as applyActionCost } from '../TurnManager.js';
import { executeMove } from './MovementSystem.js';
import { executeExamine, executeSearch } from './InteractionSystem.js';
import { 
	updateMissionStatus, 
	trackCommunication, 
	trackSearch, 
	trackExamination 
} from './MissionSystem.js';

/**
 * Execute a validated action through the appropriate system
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} action - Action object { type, target?, parameters? }
 * @returns {object} Execution result with success/failure and details
 */
export function executeAction(world, characterId, action) {
	console.log(`⚡ Executing action: ${action.type} for character ${characterId}`);
	
	// Validate action before execution
	const validation = validateAction(world, characterId, action);
	if (!validation.valid) {
		console.error('❌ Action validation failed:', validation.errors);
		return {
			success: false,
			errors: validation.errors,
			warnings: validation.warnings,
			type: 'validation_error'
		};
	}
	
	const { actionData } = validation;
	let executionResult;
	
	try {
		// Delegate to appropriate system based on action type
		switch (actionData.type) {
			case 'MOVE':
			case 'MOVE_CAREFUL':
			case 'MOVE_QUICK':
				executionResult = executeMove(world, characterId, actionData);
				break;
				
			case 'EXAMINE':
			case 'EXAMINE_THOROUGH':
				executionResult = executeExamine(world, characterId, actionData);
				break;
				
			case 'SEARCH':
			case 'SEARCH_THOROUGH':
				executionResult = executeSearch(world, characterId, actionData);
				break;
				
			case 'RADIO_QUICK':
			case 'RADIO_DETAILED':
			case 'LISTEN':
				executionResult = executeCommunication(world, characterId, actionData);
				break;
				
			case 'WAIT':
				executionResult = executeWait(world, characterId, actionData);
				break;
				
			default:
				console.error(`❌ Unknown action type: ${actionData.type}`);
				return {
					success: false,
					errors: [`Unknown action type: ${actionData.type}`],
					warnings: [],
					type: 'unknown_action'
				};
		}
		
		// If system execution succeeded, apply tick cost through turn manager
		if (executionResult.success) {
			const turnResult = applyActionCost(world, characterId, actionData.cost);
			
			if (!turnResult.success) {
				console.error('❌ Turn system failed to apply action cost:', turnResult.error);
				return {
					success: false,
					errors: [`Turn system error: ${turnResult.error}`],
					warnings: validation.warnings,
					type: 'turn_system_error'
				};
			}
			
			// Track action for mission objectives
			trackActionForMission(world, characterId, actionData, executionResult);
			
			// Update mission status after successful action
			const missionUpdate = updateMissionStatus(world);
			
			// Combine results
			return {
				success: true,
				actionResult: executionResult,
				turnResult,
				missionUpdate,
				actionData,
				warnings: validation.warnings,
				type: 'success'
			};
		} else {
			// System execution failed
			return {
				success: false,
				errors: executionResult.errors || ['Action execution failed'],
				warnings: validation.warnings,
				actionResult: executionResult,
				type: 'execution_error'
			};
		}
		
	} catch (error) {
		console.error('❌ Action execution threw exception:', error);
		return {
			success: false,
			errors: [`Action execution error: ${error.message}`],
			warnings: validation.warnings,
			type: 'exception_error'
		};
	}
}

/**
 * Track action for mission objectives
 * @param {object} world - The world object
 * @param {number} characterId - Character who performed action
 * @param {object} actionData - Action data
 * @param {object} executionResult - Result from action execution
 */
function trackActionForMission(world, characterId, actionData, executionResult) {
	try {
		switch (actionData.type) {
			case 'SEARCH':
			case 'SEARCH_THOROUGH':
				if (actionData.target) {
					trackSearch(world, characterId, actionData.target);
				}
				break;
				
			case 'EXAMINE':
			case 'EXAMINE_THOROUGH':
				if (actionData.target) {
					trackExamination(world, characterId, actionData.target);
				}
				break;
				
			case 'RADIO_QUICK':
			case 'RADIO_DETAILED':
				trackCommunication(world, characterId, executionResult.message || 'Communication');
				break;
				
			// Other action types don't need specific tracking
			default:
				// No specific mission tracking needed
				break;
		}
	} catch (error) {
		console.warn('⚠️ Mission tracking failed:', error.message);
		// Don't fail the action if mission tracking fails
	}
}

/**
 * Execute communication actions (radio, listen)
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} actionData - Validated action data
 * @returns {object} Execution result
 */
function executeCommunication(world, characterId, actionData) {
	// For now, communication actions just succeed and add to log
	// In future phases, this will integrate with actual communication systems
	
	const character = world.components.isMarine[characterId];
	let message = '';
	
	switch (actionData.type) {
		case 'RADIO_QUICK':
			message = `${character.name} sends a quick radio message.`;
			break;
		case 'RADIO_DETAILED':
			message = `${character.name} sends a detailed radio communication.`;
			break;
		case 'LISTEN':
			message = `${character.name} listens carefully to the surroundings.`;
			break;
	}
	
	// TODO: Add to communication log when that system is implemented
	console.log(`📻 Communication: ${message}`);
	
	return {
		success: true,
		message,
		actionType: actionData.type,
		characterName: character.name
	};
}

/**
 * Execute wait action
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} actionData - Validated action data
 * @returns {object} Execution result
 */
function executeWait(world, characterId, actionData) {
	const character = world.components.isMarine[characterId];
	const message = `${character.name} waits and observes.`;
	
	console.log(`⏸️ Wait: ${message}`);
	
	// Wait action always succeeds and just passes time
	return {
		success: true,
		message,
		actionType: 'WAIT',
		characterName: character.name
	};
}

/**
 * Get action execution summary for logging/debugging
 * @param {object} result - Action execution result
 * @returns {string} Human-readable summary
 */
export function getActionExecutionSummary(result) {
	if (!result) {
		return '❓ No action result';
	}
	
	if (result.success) {
		const actionName = result.actionData?.actionType?.name || result.actionData?.type || 'Unknown';
		const characterName = result.actionData?.character?.name || 'Unknown';
		const cost = result.actionData?.cost || 0;
		
		return `✅ ${characterName} successfully performed ${actionName} (${cost} ticks)`;
	} else {
		const errorSummary = result.errors?.join('; ') || 'Unknown error';
		return `❌ Action failed: ${errorSummary}`;
	}
}

/**
 * Execute multiple actions in sequence (for future batch processing)
 * @param {object} world - The world object
 * @param {object[]} actionQueue - Array of { characterId, action } objects
 * @returns {object[]} Array of execution results
 */
export function executeActionQueue(world, actionQueue) {
	const results = [];
	
	for (const { characterId, action } of actionQueue) {
		const result = executeAction(world, characterId, action);
		results.push(result);
		
		// If any action fails, we could choose to stop or continue
		// For now, continue processing all actions
		if (!result.success) {
			console.warn(`⚠️ Action failed in queue: ${getActionExecutionSummary(result)}`);
		}
	}
	
	return results;
}

/**
 * Debug function: Test action execution with detailed logging
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} action - Action object
 * @returns {object} Detailed execution result
 */
export function debugExecuteAction(world, characterId, action) {
	console.group(`🔍 Debug action execution: ${action.type}`);
	
	const result = executeAction(world, characterId, action);
	
	console.log('Action:', action);
	console.log('Result:', getActionExecutionSummary(result));
	console.log('Full result:', result);
	
	console.groupEnd();
	
	return result;
}
