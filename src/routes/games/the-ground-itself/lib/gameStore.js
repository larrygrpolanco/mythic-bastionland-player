import { writable } from 'svelte/store';

// Game state structure
const initialState = {
	// Setup phase data
	place: {
		name: '',
		description: '',
		clubs: {}, // Face card answers
		hearts: {},
		diamonds: {},
		spades: {}
	},
	timeline: {
		unit: null, // days, weeks, years, decades, centuries, millennia
		unitValue: null
	},

	// Gameplay data
	cycle: 1,
	tenCount: 0,
	history: [], // Array of past events/cycles
	currentCard: null,
	currentQuestion: null,
	playerAnswers: [],

	// Game settings
	consentActive: true,
	notes: []
};

export const gameStore = writable(initialState);

// Helper functions for game logic
export const gameActions = {
	// Setup functions
	setPlaceName: (name) => {
		gameStore.update(state => ({
			...state,
			place: { ...state.place, name }
		}));
	},

	setPlaceDescription: (description) => {
		gameStore.update(state => ({
			...state,
			place: { ...state.place, description }
		}));
	},

	setTimeline: (unit, unitValue) => {
		gameStore.update(state => ({
			...state,
			timeline: { unit, unitValue }
		}));
	},

	setFaceCardAnswer: (suit, card, answer) => {
		gameStore.update(state => ({
			...state,
			place: {
				...state.place,
				[suit]: {
					...state.place[suit],
					[card]: answer
				}
			}
		}));
	},

	// Gameplay functions
	drawCard: () => {
		const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
		const values = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

		const suit = suits[Math.floor(Math.random() * suits.length)];
		const value = values[Math.floor(Math.random() * values.length)];

		const card = { suit, value };

		gameStore.update(state => ({
			...state,
			currentCard: card,
			currentQuestion: getQuestionForCard(card)
		}));

		return card;
	},

	answerQuestion: (answer) => {
		gameStore.update(state => ({
			...state,
			playerAnswers: [...state.playerAnswers, {
				cycle: state.cycle,
				card: state.currentCard,
				question: state.currentQuestion,
				answer,
				timestamp: new Date()
			}],
			currentCard: null,
			currentQuestion: null
		}));
	},

	advanceCycle: (gapUnit, gapValue) => {
		gameStore.update(state => ({
			...state,
			cycle: state.cycle + 1,
			tenCount: state.tenCount + 1,
			history: [...state.history, {
				cycle: state.cycle,
				gap: { unit: gapUnit, value: gapValue },
				answers: state.playerAnswers,
				timestamp: new Date()
			}],
			playerAnswers: []
		}));
	},

	// Utility functions
	resetGame: () => {
		gameStore.set(initialState);
	},

	toggleConsent: () => {
		gameStore.update(state => ({
			...state,
			consentActive: !state.consentActive
		}));
	},

	addNote: (note) => {
		gameStore.update(state => ({
			...state,
			notes: [...state.notes, {
				text: note,
				timestamp: new Date()
			}]
		}));
	}
};

// Card question mapping based on the game rules
function getQuestionForCard(card) {
	const { value, suit } = card;

	switch (value) {
		case 'ace':
			return getAceQuestion();
		case '2':
			return "Name a monument, marker, statue, or other physicalized memory that exists in our place. What does it mark?";
		case '3':
			return "What do people listen to and perform here? What is considered the folk art?";
		case '4':
			return "What is the primary building or natural material of our place?";
		case '5':
			return "What are the stars like in our place? The sky? The weather?";
		case '6':
			return "What is the most horrible thing in or about our place?";
		case '7':
			return "What is the most beautiful thing in or about our place?";
		case '8':
			return "What does success look like in our place? What do the inhabitants want?";
		case '9':
			return "What do people eat and drink here? What is considered traditional?";
		case '10':
			return getTenQuestion();
		default:
			return "Invalid card";
	}
}

function getAceQuestion() {
	const aceQuestions = [
		"What are the plants like in our place? The rocks? The soil?",
		"It is time to plant 'the seedlings'. What are the seedlings and where are they planted? What is the harvest that is hoped for?",
		"The harvest day has arrived. What is being harvested, for what purpose, and how is it being stored?",
		"Sometimes change is so slow that the world shifts unnoticed. What is the groundswell that has been taking place so quietly?"
	];

	return aceQuestions[Math.floor(Math.random() * aceQuestions.length)];
}

function getTenQuestion() {
	const tenQuestions = [
		"The 'gardens' are planted, the work has been done, and now we wait. What was planted, and what are we waiting for?",
		"There is a great victory that enables the inhabitants of our place to build towards a new future. What is this future they wish for? How will they set to work on it?",
		"There a great loss, one that sets new burdens on the inhabitants of our place. How do they cope, and what have they lost forever?",
		"Someone important (socially, political, or emotionally) in our place dies. Who were they, and how were they killed? How are they remembered after?",
		"It is a resting day, in anticipation of problems just across the horizon. What is believed to be coming, and how do the inhabitants of our place set these problems aside, for just one day?",
		"It is a resting day, in the knowledge of a secure future. What is taken as a given, and how do the inhabitants of our place spend a lazy day?"
	];

	return tenQuestions[Math.floor(Math.random() * tenQuestions.length)];
}
