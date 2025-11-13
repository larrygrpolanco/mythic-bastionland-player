// Mini-CoALA GameState.js
// Pure, derived snapshot of world/agents from static data + EventLog.
// This is the core "state from events" module for Phase 1.

import { EventLog } from './EventLog.js';

/**
 * @typedef {Object} CharacterStatic
 * @property {string} id
 * @property {string} name
 * @property {Object} attributes
 * @property {Object} skills
 * @property {number} health
 * @property {string[]} gear
 * @property {Object} flavor
 */

/**
 * @typedef {Object} RoomStatic
 * @property {string} id
 * @property {string} name
 * @property {string[]} [connections]
 */

/**
 * @typedef {Object} MissionStatic
 * @property {string} id
 * @property {string} type // "RETRIEVE" | "ACTIVATE" | "RESCUE"
 * @property {Object} params
 */

/**
 * Static data bundle to keep API simple.
 * Long-term memory for MVP: immutable game definition.
 * @typedef {Object} StaticData
 * @property {CharacterStatic[]} characters
 * @property {RoomStatic[]} rooms
 * @property {MissionStatic} mission
 */

/**
 * @typedef {Object} CharacterRuntimeState
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {number} maxHealth
 * @property {number} health
 * @property {number} stress
 * @property {boolean} alive
 * @property {boolean} incapacitated
 * @property {string[]} gear
 */

/**
 * @typedef {Object} RoomRuntimeState
 * @property {string} id
 * @property {string[]} occupants
 * @property {string[]} hostiles
 */

/**
 * @typedef {Object} MissionRuntimeState
 * @property {string} id
 * @property {string} type
 * @property {boolean} complete
 * @property {boolean} failed
 * @property {string} statusText
 */

/**
 * @typedef {Object} WorldState
 * @property {Object.<string, CharacterRuntimeState>} characters
 * @property {Object.<string, RoomRuntimeState>} rooms
 * @property {MissionRuntimeState} mission
 * @property {number} lastTick
 */

export class GameState {
  /**
   * Purely derive the current world state from events + static data.
   * No side effects, deterministic, replayable.
   *
   * @param {GameEvent[] | EventLog} source
   * @param {StaticData} staticData
   * @returns {WorldState}
   */
  static fromEvents(source, staticData) {
    const events = source instanceof EventLog ? source.getAll() : source || [];

    // Initialize characters from static data
    /** @type {Object.<string, CharacterRuntimeState>} */
    const characters = {};
    for (const c of staticData.characters || []) {
      characters[c.id] = {
        id: c.id,
        name: c.name,
        // Default location can be overridden by events; caller can ensure spawn events
        location: 'start',
        maxHealth: typeof c.health === 'number' ? c.health : (c.attributes?.strength || 3),
        health: typeof c.health === 'number' ? c.health : (c.attributes?.strength || 3),
        stress: 0,
        alive: true,
        incapacitated: false,
        gear: Array.isArray(c.gear) ? [...c.gear] : []
      };
    }

    // Initialize rooms from static data
    /** @type {Object.<string, RoomRuntimeState>} */
    const rooms = {};
    for (const r of staticData.rooms || []) {
      rooms[r.id] = {
        id: r.id,
        occupants: [],
        hostiles: []
      };
    }

    // Basic mission state scaffold
    /** @type {MissionRuntimeState} */
    const mission = {
      id: staticData.mission?.id || 'mvp-mission',
      type: staticData.mission?.type || 'RETRIEVE',
      complete: false,
      failed: false,
      statusText: 'In progress'
    };

    let lastTick = 0;

    // Apply events in chronological order
    for (const evt of events) {
      if (typeof evt.tick === 'number' && evt.tick > lastTick) {
        lastTick = evt.tick;
      }

      switch (evt.type) {
        case 'SPAWN': {
          // Optionally set initial location
          const ch = characters[evt.actor];
          if (ch && evt.location && rooms[evt.location]) {
            ch.location = evt.location;
          }
          break;
        }

        case 'MOVE': {
          const ch = characters[evt.actor];
          if (ch && evt.success !== false && evt.target && rooms[evt.target]) {
            ch.location = evt.target;
          }
          break;
        }

        case 'DAMAGE': {
          const ch = characters[evt.target || evt.actor];
          if (ch && evt.damage) {
            ch.health = Math.max(0, ch.health - evt.damage);
            if (ch.health === 0) {
              ch.incapacitated = true;
              ch.alive = false;
            }
          }
          break;
        }

        case 'HEAL': {
          const ch = characters[evt.target || evt.actor];
          if (ch && evt.damage) {
            const amount = evt.damage;
            ch.health = Math.min(ch.maxHealth, ch.health + amount);
            if (ch.health > 0) {
              ch.incapacitated = false;
              ch.alive = true;
            }
          }
          break;
        }

        case 'STRESS_CHANGE': {
          const ch = characters[evt.actor];
          if (ch && typeof evt.damage === 'number') {
            // reuse "damage" field as delta to avoid over-spec in MVP
            ch.stress = Math.max(0, Math.min(10, ch.stress + evt.damage));
          }
          break;
        }

        case 'PANIC': {
          const ch = characters[evt.actor];
          if (ch) {
            // PANIC events are informational for now; behavior resolved elsewhere.
            // Could mark last panic type if needed.
          }
          break;
        }

        case 'MISSION_COMPLETE': {
          mission.complete = true;
          mission.failed = false;
          mission.statusText = evt.details || 'Objective complete';
          break;
        }

        case 'MISSION_FAILED': {
          mission.failed = true;
          mission.complete = false;
          mission.statusText = evt.details || 'Mission failed';
          break;
        }

        default:
          // Other event types (ATTACK, INTERACT, etc.) are either translated
          // into DAMAGE/HEAL/STRESS_CHANGE or are narrative-only for MVP.
          break;
      }
    }

    // Rebuild room occupants from character locations
    for (const room of Object.values(rooms)) {
      room.occupants = [];
    }
    for (const ch of Object.values(characters)) {
      if (!ch.alive && !ch.incapacitated) {
        // dead but not flagged incapacitated; allow as-is for now
      }
      const roomId = ch.location;
      if (rooms[roomId]) {
        rooms[roomId].occupants.push(ch.id);
      }
    }

    return {
      characters,
      rooms,
      mission,
      lastTick
    };
  }
}

export default GameState;