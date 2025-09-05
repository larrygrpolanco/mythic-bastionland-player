/**
 * World.js - Core Entity-Component-System (ECS) Architecture
 * 
 * This is the heart of our "toy" ECS system. It defines the world object structure
 * and provides utilities for managing entities and components.
 * 
 * Key Principles:
 * - Entities are simple numeric IDs
 * - Components are pure data stored by entity ID
 * - This module only handles data structure, no game logic
 * - All functions are pure - they don't modify global state
 * 
 * Future AI Development Notes:
 * - When adding new component types, follow the existing pattern
 * - Always use JSDoc for new functions
 * - Keep components as pure data - no methods or behaviors
 */

/**
 * Creates a new, empty world object with the ECS structure
 * @returns {Object} Empty world object ready for initialization
 */
export function createWorld() {
  return {
    // ECS Core Structure
    entities: {
      nextId: 1,      // Auto-incrementing entity ID
      active: new Set() // Set of currently active entity IDs
    },
    
    // Component Storage - organized by component type, then by entity ID
    components: {
      // Position in the world
      position: {},     // { entityId: { roomId: string } }
      
      // Identity and classification
      tag: {},          // { entityId: { name: string } } - for debugging
      isMarine: {},     // { entityId: { name: string, rank: string } }
      isSurvivor: {},   // { entityId: { name: string, background: string } }
      isRoom: {},       // { entityId: { id: string, name: string } }
      isItem: {},       // { entityId: { name: string, description: string } }
      
      // Physical properties
      health: {},       // { entityId: { current: number, max: number } }
      inventory: {},    // { entityId: { items: array, capacity: number } }
      
      // Interactive properties (for Phase 2)
      pickupable: {},   // { entityId: { weight: number } }
      hideable: {},     // { entityId: { difficulty: number } }
      searchable: {},   // { entityId: { items: array, searched: boolean } }
      usable: {},       // { entityId: { type: string, data: object } }
      door: {},         // { entityId: { targetRoomId: string, locked: boolean } }
      
      // AI and behavior (for Phase 3)
      aiControl: {},    // { entityId: { personality: string, objectives: array } }
      personality: {},  // { entityId: { type: string, traits: object } }
      
      // Mission system (for Phase 4)
      objective: {},    // { entityId: { type: string, conditions: object } }
      
      // Future expansion - add new component types here
      // sensory: {},   // { entityId: { sight: number, hearing: number } }
      // equipment: {}, // { entityId: { weapon: object, armor: object } }
    },
    
    // Game State
    gameState: 'INITIALIZING', // INITIALIZING, PLAYING, PAUSED, WON, LOST
    currentTurn: 0,
    
    // Action Queue - commands waiting to be processed
    actionQueue: [],
    
    // Room connectivity (loaded from data files)
    roomConnections: {},
    
    // Metadata for debugging and development
    metadata: {
      version: '0.1.0',
      phase: 'Phase 0',
      lastUpdate: null
    }
  };
}

/**
 * Creates a new entity and returns its ID
 * @param {Object} world - The world object
 * @returns {number} The new entity's ID
 */
export function createEntity(world) {
  const entityId = world.entities.nextId++;
  world.entities.active.add(entityId);
  return entityId;
}

/**
 * Removes an entity and all its components from the world
 * @param {Object} world - The world object
 * @param {number} entityId - The entity to remove
 */
export function removeEntity(world, entityId) {
  world.entities.active.delete(entityId);
  
  // Remove from all component arrays
  Object.keys(world.components).forEach(componentType => {
    delete world.components[componentType][entityId];
  });
}

/**
 * Adds a component to an entity
 * @param {Object} world - The world object
 * @param {number} entityId - The entity to add the component to
 * @param {string} componentType - The type of component (e.g., 'position', 'health')
 * @param {Object} componentData - The component data
 */
export function addComponent(world, entityId, componentType, componentData) {
  if (!world.components[componentType]) {
    console.warn(`Component type '${componentType}' does not exist. Creating it.`);
    world.components[componentType] = {};
  }
  
  world.components[componentType][entityId] = { ...componentData };
}

/**
 * Gets a component from an entity
 * @param {Object} world - The world object
 * @param {number} entityId - The entity to get the component from
 * @param {string} componentType - The type of component
 * @returns {Object|null} The component data or null if not found
 */
export function getComponent(world, entityId, componentType) {
  return world.components[componentType]?.[entityId] || null;
}

/**
 * Checks if an entity has a specific component
 * @param {Object} world - The world object
 * @param {number} entityId - The entity to check
 * @param {string} componentType - The type of component
 * @returns {boolean} True if the entity has the component
 */
export function hasComponent(world, entityId, componentType) {
  return entityId in (world.components[componentType] || {});
}

/**
 * Gets all entities that have a specific component
 * @param {Object} world - The world object
 * @param {string} componentType - The component type to filter by
 * @returns {number[]} Array of entity IDs that have the component
 */
export function getEntitiesWithComponent(world, componentType) {
  if (!world.components[componentType]) return [];
  return Object.keys(world.components[componentType]).map(id => parseInt(id));
}

/**
 * Gets all components attached to a specific entity
 * @param {Object} world - The world object
 * @param {number} entityId - The entity to inspect
 * @returns {Object} Object with component types as keys and component data as values
 */
export function getEntityComponents(world, entityId) {
  const entityComponents = {};
  
  Object.keys(world.components).forEach(componentType => {
    if (entityId in world.components[componentType]) {
      entityComponents[componentType] = world.components[componentType][entityId];
    }
  });
  
  return entityComponents;
}

/**
 * Initializes the world with data from JSON files
 * This is called during Phase 1 - kept as stub for now
 * @param {Object} roomsData - Data from rooms.json
 * @param {Object} marinesData - Data from marines.json
 * @returns {Object} Initialized world object
 */
export function initWorld(roomsData, marinesData) {
  const world = createWorld();
  
  // Phase 1: This will be implemented to load data and create entities
  // For now, just return the empty world
  world.metadata.lastUpdate = new Date().toISOString();
  world.gameState = 'READY_FOR_PHASE_1';
  
  return world;
}

/**
 * Debug utility to get a human-readable summary of the world state
 * @param {Object} world - The world object
 * @returns {Object} Summary object for debugging
 */
export function getWorldSummary(world) {
  return {
    entities: {
      total: world.entities.active.size,
      nextId: world.entities.nextId
    },
    components: Object.keys(world.components).reduce((summary, componentType) => {
      summary[componentType] = Object.keys(world.components[componentType]).length;
      return summary;
    }, {}),
    gameState: world.gameState,
    currentTurn: world.currentTurn,
    actionQueueLength: world.actionQueue.length,
    metadata: world.metadata
  };
}
