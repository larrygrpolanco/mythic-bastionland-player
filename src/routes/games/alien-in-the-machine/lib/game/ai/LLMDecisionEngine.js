// Mini-CoALA LLMDecisionEngine.js
// Phase 4: Pure adapter around injected callLLM.
// - No direct mutations to state or logs.
// - No live API concerns here; callLLM is provided by caller.
// - Validates outputs against available actions / commander view.

import { ACTION_TYPES } from '../mechanics/ActionSpace.js';
import { buildAgentContext, buildOrderParsingContext, LLMContextBuilder } from './LLMContextBuilder.js';
import { buildAgentDecisionPrompt, buildOrderParsingPrompt } from './PromptTemplates.js';

/**
 * @typedef {import('../mechanics/ActionSpace.js').CandidateAction} CandidateAction
 */

function parseJsonSafe(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function validateAgentAction(parsed, availableActions) {
  if (!parsed || !Array.isArray(availableActions) || availableActions.length === 0) {
    return null;
  }

  const allowed = new Set(Object.values(ACTION_TYPES));
  const type = typeof parsed.type === 'string' ? parsed.type.trim() : '';
  if (!type || !allowed.has(type)) return null;

  const desiredTarget =
    parsed.target === undefined || parsed.target === null
      ? undefined
      : String(parsed.target);

  let candidate =
    availableActions.find(
      (a) =>
        a &&
        a.type === type &&
        (desiredTarget === undefined || a.target === desiredTarget)
    ) || null;

  if (!candidate) {
    candidate = availableActions.find((a) => a && a.type === type) || null;
  }

  if (!candidate) return null;

  return {
    type: candidate.type,
    target: candidate.target,
    tickCost: candidate.tickCost,
    meta: candidate.meta ? { ...candidate.meta } : undefined
  };
}

function validateParsedOrder(order, commanderView) {
  if (!order || typeof order !== 'object') return null;

  const intent =
    typeof order.intent === 'string' && order.intent.trim()
      ? order.intent.trim()
      : null;
  const targets = Array.isArray(order.targets)
    ? order.targets.map((t) => String(t))
    : [];

  if (!intent || targets.length === 0) return null;

  const knownChars = new Set(
    (commanderView.marines || []).map((m) => m.id)
  );
  const knownRooms = new Set(
    [
      ...(commanderView.map?.exploredRooms || []),
      ...(commanderView.map?.unexploredRooms || [])
    ].map((r) => String(r))
  );

  const filteredTargets = targets.filter(
    (t) => knownChars.has(t) || knownRooms.has(t)
  );

  if (filteredTargets.length === 0) return null;

  return {
    intent,
    targets: filteredTargets
  };
}

/**
 * Factory: creates a minimal LLMDecisionEngine bound to callLLM.
 *
 * @param {{ callLLM: (prompt: string) => Promise<string|object> }} deps
 */
export function createLLMDecisionEngine({ callLLM }) {
  if (!callLLM || typeof callLLM !== 'function') {
    throw new Error('createLLMDecisionEngine requires callLLM(prompt) function');
  }

  return {
    /**
     * Decide an action for an agent using LLM + strict validation.
     *
     * @param {{ context?: any; characterId?: string; eventLog?: any; staticData?: any; gameState?: any; workingMemory?: any; availableActions: CandidateAction[] }} args
     * @returns {Promise<CandidateAction | null>}
     */
    async decideActionForAgent(args) {
      const {
        context,
        characterId,
        eventLog,
        staticData,
        gameState,
        workingMemory,
        availableActions
      } = args;

      const ctx =
        context ||
        buildAgentContext({
          characterId,
          eventLog,
          staticData,
          gameState,
          workingMemory,
          availableActions
        });

      const prompt = buildAgentDecisionPrompt(ctx);

      let raw;
      try {
        raw = await callLLM(prompt);
      } catch {
        return null;
      }

      const parsed = parseJsonSafe(raw);
      return validateAgentAction(parsed, availableActions);
    },

    /**
     * Parse and validate a natural-language commander order.
     *
     * @param {{ commandText: string; commanderView: any }} args
     * @returns {Promise<{ intent: string; targets: string[] } | null>}
     */
    async parseAndValidateOrder({ commandText, commanderView }) {
      if (!commandText || !commanderView) return null;

      const ctx = buildOrderParsingContext({
        commandText,
        commanderView
      });

      const prompt = buildOrderParsingPrompt(ctx);

      let raw;
      try {
        raw = await callLLM(prompt);
      } catch {
        return null;
      }

      const parsed = parseJsonSafe(raw);
      return validateParsedOrder(parsed, commanderView);
    }
  };
}

export default {
  createLLMDecisionEngine
};