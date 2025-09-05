/**
 * worldStore.js - Svelte Store for World State Management
 * 
 * This is the bridge between our UI-agnostic game engine and the Svelte components.
 * It's the ONLY way UI components should interact with the game world.
 * 
 * Key Principles:
 * - This store is the single source of truth for the UI
 * - UI components should NEVER directly modify the world object
 * - All game state changes flow through the game engine, then update this store
 * - Store provides reactive updates to all subscribed components
 * 
 * Future AI Development Notes:
 * - When adding new manager functions, ensure they go through proper game systems
 * - Always validate actions before adding them to the action queue
 * - Keep the store interface clean and predictable
 * - Log important state changes for debugging
 */

import { writable, derived } from 'svelte/store';
import { createWorld, initWorld, getWorldSummary, getEntityComponents } from '../game/World.js';
import { processGameTurn, queueAction, getAvailableActions } from '../game/systems.js';

/**
 * Main world store - holds the complete game state
 * This is reactive - any changes will update all subscribed UI components
 */
export const worldStore = writable(createWorld());

/**
 * Derived store for debugging - provides a summary view of the world
 * Useful for development and debugging without exposing full world complexity
 */
export const worldSummaryStore = derived(
  worldStore,
  ($world) => getWorldSummary($world)
);

/**
 * Derived store for game status information
 * Extracts key game state info for UI display
 */
export const gameStatusStore = derived(
  worldStore,
  ($world) => ({
    gameState: $world.gameState,
    currentTurn: $world.currentTurn,
    phase: $world.metadata.phase,
    actionQueueLength: $world.actionQueue.length,
    activeEntitiesCount: $world.entities.active.size
  })
);

/**
 * Store for the currently selected entity (for debugging and inspection)
 * Used by InfoView component to show entity details
 */
export const selectedEntityStore = writable(null);

/**
 * Derived store that provides detailed information about the selected entity
 */
export const selectedEntityDetailsStore = derived(
  [worldStore, selectedEntityStore],
  ([$world, $selectedEntityId]) => {
    if (!$selectedEntityId || !$world.entities.active.has($selectedEntityId)) {
      return null;
    }
    
    return {
      entityId: $selectedEntityId,
      components: getEntityComponents($world, $selectedEntityId),
      availableActions: getAvailableActions($world, $selectedEntityId),
      isActive: $world.entities.active.has($selectedEntityId)
    };
  }
);

// ========================
// MANAGER FUNCTIONS
// These are the public API for UI components to interact with the game
// ========================

/**
 * Initialize the game world with data from JSON files
 * Loads rooms.json and marines.json, then creates the world entities
 */
export async function initializeWorld() {
  try {
    // Import the JSON data files
    const [roomsModule, marinesModule] = await Promise.all([
      import('../data/rooms.json'),
      import('../data/marines.json')
    ]);
    
    const roomsData = roomsModule.default;
    const marinesData = marinesModule.default;
    
    // Initialize world with loaded data
    const world = initWorld(roomsData, marinesData);
    worldStore.set(world);
    
    console.log('World initialized with Phase 1 data:', getWorldSummary(world));
  } catch (error) {
    console.error('Failed to initialize world:', error);
    // Fall back to empty world
    const world = initWorld(null, null);
    worldStore.set(world);
  }
}

/**
 * Process a single game turn - runs all systems and updates the store
 * This is the main game loop trigger
 */
export function nextTurn() {
  worldStore.update(world => {
    const turnSummary = processGameTurn(world);
    console.log('Turn processed:', turnSummary);
    
    // Log any errors that occurred
    if (turnSummary.errors.length > 0) {
      console.warn('Turn errors:', turnSummary.errors);
    }
    
    return world; // World is modified in place by systems
  });
}

/**
 * Add an action to the game's action queue
 * Used by UI components to trigger game actions
 * @param {Object} action - The action to queue (e.g., {type: 'moveTo', entityId: 1, targetRoomId: 'medbay'})
 * @returns {boolean} True if action was successfully queued
 */
export function addAction(action) {
  let success = false;
  
  worldStore.update(world => {
    success = queueAction(world, action);
    return world;
  });
  
  if (success) {
    console.log('Action queued:', action);
  } else {
    console.warn('Failed to queue action:', action);
  }
  
  return success;
}

/**
 * Select an entity for inspection (used by debug UI)
 * @param {number|null} entityId - The entity ID to select, or null to deselect
 */
export function selectEntity(entityId) {
  selectedEntityStore.set(entityId);
  if (entityId) {
    console.log('Entity selected:', entityId);
  }
}

/**
 * Get available actions for a specific entity
 * Used by debug UI to show possible actions
 * @param {number} entityId - The entity to check
 * @returns {Array} Array of possible actions
 */
export function getEntityActions(entityId) {
  let actions = [];
  worldStore.subscribe(world => {
    actions = getAvailableActions(world, entityId);
  })();
  return actions;
}

/**
 * Reset the game to initial state
 * Useful for testing and restarting
 */
export function resetGame() {
  const newWorld = createWorld();
  worldStore.set(newWorld);
  selectedEntityStore.set(null);
  console.log('Game reset');
}

/**
 * Update game phase (for development progression)
 * @param {number} phase - The new phase number (0, 1, 2, 3, 4)
 */
export function setGamePhase(phase) {
  worldStore.update(world => {
    world.metadata.phase = phase;
    console.log(`Game phase updated to: ${phase}`);
    return world;
  });
}

/**
 * Debug function to manually modify world state
 * Should only be used for testing and development
 * @param {Function} modifyFunction - Function that takes world and modifies it
 */
export function debugModifyWorld(modifyFunction) {
  worldStore.update(world => {
    modifyFunction(world);
    world.metadata.lastUpdate = new Date().toISOString();
    return world;
  });
}

// ========================
// DEVELOPMENT HELPERS
// These functions are useful during development but should not be used in production
// ========================

/**
 * Log current world state to console (for debugging)
 */
export function debugLogWorld() {
  worldStore.subscribe(world => {
    console.log('Current World State:', world);
    console.log('World Summary:', getWorldSummary(world));
  })();
}

/**
 * Export world state as JSON (for saving/testing)
 * @returns {string} JSON representation of current world
 */
export function exportWorldState() {
  let worldState = '';
  worldStore.subscribe(world => {
    worldState = JSON.stringify(world, null, 2);
  })();
  return worldState;
}

/**
 * Import world state from JSON (for loading/testing)
 * @param {string} worldStateJSON - JSON string of world state
 */
export function importWorldState(worldStateJSON) {
  try {
    const world = JSON.parse(worldStateJSON);
    worldStore.set(world);
    console.log('World state imported');
  } catch (error) {
    console.error('Failed to import world state:', error);
  }
}
