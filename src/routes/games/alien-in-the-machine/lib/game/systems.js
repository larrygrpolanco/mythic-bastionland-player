/**
 * systems.js - Game Logic Systems for ECS Architecture
 * 
 * This module contains all the "systems" that operate on entities and components.
 * Systems are pure functions that take the world state and return modifications.
 * 
 * System Execution Order (critical for future AI development):
 * 1. aiSystem - AI entities decide what actions to take
 * 2. actionSystem - Process all queued actions
 * 3. missionSystem - Check win/loss conditions
 * 
 * Key Principles:
 * - Systems never directly modify the world - they return changes to apply
 * - All systems are pure functions for testability
 * - Systems communicate through the actionQueue only
 * - Keep systems focused on single responsibilities
 * 
 * Future AI Development Notes:
 * - When adding new systems, follow the established pattern
 * - Always validate inputs and handle edge cases
 * - Use descriptive variable names and JSDoc comments
 * - Log important decisions for debugging
 */

import { getEntitiesWithComponent, getComponent, hasComponent, addComponent } from './World.js';

/**
 * Main game loop - executes all systems in the correct order
 * This is the central function that advances the game by one turn
 * @param {Object} world - The world object (will be modified)
 * @returns {Object} Summary of what happened this turn
 */
export function processGameTurn(world) {
  const turnSummary = {
    turn: ++world.currentTurn,
    actionsProcessed: 0,
    aiDecisions: 0,
    missionUpdates: [],
    errors: []
  };
  
  try {
    // Phase 3: AI System - Let AI entities make decisions
    if (world.metadata.phase >= 3) {
      const aiResults = processAISystem(world);
      turnSummary.aiDecisions = aiResults.decisions;
      turnSummary.errors.push(...aiResults.errors);
    }
    
    // Phase 2: Action System - Process all queued actions
    if (world.metadata.phase >= 2) {
      const actionResults = processActionSystem(world);
      turnSummary.actionsProcessed = actionResults.processed;
      turnSummary.errors.push(...actionResults.errors);
    }
    
    // Phase 4: Mission System - Check objectives and win conditions
    if (world.metadata.phase >= 4) {
      const missionResults = processMissionSystem(world);
      turnSummary.missionUpdates = missionResults.updates;
      turnSummary.errors.push(...missionResults.errors);
    }
    
    // Update world state
    world.metadata.lastUpdate = new Date().toISOString();
    
  } catch (error) {
    turnSummary.errors.push(`Critical system error: ${error.message}`);
    console.error('Game turn processing failed:', error);
  }
  
  return turnSummary;
}

/**
 * AI System - Phase 3
 * Processes all entities with AI control, generates decisions
 * @param {Object} world - The world object
 * @returns {Object} Results of AI processing
 */
export function processAISystem(world) {
  const results = {
    decisions: 0,
    errors: []
  };
  
  // Find all AI-controlled entities
  const aiEntities = getEntitiesWithComponent(world, 'aiControl');
  
  for (const entityId of aiEntities) {
    try {
      // Phase 3: This will be implemented when we add AI
      // For now, just a placeholder
      results.decisions++;
      
      // Future implementation will:
      // 1. Build context for the AI (what the entity can see/know)
      // 2. Call LLM service with structured prompt
      // 3. Parse response and queue valid actions
      // 4. Log AI thoughts and dialogue
      
    } catch (error) {
      results.errors.push(`AI error for entity ${entityId}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Action System - Phase 2
 * Processes all actions in the queue, applying their effects to the world
 * @param {Object} world - The world object (will be modified)
 * @returns {Object} Results of action processing
 */
export function processActionSystem(world) {
  const results = {
    processed: 0,
    errors: []
  };
  
  // Process all actions in queue
  const actionsToProcess = [...world.actionQueue];
  world.actionQueue = []; // Clear the queue
  
  for (const action of actionsToProcess) {
    try {
      const actionResult = executeAction(world, action);
      if (actionResult.success) {
        results.processed++;
      } else {
        results.errors.push(`Action failed: ${actionResult.error}`);
      }
    } catch (error) {
      results.errors.push(`Action execution error: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Mission System - Phase 4
 * Checks all active objectives and updates mission state
 * @param {Object} world - The world object
 * @returns {Object} Results of mission processing
 */
export function processMissionSystem(world) {
  const results = {
    updates: [],
    errors: []
  };
  
  // Find all entities with objectives
  const missionEntities = getEntitiesWithComponent(world, 'objective');
  
  for (const entityId of missionEntities) {
    try {
      const objective = getComponent(world, entityId, 'objective');
      const completionCheck = checkObjectiveCompletion(world, objective);
      
      if (completionCheck.completed) {
        results.updates.push({
          entityId,
          objective: objective.type,
          status: 'COMPLETED'
        });
        
        // Update game state if needed
        if (objective.type === 'PRIMARY_MISSION') {
          world.gameState = 'WON';
        }
      }
      
    } catch (error) {
      results.errors.push(`Mission check error for entity ${entityId}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Executes a single action and applies its effects
 * @param {Object} world - The world object (will be modified)
 * @param {Object} action - The action to execute
 * @returns {Object} Action result with success/failure and details
 */
export function executeAction(world, action) {
  if (!action || !action.type || !action.entityId) {
    return { success: false, error: 'Invalid action format' };
  }
  
  // Validate entity exists
  if (!world.entities.active.has(action.entityId)) {
    return { success: false, error: `Entity ${action.entityId} does not exist` };
  }
  
  // Route to specific action handler
  switch (action.type) {
    case 'moveTo':
      return executeMoveTo(world, action);
    case 'pickUpItem':
      return executePickUpItem(world, action);
    case 'useItem':
      return executeUseItem(world, action);
    case 'hideInCover':
      return executeHideInCover(world, action);
    case 'searchArea':
      return executeSearchArea(world, action);
    default:
      return { success: false, error: `Unknown action type: ${action.type}` };
  }
}

/**
 * Move To Action - Phase 2
 * @param {Object} world - The world object
 * @param {Object} action - { type: 'moveTo', entityId: number, targetRoomId: string }
 */
export function executeMoveTo(world, action) {
  // Phase 2: This will be implemented with full movement logic
  // For now, just a placeholder that validates the structure
  
  if (!action.targetRoomId) {
    return { success: false, error: 'No target room specified' };
  }
  
  // Future implementation will:
  // 1. Check if entity can move (not hidden, not incapacitated)
  // 2. Validate target room exists and is connected
  // 3. Check if door is locked
  // 4. Update entity's position component
  // 5. Trigger any room entry effects
  
  return { success: true, details: `Entity ${action.entityId} moved to ${action.targetRoomId}` };
}

/**
 * Pick Up Item Action - Phase 2
 * @param {Object} world - The world object
 * @param {Object} action - { type: 'pickUpItem', entityId: number, itemId: number }
 */
export function executePickUpItem(world, action) {
  // Phase 2: Full implementation with inventory management
  return { success: true, details: `Entity ${action.entityId} picked up item ${action.itemId}` };
}

/**
 * Use Item Action - Phase 2
 * @param {Object} world - The world object
 * @param {Object} action - { type: 'useItem', entityId: number, itemId: number, target?: number }
 */
export function executeUseItem(world, action) {
  // Phase 2: Implementation depends on item types
  return { success: true, details: `Entity ${action.entityId} used item ${action.itemId}` };
}

/**
 * Hide In Cover Action - Phase 2
 * @param {Object} world - The world object
 * @param {Object} action - { type: 'hideInCover', entityId: number, locationId: number }
 */
export function executeHideInCover(world, action) {
  // Phase 2: Stealth mechanics
  return { success: true, details: `Entity ${action.entityId} hid in cover` };
}

/**
 * Search Area Action - Phase 2
 * @param {Object} world - The world object
 * @param {Object} action - { type: 'searchArea', entityId: number, targetId: number }
 */
export function executeSearchArea(world, action) {
  // Phase 2: Search mechanics with randomization
  return { success: true, details: `Entity ${action.entityId} searched area` };
}

/**
 * Checks if an objective is completed based on current world state
 * @param {Object} world - The world object
 * @param {Object} objective - The objective component data
 * @returns {Object} Completion status and details
 */
export function checkObjectiveCompletion(world, objective) {
  // Phase 4: Full objective checking logic
  switch (objective.type) {
    case 'FETCH_ITEM':
      // Check if specified item is in specified location
      return { completed: false, progress: 0 };
    case 'RESCUE_SURVIVOR':
      // Check if survivor is safe
      return { completed: false, progress: 0 };
    case 'REACH_LOCATION':
      // Check if entity reached target
      return { completed: false, progress: 0 };
    default:
      return { completed: false, progress: 0, error: 'Unknown objective type' };
  }
}

/**
 * Utility function to add an action to the world's action queue
 * Used by UI components and AI system
 * @param {Object} world - The world object
 * @param {Object} action - The action to queue
 */
export function queueAction(world, action) {
  if (!action || !action.type || !action.entityId) {
    console.warn('Attempted to queue invalid action:', action);
    return false;
  }
  
  world.actionQueue.push({
    ...action,
    queuedAt: Date.now()
  });
  
  return true;
}

/**
 * Debug utility to get available actions for an entity
 * Used by debug UI to show what actions an entity can take
 * @param {Object} world - The world object
 * @param {number} entityId - The entity to check
 * @returns {Array} Array of possible action objects
 */
export function getAvailableActions(world, entityId) {
  const availableActions = [];
  
  if (!world.entities.active.has(entityId)) {
    return availableActions;
  }
  
  // Check what actions this entity can perform based on its components and context
  const position = getComponent(world, entityId, 'position');
  const inventory = getComponent(world, entityId, 'inventory');
  
  // Movement actions - Phase 2
  if (position) {
    // Future: Add movement options based on current room's doors
    availableActions.push({
      type: 'moveTo',
      label: 'Move to adjacent room',
      requiresTarget: true
    });
  }
  
  // Inventory actions - Phase 2
  if (inventory && inventory.items.length > 0) {
    availableActions.push({
      type: 'useItem',
      label: 'Use item from inventory',
      requiresTarget: true
    });
  }
  
  // Environmental actions - Phase 2
  availableActions.push({
    type: 'searchArea',
    label: 'Search current area',
    requiresTarget: false
  });
  
  return availableActions;
}
