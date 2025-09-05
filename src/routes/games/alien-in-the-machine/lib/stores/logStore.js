/**
 * logStore.js - Store for AI Dialogue and Game Events
 * 
 * This store manages the radio log / communication interface that will be crucial
 * for Phase 3 AI integration. It captures AI thoughts, dialogue, and system events.
 * 
 * Key Principles:
 * - Centralized logging for all AI communications and game events
 * - Persistent history for debugging and player immersion
 * - Structured message format for consistent display
 * - Different message types for different UI presentations
 * 
 * Future AI Development Notes:
 * - AI systems will log thoughts and dialogue here during decision-making
 * - Messages should include context like entity names, timestamps, priorities
 * - Consider message filtering and search capabilities for debugging
 * - Support for different communication channels (squad radio, station alerts, etc.)
 */

import { writable, derived } from 'svelte/store';

/**
 * Message types for different kinds of log entries
 * This helps the UI format messages appropriately
 */
export const MESSAGE_TYPES = {
  SYSTEM: 'system',           // System messages, errors, game events
  AI_DIALOGUE: 'ai_dialogue', // AI character speaking
  AI_THOUGHT: 'ai_thought',   // AI internal reasoning
  PLAYER_COMMAND: 'player_command', // Player issued commands
  ACTION_RESULT: 'action_result',   // Results of actions
  MISSION_UPDATE: 'mission_update', // Mission objective changes
  ENVIRONMENTAL: 'environmental'    // Environmental descriptions, atmosphere
};

/**
 * Main log store - contains all messages in chronological order
 */
export const logStore = writable([]);

/**
 * Counter for unique message IDs
 */
let messageIdCounter = 1;

/**
 * Derived store for filtering messages by type
 * Useful for showing only certain kinds of messages in different UI panels
 */
export const dialogueStore = derived(
  logStore,
  ($log) => $log.filter(msg => msg.type === MESSAGE_TYPES.AI_DIALOGUE)
);

export const thoughtStore = derived(
  logStore,
  ($log) => $log.filter(msg => msg.type === MESSAGE_TYPES.AI_THOUGHT)
);

export const systemStore = derived(
  logStore,
  ($log) => $log.filter(msg => [MESSAGE_TYPES.SYSTEM, MESSAGE_TYPES.ACTION_RESULT, MESSAGE_TYPES.MISSION_UPDATE].includes(msg.type))
);

/**
 * Derived store for recent messages (last 20)
 * Useful for main display to avoid UI performance issues
 */
export const recentLogStore = derived(
  logStore,
  ($log) => $log.slice(-20)
);

/**
 * Store for message filtering settings
 */
export const logFiltersStore = writable({
  showSystem: true,
  showDialogue: true,
  showThoughts: true,
  showPlayerCommands: true,
  showActionResults: true,
  showMissionUpdates: true,
  showEnvironmental: true
});

/**
 * Derived store that applies current filters
 */
export const filteredLogStore = derived(
  [logStore, logFiltersStore],
  ([$log, $filters]) => {
    return $log.filter(message => {
      switch (message.type) {
        case MESSAGE_TYPES.SYSTEM:
          return $filters.showSystem;
        case MESSAGE_TYPES.AI_DIALOGUE:
          return $filters.showDialogue;
        case MESSAGE_TYPES.AI_THOUGHT:
          return $filters.showThoughts;
        case MESSAGE_TYPES.PLAYER_COMMAND:
          return $filters.showPlayerCommands;
        case MESSAGE_TYPES.ACTION_RESULT:
          return $filters.showActionResults;
        case MESSAGE_TYPES.MISSION_UPDATE:
          return $filters.showMissionUpdates;
        case MESSAGE_TYPES.ENVIRONMENTAL:
          return $filters.showEnvironmental;
        default:
          return true;
      }
    });
  }
);

// ========================
// LOG MANAGEMENT FUNCTIONS
// ========================

/**
 * Add a message to the log
 * @param {string} type - Message type from MESSAGE_TYPES
 * @param {string} content - The message content
 * @param {Object} options - Additional message options
 * @param {string} options.entityName - Name of entity that generated this message
 * @param {number} options.entityId - ID of entity that generated this message
 * @param {string} options.priority - Message priority (low, normal, high, critical)
 * @param {Object} options.metadata - Additional metadata for debugging
 */
export function addLogMessage(type, content, options = {}) {
  const message = {
    id: messageIdCounter++,
    type,
    content,
    timestamp: new Date().toISOString(),
    gameTime: Date.now(), // Will be replaced with actual game time in Phase 1
    entityName: options.entityName || 'System',
    entityId: options.entityId || null,
    priority: options.priority || 'normal',
    metadata: options.metadata || {}
  };
  
  logStore.update(log => [...log, message]);
  
  // Debug logging
  console.log(`[${type.toUpperCase()}] ${message.entityName}: ${content}`);
}

/**
 * Convenience functions for common message types
 */
export function logSystem(content, options = {}) {
  addLogMessage(MESSAGE_TYPES.SYSTEM, content, options);
}

export function logDialogue(entityName, content, entityId = null, options = {}) {
  addLogMessage(MESSAGE_TYPES.AI_DIALOGUE, content, {
    ...options,
    entityName,
    entityId
  });
}

export function logThought(entityName, content, entityId = null, options = {}) {
  addLogMessage(MESSAGE_TYPES.AI_THOUGHT, content, {
    ...options,
    entityName,
    entityId
  });
}

export function logPlayerCommand(command, options = {}) {
  addLogMessage(MESSAGE_TYPES.PLAYER_COMMAND, command, {
    ...options,
    entityName: 'Commander'
  });
}

export function logActionResult(content, options = {}) {
  addLogMessage(MESSAGE_TYPES.ACTION_RESULT, content, options);
}

export function logMissionUpdate(content, options = {}) {
  addLogMessage(MESSAGE_TYPES.MISSION_UPDATE, content, {
    ...options,
    priority: 'high'
  });
}

export function logEnvironmental(content, options = {}) {
  addLogMessage(MESSAGE_TYPES.ENVIRONMENTAL, content, options);
}

/**
 * Clear all messages from the log
 */
export function clearLog() {
  logStore.set([]);
  messageIdCounter = 1;
  console.log('Log cleared');
}

/**
 * Remove messages older than specified time
 * @param {number} maxAgeMs - Maximum age in milliseconds
 */
export function pruneOldMessages(maxAgeMs) {
  const cutoffTime = Date.now() - maxAgeMs;
  logStore.update(log => 
    log.filter(message => new Date(message.timestamp).getTime() > cutoffTime)
  );
}

/**
 * Get log messages as JSON string (for saving/debugging)
 * @returns {string} JSON representation of all log messages
 */
export function exportLog() {
  let logData = '';
  logStore.subscribe(log => {
    logData = JSON.stringify(log, null, 2);
  })();
  return logData;
}

/**
 * Load log messages from JSON (for testing/loading saved logs)
 * @param {string} logJSON - JSON string of log messages
 */
export function importLog(logJSON) {
  try {
    const messages = JSON.parse(logJSON);
    logStore.set(messages);
    // Update counter to prevent ID conflicts
    messageIdCounter = Math.max(...messages.map(m => m.id), 0) + 1;
    console.log('Log imported');
  } catch (error) {
    console.error('Failed to import log:', error);
  }
}

/**
 * Toggle filter for a specific message type
 * @param {string} filterType - The filter to toggle (e.g., 'showDialogue')
 */
export function toggleLogFilter(filterType) {
  logFiltersStore.update(filters => ({
    ...filters,
    [filterType]: !filters[filterType]
  }));
}

// ========================
// PHASE 0 INITIALIZATION
// Initialize with welcome messages for testing
// ========================

// Add initial system messages for Phase 0
logSystem("Alien in the Machine - Phase 0 Foundation");
logSystem("ECS Architecture initialized");
logSystem("Game engine ready for Phase 1 development");
logEnvironmental("The docking bay airlock seals shut with a heavy thud. Emergency lighting casts long shadows across the abandoned station.");
