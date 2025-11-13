// Mini-CoALA WorkingMemory.js
// Builds per-character working memory from EventLog + GameState.
// This is the AI-facing summary, not authoritative state.

import { EventLog } from '../core/EventLog.js';
import { GameState } from '../core/GameState.js';

/**
 * Build working memory for a single character.
 *
 * @param {string} characterId
 * @param {GameState|import('../core/GameState.js').WorldState} worldStateOrFactory
 * @param {EventLog} eventLog
 * @param {number} [windowSize=50] - how many ticks back to include for recentEvents
 * @returns {{
 *   self: {
 *     id: string;
 *     name: string;
 *     location: string;
 *     health: number;
 *     maxHealth: number;
 *     stress: number;
 *     alive: boolean;
 *     incapacitated: boolean;
 *     gear: string[];
 *   } | null;
 *   location: {
 *     id: string;
 *     occupants: string[];
 *     hostiles: string[];
 *   } | null;
 *   squad: {
 *     members: Array<{
 *       id: string;
 *       name: string;
 *       location: string;
 *       health: number;
 *       stress: number;
 *       alive: boolean;
 *       incapacitated: boolean;
 *     }>;
 *   };
 *   mission: {
 *     id: string;
 *     type: string;
 *     complete: boolean;
 *     failed: boolean;
 *     statusText: string;
 *   };
 *   recentEvents: import('../core/EventLog.js').GameEvent[];
 * }}
 */
export function buildForCharacter(characterId, worldStateOrFactory, eventLog, windowSize = 50) {
  const state =
    typeof worldStateOrFactory?.characters === 'object'
      ? worldStateOrFactory
      : GameState.fromEvents(
          eventLog instanceof EventLog ? eventLog : [],
          worldStateOrFactory?.staticData || { characters: [], rooms: [], mission: {} }
        );

  const self = state.characters[characterId] || null;
  const location = self ? state.rooms[self.location] || null : null;

  // Squad: all other known characters
  const squadMembers = Object.values(state.characters)
    .filter((c) => c.id !== characterId)
    .map((c) => ({
      id: c.id,
      name: c.name,
      location: c.location,
      health: c.health,
      stress: c.stress,
      alive: c.alive,
      incapacitated: c.incapacitated
    }));

  // Mission summary is passed through directly
  const mission = {
    id: state.mission.id,
    type: state.mission.type,
    complete: state.mission.complete,
    failed: state.mission.failed,
    statusText: state.mission.statusText
  };

  // Recent events relevant to this character within the tick window
  const cutoff = Math.max(0, (state.lastTick || 0) - windowSize);
  const allEvents =
    eventLog instanceof EventLog ? eventLog.getAll() : Array.isArray(eventLog) ? eventLog : [];
  const recentEvents = allEvents.filter((e) => {
    if (typeof e.tick !== 'number' || e.tick < cutoff) return false;
    // Events involving this character or its room are considered relevant
    if (e.actor === characterId || e.target === characterId) return true;
    if (location && e.location === location.id) return true;
    return false;
  });

  return {
    self,
    location,
    squad: { members: squadMembers },
    mission,
    recentEvents
  };
}

export const WorkingMemory = { buildForCharacter };

export default WorkingMemory;