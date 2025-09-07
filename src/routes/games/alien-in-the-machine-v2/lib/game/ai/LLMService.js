/**
 * LLMService.js - LLM API Integration (Stub)
 * 
 * This module will handle communication with LLM APIs (OpenRouter/OpenAI) for
 * AI character decision-making. For Phase 0, this is a working stub that
 * returns mock responses.
 * 
 * Core Philosophy:
 * - Clean API abstraction for different LLM providers
 * - Structured response format for reliable parsing
 * - Error handling and fallback strategies
 * - Model selection and configuration management
 */

/**
 * LLM service configuration
 */
const LLM_CONFIG = {
	provider: 'openrouter', // 'openrouter' | 'openai' | 'local'
	model: 'anthropic/claude-3-haiku',
	maxTokens: 150,
	temperature: 0.7,
	
	// API endpoints
	endpoints: {
		openrouter: 'https://openrouter.ai/api/v1/chat/completions',
		openai: 'https://api.openai.com/v1/chat/completions'
	}
};

/**
 * Call LLM API for character decision-making
 * @param {string} prompt - Formatted prompt for AI decision-making
 * @param {object} context - Decision context for additional information
 * @returns {Promise<object>} LLM response result
 */
export async function callLLM(prompt, context = {}) {
	console.log('🤖 LLM Service called (STUB MODE)');
	console.log('Prompt length:', prompt.length);
	console.log('Context character:', context.characterName || 'Unknown');
	
	// For Phase 0, return mock response
	// This will be replaced with actual API calls in Phase 2
	return await getMockLLMResponse(prompt, context);
}

/**
 * Generate mock LLM response for testing (Phase 0 stub)
 * @param {string} prompt - AI prompt
 * @param {object} context - Decision context
 * @returns {Promise<object>} Mock response
 */
async function getMockLLMResponse(prompt, context) {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
	
	// Mock response based on available actions in context
	const mockActions = ['MOVE', 'EXAMINE', 'SEARCH', 'WAIT', 'LISTEN'];
	const selectedAction = mockActions[Math.floor(Math.random() * mockActions.length)];
	
	const mockResponse = {
		action: selectedAction,
		target: selectedAction === 'MOVE' ? 'medical_bay' : null,
		reasoning: `This is a mock AI response for testing purposes. Selected ${selectedAction} action.`,
		dialogue: `${context.characterName || 'AI Marine'}: I'm making a tactical decision here.`
	};
	
	return {
		success: true,
		response: mockResponse,
		provider: 'mock',
		model: 'test-model',
		tokensUsed: 45,
		responseTime: Math.round(500 + Math.random() * 1000)
	};
}

/**
 * Parse and validate LLM response
 * @param {string} responseText - Raw response from LLM
 * @returns {object} Parsed and validated response
 */
export function parseLLMResponse(responseText) {
	try {
		const parsed = JSON.parse(responseText);
		
		// Validate required fields
		if (!parsed.action) {
			return {
				valid: false,
				error: 'Missing required field: action',
				originalResponse: responseText
			};
		}
		
		// Validate action type
		const validActions = ['MOVE', 'MOVE_CAREFUL', 'MOVE_QUICK', 'EXAMINE', 'EXAMINE_THOROUGH', 
							 'SEARCH', 'RADIO_QUICK', 'LISTEN', 'WAIT'];
		
		if (!validActions.includes(parsed.action)) {
			return {
				valid: false,
				error: `Invalid action type: ${parsed.action}`,
				originalResponse: responseText
			};
		}
		
		return {
			valid: true,
			action: {
				type: parsed.action,
				target: parsed.target || null,
				parameters: parsed.parameters || {},
				reasoning: parsed.reasoning || 'No reasoning provided',
				dialogue: parsed.dialogue || ''
			}
		};
		
	} catch (error) {
		return {
			valid: false,
			error: `JSON parsing error: ${error.message}`,
			originalResponse: responseText
		};
	}
}

/**
 * Configure LLM service settings
 * @param {object} config - Configuration overrides
 */
export function configureLLM(config) {
	Object.assign(LLM_CONFIG, config);
	console.log('🤖 LLM Service configured:', LLM_CONFIG);
}

/**
 * Test LLM service connection (for Phase 2 implementation)
 * @returns {Promise<object>} Connection test result
 */
export async function testLLMConnection() {
	console.log('🤖 Testing LLM connection (STUB MODE)');
	
	// For Phase 0, always return successful test
	return {
		success: true,
		provider: 'mock',
		model: 'test-model',
		message: 'Mock LLM service ready for testing'
	};
}

/**
 * Get current LLM configuration
 * @returns {object} Current configuration
 */
export function getLLMConfig() {
	return { ...LLM_CONFIG };
}

/**
 * Format prompt for specific LLM provider
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User/context prompt
 * @returns {object} Formatted prompt for API call
 */
export function formatPromptForProvider(systemPrompt, userPrompt) {
	// Different providers may require different prompt formats
	switch (LLM_CONFIG.provider) {
		case 'openrouter':
		case 'openai':
			return {
				messages: [
					{
						role: 'system',
						content: systemPrompt
					},
					{
						role: 'user', 
						content: userPrompt
					}
				],
				model: LLM_CONFIG.model,
				max_tokens: LLM_CONFIG.maxTokens,
				temperature: LLM_CONFIG.temperature
			};
			
		default:
			return {
				prompt: `${systemPrompt}\n\n${userPrompt}`,
				model: LLM_CONFIG.model,
				max_tokens: LLM_CONFIG.maxTokens,
				temperature: LLM_CONFIG.temperature
			};
	}
}

/**
 * Debug function: Simulate full AI decision cycle
 * @param {object} context - Decision context from ContextAssembler
 * @returns {Promise<object>} Complete AI decision result
 */
export async function debugAIDecision(context) {
	console.group('🤖 Debug AI Decision Cycle');
	
	// This will use PromptTemplates in Phase 2
	const mockPrompt = `You are ${context.character?.name || 'AI Marine'}. Make a decision.`;
	
	console.log('Character:', context.character?.name || 'Unknown');
	console.log('Available actions:', context.availableActions?.length || 0);
	
	const llmResult = await callLLM(mockPrompt, context);
	console.log('LLM result:', llmResult);
	
	if (llmResult.success) {
		const parsed = parseLLMResponse(JSON.stringify(llmResult.response));
		console.log('Parsed response:', parsed);
		
		console.groupEnd();
		return {
			success: true,
			decision: parsed.valid ? parsed.action : null,
			llmResult,
			parseResult: parsed
		};
	} else {
		console.groupEnd();
		return {
			success: false,
			error: 'LLM call failed',
			llmResult
		};
	}
}
