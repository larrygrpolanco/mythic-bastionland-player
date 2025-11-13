// Mini-CoALA MechanicsEngine.js
// Applies GAME_MECHANICS_MVP.md rules for core resolution.
// Phase 1: keep this minimal, deterministic, and event-driven.

import { ACTION_TYPES, DEFAULT_TICK_COST } from './ActionSpace.js';

/**
 * RNG wrapper so tests can inject deterministic behavior.
 */
function defaultRng() {
  return Math.random();
}

/**
 * Calculate success with simplified MVP rule:
 * successChance = (attribute + skill) * 0.1 + difficultyModifier
 * difficulty is one of: 'easy' | 'normal' | 'hard' | 'extreme'
 */
function computeSuccessChance(attr, skill, difficulty = 'normal') {
  const base = (Number(attr || 0) + Number(skill || 0)) * 0.1;
  let mod = 0;
  switch (difficulty) {
    case 'easy':
      mod = 0.2;
      break;
    case 'hard':
      mod = -0.2;
      break;
    case 'extreme':
      mod = -0.4;
      break;
    default:
      mod = 0;
  }
  return Math.max(0, Math.min(1, base + mod));
}

export class MechanicsEngine {
  /**
   * @param {Object} mechanicsConfig
   *  {
   *    weapons: { [weaponId]: { damage: number } },
   *    armor: { [armorId]: { reduction: number } }
   *  }
   */
  constructor(mechanicsConfig = {}) {
    this.config = {
      weapons: {
        unarmed: { damage: 1 },
        pistol: { damage: 1 },
        rifle: { damage: 2 },
        shotgun: { damage: 3 },
        ...(mechanicsConfig.weapons || {})
      },
      armor: {
        ...(mechanicsConfig.armor || {})
      }
    };
  }

  /**
   * Resolve a single candidate action into one or more events.
   * This does NOT append to the EventLog; caller is responsible.
   *
   * @param {import('./ActionSpace.js').CandidateAction} action
   * @param {import('../core/GameState.js').WorldState} state
   * @param {{ rng?: () => number }} [options]
   * @returns {Array<Object>} events
   */
  resolveAction(action, state, options = {}) {
    const rng = options.rng || defaultRng;
    const actor = state.characters[action.meta?.actorId || action.actorId || action.actor] ||
      state.characters[action.actor];

    const tickCost = action.tickCost ?? DEFAULT_TICK_COST[action.type] ?? 4;
    const base = {
      type: action.type,
      actor: actor ? actor.id : action.actor,
      target: action.target,
      tick: state.lastTick + tickCost
    };

    switch (action.type) {
      case ACTION_TYPES.MOVE:
        return this._resolveMove(base, actor, state, action);

      case ACTION_TYPES.ATTACK:
        return this._resolveAttack(base, actor, state, action, rng);

      case ACTION_TYPES.TAKE_COVER:
        return [
          {
            ...base,
            success: true,
            details: 'Takes cover for improved defense.',
            meta: { defenseBonus: 0.2 }
          }
        ];

      case ACTION_TYPES.INTERACT:
        return [
          {
            ...base,
            success: true,
            details: 'Interacts with environment (MVP: narrative only).'
          }
        ];

      case ACTION_TYPES.OBSERVE:
        return [
          {
            ...base,
            success: true,
            details: 'Scans the area for threats or clues.'
          }
        ];

      case ACTION_TYPES.APPLY_FIRST_AID:
        return this._resolveFirstAid(base, actor, state, action, rng);

      case ACTION_TYPES.PANIC_FREEZE:
      case ACTION_TYPES.PANIC_FLEE:
      case ACTION_TYPES.PANIC_FIGHT:
        return this._resolvePanic(base, actor, state, action, rng);

      default:
        return [
          {
            ...base,
            type: 'UNKNOWN',
            success: false,
            details: `Unknown action type: ${action.type}`
          }
        ];
    }
  }

  // --- Internal resolvers ---

  _resolveMove(base, actor, state, action) {
    if (!actor) {
      return [{ ...base, success: false, details: 'No actor for MOVE.' }];
    }
    if (!action.target || !state.rooms[action.target]) {
      return [{ ...base, success: false, details: 'Invalid MOVE target.' }];
    }
    // Detailed validation (connections, etc.) can be added later.
    return [
      {
        ...base,
        type: 'MOVE',
        success: true,
        details: `${actor.name || actor.id} moves to ${action.target}.`,
        location: action.target
      }
    ];
  }

  _resolveAttack(base, actor, state, action, rng) {
    if (!actor) {
      return [{ ...base, success: false, details: 'No actor for ATTACK.' }];
    }
    const target = state.characters[action.target];
    if (!target) {
      return [{ ...base, success: false, details: 'Invalid ATTACK target.' }];
    }
    if (actor.location !== target.location) {
      return [{ ...base, success: false, details: 'Target not in same room.' }];
    }

    // Determine if ranged or melee by gear; MVP: rifle/pistol/shotgun => ranged, else unarmed
    const hasRanged =
      (actor.gear || []).some((g) =>
        ['pistol', 'rifle', 'shotgun'].includes(g.toLowerCase())
      );
    const weaponId =
      (actor.gear || []).find((g) =>
        ['pistol', 'rifle', 'shotgun'].includes(g.toLowerCase())
      ) || 'unarmed';
    const weapon = this.config.weapons[weaponId.toLowerCase()] || this.config.weapons.unarmed;

    const attr = hasRanged ? actor.attributes?.AGI || actor.attributes?.agility : actor.attributes?.STR || actor.attributes?.strength;
    const skill = actor.skills?.combat || actor.skills?.rangedCombat || actor.skills?.closeCombat || 0;
    const chance = computeSuccessChance(attr, skill, 'normal');
    const roll = rng();

    if (roll <= chance) {
      const damage = weapon.damage || 1;
      return [
        {
          ...base,
          type: 'ATTACK',
          success: true,
          damage,
          details: `${actor.name || actor.id} hits ${
            target.name || target.id
          } for ${damage} damage.`
        },
        {
          ...base,
          type: 'DAMAGE',
          success: true,
          target: target.id,
          damage,
          details: `Damage applied to ${target.name || target.id}.`
        }
      ];
    }

    return [
      {
        ...base,
        type: 'ATTACK',
        success: false,
        details: `${actor.name || actor.id} misses ${target.name || target.id}.`
      }
    ];
  }

  _resolveFirstAid(base, actor, state, action, rng) {
    if (!actor) {
      return [{ ...base, success: false, details: 'No actor for APPLY_FIRST_AID.' }];
    }
    const target = state.characters[action.target];
    if (!target) {
      return [{ ...base, success: false, details: 'Invalid first aid target.' }];
    }
    if (actor.location !== target.location) {
      return [{ ...base, success: false, details: 'Target not in same room.' }];
    }

    const attr = actor.attributes?.EMP || actor.attributes?.empathy || 0;
    const skill = actor.skills?.medical || actor.skills?.medicalAid || 0;
    const chance = computeSuccessChance(attr, skill, 'normal');
    const roll = rng();

    if (roll <= chance) {
      return [
        {
          ...base,
          type: 'APPLY_FIRST_AID',
          success: true,
          details: `${actor.name || actor.id} stabilizes ${target.name || target.id}.`
        },
        {
          ...base,
          type: 'HEAL',
          target: target.id,
          success: true,
          damage: 1, // reuse as heal amount
          details: `Heals 1 health for ${target.name || target.id}.`
        }
      ];
    }

    return [
      {
        ...base,
        type: 'APPLY_FIRST_AID',
        success: false,
        details: `${actor.name || actor.id} fails to stabilize ${target.name || target.id}.`
      }
    ];
  }

  _resolvePanic(base, actor, state, action, rng) {
    if (!actor) {
      return [{ ...base, type: 'PANIC', success: false, details: 'No actor for PANIC.' }];
    }

    if (action.type === ACTION_TYPES.PANIC_FREEZE) {
      return [
        {
          ...base,
          type: 'PANIC',
          panicType: 'FREEZE',
          success: true,
          details: `${actor.name || actor.id} freezes in terror.`
        }
      ];
    }

    if (action.type === ACTION_TYPES.PANIC_FLEE) {
      const targetRoom = action.target || actor.location;
      return [
        {
          ...base,
          type: 'PANIC',
          panicType: 'FLEE',
          success: true,
          target: targetRoom,
          details: `${actor.name || actor.id} flees toward safety.`
        }
      ];
    }

    if (action.type === ACTION_TYPES.PANIC_FIGHT) {
      const target =
        state.characters[action.target] ||
        Object.values(state.characters).find(
          (c) => c.id !== actor.id && c.location === actor.location
        );
      if (!target) {
        return [
          {
            ...base,
            type: 'PANIC',
            panicType: 'FIGHT',
            success: false,
            details: `${actor.name || actor.id} thrashes wildly but hits no one.`
          }
        ];
      }
      // Treat as a reckless attack with higher chance but narrative only for MVP
      return [
        {
          ...base,
          type: 'PANIC',
          panicType: 'FIGHT',
          success: true,
          target: target.id,
          details: `${actor.name || actor.id} lashes out at ${target.name || target.id} in blind panic.`
        }
      ];
    }

    return [
      {
        ...base,
        type: 'PANIC',
        success: false,
        details: 'Unknown PANIC variant.'
      }
    ];
  }

  /**
   * Utility: explicit success check for external callers/tests.
   */
  static checkSuccess(attribute, skill, difficulty, rng = defaultRng) {
    const p = computeSuccessChance(attribute, skill, difficulty);
    return rng() <= p;
  }
}

export default MechanicsEngine;