// src/routes/games/the-ground-itself/logic/promptBuilder.js

import { imageStyleOptions } from '../data.js';

/**
 * SIMPLE TEMPLATE-BASED PROMPT BUILDER
 * 
 * This system uses simple, predictable templates instead of complex logic.
 * Each game phase has its own template function that produces consistent,
 * testable prompts that match the game's specifications exactly.
 */

// Configuration for the new simple system
const CONFIG = {
	debugMode: true, // Set to false in production
	defaultStyle: 'atmospheric, digital painting, high detail'
};

/**
 * Main prompt building function - now uses simple template selection
 * @param {Object} state - Current game state
 * @param {Object} options - Context options from imageService
 * @returns {string} - Complete prompt ready for AI image generation
 */
export function buildImagePrompt(state, options = {}) {
	const location = state.settingDescription || 'a mysterious place';
	const style = getImageStyle(state);
	const currentContext = options.currentContext || {};
	
	let prompt = '';
	
	// Simple template selection based on game phase and context
	if (state.currentPhase === 'intro' || state.currentPhase === 'setup-timeline') {
		// Initial setup - just the place and style
		prompt = buildInitialSetupPrompt(location, style);
		
	} else if (state.currentPhase === 'setup-place') {
		// Face card setup phase - handle both single and multiple answers
		if (currentContext.multipleAnswers) {
			prompt = buildSetupPhasePromptMultiple(location, style, currentContext.multipleAnswers);
		} else {
			prompt = buildSetupPhasePrompt(
				location, 
				style, 
				currentContext.currentQuestion, 
				currentContext.currentAnswer
			);
		}
		
	} else if (state.currentPhase === 'mainPlay') {
		// Main gameplay
		prompt = buildMainGameplayPrompt(
			location, 
			style, 
			currentContext.currentQuestion, 
			currentContext.currentAnswer
		);
		
	} else if (state.currentPhase === 'timeGap' || currentContext.timeGapInfo) {
		// Time gap transitions
		const timeGapInfo = currentContext.timeGapInfo || {};
		const timeGapAnswers = currentContext.timeGapAnswers || [];
		prompt = buildTimeGapPrompt(
			location, 
			style, 
			timeGapInfo.timeAmount, 
			timeGapInfo.timeUnit, 
			timeGapInfo.direction, 
			timeGapAnswers
		);
		
	} else if (state.currentPhase === 'end') {
		// End game
		prompt = buildEndGamePrompt(
			location, 
			style, 
			currentContext.currentAnswer
		);
		
	} else {
		// Fallback to basic setup
		prompt = buildInitialSetupPrompt(location, style);
	}
	
	// Debug output for testing
	if (CONFIG.debugMode) {
		console.log('=== PROMPT BUILDER DEBUG ===');
		console.log('Phase:', state.currentPhase);
		console.log('Location:', location);
		console.log('Style:', style);
		console.log('Context:', currentContext);
		console.log('Generated Prompt:', prompt);
		console.log('Prompt Length:', prompt.length);
		console.log('============================');
	}
	
	return prompt;
}

/**
 * Template 1: Initial Setup
 * Used when first establishing the place with just a stock image
 */
function buildInitialSetupPrompt(location, style) {
	return `This is "The Ground Itself" a storytelling game about a single place over time. Your job is to make these stories come to life by creating the images to these stories visual just provide images no text responses just images. IMPORTANT: Everything happens in this one location. The camera is anchored to this place and cannot move outside this frame or show events elsewhere. \n\n

Bring this location to life: ${location}. This image should just be in this style: ${style}.\n\n`;
}

/**
 * Template 2: Setup Phase (Face Cards)
 * Used during the world-building phase with face card questions
 */
function buildSetupPhasePrompt(location, style, question, answer) {
	const questionText = question || 'establishing this place';
	const answerText = answer || 'building the world';
	
	return `This is "The Ground Itself" a storytelling game about a single place over time. IMPORTANT: Everything happens in this one location. The camera is anchored to this place and cannot move outside this frame or show events elsewhere. \n\n

The location is ${location}. This image should just be in this style: ${style}. \n\n

The player is establishing this place. Take this image and modify it while keeping the location consistent according to the question and answer \n\n

Question: ${questionText} \n
Answer: ${answerText}`;
}

/**
 * Template 2b: Setup Phase with Multiple Answers
 * Used when generating images every 3 answered questions during setup
 */
function buildSetupPhasePromptMultiple(location, style, questionAnswerPairs) {
	let prompt = `This is "The Ground Itself" a storytelling game about a single place over time. IMPORTANT: Everything happens in this one location. The camera is anchored to this place and cannot move outside this frame or show events elsewhere. \n\n

The location is ${location}. This image should just be in this style: ${style}. \n\n

The player is establishing this place. Take this image and modify it while keeping the location consistent according to these recent developments: \n\n

`;
	
	// Add each question/answer pair
	questionAnswerPairs.forEach((qa, index) => {
		if (qa && qa.question && qa.answer) {
			prompt += `${index + 1}. Question: ${qa.question}\n   Answer: ${qa.answer}\n\n`;
		}
	});
	
	prompt += `\n\n Incorporate all these elements into the evolving image of this place.`;
	
	return prompt;
}

/**
 * Template 3: Main Gameplay
 * Used during the main game with numerical card questions
 */
function buildMainGameplayPrompt(location, style, question, answer) {
	const questionText = question || 'continuing the story';
	const answerText = answer || 'the story continues';
	
	return `This is "The Ground Itself" a storytelling game about a single place over time. IMPORTANT: Everything happens in this one location. The camera is anchored to this place and cannot move outside this frame or show events elsewhere. \n\n

The location is ${location}. This image should just be in this style: ${style}. \n\n

The story continues in this place. Take this image and modify it while keeping the location consistent according to the question and  \n\n

Question: ${questionText} \n
Answer: ${answerText}`;
}

/**
 * Template 4: Time Gap Transitions
 * Used when "10" cards trigger time jumps with dramatic changes
 */
function buildTimeGapPrompt(location, style, timeAmount, timeUnit, direction, changes) {
	const amount = timeAmount || 'some';
	const unit = timeUnit || 'time';
	const dir = direction || 'forward';
	
	let prompt = `This is "The Ground Itself" a storytelling game about a single place over time. IMPORTANT: Everything happens in this one location. The camera is anchored to this place and cannot move outside this frame or show events elsewhere. \n\n

The location is ${location}. This image should just be in this style: ${style}. \n\n

This location has just gone through a time gap. Time has moved ${dir} ${amount} ${unit}`;
	
	// Add all 3 time gap question/answers if provided
	if (changes && changes.length > 0) {
		prompt += `

The players have described the changes as such: \n`;
		
		changes.forEach((change, index) => {
			if (change && change.trim()) {
				prompt += `\n${change}`;
			}
		});
	}
	
	prompt += `

\n\n Remember to keep the camera on the same location from the previous image, it can change drastically or very little but the "camera" is anchored.`;
	
	return prompt;
}

/**
 * Template 5: End Game
 * Used for the final "what happens tomorrow" conclusion
 */
function buildEndGamePrompt(location, style, finalAnswer) {
	const answer = finalAnswer || 'the story concludes';
	
	return `This is "The Ground Itself" a storytelling game about a single place over time. IMPORTANT: Everything happens in this one location. The camera is anchored to this place and cannot move outside this frame or show events elsewhere. \n\n

The location is ${location}. This image should just be in this style: ${style}. \n\n

This is the final image of our place. The story concludes with this vision of tomorrow: \n

${answer}
\n\n
Show the ultimate state of this place, keeping the camera anchored to the same location we've been following throughout the entire story.`;
}

/**
 * Enhanced style system - user input with random defaults
 * @param {Object} state - Game state containing style preferences
 * @returns {string} - Style description for the prompt
 */
function getImageStyle(state) {
	// If user has specified a custom style, use it
	if (state.customImageStyle && state.customImageStyle.trim()) {
		return state.customImageStyle.trim();
	}
	
	// If user selected from predefined options, use that
	if (state.imageStyle && state.imageStyle.trim()) {
		return state.imageStyle.trim();
	}
	
	// Otherwise, randomly select from available options
	if (imageStyleOptions && imageStyleOptions.length > 0) {
		const randomIndex = Math.floor(Math.random() * imageStyleOptions.length);
		return imageStyleOptions[randomIndex];
	}
	
	// Final fallback
	return CONFIG.defaultStyle;
}

/**
 * Mock function for development - generates fake image URLs
 * Shows more of the prompt for better debugging
 */
export function generateMockImageUrl(prompt) {
	// Encode first 150 characters for debugging
	const encodedPrompt = encodeURIComponent(prompt.substring(0, 150));
	return `https://via.placeholder.com/800x600/4a5568/ffffff?text=${encodedPrompt}`;
}

/**
 * Enhanced testing function - shows all templates with sample data
 * Perfect for copying prompts to test in AI image playgrounds
 */
export function testAllTemplates() {
	console.log('=== TEMPLATE TESTING SUITE ===');
	
	const sampleLocation = 'an ancient library built into the roots of a massive oak tree';
	const sampleStyle = 'atmospheric, digital painting, high detail';
	const sampleQuestion = 'What stories are told in or about this place?';
	const sampleAnswer = 'The library holds ancient tales of the Tree Keepers who first planted this oak centuries ago.';
	
	console.log('\n1. INITIAL SETUP TEMPLATE:');
	console.log(buildInitialSetupPrompt(sampleLocation, sampleStyle));
	
	console.log('\n2. SETUP PHASE TEMPLATE:');
	console.log(buildSetupPhasePrompt(sampleLocation, sampleStyle, sampleQuestion, sampleAnswer));
	
	console.log('\n3. MAIN GAMEPLAY TEMPLATE:');
	console.log(buildMainGameplayPrompt(sampleLocation, sampleStyle, 'What are the plants like?', 'Moss covers the ancient bark, glowing softly in the dim light.'));
	
	console.log('\n4. TIME GAP TEMPLATE:');
	console.log(buildTimeGapPrompt(sampleLocation, sampleStyle, 5, 'centuries', 'forward', [
		'The library is now ruins, but new trees have grown',
		'The books have turned to dust, but their knowledge lives in the wind',
		'Visitors still come seeking wisdom from the ancient place'
	]));
	
	console.log('\n5. END GAME TEMPLATE:');
	console.log(buildEndGamePrompt(sampleLocation, sampleStyle, 'Tomorrow, the first new seedling will sprout from the old oak\'s roots, beginning the cycle anew.'));
	
	console.log('\n===============================');
	
	return 'All templates tested - check console for output';
}

/**
 * Simple prompt testing function for individual templates
 * @param {string} templateName - Which template to test
 * @param {Object} params - Parameters for the template
 */
export function testSingleTemplate(templateName, params = {}) {
	const defaults = {
		location: 'a mysterious place',
		style: 'atmospheric, digital painting, high detail',
		question: 'What is this place like?',
		answer: 'It is full of wonder and mystery.'
	};
	
	const p = { ...defaults, ...params };
	
	let result = '';
	
	switch (templateName) {
		case 'initial':
			result = buildInitialSetupPrompt(p.location, p.style);
			break;
		case 'setup':
			result = buildSetupPhasePrompt(p.location, p.style, p.question, p.answer);
			break;
		case 'gameplay':
			result = buildMainGameplayPrompt(p.location, p.style, p.question, p.answer);
			break;
		case 'timegap':
			result = buildTimeGapPrompt(p.location, p.style, p.timeAmount, p.timeUnit, p.direction, p.changes);
			break;
		case 'endgame':
			result = buildEndGamePrompt(p.location, p.style, p.answer);
			break;
		default:
			result = 'Unknown template. Use: initial, setup, gameplay, timegap, endgame';
	}
	
	console.log(`=== ${templateName.toUpperCase()} TEMPLATE TEST ===`);
	console.log(result);
	console.log(`Length: ${result.length} characters`);
	console.log('=====================================');
	
	return result;
}

/**
 * Future enhancement hook - LLM summarization support
 * This will be used to create condensed narrative context
 */
export function getSummarizedContext(state) {
	// TODO: Implement LLM summarization
	// - Summarize setup phase answers into 1 sentence
	// - Summarize each cycle into brief narrative
	// - Return condensed context for prompt inclusion
	
	// For now, return empty string
	return '';
}
