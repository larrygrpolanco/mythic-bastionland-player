/**
 * ResponseParser.js - LLM Response Processing (Stub)
 * 
 * This module processes and validates LLM responses, extracting structured
 * action data for execution through the game systems.
 * 
 * Core Philosophy:
 * - Robust parsing with fallback strategies
 * - Clear error reporting for debugging
 * - Validation before action execution
 * - Consistent response format normalization
 */

import { parseLLMResponse } from './LLMService.js';

/**
 * Parse and validate LLM response for action execution
 * @param {string|object} rawResponse - Raw response from LLM
 * @param {object} context - Original decision context
 * @returns {object} Parsed response result
 */
export function parseResponse(rawResponse, context = {}) {
	console.log('🔧 Parsing LLM response (STUB MODE)');
	
	// Handle different response formats
	let responseText;
	if (typeof rawResponse === 'string') {
		responseText = rawResponse;
	} else if (rawResponse?.response) {
		responseText = JSON.stringify(rawResponse.response);
	} else {
		responseText = JSON.stringify(rawResponse);
	}
	
	// Use LLMService parser
	const parseResult = parseLLMResponse(responseText);
	
	if (parseResult.valid) {
		return {
			success: true,
			action: parseResult.action,
			metadata: {
				characterId: context.characterId,
				originalResponse: rawResponse,
				parseTime: Date.now()
			}
		};
	} else {
		return {
			success: false,
			error: parseResult.error,
			fallback: generateFallbackAction(context),
			metadata: {
				characterId: context.characterId,
				originalResponse: rawResponse,
				parseError: parseResult.error
			}
		};
	}
}

/**
 * Generate fallback action when parsing fails
 * @param {object} context - Decision context
 * @returns {object} Safe fallback action
 */
function generateFallbackAction(context) {
	console.log('⚠️ Using fallback action due to parse failure');
	
	// Safe fallback: WAIT action (always available, low cost)
	return {
		type: 'WAIT',
		target: null,
		parameters: {},
		reasoning: 'Fallback action due to AI response parse failure',
		dialogue: `${context.character?.name || 'Marine'}: I need a moment to think.`
	};
}

/**
 * Validate action against available actions in context
 * @param {object} action - Parsed action
 * @param {object} context - Original decision context
 * @returns {object} Validation result
 */
export function validateResponseAction(action, context) {
	if (!context.availableActions || !Array.isArray(context.availableActions)) {
		return {
			valid: false,
			error: 'No available actions in context'
		};
	}
	
	// Check if action type is available
	const availableTypes = context.availableActions.map(a => a.type);
	if (!availableTypes.includes(action.type)) {
		return {
			valid: false,
			error: `Action type ${action.type} not available. Available: ${availableTypes.join(', ')}`
		};
	}
	
	// TODO: In Phase 2, add more specific validation:
	// - Target validation against available targets
	// - Parameter validation
	// - Prerequisite checking
	
	return {
		valid: true,
		action
	};
}

/**
 * Extract dialogue/reasoning from response for logging
 * @param {object} parsedResponse - Parsed response
 * @returns {object} Extracted communication data
 */
export function extractCommunication(parsedResponse) {
	return {
		reasoning: parsedResponse.action?.reasoning || '',
		dialogue: parsedResponse.action?.dialogue || '',
		hasReasoning: Boolean(parsedResponse.action?.reasoning),
		hasDialogue: Boolean(parsedResponse.action?.dialogue)
	};
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
