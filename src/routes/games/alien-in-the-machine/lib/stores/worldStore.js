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
import { processCharacterAction, advanceTimeUntilAction, getAvailableActions } from '../game/systems.js';
import * as TurnManager from '../game/TurnManager.js';
import { getAvailableActionsForCharacter, getActionCost, getActionDescription } from '../game/ActionCosts.js';

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
 * Derived store for tick-based turn system state
 * Provides all turn-related information for UI components
 */
export const turnSystemStore = derived(
  worldStore,
  ($world) => {
    if (!$world.turnSystem) return null;
    return TurnManager.getCharacterTimersState($world);
  }
);

/**
 * Derived store for the currently active character
 * Returns detailed information about who can act now
 */
export const activeCharacterStore = derived(
  worldStore,
  ($world) => {
    const activeId = $world.turnSystem?.activeCharacterId;
    if (!activeId) return null;
    
    const components = getEntityComponents($world, activeId);
    const marineComponent = components.isMarine;
    const speedComponent = components.speed;
    
    return {
      entityId: activeId,
      name: marineComponent?.name || `Entity ${activeId}`,
      rank: marineComponent?.rank,
      speed: speedComponent?.current || 0,
      timer: $world.turnSystem.characterTimers[activeId] || 0,
      components,
      isReady: ($world.turnSystem.characterTimers[activeId] || 0) <= 0
    };
  }
);

/**
 * Derived store for available actions for the active character
 * Shows what the current character can do with tick costs
 */
export const availableActionsStore = derived(
  [worldStore, activeCharacterStore],
  ([$world, $activeCharacter]) => {
    if (!$activeCharacter) return [];
    
    const actions = getAvailableActionsForCharacter($activeCharacter.components);
    return actions.map(action => ({
      ...action,
      displayName: `${getActionDescription(action.name)} (${action.cost} ticks)`
    }));
  }
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
    
    // Initialize the turn system for all characters
    const turnInitResult = TurnManager.initializeTurnSystem(world);
    if (turnInitResult.errors.length > 0) {
      console.warn('Turn system initialization warnings:', turnInitResult.errors);
    }
    
    // Update phase to Pre-Phase 2 (tick system ready)
    world.metadata.phase = 'Pre-Phase 2';
    
    worldStore.set(world);
    
    console.log('World initialized with tick-based turn system:', {
      summary: getWorldSummary(world),
      turnSystem: turnInitResult,
      activeCharacter: world.turnSystem.activeCharacterId
    });
  } catch (error) {
    console.error('Failed to initialize world:', error);
    // Fall back to empty world
    const world = initWorld(null, null);
    worldStore.set(world);
  }
}

/**
 * NEW TICK-BASED SYSTEM: Execute a character action
 * This is the main function for performing actions in the tick system
 * @param {number} characterId - The character performing the action
 * @param {string} actionType - The action type (e.g., 'MOVE_ROOM', 'SEARCH_AREA')
 * @param {Object} actionParams - Additional parameters for the action
 * @returns {Object} Results of the action execution
 */
export function executeCharacterAction(characterId, actionType, actionParams = {}) {
  let results = null;
  
  worldStore.update(world => {
    results = processCharacterAction(world, characterId, actionType, actionParams);
    return world;
  });
  
  if (results?.success) {
    console.log('Character action executed:', {
      character: characterId,
      action: actionType,
      tickCost: results.tickCost,
      nextActive: results.nextActiveCharacter
    });
  } else if (results?.errors.length > 0) {
    console.warn('Character action failed:', results.errors);
  }
  
  return results;
}

/**
 * Advance time until someone can act
 * Used when all characters are on cooldown
 * @returns {Object} Results of time advancement
 */
export function advanceTime() {
  let results = null;
  
  worldStore.update(world => {
    results = advanceTimeUntilAction(world);
    return world;
  });
  
  if (results?.errors.length > 0) {
    console.warn('Time advancement warnings:', results.errors);
  }
  
  console.log('Time advanced:', {
    ticksAdvanced: results.ticksAdvanced,
    activeCharacter: results.activeCharacter,
    charactersReady: results.charactersReady
  });
  
  return results;
}

/**
 * Get the current active character (who can act now)
 * @returns {Object|null} Active character information or null
 */
export function getCurrentActiveCharacter() {
  let activeCharacter = null;
  worldStore.subscribe(world => {
    const activeId = world.turnSystem?.activeCharacterId;
    if (activeId) {
      const components = getEntityComponents(world, activeId);
      const marineComponent = components.isMarine;
      activeCharacter = {
        entityId: activeId,
        name: marineComponent?.name || `Entity ${activeId}`,
        components
      };
    }
  })();
  return activeCharacter;
}

/**
 * Get all character timer states for UI display
 * @returns {Object} Timer state information
 */
export function getCharacterTimers() {
  let timerState = null;
  worldStore.subscribe(world => {
    timerState = TurnManager.getCharacterTimersState(world);
  })();
  return timerState;
}

/**
 * DEPRECATED: Process a single game turn - kept for compatibility
 * @deprecated Use executeCharacterAction for individual actions
 */
export function nextTurn() {
  console.warn('nextTurn() is deprecated - use executeCharacterAction() or advanceTime()');
  return advanceTime();
}

/**
 * DEPRECATED: Add an action to the game's action queue
 * @deprecated Use executeCharacterAction for immediate action execution
 */
export function addAction(action) {
  console.warn('addAction() is deprecated - use executeCharacterAction()');
  if (action.entityId && action.type) {
    return executeCharacterAction(action.entityId, action.type, action);
  }
  return { success: false, error: 'Invalid action format for deprecated addAction' };
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
