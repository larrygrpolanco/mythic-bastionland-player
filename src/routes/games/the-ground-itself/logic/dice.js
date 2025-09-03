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

/**
 * Get detailed information about a timeline unit
 * Includes description and storytelling implications
 */
export function getTimelineInfo(roll) {
	const timelineData = {
		1: {
			unit: 'days',
			description: 'Intimate, close-textured story',
			implication: 'Your action should be quick-paced, happening in a "now" that may see a few hours pass.',
			example: 'Perfect for personal stories, daily life, immediate conflicts'
		},
		2: {
			unit: 'weeks',
			description: 'Short-term changes and developments',
			implication: 'Stories of seasonal changes, short projects, brief relationships.',
			example: 'A summer romance, a harvest season, a short-term crisis'
		},
		3: {
			unit: 'years',
			description: 'Seasonal cycles and growth',
			implication: 'Stories of growth, education, career changes, family development.',
			example: 'A child growing up, a business developing, annual traditions'
		},
		4: {
			unit: 'decades',
			description: 'Generational changes',
			implication: 'Stories spanning lifetimes, major social changes, institutional evolution.',
			example: 'A family legacy, technological advancement, cultural shifts'
		},
		5: {
			unit: 'centuries',
			description: 'Historical epochs',
			implication: 'Your "now" may be years or even decades. Stories of civilizations, long-term consequences.',
			example: 'Rise and fall of empires, religious movements, architectural evolution'
		},
		6: {
			unit: 'millennia',
			description: 'Geological and cosmic time',
			implication: 'Playing over thousands of years - what was here may not survive in recognizable ways.',
			example: 'Geological changes, species evolution, archaeological deep time'
		}
	};
	
	return timelineData[roll] || timelineData[1];
}

/**
 * Roll timeline with full information
 * Returns both the roll and complete timeline data
 */
export function rollTimelineWithInfo() {
	const roll = rollD6();
	const info = getTimelineInfo(roll);
	
	return {
		roll,
		unit: info.unit,
		description: info.description,
		implication: info.implication,
		example: info.example
	};
}
