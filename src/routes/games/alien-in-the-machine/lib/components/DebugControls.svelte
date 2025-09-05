<!--
  DebugControls.svelte - Player Control Interface for Phase 2
  
  This component provides the debug interface for controlling marines and testing
  the action system. It dynamically generates available actions based on the
  selected marine's current state and context.
  
  Phase 2 Features:
  - Marine selection dropdown
  - Dynamic action buttons based on context
  - Turn advancement and processing
  - Real-time feedback for action results
  
  Future Phases:
  - Phase 3: Will show AI decision making
  - Phase 4: Mission objective controls
-->

<script>
  import { worldStore, selectedEntityStore, addAction, nextTurn, setGamePhase } from '../stores/worldStore.js';
  import { getEntitiesWithComponent, getComponent } from '../game/World.js';
  import { getAvailableActions } from '../game/systems.js';
  
  // Reactive state
  $: world = $worldStore;
  $: selectedEntity = $selectedEntityStore;
  
  // Player-controlled marine
  let playerControlledMarine = null;
  let actionFeedback = [];
  
  // Get all marines for selection
  $: marines = getMarinesFromWorld(world);
  $: availableActions = playerControlledMarine ? getContextualActions(world, playerControlledMarine) : [];
  
  // Helper function to get marines from world
  function getMarinesFromWorld(world) {
    const marineEntities = getEntitiesWithComponent(world, 'isMarine');
    return marineEntities.map(entityId => {
      const marineComponent = getComponent(world, entityId, 'isMarine');
      const positionComponent = getComponent(world, entityId, 'position');
      return {
        entityId: entityId,
        id: marineComponent.id,
        name: marineComponent.name,
        rank: marineComponent.rank,
        roomId: positionComponent?.roomId || 'unknown'
      };
    });
  }
  
  // Get contextual actions for the selected marine
  function getContextualActions(world, marineEntityId) {
    const actions = [];
    const position = getComponent(world, marineEntityId, 'position');
    const inventory = getComponent(world, marineEntityId, 'inventory');
    
    if (!position) return actions;
    
    // Movement actions - get actual connected rooms
    const roomConnections = world.roomConnections[position.roomId] || [];
    roomConnections.forEach(targetRoomId => {
      const roomData = world.roomData[targetRoomId];
      if (roomData) {
        actions.push({
          type: 'moveTo',
          label: `Move to ${roomData.name}`,
          targetRoomId: targetRoomId,
          category: 'movement'
        });
      }
    });
    
    // Item pickup actions - get items in current room
    const currentRoomData = world.roomData[position.roomId];
    if (currentRoomData?.items) {
      currentRoomData.items.forEach(item => {
        if (item.pickupable) {
          actions.push({
            type: 'pickUpItem',
            label: `Pick up ${item.name}`,
            itemId: item.id,
            category: 'items'
          });
        }
      });
    }
    
    // Search actions - get searchable furniture
    if (currentRoomData?.furniture) {
      currentRoomData.furniture.forEach(furniture => {
        if (furniture.searchable) {
          actions.push({
            type: 'searchArea',
            label: `Search ${furniture.name}`,
            targetArea: furniture.id,
            category: 'exploration'
          });
        }
      });
    }
    
    // Use item actions - get usable items from inventory
    if (inventory?.items) {
      inventory.items.forEach((item, index) => {
        if (item.usable) {
          actions.push({
            type: 'useItem',
            label: `Use ${item.name}`,
            itemId: item.id,
            category: 'items'
          });
        }
      });
    }
    
    return actions;
  }
  
  // Execute an action
  function executeAction(action) {
    if (!playerControlledMarine) return;
    
    const actionData = {
      type: action.type,
      entityId: playerControlledMarine,
      ...action
    };
    
    // Add action to queue
    const success = addAction(actionData);
    if (success) {
      addFeedback(`Queued: ${action.label}`, 'info');
    } else {
      addFeedback(`Failed to queue: ${action.label}`, 'error');
    }
  }
  
  // Process the turn
  function processTurn() {
    if (world.actionQueue.length === 0) {
      addFeedback('No actions to process', 'warning');
      return;
    }
    
    addFeedback(`Processing ${world.actionQueue.length} actions...`, 'info');
    nextTurn();
  }
  
  // Add feedback message
  function addFeedback(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    actionFeedback = [
      { message, type, timestamp },
      ...actionFeedback.slice(0, 9) // Keep last 10 messages
    ];
  }
  
  // Clear feedback
  function clearFeedback() {
    actionFeedback = [];
  }
  
  // Handle marine selection
  function selectMarine(event) {
    playerControlledMarine = parseInt(event.target.value) || null;
    if (playerControlledMarine) {
      const marine = marines.find(m => m.entityId === playerControlledMarine);
      addFeedback(`Selected ${marine.name} for control`, 'success');
    }
  }
  
  // Upgrade to Phase 2 if needed
  function enablePhase2() {
    setGamePhase(2);
    addFeedback('Phase 2 enabled - Action system active', 'success');
  }
  
  // Group actions by category
  $: actionsByCategory = availableActions.reduce((groups, action) => {
    const category = action.category || 'other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(action);
    return groups;
  }, {});
</script>

<div class="debug-controls">
  <div class="debug-header">
    <h3>Debug Controls - Phase 2</h3>
    <div class="phase-info">
      <span class="phase-indicator">Phase: {world.metadata.phase}</span>
      <span class="turn-counter">Turn: {world.currentTurn}</span>
      <span class="queue-length">Queue: {world.actionQueue.length}</span>
    </div>
  </div>
  
  <!-- Phase 2 Enable Button -->
  {#if world.metadata.phase < 2}
    <div class="phase-upgrade">
      <button on:click={enablePhase2} class="phase-button">
        Enable Phase 2 - Action System
      </button>
      <p>Click to activate the interactive action system</p>
    </div>
  {:else}
    <!-- Marine Selection -->
    <div class="marine-selection">
      <label for="marine-select">Control Marine:</label>
      <select id="marine-select" on:change={selectMarine}>
        <option value="">Select a marine...</option>
        {#each marines as marine}
          <option value={marine.entityId}>
            {marine.rank} {marine.name} (in {marine.roomId})
          </option>
        {/each}
      </select>
    </div>
    
    <!-- Action Controls -->
    {#if playerControlledMarine}
      <div class="action-controls">
        <h4>Available Actions:</h4>
        
        {#each Object.entries(actionsByCategory) as [category, actions]}
          <div class="action-category">
            <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
            <div class="action-buttons">
              {#each actions as action}
                <button 
                  class="action-button {action.category}"
                  on:click={() => executeAction(action)}
                >
                  {action.label}
                </button>
              {/each}
            </div>
          </div>
        {/each}
        
        {#if Object.keys(actionsByCategory).length === 0}
          <p class="no-actions">No actions available in current context</p>
        {/if}
      </div>
      
      <!-- Turn Processing -->
      <div class="turn-controls">
        <button 
          class="process-turn-button" 
          on:click={processTurn}
          disabled={world.actionQueue.length === 0}
        >
          Process Turn ({world.actionQueue.length} actions)
        </button>
      </div>
    {/if}
  {/if}
  
  <!-- Action Feedback -->
  <div class="feedback-section">
    <div class="feedback-header">
      <h4>Action Log</h4>
      <button class="clear-button" on:click={clearFeedback}>Clear</button>
    </div>
    <div class="feedback-log">
      {#each actionFeedback as feedback}
        <div class="feedback-message {feedback.type}">
          <span class="timestamp">{feedback.timestamp}</span>
          <span class="message">{feedback.message}</span>
        </div>
      {/each}
      {#if actionFeedback.length === 0}
        <div class="no-feedback">No actions performed yet</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .debug-controls {
    background: rgba(0, 255, 65, 0.05);
    border: 2px solid #00ff41;
    border-radius: 4px;
    padding: 1rem;
    height: 100%;
    max-height: 500px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
  }
  
  .debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #00ff41;
  }
  
  .debug-header h3 {
    margin: 0;
    color: #00ff41;
    font-size: 1.1rem;
  }
  
  .phase-info {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
  }
  
  .phase-indicator {
    color: #44aaff;
  }
  
  .turn-counter {
    color: #ffaa44;
  }
  
  .queue-length {
    color: #aa44ff;
  }
  
  .phase-upgrade {
    text-align: center;
    padding: 2rem;
  }
  
  .phase-button {
    background: #00ff41;
    color: #000;
    border: none;
    padding: 1rem 2rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .phase-button:hover {
    background: #44ff77;
  }
  
  .marine-selection {
    margin-bottom: 1rem;
  }
  
  .marine-selection label {
    display: block;
    color: #00ff41;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  .marine-selection select {
    width: 100%;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff41;
    border: 1px solid #00ff41;
    padding: 0.5rem;
    border-radius: 2px;
    font-family: 'Courier New', monospace;
  }
  
  .action-controls {
    margin-bottom: 1rem;
  }
  
  .action-controls h4 {
    color: #00ff41;
    margin: 0 0 0.5rem 0;
  }
  
  .action-category {
    margin-bottom: 1rem;
  }
  
  .action-category h5 {
    color: #44aaff;
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .action-button {
    background: rgba(0, 255, 65, 0.1);
    color: #00ff41;
    border: 1px solid #00ff41;
    padding: 0.5rem 1rem;
    border-radius: 2px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .action-button:hover {
    background: rgba(0, 255, 65, 0.2);
    border-color: #44ff77;
  }
  
  .action-button.movement {
    border-color: #44aaff;
    color: #44aaff;
  }
  
  .action-button.items {
    border-color: #ffaa44;
    color: #ffaa44;
  }
  
  .action-button.exploration {
    border-color: #aa44ff;
    color: #aa44ff;
  }
  
  .no-actions {
    color: #888;
    font-style: italic;
    margin: 0;
  }
  
  .turn-controls {
    margin-bottom: 1rem;
    text-align: center;
  }
  
  .process-turn-button {
    background: #ffaa44;
    color: #000;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .process-turn-button:hover:not(:disabled) {
    background: #ffcc77;
  }
  
  .process-turn-button:disabled {
    background: #444;
    color: #888;
    cursor: not-allowed;
  }
  
  .feedback-section {
    border-top: 1px solid #00ff41;
    padding-top: 1rem;
  }
  
  .feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .feedback-header h4 {
    margin: 0;
    color: #00ff41;
    font-size: 1rem;
  }
  
  .clear-button {
    background: transparent;
    color: #888;
    border: 1px solid #888;
    padding: 0.25rem 0.5rem;
    border-radius: 2px;
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .clear-button:hover {
    color: #00ff41;
    border-color: #00ff41;
  }
  
  .feedback-log {
    max-height: 150px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid #333;
    border-radius: 2px;
    padding: 0.5rem;
  }
  
  .feedback-message {
    display: flex;
    margin-bottom: 0.25rem;
    font-size: 0.8rem;
  }
  
  .timestamp {
    color: #888;
    margin-right: 0.5rem;
    min-width: 80px;
  }
  
  .message {
    flex: 1;
  }
  
  .feedback-message.info .message {
    color: #44aaff;
  }
  
  .feedback-message.success .message {
    color: #00ff41;
  }
  
  .feedback-message.warning .message {
    color: #ffaa44;
  }
  
  .feedback-message.error .message {
    color: #ff4444;
  }
  
  .no-feedback {
    color: #888;
    font-style: italic;
    text-align: center;
    padding: 1rem;
  }
</style>
