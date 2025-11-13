// Mini-CoALA LLMContextBuilder.js
// Phase 4: Minimal, deterministic context builders for optional LLM policies.
// No side effects, no direct network/API usage.

import { EventLog } from '../core/EventLog.js';
import { GameState } from '../core/GameState.js';
import { WorkingMemory } from './WorkingMemory.js';
import { ACTION_TYPES } from '../mechanics/ActionSpace.js';
import { buildAgentDecisionPrompt, buildOrderParsingPrompt } from './PromptTemplates.js';

/**
 * @typedef {import('../core/EventLog.js').GameEvent} GameEvent
 * @typedef {import('../core/GameState.js').WorldState} WorldState
 * @typedef {import('../mechanics/ActionSpace.js').CandidateAction} CandidateAction
 */

function toWorldState(gameState, staticData) {
  if (gameState && typeof gameState.characters === 'object') return gameState;
  if (gameState instanceof EventLog) {
    return GameState.fromEvents(gameState, staticData || {});
  }
  return GameState.fromEvents([], staticData || {});
}

function getAllEvents(eventLog) {
  if (!eventLog) return [];
  if (eventLog instanceof EventLog && typeof eventLog.getAll === 'function') {
    return eventLog.getAll();
  }
  if (Array.isArray(eventLog)) return eventLog;
  if (typeof eventLog.getAll === 'function') return eventLog.getAll();
  return [];
}

function sliceRecentEventsFor(characterId, allEvents, limit = 20) {
  const relevant = allEvents.filter(
    (e) =>
      e.actor === characterId ||
      e.target === characterId ||
      e.to === characterId ||
      e.from === characterId
  );
  if (relevant.length <= limit) return relevant;
  return relevant.slice(relevant.length - limit);
}

function normalizeAvailableActions(availableActions) {
  if (!Array.isArray(availableActions)) return [];
  const allowed = new Set(Object.values(ACTION_TYPES));
  return availableActions
    .filter((a) => a && typeof a.type === 'string' && allowed.has(a.type))
    .map((a) => ({
      type: a.type,
      target: a.target ?? null
    }));
}

/**
 * Build LLM-facing context for an in-world agent.
 *
 * Shape (intentionally compact):
 * {
 *   character: { id, name, role?, location, health, stress },
 *   mission: { id, objective, status },
 *   squad: { members: [{ id, name, location }] },
 *   map: { knownRooms: string[] },
 *   recent_events: GameEvent[],
 *   available_actions: [{ type, target }]
 * }
 */
export function buildAgentContext({
  characterId,
  eventLog,
  staticData = {},
  gameState,
  workingMemory,
  availableActions
}) {
  if (!characterId) {
    throw new Error('buildAgentContext: characterId is required');
  }

  const world = toWorldState(gameState, staticData);
  const allEvents = getAllEvents(eventLog);

  const wm =
    workingMemory ||
    WorkingMemory.buildForCharacter(characterId, world, eventLog || allEvents);

  const self = wm.self || world.characters?.[characterId] || null;

  const missionSrc = world.mission || staticData.mission || {};
  const mission = {
    id: missionSrc.id || 'mission',
    objective:
      missionSrc.objective || missionSrc.brief || 'Execute current orders and survive.',
    status: missionSrc.status || 'ongoing'
  };

  const squadMembers = (wm.squad?.members || []).map((m) => ({
    id: m.id,
    name: m.name || m.id,
    location: m.location || null
  }));

  const knownRooms = (staticData.rooms || []).map((r) => r.id);

  return {
    character: self && {
      id: self.id,
      name: self.name || self.id,
      role: self.role || undefined,
      location: self.location || null,
      health: self.health,
      stress: self.stress
    },
    mission,
    squad: {
      members: squadMembers
    },
    map: {
      knownRooms
    },
    recent_events: sliceRecentEventsFor(characterId, allEvents),
    available_actions: normalizeAvailableActions(availableActions)
  };
}

/**
 * Build minimal context for NL order parsing.
 *
 * {
 *   commandText,
 *   knownCharacters: [id],
 *   knownRooms: [id],
 *   mission: { objective }
 * }
 */
export function buildOrderParsingContext({ commandText, commanderView }) {
  const view = commanderView || {};
  const knownCharacters = Array.isArray(view.marines)
    ? view.marines.map((m) => m.id)
    : [];
  const knownRooms = view.map?.exploredRooms || view.map?.unexploredRooms
    ? [
        ...(view.map.exploredRooms || []),
        ...(view.map.unexploredRooms || [])
      ]
    : [];

  return {
    commandText,
    knownCharacters,
    knownRooms,
    mission: view.mission
      ? {
          objective: view.mission.objective,
          progress: view.mission.progress,
          extractionStatus: view.mission.extractionStatus
        }
      : null
  };
}

/**
 * Backwards-compat thin wrapper for existing Phase 3-style usage:
 * buildContext + buildPromptString.
 */
export class LLMContextBuilder {
  static buildContext(params) {
    return buildAgentContext(params);
  }

  static buildPromptString(context) {
    return buildAgentDecisionPrompt(context);
  }

  static buildOrderParsingContext(params) {
    return buildOrderParsingContext(params);
  }

  static buildOrderParsingPrompt(context) {
    return buildOrderParsingPrompt(context);
  }
}

export default LLMContextBuilder;