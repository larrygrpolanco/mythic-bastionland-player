// Mini-CoALA TimeManager.js
// Centralized tick counter for simulations.
// Keeps logic trivial and deterministic for Phase 1.

export class TimeManager {
  constructor(startTick = 0) {
    this.currentTick = startTick;
  }

  /**
   * Get current global tick.
   * @returns {number}
   */
  getTick() {
    return this.currentTick;
  }

  /**
   * Advance time by a positive integer number of ticks.
   * @param {number} ticks
   * @returns {number} New tick value
   */
  advance(ticks = 1) {
    if (ticks <= 0 || !Number.isFinite(ticks)) return this.currentTick;
    this.currentTick += Math.floor(ticks);
    return this.currentTick;
  }

  /**
   * Reset time to a specific tick (default 0).
   * Useful for tests or restarting simulations.
   * @param {number} tick
   */
  reset(tick = 0) {
    this.currentTick = tick;
  }
}

export default TimeManager;