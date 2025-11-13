// Mini-CoALA EventLog.js
// Central append-only event log with simple query helpers.
// Aligned with Mini-CoALA-Architecture.md spec.

const createId = (() => {
  let counter = 0;
  return () => `evt_${String(counter++).padStart(4, '0')}`;
})();

/**
 * @typedef {Object} GameEvent
 * @property {string} id
 * @property {number} tick
 * @property {string} type
 * @property {string} [actor]
 * @property {string} [target]
 * @property {string} [action]
 * @property {string} [panicType]
 * @property {boolean} [success]
 * @property {number} [damage]
 * @property {string} [details]
 * @property {string} [commander]
 * @property {string} [order]
 * @property {boolean} [compliance]
 * @property {string} [reason]
 * @property {string} [location]
 */

/**
 * Simple in-memory event log.
 * For MVP this can be instantiated once per simulation run.
 */
export class EventLog {
  constructor() {
    /** @type {GameEvent[]} */
    this.events = [];
  }

  /**
   * Append a new event to the log.
   * If id or tick are missing, they MUST be provided by caller's TimeManager/engine
   * or auto-filled here with best-effort defaults.
   * @param {Partial<GameEvent>} partial
   * @returns {GameEvent}
   */
  add(partial) {
    const event = {
      id: partial.id || createId(),
      tick: typeof partial.tick === 'number' ? partial.tick : 0,
      type: partial.type || 'UNKNOWN',
      actor: partial.actor,
      target: partial.target,
      action: partial.action,
      panicType: partial.panicType,
      success: partial.success,
      damage: partial.damage,
      details: partial.details,
      commander: partial.commander,
      order: partial.order,
      compliance: partial.compliance,
      reason: partial.reason,
      location: partial.location
    };
    this.events.push(event);
    return event;
  }

  /**
   * Bulk append multiple events.
   * @param {Partial<GameEvent>[]} list
   * @returns {GameEvent[]}
   */
  addMany(list) {
    return list.map((e) => this.add(e));
  }

  /**
   * Get full immutable list of events.
   * @returns {GameEvent[]}
   */
  getAll() {
    return [...this.events];
  }

  /**
   * Get events with tick > given tick.
   * @param {number} tick
   * @returns {GameEvent[]}
   */
  getSince(tick) {
    return this.events.filter((e) => e.tick > tick);
  }

  /**
   * Get events in [startTick, endTick].
   * Optional filters: actor, type, location.
   * @param {number} startTick
   * @param {number} endTick
   * @param {{ actor?: string; type?: string; location?: string }} [filters]
   * @returns {GameEvent[]}
   */
  getWindow(startTick, endTick, filters = {}) {
    return this.events.filter((e) => {
      if (e.tick < startTick || e.tick > endTick) return false;
      if (filters.actor && e.actor !== filters.actor) return false;
      if (filters.type && e.type !== filters.type) return false;
      if (filters.location && e.location !== filters.location) return false;
      return true;
    });
  }

  /**
   * Get most recent events for an entity.
   * @param {string} entityId
   * @param {number} [limit]
   * @returns {GameEvent[]}
   */
  forEntity(entityId, limit) {
    const filtered = this.events.filter(
      (e) => e.actor === entityId || e.target === entityId
    );
    if (!limit || filtered.length <= limit) {
      return filtered;
    }
    return filtered.slice(filtered.length - limit);
  }

  /**
   * Clear all events (used for tests / new simulations).
   */
  reset() {
    this.events = [];
  }
}

export default EventLog;