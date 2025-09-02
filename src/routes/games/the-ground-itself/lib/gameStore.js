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
	history: [], // Array of past cycles
	currentCard: null,
	currentQuestion: null,
	playerAnswers: [],
	cardInstances: {
		ace: 0,
		'2': 0,
		'3': 0,
		'4': 0,
		'5': 0,
		'6': 0,
		'7': 0,
		'8': 0,
		'9': 0,
		'10': 0
	},

	// Game settings
	consentActive: true,
	notes: [],
	
	// Cycle transition data
	cycleTransition: {
		inProgress: false,
		gapValue: null,
		direction: 'forward' // 'forward' or 'backward'
	}
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
			currentQuestion: getQuestionForCard(card, state.cardInstances[value]),
			cardInstances: {
				...state.cardInstances,
				[value]: state.cardInstances[value] + 1
			}
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
			playerAnswers: [],
			cycleTransition: {
				inProgress: true,
				gapValue: gapValue,
				direction: Math.random() > 0.5 ? 'forward' : 'backward'
			}
		}));
	},

	completeCycleTransition: () => {
		gameStore.update(state => ({
			...state,
			cycleTransition: {
				inProgress: false,
				gapValue: null,
				direction: 'forward'
			}
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
function getQuestionForCard(card, instance) {
	const { value, suit } = card;

	switch (value) {
		case 'ace':
			return getAceQuestion(instance);
		case '2':
			return getTwoQuestion(instance);
		case '3':
			return getThreeQuestion(instance);
		case '4':
			return getFourQuestion(instance);
		case '5':
			return getFiveQuestion(instance);
		case '6':
			return getSixQuestion(instance);
		case '7':
			return getSevenQuestion(instance);
		case '8':
			return getEightQuestion(instance);
		case '9':
			return getNineQuestion(instance);
		case '10':
			return getTenQuestion();
		default:
			return "Invalid card";
	}
}

function getAceQuestion(instance) {
	const aceQuestions = [
		"What are the plants like in our place? The rocks? The soil?",
		"It is time to plant 'the seedlings'. What are the seedlings and where are they planted? What is the harvest that is hoped for?",
		"The harvest day has arrived. What is being harvested, for what purpose, and how is it being stored?",
		"Sometimes change is so slow that the world shifts unnoticed. What is the groundswell that has been taking place so quietly?"
	];

	return aceQuestions[Math.min(instance, aceQuestions.length - 1)];
}

function getTwoQuestion(instance) {
	const twoQuestions = [
		"Name a monument, marker, statue, or other physicalized memory that exists in our place. What does it mark?",
		"What is produced in our place right now, and how does it make its way into the wider world? (Is this export a physical good? Knowledge? Something else?)",
		"A major modification is made to the environment of our place. What is this change? Was it made by someone or did it simply come to pass?",
		"A breakthrough moment (in technology, arts, politics, philosophy, or daily life) tips the scales of a power balance. What was this breakthrough, and how does it play out socially?"
	];

	return twoQuestions[Math.min(instance, twoQuestions.length - 1)];
}

function getThreeQuestion(instance) {
	const threeQuestions = [
		"What do people listen to and perform here? What is considered the folk art?",
		"What do people in our place argue about for fun (whether at the bar, in the square, or in other social spaces)?",
		"A new style, fad, or devotion sweeps our place. What is it? Who cares about it?",
		"A bad decision leaves marks on the land. What was this decision, and what trace does it leave?"
	];

	return threeQuestions[Math.min(instance, threeQuestions.length - 1)];
}

function getFourQuestion(instance) {
	const fourQuestions = [
		"What is the primary building or natural material of our place?",
		"'The bar' opens their doors to all. What is the bar, and who is a regular there? or- 'The church' changes a core mandate. What is the church, and what about their worldview has shifted?",
		"Something new has been constructed, and stands where there was once something else. What was once there, and what has replaced it?",
		"A creative or artistic achievement is unveiled. What is it? How is it received?"
	];

	return fourQuestions[Math.min(instance, fourQuestions.length - 1)];
}

function getFiveQuestion(instance) {
	const fiveQuestions = [
		"What are the stars like in our place? The sky? The weather?",
		"What secrets are kept in our place? Why are they kept? By who and from whom?",
		"There is a union. Is it political? Emotional? Marital? What is newly aligned?",
		"Someone is found guilty, and is punished. What did they do, and what is the punishment?"
	];

	return fiveQuestions[Math.min(instance, fiveQuestions.length - 1)];
}

function getSixQuestion(instance) {
	const sixQuestions = [
		"What is the most horrible thing in or about our place?",
		"Someone returns to our place changed. Who are they, and how are they different?",
		"Something small but noticeable is destroyed. What was it, and who or what destroyed it?",
		"A natural or architectural disaster strikes with no warning, leaving something in ruins. What was this disaster?"
	];

	return sixQuestions[Math.min(instance, sixQuestions.length - 1)];
}

function getSevenQuestion(instance) {
	const sevenQuestions = [
		"What is the most beautiful thing in or about our place?",
		"Invent a specific street, building, corner, overlook, or meeting-place. What is it called officially, and what do the locals call it?",
		"A forgotten aspect to our place is recovered. What is it? A corner? A basement? A hidden garden?",
		"A previous alliance shows cracks. There is bickering and infighting. Who is fighting? What are they fighting about?"
	];

	return sevenQuestions[Math.min(instance, sevenQuestions.length - 1)];
}

function getEightQuestion(instance) {
	const eightQuestions = [
		"What does success look like in our place? What do the inhabitants want?",
		"The news is dramatic, and tensions are high. What is the news? How is this reaction physicalized in space?",
		"Someone (or a group of people) comes to our place. Who are they, and why have they come? Do they bring anything with them?",
		"The future feels unsure, and the talk of our place has turned to preparations. What preparations are being taken, and for what?"
	];

	return eightQuestions[Math.min(instance, eightQuestions.length - 1)];
}

function getNineQuestion(instance) {
	const nineQuestions = [
		"What do people eat and drink here? What is considered traditional?",
		"Someone (or a group) leaves our place. Who are they, and why are they going? What do they take with them and what do they leave behind?",
		"There is planning going into a celebration. Is it a festival, holiday, or remembrance? What is it celebrating?",
		"New information about a past event is uncovered, casting it in a dramatically different light. What was found and how does it change how the past is perceived?"
	];

	return nineQuestions[Math.min(instance, nineQuestions.length - 1)];
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
