/**
 * MissionSystem.js - Mission Objectives and Win/Loss Conditions
 * 
 * Session 3.1: Mission System Implementation for complete game loop
 * 
 * Core Philosophy:
 * - Missions provide clear objectives that guide both human and AI decision-making
 * - Dynamic objectives that can evolve based on discoveries and world state
 * - Win/loss conditions that create meaningful game conclusions
 * - Integration with context assembly to inform decision-making
 * 
 * Key Innovation: Mission-Aware Decision Pipeline
 * - Both human UI and AI receive mission context in their decision information
 * - Objectives influence AI tactical reasoning and human strategic planning
 * - Mission state tracked through ECS components for consistency
 */

import { getComponent, setComponent, hasComponent, getEntitiesWithComponent } from '../World.js';

/**
 * Mission objective types and their evaluation logic
 */
export const OBJECTIVE_TYPES = {
	REACH_LOCATION: {
		name: 'Reach Location',
		description: 'Get a character to a specific location',
		evaluate: (world, objective) => {
			const { targetCharacterId, targetRoomId } = objective.parameters;
			if (!targetCharacterId || !targetRoomId) return false;
			
			const position = getComponent(world, targetCharacterId, 'position');
			return position?.roomId === targetRoomId;
		}
	},
	
	EXAMINE_TARGET: {
		name: 'Examine Target',
		description: 'Examine a specific entity or location',
		evaluate: (world, objective) => {
			const { targetEntityId, requiredCharacterId } = objective.parameters;
			if (!targetEntityId) return false;
			
			// Check if the target has been examined by looking for examination history
			const examineHistory = getComponent(world, targetEntityId, 'examinationHistory');
			if (!examineHistory) return false;
			
			// If specific character required, check they did the examination
			if (requiredCharacterId) {
				return examineHistory.examinedBy?.includes(requiredCharacterId) || false;
			}
			
			// Otherwise, any examination counts
			return examineHistory.examined === true;
		}
	},
	
	SEARCH_LOCATION: {
		name: 'Search Location',
		description: 'Thoroughly search a specific location',
		evaluate: (world, objective) => {
			const { targetRoomId } = objective.parameters;
			if (!targetRoomId) return false;
			
			// Find room entity by ID
			const roomEntities = getEntitiesWithComponent(world, 'isRoom');
			const roomEntity = roomEntities.find(entityId => {
				const room = getComponent(world, entityId, 'isRoom');
				return room?.id === targetRoomId;
			});
			
			if (!roomEntity) return false;
			
			// Check if room has been searched
			const searchHistory = getComponent(world, roomEntity, 'searchHistory');
			return searchHistory?.searched === true;
		}
	},
	
	SURVIVE_TIME: {
		name: 'Survive Time',
		description: 'Keep all characters alive for a specific duration',
		evaluate: (world, objective) => {
			const { targetTicks } = objective.parameters;
			const currentTick = world.turnSystem?.gameTick || 0;
			
			// Check if we've reached target time
			if (currentTick < targetTicks) return false;
			
			// Check if all marines are still alive (health > 0)
			const marineEntities = getEntitiesWithComponent(world, 'isMarine');
			for (const marineId of marineEntities) {
				const health = getComponent(world, marineId, 'health');
				if (!health || health.current <= 0) {
					return false;
				}
			}
			
			return true;
		}
	},
	
	TEAM_COMMUNICATION: {
		name: 'Team Communication',
		description: 'Ensure team members communicate effectively',
		evaluate: (world, objective) => {
			const { minimumMessages } = objective.parameters;
			
			// Check communication history (this would be tracked by communication actions)
			const missionData = getComponent(world, 1, 'missionData'); // Entity 1 is mission data holder
			const messageCount = missionData?.communicationCount || 0;
			
			return messageCount >= (minimumMessages || 3);
		}
	}
};

/**
 * Mission failure conditions
 */
export const FAILURE_CONDITIONS = {
	CHARACTER_DEATH: {
		name: 'Character Death',
		description: 'Mission fails if any character dies',
		evaluate: (world) => {
			const marineEntities = getEntitiesWithComponent(world, 'isMarine');
			for (const marineId of marineEntities) {
				const health = getComponent(world, marineId, 'health');
				if (!health || health.current <= 0) {
					return {
						failed: true,
						reason: `${getComponent(world, marineId, 'isMarine')?.name || 'A marine'} has died`
					};
				}
			}
			return { failed: false };
		}
	},
	
	TIME_LIMIT: {
		name: 'Time Limit',
		description: 'Mission fails if time runs out',
		evaluate: (world, condition) => {
			const { maxTicks } = condition.parameters;
			const currentTick = world.turnSystem?.gameTick || 0;
			
			if (currentTick >= maxTicks) {
				return {
					failed: true,
					reason: `Time limit exceeded (${currentTick}/${maxTicks} ticks)`
				};
			}
			return { failed: false };
		}
	},
	
	CRITICAL_FAILURE: {
		name: 'Critical Failure',
		description: 'Mission fails due to specific critical event',
		evaluate: (world, condition) => {
			// Check for critical failure flags set by other systems
			const missionData = getComponent(world, 1, 'missionData');
			if (missionData?.criticalFailure) {
				return {
					failed: true,
					reason: missionData.criticalFailure.reason || 'Critical mission failure'
				};
			}
			return { failed: false };
		}
	}
};

/**
 * Initialize mission system with objectives and conditions
 * @param {object} world - The world object
 * @param {object} missionConfig - Mission configuration
 * @returns {object} Result with success status
 */
export function initializeMissionSystem(world, missionConfig = null) {
	console.log('🎯 Initializing mission system...');
	
	// Use default mission if none provided
	const mission = missionConfig || createDefaultMission();
	
	// Create mission data entity (entity ID 1 reserved for mission data)
	const missionEntityId = 1;
	
	// Initialize mission components
	if (!world.components.missionData) {
		world.components.missionData = {};
	}
	
	if (!world.components.missionObjectives) {
		world.components.missionObjectives = {};
	}
	
	if (!world.components.missionConditions) {
		world.components.missionConditions = {};
	}
	
	// Set up mission data
	world.components.missionData[missionEntityId] = {
		missionId: mission.id,
		title: mission.title,
		description: mission.description,
		briefing: mission.briefing,
		status: 'ACTIVE', // ACTIVE, SUCCESS, FAILURE
		startTick: world.turnSystem?.gameTick || 0,
		completedObjectives: [],
		communicationCount: 0,
		discoveryCount: 0,
		searchCount: 0,
		lastUpdate: world.turnSystem?.gameTick || 0
	};
	
	// Set up objectives
	world.components.missionObjectives[missionEntityId] = {
		primary: mission.objectives.primary.map((obj, index) => ({
			id: `primary_${index}`,
			...obj,
			completed: false,
			completedAt: null,
			progress: 0
		})),
		secondary: (mission.objectives.secondary || []).map((obj, index) => ({
			id: `secondary_${index}`,
			...obj,
			completed: false,
			completedAt: null,
			progress: 0
		}))
	};
	
	// Set up failure conditions
	world.components.missionConditions[missionEntityId] = {
		failureConditions: mission.conditions.failure.map((condition, index) => ({
			id: `failure_${index}`,
			...condition,
			triggered: false,
			triggeredAt: null
		}))
	};
	
	console.log(`✅ Mission system initialized: "${mission.title}"`);
	console.log(`🎯 Primary objectives: ${mission.objectives.primary.length}`);
	console.log(`🎯 Secondary objectives: ${mission.objectives.secondary?.length || 0}`);
	console.log(`⚠️ Failure conditions: ${mission.conditions.failure.length}`);
	
	return { 
		success: true, 
		missionId: mission.id,
		title: mission.title
	};
}

/**
 * Create default mission for testing and demonstration
 * @returns {object} Default mission configuration
 */
function createDefaultMission() {
	return {
		id: 'first_contact',
		title: 'First Contact Protocol',
		description: 'Investigate the station and establish communication protocols',
		briefing: 'Your team has boarded the research station. Investigate the environment, establish team communication, and ensure all areas are properly surveyed. Work together to complete the mission objectives.',
		
		objectives: {
			primary: [
				{
					type: 'TEAM_COMMUNICATION',
					title: 'Establish Communication',
					description: 'Team members must communicate at least 3 times',
					parameters: { minimumMessages: 3 },
					priority: 'high',
					hint: 'Use radio messages to coordinate with your team'
				},
				{
					type: 'SEARCH_LOCATION',
					title: 'Survey Medical Bay',
					description: 'Conduct a thorough search of the Medical Bay',
					parameters: { targetRoomId: 'medical_bay' },
					priority: 'high',
					hint: 'Someone needs to search the Medical Bay thoroughly'
				},
				{
					type: 'REACH_LOCATION',
					title: 'Secure Command Bridge',
					description: 'Get a team member to the Command Bridge',
					parameters: { targetRoomId: 'command_bridge' },
					priority: 'medium',
					hint: 'The Command Bridge needs to be reached and secured'
				}
			],
			secondary: [
				{
					type: 'EXAMINE_TARGET',
					title: 'Equipment Assessment',
					description: 'Examine another team member to assess their condition',
					parameters: {},
					priority: 'low',
					hint: 'Check on your teammates\' status and equipment'
				},
				{
					type: 'SURVIVE_TIME',
					title: 'Mission Duration',
					description: 'Complete mission within reasonable time (50 ticks)',
					parameters: { targetTicks: 50 },
					priority: 'low',
					hint: 'Complete objectives efficiently'
				}
			]
		},
		
		conditions: {
			failure: [
				{
					type: 'CHARACTER_DEATH',
					title: 'Marine Casualty',
					description: 'Mission fails if any marine dies',
					parameters: {}
				},
				{
					type: 'TIME_LIMIT',
					title: 'Mission Timeout',
					description: 'Mission fails if time limit is exceeded',
					parameters: { maxTicks: 100 }
				}
			]
		}
	};
}

/**
 * Update mission status and check objectives
 * @param {object} world - The world object
 * @returns {object} Mission update result
 */
export function updateMissionStatus(world) {
	const missionEntityId = 1;
	const missionData = getComponent(world, missionEntityId, 'missionData');
	const objectives = getComponent(world, missionEntityId, 'missionObjectives');
	const conditions = getComponent(world, missionEntityId, 'missionConditions');
	
	if (!missionData || !objectives || !conditions) {
		return { success: false, error: 'Mission system not initialized' };
	}
	
	// Skip if mission already complete
	if (missionData.status !== 'ACTIVE') {
		return { success: true, status: missionData.status, noUpdate: true };
	}
	
	const currentTick = world.turnSystem?.gameTick || 0;
	let statusChanged = false;
	let newCompletions = [];
	
	// Check failure conditions first
	for (const condition of conditions.failureConditions) {
		if (condition.triggered) continue;
		
		const conditionType = FAILURE_CONDITIONS[condition.type];
		if (!conditionType) continue;
		
		const result = conditionType.evaluate(world, condition);
		if (result.failed) {
			condition.triggered = true;
			condition.triggeredAt = currentTick;
			
			missionData.status = 'FAILURE';
			missionData.failureReason = result.reason;
			statusChanged = true;
			
			console.log(`❌ Mission failed: ${result.reason}`);
			return {
				success: true,
				status: 'FAILURE',
				statusChanged: true,
				reason: result.reason
			};
		}
	}
	
	// Check objective completion
	const allObjectiveLists = [
		{ list: objectives.primary, type: 'primary' },
		{ list: objectives.secondary || [], type: 'secondary' }
	];
	
	for (const { list, type } of allObjectiveLists) {
		for (const objective of list) {
			if (objective.completed) continue;
			
			const objectiveType = OBJECTIVE_TYPES[objective.type];
			if (!objectiveType) continue;
			
			const isCompleted = objectiveType.evaluate(world, objective);
			if (isCompleted) {
				objective.completed = true;
				objective.completedAt = currentTick;
				objective.progress = 100;
				
				missionData.completedObjectives.push({
					id: objective.id,
					title: objective.title,
					type: type,
					completedAt: currentTick
				});
				
				newCompletions.push({
					id: objective.id,
					title: objective.title,
					type: type
				});
				
				statusChanged = true;
				console.log(`✅ Objective completed: ${objective.title} (${type})`);
			}
		}
	}
	
	// Check for mission success (all primary objectives complete)
	const primaryCompleted = objectives.primary.every(obj => obj.completed);
	if (primaryCompleted && missionData.status === 'ACTIVE') {
		missionData.status = 'SUCCESS';
		statusChanged = true;
		
		console.log('🎉 Mission successful! All primary objectives completed.');
		
		return {
			success: true,
			status: 'SUCCESS',
			statusChanged: true,
			newCompletions,
			completedObjectives: missionData.completedObjectives.length
		};
	}
	
	// Update mission data timestamp
	if (statusChanged) {
		missionData.lastUpdate = currentTick;
	}
	
	return {
		success: true,
		status: missionData.status,
		statusChanged,
		newCompletions,
		objectiveProgress: {
			primaryCompleted: objectives.primary.filter(obj => obj.completed).length,
			primaryTotal: objectives.primary.length,
			secondaryCompleted: (objectives.secondary || []).filter(obj => obj.completed).length,
			secondaryTotal: (objectives.secondary || []).length
		}
	};
}

/**
 * Get current mission status for UI display
 * @param {object} world - The world object
 * @returns {object} Mission status information
 */
export function getMissionStatus(world) {
	const missionEntityId = 1;
	const missionData = getComponent(world, missionEntityId, 'missionData');
	const objectives = getComponent(world, missionEntityId, 'missionObjectives');
	const conditions = getComponent(world, missionEntityId, 'missionConditions');
	
	if (!missionData || !objectives || !conditions) {
		return { 
			initialized: false,
			error: 'Mission system not initialized'
		};
	}
	
	const currentTick = world.turnSystem?.gameTick || 0;
	
	return {
		initialized: true,
		missionId: missionData.missionId,
		title: missionData.title,
		description: missionData.description,
		briefing: missionData.briefing,
		status: missionData.status,
		currentTick,
		startTick: missionData.startTick,
		elapsedTicks: currentTick - missionData.startTick,
		
		objectives: {
			primary: objectives.primary.map(obj => ({
				id: obj.id,
				title: obj.title,
				description: obj.description,
				completed: obj.completed,
				progress: obj.progress,
				priority: obj.priority,
				hint: obj.hint
			})),
			secondary: (objectives.secondary || []).map(obj => ({
				id: obj.id,
				title: obj.title,
				description: obj.description,
				completed: obj.completed,
				progress: obj.progress,
				priority: obj.priority,
				hint: obj.hint
			}))
		},
		
		progress: {
			primaryCompleted: objectives.primary.filter(obj => obj.completed).length,
			primaryTotal: objectives.primary.length,
			secondaryCompleted: (objectives.secondary || []).filter(obj => obj.completed).length,
			secondaryTotal: (objectives.secondary || []).length,
			overallPercentage: Math.round(
				(objectives.primary.filter(obj => obj.completed).length / objectives.primary.length) * 100
			)
		},
		
		conditions: {
			failure: conditions.failureConditions.map(condition => ({
				id: condition.id,
				title: condition.title,
				description: condition.description,
				triggered: condition.triggered
			}))
		},
		
		completedObjectives: missionData.completedObjectives,
		failureReason: missionData.failureReason || null
	};
}

/**
 * Track communication action for mission objectives
 * @param {object} world - The world object
 * @param {number} characterId - Character who communicated
 * @param {string} message - Communication message
 */
export function trackCommunication(world, characterId, message) {
	const missionEntityId = 1;
	const missionData = getComponent(world, missionEntityId, 'missionData');
	
	if (missionData) {
		missionData.communicationCount = (missionData.communicationCount || 0) + 1;
		console.log(`📡 Communication tracked: ${missionData.communicationCount} total messages`);
	}
}

/**
 * Track search action for mission objectives
 * @param {object} world - The world object
 * @param {number} characterId - Character who searched
 * @param {number} targetId - Entity that was searched
 */
export function trackSearch(world, characterId, targetId) {
	const missionEntityId = 1;
	const missionData = getComponent(world, missionEntityId, 'missionData');
	
	if (missionData) {
		missionData.searchCount = (missionData.searchCount || 0) + 1;
	}
	
	// Add search history to the target entity
	if (!hasComponent(world, targetId, 'searchHistory')) {
		setComponent(world, targetId, 'searchHistory', {
			searched: true,
			searchedBy: [characterId],
			searchedAt: world.turnSystem?.gameTick || 0
		});
	} else {
		const searchHistory = getComponent(world, targetId, 'searchHistory');
		if (!searchHistory.searchedBy.includes(characterId)) {
			searchHistory.searchedBy.push(characterId);
		}
	}
	
	console.log(`🔍 Search tracked for entity ${targetId} by character ${characterId}`);
}

/**
 * Track examination action for mission objectives
 * @param {object} world - The world object
 * @param {number} characterId - Character who examined
 * @param {number} targetId - Entity that was examined
 */
export function trackExamination(world, characterId, targetId) {
	// Add examination history to the target entity
	if (!hasComponent(world, targetId, 'examinationHistory')) {
		setComponent(world, targetId, 'examinationHistory', {
			examined: true,
			examinedBy: [characterId],
			examinedAt: world.turnSystem?.gameTick || 0
		});
	} else {
		const examineHistory = getComponent(world, targetId, 'examinationHistory');
		if (!examineHistory.examinedBy.includes(characterId)) {
			examineHistory.examinedBy.push(characterId);
		}
	}
	
	console.log(`👁️ Examination tracked for entity ${targetId} by character ${characterId}`);
}

/**
 * Get mission context for decision-making (used by ContextAssembler)
 * @param {object} world - The world object
 * @param {number} characterId - Character requesting context
 * @returns {object} Mission context for decision-making
 */
export function getMissionContext(world, characterId) {
	const missionStatus = getMissionStatus(world);
	
	if (!missionStatus.initialized) {
		return null;
	}
	
	// Get relevant objectives for this character
	const relevantObjectives = [];
	
	// Add incomplete primary objectives
	for (const objective of missionStatus.objectives.primary) {
		if (!objective.completed) {
			relevantObjectives.push({
				...objective,
				type: 'primary',
				relevance: calculateObjectiveRelevance(world, characterId, objective)
			});
		}
	}
	
	// Add incomplete secondary objectives
	for (const objective of missionStatus.objectives.secondary) {
		if (!objective.completed) {
			relevantObjectives.push({
				...objective,
				type: 'secondary',
				relevance: calculateObjectiveRelevance(world, characterId, objective)
			});
		}
	}
	
	// Sort by relevance and priority
	relevantObjectives.sort((a, b) => {
		const priorityWeight = { high: 3, medium: 2, low: 1 };
		const aScore = (priorityWeight[a.priority] || 1) + (a.relevance || 0);
		const bScore = (priorityWeight[b.priority] || 1) + (b.relevance || 0);
		return bScore - aScore;
	});
	
	return {
		missionTitle: missionStatus.title,
		missionStatus: missionStatus.status,
		currentTick: missionStatus.currentTick,
		elapsedTicks: missionStatus.elapsedTicks,
		progress: missionStatus.progress,
		objectives: relevantObjectives.slice(0, 3), // Top 3 most relevant objectives
		recentCompletions: missionStatus.completedObjectives.slice(-2), // Last 2 completed
		urgentConditions: missionStatus.conditions.failure.filter(c => !c.triggered)
	};
}

/**
 * Calculate how relevant an objective is to a specific character
 * @param {object} world - The world object
 * @param {number} characterId - Character to calculate relevance for
 * @param {object} objective - Objective to evaluate
 * @returns {number} Relevance score (higher = more relevant)
 */
function calculateObjectiveRelevance(world, characterId, objective) {
	let relevance = 0;
	
	const position = getComponent(world, characterId, 'position');
	const currentRoom = position?.roomId;
	
	switch (objective.type) {
		case 'REACH_LOCATION':
			// More relevant if character is not already at target
			if (currentRoom !== objective.parameters.targetRoomId) {
				relevance += 2;
			}
			// More relevant if this character is specifically required
			if (objective.parameters.targetCharacterId === characterId) {
				relevance += 3;
			}
			break;
			
		case 'SEARCH_LOCATION':
			// More relevant if character is in or near target room
			if (currentRoom === objective.parameters.targetRoomId) {
				relevance += 3;
			}
			break;
			
		case 'EXAMINE_TARGET':
			// More relevant if character is in same room as target
			const targetPosition = getComponent(world, objective.parameters.targetEntityId, 'position');
			if (targetPosition && targetPosition.roomId === currentRoom) {
				relevance += 2;
			}
			break;
			
		case 'TEAM_COMMUNICATION':
			// Always relevant for communication objectives
			relevance += 1;
			break;
			
		default:
			relevance += 1;
	}
	
	return relevance;
}

/**
 * Debug function: Get complete mission system state
 * @param {object} world - The world object
 * @returns {object} Complete mission system debug info
 */
export function getDebugMissionInfo(world) {
	const missionStatus = getMissionStatus(world);
	
	if (!missionStatus.initialized) {
		return { error: 'Mission system not initialized' };
	}
	
	return {
		...missionStatus,
		debugInfo: {
			missionEntityId: 1,
			currentTick: world.turnSystem?.gameTick || 0,
			componentsCounts: {
				missionData: Object.keys(world.components?.missionData || {}).length,
				missionObjectives: Object.keys(world.components?.missionObjectives || {}).length,
				missionConditions: Object.keys(world.components?.missionConditions || {}).length,
				searchHistory: Object.keys(world.components?.searchHistory || {}).length,
				examinationHistory: Object.keys(world.components?.examinationHistory || {}).length
			}
		}
	};
}
