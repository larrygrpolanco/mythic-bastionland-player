// Static data bundle for the Alien in the Machine Mini-CoALA MVP.
//
// This file provides the minimal LongTermMemory needed to run autonomous
// simulations with DecisionLoop:
// - characters: imported from crew.json
// - rooms: a tiny connected map
// - mission: a simple RETRIEVE objective
//
// Mechanics, AI, and UI should treat this as read-only configuration.

import crewJson from '../../../crew.json';

/**
 * Rooms layout (5-10 rooms, simple graph).
 *
 * start: Shuttle / Airlock (safe)
 * corridor_a: Connects start to med_bay and operations
 * med_bay: Safe-ish support room
 * operations: Contains mission objective terminal
 * storage: Optional branch to demonstrate exploration
 */
export const rooms = [
  {
    id: 'start',
    name: 'Docking Bay / Airlock',
    connections: ['corridor_a'],
    tags: ['start', 'safe', 'extraction']
  },
  {
    id: 'corridor_a',
    name: 'Main Access Corridor',
    connections: ['start', 'med_bay', 'operations', 'storage'],
    tags: ['chokepoint']
  },
  {
    id: 'med_bay',
    name: 'Med Bay',
    connections: ['corridor_a'],
    tags: ['support']
  },
  {
    id: 'operations',
    name: 'Operations Control',
    connections: ['corridor_a'],
    tags: ['objective']
  },
  {
    id: 'storage',
    name: 'Cargo Storage',
    connections: ['corridor_a'],
    tags: ['loot']
  }
];

/**
 * Mission config (MVP single objective).
 *
 * Type: RETRIEVE
 * - Reach operations
 * - "Secure" the objective (modeled as INTERACT in that room)
 * - Then any surviving crew return to start.
 *
 * Higher layers (MissionRunner/tests) interpret params; core engine only
 * needs id/type/params for context if desired.
 */
export const mission = {
  id: 'mvp-retrieve-intel',
  type: 'RETRIEVE',
  params: {
    targetRoomId: 'operations',
    extractionRoomId: 'start'
  }
};

/**
 * characters from crew.json:
 * - crew.characters is the source of truth
 */
export const characters = (crewJson && crewJson.characters) || [];

/**
 * Combined staticData bundle used by GameState and DecisionLoop.
 */
export const staticData = {
  characters,
  rooms,
  mission
};

export default staticData;