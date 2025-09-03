// src/routes/games/the-ground-itself/logic/gameActions.js

/**
 * CENTRALIZED GAME ACTIONS SERVICE
 * 
 * This service handles ALL game state changes and business logic.
 * DO NOT duplicate game logic in components - always use these actions.
 * 
 * Why this exists:
 * - Prevents logic duplication across components
 * - Centralizes state management
 * - Uses existing logic components properly (dice.js, deck.js, etc.)
 * - Makes the codebase maintainable and testable
 * 
 * IMPORTANT: Components should ONLY handle UI and call these actions.
 */

import { gameState } from '../stores.js';
import { rollD6, getTimelineUnit } from './dice.js';
import { createFaceCardDeck, drawCard } from './deck.js';
import { generateImage, generateImageWithContext } from './imageService.js';

/**
 * Start the game with user's place description and style
 * @param {string} settingDescription - User's description of their place
 * @param {string} imageStyle - Selected visual style
 * @returns {Promise<boolean>} - Success/failure of game start
 */
export async function startGame(settingDescription, imageStyle) {
	if (!settingDescription.trim()) {
		throw new Error('Please describe your place before continuing.');
	}

	// Update game state
	gameState.update(state => ({
		...state,
		settingDescription: settingDescription.trim(),
		imageStyle: imageStyle,
		currentPhase: 'setup-timeline'
	}));

	// Generate the first image using the centralized service
	// NOTE: We pass context to help the prompt builder understand this is the initial setup
	const success = await generateImageWithContext(
		"Describe your place", 
		settingDescription.trim()
	);

	return success;
}

/**
 * Roll timeline dice and set the time unit for the game
 * Uses the existing dice.js logic - DO NOT reimplement dice rolling elsewhere
 * @returns {Object} - The roll result and time unit
 */
export function rollTimeline() {
	// Use the existing dice logic - this is why we have dice.js!
	const roll = rollD6();
	const timeUnit = getTimelineUnit(roll);

	// Update game state
	gameState.update(state => ({
		...state,
		timelineRoll: roll,
		timelineUnit: timeUnit,
		currentPhase: 'setup-place'
	}));

	return { roll, timeUnit };
}

/**
 * Initialize face card setup phase
 * Uses existing deck.js logic - DO NOT reimplement card logic elsewhere
 */
export function initializeFaceCardSetup() {
	// Use existing deck logic
	const faceCardDeck = createFaceCardDeck();
	const { card: firstCard, remainingDeck } = drawCard(faceCardDeck);

	gameState.update(state => ({
		...state,
		faceCardDeck: remainingDeck,
		currentFaceCard: firstCard,
		faceCardIndex: 0
	}));
}

/**
 * Submit a face card answer and progress to next card
 * @param {string} answer - User's answer to the current face card question
 * @param {string} currentQuestion - The question being answered
 * @returns {Promise<Object>} - Information about progression (isComplete, etc.)
 */
export async function submitFaceCardAnswer(answer, currentQuestion) {
	let currentState;
	gameState.subscribe(state => {
		currentState = state;
	})();

	const isLastCard = currentState.faceCardIndex === 11; // 12 cards total (0-11)

	// Store the answer if provided
	if (answer.trim()) {
		const answerKey = `setup_${currentState.currentFaceCard.rank}_${currentState.currentFaceCard.suit}`;
		
		gameState.update(state => ({
			...state,
			answers: {
				...state.answers,
				[answerKey]: answer.trim()
			}
		}));

		// Generate image with the new answer using centralized service
		await generateImageWithContext(currentQuestion, answer.trim());
	}

	// Progress to next card or complete setup
	if (isLastCard) {
		// All face cards complete - move to main gameplay
		gameState.update(state => ({
			...state,
			faceCardsComplete: true,
			currentPhase: 'mainPlay'
		}));
		
		return { isComplete: true };
	} else {
		// Draw next card using existing deck logic
		const { card: nextCard, remainingDeck } = drawCard(currentState.faceCardDeck);
		
		gameState.update(state => ({
			...state,
			currentFaceCard: nextCard,
			faceCardDeck: remainingDeck,
			faceCardIndex: state.faceCardIndex + 1
		}));
		
		return { isComplete: false, nextCard };
	}
}

/**
 * Navigate to a specific game phase
 * @param {string} phase - The phase to navigate to
 */
export function navigateToPhase(phase) {
	gameState.update(state => ({
		...state,
		currentPhase: phase
	}));
}

/**
 * Save an answer to the game state with a unique key
 * @param {string} key - Unique key for the answer
 * @param {string} answer - The answer to save
 */
export function saveAnswer(key, answer) {
	gameState.update(state => ({
		...state,
		answers: {
			...state.answers,
			[key]: answer.trim()
		}
	}));
}

/**
 * Get the current game state (for components that need to read state)
 * @returns {Promise<Object>} - Current game state
 */
export function getCurrentGameState() {
	return new Promise((resolve) => {
		const unsubscribe = gameState.subscribe(state => {
			resolve(state);
			unsubscribe();
		});
	});
}
