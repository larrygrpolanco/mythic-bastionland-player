/**
 * ActionTypes.js - Action Type Definitions and Properties
 * 
 * This module defines all action types available in the game, their properties,
 * requirements, and metadata. This is used by both UI generation and AI context
 * assembly to ensure consistent action availability and descriptions.
 * 
 * Core Philosophy:
 * - Actions are the interface between intention and execution
 * - Same action definitions used by human UI and AI context
 * - Rich metadata enables smart UI generation and AI decision-making
 */

import { ACTION_COSTS } from './ActionCosts.js';

/**
 * Core action type definitions
 * Each action defines its properties, requirements, and behavior
 */
export const ACTION_TYPES = {
	// Movement Actions
	MOVE: {
		id: 'MOVE',
		name: 'Move',
		category: 'MOVEMENT',
		baseCost: ACTION_COSTS.MOVE,
		description: 'Move to a connected room',
		requiresTarget: true,
		targetType: 'ROOM',
		icon: '🚶',
		
		// Requirements for this action to be available
		requirements: {
			components: ['position'],  // Character must have position component
			conditions: []             // No special conditions
		},
		
		// What this action affects
		effects: {
			worldState: ['position'],   // Updates position component
			turnSystem: true           // Uses turn system (costs time)
		},
		
		// UI display properties
		ui: {
			buttonClass: 'action-movement',
			showInCategories: ['CORE', 'MOVEMENT'],
			priority: 10  // Higher priority = shown earlier
		}
	},
	
	MOVE_CAREFUL: {
		id: 'MOVE_CAREFUL',
		name: 'Move Carefully',
		category: 'MOVEMENT',
		baseCost: ACTION_COSTS.MOVE_CAREFUL,
		description: 'Move to a connected room with extra caution',
		requiresTarget: true,
		targetType: 'ROOM',
		icon: '🐢',
		
		requirements: {
			components: ['position'],
			conditions: []
		},
		
		effects: {
			worldState: ['position'],
			turnSystem: true,
			special: ['reduced_noise', 'better_observation']
		},
		
		ui: {
			buttonClass: 'action-movement careful',
			showInCategories: ['MOVEMENT'],
			priority: 8
		}
	},
	
	MOVE_QUICK: {
		id: 'MOVE_QUICK',
		name: 'Move Quickly',
		category: 'MOVEMENT',
		baseCost: ACTION_COSTS.MOVE_QUICK,
		description: 'Move to a connected room with speed but less caution',
		requiresTarget: true,
		targetType: 'ROOM',
		icon: '🏃',
		
		requirements: {
			components: ['position'],
			conditions: []
		},
		
		effects: {
			worldState: ['position'],
			turnSystem: true,
			special: ['increased_noise', 'reduced_observation']
		},
		
		ui: {
			buttonClass: 'action-movement quick',
			showInCategories: ['MOVEMENT'],
			priority: 7
		}
	},
	
	// Interaction Actions
	EXAMINE: {
		id: 'EXAMINE',
		name: 'Examine',
		category: 'INTERACTION',
		baseCost: ACTION_COSTS.EXAMINE,
		description: 'Take a quick look at an object, character, or area',
		requiresTarget: true,
		targetType: 'ENTITY',
		icon: '👁️',
		
		requirements: {
			components: ['position'],
			conditions: ['target_visible']
		},
		
		effects: {
			worldState: [],  // Doesn't modify world state
			turnSystem: true,
			information: ['entity_description', 'visible_details']
		},
		
		ui: {
			buttonClass: 'action-interaction',
			showInCategories: ['CORE', 'INTERACTION'],
			priority: 9
		}
	},
	
	EXAMINE_THOROUGH: {
		id: 'EXAMINE_THOROUGH',
		name: 'Examine Thoroughly',
		category: 'INTERACTION',
		baseCost: ACTION_COSTS.EXAMINE_THOROUGH,
		description: 'Conduct a detailed examination of an object or area',
		requiresTarget: true,
		targetType: 'ENTITY',
		icon: '🔍',
		
		requirements: {
			components: ['position'],
			conditions: ['target_accessible']
		},
		
		effects: {
			worldState: [],
			turnSystem: true,
			information: ['detailed_description', 'hidden_details', 'condition_assessment']
		},
		
		ui: {
			buttonClass: 'action-interaction thorough',
			showInCategories: ['INTERACTION'],
			priority: 6
		}
	},
	
	SEARCH: {
		id: 'SEARCH',
		name: 'Search',
		category: 'INTERACTION',
		baseCost: ACTION_COSTS.SEARCH,
		description: 'Search a container or area for items',
		requiresTarget: true,
		targetType: 'SEARCHABLE',
		icon: '🔎',
		
		requirements: {
			components: ['position', 'inventory'],
			conditions: ['target_searchable']
		},
		
		effects: {
			worldState: ['inventory', 'target_state'],
			turnSystem: true,
			information: ['found_items', 'search_results']
		},
		
		ui: {
			buttonClass: 'action-interaction',
			showInCategories: ['CORE', 'INTERACTION'],
			priority: 8
		}
	},
	
	// Communication Actions
	RADIO_QUICK: {
		id: 'RADIO_QUICK',
		name: 'Quick Radio',
		category: 'COMMUNICATION',
		baseCost: ACTION_COSTS.RADIO_QUICK,
		description: 'Send a brief radio message',
		requiresTarget: false,
		targetType: null,
		icon: '📻',
		
		requirements: {
			components: [],
			conditions: ['has_radio']
		},
		
		effects: {
			worldState: ['communication_log'],
			turnSystem: true,
			information: ['message_sent']
		},
		
		ui: {
			buttonClass: 'action-communication',
			showInCategories: ['CORE', 'COMMUNICATION'],
			priority: 6
		}
	},
	
	LISTEN: {
		id: 'LISTEN',
		name: 'Listen',
		category: 'COMMUNICATION',
		baseCost: ACTION_COSTS.LISTEN,
		description: 'Listen carefully to the surroundings',
		requiresTarget: false,
		targetType: null,
		icon: '👂',
		
		requirements: {
			components: ['position'],
			conditions: []
		},
		
		effects: {
			worldState: [],
			turnSystem: true,
			information: ['audio_environment', 'detected_sounds']
		},
		
		ui: {
			buttonClass: 'action-communication',
			showInCategories: ['CORE', 'COMMUNICATION'],
			priority: 5
		}
	},
	
	// Utility Actions
	WAIT: {
		id: 'WAIT',
		name: 'Wait',
		category: 'UTILITY',
		baseCost: ACTION_COSTS.WAIT,
		description: 'Wait and observe, minimal time cost',
		requiresTarget: false,
		targetType: null,
		icon: '⏸️',
		
		requirements: {
			components: [],
			conditions: []
		},
		
		effects: {
			worldState: [],
			turnSystem: true,
			information: ['time_passage', 'environmental_changes']
		},
		
		ui: {
			buttonClass: 'action-utility',
			showInCategories: ['CORE', 'UTILITY'],
			priority: 1  // Low priority, always available
		}
	}
};

/**
 * Action categories for UI organization
 */
export const ACTION_CATEGORIES = {
	CORE: {
		name: 'Core Actions',
		description: 'Essential actions available to all characters',
		icon: '⭐',
		priority: 10,
		alwaysExpanded: true
	},
	
	MOVEMENT: {
		name: 'Movement',
		description: 'Actions for moving between locations',
		icon: '🚶',
		priority: 9,
		alwaysExpanded: false
	},
	
	INTERACTION: {
		name: 'Interaction',
		description: 'Actions for interacting with objects and environment',
		icon: '🤝',
		priority: 8,
		alwaysExpanded: false
	},
	
	COMMUNICATION: {
		name: 'Communication',
		description: 'Actions for gathering information and communicating',
		icon: '📡',
		priority: 7,
		alwaysExpanded: false
	},
	
	COMBAT: {
		name: 'Combat',
		description: 'Actions for combat situations',
		icon: '⚔️',
		priority: 6,
		alwaysExpanded: false
	},
	
	MEDICAL: {
		name: 'Medical',
		description: 'Actions for medical care and treatment',
		icon: '🏥',
		priority: 5,
		alwaysExpanded: false
	},
	
	TECHNICAL: {
		name: 'Technical',
		description: 'Actions for technical operations and repairs',
		icon: '🔧',
		priority: 4,
		alwaysExpanded: false
	},
	
	UTILITY: {
		name: 'Utility',
		description: 'Utility and miscellaneous actions',
		icon: '🛠️',
		priority: 3,
		alwaysExpanded: false
	}
};

/**
 * Target types that actions can interact with
 */
export const TARGET_TYPES = {
	ROOM: {
		name: 'Room',
		description: 'A location that can be moved to',
		validation: (world, entityId) => {
			// Must be a room entity
			return Boolean(world.components.isRoom?.[entityId]);
		}
	},
	
	ENTITY: {
		name: 'Entity',
		description: 'Any game entity (character, object, etc.)',
		validation: (world, entityId) => {
			// Any entity that exists
			return Boolean(world.metadata?.entities?.[entityId]);
		}
	},
	
	SEARCHABLE: {
		name: 'Searchable',
		description: 'An entity that can be searched for items',
		validation: (world, entityId) => {
			// Must have searchable properties (this will be expanded in later phases)
			return Boolean(world.components.isRoom?.[entityId] || world.components.isItem?.[entityId]);
		}
	},
	
	CHARACTER: {
		name: 'Character',
		description: 'A character entity (marine, survivor, etc.)',
		validation: (world, entityId) => {
			return Boolean(world.components.isMarine?.[entityId]);
		}
	}
};

/**
 * Get an action type definition by ID
 * @param {string} actionId - Action type ID
 * @returns {object|null} Action type definition or null if not found
 */
export function getActionType(actionId) {
	return ACTION_TYPES[actionId] || null;
}

/**
 * Get all action types in a specific category
 * @param {string} category - Category name
 * @returns {object[]} Array of action type definitions
 */
export function getActionsByCategory(category) {
	return Object.values(ACTION_TYPES).filter(action => 
		action.ui.showInCategories.includes(category)
	).sort((a, b) => (b.ui.priority || 0) - (a.ui.priority || 0));
}

/**
 * Get all available categories with their actions
 * @returns {object} Categories with their action lists
 */
export function getAllCategories() {
	const categories = {};
	
	for (const [categoryId, categoryInfo] of Object.entries(ACTION_CATEGORIES)) {
		categories[categoryId] = {
			...categoryInfo,
			actions: getActionsByCategory(categoryId)
		};
	}
	
	return categories;
}

/**
 * Check if an action type requires a target
 * @param {string} actionId - Action type ID
 * @returns {boolean} True if action requires a target
 */
export function actionRequiresTarget(actionId) {
	const actionType = getActionType(actionId);
	return actionType?.requiresTarget || false;
}

/**
 * Get the target type for an action
 * @param {string} actionId - Action type ID
 * @returns {string|null} Target type or null if no target required
 */
export function getActionTargetType(actionId) {
	const actionType = getActionType(actionId);
	return actionType?.targetType || null;
}

/**
 * Validate if a target is valid for an action
 * @param {object} world - The world object
 * @param {string} actionId - Action type ID
 * @param {number} targetEntityId - Target entity ID
 * @returns {boolean} True if target is valid for this action
 */
export function validateActionTarget(world, actionId, targetEntityId) {
	const actionType = getActionType(actionId);
	
	if (!actionType) {
		return false;
	}
	
	if (!actionType.requiresTarget) {
		return true;  // No target required, so any target (or null) is valid
	}
	
	if (!targetEntityId) {
		return false;  // Target required but not provided
	}
	
	const targetType = TARGET_TYPES[actionType.targetType];
	if (!targetType) {
		console.warn(`⚠️ Unknown target type: ${actionType.targetType}`);
		return false;
	}
	
	return targetType.validation(world, targetEntityId);
}

/**
 * Get human-readable action description with target
 * @param {string} actionId - Action type ID
 * @param {object} targetInfo - Target information (name, etc.)
 * @returns {string} Formatted action description
 */
export function getActionDescription(actionId, targetInfo = null) {
	const actionType = getActionType(actionId);
	if (!actionType) {
		return `Unknown action: ${actionId}`;
	}
	
	let description = actionType.name;
	
	if (actionType.requiresTarget && targetInfo) {
		description += ` ${targetInfo.name || targetInfo.entityId}`;
	}
	
	description += ` (${actionType.baseCost} ticks)`;
	
	return description;
}

/**
 * Debug function: Get complete action type information
 * @param {string} actionId - Action type ID
 * @returns {object} Complete action type debug info
 */
export function getActionDebugInfo(actionId) {
	const actionType = getActionType(actionId);
	if (!actionType) {
		return { error: `Action type not found: ${actionId}` };
	}
	
	return {
		...actionType,
		targetValidation: actionType.targetType ? TARGET_TYPES[actionType.targetType] : null,
		categoryInfo: ACTION_CATEGORIES[actionType.category] || null
	};
}
