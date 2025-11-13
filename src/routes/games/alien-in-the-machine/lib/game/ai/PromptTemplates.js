// Mini-CoALA PromptTemplates.js
// Phase 4: Minimal prompt helpers for LLMDecisionEngine.
// - Pure formatting helpers, deterministic.
// - No external deps or side effects.

import { ACTION_TYPES } from '../mechanics/ActionSpace.js';

/**
 * Build agent decision prompt from buildAgentContext() shape.
 *
 * Expected context:
 * {
 *   character,
 *   mission,
 *   squad,
 *   map,
 *   recent_events,
 *   available_actions
 * }
 *
 * Returns a single compact string with:
 * - Brief situation summary
 * - Explicit JSON-only response schema.
 */
export function buildAgentDecisionPrompt(context) {
  const c = context.character || {};
  const mission = context.mission || {};
  const squad = context.squad || {};
  const map = context.map || {};
  const recent = context.recent_events || [];
  const actions = context.available_actions || [];

  const allowedTypes = Object.values(ACTION_TYPES).join(', ');

  const header = [
    `You are ${c.name || c.id || 'a marine'} making a single decision.`,
    `Mission: ${mission.objective || 'Follow orders and survive.'} (status: ${
      mission.status || 'ongoing'
    }).`
  ].join(' ');

  const squadLine =
    Array.isArray(squad.members) && squad.members.length
      ? 'Squad: ' +
        squad.members
          .map((m) => `${m.id}@${m.location || 'unknown'}`)
          .join(', ')
      : 'Squad: unknown.';

  const mapLine = Array.isArray(map.knownRooms)
    ? `KnownRooms: ${map.knownRooms.join(', ') || 'none'}.`
    : '';

  const recentLines =
    recent.length > 0
      ? 'RecentEvents:\n' +
        recent
          .slice(-10)
          .map((e) => {
            const parts = [`t${e.tick}`];
            if (e.type) parts.push(e.type);
            if (e.actor) parts.push(`actor=${e.actor}`);
            if (e.target) parts.push(`target=${e.target}`);
            if (e.location) parts.push(`loc=${e.location}`);
            return parts.join(' ');
          })
          .join('\n')
      : 'RecentEvents: none';

  const actionsLines =
    actions.length > 0
      ? 'AvailableActions:\n' +
        actions
          .map((a, i) =>
            JSON.stringify({
              index: i,
              type: a.type,
              target: a.target ?? null
            })
          )
          .join('\n')
      : 'AvailableActions: []';

  const instructions = [
    'Choose exactly ONE next action.',
    `The "type" MUST be one of: ${allowedTypes}.`,
    'The chosen action MUST match one of the listed AvailableActions (type and, if present, target).',
    'Respond with STRICT JSON ONLY, no extra text.',
    'JSON schema:',
    '{"type":"ACTION_TYPE","target":"ID-or-null"}'
  ].join('\n');

  return [header, squadLine, mapLine, recentLines, actionsLines, instructions]
    .filter(Boolean)
    .join('\n');
}

/**
 * Build minimal prompt for parsing commander natural language orders.
 *
 * Context:
 * {
 *   commandText,
 *   knownCharacters: [id],
 *   knownRooms: [id],
 *   mission: { objective, progress, extractionStatus }
 * }
 *
 * Response schema:
 * {
 *   "intent": "short verb phrase",
 *   "targets": ["character-or-room-ids"]
 * }
 */
export function buildOrderParsingPrompt(context) {
  const { commandText, knownCharacters = [], knownRooms = [], mission } = context;

  const missionLine = mission
    ? `MissionObjective: ${mission.objective || ''}`.trim()
    : '';

  const lines = [
    'You translate commander radio orders into a structured JSON plan.',
    missionLine,
    `KnownCharacters: ${knownCharacters.join(', ') || 'none'}.`,
    `KnownRooms: ${knownRooms.join(', ') || 'none'}.`,
    `CommandText: "${commandText}"`
  ].filter(Boolean);

  const instructions = [
    'Decide the primary intent and explicit targets based ONLY on CommandText and known ids.',
    'Use only character and room ids from the KnownCharacters / KnownRooms lists.',
    'If the order is unclear, return your best constrained guess; do NOT invent new ids.',
    'Respond with STRICT JSON ONLY, no explanations.',
    'JSON schema:',
    '{"intent":"short-intent-label","targets":["id-1","id-2"]}'
  ].join('\n');

  return [...lines, instructions].join('\n');
}

export default {
  buildAgentDecisionPrompt,
  buildOrderParsingPrompt
};