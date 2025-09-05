<!--
  TurnControl.svelte - Enhanced Turn Management Interface
  
  This component provides the main interface for the tick-based turn system with
  organized action selection. It replaces the simple TurnDisplay with a more
  structured approach suitable for both Phase 2 testing and Phase 3 AI integration.
  
  Features:
  - Action selection state management
  - Categorized action groups from ActionCosts.js
  - Clear visual feedback for current state
  - Scalable design for future action expansion
-->

<script>
  import { turnSystemStore, activeCharacterStore } from '../stores/worldStore.js';
  import { executeCharacterAction, advanceTime } from '../stores/worldStore.js';
  import { getActionCategories, getAvailableActionsForCharacter, getActionDescription } from '../game/ActionCosts.js';

  // Reactive stores for turn system data
  $: turnSystem = $turnSystemStore;
  $: activeCharacter = $activeCharacterStore;
  
  // Action selection state
  let selectedAction = null;
  let actionState = 'selecting'; // 'selecting', 'confirmed', 'processing'
  
  // Get categorized actions for the active character
  $: availableActionCategories = getActionCategoriesForCharacter(activeCharacter);
  
  // Category expansion state
  let expandedCategories = {
    core: true,      // Core actions expanded by default
    medical: false,
    technical: false,
    environmental: false,
    combat: false
  };

  /**
   * Get available action categories for a character based on their skills and context
   */
  function getActionCategoriesForCharacter(character) {
    if (!character) return {};
    
    const allCategories = getActionCategories();
    const characterActions = getAvailableActionsForCharacter(character.components);
    const categorizedActions = {};
    
    // Group available actions by category
    Object.entries(allCategories).forEach(([categoryKey, categoryInfo]) => {
      const actionsInCategory = characterActions.filter(action => action.category === categoryKey);
      if (actionsInCategory.length > 0) {
        categorizedActions[categoryKey] = {
          ...categoryInfo,
          actions: actionsInCategory
        };
      }
    });
    
    return categorizedActions;
  }

  /**
   * Handle action selection
   */
  function selectAction(action) {
    selectedAction = action;
    actionState = 'confirmed';
  }

  /**
   * Execute the selected action
   */
  async function executeAction() {
    if (!activeCharacter || !selectedAction) return;
    
    actionState = 'processing';
    
    try {
      const result = executeCharacterAction(activeCharacter.entityId, selectedAction.name);
      
      if (result?.success) {
        console.log('Action executed successfully:', selectedAction.name);
      } else {
        console.error('Action failed:', result?.errors || 'Unknown error');
      }
    } catch (error) {
      console.error('Action execution error:', error);
    }
    
    // Reset state for next action
    selectedAction = null;
    actionState = 'selecting';
  }

  /**
   * Cancel action selection
   */
  function cancelAction() {
    selectedAction = null;
    actionState = 'selecting';
  }

  /**
   * Toggle category expansion
   */
  function toggleCategory(categoryKey) {
    expandedCategories[categoryKey] = !expandedCategories[categoryKey];
  }

  /**
   * Handle time advancement when no one can act
   */
  function handleAdvanceTime() {
    console.log('Advancing time until someone can act');
    advanceTime();
  }

  /**
   * Format timer display
   */
  function formatTimer(timer) {
    if (timer <= 0) return 'READY';
    return `${timer} ticks`;
  }

  /**
   * Get status display text
   */
  function getStatusText() {
    switch (actionState) {
      case 'selecting':
        return 'Select Action';
      case 'confirmed':
        return `Action: ${getActionDescription(selectedAction.name)}`;
      case 'processing':
        return 'Processing...';
      default:
        return 'Select Action';
    }
  }
</script>

<!-- Turn Control Container -->
<div class="turn-control">
  <!-- Header with turn info -->
  <div class="turn-header">
    <h3>Turn Control</h3>
    {#if turnSystem}
      <div class="game-tick">Tick: {turnSystem.gameTick}</div>
    {/if}
  </div>

  {#if activeCharacter}
    <!-- Active Character & Action Status -->
    <div class="character-status">
      <div class="character-info">
        <h4>
          <span class="character-name">{activeCharacter.name}</span>
          <span class="character-rank">({activeCharacter.rank})</span>
          <span class="ready-indicator">CAN ACT</span>
        </h4>
        
        <div class="character-stats">
          <span class="speed">Speed: {activeCharacter.speed}</span>
          <span class="timer">Timer: {formatTimer(activeCharacter.timer)}</span>
        </div>
      </div>

      <!-- Action Status Section -->
      <div class="action-status">
        <div class="status-text" class:processing={actionState === 'processing'}>
          {getStatusText()}
          {#if selectedAction}
            <span class="tick-cost">({selectedAction.cost} ticks)</span>
          {/if}
        </div>
        
        {#if actionState === 'confirmed' && selectedAction}
          <div class="action-buttons">
            <button class="execute-btn" on:click={executeAction}>
              Execute
            </button>
            <button class="cancel-btn" on:click={cancelAction}>
              Cancel
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Categorized Action Selection -->
    <div class="action-selection">
      <h5>Available Actions:</h5>
      <div class="action-categories">
        {#each Object.entries(availableActionCategories) as [categoryKey, category]}
          <div class="category-group">
            <button 
              class="category-header"
              class:expanded={expandedCategories[categoryKey]}
              on:click={() => toggleCategory(categoryKey)}
            >
              <span class="expand-icon">
                {expandedCategories[categoryKey] ? '▼' : '▶'}
              </span>
              {category.name}
              <span class="action-count">({category.actions.length})</span>
            </button>
            
            {#if expandedCategories[categoryKey]}
              <div class="category-actions">
                {#each category.actions as action}
                  <button 
                    class="action-btn"
                    class:selected={selectedAction?.name === action.name}
                    class:disabled={actionState === 'processing'}
                    on:click={() => selectAction(action)}
                    title={action.description}
                    disabled={actionState === 'processing'}
                  >
                    <span class="action-name">{getActionDescription(action.name)}</span>
                    <span class="action-cost">({action.cost} ticks)</span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Character Timers Display -->
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
                style="color: {timerData.isActive ? '#00ff00' : timerData.isReady ? '#ffff00' : '#888888'}"
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
</div>

<style>
  .turn-control {
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'Courier New', monospace;
    color: #00ff00;
    font-size: 0.9rem;
    overflow: hidden;
  }

  .turn-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #003366;
    background: rgba(0, 255, 65, 0.1);
    flex-shrink: 0;
  }

  .turn-header h3 {
    margin: 0;
    color: #00ff00;
    font-size: 1rem;
  }

  .game-tick {
    color: #888888;
    font-size: 0.8rem;
  }

  .character-status {
    padding: 1rem;
    border-bottom: 1px solid #003366;
    background: rgba(0, 255, 65, 0.05);
    flex-shrink: 0;
  }

  .character-info h4 {
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
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
    padding: 0.2rem 0.4rem;
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
    color: #888888;
    font-size: 0.8rem;
  }

  .action-status {
    margin-top: 1rem;
    padding: 0.8rem;
    border: 1px solid #004444;
    border-radius: 3px;
    background: rgba(0, 68, 68, 0.2);
  }

  .status-text {
    font-size: 1rem;
    font-weight: bold;
    color: #00ffaa;
    margin-bottom: 0.5rem;
  }

  .status-text.processing {
    color: #ffaa00;
    animation: blink 1s infinite;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.5; }
  }

  .tick-cost {
    color: #888888;
    font-size: 0.9rem;
    font-weight: normal;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .execute-btn, .cancel-btn {
    padding: 0.4rem 0.8rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .execute-btn {
    background: #00aa00;
    color: #001100;
    border: 1px solid #00ff00;
  }

  .execute-btn:hover {
    background: #00ff00;
    transform: translateY(-1px);
  }

  .cancel-btn {
    background: transparent;
    color: #888888;
    border: 1px solid #666666;
  }

  .cancel-btn:hover {
    color: #aaaaaa;
    border-color: #888888;
  }

  .action-selection {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    min-height: 0;
  }

  .action-selection h5 {
    margin: 0 0 0.5rem 0;
    color: #888888;
    font-size: 0.9rem;
  }

  .action-categories {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .category-group {
    border: 1px solid #003366;
    border-radius: 3px;
    overflow: hidden;
  }

  .category-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem;
    background: rgba(0, 51, 102, 0.3);
    border: none;
    color: #00ff00;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .category-header:hover {
    background: rgba(0, 51, 102, 0.5);
  }

  .category-header.expanded {
    background: rgba(0, 51, 102, 0.4);
  }

  .expand-icon {
    color: #888888;
    font-size: 0.7rem;
    width: 10px;
  }

  .action-count {
    color: #666666;
    font-size: 0.75rem;
    margin-left: auto;
  }

  .category-actions {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 0.5rem;
    background: rgba(0, 17, 34, 0.3);
  }

  .action-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.5rem 0.8rem;
    background: rgba(0, 51, 102, 0.2);
    border: 1px solid #004488;
    color: #00ddff;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 2px;
  }

  .action-btn:hover:not(.disabled) {
    background: rgba(0, 68, 136, 0.4);
    border-color: #0066cc;
    transform: translateY(-1px);
  }

  .action-btn.selected {
    background: rgba(0, 255, 170, 0.2);
    border-color: #00ffaa;
    color: #00ffaa;
  }

  .action-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-name {
    flex: 1;
    text-align: left;
  }

  .action-cost {
    color: #888888;
    font-size: 0.75rem;
  }

  .character-timers {
    padding: 0.8rem 1rem;
    border-top: 1px solid #003366;
    background: rgba(0, 26, 26, 0.5);
    flex-shrink: 0;
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
    border-radius: 2px;
  }

  .character-timer.active {
    background: rgba(0, 34, 0, 0.5);
  }

  .character-timer.ready:not(.active) {
    background: rgba(34, 17, 0, 0.5);
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

  .no-active {
    padding: 2rem 1rem;
    text-align: center;
    color: #ffaa00;
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
    margin-top: 1rem;
  }

  .advance-time-button:hover {
    background: #ffcc00;
  }
</style>
