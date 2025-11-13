// Mini-CoALA LLMSimHarness.js
// Phase 4: Small utilities around the LLMDecisionEngine adapter.
// - No UI, no real network; relies on injected callLLM or provided engine.

import { ACTION_TYPES } from '../mechanics/ActionSpace.js';
import { createLLMDecisionEngine } from './LLMDecisionEngine.js';

/**
 * Create a mock callLLM based on a fixtures map.
 *
 * fixtures: {
 *   [key: string]: string | object
 * }
 *
 * Keying strategy is intentionally simple for tests:
 * - For now we just use a fixed key ("default") or let tests
 *   choose how to inspect the incoming prompt externally.
 */
export function createMockCallLLM(fixtures = {}) {
  const store = { ...fixtures };

  return async function mockCallLLM(prompt) {
    if (typeof store.inspect === 'function') {
      store.inspect(prompt);
    }
    if (typeof store.default !== 'undefined') {
      return store.default;
    }
    return JSON.stringify({ type: ACTION_TYPES.OBSERVE });
  };
}

/**
 * Run a single LLM-backed decision for an agent.
 * Returns the chosen (validated) action and the raw prompt for inspection.
 */
export async function runAgentDecisionDryRun({
  characterId,
  context,
  availableActions,
  llmEngine
}) {
  if (!llmEngine || typeof llmEngine.decideActionForAgent !== 'function') {
    throw new Error('runAgentDecisionDryRun requires llmEngine.decideActionForAgent');
  }

  const action = await llmEngine.decideActionForAgent({
    characterId,
    context,
    availableActions
  });

  return {
    action
  };
}

/**
 * Run a single NL -> order parsing cycle.
 * Returns the structured order or null.
 */
export async function runOrderParsingDryRun({
  commandText,
  commanderView,
  llmEngine
}) {
  if (!llmEngine || typeof llmEngine.parseAndValidateOrder !== 'function') {
    throw new Error(
      'runOrderParsingDryRun requires llmEngine.parseAndValidateOrder'
    );
  }

  const order = await llmEngine.parseAndValidateOrder({
    commandText,
    commanderView
  });

  return {
    order
  };
}

export default {
  createMockCallLLM,
  runAgentDecisionDryRun,
  runOrderParsingDryRun
};