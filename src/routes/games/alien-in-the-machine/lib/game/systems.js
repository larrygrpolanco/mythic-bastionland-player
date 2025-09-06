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

import { getEntitiesWithComponent, getComponent, hasComponent, addComponent, removeEntity } from './World.js';
import * as TurnManager from './TurnManager.js';
import { getActionCost, getModifiedActionCost, getAvailableActionsForCharacter } from './ActionCosts.js';

/**
 * NEW TICK-BASED SYSTEM: Process individual character action
 * Replaces the old batch processing system with character-centric turns
 * @param {Object} world - The world object (will be modified)
 * @param {number} characterId - The character performing the action
 * @param {string} actionType - The type of action (e.g., 'MOVE_ROOM', 'SEARCH_AREA')
 * @param {Object} actionParams - Additional parameters for the action
 * @returns {Object} Results of the character's action
 */
export function processCharacterAction(world, characterId, actionType, actionParams = {}) {
  const results = {
    characterId,
    actionType,
    success: false,
    tickCost: 0,
    newTimer: null,
    nextActiveCharacter: null,
    actionResults: null,
    errors: []
  };
  
  try {
    // Validate character can act
    if (world.turnSystem.activeCharacterId !== characterId) {
      results.errors.push(`Character ${characterId} is not the active character`);
      return results;
    }
    
    // Get character components for action cost calculation
    const characterComponents = getCharacterComponents(world, characterId);
    if (!characterComponents) {
      results.errors.push(`Character ${characterId} components not found`);
      return results;
    }
    
    // Calculate action cost (including skill modifiers)
    const baseCost = getActionCost(actionType);
    if (!baseCost) {
      results.errors.push(`Unknown action type: ${actionType}`);
      return results;
    }
    
    const modifiedCost = getModifiedActionCost(actionType, characterComponents);
    results.tickCost = modifiedCost;
    
    // Execute the actual action logic
    const action = {
      type: actionType,
      entityId: characterId,
      ...actionParams
    };
    
    const actionResult = executeAction(world, action);
    results.actionResults = actionResult;
    results.success = actionResult.success;
    
    // If action succeeded, apply tick cost through TurnManager
    if (results.success) {
      const turnResult = TurnManager.executeAction(world, characterId, modifiedCost);
      results.newTimer = turnResult.newTimer;
      results.nextActiveCharacter = turnResult.nextActiveCharacter;
      
      if (turnResult.errors.length > 0) {
        results.errors.push(...turnResult.errors);
        results.success = false;
      }
    }
    
    // Update world metadata
    world.metadata.lastUpdate = new Date().toISOString();
    
    console.log('Character action processed:', {
      character: characterId,
      action: actionType,
      cost: modifiedCost,
      success: results.success,
      nextActive: results.nextActiveCharacter
    });
    
  } catch (error) {
    results.errors.push(`Character action processing error: ${error.message}`);
    console.error('Character action processing failed:', error);
  }
  
  return results;
}


/**
 * Advance time until someone can act
 * Used when all characters are on cooldown
 * @param {Object} world - The world object (will be modified)
 * @returns {Object} Results of time advancement
 */
export function advanceTimeUntilAction(world) {
  const results = {
    ticksAdvanced: 0,
    activeCharacter: null,
    charactersReady: [],
    errors: []
  };
  
  try {
    // Keep advancing ticks until someone is ready
    const maxTicks = 50; // Prevent infinite loops
    while (results.ticksAdvanced < maxTicks) {
      const nextCharacter = TurnManager.getNextCharacterToAct(world);
      if (nextCharacter !== null) {
        results.activeCharacter = nextCharacter;
        break;
      }
      
      const tickResult = TurnManager.advanceTick(world);
      results.ticksAdvanced++;
      results.charactersReady.push(...tickResult.newlyReady);
      results.errors.push(...tickResult.errors);
      
      if (tickResult.errors.length > 0) {
        break;
      }
    }
    
    if (results.ticksAdvanced >= maxTicks) {
      results.errors.push('Time advancement timed out - possible infinite loop');
    }
    
  } catch (error) {
    results.errors.push(`Time advancement error: ${error.message}`);
    console.error('Time advancement failed:', error);
  }
  
  return results;
}

/**
 * Get all components for a character (helper function)
 * @param {Object} world - The world object
 * @param {number} characterId - The character entity ID
 * @returns {Object|null} All character components or null if not found
 */
function getCharacterComponents(world, characterId) {
  const components = {};
  
  // Gather all components for this character
  Object.keys(world.components).forEach(componentType => {
    if (world.components[componentType][characterId]) {
      components[componentType] = world.components[componentType][characterId];
    }
  });
  
  return Object.keys(components).length > 0 ? components : null;
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
  const { entityId, targetRoomId } = action;
  
  if (!targetRoomId) {
    return { success: false, error: 'No target room specified' };
  }
  
  // Get current position
  const currentPosition = getComponent(world, entityId, 'position');
  if (!currentPosition) {
    return { success: false, error: 'Entity has no position component' };
  }
  
  const currentRoomId = currentPosition.roomId;
  
  // Check if target room exists
  if (!world.roomEntityIds || !world.roomEntityIds[targetRoomId]) {
    return { success: false, error: `Target room '${targetRoomId}' does not exist` };
  }
  
  // Check if rooms are connected
  const connections = world.roomConnections[currentRoomId] || [];
  if (!connections.includes(targetRoomId)) {
    return { success: false, error: `Cannot move from ${currentRoomId} to ${targetRoomId} - rooms not connected` };
  }
  
  // Check if entity is hidden (cannot move while hidden)
  const hiddenComponent = getComponent(world, entityId, 'hidden');
  if (hiddenComponent && hiddenComponent.isHidden) {
    return { success: false, error: 'Cannot move while hidden' };
  }
  
  // Update position
  currentPosition.roomId = targetRoomId;
  
  // Get character name for logging
  const marineComponent = getComponent(world, entityId, 'isMarine');
  const characterName = marineComponent?.name || `Entity ${entityId}`;
  
  // Get room names for better messaging
  const currentRoomComponent = getComponent(world, world.roomEntityIds[currentRoomId], 'isRoom');
  const targetRoomComponent = getComponent(world, world.roomEntityIds[targetRoomId], 'isRoom');
  
  const message = `${characterName} moved from ${currentRoomComponent?.name || currentRoomId} to ${targetRoomComponent?.name || targetRoomId}`;
  
  return { 
    success: true, 
    details: message,
    previousRoom: currentRoomId,
    newRoom: targetRoomId
  };
}

/**
 * Pick Up Item Action - Phase 2
 * @param {Object} world - The world object
 * @param {Object} action - { type: 'pickUpItem', entityId: number, itemId: number }
 */
export function executePickUpItem(world, action) {
  const { entityId, itemId } = action;
  
  if (!itemId) {
    return { success: false, error: 'No item specified' };
  }
  
  // Get character position and inventory
  const characterPosition = getComponent(world, entityId, 'position');
  const characterInventory = getComponent(world, entityId, 'inventory');
  
  if (!characterPosition) {
    return { success: false, error: 'Character has no position component' };
  }
  
  if (!characterInventory) {
    return { success: false, error: 'Character has no inventory component' };
  }
  
  // Find the item entity by ID
  let itemEntityId = null;
  if (world.itemEntityIds && world.itemEntityIds[itemId]) {
    itemEntityId = world.itemEntityIds[itemId];
  } else {
    return { success: false, error: `Item '${itemId}' not found` };
  }
  
  // Get item components
  const itemComponent = getComponent(world, itemEntityId, 'isItem');
  const itemPosition = getComponent(world, itemEntityId, 'position');
  const pickupableComponent = getComponent(world, itemEntityId, 'pickupable');
  
  if (!itemComponent || !itemPosition || !pickupableComponent) {
    return { success: false, error: 'Item is not pickupable' };
  }
  
  // Check if item is in the same room as character
  if (itemPosition.roomId !== characterPosition.roomId) {
    return { success: false, error: 'Item is not in the same room' };
  }
  
  // Check inventory capacity
  const currentWeight = characterInventory.items.reduce((total, item) => {
    const itemId = item.id || item;
    const itemEntity = world.itemEntityIds?.[itemId];
    if (itemEntity) {
      const itemComp = getComponent(world, itemEntity, 'isItem');
      return total + (itemComp?.weight || 0);
    }
    return total;
  }, 0);
  
  if (currentWeight + pickupableComponent.weight > characterInventory.capacity) {
    return { success: false, error: 'Inventory is full' };
  }
  
  // Add item to character's inventory
  characterInventory.items.push({
    id: itemComponent.id,
    name: itemComponent.name,
    type: itemComponent.type,
    weight: itemComponent.weight
  });
  
  // Remove item from world (it's now in inventory)
  removeEntity(world, itemEntityId);
  delete world.itemEntityIds[itemId];
  
  // Get character name for logging
  const marineComponent = getComponent(world, entityId, 'isMarine');
  const characterName = marineComponent?.name || `Entity ${entityId}`;
  
  return { 
    success: true, 
    details: `${characterName} picked up ${itemComponent.name}`,
    itemName: itemComponent.name,
    newInventoryCount: characterInventory.items.length
  };
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
 * @param {Object} action - { type: 'searchArea', entityId: number, targetId?: number }
 */
export function executeSearchArea(world, action) {
  const { entityId, targetId } = action;
  
  // Get character position and skills
  const characterPosition = getComponent(world, entityId, 'position');
  const characterSkills = getComponent(world, entityId, 'skills');
  
  if (!characterPosition) {
    return { success: false, error: 'Character has no position component' };
  }
  
  // If targetId is specified, search that specific furniture
  if (targetId) {
    return executeSearchFurniture(world, entityId, targetId, characterSkills);
  }
  
  // Otherwise, search for searchable furniture in the current room
  const searchableEntities = getEntitiesWithComponent(world, 'searchable');
  const roomSearchables = searchableEntities.filter(furnitureId => {
    const furniturePosition = getComponent(world, furnitureId, 'position');
    return furniturePosition && furniturePosition.roomId === characterPosition.roomId;
  });
  
  if (roomSearchables.length === 0) {
    return { success: true, details: 'You search the area but find nothing of interest.' };
  }
  
  // Search the first unsearched item, or a random one
  const unsearched = roomSearchables.filter(id => {
    const searchable = getComponent(world, id, 'searchable');
    return searchable && !searchable.searched;
  });
  
  const targetFurnitureId = unsearched.length > 0 ? 
    unsearched[Math.floor(Math.random() * unsearched.length)] :
    roomSearchables[Math.floor(Math.random() * roomSearchables.length)];
    
  return executeSearchFurniture(world, entityId, targetFurnitureId, characterSkills);
}

/**
 * Helper function to search a specific piece of furniture
 * @param {Object} world - The world object
 * @param {number} entityId - The character entity ID
 * @param {number} furnitureId - The furniture entity ID  
 * @param {Object} characterSkills - The character's skills
 * @returns {Object} Search result
 */
function executeSearchFurniture(world, entityId, furnitureId, characterSkills) {
  const searchableComponent = getComponent(world, furnitureId, 'searchable');
  const furnitureComponent = getComponent(world, furnitureId, 'isFurniture');
  
  if (!searchableComponent || !furnitureComponent) {
    return { success: false, error: 'Target is not searchable' };
  }
  
  // Check if locked
  if (searchableComponent.locked) {
    return { success: false, error: `${furnitureComponent.name} is locked` };
  }
  
  // Calculate success chance based on skills
  const baseChance = 50;
  const skillBonus = (characterSkills?.technical || 0) * 5;
  const difficultyPenalty = searchableComponent.difficulty * 10;
  const successChance = Math.max(10, baseChance + skillBonus - difficultyPenalty);
  
  const roll = Math.random() * 100;
  const marineComponent = getComponent(world, entityId, 'isMarine');
  const characterName = marineComponent?.name || `Entity ${entityId}`;
  
  // Mark as searched regardless of success
  searchableComponent.searched = true;
  
  if (roll > successChance) {
    return { 
      success: true, 
      details: `${characterName} searched ${furnitureComponent.name} but found nothing useful.`,
      found: []
    };
  }
  
  // Success - reveal items
  const foundItems = [...searchableComponent.items];
  searchableComponent.items = []; // Clear the container
  
  if (foundItems.length === 0) {
    return { 
      success: true, 
      details: `${characterName} thoroughly searched ${furnitureComponent.name} but it was empty.`,
      found: []
    };
  }
  
  // Create item entities for found items (they become pickupable in the room)
  const createdItems = [];
  foundItems.forEach(itemId => {
    if (world.itemEntityIds && world.itemEntityIds[itemId]) {
      // Item already exists, just move it to this room
      const itemEntityId = world.itemEntityIds[itemId];
      const itemPosition = getComponent(world, itemEntityId, 'position');
      const furniturePosition = getComponent(world, furnitureId, 'position');
      if (itemPosition && furniturePosition) {
        itemPosition.roomId = furniturePosition.roomId;
        const itemComponent = getComponent(world, itemEntityId, 'isItem');
        createdItems.push(itemComponent?.name || itemId);
      }
    }
  });
  
  const itemList = createdItems.join(', ');
  
  return { 
    success: true, 
    details: `${characterName} searched ${furnitureComponent.name} and found: ${itemList}`,
    found: createdItems
  };
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
