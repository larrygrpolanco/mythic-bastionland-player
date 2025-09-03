// src/routes/games/the-ground-itself/logic/dice.js

export function rollD6() {
	return Math.floor(Math.random() * 6) + 1;
}

export function getTimelineUnit(roll) {
	const units = {
		1: 'days',
		2: 'weeks',
		3: 'years',
		4: 'decades',
		5: 'centuries',
		6: 'millennia'
	};
	return units[roll];
}
