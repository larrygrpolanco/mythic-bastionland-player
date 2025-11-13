/**
 * IntelligenceView.js
 * Commander-side pure read model over EventLog + staticData + gameState.
 *
 * Responsibilities (Phase 4 MVP):
 * - Summarise mission + marines + map for the commander.
 * - Provide filtered radio/command log and issued orders list.
 * - No side effects. Deterministic, derived-only.
 */

/**
 * Relevant commander-facing event types:
 * - COMMANDER_RADIO
 * - SQUAD_REPORT
 * - ORDER_ISSUED
 * - OVERRIDE_ORDER
 */

/**
 * Build commander-facing intelligence snapshot.
 *
 * @param {Object} params
 * @param {{ getAll?: () => any[] } | any[]} params.eventLog
 * @param {any} params.staticData
 *   Expected minimal shape:
 *   {
 *     mission?: { objective?: string },
 *     characters?: [{ id, name }],
 *     rooms?: [{ id }]
 *   }
 * @param {Object} params.gameState
 *   Expected minimal shape:
 *   {
 *     lastTick?: number,
 *     mission?: { objective?, progress?, extractionStatus? },
 *     characters?: {
 *       [id]: {
 *         id,
 *         name?,
 *         location?,
 *         health?,
 *         maxHealth?,
 *         stress?,
 *         alive?,
 *         incapacitated?
 *       }
 *     }
 *   }
 */
export function buildCommanderView({ eventLog, staticData = {}, gameState = {} }) {
  const allEvents = Array.isArray(eventLog)
    ? eventLog
    : eventLog && typeof eventLog.getAll === 'function'
    ? eventLog.getAll()
    : [];

  const tick =
    typeof gameState.lastTick === 'number'
      ? gameState.lastTick
      : allEvents.length
      ? allEvents[allEvents.length - 1].tick || 0
      : 0;

  const mission = buildMissionView(staticData, gameState);
  const marines = buildMarinesView(staticData, gameState, allEvents);
  const map = buildMapView(staticData, allEvents);
  const radioLog = buildRadioLog(allEvents);
  const orders = buildOrdersView(allEvents);

  return {
    tick,
    mission,
    marines,
    map,
    radioLog,
    orders
  };
}

/**
 * Mission summary: prefer live gameState; fall back to staticData.
 */
function buildMissionView(staticData, gameState) {
  const gsMission = gameState.mission || {};
  const sdMission = staticData.mission || {};

  return {
    objective:
      gsMission.objective ||
      sdMission.objective ||
      'Stabilise colony and extract surviving marines.',
    progress: gsMission.progress || sdMission.progress || null,
    extractionStatus:
      gsMission.extractionStatus ||
      sdMission.extractionStatus ||
      'pending'
  };
}

/**
 * Derive simple bands from numeric health/stress.
 */
function toHealthBand(ch) {
  if (!ch || ch.alive === false) return 'dead';
  const max = ch.maxHealth || 10;
  const hp = typeof ch.health === 'number' ? ch.health : max;
  const ratio = max > 0 ? hp / max : 1;
  if (ratio <= 0) return 'dead';
  if (ratio <= 0.25) return 'critical';
  if (ratio <= 0.6) return 'wounded';
  return 'ok';
}

function toStressBand(stress) {
  const v = typeof stress === 'number' ? stress : 0;
  if (v <= 2) return 'calm';
  if (v <= 5) return 'shaken';
  if (v <= 8) return 'stressed';
  return 'panicked';
}

/**
 * Build marines list by joining static character roster with live state + last events.
 */
function buildMarinesView(staticData, gameState, events) {
  const roster = staticData.characters || staticData.crew || [];
  const live = gameState.characters || {};

  return roster.map((c) => {
    const liveCh = live[c.id] || {};
    const id = c.id;
    const name = liveCh.name || c.name || id;

    const lastEvents = events
      .filter(
        (e) =>
          e.actor === id ||
          e.target === id ||
          (e.to === id &&
            (e.type === 'COMMANDER_RADIO' ||
              e.type === 'ORDER_ISSUED' ||
              e.type === 'OVERRIDE_ORDER' ||
              e.type === 'SQUAD_REPORT'))
      )
      .slice(-5);

    const lastEventSummary = lastEvents.length
      ? summarizeEvent(lastEvents[lastEvents.length - 1])
      : null;

    return {
      id,
      name,
      lastKnownLocation: liveCh.location || inferLastLocationFor(id, events) || null,
      healthBand: toHealthBand(liveCh),
      stressBand: toStressBand(liveCh.stress),
      lastEventSummary
    };
  });
}

/**
 * Fallback last-known location from events if not in gameState.
 */
function inferLastLocationFor(id, events) {
  const reversed = [...events].reverse();
  for (const e of reversed) {
    if (e.actor === id && e.location) return e.location;
    if (e.target === id && e.location) return e.location;
  }
  return null;
}

/**
 * Compact text summary for a single event, commander-facing.
 */
function summarizeEvent(e) {
  switch (e.type) {
    case 'COMMANDER_RADIO':
      return `CMD➜${e.to}: ${e.message}`;
    case 'SQUAD_REPORT':
      return `${e.from}➜CMD: ${e.message}`;
    case 'ORDER_ISSUED':
      return `Order ${e.orderId} to ${Array.isArray(e.to) ? e.to.join(',') : e.to}`;
    case 'OVERRIDE_ORDER':
      return `Override ${e.to}: ${e.enforcedAction?.type || 'ACTION'}`;
    default:
      if (e.action && e.actor) {
        return `${e.actor} ${e.action} ${e.target || ''}`.trim();
      }
      return e.type || 'event';
  }
}

/**
 * Map exploration:
 * - exploredRooms: any room referenced as location in events
 * - unexploredRooms: from staticData.rooms minus exploredRooms
 */
function buildMapView(staticData, events) {
  const rooms = staticData.rooms || [];
  const explored = new Set();

  for (const e of events) {
    if (e.location) explored.add(e.location);
  }

  const exploredRooms = rooms
    .filter((r) => explored.has(r.id))
    .map((r) => r.id);

  const unexploredRooms = rooms
    .filter((r) => !explored.has(r.id))
    .map((r) => r.id);

  return {
    exploredRooms,
    unexploredRooms
  };
}

/**
 * Filter radio/command-related events for commander log.
 */
function buildRadioLog(events) {
  const allowed = new Set([
    'COMMANDER_RADIO',
    'SQUAD_REPORT',
    'ORDER_ISSUED',
    'OVERRIDE_ORDER'
  ]);

  return events.filter((e) => allowed.has(e.type));
}

/**
 * Extract simple orders list from ORDER_ISSUED events.
 */
function buildOrdersView(events) {
  return events
    .filter((e) => e.type === 'ORDER_ISSUED')
    .map((e) => ({
      orderId: e.orderId,
      to: e.to,
      text: e.text,
      tick: e.tick
    }));
}

export default buildCommanderView;