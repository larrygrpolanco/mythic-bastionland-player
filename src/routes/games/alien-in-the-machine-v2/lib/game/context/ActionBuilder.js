/**
 * ActionBuilder.js - Context-Aware Action Generation
 * 
 * This module generates available actions based on current world state and character
 * context. Actions are dynamically generated rather than static lists, ensuring
 * human UI and AI context always match actual possibilities.
 * 
 * Core Philosophy:
 * - Actions generated from actual world state, not static lists
 * - Same action generation for human UI and AI context
 * - Rich action metadata for decision-making
 * - Context-sensitive availability and costs
 */

import { getComponent, hasComponent, getAllRooms, getRoomEntityByRoomId } from '../World.js';
import { getActionType, getActionsByCategory } from '../actions/ActionTypes.js';
import { calculateActionCost } from '../actions/ActionCosts.js';
import { ACTION_TEMPLATES, UI_TEMPLATES } from './PromptTemplates.js';

/**
 * Generate all available actions for a character based on current world state
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of available actions with full metadata
 */
export function generateAvailableActions(world, characterId) {
	console.log(`🎯 Generating available actions for character ${characterId}...`);
	
	const actions = [];
	
	// Get character context for action generation
	const character = getComponent(world, characterId, 'isMarine');
	const position = getComponent(world, characterId, 'position');
	const skills = getComponent(world, characterId, 'skills');
	
	if (!character || !position) {
		console.warn(`⚠️ Character ${characterId} missing required components for action generation`);
		return actions;
	}
	
	// Generate movement actions
	const movementActions = generateMovementActions(world, characterId);
	actions.push(...movementActions);
	
	// Generate interaction actions
	const interactionActions = generateInteractionActions(world, characterId);
	actions.push(...interactionActions);
	
	// Generate communication actions
	const communicationActions = generateCommunicationActions(world, characterId);
	actions.push(...communicationActions);
	
	// Generate utility actions (always available)
	const utilityActions = generateUtilityActions(world, characterId);
	actions.push(...utilityActions);
	
	console.log(`✅ Generated ${actions.length} available actions`);
	return actions;
}

/**
 * Generate movement actions based on current room connections
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of movement actions
 */
function generateMovementActions(world, characterId) {
	const actions = [];
	const position = getComponent(world, characterId, 'position');
	
	if (!position?.roomId) {
		return actions;
	}
	
	// Get current room entity
	const roomEntityId = getRoomEntityByRoomId(world, position.roomId);
	if (!roomEntityId) {
		return actions;
	}
	
	// Get room connections
	const doors = getComponent(world, roomEntityId, 'doors');
	if (!doors?.connections || doors.connections.length === 0) {
		return actions; // No exits available
	}
	
	// Generate action for each connected room
	for (const connection of doors.connections) {
		const targetRoomEntityId = getRoomEntityByRoomId(world, connection.targetRoomId);
		if (!targetRoomEntityId) {
			console.warn(`⚠️ Target room not found: ${connection.targetRoomId}`);
			continue;
		}
		
		const targetRoom = getComponent(world, targetRoomEntityId, 'isRoom');
		const environment = getEnvironmentForCharacter(world, characterId);
		
		// Generate standard move action
		const baseCost = calculateActionCost('MOVE', getCharacterSkillContext(world, characterId), environment);
		const moveActionText = ACTION_TEMPLATES.MOVEMENT.compile({
			targetRoomName: targetRoom?.name || connection.targetRoomId,
			cost: baseCost,
			description: `Travel to the ${targetRoom?.name || 'target room'}`
		});
		
		actions.push({
			id: `move_${connection.targetRoomId}`,
			type: 'MOVE',
			name: moveActionText,
			description: `Travel to the ${targetRoom?.name || 'target room'}`,
			category: 'MOVEMENT',
			cost: baseCost,
			target: targetRoomEntityId,
			
			// Rich metadata for AI and UI
			metadata: {
				targetRoomId: connection.targetRoomId,
				targetRoomName: targetRoom?.name || connection.targetRoomId,
				direction: connection.direction,
				distance: 'adjacent',
				estimatedTime: baseCost,
				riskLevel: 'low' // TODO: Calculate based on environment
			}
		});
		
		// Generate careful move action (higher cost, potentially safer)
		const carefulCost = calculateActionCost('MOVE_CAREFUL', getCharacterSkillContext(world, characterId), environment);
		const carefulActionText = ACTION_TEMPLATES.MOVEMENT.compile({
			targetRoomName: `${targetRoom?.name || connection.targetRoomId} (Carefully)`,
			cost: carefulCost,
			description: `Move cautiously to the ${targetRoom?.name || 'target room'}`
		});
		
		actions.push({
			id: `move_careful_${connection.targetRoomId}`,
			type: 'MOVE_CAREFUL',
			name: carefulActionText,
			description: `Move cautiously to the ${targetRoom?.name || 'target room'}`,
			category: 'MOVEMENT',
			cost: carefulCost,
			target: targetRoomEntityId,
			
			metadata: {
				targetRoomId: connection.targetRoomId,
				targetRoomName: targetRoom?.name || connection.targetRoomId,
				direction: connection.direction,
				distance: 'adjacent',
				estimatedTime: carefulCost,
				riskLevel: 'very_low',
				special: ['reduced_noise', 'better_observation']
			}
		});
		
		// Generate quick move action (lower cost, potentially riskier)
		const quickCost = calculateActionCost('MOVE_QUICK', getCharacterSkillContext(world, characterId), environment);
		const quickActionText = ACTION_TEMPLATES.MOVEMENT.compile({
			targetRoomName: `${targetRoom?.name || connection.targetRoomId} (Quickly)`,
			cost: quickCost,
			description: `Move rapidly to the ${targetRoom?.name || 'target room'}`
		});
		
		actions.push({
			id: `move_quick_${connection.targetRoomId}`,
			type: 'MOVE_QUICK', 
			name: quickActionText,
			description: `Move rapidly to the ${targetRoom?.name || 'target room'}`,
			category: 'MOVEMENT',
			cost: quickCost,
			target: targetRoomEntityId,
			
			metadata: {
				targetRoomId: connection.targetRoomId,
				targetRoomName: targetRoom?.name || connection.targetRoomId,
				direction: connection.direction,
				distance: 'adjacent',
				estimatedTime: quickCost,
				riskLevel: 'medium',
				special: ['increased_noise', 'reduced_observation']
			}
		});
	}
	
	return actions;
}

/**
 * Generate interaction actions based on entities in current room
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of interaction actions
 */
function generateInteractionActions(world, characterId) {
	const actions = [];
	const position = getComponent(world, characterId, 'position');
	
	if (!position?.roomId) {
		return actions;
	}
	
	// Find entities in the same room
	const entitiesInRoom = findInteractableEntities(world, position.roomId, characterId);
	const environment = getEnvironmentForCharacter(world, characterId);
	const characterSkills = getCharacterSkillContext(world, characterId);
	
	// Generate examine actions for all visible entities
	for (const entity of entitiesInRoom) {
		// Basic examine action
		const examineCost = calculateActionCost('EXAMINE', characterSkills, environment);
		const examineActionText = ACTION_TEMPLATES.EXAMINE.compile({
			targetName: entity.name,
			cost: examineCost,
			description: `Take a quick look at ${entity.name}`
		});
		
		actions.push({
			id: `examine_${entity.entityId}`,
			type: 'EXAMINE',
			name: examineActionText,
			description: `Take a quick look at ${entity.name}`,
			category: 'INTERACTION',
			cost: examineCost,
			target: entity.entityId,
			
			metadata: {
				targetName: entity.name,
				targetType: entity.type,
				estimatedTime: examineCost,
				informationValue: 'basic'
			}
		});
		
		// Thorough examine action
		const thoroughCost = calculateActionCost('EXAMINE_THOROUGH', characterSkills, environment);
		const thoroughActionText = ACTION_TEMPLATES.EXAMINE.compile({
			targetName: `${entity.name} (Thorough)`,
			cost: thoroughCost,
			description: `Conduct a detailed examination of ${entity.name}`
		});
		
		actions.push({
			id: `examine_thorough_${entity.entityId}`,
			type: 'EXAMINE_THOROUGH',
			name: thoroughActionText,
			description: `Conduct a detailed examination of ${entity.name}`,
			category: 'INTERACTION',
			cost: thoroughCost,
			target: entity.entityId,
			
			metadata: {
				targetName: entity.name,
				targetType: entity.type,
				estimatedTime: thoroughCost,
				informationValue: 'detailed'
			}
		});
	}
	
	// Generate search action for current room
	const roomEntityId = getRoomEntityByRoomId(world, position.roomId);
	if (roomEntityId) {
		const room = getComponent(world, roomEntityId, 'isRoom');
		const searchCost = calculateActionCost('SEARCH', characterSkills, environment);
		const searchActionText = ACTION_TEMPLATES.SEARCH.compile({
			targetName: room?.name || 'Room',
			cost: searchCost,
			description: `Search the ${room?.name || 'current room'} for items`
		});
		
		actions.push({
			id: `search_room_${position.roomId}`,
			type: 'SEARCH',
			name: searchActionText,
			description: `Search the ${room?.name || 'current room'} for items`,
			category: 'INTERACTION',
			cost: searchCost,
			target: roomEntityId,
			
			metadata: {
				targetName: room?.name || 'Room',
				targetType: 'room',
				estimatedTime: searchCost,
				searchType: 'general'
			}
		});
	}
	
	return actions;
}

/**
 * Generate communication actions
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of communication actions
 */
function generateCommunicationActions(world, characterId) {
	const actions = [];
	const environment = getEnvironmentForCharacter(world, characterId);
	const characterSkills = getCharacterSkillContext(world, characterId);
	
	// Quick radio communication
	const radioCost = calculateActionCost('RADIO_QUICK', characterSkills, environment);
	const radioActionText = ACTION_TEMPLATES.COMMUNICATION.compile({
		actionName: 'Quick Radio Message',
		cost: radioCost,
		description: 'Send a brief radio message to the team'
	});
	
	actions.push({
		id: 'radio_quick',
		type: 'RADIO_QUICK',
		name: radioActionText,
		description: 'Send a brief radio message to the team',
		category: 'COMMUNICATION',
		cost: radioCost,
		target: null,
		
		metadata: {
			communicationType: 'radio',
			messageLength: 'brief',
			estimatedTime: radioCost
		}
	});
	
	// Listen to surroundings
	const listenCost = calculateActionCost('LISTEN', characterSkills, environment);
	const listenActionText = ACTION_TEMPLATES.COMMUNICATION.compile({
		actionName: 'Listen Carefully',
		cost: listenCost,
		description: 'Listen to your surroundings for important sounds'
	});
	
	actions.push({
		id: 'listen',
		type: 'LISTEN',
		name: listenActionText,
		description: 'Listen to your surroundings for important sounds',
		category: 'COMMUNICATION',
		cost: listenCost,
		target: null,
		
		metadata: {
			perceptionType: 'audio',
			informationValue: 'environmental',
			estimatedTime: listenCost
		}
	});
	
	return actions;
}

/**
 * Generate utility actions (always available)
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of utility actions
 */
function generateUtilityActions(world, characterId) {
	const actions = [];
	const environment = getEnvironmentForCharacter(world, characterId);
	const characterSkills = getCharacterSkillContext(world, characterId);
	
	// Wait action - always available
	const waitCost = calculateActionCost('WAIT', characterSkills, environment);
	actions.push({
		id: 'wait',
		type: 'WAIT',
		name: 'Wait',
		description: 'Wait and observe, minimal time cost',
		category: 'UTILITY',
		cost: waitCost,
		target: null,
		
		metadata: {
			actionType: 'passive',
			estimatedTime: waitCost,
			alwaysAvailable: true
		}
	});
	
	return actions;
}

/**
 * Find all interactable entities in the same room as character
 * @param {object} world - The world object  
 * @param {string} roomId - Room ID to search in
 * @param {number} excludeCharacterId - Character ID to exclude
 * @returns {object[]} Array of interactable entity information
 */
function findInteractableEntities(world, roomId, excludeCharacterId) {
	const entities = [];
	
	// Find other marines in the room
	const marineEntityIds = Object.keys(world.components.isMarine || {}).map(Number);
	
	for (const entityId of marineEntityIds) {
		if (entityId === excludeCharacterId) continue;
		
		const position = getComponent(world, entityId, 'position');
		if (position?.roomId === roomId) {
			const marine = getComponent(world, entityId, 'isMarine');
			entities.push({
				entityId,
				type: 'marine',
				name: marine?.name || 'Unknown Marine',
				description: `${marine?.rank || 'Marine'} ${marine?.name || 'Unknown'}`
			});
		}
	}
	
	// TODO: In future phases, add items, furniture, containers, etc.
	// For now, just return marines
	
	return entities;
}

/**
 * Get environment context for a character's current position
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Environment data for cost calculations
 */
function getEnvironmentForCharacter(world, characterId) {
	const position = getComponent(world, characterId, 'position');
	
	if (!position?.roomId) {
		return { lighting: 'normal', hazards: [] };
	}
	
	const roomEntityId = getRoomEntityByRoomId(world, position.roomId);
	if (!roomEntityId) {
		return { lighting: 'normal', hazards: [] };
	}
	
	const environment = getComponent(world, roomEntityId, 'environment');
	return {
		lighting: environment?.lighting || 'normal',
		hazards: environment?.hazards || [],
		atmosphere: environment?.atmosphere || 'normal',
		temperature: environment?.temperature || 20
	};
}

/**
 * Get character skill context for cost calculations
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Character skill context
 */
function getCharacterSkillContext(world, characterId) {
	const marine = getComponent(world, characterId, 'isMarine');
	const skills = getComponent(world, characterId, 'skills');
	
	return {
		name: marine?.name || 'Unknown',
		skills: {
			technical: skills?.technical || 3,
			combat: skills?.combat || 3,
			medical: skills?.medical || 3
		}
	};
}

/**
 * Generate actions for a specific category
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {string} category - Action category to generate
 * @returns {object[]} Array of actions in the specified category
 */
export function generateActionsByCategory(world, characterId, category) {
	const allActions = generateAvailableActions(world, characterId);
	return allActions.filter(action => action.category === category);
}

/**
 * Get actions organized by category for UI display
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Actions organized by category
 */
export function getActionsForUI(world, characterId) {
	const allActions = generateAvailableActions(world, characterId);
	
	const categorized = {
		CORE: [],
		MOVEMENT: [],
		INTERACTION: [],
		COMMUNICATION: [],
		COMBAT: [],
		MEDICAL: [],
		TECHNICAL: [],
		UTILITY: []
	};
	
	// Categorize actions
	for (const action of allActions) {
		const category = action.category || 'UTILITY';
		if (categorized[category]) {
			categorized[category].push(action);
		}
	}
	
	// Add actions to CORE category based on priority
	const coreActions = [
		...categorized.MOVEMENT.slice(0, 1), // First movement option
		...categorized.INTERACTION.slice(0, 2), // First two interaction options
		...categorized.COMMUNICATION.slice(0, 1), // First communication option
		...categorized.UTILITY // All utility actions
	];
	
	categorized.CORE = coreActions;
	
	return categorized;
}

/**
 * Debug function: Get detailed action generation information
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Debug information about action generation
 */
export function debugGenerateActions(world, characterId) {
	console.group(`🔍 Debug action generation for character ${characterId}`);
	
	const character = getComponent(world, characterId, 'isMarine');
	const position = getComponent(world, characterId, 'position');
	const environment = getEnvironmentForCharacter(world, characterId);
	
	console.log('Character:', character?.name || 'Unknown');
	console.log('Position:', position?.roomId || 'Unknown');
	console.log('Environment:', environment);
	
	const actions = generateAvailableActions(world, characterId);
	console.log(`Generated ${actions.length} actions:`);
	
	actions.forEach(action => {
		console.log(`  - ${action.name} (${action.type}) - ${action.cost} ticks`);
	});
	
	console.groupEnd();
	
	return {
		characterId,
		character: character?.name || 'Unknown',
		position: position?.roomId || 'Unknown',
		environment,
		actionCount: actions.length,
		actions: actions.map(a => ({
			id: a.id,
			type: a.type,
			name: a.name,
			cost: a.cost,
			category: a.category
		}))
	};
}
