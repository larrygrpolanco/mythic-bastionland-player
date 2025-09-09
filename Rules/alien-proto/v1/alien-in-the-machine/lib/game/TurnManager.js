/**
 * TurnManager.js - Tick-Based Turn System Logic
 * 
 * This module contains all the pure functions that manage the tick-based turn system.
 * It implements the elegant speed-based timing where actions directly cost time ticks.
 * 
 * Key Principles:
 * - All functions are pure - they don't modify the world object directly
 * - Speed determines how quickly character timers count down
 * - Action costs directly add to character timers (heavier actions = longer delay)
 * - Dynamic turn order based on who reaches timer ≤ 0 first
 * - No action queues or turn boundaries - immediate individual actions
 * 
 * Architecture Benefits:
 * - Unified tick currency for everything
 * - Proportional speed scaling (2x speed ≈ 2x more actions)
 * - Tactical depth through action timing decisions
 * - Clean integration with AI systems in Phase 3
 */

import { getEntitiesWithComponent, getComponent, hasComponent } from './World.js';

/**
 * Initializes the turn system for all characters with speed components
 * Sets up character timers and determines first active character
 * @param {Object} world - The world object (will be modified)
 * @returns {Object} Initialization results
 */
export function initializeTurnSystem(world) {
  const results = {
    charactersInitialized: 0,
    firstActiveCharacter: null,
    errors: []
  };
  
  try {
    // Find all entities with speed components (marines, future AI entities)
    const speedEntities = getEntitiesWithComponent(world, 'speed');
    
    // Initialize timers for all characters
    world.turnSystem.characterTimers = {};
    world.turnSystem.gameTick = 0;
    
    for (const entityId of speedEntities) {
      // All characters start with timer = 0 (ready to act)
      world.turnSystem.characterTimers[entityId] = 0;
      results.charactersInitialized++;
    }
    
    // Determine first active character (lowest entityId breaks ties)
    const readyCharacters = getCharactersReadyToAct(world);
    if (readyCharacters.length > 0) {
      world.turnSystem.activeCharacterId = Math.min(...readyCharacters);
      results.firstActiveCharacter = world.turnSystem.activeCharacterId;
    }
    
    console.log('Turn system initialized:', {
      characters: results.charactersInitialized,
      firstActive: results.firstActiveCharacter,
      timers: world.turnSystem.characterTimers
    });
    
  } catch (error) {
    results.errors.push(`Turn system initialization error: ${error.message}`);
    console.error('TurnManager initialization failed:', error);
  }
  
  return results;
}

/**
 * Gets the next character who can act (timer ≤ 0)
 * Returns null if no character is ready
 * @param {Object} world - The world object
 * @returns {number|null} Entity ID of character ready to act, or null
 */
export function getNextCharacterToAct(world) {
  const readyCharacters = getCharactersReadyToAct(world);
  
  if (readyCharacters.length === 0) {
    return null;
  }
  
  // If multiple characters are ready, pick the one with lowest timer
  // (most "overdue" gets priority)
  let nextCharacter = readyCharacters[0];
  let lowestTimer = world.turnSystem.characterTimers[nextCharacter];
  
  for (const characterId of readyCharacters) {
    const timer = world.turnSystem.characterTimers[characterId];
    if (timer < lowestTimer) {
      lowestTimer = timer;
      nextCharacter = characterId;
    }
  }
  
  return nextCharacter;
}

/**
 * Gets all characters whose timers are ≤ 0 (ready to act)
 * @param {Object} world - The world object
 * @returns {number[]} Array of entity IDs ready to act
 */
export function getCharactersReadyToAct(world) {
  const readyCharacters = [];
  
  for (const [entityIdStr, timer] of Object.entries(world.turnSystem.characterTimers)) {
    if (timer <= 0) {
      readyCharacters.push(parseInt(entityIdStr));
    }
  }
  
  return readyCharacters;
}

/**
 * Advances time by one tick - subtracts each character's speed from their timer
 * Characters with higher speed count down faster
 * @param {Object} world - The world object (will be modified)
 * @returns {Object} Results of tick advancement
 */
export function advanceTick(world) {
  const results = {
    gameTick: ++world.turnSystem.gameTick,
    charactersAdvanced: 0,
    newlyReady: [],
    errors: []
  };
  
  try {
    // Advance all character timers by their speed value
    for (const [entityIdStr, currentTimer] of Object.entries(world.turnSystem.characterTimers)) {
      const entityId = parseInt(entityIdStr);
      const speedComponent = getComponent(world, entityId, 'speed');
      
      if (!speedComponent) {
        results.errors.push(`Character ${entityId} has timer but no speed component`);
        continue;
      }
      
      const wasNotReady = currentTimer > 0;
      
      // Subtract speed from timer (higher speed = faster countdown)
      world.turnSystem.characterTimers[entityId] = currentTimer - speedComponent.current;
      
      const isNowReady = world.turnSystem.characterTimers[entityId] <= 0;
      
      // Track if character became ready this tick
      if (wasNotReady && isNowReady) {
        results.newlyReady.push(entityId);
      }
      
      results.charactersAdvanced++;
    }
    
    // Update active character if current one is no longer ready
    if (world.turnSystem.activeCharacterId) {
      const currentActiveTimer = world.turnSystem.characterTimers[world.turnSystem.activeCharacterId];
      if (currentActiveTimer > 0) {
        // Current character no longer ready, find next one
        world.turnSystem.activeCharacterId = getNextCharacterToAct(world);
      }
    } else {
      // No active character set, find one
      world.turnSystem.activeCharacterId = getNextCharacterToAct(world);
    }
    
  } catch (error) {
    results.errors.push(`Tick advancement error: ${error.message}`);
    console.error('TurnManager tick advancement failed:', error);
  }
  
  return results;
}

/**
 * Executes a character action by adding the action's tick cost to their timer
 * This delays the character's next turn based on the action's cost
 * @param {Object} world - The world object (will be modified)
 * @param {number} characterId - The character performing the action
 * @param {number} tickCost - The cost in ticks for this action
 * @returns {Object} Results of action execution
 */
export function executeAction(world, characterId, tickCost) {
  const results = {
    characterId,
    tickCost,
    newTimer: null,
    nextActiveCharacter: null,
    errors: []
  };
  
  try {
    // Validate character exists and has a timer
    if (!world.turnSystem.characterTimers.hasOwnProperty(characterId)) {
      results.errors.push(`Character ${characterId} not found in turn system`);
      return results;
    }
    
    // Validate character is ready to act
    if (world.turnSystem.characterTimers[characterId] > 0) {
      results.errors.push(`Character ${characterId} is not ready to act (timer: ${world.turnSystem.characterTimers[characterId]})`);
      return results;
    }
    
    // Add tick cost to character's timer
    world.turnSystem.characterTimers[characterId] += tickCost;
    results.newTimer = world.turnSystem.characterTimers[characterId];
    
    // Find next character who can act
    world.turnSystem.activeCharacterId = getNextCharacterToAct(world);
    results.nextActiveCharacter = world.turnSystem.activeCharacterId;
    
    console.log(`Action executed: Character ${characterId} paid ${tickCost} ticks, new timer: ${results.newTimer}, next active: ${results.nextActiveCharacter}`);
    
  } catch (error) {
    results.errors.push(`Action execution error: ${error.message}`);
    console.error('TurnManager action execution failed:', error);
  }
  
  return results;
}

/**
 * Gets the current state of all character timers for UI display
 * @param {Object} world - The world object
 * @returns {Object} Timer state information
 */
export function getCharacterTimersState(world) {
  const state = {
    gameTick: world.turnSystem.gameTick,
    activeCharacterId: world.turnSystem.activeCharacterId,
    characterTimers: {},
    readyCharacters: []
  };
  
  // Build character timer info with names for UI display
  for (const [entityIdStr, timer] of Object.entries(world.turnSystem.characterTimers)) {
    const entityId = parseInt(entityIdStr);
    const marineComponent = getComponent(world, entityId, 'isMarine');
    const speedComponent = getComponent(world, entityId, 'speed');
    
    state.characterTimers[entityId] = {
      timer,
      speed: speedComponent?.current || 0,
      name: marineComponent?.name || `Entity ${entityId}`,
      isReady: timer <= 0,
      isActive: entityId === world.turnSystem.activeCharacterId
    };
    
    if (timer <= 0) {
      state.readyCharacters.push(entityId);
    }
  }
  
  return state;
}

/**
 * Validates that the turn system is in a consistent state
 * Used for debugging and testing
 * @param {Object} world - The world object
 * @returns {Object} Validation results
 */
export function validateTurnSystem(world) {
  const validation = {
    isValid: true,
    warnings: [],
    errors: []
  };
  
  try {
    // Check that all characters with speed have timers
    const speedEntities = getEntitiesWithComponent(world, 'speed');
    for (const entityId of speedEntities) {
      if (!world.turnSystem.characterTimers.hasOwnProperty(entityId)) {
        validation.errors.push(`Character ${entityId} has speed but no timer`);
        validation.isValid = false;
      }
    }
    
    // Check that all timers have corresponding speed components
    for (const entityIdStr of Object.keys(world.turnSystem.characterTimers)) {
      const entityId = parseInt(entityIdStr);
      if (!hasComponent(world, entityId, 'speed')) {
        validation.warnings.push(`Timer exists for ${entityId} but no speed component`);
      }
    }
    
    // Check active character is valid
    if (world.turnSystem.activeCharacterId !== null) {
      if (!world.turnSystem.characterTimers.hasOwnProperty(world.turnSystem.activeCharacterId)) {
        validation.errors.push(`Active character ${world.turnSystem.activeCharacterId} has no timer`);
        validation.isValid = false;
      } else if (world.turnSystem.characterTimers[world.turnSystem.activeCharacterId] > 0) {
        validation.warnings.push(`Active character ${world.turnSystem.activeCharacterId} is not ready to act`);
      }
    }
    
  } catch (error) {
    validation.errors.push(`Validation error: ${error.message}`);
    validation.isValid = false;
  }
  
  return validation;
}

/**
 * Debug utility to force advance time until someone can act
 * Useful for testing and development
 * @param {Object} world - The world object (will be modified)
 * @param {number} maxTicks - Maximum ticks to advance (prevents infinite loops)
 * @returns {Object} Results of forced advancement
 */
export function forceAdvanceToNextTurn(world, maxTicks = 100) {
  const results = {
    ticksAdvanced: 0,
    activeCharacter: null,
    timedOut: false
  };
  
  while (results.ticksAdvanced < maxTicks) {
    const nextCharacter = getNextCharacterToAct(world);
    if (nextCharacter !== null) {
      world.turnSystem.activeCharacterId = nextCharacter;
      results.activeCharacter = nextCharacter;
      break;
    }
    
    advanceTick(world);
    results.ticksAdvanced++;
  }
  
  if (results.ticksAdvanced >= maxTicks) {
    results.timedOut = true;
    console.warn(`Force advance timed out after ${maxTicks} ticks`);
  }
  
  return results;
}
