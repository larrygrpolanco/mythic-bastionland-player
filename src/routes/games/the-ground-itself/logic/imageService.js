// src/routes/games/the-ground-itself/logic/imageService.js

/**
 * CENTRALIZED IMAGE GENERATION SERVICE
 * 
 * This service handles ALL image generation for the game.
 * DO NOT duplicate this logic in components - always use this service.
 * 
 * Why this exists:
 * - Prevents code duplication across components
 * - Centralizes API error handling
 * - Provides consistent state management
 * - Makes testing easier
 */

import { gameState } from '../stores.js';
import { buildImagePrompt } from './promptBuilder.js';

/**
 * Generate an image based on current game state
 * @param {Object} options - Optional context for prompt building
 * @param {Object} options.currentContext - Current question/answer context
 * @returns {Promise<boolean>} - Success/failure of image generation
 */
export async function generateImage(options = {}) {
	try {
		// Set loading state
		gameState.update(state => ({
			...state,
			isGeneratingImage: true
		}));

		// Get current game state for prompt building
		let currentState;
		gameState.subscribe(state => {
			currentState = state;
		})();

		// Build the prompt using the centralized prompt builder
		const prompt = buildImagePrompt(currentState, options);

		// Call the API endpoint
		const response = await fetch('/games/the-ground-itself/api/generate-image', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				prompt: prompt,
				isDevelopmentMode: currentState.isDevelopmentMode
			})
		});

		const result = await response.json();
		
		if (result.success) {
			// Update state with successful result
			gameState.update(state => ({
				...state,
				currentImageUrl: result.imageUrl,
				lastGeneratedPrompt: result.prompt,
				isGeneratingImage: false
			}));
			return true;
		} else {
			console.error('Image generation failed:', result.error);
			gameState.update(state => ({
				...state,
				isGeneratingImage: false
			}));
			return false;
		}
	} catch (error) {
		console.error('Error calling image API:', error);
		gameState.update(state => ({
			...state,
			isGeneratingImage: false
		}));
		return false;
	}
}

/**
 * Generate image with enhanced context (for face cards, main gameplay, etc.)
 * @param {string} currentQuestion - The question being answered
 * @param {string} currentAnswer - The user's answer
 * @returns {Promise<boolean>} - Success/failure of image generation
 */
export async function generateImageWithContext(currentQuestion, currentAnswer) {
	return await generateImage({
		currentContext: {
			currentQuestion,
			currentAnswer
		}
	});
}

/**
 * Generate image for time gap transitions
 * @param {Object} timeGapInfo - Information about the time transition
 * @param {Array} timeGapAnswers - Answers to time gap questions
 * @returns {Promise<boolean>} - Success/failure of image generation
 */
export async function generateTimeGapImage(timeGapInfo, timeGapAnswers) {
	return await generateImage({
		currentContext: {
			timeGapInfo,
			timeGapAnswers
		}
	});
}

/**
 * Generate image with multiple question/answer pairs (for setup phase)
 * @param {Array} questionAnswerPairs - Array of {question, answer} objects
 * @returns {Promise<boolean>} - Success/failure of image generation
 */
export async function generateImageWithMultipleAnswers(questionAnswerPairs) {
	return await generateImage({
		currentContext: {
			multipleAnswers: questionAnswerPairs
		}
	});
}
