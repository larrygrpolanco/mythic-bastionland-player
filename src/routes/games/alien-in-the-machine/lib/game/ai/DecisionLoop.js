// Mini-CoALA DecisionLoop.js
// Orchestrates the Sense -> Plan -> Decide -> Act -> Log cycle for all agents.
// Uses:
// - EventLog (episodic memory)
// - GameState (derived world state)
// - WorkingMemory (per-agent view)
// - ActionSpace (valid actions + panic bands)
// - MechanicsEngine (rules -> events)

import EventLog from '../core/EventLog.js';
import TimeManager from '../core/TimeManager.js';
import GameState from '../core/GameState.js';
import { ActionSpace } from '../mechanics/ActionSpace.js';
import MechanicsEngine from '../mechanics/MechanicsEngine.js';
import Agent from './Agent.js';
import { WorkingMemory } from './WorkingMemory.js';
import { createLLMDecisionEngine } from './LLMDecisionEngine.js';

/**
 * DecisionLoop is intentionally thin and deterministic:
 * - It does not know about UI or LLMs.
 * - It can be run in tests to validate autonomous behavior.
 */
export class DecisionLoop {
  /**
   * @param {Object} params
   * @param {EventLog} params.eventLog
   * @param {TimeManager} params.timeManager
   * @param {MechanicsEngine} params.mechanics
   * @param {Object} params.staticData - characters, rooms, mission, etc.
   * @param {(prompt: string|object) => Promise<string|object>} [params.callLLM]
   *   Optional async function used to construct a shared LLM engine.
   */
  constructor({ eventLog, timeManager, mechanics, staticData, callLLM } = {}) {
    this.eventLog = eventLog || new EventLog();
    this.timeManager = timeManager || new TimeManager();
    this.mechanics = mechanics || new MechanicsEngine();
    this.staticData = staticData || { characters: [], rooms: [], mission: {} };

    // Base heuristic agents
    this.agents = new Map();

    // Optional shared LLM engine (Phase 4: thin, non-breaking)
    this.llmEngine =
      callLLM && typeof callLLM === 'function'
        ? createLLMDecisionEngine({ callLLM })
        : null;

    for (const c of this.staticData.characters || []) {
      const id = c.id;
      this.agents.set(id, new Agent({ id, personality: c.flavor?.personality }));
    }
  }

  /**
   * Run one decision "tick":
   * - Build current GameState from EventLog + static data.
   * - For each active agent:
   *   - Build WorkingMemory
   *   - Build valid actions
   *   - Handle panic if applicable
   *   - Ask Agent to choose action
   *   - Resolve via MechanicsEngine
   * - Append resulting events to EventLog and advance time.
   *
   * @param {{ rng?: () => number }} [options]
   * @returns {import('../core/EventLog.js').GameEvent[]} events emitted this step
   */
  async step(options = {}) {
    const rng = options.rng || (() => Math.random());
    const useLLMForAgents = !!options.useLLMForAgents;

    // 1. Sense: derive current state
    const worldState = GameState.fromEvents(this.eventLog, this.staticData);

    /** @type {import('../core/EventLog.js').GameEvent[]} */
    const emitted = [];

    // 2. Iterate agents
    for (const [id, agent] of this.agents.entries()) {
      const ch = worldState.characters[id];
      if (!ch || !ch.alive) continue;

      // Build working memory
      const wm = WorkingMemory.buildForCharacter(id, worldState, this.eventLog);

      // Panic check (LLM cannot override forced panic)
      const panicAction = ActionSpace.buildPanicAction(id, worldState, ch.stress);
      if (panicAction) {
        const panicEvents = this.mechanics.resolveAction(
          { ...panicAction, actor: id },
          worldState,
          { rng }
        );
        emitted.push(...panicEvents);
        continue;
      }

      // 3. Plan: get valid actions
      const available = ActionSpace.getValidActions(id, worldState);
      if (!available || available.length === 0) continue;

      /** @type {import('../mechanics/ActionSpace.js').CandidateAction | null} */
      let chosen = null;

      // 4. Optional LLM policy (Phase 4 hook):
      // If enabled and llmEngine exists, attempt LLM-backed decision.
      if (useLLMForAgents && this.llmEngine) {
        try {
          chosen = await this.llmEngine.decideActionForAgent({
            characterId: id,
            workingMemory: wm,
            availableActions: available,
            gameState: worldState,
            eventLog: this.eventLog,
            staticData: this.staticData
          });
        } catch {
          chosen = null;
        }
      }

      // 5. Heuristic fallback (existing behavior) if no valid LLM suggestion.
      if (!chosen) {
        const heuristic = agent.decideAction(wm, available);
        if (heuristic) {
          chosen = heuristic;
        } else {
          // If no decision, default to OBSERVE or first available.
          chosen =
            available.find((a) => a.type === 'OBSERVE') ||
            available[0] ||
            null;
        }
      }

      if (!chosen) continue;

      // 6. Act: resolve chosen action
      const events = this.mechanics.resolveAction(
        { ...chosen, actor: id },
        worldState,
        { rng }
      );
      if (Array.isArray(events) && events.length) {
        emitted.push(...events);
      }
    }

    // 7. Log and time: append all events with proper ticks
    if (emitted.length > 0) {
      const baseTick = this.timeManager.getTick();
      let maxTick = baseTick;
      const normalized = emitted.map((evt, index) => {
        const tick =
          typeof evt.tick === 'number' && evt.tick > 0
            ? evt.tick
            : baseTick + (index + 1);
        if (tick > maxTick) maxTick = tick;
        return { ...evt, tick };
      });

      this.eventLog.addMany(normalized);
      this.timeManager.reset(maxTick);
    }

    return emitted;
  }
}

export default DecisionLoop;