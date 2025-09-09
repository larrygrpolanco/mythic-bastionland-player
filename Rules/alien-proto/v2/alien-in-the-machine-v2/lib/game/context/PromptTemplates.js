/**
 * PromptTemplates.js - Template System for Consistent Text
 * 
 * This module provides template components that compile to different formats
 * for UI and AI use. This ensures consistency between what humans see and 
 * what AI processes, eliminating divergence in game presentation.
 * 
 * Core Philosophy:
 * - Single source of truth for all game text
 * - Same templates compile to UI and AI formats
 * - Change once, update everywhere
 * - Rich, contextual descriptions
 */

/**
 * Character state description templates
 */
export const CHARACTER_TEMPLATES = {
	STATUS: {
		template: 'You are {name}, a {rank} in the Colonial Marines. Health: {health}%. Location: {roomName}. Speed: {speed}.',
		compile: (data) => {
			return CHARACTER_TEMPLATES.STATUS.template
				.replace('{name}', data.name || 'Unknown')
				.replace('{rank}', data.rank || 'Marine')
				.replace('{health}', Math.round(data.health || 100))
				.replace('{roomName}', data.roomName || 'Unknown Location')
				.replace('{speed}', data.speed || 5);
		}
	},
	
	CONDITION: {
		template: 'Your condition: {healthStatus}. You are {readyStatus}.',
		compile: (data) => {
			const healthStatus = data.health >= 90 ? 'excellent' : 
								data.health >= 70 ? 'good' :
								data.health >= 50 ? 'wounded' : 'badly wounded';
			
			const readyStatus = data.isReady ? 'ready to act' : `waiting ${data.ticksUntilReady} more ticks`;
			
			return CHARACTER_TEMPLATES.CONDITION.template
				.replace('{healthStatus}', healthStatus)
				.replace('{readyStatus}', readyStatus);
		}
	}
};

/**
 * Environment description templates
 */
export const ENVIRONMENT_TEMPLATES = {
	ROOM_DESCRIPTION: {
		template: 'You are in the {roomName}. {description} Lighting: {lighting}. Temperature: {temperature}°C.',
		compile: (data) => {
			return ENVIRONMENT_TEMPLATES.ROOM_DESCRIPTION.template
				.replace('{roomName}', data.roomName || 'Unknown Room')
				.replace('{description}', data.description || 'No description available.')
				.replace('{lighting}', data.lighting || 'normal')
				.replace('{temperature}', data.temperature || 20);
		}
	},
	
	EXITS: {
		template: 'Available exits: {exitList}.',
		compile: (data) => {
			if (!data.exits || data.exits.length === 0) {
				return 'No exits are visible.';
			}
			
			const exitDescriptions = data.exits.map(exit => 
				`${exit.direction} to ${exit.targetRoomName} (${exit.cost} ticks)`
			);
			
			return ENVIRONMENT_TEMPLATES.EXITS.template
				.replace('{exitList}', exitDescriptions.join(', '));
		}
	},
	
	ENTITIES: {
		template: 'Also present: {entityList}.',
		compile: (data) => {
			if (!data.entities || data.entities.length === 0) {
				return 'You are alone in this room.';
			}
			
			const entityDescriptions = data.entities.map(entity => entity.name);
			
			return ENVIRONMENT_TEMPLATES.ENTITIES.template
				.replace('{entityList}', entityDescriptions.join(', '));
		}
	}
};

/**
 * Action description templates
 */
export const ACTION_TEMPLATES = {
	MOVEMENT: {
		template: 'Move to {targetRoom} ({cost} ticks) - {description}',
		compile: (data) => {
			return ACTION_TEMPLATES.MOVEMENT.template
				.replace('{targetRoom}', data.targetRoomName || 'Unknown')
				.replace('{cost}', data.cost || 8)
				.replace('{description}', data.description || 'Travel to target location');
		}
	},
	
	EXAMINE: {
		template: 'Examine {target} ({cost} ticks) - {description}',
		compile: (data) => {
			return ACTION_TEMPLATES.EXAMINE.template
				.replace('{target}', data.targetName || 'Unknown')
				.replace('{cost}', data.cost || 2)
				.replace('{description}', data.description || 'Take a closer look');
		}
	},
	
	SEARCH: {
		template: 'Search {target} ({cost} ticks) - {description}',
		compile: (data) => {
			return ACTION_TEMPLATES.SEARCH.template
				.replace('{target}', data.targetName || 'area')
				.replace('{cost}', data.cost || 6)
				.replace('{description}', data.description || 'Look for items or clues');
		}
	},
	
	COMMUNICATION: {
		template: '{actionName} ({cost} ticks) - {description}',
		compile: (data) => {
			return ACTION_TEMPLATES.COMMUNICATION.template
				.replace('{actionName}', data.name || 'Communicate')
				.replace('{cost}', data.cost || 2)
				.replace('{description}', data.description || 'Send a message or listen');
		}
	}
};

/**
 * Turn system description templates
 */
export const TURN_TEMPLATES = {
	STATUS: {
		template: 'Game tick {gameTick}. {turnStatus} Queue position: {queuePosition}.',
		compile: (data) => {
			const turnStatus = data.isMyTurn ? 'It is your turn to act.' :
							  data.isReady ? 'You are ready to act.' :
							  `You must wait ${data.ticksUntilReady} more ticks.`;
			
			return TURN_TEMPLATES.STATUS.template
				.replace('{gameTick}', data.gameTick || 0)
				.replace('{turnStatus}', turnStatus)
				.replace('{queuePosition}', data.queuePosition || 'Unknown');
		}
	},
	
	NEXT_UP: {
		template: 'Next to act after you: {nextCharacters}.',
		compile: (data) => {
			if (!data.nextUp || data.nextUp.length === 0) {
				return 'No other characters are queued to act.';
			}
			
			const nextNames = data.nextUp.slice(0, 2).map(entry => entry.name);
			
			return TURN_TEMPLATES.NEXT_UP.template
				.replace('{nextCharacters}', nextNames.join(', '));
		}
	}
};

/**
 * AI prompt composition templates
 */
export const AI_PROMPT_TEMPLATES = {
	SITUATION_HEADER: {
		template: 'SITUATION ASSESSMENT:\n{characterStatus}\n{environmentStatus}\n{turnStatus}',
		compile: (context) => {
			const characterStatus = CHARACTER_TEMPLATES.STATUS.compile({
				name: context.character?.name,
				rank: context.character?.rank,
				health: context.character?.health?.percentage,
				roomName: context.environment?.currentRoom?.name,
				speed: context.character?.speed?.current
			});
			
			const environmentStatus = ENVIRONMENT_TEMPLATES.ROOM_DESCRIPTION.compile({
				roomName: context.environment?.currentRoom?.name,
				description: context.environment?.currentRoom?.description,
				lighting: context.environment?.currentRoom?.conditions?.lighting,
				temperature: context.environment?.currentRoom?.conditions?.temperature
			});
			
			const turnStatus = TURN_TEMPLATES.STATUS.compile({
				gameTick: context.turnSystem?.gameTick,
				isMyTurn: context.turnSystem?.isMyTurn,
				isReady: context.turnSystem?.isReady,
				ticksUntilReady: context.turnSystem?.ticksUntilReady,
				queuePosition: context.turnSystem?.queuePosition
			});
			
			return AI_PROMPT_TEMPLATES.SITUATION_HEADER.template
				.replace('{characterStatus}', characterStatus)
				.replace('{environmentStatus}', environmentStatus)
				.replace('{turnStatus}', turnStatus);
		}
	},
	
	AVAILABLE_ACTIONS: {
		template: 'AVAILABLE ACTIONS:\n{actionList}\n\nChoose your action carefully considering the tick cost and tactical situation.',
		compile: (context) => {
			if (!context.availableActions || context.availableActions.length === 0) {
				return 'No actions are currently available.';
			}
			
			const actionDescriptions = context.availableActions.map(action => 
				`- ${action.name} (${action.cost} ticks): ${action.description || 'No description'}`
			);
			
			return AI_PROMPT_TEMPLATES.AVAILABLE_ACTIONS.template
				.replace('{actionList}', actionDescriptions.join('\n'));
		}
	},
	
	RESPONSE_FORMAT: {
		template: 'RESPONSE FORMAT:\nRespond with JSON only:\n{\n  "action": "ACTION_TYPE",\n  "target": "target_id_or_null",\n  "reasoning": "why you chose this action",\n  "dialogue": "what your character says or thinks"\n}',
		compile: () => AI_PROMPT_TEMPLATES.RESPONSE_FORMAT.template
	}
};

/**
 * UI display templates
 */
export const UI_TEMPLATES = {
	ACTION_BUTTON: {
		template: '{actionName} ({cost} ticks)',
		compile: (data) => {
			return UI_TEMPLATES.ACTION_BUTTON.template
				.replace('{actionName}', data.name || 'Unknown Action')
				.replace('{cost}', data.cost || 0);
		}
	},
	
	CHARACTER_STATUS: {
		template: '{name} ({rank}) - Speed: {speed}, Timer: {timer}',
		compile: (data) => {
			return UI_TEMPLATES.CHARACTER_STATUS.template
				.replace('{name}', data.name || 'Unknown')
				.replace('{rank}', data.rank || 'Unknown')
				.replace('{speed}', data.speed || 0)
				.replace('{timer}', data.timer || 0);
		}
	},
	
	ROOM_TITLE: {
		template: '{roomName} ({lighting} lighting)',
		compile: (data) => {
			return UI_TEMPLATES.ROOM_TITLE.template
				.replace('{roomName}', data.roomName || 'Unknown Room')
				.replace('{lighting}', data.lighting || 'normal');
		}
	}
};

/**
 * Compile a complete AI prompt from context
 * @param {object} context - Decision context from ContextAssembler
 * @returns {string} Complete AI prompt
 */
export function compileAIPrompt(context) {
	const sections = [
		AI_PROMPT_TEMPLATES.SITUATION_HEADER.compile(context),
		'',
		ENVIRONMENT_TEMPLATES.EXITS.compile({
			exits: context.environment?.currentRoom?.exits
		}),
		'',
		ENVIRONMENT_TEMPLATES.ENTITIES.compile({
			entities: context.environment?.currentRoom?.entities
		}),
		'',
		AI_PROMPT_TEMPLATES.AVAILABLE_ACTIONS.compile(context),
		'',
		AI_PROMPT_TEMPLATES.RESPONSE_FORMAT.compile()
	];
	
	return sections.join('\n');
}

/**
 * Compile UI display text from context
 * @param {object} context - Decision context from ContextAssembler
 * @returns {object} UI display text components
 */
export function compileUIText(context) {
	return {
		characterStatus: CHARACTER_TEMPLATES.STATUS.compile({
			name: context.character?.name,
			rank: context.character?.rank,
			health: context.character?.health?.percentage,
			roomName: context.environment?.currentRoom?.name,
			speed: context.character?.speed?.current
		}),
		
		roomTitle: UI_TEMPLATES.ROOM_TITLE.compile({
			roomName: context.environment?.currentRoom?.name,
			lighting: context.environment?.currentRoom?.conditions?.lighting
		}),
		
		turnStatus: TURN_TEMPLATES.STATUS.compile({
			gameTick: context.turnSystem?.gameTick,
			isMyTurn: context.turnSystem?.isMyTurn,
			isReady: context.turnSystem?.isReady,
			ticksUntilReady: context.turnSystem?.ticksUntilReady,
			queuePosition: context.turnSystem?.queuePosition
		}),
		
		actionButtons: context.availableActions?.map(action => ({
			...action,
			displayText: UI_TEMPLATES.ACTION_BUTTON.compile({
				name: action.name,
				cost: action.cost
			})
		})) || []
	};
}

/**
 * Get template by path for dynamic compilation
 * @param {string} templatePath - Path like 'CHARACTER_TEMPLATES.STATUS'
 * @returns {object|null} Template object or null if not found
 */
export function getTemplate(templatePath) {
	const parts = templatePath.split('.');
	let current = { CHARACTER_TEMPLATES, ENVIRONMENT_TEMPLATES, ACTION_TEMPLATES, TURN_TEMPLATES, AI_PROMPT_TEMPLATES, UI_TEMPLATES };
	
	for (const part of parts) {
		if (current[part]) {
			current = current[part];
		} else {
			console.warn(`⚠️ Template not found: ${templatePath}`);
			return null;
		}
	}
	
	return current;
}

/**
 * Debug function: Test template compilation
 * @param {string} templatePath - Template path to test
 * @param {object} testData - Test data for compilation
 * @returns {string} Compiled template result
 */
export function debugCompileTemplate(templatePath, testData) {
	const template = getTemplate(templatePath);
	
	if (!template || !template.compile) {
		return `Error: Template ${templatePath} not found or not compilable`;
	}
	
	try {
		return template.compile(testData);
	} catch (error) {
		return `Error compiling template: ${error.message}`;
	}
}

/**
 * Get all template categories for debugging
 * @returns {string[]} Array of template category names
 */
export function getTemplateCategories() {
	return [
		'CHARACTER_TEMPLATES',
		'ENVIRONMENT_TEMPLATES', 
		'ACTION_TEMPLATES',
		'TURN_TEMPLATES',
		'AI_PROMPT_TEMPLATES',
		'UI_TEMPLATES'
	];
}
