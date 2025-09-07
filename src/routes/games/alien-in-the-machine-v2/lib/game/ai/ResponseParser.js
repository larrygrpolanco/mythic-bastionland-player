/**
 * ResponseParser.js - LLM Response Processing
 * 
 * This module processes and validates LLM responses, extracting structured
 * action data for execution through the game systems.
 * 
 * Core Philosophy:
 * - Robust parsing with fallback strategies
 * - Clear error reporting for debugging
 * - Validation before action execution
 * - Consistent response format normalization
 * - Integration with unified decision pipeline
 */

import { parseLLMResponse } from './LLMService.js';
import { validateAction } from '../actions/ActionValidator.js';

/**
 * Parse and validate LLM response for action execution
 * @param {string|object} rawResponse - Raw response from LLM API result
 * @param {object} context - Original decision context
 * @param {object} world - World state for validation
 * @returns {object} Parsed response result
 */
export function parseResponse(rawResponse, context = {}, world = null) {
	console.log('🔧 Parsing LLM response - Enhanced Mode');
	console.log('Response type:', typeof rawResponse);
	console.log('Context character:', context.character?.name || 'Unknown');
	
	try {
		// Extract response text from different API result formats
		let responseText = extractResponseText(rawResponse);
		
		if (!responseText) {
			console.error('❌ No valid response text found');
			return createFailureResult('No valid response text found', context, rawResponse);
		}
		
		// Parse JSON response using LLMService parser
		const parseResult = parseLLMResponse(responseText);
		
		if (!parseResult.valid) {
			console.error('❌ JSON parsing failed:', parseResult.error);
			return createFailureResult(parseResult.error, context, rawResponse, parseResult);
		}
		
		// Validate action against context and world state
		const validationResult = validateResponseAction(parseResult.action, context, world);
		
		if (!validationResult.valid) {
			console.error('❌ Action validation failed:', validationResult.error);
			return createFailureResult(validationResult.error, context, rawResponse, parseResult);
		}
		
		// Extract communication data for logging
		const communication = extractCommunication({ action: parseResult.action });
		
		console.log('✅ Response parsed successfully');
		console.log('Action:', parseResult.action.type);
		console.log('Target:', parseResult.action.target);
		console.log('Has dialogue:', communication.hasDialogue);
		
		return {
			success: true,
			action: parseResult.action,
			communication,
			metadata: {
				characterId: context.characterId || context.character?.entityId,
				originalResponse: rawResponse,
				parseTime: Date.now(),
				provider: rawResponse?.provider || 'unknown',
				tokensUsed: rawResponse?.tokensUsed || 0,
				responseTime: rawResponse?.responseTime || 0
			}
		};
		
	} catch (error) {
		console.error('❌ Unexpected error in parseResponse:', error);
		return createFailureResult(`Unexpected parsing error: ${error.message}`, context, rawResponse);
	}
}

/**
 * Extract response text from different API result formats
 * @param {string|object} rawResponse - Raw response from LLM API
 * @returns {string|null} Extracted response text
 */
function extractResponseText(rawResponse) {
	// Handle string responses (direct JSON)
	if (typeof rawResponse === 'string') {
		return rawResponse;
	}
	
	// Handle LLM service result format
	if (rawResponse?.success && rawResponse.response) {
		// If response is already a string (mock format), use it
		if (typeof rawResponse.response === 'string') {
			return rawResponse.response;
		}
		
		// If response is an object (structured format), stringify it
		if (typeof rawResponse.response === 'object') {
			return JSON.stringify(rawResponse.response);
		}
	}
	
	// Handle OpenRouter/OpenAI API format
	if (rawResponse?.choices && rawResponse.choices.length > 0) {
		const choice = rawResponse.choices[0];
		if (choice.message && choice.message.content) {
			return choice.message.content;
		}
	}
	
	// Handle direct object format
	if (rawResponse && typeof rawResponse === 'object' && rawResponse.action) {
		return JSON.stringify(rawResponse);
	}
	
	return null;
}

/**
 * Create standardized failure result with fallback action
 * @param {string} error - Error message
 * @param {object} context - Decision context
 * @param {object} rawResponse - Original response
 * @param {object} parseResult - Parse result if available
 * @returns {object} Failure result with fallback
 */
function createFailureResult(error, context, rawResponse, parseResult = null) {
	const fallback = generateFallbackAction(context);
	
	return {
		success: false,
		error,
		action: fallback, // Always provide a valid fallback action
		communication: {
			reasoning: `AI response parsing failed: ${error}`,
			dialogue: fallback.dialogue,
			hasReasoning: true,
			hasDialogue: true
		},
		usedFallback: true,
		metadata: {
			characterId: context.characterId || context.character?.entityId,
			originalResponse: rawResponse,
			parseError: error,
			parseResult: parseResult,
			parseTime: Date.now()
		}
	};
}

/**
 * Generate fallback action when parsing fails
 * @param {object} context - Decision context
 * @returns {object} Safe fallback action
 */
function generateFallbackAction(context) {
	console.log('⚠️ Using fallback action due to parse failure');
	
	const characterName = context.character?.name || 'Marine';
	
	// Try to use the first available action if possible
	if (context.availableActions && context.availableActions.length > 0) {
		const firstAction = context.availableActions[0];
		console.log(`📋 Using first available action: ${firstAction.type}`);
		
		return {
			type: firstAction.type,
			target: firstAction.target || null,
			parameters: {},
			reasoning: `AI response parsing failed, using first available action: ${firstAction.name}`,
			dialogue: `${characterName}: Something went wrong with my decision process, taking basic action.`
		};
	}
	
	// Ultimate fallback: WAIT action (should always be available)
	console.log('🛑 Using ultimate fallback: WAIT');
	return {
		type: 'WAIT',
		target: null,
		parameters: {},
		reasoning: 'Fallback action due to AI response parse failure',
		dialogue: `${characterName}: I need a moment to reassess the situation.`
	};
}

/**
 * Validate action against available actions in context and world state
 * @param {object} action - Parsed action
 * @param {object} context - Original decision context
 * @param {object} world - World state for additional validation
 * @returns {object} Validation result
 */
export function validateResponseAction(action, context, world = null) {
	console.log(`🔍 Validating action: ${action.type}`);
	
	// Basic structure validation
	if (!action || !action.type) {
		return {
			valid: false,
			error: 'Action is missing or has no type'
		};
	}
	
	// Check if we have available actions in context
	if (!context.availableActions || !Array.isArray(context.availableActions)) {
		console.warn('⚠️ No available actions in context for validation');
		// If no context actions, allow basic validation through ActionValidator
		if (world && context.character?.entityId) {
			try {
				const basicAction = {
					type: action.type,
					target: action.target,
					characterId: context.character.entityId
				};
				
				const worldValidation = validateAction(world, context.character.entityId, basicAction);
				return {
					valid: worldValidation.valid,
					error: worldValidation.error || 'Action failed world validation',
					action: worldValidation.valid ? action : null
				};
			} catch (error) {
				return {
					valid: false,
					error: `World validation failed: ${error.message}`
				};
			}
		}
		
		// If no world validation possible, be permissive for basic actions
		const basicActions = ['WAIT', 'LISTEN', 'RADIO_QUICK'];
		if (basicActions.includes(action.type)) {
			return { valid: true, action };
		}
		
		return {
			valid: false,
			error: 'No available actions context and cannot validate against world'
		};
	}
	
	// Check if action type is in available actions
	const availableAction = context.availableActions.find(a => a.type === action.type);
	if (!availableAction) {
		const availableTypes = context.availableActions.map(a => a.type);
		return {
			valid: false,
			error: `Action type ${action.type} not available. Available: ${availableTypes.join(', ')}`
		};
	}
	
	// Target validation for actions that require specific targets
	if (availableAction.target && action.target !== availableAction.target) {
		return {
			valid: false,
			error: `Action target ${action.target} does not match available target ${availableAction.target}`
		};
	}
	
	// Additional validation for movement actions
	if (action.type === 'MOVE' || action.type === 'MOVE_CAREFUL' || action.type === 'MOVE_QUICK') {
		if (!action.target) {
			return {
				valid: false,
				error: 'Movement action requires a target room'
			};
		}
		
		// Check if target room is in available movement options
		const moveActions = context.availableActions.filter(a => a.type.startsWith('MOVE'));
		const validTargets = moveActions.map(a => a.target).filter(t => t);
		
		if (validTargets.length > 0 && !validTargets.includes(action.target)) {
			return {
				valid: false,
				error: `Target room ${action.target} not accessible. Available: ${validTargets.join(', ')}`
			};
		}
	}
	
	// Additional validation for examine actions
	if (action.type === 'EXAMINE' || action.type === 'EXAMINE_THOROUGH') {
		const examineActions = context.availableActions.filter(a => a.type.startsWith('EXAMINE'));
		if (examineActions.length > 0 && action.target) {
			const validTargets = examineActions.map(a => a.target).filter(t => t);
			if (validTargets.length > 0 && !validTargets.includes(action.target)) {
				return {
					valid: false,
					error: `Examine target ${action.target} not available. Available: ${validTargets.join(', ')}`
				};
			}
		}
	}
	
	console.log('✅ Action validation passed');
	return {
		valid: true,
		action
	};
}

/**
 * Extract dialogue/reasoning from response for logging and UI
 * @param {object} parsedResponse - Parsed response
 * @returns {object} Extracted communication data
 */
export function extractCommunication(parsedResponse) {
	const action = parsedResponse.action || {};
	const reasoning = action.reasoning || '';
	const dialogue = action.dialogue || '';
	
	return {
		reasoning,
		dialogue,
		hasReasoning: Boolean(reasoning.trim()),
		hasDialogue: Boolean(dialogue.trim()),
		
		// Additional metadata for UI display
		characterName: extractCharacterNameFromDialogue(dialogue),
		reasoningLength: reasoning.length,
		dialogueLength: dialogue.length
	};
}

/**
 * Extract character name from dialogue text
 * @param {string} dialogue - Dialogue text
 * @returns {string|null} Character name if found
 */
function extractCharacterNameFromDialogue(dialogue) {
	if (!dialogue || typeof dialogue !== 'string') {
		return null;
	}
	
	// Look for pattern "Name: dialogue text"
	const match = dialogue.match(/^([^:]+):\s*/);
	if (match) {
		return match[1].trim();
	}
	
	return null;
}

/**
 * Sanitize and format dialogue for display
 * @param {string} dialogue - Raw dialogue text
 * @param {string} fallbackName - Character name to use if not found in dialogue
 * @returns {string} Formatted dialogue
 */
export function formatDialogueForDisplay(dialogue, fallbackName = 'Marine') {
	if (!dialogue || typeof dialogue !== 'string') {
		return '';
	}
	
	const trimmed = dialogue.trim();
	if (!trimmed) {
		return '';
	}
	
	// If dialogue already has character name, use as-is
	if (trimmed.includes(':')) {
		return trimmed;
	}
	
	// Otherwise, add fallback character name
	return `${fallbackName}: ${trimmed}`;
}

/**
 * Debug function: Full response processing with detailed logging
 * @param {string|object} rawResponse - Raw LLM response
 * @param {object} context - Decision context
 * @returns {object} Detailed processing result
 */
export function debugParseResponse(rawResponse, context) {
	console.group('🔧 Debug Response Processing');
	
	const result = parseResponse(rawResponse, context);
	
	console.log('Raw response:', rawResponse);
	console.log('Parse result:', result);
	
	if (result.success) {
		const validation = validateResponseAction(result.action, context);
		console.log('Action validation:', validation);
		
		const communication = extractCommunication(result);
		console.log('Communication data:', communication);
	}
	
	console.groupEnd();
	
	return result;
}
