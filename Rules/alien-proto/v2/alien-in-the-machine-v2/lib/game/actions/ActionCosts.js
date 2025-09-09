/**
 * ActionCosts.js - Centralized Action Cost Definitions
 * 
 * This module defines the tick costs for all game actions. Having costs in one place
 * ensures consistency across the entire system - UI display, AI decision-making,
 * and turn system execution all use the same values.
 * 
 * Core Philosophy:
 * - Action costs are the fundamental currency of the tactical system
 * - Costs should reflect tactical trade-offs (quick vs thorough)
 * - Same costs apply to human and AI players (unified rules)
 */

/**
 * Base action costs in ticks
 * These are the foundation of tactical decision-making
 */
export const ACTION_COSTS = {
	// Movement actions
	MOVE: 8,              // Standard room-to-room movement
	MOVE_CAREFUL: 12,     // Careful/stealthy movement
	MOVE_QUICK: 6,        // Quick but potentially risky movement
	
	// Interaction actions
	EXAMINE: 2,           // Quick look at object/entity
	EXAMINE_THOROUGH: 5,  // Detailed examination
	SEARCH: 6,            // Search container/area
	SEARCH_THOROUGH: 10,  // Exhaustive search
	USE_ITEM: 3,          // Use simple item
	USE_COMPLEX: 8,       // Use complex equipment
	
	// Communication actions
	RADIO_QUICK: 1,       // Quick radio message
	RADIO_DETAILED: 3,    // Detailed radio communication
	LISTEN: 2,            // Listen carefully
	
	// Combat actions (for future phases)
	ATTACK_QUICK: 4,      // Quick attack
	ATTACK_AIMED: 7,      // Aimed attack
	RELOAD: 5,            // Reload weapon
	TAKE_COVER: 3,        // Move to cover
	
	// Medical actions (for future phases)
	FIRST_AID: 8,         // Basic medical aid
	SURGERY: 20,          // Complex medical procedure
	DIAGNOSE: 4,          // Medical diagnosis
	
	// Technical actions (for future phases)
	HACK_SIMPLE: 6,       // Simple hacking
	HACK_COMPLEX: 15,     // Complex hacking
	REPAIR_SIMPLE: 8,     // Basic repair
	REPAIR_COMPLEX: 18,   // Complex repair
	
	// Wait/observe actions
	WAIT: 1,              // Wait and observe
	OVERWATCH: 5          // Maintain overwatch position
};

/**
 * Action cost modifiers based on character skills
 * These allow character specialization to affect action efficiency
 */
export const SKILL_MODIFIERS = {
	// Technical skill modifiers
	technical: {
		HACK_SIMPLE: { 1: +2, 2: +1, 3: 0, 4: -1, 5: -2 },
		HACK_COMPLEX: { 1: +5, 2: +3, 3: 0, 4: -2, 5: -4 },
		REPAIR_SIMPLE: { 1: +3, 2: +1, 3: 0, 4: -1, 5: -2 },
		REPAIR_COMPLEX: { 1: +8, 2: +4, 3: 0, 4: -3, 5: -6 }
	},
	
	// Medical skill modifiers
	medical: {
		FIRST_AID: { 1: +3, 2: +1, 3: 0, 4: -1, 5: -2 },
		SURGERY: { 1: +10, 2: +5, 3: 0, 4: -3, 5: -7 },
		DIAGNOSE: { 1: +2, 2: +1, 3: 0, 4: -1, 5: -1 }
	},
	
	// Combat skill modifiers
	combat: {
		ATTACK_QUICK: { 1: +1, 2: +1, 3: 0, 4: -1, 5: -1 },
		ATTACK_AIMED: { 1: +2, 2: +1, 3: 0, 4: -1, 5: -2 },
		RELOAD: { 1: +2, 2: +1, 3: 0, 4: -1, 5: -1 },
		TAKE_COVER: { 1: +1, 2: +1, 3: 0, 4: 0, 5: -1 }
	}
};

/**
 * Environmental cost modifiers
 * Certain conditions affect action costs
 */
export const ENVIRONMENTAL_MODIFIERS = {
	// Lighting conditions
	lighting: {
		bright: { EXAMINE: 0, SEARCH: 0, MOVE: 0 },
		normal: { EXAMINE: 0, SEARCH: 0, MOVE: 0 },
		dim: { EXAMINE: +1, SEARCH: +2, MOVE: +1 },
		dark: { EXAMINE: +2, SEARCH: +4, MOVE: +3 }
	},
	
	// Room hazards
	hazards: {
		smoke: { EXAMINE: +1, SEARCH: +3, MOVE: +2 },
		debris: { MOVE: +2, SEARCH: +1 },
		fire: { MOVE: +4, EXAMINE: +2 },
		depressurized: { MOVE: +6, EXAMINE: +1, SEARCH: +3 }
	}
};

/**
 * Get the base cost for an action
 * @param {string} actionType - Type of action (from ACTION_COSTS)
 * @returns {number} Base tick cost, or 5 if unknown action
 */
export function getBaseCost(actionType) {
	const cost = ACTION_COSTS[actionType.toUpperCase()];
	if (cost === undefined) {
		console.warn(`⚠️ Unknown action type: ${actionType}, using default cost`);
		return 5;  // Default cost for unknown actions
	}
	return cost;
}

/**
 * Calculate final action cost with all modifiers applied
 * @param {string} actionType - Type of action
 * @param {object} character - Character entity data with skills
 * @param {object} environment - Environment data (lighting, hazards, etc.)
 * @returns {number} Final calculated cost
 */
export function calculateActionCost(actionType, character = {}, environment = {}) {
	let baseCost = getBaseCost(actionType);
	let totalModifier = 0;
	
	// Apply skill modifiers if character has skills
	if (character.skills) {
		for (const [skillType, skillValue] of Object.entries(character.skills)) {
			const skillModifiers = SKILL_MODIFIERS[skillType];
			if (skillModifiers && skillModifiers[actionType.toUpperCase()]) {
				const modifier = skillModifiers[actionType.toUpperCase()][skillValue] || 0;
				totalModifier += modifier;
				
				if (modifier !== 0) {
					console.log(`🎯 Skill modifier for ${character.name || 'character'}: ${skillType} ${skillValue} gives ${modifier} to ${actionType}`);
				}
			}
		}
	}
	
	// Apply environmental modifiers
	if (environment.lighting) {
		const lightingModifiers = ENVIRONMENTAL_MODIFIERS.lighting[environment.lighting];
		if (lightingModifiers && lightingModifiers[actionType.toUpperCase()] !== undefined) {
			const modifier = lightingModifiers[actionType.toUpperCase()];
			totalModifier += modifier;
			
			if (modifier !== 0) {
				console.log(`🌙 Lighting modifier: ${environment.lighting} gives ${modifier} to ${actionType}`);
			}
		}
	}
	
	// Apply hazard modifiers
	if (environment.hazards && Array.isArray(environment.hazards)) {
		for (const hazard of environment.hazards) {
			const hazardModifiers = ENVIRONMENTAL_MODIFIERS.hazards[hazard];
			if (hazardModifiers && hazardModifiers[actionType.toUpperCase()] !== undefined) {
				const modifier = hazardModifiers[actionType.toUpperCase()];
				totalModifier += modifier;
				
				if (modifier !== 0) {
					console.log(`☠️ Hazard modifier: ${hazard} gives ${modifier} to ${actionType}`);
				}
			}
		}
	}
	
	// Calculate final cost (minimum of 1 tick)
	const finalCost = Math.max(1, baseCost + totalModifier);
	
	if (totalModifier !== 0) {
		console.log(`⚡ Final cost calculation: ${actionType} = ${baseCost} + ${totalModifier} = ${finalCost}`);
	}
	
	return finalCost;
}

/**
 * Get all available action types with their base costs
 * @returns {object} Object mapping action types to their base costs
 */
export function getAllActionCosts() {
	return { ...ACTION_COSTS };
}

/**
 * Get action cost categories for UI organization
 * @returns {object} Actions organized by category
 */
export function getActionCategories() {
	return {
		MOVEMENT: {
			MOVE: ACTION_COSTS.MOVE,
			MOVE_CAREFUL: ACTION_COSTS.MOVE_CAREFUL,
			MOVE_QUICK: ACTION_COSTS.MOVE_QUICK
		},
		
		INTERACTION: {
			EXAMINE: ACTION_COSTS.EXAMINE,
			EXAMINE_THOROUGH: ACTION_COSTS.EXAMINE_THOROUGH,
			SEARCH: ACTION_COSTS.SEARCH,
			SEARCH_THOROUGH: ACTION_COSTS.SEARCH_THOROUGH,
			USE_ITEM: ACTION_COSTS.USE_ITEM,
			USE_COMPLEX: ACTION_COSTS.USE_COMPLEX
		},
		
		COMMUNICATION: {
			RADIO_QUICK: ACTION_COSTS.RADIO_QUICK,
			RADIO_DETAILED: ACTION_COSTS.RADIO_DETAILED,
			LISTEN: ACTION_COSTS.LISTEN
		},
		
		COMBAT: {
			ATTACK_QUICK: ACTION_COSTS.ATTACK_QUICK,
			ATTACK_AIMED: ACTION_COSTS.ATTACK_AIMED,
			RELOAD: ACTION_COSTS.RELOAD,
			TAKE_COVER: ACTION_COSTS.TAKE_COVER
		},
		
		MEDICAL: {
			FIRST_AID: ACTION_COSTS.FIRST_AID,
			SURGERY: ACTION_COSTS.SURGERY,
			DIAGNOSE: ACTION_COSTS.DIAGNOSE
		},
		
		TECHNICAL: {
			HACK_SIMPLE: ACTION_COSTS.HACK_SIMPLE,
			HACK_COMPLEX: ACTION_COSTS.HACK_COMPLEX,
			REPAIR_SIMPLE: ACTION_COSTS.REPAIR_SIMPLE,
			REPAIR_COMPLEX: ACTION_COSTS.REPAIR_COMPLEX
		},
		
		UTILITY: {
			WAIT: ACTION_COSTS.WAIT,
			OVERWATCH: ACTION_COSTS.OVERWATCH
		}
	};
}

/**
 * Debug function: Test cost calculation for a character and environment
 * @param {string} actionType - Action to test
 * @param {object} character - Character data
 * @param {object} environment - Environment data
 * @returns {object} Detailed cost breakdown
 */
export function debugActionCost(actionType, character = {}, environment = {}) {
	const baseCost = getBaseCost(actionType);
	const finalCost = calculateActionCost(actionType, character, environment);
	const modifier = finalCost - baseCost;
	
	return {
		actionType,
		baseCost,
		modifier,
		finalCost,
		character: character.name || 'Unknown',
		environment: {
			lighting: environment.lighting || 'normal',
			hazards: environment.hazards || []
		},
		breakdown: {
			base: baseCost,
			skillModifier: 'calculated in calculateActionCost',
			environmentModifier: 'calculated in calculateActionCost',
			total: finalCost
		}
	};
}
