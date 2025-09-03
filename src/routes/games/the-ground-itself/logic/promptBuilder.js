// src/routes/games/the-ground-itself/logic/promptBuilder.js

// Configuration for easy testing and adaptation
const CONFIG = {
	maxPromptLength: 800, // Increased for better AI instruction following
	placeDescriptionLimit: 200, // Word limit for core place description
	recentNarrativeLimit: 300, // Space for recent user answers
	debugMode: true // Set to false in production
};

/**
 * Main prompt building function - uses phase-based approach
 * Preserves user voice while providing AI with game context
 */
export function buildImagePrompt(state, options = {}) {
	const sections = {
		gameContext: getGameContext(),
		placeFoundation: getPlaceFoundation(state),
		currentNarrative: getCurrentNarrative(state, options),
		styleInstructions: getStyleInstructions(state),
		timeContext: getTimeContext(state, options)
	};

	// Combine sections with smart length management
	let prompt = buildPromptFromSections(sections);
	
	// Debug output for testing
	if (CONFIG.debugMode && options.debug) {
		console.log('Prompt Sections:', sections);
		console.log('Final Prompt Length:', prompt.length);
	}

	// Always log the final prompt for debugging in development
	if (CONFIG.debugMode) {
		console.log('Generated Prompt:', prompt);
	}

	return prompt;
}

/**
 * Game context - explains the core rule about fixed location
 * This helps AI understand the constraint and create coherent images
 */
function getGameContext() {
	return `This is "The Ground Itself" - a storytelling game about a single place over time. IMPORTANT: Everything happens in this one location. The camera is anchored to this place and cannot move outside this frame or show events elsewhere.`;
}

/**
 * Core place description - always preserved, user's exact words
 * This is the foundation that should appear in every image
 */
function getPlaceFoundation(state) {
	if (!state.settingDescription) return '';
	
	// Keep user's exact words, just manage length
	let description = state.settingDescription.trim();
	
	// If too long, intelligently truncate while preserving meaning
	if (description.length > CONFIG.placeDescriptionLimit) {
		// Find last complete sentence within limit
		const truncated = description.substring(0, CONFIG.placeDescriptionLimit);
		const lastSentence = truncated.lastIndexOf('.');
		if (lastSentence > CONFIG.placeDescriptionLimit * 0.7) {
			description = truncated.substring(0, lastSentence + 1);
		} else {
			description = truncated + '...';
		}
	}
	
	return description;
}

/**
 * Current narrative - phase-specific content management
 * Prioritizes recent user input while maintaining context
 */
function getCurrentNarrative(state, options = {}) {
	const phase = state.currentPhase;
	const currentContext = options.currentContext || {};
	
	switch (phase) {
		case 'setup-place':
			return getFaceCardNarrative(state, currentContext);
		
		case 'mainPlay':
			return getMainGameplayNarrative(state, currentContext);
		
		case 'timeGap':
			return getTimeGapNarrative(state, currentContext);
		
		default:
			return getRecentAnswers(state, 2); // Fallback: last 2 answers
	}
}

/**
 * Face card phase - builds world iteratively
 * Each answer adds to the place without losing previous context
 */
function getFaceCardNarrative(state, context) {
	let narrative = '';
	
	// If we have a current question and answer, prioritize it
	if (context.currentQuestion && context.currentAnswer) {
		narrative += `Currently: ${context.currentQuestion} Answer: ${context.currentAnswer}. `;
	}
	
	// Add recent face card answers for context
	const recentFaceCardAnswers = getRecentFaceCardAnswers(state, 2);
	if (recentFaceCardAnswers.length > 0) {
		narrative += `Recent details: ${recentFaceCardAnswers.join(' ')} `;
	}
	
	return narrative;
}

/**
 * Main gameplay - focuses on recent narrative developments
 * Preserves user's latest input while maintaining place continuity
 */
function getMainGameplayNarrative(state, context) {
	let narrative = '';
	
	// Current question and answer get top priority
	if (context.currentQuestion && context.currentAnswer) {
		narrative += `Current event: ${context.currentQuestion} ${context.currentAnswer}. `;
	}
	
	// Add recent gameplay answers for continuity
	const recentAnswers = getRecentGameplayAnswers(state, 2);
	if (recentAnswers.length > 0) {
		narrative += `Recent developments: ${recentAnswers.join(' ')} `;
	}
	
	return narrative;
}

/**
 * Time gap phase - handles dramatic transitions
 * This is where images can change the most dramatically
 */
function getTimeGapNarrative(state, context) {
	let narrative = '';
	
	// Time gap gets special dramatic instructions
	if (context.timeGapInfo) {
		const { timeAmount, timeUnit, direction } = context.timeGapInfo;
		narrative += `DRAMATIC TIME TRANSITION: ${timeAmount} ${timeUnit} have passed `;
		narrative += direction === 'backward' ? 'into the past. ' : 'into the future. ';
		
		// Add the time gap questions if answered
		if (context.timeGapAnswers) {
			narrative += `Changes: ${context.timeGapAnswers.join(' ')} `;
		}
	}
	
	return narrative;
}

/**
 * Time context - provides temporal framing for the AI
 */
function getTimeContext(state, options = {}) {
	if (!state.timelineUnit) return '';
	
	const timeScales = {
		'days': 'immediate, present moment, detailed and intimate',
		'weeks': 'short-term changes, seasonal shifts, recent developments',
		'years': 'natural cycles, growth and wear, moderate changes',
		'decades': 'generational shifts, architectural changes, cultural evolution',
		'centuries': 'historical depth, ancient and new elements layered',
		'millennia': 'geological time, deep transformation, epic scope'
	};
	
	let context = `Time scale: ${timeScales[state.timelineUnit]}.`;
	
	// Add cycle information if available
	if (state.currentCycle && state.currentCycle > 1) {
		context += ` This is cycle ${state.currentCycle} of the story.`;
	}
	
	return context;
}

/**
 * Style instructions - simple, AI-friendly guidance
 */
function getStyleInstructions(state) {
	let instructions = '';
	
	if (state.imageStyle) {
		instructions += `Style: ${state.imageStyle}. `;
	}
	
	// Add quality and mood instructions
	instructions += 'High detail, atmospheric, immersive. Focus on the place itself rather than individual people.';
	
	return instructions;
}

/**
 * Smart prompt assembly with length management
 */
function buildPromptFromSections(sections) {
	// Priority order for length management
	const priorities = [
		{ key: 'gameContext', essential: true },
		{ key: 'placeFoundation', essential: true },
		{ key: 'currentNarrative', essential: false },
		{ key: 'timeContext', essential: false },
		{ key: 'styleInstructions', essential: true }
	];
	
	let prompt = '';
	let remainingLength = CONFIG.maxPromptLength;
	
	// First pass: add essential sections
	priorities.forEach(({ key, essential }) => {
		if (essential && sections[key]) {
			const section = sections[key] + ' ';
			if (section.length <= remainingLength) {
				prompt += section;
				remainingLength -= section.length;
			}
		}
	});
	
	// Second pass: add non-essential sections if space allows
	priorities.forEach(({ key, essential }) => {
		if (!essential && sections[key]) {
			const section = sections[key] + ' ';
			if (section.length <= remainingLength) {
				prompt += section;
				remainingLength -= section.length;
			}
		}
	});
	
	return prompt.trim();
}

/**
 * Helper functions for extracting recent answers
 */
function getRecentFaceCardAnswers(state, count = 2) {
	const faceCardKeys = Object.keys(state.answers).filter(key => key.startsWith('setup_'));
	return faceCardKeys
		.slice(-count)
		.map(key => state.answers[key])
		.filter(answer => answer && answer.trim());
}

function getRecentGameplayAnswers(state, count = 2) {
	const gameplayKeys = Object.keys(state.answers).filter(key => 
		key.startsWith('card_') || key.startsWith('focused_')
	);
	return gameplayKeys
		.slice(-count)
		.map(key => state.answers[key])
		.filter(answer => answer && answer.trim());
}

function getRecentAnswers(state, count = 2) {
	const allKeys = Object.keys(state.answers);
	return allKeys
		.slice(-count)
		.map(key => state.answers[key])
		.filter(answer => answer && answer.trim());
}

/**
 * Mock function for development - generates fake image URLs
 * Enhanced to show more of the prompt for better debugging
 */
export function generateMockImageUrl(prompt) {
	// In development, encode more of the prompt for debugging
	const encodedPrompt = encodeURIComponent(prompt.substring(0, 150));
	return `https://via.placeholder.com/800x600/4a5568/ffffff?text=${encodedPrompt}`;
}

/**
 * Utility function for manual prompt testing
 * Useful during development and testing phases
 */
export function testPromptBuilder(state, options = {}) {
	const prompt = buildImagePrompt(state, { ...options, debug: true });
	console.log('=== PROMPT BUILDER TEST ===');
	console.log('Final Prompt:', prompt);
	console.log('Length:', prompt.length);
	console.log('========================');
	return prompt;
}
