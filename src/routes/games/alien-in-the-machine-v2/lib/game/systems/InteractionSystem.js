/**
 * InteractionSystem.js - Entity Interaction Logic
 * 
 * This system handles all character interactions with entities and the environment,
 * including examining objects, searching containers, and using items.
 * 
 * Core Philosophy:
 * - Pure interaction logic, no turn system integration (handled by ActionSystem)
 * - Provides rich, contextual information based on character skills
 * - Updates world state when interactions discover or modify things
 * - Same interaction rules for human and AI characters
 */

import { getComponent, hasComponent, getEntitiesWithComponent } from '../World.js';

/**
 * Execute an examine action
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} actionData - Validated action data from ActionValidator
 * @returns {object} Examination result
 */
export function executeExamine(world, characterId, actionData) {
	console.log(`👁️ Executing examine: ${actionData.character.name} examining target ${actionData.target}`);
	
	// Get character skills for contextual examination
	const characterSkills = getComponent(world, characterId, 'skills');
	const character = getComponent(world, characterId, 'isMarine');
	
	// Determine what kind of entity we're examining
	const targetInfo = identifyTarget(world, actionData.target);
	if (!targetInfo.found) {
		return {
			success: false,
			errors: ['Target entity not found or not examinable'],
			type: 'target_not_found'
		};
	}
	
	// Generate examination results based on target type and thoroughness
	const examinationResults = generateExaminationResults(
		world, 
		characterId, 
		actionData.target, 
		targetInfo,
		actionData.type === 'EXAMINE_THOROUGH'
	);
	
	// Create result
	const result = {
		success: true,
		targetType: targetInfo.type,
		targetName: targetInfo.name,
		characterName: character.name,
		examinationType: actionData.type,
		information: examinationResults.information,
		discoveries: examinationResults.discoveries,
		message: generateExaminationMessage(character.name, targetInfo.name, actionData.type),
		skillModifiers: examinationResults.skillModifiers
	};
	
	console.log(`✅ Examination successful: ${result.message}`);
	return result;
}

/**
 * Execute a search action
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {object} actionData - Validated action data from ActionValidator
 * @returns {object} Search result
 */
export function executeSearch(world, characterId, actionData) {
	console.log(`🔎 Executing search: ${actionData.character.name} searching target ${actionData.target}`);
	
	// Get character information
	const characterSkills = getComponent(world, characterId, 'skills');
	const character = getComponent(world, characterId, 'isMarine');
	
	// Identify search target
	const targetInfo = identifyTarget(world, actionData.target);
	if (!targetInfo.found) {
		return {
			success: false,
			errors: ['Target not found or not searchable'],
			type: 'target_not_found'
		};
	}
	
	// Generate search results
	const searchResults = generateSearchResults(
		world,
		characterId,
		actionData.target,
		targetInfo,
		actionData.type === 'SEARCH_THOROUGH'
	);
	
	// Apply any discovered items or changes to world state
	const stateChanges = applySearchStateChanges(world, actionData.target, searchResults);
	
	// Create result
	const result = {
		success: true,
		targetType: targetInfo.type,
		targetName: targetInfo.name,
		characterName: character.name,
		searchType: actionData.type,
		itemsFound: searchResults.itemsFound,
		cluesFound: searchResults.cluesFound,
		stateChanges,
		message: generateSearchMessage(character.name, targetInfo.name, searchResults),
		searchComplete: searchResults.exhausted
	};
	
	console.log(`✅ Search successful: ${result.message}`);
	return result;
}

/**
 * Identify what type of entity we're interacting with
 * @param {object} world - The world object
 * @param {number} targetEntityId - Target entity ID
 * @returns {object} Target identification info
 */
function identifyTarget(world, targetEntityId) {
	// Check if it's a marine
	if (hasComponent(world, targetEntityId, 'isMarine')) {
		const marine = getComponent(world, targetEntityId, 'isMarine');
		return {
			found: true,
			type: 'marine',
			name: marine.name,
			component: marine
		};
	}
	
	// Check if it's a room
	if (hasComponent(world, targetEntityId, 'isRoom')) {
		const room = getComponent(world, targetEntityId, 'isRoom');
		return {
			found: true,
			type: 'room',
			name: room.name,
			component: room
		};
	}
	
	// Check if it's an item (for future phases)
	if (hasComponent(world, targetEntityId, 'isItem')) {
		const item = getComponent(world, targetEntityId, 'isItem');
		return {
			found: true,
			type: 'item',
			name: item.name,
			component: item
		};
	}
	
	return {
		found: false,
		type: 'unknown',
		name: 'Unknown Entity'
	};
}

/**
 * Generate examination results based on target and character skills
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {number} targetEntityId - Target entity ID
 * @param {object} targetInfo - Target identification info
 * @param {boolean} thorough - Whether this is a thorough examination
 * @returns {object} Examination results
 */
function generateExaminationResults(world, characterId, targetEntityId, targetInfo, thorough) {
	const characterSkills = getComponent(world, characterId, 'skills') || {};
	const information = [];
	const discoveries = [];
	const skillModifiers = [];
	
	switch (targetInfo.type) {
		case 'marine':
			// Examining another marine
			const health = getComponent(world, targetEntityId, 'health');
			const equipment = getComponent(world, targetEntityId, 'inventory');
			
			information.push(`${targetInfo.name} is a ${targetInfo.component.rank} in the Colonial Marines.`);
			
			if (health) {
				const healthPercent = Math.round((health.current / health.max) * 100);
				if (healthPercent >= 90) {
					information.push('They appear to be in excellent health.');
				} else if (healthPercent >= 70) {
					information.push('They appear to be in good condition with minor wear.');
				} else if (healthPercent >= 50) {
					information.push('They show signs of injury or fatigue.');
				} else {
					information.push('They appear to be badly wounded.');
				}
				
				// Medical skill provides more detailed health information
				if (characterSkills.medical >= 4 && thorough) {
					information.push(`Medical assessment: ${health.current}/${health.max} health points.`);
					skillModifiers.push('medical_insight');
				}
			}
			
			if (thorough && equipment) {
				information.push(`They are carrying ${equipment.items.length} items.`);
			}
			break;
			
		case 'room':
			// Examining a room
			const environment = getComponent(world, targetEntityId, 'environment');
			const doors = getComponent(world, targetEntityId, 'doors');
			
			information.push(`The ${targetInfo.name}: ${targetInfo.component.description || 'A standard room.'}`);
			
			if (environment) {
				information.push(`Lighting: ${environment.lighting}. Temperature: ${environment.temperature}°C.`);
				
				if (environment.hazards && environment.hazards.length > 0) {
					information.push(`Hazards detected: ${environment.hazards.join(', ')}.`);
				} else {
					information.push('No obvious hazards detected.');
				}
				
				// Technical skill provides environmental details
				if (characterSkills.technical >= 3) {
					information.push(`Atmosphere: ${environment.atmosphere}. Air quality appears normal.`);
					skillModifiers.push('technical_analysis');
				}
			}
			
			if (thorough && doors) {
				const exitCount = doors.connections.length;
				information.push(`This room has ${exitCount} visible exit${exitCount === 1 ? '' : 's'}.`);
			}
			
			// Look for other entities in the room
			if (thorough) {
				const position = getComponent(world, targetEntityId, 'position');
				if (position) {
					// TODO: In future phases, look for items, furniture, etc.
					discoveries.push('room_thoroughly_examined');
				}
			}
			break;
			
		case 'item':
			// TODO: Implement item examination for future phases
			information.push(`${targetInfo.name}: An item that requires closer inspection.`);
			break;
			
		default:
			information.push('You examine the entity but cannot determine much about it.');
	}
	
	return {
		information,
		discoveries,
		skillModifiers
	};
}

/**
 * Generate search results
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @param {number} targetEntityId - Target entity ID
 * @param {object} targetInfo - Target identification info
 * @param {boolean} thorough - Whether this is a thorough search
 * @returns {object} Search results
 */
function generateSearchResults(world, characterId, targetEntityId, targetInfo, thorough) {
	const characterSkills = getComponent(world, characterId, 'skills') || {};
	const itemsFound = [];
	const cluesFound = [];
	let exhausted = false;
	
	// For now, generate placeholder search results
	// In future phases, this will be based on actual searchable content
	
	switch (targetInfo.type) {
		case 'room':
			// Searching a room might reveal hidden items or information
			if (Math.random() < 0.3) { // 30% chance to find something
				cluesFound.push('You notice some interesting scratches on the wall.');
			}
			
			if (thorough && Math.random() < 0.5) { // 50% chance for thorough search
				cluesFound.push('A thorough search reveals traces of recent activity.');
			}
			
			// Technical skill improves search effectiveness
			if (characterSkills.technical >= 4) {
				cluesFound.push('Your technical knowledge reveals hidden maintenance access panels.');
			}
			
			exhausted = thorough; // Thorough search exhausts the location
			break;
			
		case 'marine':
			// Cannot search other characters (would need different action)
			cluesFound.push('You cannot search another marine without their permission.');
			break;
			
		default:
			cluesFound.push('Your search yields no significant results.');
	}
	
	return {
		itemsFound,
		cluesFound,
		exhausted
	};
}

/**
 * Apply search results to world state
 * @param {object} world - The world object
 * @param {number} targetEntityId - Target entity ID
 * @param {object} searchResults - Search results to apply
 * @returns {object[]} Array of state changes made
 */
function applySearchStateChanges(world, targetEntityId, searchResults) {
	const stateChanges = [];
	
	// TODO: In future phases, this will:
	// - Add discovered items to character inventory
	// - Mark locations as searched
	// - Update environmental conditions
	// - Trigger events based on discoveries
	
	if (searchResults.exhausted) {
		// Mark target as thoroughly searched (future component)
		stateChanges.push({
			type: 'marked_searched',
			targetEntityId,
			timestamp: Date.now()
		});
	}
	
	return stateChanges;
}

/**
 * Generate human-readable examination message
 * @param {string} characterName - Character performing examination
 * @param {string} targetName - Target being examined
 * @param {string} examinationType - Type of examination
 * @returns {string} Examination message
 */
function generateExaminationMessage(characterName, targetName, examinationType) {
	switch (examinationType) {
		case 'EXAMINE_THOROUGH':
			return `${characterName} thoroughly examined ${targetName}`;
		case 'EXAMINE':
		default:
			return `${characterName} examined ${targetName}`;
	}
}

/**
 * Generate human-readable search message
 * @param {string} characterName - Character performing search
 * @param {string} targetName - Target being searched
 * @param {object} searchResults - Search results
 * @returns {string} Search message
 */
function generateSearchMessage(characterName, targetName, searchResults) {
	const totalFound = searchResults.itemsFound.length + searchResults.cluesFound.length;
	
	if (totalFound === 0) {
		return `${characterName} searched ${targetName} but found nothing of interest`;
	} else if (totalFound === 1) {
		return `${characterName} searched ${targetName} and found something interesting`;
	} else {
		return `${characterName} searched ${targetName} and found ${totalFound} things of interest`;
	}
}

/**
 * Get all examinable entities in the same room as character
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object[]} Array of examinable entities
 */
export function getExaminableEntities(world, characterId) {
	const entities = [];
	const position = getComponent(world, characterId, 'position');
	
	if (!position?.roomId) {
		return entities;
	}
	
	// Find other marines in the same room
	const marineEntityIds = getEntitiesWithComponent(world, 'isMarine');
	for (const entityId of marineEntityIds) {
		if (entityId === characterId) continue; // Skip self
		
		const otherPosition = getComponent(world, entityId, 'position');
		if (otherPosition?.roomId === position.roomId) {
			const marine = getComponent(world, entityId, 'isMarine');
			entities.push({
				entityId,
				type: 'marine',
				name: marine.name,
				description: `${marine.rank} ${marine.name}`
			});
		}
	}
	
	// TODO: In future phases, add items, furniture, etc.
	
	return entities;
}

/**
 * Check if an entity can be searched
 * @param {object} world - The world object
 * @param {number} entityId - Entity ID to check
 * @returns {boolean} True if entity is searchable
 */
export function isSearchable(world, entityId) {
	// For now, rooms are searchable, marines are not (without permission)
	return hasComponent(world, entityId, 'isRoom');
}

/**
 * Debug function: Get interaction information for a character
 * @param {object} world - The world object
 * @param {number} characterId - Character entity ID
 * @returns {object} Interaction debug info
 */
export function debugInteractionInfo(world, characterId) {
	const character = getComponent(world, characterId, 'isMarine');
	const skills = getComponent(world, characterId, 'skills');
	
	console.group(`🔍 Interaction debug for ${character?.name || characterId}`);
	
	const info = {
		characterId,
		characterName: character?.name || 'Unknown',
		skills: skills || {},
		examinableEntities: getExaminableEntities(world, characterId),
		searchableEntities: getExaminableEntities(world, characterId).filter(entity => 
			isSearchable(world, entity.entityId)
		)
	};
	
	console.log('Character skills:', info.skills);
	console.log('Examinable entities:', info.examinableEntities);
	console.log('Searchable entities:', info.searchableEntities);
	
	console.groupEnd();
	
	return info;
}
