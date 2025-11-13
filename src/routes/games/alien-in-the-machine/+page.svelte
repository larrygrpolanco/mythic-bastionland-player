<script>
  import { onMount } from 'svelte';

  // Core game systems (Phase 1-2)
  import EventLog from './lib/game/core/EventLog.js';
  import TimeManager from './lib/game/core/TimeManager.js';
  import GameState from './lib/game/core/GameState.js';
  import MechanicsEngine from './lib/game/mechanics/MechanicsEngine.js';
  import DecisionLoop from './lib/game/ai/DecisionLoop.js';
  import staticData from './lib/game/data/staticData.js';

  // Commander overlay (Phase 4)
  import buildCommanderView from './lib/game/commander/IntelligenceView.js';
  import radioSystemFactory from './lib/game/commander/RadioSystem.js';
  import orderSystemFactory from './lib/game/commander/OrderSystem.js';

  // --- Core wiring (no new mechanics) ---

  const eventLog = new EventLog();
  const timeManager = new TimeManager(0);
  const mechanics = new MechanicsEngine();

  const decisionLoop = new DecisionLoop({
    eventLog,
    timeManager,
    mechanics,
    staticData
  });

  const radioSystem = radioSystemFactory(eventLog);
  const orderSystem = orderSystemFactory({ eventLog });

  // Scenario configuration from staticData (Phase 5)
  const rooms = staticData.rooms || [];
  const missionConfig = staticData.mission || { type: 'RETRIEVE', params: {} };
  const characters = staticData.characters || [];

  const startRoomId =
    rooms.find((r) => (r.tags || []).includes('start'))?.id || 'start';

  function selectDefaultSquad() {
    const humans =
      (characters || []).filter((c) => !c.isAndroid) || characters || [];
    return (humans.length ? humans : characters).slice(0, 4).map((c) => c.id);
  }

  let squadIds = selectDefaultSquad();

  // Local reactive state for UI
  let commanderView = null;
  let missionEnded = false;
  let missionResult = null;

  // Commander input state
  let radioTarget = '';
  let radioMessage = '';

  let overrideTarget = '';
  let overrideActionType = 'MOVE';
  let overrideActionTarget = '';

  // --- Helpers ---

  function seedSpawnEvents() {
    squadIds.forEach((id) => {
      eventLog.add({
        type: 'SPAWN',
        actor: id,
        location: startRoomId,
        tick: timeManager.getTick()
      });
    });
  }

  function rebuildCommanderView() {
    const world = GameState.fromEvents(eventLog, staticData);
    commanderView = buildCommanderView({
      eventLog,
      staticData,
      gameState: world
    });
    return world;
  }

  function evaluateMissionOutcome(worldState, maxStepsCheck = false) {
    const mission = worldState.mission || {};
    const all = worldState.characters || {};

    if (mission.complete) {
      return {
        done: true,
        result: 'success',
        reason: mission.statusText || 'Mission complete.'
      };
    }
    if (mission.failed) {
      return {
        done: true,
        result: 'failure',
        reason: mission.statusText || 'Mission failed.'
      };
    }

    const targetRoomId = missionConfig.params?.targetRoomId || 'operations';
    const extractionRoomId = missionConfig.params?.extractionRoomId || 'start';

    const squadStates = squadIds.map((id) => all[id]).filter(Boolean);
    const anyAlive = squadStates.some((c) => c.alive && !c.incapacitated);
    const allAtExtractionOrDown = squadStates.every(
      (c) =>
        !c || !c.alive || c.incapacitated || c.location === extractionRoomId
    );
    const someoneReachedTarget = squadStates.some(
      (c) => c.alive && !c.incapacitated && c.location === targetRoomId
    );

    if (!anyAlive) {
      return {
        done: true,
        result: 'failure',
        reason: 'All squad members incapacitated.'
      };
    }

    if (someoneReachedTarget && allAtExtractionOrDown) {
      return {
        done: true,
        result: 'success',
        reason: 'Squad reached objective and regrouped at extraction.'
      };
    }

    if (maxStepsCheck) {
      return {
        done: true,
        result: 'failure',
        reason: 'Max steps reached without completion.'
      };
    }

    return { done: false };
  }

  function stepAutonomous(rng = Math.random) {
    if (missionEnded) return;

    decisionLoop.step({ rng });

    const world = rebuildCommanderView();
    const outcome = evaluateMissionOutcome(world, false);

    if (outcome.done) {
      missionEnded = true;
      missionResult = outcome;
    }
  }

  function resetScenario() {
    missionEnded = false;
    missionResult = null;

    while (eventLog.getAll().length) {
      // naive reset: EventLog has no clear(), so recreate
      break;
    }

    // Recreate log/time/loop deterministically
    // Note: this keeps wiring simple; no new mechanics introduced.
    eventLog._events = [];
    timeManager.reset(0);

    squadIds = selectDefaultSquad();
    seedSpawnEvents();
    rebuildCommanderView();
  }

  // --- Commander actions ---

  function handleAdvance() {
    if (missionEnded) return;
    stepAutonomous();
  }

  function handleSendRadio() {
    if (missionEnded) return;
    if (!radioMessage.trim()) return;

    const to =
      radioTarget && radioTarget.trim()
        ? radioTarget.trim()
        : squadIds.length === 0
        ? 'squad'
        : squadIds;

    radioSystem.sendOrder({
      to,
      message: radioMessage.trim(),
      tick: commanderView ? commanderView.tick : timeManager.getTick()
    });

    radioMessage = '';
    rebuildCommanderView();
  }

  function handleOverride() {
    if (missionEnded) return;
    if (!overrideTarget || !overrideActionType) return;

    try {
      orderSystem.issueOverride({
        characterId: overrideTarget.trim(),
        enforcedAction: {
          type: overrideActionType.trim(),
          target: overrideActionTarget.trim()
            ? overrideActionTarget.trim()
            : undefined
        },
        tick: commanderView ? commanderView.tick : timeManager.getTick()
      });

      rebuildCommanderView();
    } catch (e) {
      console.error('Override failed:', e);
    }
  }

  // --- Init on mount ---

  onMount(() => {
    seedSpawnEvents();
    rebuildCommanderView();
  });
</script>

<svelte:head>
  <title>Alien in the Machine - MVP Scenario</title>
</svelte:head>

<div class="aitm-root">
  <header class="aitm-header">
    <h1>ALIEN IN THE MACHINE // COMMAND CENTER MVP</h1>
    <div class="aitm-header-sub">
      <span>Single Scenario | One Squad | One Objective | Autonomous AI + Commander Overlay</span>
    </div>
  </header>

  <main class="aitm-layout">
    <!-- LEFT: Mission Brief / Map -->
    <section class="panel panel-left">
      <h2>Mission Brief</h2>
      <div class="box">
        <div><strong>ID:</strong> {missionConfig.id}</div>
        <div><strong>Type:</strong> {missionConfig.type}</div>
        <div>
          <strong>Objective:</strong>
          {commanderView?.mission?.objective}
        </div>
        <div>
          <strong>Status:</strong>
          {commanderView?.mission?.extractionStatus}
        </div>
      </div>

      <h2>Map (Known Layout)</h2>
      <div class="box">
        {#if rooms.length === 0}
          <div>No map data.</div>
        {:else}
          <ul class="map-list">
            {#each rooms as room}
              <li>
                <span class="room-id">{room.id}</span>
                <span class="room-name">{room.name}</span>
                {#if room.tags?.includes('start')}
                  <span class="tag">START</span>
                {/if}
                {#if room.tags?.includes('objective')}
                  <span class="tag">OBJ</span>
                {/if}
                {#if room.tags?.includes('extraction')}
                  <span class="tag">EXTRACT</span>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>

    <!-- CENTER: Squad Status -->
    <section class="panel panel-center">
      <h2>Squad Status</h2>
      <div class="box">
        {#if commanderView?.marines?.length}
          <table class="squad-table">
            <thead>
              <tr>
                <th>Marine</th>
                <th>Location</th>
                <th>Health</th>
                <th>Stress</th>
                <th>Last Event</th>
              </tr>
            </thead>
            <tbody>
              {#each commanderView.marines as m}
                <tr>
                  <td>{m.name}</td>
                  <td>{m.lastKnownLocation || '-'}</td>
                  <td class={"band band-health-" + m.healthBand}>{m.healthBand}</td>
                  <td class={"band band-stress-" + m.stressBand}>{m.stressBand}</td>
                  <td class="last-event">{m.lastEventSummary || '-'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <div>No squad data.</div>
        {/if}
      </div>

      <h2>Controls</h2>
      <div class="box controls">
        <div class="control-row">
          <button on:click={handleAdvance} disabled={missionEnded}>
            Advance (AI Step)
          </button>
        </div>

        <div class="control-row">
          <div class="label">Radio Message</div>
          <input
            placeholder="Target id or leave blank for squad"
            bind:value={radioTarget}
          />
          <input
            placeholder="Message to transmit"
            bind:value={radioMessage}
          />
          <button on:click={handleSendRadio} disabled={missionEnded || !radioMessage.trim()}>
            Send
          </button>
        </div>

        <div class="control-row">
          <div class="label">Direct Override</div>
          <input
            placeholder="Marine id"
            bind:value={overrideTarget}
          />
          <select bind:value={overrideActionType}>
            <option value="MOVE">MOVE</option>
            <option value="ATTACK">ATTACK</option>
            <option value="TAKE_COVER">TAKE_COVER</option>
            <option value="INTERACT">INTERACT</option>
            <option value="OBSERVE">OBSERVE</option>
            <option value="APPLY_FIRST_AID">APPLY_FIRST_AID</option>
          </select>
          <input
            placeholder="Target (room/entity id, optional)"
            bind:value={overrideActionTarget}
          />
          <button on:click={handleOverride} disabled={missionEnded}>
            Issue Override (+1 Stress)
          </button>
        </div>

        <div class="control-row">
          <button on:click={resetScenario}>
            Reset Scenario
          </button>
        </div>

        {#if missionEnded && missionResult}
          <div class={"mission-result " + missionResult.result}>
            <strong>Mission {missionResult.result.toUpperCase()}</strong> — {missionResult.reason}
          </div>
        {/if}
      </div>
    </section>

    <!-- RIGHT: Radio / Orders Log -->
    <section class="panel panel-right">
      <h2>Radio & Orders Log</h2>
      <div class="box log-box">
        {#if commanderView?.radioLog?.length}
          {#each commanderView.radioLog.slice().reverse() as evt}
            <div class="log-line">
              <span class="tick">[{evt.tick ?? '-'}]</span>
              <span class="type">{evt.type}</span>
              <span class="msg">
                {#if evt.type === 'COMMANDER_RADIO'}
                  CMD ➜ {evt.to}: {evt.message}
                {:else if evt.type === 'SQUAD_REPORT'}
                  {evt.from} ➜ CMD: {evt.message}
                {:else if evt.type === 'ORDER_ISSUED'}
                  ORDER {evt.orderId} ➜ {Array.isArray(evt.to) ? evt.to.join(',') : evt.to}: {evt.text}
                {:else if evt.type === 'OVERRIDE_ORDER'}
                  OVERRIDE ➜ {evt.to}: {evt.enforcedAction?.type}
                {:else}
                  {evt.type}
                {/if}
              </span>
            </div>
          {/each}
        {:else}
          <div>No radio or orders yet.</div>
        {/if}
      </div>
    </section>
  </main>

  <footer class="aitm-footer">
    <div>Tick: {commanderView?.tick ?? 0}</div>
    <div>All behavior driven solely by GAME_MECHANICS_MVP and Mini-CoALA core. No extra mechanics.</div>
  </footer>
</div>

<style>
  .aitm-root {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #020810;
    color: #e5f5ff;
    min-height: 100vh;
    padding: 12px;
    box-sizing: border-box;
  }

  .aitm-header {
    text-align: center;
    margin-bottom: 8px;
  }

  .aitm-header h1 {
    font-size: 16px;
    letter-spacing: 0.12em;
    color: #6ee7ff;
    margin: 0;
  }

  .aitm-header-sub span {
    font-size: 10px;
    color: #92a7b8;
  }

  .aitm-layout {
    display: grid;
    grid-template-columns: 1.1fr 1.6fr 1.3fr;
    gap: 8px;
    align-items: flex-start;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .panel h2 {
    font-size: 11px;
    margin: 0;
    color: #7dd3fc;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .box {
    border: 1px solid #1f3b4d;
    background: #020b16;
    padding: 6px;
    border-radius: 2px;
    font-size: 10px;
    overflow: hidden;
  }

  .map-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .map-list li {
    display: flex;
    gap: 4px;
    align-items: baseline;
    padding: 2px 0;
  }

  .room-id {
    font-family: monospace;
    color: #38bdf8;
  }

  .room-name {
    flex: 1;
    color: #cbd5f5;
  }

  .tag {
    font-size: 8px;
    padding: 1px 3px;
    border-radius: 2px;
    border: 1px solid #38bdf8;
    color: #38bdf8;
    margin-left: 2px;
  }

  .squad-table {
    width: 100%;
    border-collapse: collapse;
  }

  .squad-table th,
  .squad-table td {
    border-bottom: 1px solid #12212f;
    padding: 2px 3px;
    font-size: 9px;
  }

  .squad-table th {
    color: #94a3b8;
    text-align: left;
  }

  .band {
    text-transform: uppercase;
    font-size: 8px;
    padding: 1px 3px;
    border-radius: 2px;
    display: inline-block;
  }

  .band-health-ok {
    color: #22c55e;
  }

  .band-health-wounded {
    color: #eab308;
  }

  .band-health-critical {
    color: #f97316;
  }

  .band-health-dead {
    color: #ef4444;
  }

  .band-stress-calm {
    color: #38bdf8;
  }

  .band-stress-shaken {
    color: #a3e635;
  }

  .band-stress-stressed {
    color: #facc15;
  }

  .band-stress-panicked {
    color: #fb7185;
  }

  .last-event {
    color: #9ca3af;
    font-family: monospace;
  }

  .controls .control-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    margin-bottom: 4px;
  }

  .controls .label {
    font-size: 8px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-right: 4px;
  }

  input,
  select,
  button {
    font-size: 9px;
    padding: 2px 4px;
    border-radius: 2px;
    border: 1px solid #1f2933;
    background: #020b16;
    color: #e5f5ff;
  }

  input::placeholder {
    color: #4b5563;
  }

  button {
    background: #082f49;
    border-color: #38bdf8;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .log-box {
    max-height: 260px;
    overflow-y: auto;
    font-family: monospace;
  }

  .log-line {
    display: flex;
    gap: 4px;
    padding: 1px 0;
  }

  .log-line .tick {
    color: #64748b;
  }

  .log-line .type {
    color: #38bdf8;
  }

  .log-line .msg {
    color: #cbd5f5;
    flex: 1;
  }

  .mission-result {
    margin-top: 4px;
    padding: 3px 4px;
    border-radius: 2px;
    font-size: 9px;
  }

  .mission-result.success {
    border: 1px solid #22c55e;
    color: #bbf7d0;
  }

  .mission-result.failure {
    border: 1px solid #ef4444;
    color: #fecaca;
  }

  .aitm-footer {
    margin-top: 6px;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    color: #6b7280;
  }

  @media (max-width: 900px) {
    .aitm-layout {
      grid-template-columns: 1fr;
    }
  }
</style>