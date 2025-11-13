// Mini-CoALA MissionRunner.js
// Small harness to validate the autonomous, event-driven core.
//
// Responsibilities:
// - Load staticData (characters, rooms, mission).
// - Initialize EventLog, TimeManager, MechanicsEngine, DecisionLoop.
// - Seed SPAWN events for a selected fireteam at the start location.
// - Step the DecisionLoop until mission end or max iterations.
// - Expose a simple run() API for tests or console usage.
//
// This is NOT UI, NOT LLM, and NOT commander-facing. It exists purely
// to prove that Phase 1+2 architecture works end-to-end.

import EventLog from './core/EventLog.js';
import TimeManager from './core/TimeManager.js';
import GameState from './core/GameState.js';
import MechanicsEngine from './mechanics/MechanicsEngine.js';
import DecisionLoop from './ai/DecisionLoop.js';
import staticDataModule from './data/staticData.js';

const { staticData } = staticDataModule || { staticData: staticDataModule };

/**
 * Select a small autonomous squad from staticData.characters.
 * For MVP we just take the first 4 non-androids if possible.
 */
function selectDefaultSquad(characters) {
  const humans = (characters || []).filter((c) => !c.isAndroid);
  return (humans.length > 0 ? humans : characters || []).slice(0, 4).map((c) => c.id);
}

/**
 * Seed SPAWN events for squad at the start room.
 *
 * @param {EventLog} eventLog
 * @param {string[]} squadIds
 * @param {string} startRoomId
 * @param {number} tick
 */
function seedSpawnEvents(eventLog, squadIds, startRoomId, tick) {
  squadIds.forEach((id) => {
    eventLog.add({
      type: 'SPAWN',
      actor: id,
      location: startRoomId,
      tick
    });
  });
}

/**
 * Determine if mission is done based on derived GameState.
 *
 * For MVP RETRIEVE:
 * - "Complete" when mission.complete is true (to be driven by future mission logic),
 *   OR when at least one squad member has reached targetRoomId and then everyone
 *   returns to extractionRoomId (checked loosely here).
 * - "Failed" if all squad members are incapacitated/dead or maxSteps exceeded.
 *
 * This is intentionally minimal and can be refined later.
 */
function evaluateMissionOutcome(worldState, params, squadIds, steps, maxSteps) {
  const mission = worldState.mission || {};
  const all = worldState.characters || {};

  // If mission events marked completion/failure, trust them.
  if (mission.complete) {
    return { done: true, result: 'success', reason: mission.statusText || 'Mission complete.' };
  }
  if (mission.failed) {
    return { done: true, result: 'failure', reason: mission.statusText || 'Mission failed.' };
  }

  const targetRoomId = params?.targetRoomId || 'operations';
  const extractionRoomId = params?.extractionRoomId || 'start';

  const squadStates = squadIds.map((id) => all[id]).filter(Boolean);
  const anyAlive = squadStates.some((c) => c.alive && !c.incapacitated);
  const allAtExtractionOrDown = squadStates.every(
    (c) =>
      !c || !c.alive || c.incapacitated || c.location === extractionRoomId
  );
  const someoneReachedTarget = squadStates.some(
    (c) => c.alive && !c.incapacitated && c.location === targetRoomId
  );

  // Failure: no one left able to act
  if (!anyAlive) {
    return { done: true, result: 'failure', reason: 'All squad members incapacitated.' };
  }

  // Success (MVP heuristic):
  // - Someone has reached target
  // - And later, everyone remaining is back at extraction
  if (someoneReachedTarget && allAtExtractionOrDown) {
    return {
      done: true,
      result: 'success',
      reason: 'Squad reached objective and regrouped at extraction.'
    };
  }

  // Timeout failure condition
  if (steps >= maxSteps) {
    return { done: true, result: 'failure', reason: 'Max steps reached without completion.' };
  }

  return { done: false };
}

/**
 * Run a full autonomous mission simulation.
 *
 * @param {Object} [options]
 * @param {number} [options.maxSteps=50] - safety cap for loop iterations
 * @param {() => number} [options.rng] - optional deterministic RNG
 * @param {string[]} [options.squad] - explicit list of character ids (optional)
 * @returns {{
 *   result: 'success' | 'failure';
 *   reason: string;
 *   steps: number;
 *   eventLog: import('./core/EventLog.js').EventLog;
 *   finalState: import('./core/GameState.js').WorldState;
 * }}
 */
export function runMission(options = {}) {
  const maxSteps = options.maxSteps ?? 50;
  const rng = options.rng || (() => Math.random());

  const eventLog = new EventLog();
  const timeManager = new TimeManager(0);
  const mechanics = new MechanicsEngine();
  const dl = new DecisionLoop({
    eventLog,
    timeManager,
    mechanics,
    staticData
  });

  const rooms = staticData.rooms || [];
  const mission = staticData.mission || { type: 'RETRIEVE', params: {} };
  const startRoomId =
    rooms.find((r) => (r.tags || []).includes('start'))?.id || 'start';

  const squadIds =
    options.squad && options.squad.length
      ? options.squad
      : selectDefaultSquad(staticData.characters);

  // Seed spawn events at tick 0
  seedSpawnEvents(eventLog, squadIds, startRoomId, timeManager.getTick());

  let steps = 0;
  while (steps < maxSteps) {
    steps += 1;

    // One autonomous decision cycle
    dl.step({ rng });

    const worldState = GameState.fromEvents(eventLog, staticData);
    const outcome = evaluateMissionOutcome(
      worldState,
      mission.params,
      squadIds,
      steps,
      maxSteps
    );

    if (outcome.done) {
      return {
        result: outcome.result,
        reason: outcome.reason,
        steps,
        eventLog,
        finalState: worldState
      };
    }
  }

  // Fallback (should be handled in evaluateMissionOutcome)
  const finalState = GameState.fromEvents(eventLog, staticData);
  return {
    result: 'failure',
    reason: 'Loop exited unexpectedly.',
    steps,
    eventLog,
    finalState
  };
}

export default { runMission };