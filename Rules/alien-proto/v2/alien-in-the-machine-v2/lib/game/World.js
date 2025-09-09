/**
 * World.js - Enhanced Entity-Component-System (ECS) Core
 * 
 * The foundational module that defines the shape of the game world and provides
 * helper functions for managing entities and components. This is our "database schema"
 * and the single source of truth for all game state.
 * 
 * Core Philosophy:
 * - Entity: Just a number (ID), nothing more
 * - Component: Pure data, stored in world.components[componentType][entityId]
 * - World: Single object containing all game state
 */

let nextEntityId = 1;

/**
 * Create a new unique entity ID
 * @returns {number} New entity ID
 */
export function createEntity() {
	return nextEntityId++;
}

/**
 * Create the initial world state structure
 * @returns {object} Empty world with proper structure
 */
export function createWorld() {
	return {
		// Entity-Component storage
		components: {
			// Entity type markers
			isMarine: {},      // { entityId: { name: string, rank: string } }
			isRoom: {},        // { entityId: { name: string, description: string } }
			isItem: {},        // { entityId: { name: string, type: string } }
			
			// Core gameplay components
			position: {},      // { entityId: { roomId: string, x?: number, y?: number } }
			health: {},        // { entityId: { current: number, max: number } }
			speed: {},         // { entityId: { current: number, base: number, modifiers: [] } }
			inventory: {},     // { entityId: { items: entityId[], capacity: number } }
			
			// Character attributes
			personality: {},   // { entityId: { traits: string[], background: string } }
			skills: {},        // { entityId: { technical: number, combat: number, medical: number } }
			
			// Room/environment components
			environment: {},   // { entityId: { doors: [], items: [], searchable: [], temperature: number } }
			doors: {},         // { entityId: { connections: [{ targetRoomId, cost, description }] } }
			
			// System components
			tag: {},           // { entityId: { name: string, debug: string } } - For debugging
		},
		
		// Turn system state
		turnSystem: {
			characterTimers: {},    // { entityId: { timer: number, speed: number, readyAt: number } }
			gameTick: 0,
			activeCharacterId: null,
			turnQueue: []           // [{ characterId, readyAt, speed }] - sorted by readyAt
		},
		
		// World metadata
		metadata: {
			phase: 'Phase 0',
			status: 'INITIALIZING',
			entities: {},           // { entityId: { type: string, created: timestamp } }
			totalEntities: 0
		}
	};
}

/**
 * Add a component to an entity
 * @param {object} world - The world object
 * @param {number} entityId - Target entity ID
 * @param {string} componentType - Type of component to add
 * @param {object} componentData - Component data
 */
export function addComponent(world, entityId, componentType, componentData) {
	if (!world.components[componentType]) {
		console.warn(`⚠️ Unknown component type: ${componentType}`);
		world.components[componentType] = {};
	}
	
	world.components[componentType][entityId] = componentData;
	
	// Debug logging
	console.log(`📎 Added ${componentType} component to entity ${entityId}:`, componentData);
}

/**
 * Set a component on an entity (alias for addComponent for consistency)
 * @param {object} world - The world object
 * @param {number} entityId - Target entity ID
 * @param {string} componentType - Type of component to set
 * @param {object} componentData - Component data
 */
export function setComponent(world, entityId, componentType, componentData) {
	return addComponent(world, entityId, componentType, componentData);
}

/**
 * Get a component from an entity
 * @param {object} world - The world object
 * @param {number} entityId - Target entity ID
 * @param {string} componentType - Type of component to get
 * @returns {object|null} Component data or null if not found
 */
export function getComponent(world, entityId, componentType) {
	return world.components[componentType]?.[entityId] || null;
}

/**
 * Check if an entity has a component
 * @param {object} world - The world object
 * @param {number} entityId - Target entity ID
 * @param {string} componentType - Type of component to check
 * @returns {boolean} True if entity has component
 */
export function hasComponent(world, entityId, componentType) {
	return Boolean(world.components[componentType]?.[entityId]);
}

/**
 * Remove a component from an entity
 * @param {object} world - The world object
 * @param {number} entityId - Target entity ID
 * @param {string} componentType - Type of component to remove
 */
export function removeComponent(world, entityId, componentType) {
	if (world.components[componentType]?.[entityId]) {
		delete world.components[componentType][entityId];
		console.log(`🗑️ Removed ${componentType} component from entity ${entityId}`);
	}
}

/**
 * Get all entities that have a specific component
 * @param {object} world - The world object
 * @param {string} componentType - Type of component to search for
 * @returns {number[]} Array of entity IDs that have the component
 */
export function getEntitiesWithComponent(world, componentType) {
	const component = world.components[componentType];
	if (!component) return [];
	
	return Object.keys(component).map(Number);
}

/**
 * Alias for getEntitiesWithComponent for backward compatibility
 * @param {object} world - The world object
 * @param {string} componentType - Type of component to search for
 * @returns {number[]} Array of entity IDs that have the component
 */
export function getAllEntitiesWith(world, componentType) {
	return getEntitiesWithComponent(world, componentType);
}

/**
 * Get all entities with multiple required components
 * @param {object} world - The world object
 * @param {string[]} componentTypes - Array of required component types
 * @returns {number[]} Array of entity IDs that have ALL components
 */
export function getEntitiesWithComponents(world, componentTypes) {
	if (componentTypes.length === 0) return [];
	
	// Start with entities that have the first component
	let entities = getEntitiesWithComponent(world, componentTypes[0]);
	
	// Filter to only entities that have ALL required components
	for (let i = 1; i < componentTypes.length; i++) {
		const componentType = componentTypes[i];
		entities = entities.filter(entityId => hasComponent(world, entityId, componentType));
	}
	
	return entities;
}

/**
 * Create a marine entity from JSON data
 * @param {object} world - The world object
 * @param {object} marineData - Marine data from JSON
 * @returns {number} Created entity ID
 */
export function createMarineEntity(world, marineData) {
	const entityId = createEntity();
	
	// Add entity metadata
	world.metadata.entities[entityId] = {
		type: 'marine',
		created: Date.now()
	};
	
	// Add core components
	addComponent(world, entityId, 'isMarine', {
		name: marineData.name,
		rank: marineData.rank
	});
	
	addComponent(world, entityId, 'position', {
		roomId: marineData.startingRoom,
		x: marineData.position?.x || 0,
		y: marineData.position?.y || 0
	});
	
	addComponent(world, entityId, 'health', {
		current: marineData.health?.current || 100,
		max: marineData.health?.max || 100
	});
	
	addComponent(world, entityId, 'speed', {
		current: marineData.speed || 5,
		base: marineData.speed || 5,
		modifiers: []
	});
	
	addComponent(world, entityId, 'inventory', {
		items: marineData.inventory || [],
		capacity: marineData.inventoryCapacity || 10
	});
	
	addComponent(world, entityId, 'personality', {
		traits: marineData.personality?.traits || [],
		background: marineData.personality?.background || '',
		motivation: marineData.personality?.motivation || ''
	});
	
	addComponent(world, entityId, 'skills', {
		technical: marineData.skills?.technical || 3,
		combat: marineData.skills?.combat || 3,
		medical: marineData.skills?.medical || 3
	});
	
	addComponent(world, entityId, 'tag', {
		name: `marine_${marineData.name.toLowerCase()}`,
		debug: `Marine: ${marineData.name} (${marineData.rank})`
	});
	
	world.metadata.totalEntities++;
	console.log(`👨‍🚀 Created marine entity ${entityId}: ${marineData.name}`);
	return entityId;
}

/**
 * Create a room entity from JSON data
 * @param {object} world - The world object
 * @param {object} roomData - Room data from JSON
 * @returns {number} Created entity ID
 */
export function createRoomEntity(world, roomData) {
	const entityId = createEntity();
	
	// Add entity metadata
	world.metadata.entities[entityId] = {
		type: 'room',
		created: Date.now()
	};
	
	// Add core components
	addComponent(world, entityId, 'isRoom', {
		name: roomData.name,
		description: roomData.description,
		id: roomData.id  // Keep original ID for reference
	});
	
	addComponent(world, entityId, 'position', {
		roomId: roomData.id,  // Rooms reference themselves
		x: roomData.position?.x || 0,
		y: roomData.position?.y || 0
	});
	
	addComponent(world, entityId, 'environment', {
		temperature: roomData.environment?.temperature || 20,
		atmosphere: roomData.environment?.atmosphere || 'normal',
		lighting: roomData.environment?.lighting || 'normal',
		hazards: roomData.environment?.hazards || []
	});
	
	addComponent(world, entityId, 'doors', {
		connections: roomData.doors?.map(door => ({
			targetRoomId: door.targetRoomId,
			direction: door.direction,
			cost: door.cost || 8,
			description: door.description || `Move to ${door.targetRoomId}`
		})) || []
	});
	
	addComponent(world, entityId, 'tag', {
		name: `room_${roomData.id}`,
		debug: `Room: ${roomData.name}`
	});
	
	world.metadata.totalEntities++;
	console.log(`🏠 Created room entity ${entityId}: ${roomData.name}`);
	return entityId;
}

/**
 * Initialize world from JSON data files
 * @param {object} roomsData - Rooms JSON data
 * @param {object} marinesData - Marines JSON data
 * @returns {object} Initialized world object
 */
export function initWorld(roomsData, marinesData) {
	console.log('🌍 Initializing world from JSON data...');
	const world = createWorld();
	
	// Create room entities
	if (roomsData?.rooms) {
		roomsData.rooms.forEach(roomData => {
			createRoomEntity(world, roomData);
		});
		console.log(`✅ Created ${roomsData.rooms.length} room entities`);
	}
	
	// Create marine entities
	if (marinesData?.marines) {
		marinesData.marines.forEach(marineData => {
			createMarineEntity(world, marineData);
		});
		console.log(`✅ Created ${marinesData.marines.length} marine entities`);
	}
	
	// Update world status
	world.metadata.phase = 'Phase 0';
	world.metadata.status = 'LOADED';
	
	console.log(`🎯 World initialization complete: ${world.metadata.totalEntities} entities created`);
	return world;
}

/**
 * Get all marine entities with their component data
 * @param {object} world - The world object
 * @returns {object[]} Array of marine entities with all their component data
 */
export function getAllMarines(world) {
	const marineEntityIds = getEntitiesWithComponent(world, 'isMarine');
	
	return marineEntityIds.map(entityId => {
		return {
			entityId,
			marine: getComponent(world, entityId, 'isMarine'),
			position: getComponent(world, entityId, 'position'),
			health: getComponent(world, entityId, 'health'),
			speed: getComponent(world, entityId, 'speed'),
			inventory: getComponent(world, entityId, 'inventory'),
			personality: getComponent(world, entityId, 'personality'),
			skills: getComponent(world, entityId, 'skills'),
			tag: getComponent(world, entityId, 'tag')
		};
	});
}

/**
 * Get all room entities with their component data
 * @param {object} world - The world object
 * @returns {object[]} Array of room entities with all their component data
 */
export function getAllRooms(world) {
	const roomEntityIds = getEntitiesWithComponent(world, 'isRoom');
	
	return roomEntityIds.map(entityId => {
		return {
			entityId,
			room: getComponent(world, entityId, 'isRoom'),
			position: getComponent(world, entityId, 'position'),
			environment: getComponent(world, entityId, 'environment'),
			doors: getComponent(world, entityId, 'doors'),
			tag: getComponent(world, entityId, 'tag')
		};
	});
}

/**
 * Find a room entity by its original room ID
 * @param {object} world - The world object
 * @param {string} roomId - Original room ID from JSON
 * @returns {number|null} Entity ID or null if not found
 */
export function getRoomEntityByRoomId(world, roomId) {
	const roomEntityIds = getEntitiesWithComponent(world, 'isRoom');
	
	for (const entityId of roomEntityIds) {
		const roomComponent = getComponent(world, entityId, 'isRoom');
		if (roomComponent?.id === roomId) {
			return entityId;
		}
	}
	
	return null;
}

/**
 * Debug function: Get complete entity information
 * @param {object} world - The world object
 * @param {number} entityId - Target entity ID
 * @returns {object} All components for the entity
 */
export function getEntityDebugInfo(world, entityId) {
	const info = {
		entityId,
		metadata: world.metadata.entities[entityId] || null,
		components: {}
	};
	
	// Check all component types
	for (const [componentType, componentStorage] of Object.entries(world.components)) {
		if (componentStorage[entityId]) {
			info.components[componentType] = componentStorage[entityId];
		}
	}
	
	return info;
}
