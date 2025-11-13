// Mini-CoALA Agent.js
// Single-character decision policy wrapper.
// Uses WorkingMemory + ActionSpace and MVP priority rules (self -> mission -> squad -> explore).

import { ActionSpace } from '../mechanics/ActionSpace.js';
import { WorkingMemory } from './WorkingMemory.js';

/**
 * @typedef {ReturnType<typeof WorkingMemory.buildForCharacter>} WorkingMemoryView
 */

export class Agent {
  /**
   * @param {Object} config
   * @param {string} config.id
   * @param {string} [config.personality] // optional tag for future biasing
   */
  constructor(config) {
    this.id = config.id;
    this.personality = config.personality || 'default';
  }

  /**
   * Decide next action for this agent.
   * This is a pure helper that can be swapped out or wrapped by an LLM-based policy later.
   *
   * @param {WorkingMemoryView} wm
   * @param {import('../mechanics/ActionSpace.js').CandidateAction[]} availableActions
   * @returns {import('../mechanics/ActionSpace.js').CandidateAction | null}
   */
  decideAction(wm, availableActions) {
    if (!wm || !wm.self || availableActions.length === 0) return null;

    const self = wm.self;
    const band = ActionSpace.panicBand(self.stress);

    // If in panic band, prefer panic action (actual action object built by DecisionLoop)
    if (band !== 'NONE') {
      // Returning null here signals DecisionLoop to use buildPanicAction instead.
      return null;
    }

    // MVP priority order:
    // 1. Self-Preservation
    const selfPres = this._chooseSelfPreservation(self, availableActions);
    if (selfPres) return selfPres;

    // 2. Mission Objectives
    const missionAct = this._chooseMissionAction(wm, availableActions);
    if (missionAct) return missionAct;

    // 3. Squad Support
    const squadAct = this._chooseSquadSupport(wm, availableActions);
    if (squadAct) return squadAct;

    // 4. Exploration / default
    const exploreAct = this._chooseExploration(wm, availableActions);
    if (exploreAct) return exploreAct;

    // Fallback: just OBSERVE if available
    return (
      availableActions.find((a) => a.type === ActionSpace.ACTION_TYPES?.OBSERVE) ||
      availableActions[0] ||
      null
    );
  }

  _chooseSelfPreservation(self, actions) {
    // Low health --> TAKE_COVER or FLEE-like MOVE
    if (self.health <= 1) {
      const cover = actions.find((a) => a.type === ActionSpace.ACTION_TYPES.TAKE_COVER);
      if (cover) return cover;
    }
    return null;
  }

  _chooseMissionAction(wm, actions) {
    if (wm.mission.complete || wm.mission.failed) return null;

    // Simple heuristic: prefer INTERACT in objective context,
    // or MOVE actions if mission not done.
    const interact = actions.find((a) => a.type === ActionSpace.ACTION_TYPES.INTERACT);
    if (interact) return interact;

    const move = actions.find((a) => a.type === ActionSpace.ACTION_TYPES.MOVE);
    if (move) return move;

    return null;
  }

  _chooseSquadSupport(wm, actions) {
    // Heal injured ally if possible
    const heal = actions.find(
      (a) => a.type === ActionSpace.ACTION_TYPES.APPLY_FIRST_AID
    );
    if (heal) return heal;

    // Take cover if many hostiles (MVP: if any hostiles are present)
    if (wm.location && wm.location.hostiles && wm.location.hostiles.length > 0) {
      const cover = actions.find(
        (a) => a.type === ActionSpace.ACTION_TYPES.TAKE_COVER
      );
      if (cover) return cover;
    }

    return null;
  }

  _chooseExploration(wm, actions) {
    // Prefer MOVE as a generic exploration step if nothing else chosen.
    const move = actions.find((a) => a.type === ActionSpace.ACTION_TYPES.MOVE);
    if (move) return move;

    // Otherwise OBSERVE the current room.
    const observe = actions.find(
      (a) => a.type === ActionSpace.ACTION_TYPES.OBSERVE
    );
    if (observe) return observe;

    return null;
  }
}

export default Agent;