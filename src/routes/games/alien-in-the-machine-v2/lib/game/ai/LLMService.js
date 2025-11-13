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
	model: 'openai/gpt-oss-120b:free',
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
	console.log('🤖 LLM Service called - Real API Mode');
	console.log('Prompt length:', prompt.length);
	console.log('Context character:', context.character?.name || 'Unknown');
	console.log('Available actions:', context.availableActions?.length || 0);
	
	try {
		// Use real API if in production/development with API key
		if (typeof window !== 'undefined' || process.env.NODE_ENV === 'test') {
			// In browser or test environment, fall back to mock for now
			console.log('⚠️ Using mock response in browser environment');
			return await getMockLLMResponse(prompt, context);
		}
		
		// Real API call for server-side execution
		const response = await callRealLLMAPI(prompt, context);
		return response;
		
	} catch (error) {
		console.error('🚨 LLM API call failed:', error);
		
		// Fallback to mock response on API failure
		console.log('⚠️ Falling back to mock response due to API error');
		return await getMockLLMResponse(prompt, context);
	}
}

/**
 * Call real LLM API (OpenRouter/OpenAI)
 * @param {string} prompt - AI prompt
 * @param {object} context - Decision context
 * @returns {Promise<object>} Real API response
 */
async function callRealLLMAPI(prompt, context) {
	const startTime = Date.now();
	
	// Get API key from environment
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey || apiKey === 'dummy_key_replace_with_real_key') {
		throw new Error('OpenRouter API key not configured');
	}
	
	// Format prompt for OpenRouter
	const requestBody = formatPromptForProvider('', prompt);
	
	// Add OpenRouter-specific headers
	const headers = {
		'Authorization': `Bearer ${apiKey}`,
		'HTTP-Referer': 'http://localhost:5173',
		'X-Title': 'Alien in the Machine v2',
		'Content-Type': 'application/json'
	};
	
	console.log('📡 Calling OpenRouter API...');
	const response = await fetch(LLM_CONFIG.endpoints.openrouter, {
		method: 'POST',
		headers,
		body: JSON.stringify(requestBody)
	});
	
	if (!response.ok) {
		throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
	}
	
	const result = await response.json();
	const responseTime = Date.now() - startTime;
	
	console.log('✅ OpenRouter API response received');
	
	if (!result.choices || result.choices.length === 0) {
		throw new Error('No response choices from OpenRouter API');
	}
	
	const responseContent = result.choices[0].message?.content || '';
	
	return {
		success: true,
		response: responseContent,
		provider: 'openrouter',
		model: LLM_CONFIG.model,
		tokensUsed: result.usage?.total_tokens || 0,
		responseTime,
		rawResult: result
	};
}

/**
 * Generate mock LLM response for testing and fallback
 * @param {string} prompt - AI prompt
 * @param {object} context - Decision context
 * @returns {Promise<object>} Mock response
 */
async function getMockLLMResponse(prompt, context) {
	// Simulate API delay
	await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
	
	// Generate smarter mock responses based on available actions
	const availableActions = context.availableActions || [];
	
	let selectedAction = null;
	let reasoning = '';
	let dialogue = '';
	
	if (availableActions.length > 0) {
		// Prefer movement actions in mock responses for variety
		const movementActions = availableActions.filter(a => a.type === 'MOVE');
		const examineActions = availableActions.filter(a => a.type === 'EXAMINE');
		const otherActions = availableActions.filter(a => !['MOVE', 'EXAMINE'].includes(a.type));
		
		// Smart selection based on action types available
		if (movementActions.length > 0 && Math.random() < 0.4) {
			selectedAction = movementActions[Math.floor(Math.random() * movementActions.length)];
			reasoning = `Moving to explore and maintain tactical positioning. ${selectedAction.name} seems like a good choice.`;
		} else if (examineActions.length > 0 && Math.random() < 0.3) {
			selectedAction = examineActions[Math.floor(Math.random() * examineActions.length)];
			reasoning = `Need to gather more information about the current situation. ${selectedAction.name} will help.`;
		} else if (otherActions.length > 0) {
			selectedAction = otherActions[Math.floor(Math.random() * otherActions.length)];
			reasoning = `Taking a tactical action: ${selectedAction.name}.`;
		} else {
			// Fallback to first available action
			selectedAction = availableActions[0];
			reasoning = `Taking the most obvious action available: ${selectedAction.name}.`;
		}
		
		dialogue = `${context.character?.name || 'Marine'}: ${generateMockDialogue(selectedAction, context)}`;
	} else {
		// No actions available - this shouldn't happen, but handle gracefully
		selectedAction = {
			type: 'WAIT',
			name: 'Wait',
			target: null
		};
		reasoning = 'No actions available, waiting for situation to change.';
		dialogue = `${context.character?.name || 'Marine'}: Standing by.`;
	}
	
	// Format response as structured JSON string for parsing
	const mockResponseJSON = JSON.stringify({
		action: selectedAction.type,
		target: selectedAction.target || null,
		reasoning: reasoning,
		dialogue: dialogue
	});
	
	return {
		success: true,
		response: mockResponseJSON,
		provider: 'mock',
		model: 'smart-mock-v2',
		tokensUsed: Math.floor(30 + Math.random() * 40),
		responseTime: Math.round(500 + Math.random() * 1000)
	};
}

/**
 * Generate contextual mock dialogue based on action and situation
 * @param {object} action - Selected action
 * @param {object} context - Decision context
 * @returns {string} Mock dialogue
 */
function generateMockDialogue(action, context) {
	const character = context.character;
	const room = context.environment?.currentRoom;
	
	const dialogues = {
		'MOVE': [
			`Moving to ${action.target || 'new position'}.`,
			`Heading out, stay sharp everyone.`,
			`On my way to secure the area.`,
			`Moving up, covering ground.`
		],
		'EXAMINE': [
			`Let me take a closer look at this.`,
			`Something here needs investigating.`,
			`Checking this out, might be important.`,
			`Visual inspection in progress.`
		],
		'SEARCH': [
			`Searching the area for useful intel.`,
			`Looking for anything we can use.`,
			`Thorough sweep in progress.`,
			`Checking every corner.`
		],
		'RADIO_QUICK': [
			`All units, maintain position.`,
			`Status report - all clear here.`,
			`Stay alert team, something feels off.`,
			`Checking in with the squad.`
		],
		'LISTEN': [
			`Hold position, listening for contacts.`,
			`Something's moving out there...`,
			`Quiet down, trying to hear movement.`,
			`Audio sweep, checking for hostiles.`
		],
		'WAIT': [
			`Holding position and staying ready.`,
			`Standing by for orders.`,
			`Maintaining overwatch.`,
			`Ready and waiting.`
		]
	};
	
	const actionDialogues = dialogues[action.type] || ['Taking action.'];
	return actionDialogues[Math.floor(Math.random() * actionDialogues.length)];
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
