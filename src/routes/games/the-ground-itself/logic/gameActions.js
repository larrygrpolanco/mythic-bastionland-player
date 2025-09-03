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
import { rollD6, getTimelineUnit, rollTimelineWithInfo, getTimelineInfo } from './dice.js';
import { createFaceCardDeck, createNumericalDeck, drawCard } from './deck.js';
import { generateImage, generateImageWithContext, generateImageWithMultipleAnswers } from './imageService.js';

/**
 * Start the game with user's place description and style
 * @param {string} settingDescription - User's description of their place
 * @param {string} imageStyle - Selected visual style
 * @param {string} customImageStyle - Optional custom style description
 * @returns {Promise<boolean>} - Success/failure of game start
 */
export async function startGame(settingDescription, imageStyle, customImageStyle = '') {
	if (!settingDescription.trim()) {
		throw new Error('Please describe your place before continuing.');
	}

	// Update game state with both styles - prompt builder will handle priority
	gameState.update(state => ({
		...state,
		settingDescription: settingDescription.trim(),
		imageStyle: imageStyle,
		customImageStyle: customImageStyle.trim(),
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

	// Update game state - but don't advance phase yet (for reroll option)
	gameState.update(state => ({
		...state,
		timelineRoll: roll,
		timelineUnit: timeUnit
	}));

	return { roll, timeUnit };
}

/**
 * Roll timeline with full information for enhanced setup
 * @returns {Object} - Complete timeline information including descriptions
 */
export function rollTimelineWithDetails() {
	const timelineData = rollTimelineWithInfo();
	
	// Update game state with full timeline information
	gameState.update(state => ({
		...state,
		timelineRoll: timelineData.roll,
		timelineUnit: timelineData.unit,
		timelineDescription: timelineData.description,
		timelineImplication: timelineData.implication,
		timelineExample: timelineData.example
	}));

	return timelineData;
}

/**
 * Accept the current timeline and proceed to place setup
 */
export function acceptTimeline() {
	gameState.update(state => ({
		...state,
		currentPhase: 'setup-place'
	}));
}

/**
 * Reroll the timeline (as allowed by original game rules)
 * @returns {Object} - New timeline information
 */
export function rerollTimeline() {
	console.log('Rerolling timeline as per original game rules');
	return rollTimelineWithDetails();
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
 * Enhanced to generate images every 3 answered questions with all 3 answers included
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
	let shouldGenerateImage = false;
	let imageGenerated = false;

	// Handle answered questions (not skipped)
	if (answer.trim()) {
		const answerKey = `setup_${currentState.currentFaceCard.rank}_${currentState.currentFaceCard.suit}`;
		const questionAnswerPair = { 
			question: currentQuestion, 
			answer: answer.trim() 
		};
		
		// Update state with answer and tracking
		gameState.update(state => {
			// Store the answer
			const newAnswers = {
				...state.answers,
				[answerKey]: answer.trim()
			};
			
			// Add to recent answers (keep last 3)
			const newRecentAnswers = [...state.recentAnswers, questionAnswerPair];
			if (newRecentAnswers.length > 3) {
				newRecentAnswers.shift(); // Remove oldest
			}
			
			// Add to all setup answers
			const newSetupAnswers = [...state.setupAnswers, questionAnswerPair];
			
			// Increment answered question count
			const newAnsweredCount = state.answeredQuestionCount + 1;
			
			return {
				...state,
				answers: newAnswers,
				recentAnswers: newRecentAnswers,
				setupAnswers: newSetupAnswers,
				answeredQuestionCount: newAnsweredCount
			};
		});

		// Get updated state for image generation logic
		gameState.subscribe(state => {
			currentState = state;
		})();

		// Determine if we should generate an image
		const answeredCount = currentState.answeredQuestionCount;
		const isMultipleOfThree = answeredCount % 3 === 0;
		const hasAnswers = answeredCount > 0;
		
		shouldGenerateImage = (isMultipleOfThree && hasAnswers) || (isLastCard && hasAnswers);
		
		// Generate image if conditions are met
		if (shouldGenerateImage) {
			try {
				if (currentState.recentAnswers.length > 1) {
					// Use multiple answers template
					await generateImageWithMultipleAnswers(currentState.recentAnswers);
				} else {
					// Fallback to single answer for first image
					await generateImageWithContext(currentQuestion, answer.trim());
				}
				imageGenerated = true;
			} catch (error) {
				console.error('Error generating image:', error);
			}
		}
	}

	// Progress to next card or complete setup
	if (isLastCard) {
		// All face cards complete - move to main gameplay
		gameState.update(state => ({
			...state,
			faceCardsComplete: true,
			currentPhase: 'mainPlay'
		}));
		
		return { 
			isComplete: true, 
			imageGenerated,
			answeredCount: currentState.answeredQuestionCount 
		};
	} else {
		// Draw next card using existing deck logic
		const { card: nextCard, remainingDeck } = drawCard(currentState.faceCardDeck);
		
		gameState.update(state => ({
			...state,
			currentFaceCard: nextCard,
			faceCardDeck: remainingDeck,
			faceCardIndex: state.faceCardIndex + 1
		}));
		
		return { 
			isComplete: false, 
			nextCard, 
			imageGenerated,
			answeredCount: currentState.answeredQuestionCount 
		};
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

// ===== MAIN GAMEPLAY ACTIONS =====

/**
 * Draw a numerical card for main gameplay
 * Creates deck on first draw, handles "10" cards for time gaps
 * @returns {Promise<Object>} - Card info and next action
 */
export async function drawNumericalCard() {
	let currentState;
	gameState.subscribe(state => {
		currentState = state;
	})();

	// Create numerical deck on first draw
	let deck = currentState.numericalDeck;
	if (deck.length === 0) {
		deck = createNumericalDeck();
		console.log('Created numerical deck:', deck.length, 'cards');
	}

	// Draw card using existing deck logic
	const { card, remainingDeck } = drawCard(deck);
	
	if (!card) {
		console.error('No more cards in deck!');
		return { success: false, error: 'No more cards' };
	}

	console.log('Drew card:', card);

	// Update game state with drawn card
	gameState.update(state => ({
		...state,
		numericalDeck: remainingDeck,
		activeCard: card
	}));

	// Check if it's a "10" card (time gap/end game)
	if (card.rank === 'ten') {
		// Calculate new tens count
		const newTensCount = currentState.tensDrawn + 1;
		
		// Update tens drawn count
		gameState.update(state => ({
			...state,
			tensDrawn: newTensCount
		}));

		// Check if this is the 4th ten (game end)
		if (newTensCount >= 4) {
			gameState.update(state => ({
				...state,
				currentPhase: 'end'
			}));
			return { success: true, action: 'endGame', card };
		} else {
			gameState.update(state => ({
				...state,
				currentPhase: 'timeGap'
			}));
			return { success: true, action: 'timeGap', card };
		}
	} else {
		// Regular card - move to decision phase
		gameState.update(state => ({
			...state,
			turnState: 'deciding'
		}));
		return { success: true, action: 'decide', card };
	}
}

/**
 * Submit an answer for a numerical card question
 * @param {string} answer - User's answer
 * @param {string} currentQuestion - The question being answered
 * @returns {Promise<boolean>} - Success/failure
 */
export async function submitNumericalCardAnswer(answer, currentQuestion) {
	let currentState;
	gameState.subscribe(state => {
		currentState = state;
	})();

	const activeCard = currentState.activeCard;
	if (!activeCard || !answer.trim()) {
		return false;
	}

	try {
		// Create unique key for this answer
		const currentCount = currentState.cardRankCounts[activeCard.rank] || 0;
		const answerKey = `card_${activeCard.rank}_${currentCount + 1}`;

		// Save answer to game state
		gameState.update(state => ({
			...state,
			answers: {
				...state.answers,
				[answerKey]: answer.trim()
			}
		}));

		// Increment the card rank count
		gameState.update(state => ({
			...state,
			cardRankCounts: {
				...state.cardRankCounts,
				[activeCard.rank]: (state.cardRankCounts[activeCard.rank] || 0) + 1
			}
		}));

		// Generate image with the new answer using centralized service
		await generateImageWithContext(currentQuestion, answer.trim());

		// Reset for next turn
		gameState.update(state => ({
			...state,
			turnState: 'drawing',
			activeCard: null
		}));

		return true;
	} catch (error) {
		console.error('Error submitting numerical card answer:', error);
		return false;
	}
}

/**
 * Submit a focused situation response
 * @param {Object} situation - The selected focused situation
 * @param {string} response - User's response
 * @returns {Promise<boolean>} - Success/failure
 */
export async function submitFocusedSituation(situation, response) {
	let currentState;
	gameState.subscribe(state => {
		currentState = state;
	})();

	const activeCard = currentState.activeCard;
	if (!activeCard || !situation || !response.trim()) {
		return false;
	}

	try {
		// Create unique key for this focused situation response
		const currentCount = currentState.cardRankCounts[activeCard.rank] || 0;
		const answerKey = `focused_${activeCard.rank}_${currentCount + 1}`;

		// Save response to game state
		gameState.update(state => ({
			...state,
			answers: {
				...state.answers,
				[answerKey]: `${situation.name}: ${response.trim()}`
			}
		}));

		// Increment the card rank count (same as answering the question)
		gameState.update(state => ({
			...state,
			cardRankCounts: {
				...state.cardRankCounts,
				[activeCard.rank]: (state.cardRankCounts[activeCard.rank] || 0) + 1
			}
		}));

		// Generate image with the focused situation response
		const contextQuestion = `Focused Situation: ${situation.name}`;
		await generateImageWithContext(contextQuestion, response.trim());

		// Reset for next turn
		gameState.update(state => ({
			...state,
			turnState: 'drawing',
			activeCard: null
		}));

		return true;
	} catch (error) {
		console.error('Error submitting focused situation:', error);
		return false;
	}
}

/**
 * Set turn state for main gameplay flow
 * @param {string} turnState - The turn state to set
 */
export function setTurnState(turnState) {
	gameState.update(state => ({
		...state,
		turnState
	}));
}
