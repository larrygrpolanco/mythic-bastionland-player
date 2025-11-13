/**
 * RadioSystem.js
 * Commander-side helper to append communication events into the shared EventLog.
 *
 * Pure, deterministic, no side effects beyond calling eventLog.add(...).
 * Wired for future UI / commander tools.
 */

/**
 * @typedef {Object} RadioEventBase
 * @property {string} type
 * @property {string} from
 * @property {string} to
 * @property {string} message
 * @property {number} tick
 */

/**
 * Factory for commander radio operations.
 *
 * @param {{ add: (e: any) => any }} eventLog - Instance of EventLog or compatible interface.
 */
export function radioSystemFactory(eventLog) {
  if (!eventLog || typeof eventLog.add !== 'function') {
    throw new Error('radioSystemFactory requires an eventLog with .add(event)');
  }

  /**
   * Append a commander-issued radio order.
   *
   * @param {{ from?: "commander"; to: string | string[]; message: string; tick: number }} input
   */
  function sendOrder({ from = 'commander', to, message, tick }) {
    if (typeof tick !== 'number') {
      throw new Error('RadioSystem.sendOrder requires a numeric tick');
    }
    if (!to || !message) return null;

    const targets = Array.isArray(to) ? to : [to];

    const events = targets.map((target) =>
      eventLog.add({
        type: 'COMMANDER_RADIO',
        from,
        to: target,
        message,
        tick
      })
    );

    return Array.isArray(to) ? events : events[0];
  }

  /**
   * Append a squad report back to commander.
   *
   * @param {{ from: string; message: string; tick: number }} input
   */
  function receiveReport({ from, message, tick }) {
    if (typeof tick !== 'number') {
      throw new Error('RadioSystem.receiveReport requires a numeric tick');
    }
    if (!from || !message) return null;

    return eventLog.add({
      type: 'SQUAD_REPORT',
      from,
      to: 'commander',
      message,
      tick
    });
  }

  return {
    sendOrder,
    receiveReport
  };
}

export default radioSystemFactory;