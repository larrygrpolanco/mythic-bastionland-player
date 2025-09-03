// src/routes/games/the-ground-itself/stores.js
import { writable } from 'svelte/store';

export const gameState = writable({
	// Overall Game Flow
	currentPhase: 'intro', // intro, setup-setting, setup-timeline, setup-place, mainPlay, timeGap, end

	// Setup Data
	settingDescription: '',
	timelineUnit: null, // e.g., 'days', 'weeks', 'years', 'decades', 'centuries', 'millennia'
	timelineRoll: null, // the actual die roll result
	timelineDescription: null, // e.g., 'Intimate, close-textured story'
	timelineImplication: null, // What this timeline means for storytelling
	timelineExample: null, // Example of what this timeline is good for
	imageStyle: 'atmospheric, digital painting, high detail', // default style, user can change
	customImageStyle: '', // User-defined custom style (takes priority over imageStyle)
	faceCardDeck: [],
	currentFaceCard: null, // Current face card being answered
	faceCardIndex: 0, // Progress through face cards (0-11)
	faceCardsComplete: false, // Flag for completion

	// Core Gameplay Data
	numericalDeck: [],
	activeCard: null,
	tensDrawn: 0,
	currentCycle: 1,
	cardRankCounts: {
		ace: 0,
		two: 0,
		three: 0,
		four: 0,
		five: 0,
		six: 0,
		seven: 0,
		eight: 0,
		nine: 0
	},
	turnState: 'drawing', // drawing, deciding, answering, focusedSituation

	// Narrative & Visuals
	answers: {}, // A single object to hold all answers, keyed uniquely
	imagePrompt: '',
	currentImageUrl:
		'https://science.nasa.gov/wp-content/uploads/2023/09/rcw120-threecolor-with-star-final.png?w=900', // Provide a default starting image
	isGeneratingImage: false,

	// Development/Debug
	isDevelopmentMode: true, // For mock API calls and debugging
	lastGeneratedPrompt: '' // To show prompts during development
});
