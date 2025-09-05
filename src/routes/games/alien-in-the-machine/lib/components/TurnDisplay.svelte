<!--
  TurnDisplay.svelte - Tick-Based Turn System UI Component
  
  Displays the current active character, available actions with tick costs,
  and timer status for all characters in the turn system.
  
  This component provides the main interface for the new tick-based turn system,
  replacing the old batch-processing approach with individual character actions.
-->

<script>
  import { turnSystemStore, activeCharacterStore, availableActionsStore } from '../stores/worldStore.js';
  import { executeCharacterAction, advanceTime } from '../stores/worldStore.js';

  // Reactive stores for turn system data
  $: turnSystem = $turnSystemStore;
  $: activeCharacter = $activeCharacterStore;
  $: availableActions = $availableActionsStore;

  // Handle character action execution
  async function handleActionClick(actionName) {
    if (!activeCharacter) {
      console.warn('No active character to perform action');
      return;
    }

    console.log(`Executing action: ${actionName} for character ${activeCharacter.name}`);
    
    const result = executeCharacterAction(activeCharacter.entityId, actionName);
    
    if (!result.success) {
      console.error('Action failed:', result.errors);
      // Could show error UI here
    }
  }

  // Handle time advancement when no one can act
  function handleAdvanceTime() {
    console.log('Advancing time until someone can act');
    advanceTime();
  }

  // Get display color for character status
  function getCharacterStatusColor(characterData) {
    if (characterData.isActive) return '#00ff00'; // Bright green for active
    if (characterData.isReady) return '#ffff00';  // Yellow for ready but not active
    return '#888888'; // Gray for waiting
  }

  // Format timer display
  function formatTimer(timer) {
    if (timer <= 0) return 'READY';
    return `${timer} ticks`;
  }
</script>

<!-- Turn Display Container -->
<div class="turn-display">
  <div class="turn-header">
    <h3>Turn System</h3>
    {#if turnSystem}
      <div class="game-tick">Tick: {turnSystem.gameTick}</div>
    {/if}
  </div>

  <!-- Active Character Section -->
  {#if activeCharacter}
    <div class="active-character">
      <h4>
        <span class="character-name">{activeCharacter.name}</span>
        <span class="character-rank">({activeCharacter.rank})</span>
        <span class="ready-indicator">CAN ACT</span>
      </h4>
      
      <div class="character-stats">
        <span class="speed">Speed: {activeCharacter.speed}</span>
        <span class="timer">Timer: {formatTimer(activeCharacter.timer)}</span>
      </div>

      <!-- Available Actions -->
      {#if availableActions && availableActions.length > 0}
        <div class="available-actions">
          <h5>Available Actions:</h5>
          <div class="action-buttons">
            {#each availableActions as action}
              <button 
                class="action-button"
                on:click={() => handleActionClick(action.name)}
                title={action.description}
              >
                {action.displayName}
              </button>
            {/each}
          </div>
        </div>
      {:else}
        <div class="no-actions">
          <em>No actions available</em>
        </div>
      {/if}
    </div>
  {:else}
    <!-- No Active Character - Time Advancement Needed -->
    <div class="no-active">
      <h4>No Character Ready</h4>
      <p>All characters are on cooldown</p>
      <button class="advance-time-button" on:click={handleAdvanceTime}>
        Advance Time
      </button>
    </div>
  {/if}

  <!-- Character Timer Status -->
  {#if turnSystem?.characterTimers}
    <div class="character-timers">
      <h5>Character Status:</h5>
      <div class="timer-list">
        {#each Object.entries(turnSystem.characterTimers) as [entityId, timerData]}
          <div 
            class="character-timer"
            class:active={timerData.isActive}
            class:ready={timerData.isReady}
          >
            <span 
              class="character-indicator"
              style="color: {getCharacterStatusColor(timerData)}"
            >
              ●
            </span>
            <span class="name">{timerData.name}</span>
            <span class="status">{formatTimer(timerData.timer)}</span>
            <span class="speed">({timerData.speed} spd)</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Debug Information -->
  {#if turnSystem}
    <details class="debug-details">
      <summary>Debug Info</summary>
      <div class="debug-content">
        <div>Active Character ID: {turnSystem.activeCharacterId || 'none'}</div>
        <div>Ready Characters: {turnSystem.readyCharacters.join(', ') || 'none'}</div>
        <div>Game Tick: {turnSystem.gameTick}</div>
      </div>
    </details>
  {/if}
</div>

<style>
  .turn-display {
    background: #001122;
    border: 1px solid #00ff00;
    border-radius: 4px;
    padding: 1rem;
    font-family: 'Courier New', monospace;
    color: #00ff00;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .turn-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    border-bottom: 1px solid #003366;
    padding-bottom: 0.5rem;
  }

  .turn-header h3 {
    margin: 0;
    color: #00ff00;
    font-size: 1.1rem;
  }

  .game-tick {
    color: #888888;
    font-size: 0.8rem;
  }

  .active-character {
    background: #002244;
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #00ff00;
    margin-bottom: 1rem;
  }

  .active-character h4 {
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .character-name {
    color: #00ff00;
    font-weight: bold;
  }

  .character-rank {
    color: #888888;
    font-size: 0.8rem;
  }

  .ready-indicator {
    background: #00ff00;
    color: #001122;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: bold;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }

  .character-stats {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #888888;
    font-size: 0.8rem;
  }

  .available-actions h5 {
    margin: 0 0 0.5rem 0;
    color: #00ff00;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .action-button {
    background: #003366;
    border: 1px solid #00ff00;
    color: #00ff00;
    padding: 0.5rem 1rem;
    border-radius: 3px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: #004488;
    border-color: #00ffaa;
    color: #00ffaa;
  }

  .action-button:active {
    background: #00ff00;
    color: #001122;
  }

  .no-active {
    background: #442200;
    border: 1px solid #ffaa00;
    color: #ffaa00;
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
    margin-bottom: 1rem;
  }

  .no-active h4 {
    margin: 0 0 0.5rem 0;
  }

  .advance-time-button {
    background: #ffaa00;
    color: #442200;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 3px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    margin-top: 0.5rem;
  }

  .advance-time-button:hover {
    background: #ffcc00;
  }

  .character-timers {
    background: #001a1a;
    border: 1px solid #004444;
    padding: 0.5rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .character-timers h5 {
    margin: 0 0 0.5rem 0;
    color: #888888;
    font-size: 0.8rem;
  }

  .timer-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .character-timer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.2rem;
    font-size: 0.8rem;
  }

  .character-timer.active {
    background: #002200;
    border-radius: 3px;
  }

  .character-timer.ready:not(.active) {
    background: #221100;
    border-radius: 3px;
  }

  .character-indicator {
    font-size: 0.6rem;
  }

  .character-timer .name {
    min-width: 60px;
    color: #00ff00;
  }

  .character-timer .status {
    min-width: 60px;
    color: #888888;
  }

  .character-timer .speed {
    color: #666666;
    font-size: 0.7rem;
  }

  .no-actions {
    color: #888888;
    font-style: italic;
    text-align: center;
    padding: 1rem;
  }

  .debug-details {
    margin-top: 1rem;
    border: 1px solid #333333;
    border-radius: 3px;
  }

  .debug-details summary {
    background: #002222;
    color: #666666;
    padding: 0.3rem 0.5rem;
    cursor: pointer;
    font-size: 0.7rem;
  }

  .debug-details summary:hover {
    color: #888888;
  }

  .debug-content {
    padding: 0.5rem;
    color: #666666;
    font-size: 0.7rem;
    background: #001111;
  }

  .debug-content div {
    margin-bottom: 0.2rem;
  }
</style>
