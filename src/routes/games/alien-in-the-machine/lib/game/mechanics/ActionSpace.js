// Mini-CoALA ActionSpace.js
// Enumerates and validates MVP actions (7 core + 3 panic states).
// Implements only structural logic; MechanicsEngine applies actual effects.

export const ACTION_TYPES = {
  MOVE: 'MOVE',
  ATTACK: 'ATTACK',
  TAKE_COVER: 'TAKE_COVER',
  INTERACT: 'INTERACT',
  OBSERVE: 'OBSERVE',
  APPLY_FIRST_AID: 'APPLY_FIRST_AID',
  // Panic / involuntary
  PANIC_FREEZE: 'PANIC_FREEZE',
  PANIC_FLEE: 'PANIC_FLEE',
  PANIC_FIGHT: 'PANIC_FIGHT'
};

// Default tick costs from GAME_MECHANICS_MVP.md
export const DEFAULT_TICK_COST = {
  [ACTION_TYPES.MOVE]: 8,
  [ACTION_TYPES.ATTACK]: 8,
  [ACTION_TYPES.TAKE_COVER]: 4,
  [ACTION_TYPES.INTERACT]: 8,
  [ACTION_TYPES.OBSERVE]: 4,
  [ACTION_TYPES.APPLY_FIRST_AID]: 8,
  [ACTION_TYPES.PANIC_FREEZE]: 4,
  [ACTION_TYPES.PANIC_FLEE]: 8,
  [ACTION_TYPES.PANIC_FIGHT]: 8
};

/**
 * Represents one candidate action for an agent.
 * @typedef {Object} CandidateAction
 * @property {string} type
 * @property {string} [target]   // room id, entity id, or object id depending on type
 * @property {number} tickCost
 * @property {Object} [meta]     // free-form hints (e.g. reason, priority)
 */

export class ActionSpace {
  /**
   * Determine valid actions for a character from current game state.
   * This is intentionally conservative and stateless; AI/LLM chooses among these.
   *
   * @param {string} characterId
   * @param {import('../core/GameState.js').GameState|import('../core/GameState.js').WorldState} gameState
   * @returns {CandidateAction[]}
   */
  static getValidActions(characterId, gameState) {
    const state =
      typeof gameState?.characters === 'object' ? gameState : null;
    if (!state) return [];

    const ch = state.characters[characterId];
    if (!ch || !ch.alive) return [];

    const actions = [];

    // MOVE: allow moving to any connected room if available in static-derived state
    const currentRoom = state.rooms[ch.location];
    if (currentRoom && Array.isArray(currentRoom.connections)) {
      for (const nextId of currentRoom.connections) {
        if (state.rooms[nextId]) {
          actions.push(
            ActionSpace._build(ACTION_TYPES.MOVE, {
              target: nextId,
              reason: 'Move to connected room'
            })
          );
        }
      }
    }

    // ATTACK: if any hostile or enemy is in same room (MVP assumes same-room combat)
    if (currentRoom && Array.isArray(currentRoom.hostiles)) {
      for (const hostileId of currentRoom.hostiles) {
        actions.push(
          ActionSpace._build(ACTION_TYPES.ATTACK, {
            target: hostileId,
            reason: 'Attack hostile in same room'
          })
        );
      }
    }

    // TAKE_COVER: always allowed if room conceptually has cover (MVP: assume yes)
    actions.push(
      ActionSpace._build(ACTION_TYPES.TAKE_COVER, {
        reason: 'Improve defense until next turn'
      })
    );

    // INTERACT: placeholder; actual interactables come from mission/map data.
    // For MVP, expose generic INTERACT to allow MechanicsEngine to validate.
    actions.push(
      ActionSpace._build(ACTION_TYPES.INTERACT, {
        reason: 'Interact with environment / objective in room'
      })
    );

    // OBSERVE: always valid to scan room
    actions.push(
      ActionSpace._build(ACTION_TYPES.OBSERVE, {
        reason: 'Scan room for threats or clues'
      })
    );

    // APPLY_FIRST_AID: if there is an ally in room who is injured
    for (const occupantId of currentRoom?.occupants || []) {
      if (occupantId === ch.id) continue;
      const ally = state.characters[occupantId];
      if (ally && ally.health < ally.maxHealth && ally.alive) {
        actions.push(
          ActionSpace._build(ACTION_TYPES.APPLY_FIRST_AID, {
            target: ally.id,
            reason: 'Heal injured ally in same room'
          })
        );
      }
    }

    return actions;
  }

  /**
   * Check which panic band a stress value implies, based on MVP thresholds.
   *
   * @param {number} stress
   * @returns {'NONE'|'FREEZE'|'FLEE'|'FIGHT'}
   */
  static panicBand(stress) {
    if (stress >= 9) return 'FIGHT';
    if (stress >= 7) return 'FLEE';
    if (stress >= 5) return 'FREEZE';
    return 'NONE';
  }

  /**
   * Build a forced panic action based on current stress and situation.
   * This is used when a panic trigger has already been determined by MechanicsEngine.
   *
   * @param {string} characterId
   * @param {import('../core/GameState.js').WorldState} state
   * @param {number} stress
   * @returns {CandidateAction | null}
   */
  static buildPanicAction(characterId, state, stress) {
    const band = ActionSpace.panicBand(stress);
    if (band === 'NONE') return null;

    const ch = state.characters[characterId];
    const room = ch ? state.rooms[ch.location] : null;

    if (!ch || !room) return null;

    if (band === 'FREEZE') {
      return ActionSpace._build(ACTION_TYPES.PANIC_FREEZE, {
        reason: 'Panic: FREEZE'
      });
    }

    if (band === 'FLEE') {
      // MVP: FLEE to a generic "previous safe room" is not tracked.
      // As a placeholder, if start room exists, run there; otherwise no-op.
      const fallback = state.rooms['start'] ? 'start' : ch.location;
      return ActionSpace._build(ACTION_TYPES.PANIC_FLEE, {
        target: fallback,
        reason: 'Panic: FLEE toward perceived safety'
      });
    }

    if (band === 'FIGHT') {
      // Attack nearest target in same room (enemy or ally).
      const targetId =
        (room.hostiles && room.hostiles[0]) ||
        (room.occupants &&
          room.occupants.find((id) => id !== characterId)) ||
        null;
      return ActionSpace._build(ACTION_TYPES.PANIC_FIGHT, {
        target: targetId || undefined,
        reason: 'Panic: FIGHT nearest target'
      });
    }

    return null;
  }

  /**
   * Internal helper to normalize candidate actions.
   * @param {string} type
   * @param {{ target?: string; reason?: string }} [meta]
   * @returns {CandidateAction}
   */
  static _build(type, meta = {}) {
    return {
      type,
      target: meta.target,
      tickCost: DEFAULT_TICK_COST[type] ?? 4,
      meta: {
        ...meta
      }
    };
  }
}

export default ActionSpace;