/**
 * OrderSystem.js
 * Commander-side utilities for issuing structured orders into the EventLog.
 *
 * Phase 4 constraints:
 * - Pure, deterministic, append-only via eventLog.
 * - No mechanics resolution here.
 * - Optional integration hook for LLMDecisionEngine for natural language parsing.
 */

/**
 * @typedef {Object} OrderIssuedEvent
 * @property {"ORDER_ISSUED"} type
 * @property {string} orderId
 * @property {string} from
 * @property {string[]|string} to
 * @property {string} text
 * @property {number} tick
 */

/**
 * @typedef {Object} OverrideOrderEvent
 * @property {"OVERRIDE_ORDER"} type
 * @property {string} from
 * @property {string} to
 * @property {{ type: string; target?: string }} enforcedAction
 * @property {number} stressCost
 * @property {number} tick
 */

/**
 * Simple deterministic orderId generator for commander-issued orders.
 * Local to this module to avoid coupling with other ids.
 */
let orderCounter = 0;
function nextOrderId() {
  orderCounter += 1;
  return `ord_${String(orderCounter).padStart(4, '0')}`;
}

/**
 * Validate enforcedAction shape for overrides.
 * Only allow a plain object with { type, target? }.
 *
 * @param {any} action
 * @returns {{ type: string; target?: string } | null}
 */
function normalizeEnforcedAction(action) {
  if (!action || typeof action !== 'object') return null;
  if (typeof action.type !== 'string' || !action.type.trim()) return null;

  const normalized = { type: action.type.trim() };
  if (typeof action.target === 'string' && action.target.trim()) {
    normalized.target = action.target.trim();
  }
  return normalized;
}

/**
 * Factory for commander order operations.
 *
 * @param {Object} params
 * @param {{ add: (e: any) => any }} params.eventLog - EventLog-like with .add()
 * @param {{ parseAndValidateOrder?: Function }} [params.llmDecisionEngine] - Optional LLM adapter
 * @param {string} [params.commanderId="commander"]
 */
export function orderSystemFactory({
  eventLog,
  llmDecisionEngine,
  commanderId = 'commander'
}) {
  if (!eventLog || typeof eventLog.add !== 'function') {
    throw new Error('orderSystemFactory requires an eventLog with .add(event)');
  }

  /**
   * Issue a simple direct order.
   * Deterministic:
   * - Emits ORDER_ISSUED
   * - Emits COMMANDER_RADIO mirroring the text
   *
   * @param {{ text: string; targets: string | string[]; tick: number }} input
   * @returns {{ order: OrderIssuedEvent; radio: any[] }}
   */
  function issueSimpleOrder({ text, targets, tick }) {
    if (typeof tick !== 'number') {
      throw new Error('OrderSystem.issueSimpleOrder requires a numeric tick');
    }
    if (!text || !targets) {
      throw new Error('OrderSystem.issueSimpleOrder requires text and targets');
    }

    const toList = Array.isArray(targets) ? targets : [targets];
    const orderId = nextOrderId();

    /** @type {OrderIssuedEvent} */
    const orderEvent = eventLog.add({
      type: 'ORDER_ISSUED',
      orderId,
      from: commanderId,
      to: toList.length === 1 ? toList[0] : toList,
      text,
      tick
    });

    // Mirror as radio traffic for each target for commander log consumption.
    const radioEvents = toList.map((t) =>
      eventLog.add({
        type: 'COMMANDER_RADIO',
        from: commanderId,
        to: t,
        message: text,
        tick
      })
    );

    return { order: orderEvent, radio: radioEvents };
  }

  /**
   * Issue an override order enforcing a specific action on a character.
   * - No mechanics or validation beyond minimal shape here.
   * - Stress cost fixed at 1 for MVP.
   *
   * @param {{ characterId: string; enforcedAction: { type: string; target?: string }; tick: number }} input
   * @returns {OverrideOrderEvent}
   */
  function issueOverride({ characterId, enforcedAction, tick }) {
    if (typeof tick !== 'number') {
      throw new Error('OrderSystem.issueOverride requires a numeric tick');
    }
    if (!characterId) {
      throw new Error('OrderSystem.issueOverride requires characterId');
    }

    const normalized = normalizeEnforcedAction(enforcedAction);
    if (!normalized) {
      throw new Error(
        'OrderSystem.issueOverride.enforcedAction must be a simple object with { type, target? }'
      );
    }

    /** @type {OverrideOrderEvent} */
    const evt = eventLog.add({
      type: 'OVERRIDE_ORDER',
      from: commanderId,
      to: characterId,
      enforcedAction: normalized,
      stressCost: 1,
      tick
    });

    return evt;
  }

  /**
   * Optional hook:
   * Use provided llmDecisionEngine to parse natural language command text
   * into a structured ORDER_ISSUED event.
   *
   * If llmDecisionEngine or its method is missing, or parsing fails,
   * returns null without side effects beyond any parsing attempts.
   *
   * @param {string} text
   * @param {any} commanderView - Pre-built intelligence view
   * @param {number} tick
   * @returns {Promise<OrderIssuedEvent | null>}
   */
  async function parseNaturalLanguageOrder(text, commanderView, tick) {
    if (
      !llmDecisionEngine ||
      typeof llmDecisionEngine.parseAndValidateOrder !== 'function'
    ) {
      return null;
    }
    if (!text || typeof tick !== 'number') return null;

    const parsed = await llmDecisionEngine.parseAndValidateOrder({
      commandText: text,
      commanderView
    });

    if (!parsed || !parsed.intent || !parsed.targets || parsed.targets.length === 0) {
      return null;
    }

    const orderId = nextOrderId();

    /** @type {OrderIssuedEvent} */
    const orderEvent = eventLog.add({
      type: 'ORDER_ISSUED',
      orderId,
      from: commanderId,
      to: parsed.targets,
      text,
      tick
    });

    // Mirror via radio for visibility
    const radioText = text;
    const targets = Array.isArray(parsed.targets) ? parsed.targets : [parsed.targets];
    targets.forEach((t) => {
      eventLog.add({
        type: 'COMMANDER_RADIO',
        from: commanderId,
        to: t,
        message: radioText,
        tick
      });
    });

    return orderEvent;
  }

  return {
    issueSimpleOrder,
    issueOverride,
    parseNaturalLanguageOrder
  };
}

export default orderSystemFactory;