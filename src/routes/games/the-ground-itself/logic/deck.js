// src/routes/games/the-ground-itself/logic/deck.js

export function createFaceCardDeck() {
	const suits = ['clubs', 'hearts', 'diamonds', 'spades'];
	const faces = ['jack', 'queen', 'king'];
	const deck = [];

	for (const suit of suits) {
		for (const face of faces) {
			deck.push({ suit, rank: face });
		}
	}

	return shuffleDeck(deck);
}

export function createNumericalDeck() {
	const suits = ['clubs', 'hearts', 'diamonds', 'spades'];
	const numbers = ['ace', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
	const deck = [];

	for (const suit of suits) {
		for (const rank of numbers) {
			deck.push({ suit, rank });
		}
	}

	return shuffleDeck(deck);
}

export function shuffleDeck(deck) {
	const shuffled = [...deck];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function drawCard(deck) {
	if (deck.length === 0) {
		return { card: null, remainingDeck: [] };
	}
	
	const card = deck[0];
	const remainingDeck = deck.slice(1);
	
	return { card, remainingDeck };
}
