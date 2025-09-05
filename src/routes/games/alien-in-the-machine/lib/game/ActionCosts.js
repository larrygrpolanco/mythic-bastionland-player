/**
 * ActionCosts.js - Centralized Action Cost Definitions
 * 
 * This module defines the tick costs for all actions in the game.
 * Having all costs in one place makes balancing easier and ensures consistency.
 * 
 * Design Philosophy:
 * - Light actions (3-4 ticks): Quick looks, simple interactions
 * - Medium actions (6-8 ticks): Searches, item usage, careful actions
 * - Heavy actions (10+ ticks): Movement, complex interactions, dangerous actions
 * - Emergency actions (1-2 ticks): Reactions, defensive moves
 * 
 * Balancing Considerations:
 * - Fast characters (Speed 5) can do light actions roughly every 1 tick
 * - Slow characters (Speed 2) need 2-3 ticks to recover from light actions
 * - Heavy actions create meaningful tactical delays
 * - Cost differences should matter for decision-making
 */

/**
 * Core Action Costs - Phase 2 Implementation
 * These are the fundamental actions available to all characters
 */
export const CORE_ACTIONS = {
  // Movement Actions (Heavy - require crossing rooms, checking doors)
  MOVE_ROOM: 10,           // Move between connected rooms
  MOVE_ADJACENT: 8,        // Move within same room to different area
  
  // Investigation Actions (Medium - require time and focus)
  SEARCH_AREA: 6,          // Search containers, furniture, debris
  SEARCH_THOROUGH: 10,     // Deep search with higher success chance
  EXAMINE_ITEM: 4,         // Look closely at specific item
  
  // Interaction Actions (Variable based on complexity)
  USE_ITEM: 4,             // Use simple item (flashlight, tool)
  USE_COMPLEX_ITEM: 8,     // Use complex item (computer, machinery)
  PICK_UP_ITEM: 3,         // Pick up small item
  PICK_UP_HEAVY: 6,        // Pick up large/heavy item
  DROP_ITEM: 2,            // Drop item from inventory
  
  // Quick Actions (Light - minimal time investment)
  QUICK_LOOK: 3,           // Fast glance around current area
  LISTEN: 3,               // Focus on hearing sounds
  CHECK_HEALTH: 2,         // Quick self-assessment
  COMMUNICATE: 2,          // Send short radio message
  
  // Stealth Actions (Medium - require care and patience)
  HIDE_IN_COVER: 6,        // Find and use concealment
  SNEAK_MOVE: 12,          // Move quietly and carefully
  PEEK_AROUND: 4,          // Careful look around corner
  
  // Emergency Actions (Very Light - reactions and defensive moves)
  DUCK_FOR_COVER: 1,       // Immediate defensive reaction
  DODGE_DANGER: 2,         // Quick evasive maneuver
  EMERGENCY_STOP: 1,       // Stop current action immediately
};

/**
 * Medical Actions - Available to characters with medical skills or items
 * Doc will be most effective, but others can attempt basic aid
 */
export const MEDICAL_ACTIONS = {
  FIRST_AID: 8,            // Basic medical treatment
  ADVANCED_MEDICAL: 15,    // Complex medical procedures (Doc specialty)
  APPLY_BANDAGE: 4,        // Quick wound treatment
  INJECT_MEDICINE: 3,      // Use medical injection
  MEDICAL_SCAN: 6,         // Check someone's health status
  STABILIZE_PATIENT: 12,   // Emergency life support
};

/**
 * Technical Actions - Available to characters with technical skills or access to systems
 * Rook will be most effective, but others can attempt basic operations
 */
export const TECHNICAL_ACTIONS = {
  HACK_TERMINAL: 15,       // Break into computer system
  USE_COMPUTER: 6,         // Normal computer operation
  REPAIR_ITEM: 12,         // Fix broken equipment
  BYPASS_LOCK: 10,         // Override electronic lock
  SCAN_WITH_DEVICE: 4,     // Use handheld scanner
  ACCESS_LOGS: 8,          // Read system logs/data
  OVERRIDE_DOOR: 12,       // Force electronic door open
};

/**
 * Combat Actions - For future combat scenarios (Phase 4+)
 * Designed to be fast and tactical
 */
export const COMBAT_ACTIONS = {
  QUICK_ATTACK: 4,         // Fast, less accurate attack
  AIMED_ATTACK: 8,         // Careful, more accurate attack
  DEFENSIVE_STANCE: 3,     // Prepare to defend
  RELOAD_WEAPON: 5,        // Reload firearm
  THROW_GRENADE: 6,        // Thrown explosive
  TAKE_COVER: 2,           // Get behind protection
};

/**
 * Environmental Actions - Interaction with the station itself
 * These may become available as the world expands
 */
export const ENVIRONMENTAL_ACTIONS = {
  OPEN_DOOR: 2,            // Open unlocked door
  FORCE_DOOR: 8,           // Break down locked door
  CLIMB_OBSTACLE: 6,       // Overcome physical barrier
  ACTIVATE_SWITCH: 3,      // Use simple control
  READ_SIGN: 2,            // Read displayed information
  BREAK_GLASS: 4,          // Smash window/container
};

/**
 * Get action cost by name
 * Searches through all action categories to find the specified action
 * @param {string} actionName - The name of the action (e.g., 'MOVE_ROOM')
 * @returns {number|null} The tick cost of the action, or null if not found
 */
export function getActionCost(actionName) {
  // Search through all action categories
  const allActions = {
    ...CORE_ACTIONS,
    ...MEDICAL_ACTIONS,
    ...TECHNICAL_ACTIONS,
    ...COMBAT_ACTIONS,
    ...ENVIRONMENTAL_ACTIONS
  };
  
  return allActions[actionName] || null;
}

/**
 * Get all available actions for a character based on their skills and situation
 * This will be expanded in Phase 2 to consider character skills, items, and location
 * @param {Object} characterComponents - All components for a character
 * @param {Object} worldContext - Relevant world state (location, items, etc.)
 * @returns {Array} Array of action objects with costs
 */
export function getAvailableActionsForCharacter(characterComponents, worldContext = {}) {
  const availableActions = [];
  
  // Core actions available to everyone
  Object.entries(CORE_ACTIONS).forEach(([actionName, cost]) => {
    availableActions.push({
      name: actionName,
      cost,
      category: 'core',
      description: getActionDescription(actionName)
    });
  });
  
  // Add medical actions if character has medical skills or items
  if (characterComponents.skills?.medical > 5 || worldContext.hasMedicalItems) {
    Object.entries(MEDICAL_ACTIONS).forEach(([actionName, cost]) => {
      availableActions.push({
        name: actionName,
        cost,
        category: 'medical',
        description: getActionDescription(actionName),
        requiresSkill: 'medical'
      });
    });
  }
  
  // Add technical actions if character has technical skills or access to systems
  if (characterComponents.skills?.technical > 5 || worldContext.hasSystemAccess) {
    Object.entries(TECHNICAL_ACTIONS).forEach(([actionName, cost]) => {
      availableActions.push({
        name: actionName,
        cost,
        category: 'technical',
        description: getActionDescription(actionName),
        requiresSkill: 'technical'
      });
    });
  }
  
  return availableActions;
}

/**
 * Get human-readable description for an action
 * @param {string} actionName - The action name
 * @returns {string} User-friendly description
 */
export function getActionDescription(actionName) {
  const descriptions = {
    // Core Actions
    MOVE_ROOM: "Move to a connected room",
    MOVE_ADJACENT: "Move to different area in current room", 
    SEARCH_AREA: "Search containers and furniture",
    SEARCH_THOROUGH: "Perform detailed search of area",
    EXAMINE_ITEM: "Look closely at an item",
    USE_ITEM: "Use a simple item",
    USE_COMPLEX_ITEM: "Operate complex equipment",
    PICK_UP_ITEM: "Pick up a small item",
    PICK_UP_HEAVY: "Pick up a heavy item",
    DROP_ITEM: "Drop item from inventory",
    QUICK_LOOK: "Take a quick look around",
    LISTEN: "Listen carefully for sounds",
    CHECK_HEALTH: "Check your health status",
    COMMUNICATE: "Send radio message",
    HIDE_IN_COVER: "Find cover and hide",
    SNEAK_MOVE: "Move quietly and carefully",
    PEEK_AROUND: "Carefully look around corner",
    DUCK_FOR_COVER: "Quick defensive reaction",
    DODGE_DANGER: "Dodge incoming danger",
    EMERGENCY_STOP: "Stop current action immediately",
    
    // Medical Actions
    FIRST_AID: "Provide basic medical treatment",
    ADVANCED_MEDICAL: "Perform complex medical procedure",
    APPLY_BANDAGE: "Apply bandage to wound",
    INJECT_MEDICINE: "Use medical injection",
    MEDICAL_SCAN: "Check someone's health",
    STABILIZE_PATIENT: "Provide emergency life support",
    
    // Technical Actions
    HACK_TERMINAL: "Break into computer system",
    USE_COMPUTER: "Use computer normally",
    REPAIR_ITEM: "Repair broken equipment",
    BYPASS_LOCK: "Override electronic lock",
    SCAN_WITH_DEVICE: "Use handheld scanner",
    ACCESS_LOGS: "Read system data logs",
    OVERRIDE_DOOR: "Force electronic door open",
    
    // Environmental Actions
    OPEN_DOOR: "Open unlocked door",
    FORCE_DOOR: "Force locked door open",
    CLIMB_OBSTACLE: "Climb over obstacle",
    ACTIVATE_SWITCH: "Use control switch",
    READ_SIGN: "Read information display",
    BREAK_GLASS: "Break glass or container"
  };
  
  return descriptions[actionName] || `Perform ${actionName.toLowerCase().replace(/_/g, ' ')}`;
}

/**
 * Modify action cost based on character skills and situation
 * Better skills = lower costs, difficult situations = higher costs
 * @param {string} actionName - The action being performed
 * @param {Object} characterComponents - Character's components
 * @param {Object} situationModifiers - Situation-based modifiers
 * @returns {number} Modified action cost
 */
export function getModifiedActionCost(actionName, characterComponents = {}, situationModifiers = {}) {
  const baseCost = getActionCost(actionName);
  if (!baseCost) return 0;
  
  let modifiedCost = baseCost;
  
  // Skill-based cost reduction
  const skills = characterComponents.skills || {};
  
  // Technical actions benefit from technical skill
  if (TECHNICAL_ACTIONS[actionName] && skills.technical) {
    const skillReduction = Math.floor(skills.technical / 2); // Max -4 ticks at skill 8
    modifiedCost = Math.max(1, modifiedCost - skillReduction);
  }
  
  // Medical actions benefit from medical skill
  if (MEDICAL_ACTIONS[actionName] && skills.medical) {
    const skillReduction = Math.floor(skills.medical / 2);
    modifiedCost = Math.max(1, modifiedCost - skillReduction);
  }
  
  // Stealth actions benefit from stealth skill
  if ((actionName === 'HIDE_IN_COVER' || actionName === 'SNEAK_MOVE') && skills.stealth) {
    const skillReduction = Math.floor(skills.stealth / 3);
    modifiedCost = Math.max(1, modifiedCost - skillReduction);
  }
  
  // Situation modifiers (for future expansion)
  if (situationModifiers.darkness) modifiedCost += 2;
  if (situationModifiers.injured) modifiedCost += 3;
  if (situationModifiers.hasProperTools) modifiedCost = Math.max(1, modifiedCost - 2);
  if (situationModifiers.timePressed) modifiedCost = Math.max(1, modifiedCost - 1);
  
  return Math.round(modifiedCost);
}

/**
 * Get action categories for UI organization
 * @returns {Object} Categories with their actions
 */
export function getActionCategories() {
  return {
    core: {
      name: "Basic Actions",
      actions: CORE_ACTIONS,
      description: "Actions available to all characters"
    },
    medical: {
      name: "Medical Actions", 
      actions: MEDICAL_ACTIONS,
      description: "Medical treatment and health management"
    },
    technical: {
      name: "Technical Actions",
      actions: TECHNICAL_ACTIONS, 
      description: "Computer and equipment operations"
    },
    combat: {
      name: "Combat Actions",
      actions: COMBAT_ACTIONS,
      description: "Defensive and offensive actions"
    },
    environmental: {
      name: "Environmental Actions",
      actions: ENVIRONMENTAL_ACTIONS,
      description: "Interactions with the station"
    }
  };
}
