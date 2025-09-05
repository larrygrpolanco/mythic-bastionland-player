<!--
  RadioLog.svelte - AI Dialogue and Game Events Display
  
  This component displays the running log of AI communications, system events,
  and game messages. It's crucial for Phase 3 AI integration and debugging.
  
  Phase 0: Basic structure, shows initial log messages
  Phase 1: Real-time updates from game systems
  Phase 2: Action result logging
  Phase 3: AI dialogue and thought streams
  Phase 4: Mission updates and objective progress
  
  Future AI Development Notes:
  - This component will be the primary way to "hear" AI thinking
  - Different message types should have distinct visual styles
  - Consider auto-scrolling to latest messages
  - Add filtering controls for different message types
  - Support for different "radio channels" (squad, station, etc.)
-->

<script>
  import { 
    filteredLogStore, 
    recentLogStore, 
    logFiltersStore,
    toggleLogFilter,
    MESSAGE_TYPES 
  } from '../stores/logStore.js';
  
  $: messages = $filteredLogStore;
  $: recentMessages = $recentLogStore;
  $: filters = $logFiltersStore;
  
  let showFilters = false;
  let autoScroll = true;
  let messageContainer;
  
  // Auto-scroll to bottom when new messages arrive
  $: if (autoScroll && messageContainer && messages) {
    setTimeout(() => {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }, 10);
  }
  
  function getMessageTypeClass(type) {
    const typeClasses = {
      [MESSAGE_TYPES.SYSTEM]: 'msg-system',
      [MESSAGE_TYPES.AI_DIALOGUE]: 'msg-dialogue',
      [MESSAGE_TYPES.AI_THOUGHT]: 'msg-thought',
      [MESSAGE_TYPES.PLAYER_COMMAND]: 'msg-command',
      [MESSAGE_TYPES.ACTION_RESULT]: 'msg-action',
      [MESSAGE_TYPES.MISSION_UPDATE]: 'msg-mission',
      [MESSAGE_TYPES.ENVIRONMENTAL]: 'msg-environment'
    };
    return typeClasses[type] || 'msg-default';
  }
  
  function getMessageTypeIcon(type) {
    const icons = {
      [MESSAGE_TYPES.SYSTEM]: '⚙',
      [MESSAGE_TYPES.AI_DIALOGUE]: '📻',
      [MESSAGE_TYPES.AI_THOUGHT]: '💭',
      [MESSAGE_TYPES.PLAYER_COMMAND]: '⚡',
      [MESSAGE_TYPES.ACTION_RESULT]: '✓',
      [MESSAGE_TYPES.MISSION_UPDATE]: '🎯',
      [MESSAGE_TYPES.ENVIRONMENTAL]: '🌍'
    };
    return icons[type] || '•';
  }
  
  function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
  }
  
  function getPriorityClass(priority) {
    const priorityClasses = {
      low: 'priority-low',
      normal: 'priority-normal', 
      high: 'priority-high',
      critical: 'priority-critical'
    };
    return priorityClasses[priority] || 'priority-normal';
  }
</script>

<div class="radio-log">
  <div class="log-header">
    <h2>Communication Log</h2>
    <div class="log-controls">
      <label class="auto-scroll-toggle">
        <input type="checkbox" bind:checked={autoScroll} />
        Auto-scroll
      </label>
      <button 
        class="filter-toggle" 
        class:active={showFilters}
        on:click={() => showFilters = !showFilters}
      >
        Filters
      </button>
    </div>
  </div>
  
  {#if showFilters}
    <div class="filter-panel">
      <h3>Message Filters</h3>
      <div class="filter-options">
        <label>
          <input 
            type="checkbox" 
            checked={filters.showSystem}
            on:change={() => toggleLogFilter('showSystem')} 
          />
          System Messages
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={filters.showDialogue}
            on:change={() => toggleLogFilter('showDialogue')} 
          />
          AI Dialogue
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={filters.showThoughts}
            on:change={() => toggleLogFilter('showThoughts')} 
          />
          AI Thoughts
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={filters.showPlayerCommands}
            on:change={() => toggleLogFilter('showPlayerCommands')} 
          />
          Commands
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={filters.showActionResults}
            on:change={() => toggleLogFilter('showActionResults')} 
          />
          Action Results
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={filters.showMissionUpdates}
            on:change={() => toggleLogFilter('showMissionUpdates')} 
          />
          Mission Updates
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={filters.showEnvironmental}
            on:change={() => toggleLogFilter('showEnvironmental')} 
          />
          Environmental
        </label>
      </div>
    </div>
  {/if}
  
  <div class="log-messages" bind:this={messageContainer}>
    {#each messages as message (message.id)}
      <div class="message {getMessageTypeClass(message.type)} {getPriorityClass(message.priority)}">
        <div class="message-header">
          <span class="message-icon">{getMessageTypeIcon(message.type)}</span>
          <span class="message-entity">{message.entityName}</span>
          <span class="message-timestamp">{formatTimestamp(message.timestamp)}</span>
        </div>
        <div class="message-content">
          {message.content}
        </div>
        {#if message.metadata && Object.keys(message.metadata).length > 0}
          <details class="message-metadata">
            <summary>Debug Info</summary>
            <pre>{JSON.stringify(message.metadata, null, 2)}</pre>
          </details>
        {/if}
      </div>
    {/each}
    
    {#if messages.length === 0}
      <div class="no-messages">
        <p>No messages match current filters.</p>
        <p class="hint">Adjust filters above or wait for game events.</p>
      </div>
    {/if}
  </div>
  
  <!-- Message statistics -->
  <div class="log-footer">
    <div class="message-stats">
      <span class="stat-item">Total: {messages.length}</span>
      <span class="stat-item">Recent: {recentMessages.length}</span>
      {#if autoScroll}
        <span class="stat-item auto-scroll-indicator">📡 Live</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .radio-log {
    background: rgba(0, 255, 65, 0.05);
    border: 2px solid #00ff41;
    border-radius: 4px;
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    font-family: 'Courier New', monospace;
  }
  
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #00ff41;
  }
  
  .log-header h2 {
    margin: 0;
    color: #00ff41;
    font-size: 1.2rem;
  }
  
  .log-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .auto-scroll-toggle {
    color: #ccc;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .filter-toggle {
    background: rgba(0, 255, 65, 0.1);
    border: 1px solid #00ff41;
    color: #00ff41;
    padding: 0.3rem 0.8rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .filter-toggle:hover {
    background: rgba(0, 255, 65, 0.2);
  }
  
  .filter-toggle.active {
    background: #00ff41;
    color: #000;
  }
  
  .filter-panel {
    border: 1px solid #333;
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 3px;
  }
  
  .filter-panel h3 {
    margin: 0 0 0.5rem 0;
    color: #00ff41;
    font-size: 1rem;
  }
  
  .filter-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
  }
  
  .filter-options label {
    color: #ccc;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .filter-options input[type="checkbox"] {
    accent-color: #00ff41;
  }
  
  .log-messages {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }
  
  .message {
    border: 1px solid #333;
    border-radius: 3px;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    transition: all 0.2s;
  }
  
  .message:hover {
    background: rgba(0, 0, 0, 0.5);
  }
  
  .message-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
    font-size: 0.8rem;
  }
  
  .message-icon {
    font-size: 1rem;
    min-width: 20px;
    text-align: center;
  }
  
  .message-entity {
    font-weight: bold;
    color: #44aaff;
  }
  
  .message-timestamp {
    margin-left: auto;
    color: #888;
    font-size: 0.7rem;
  }
  
  .message-content {
    color: #ccc;
    line-height: 1.4;
    margin-left: 26px; /* Align with entity name */
  }
  
  .message-metadata {
    margin-top: 0.5rem;
    margin-left: 26px;
  }
  
  .message-metadata summary {
    color: #888;
    font-size: 0.8rem;
    cursor: pointer;
  }
  
  .message-metadata pre {
    margin-top: 0.3rem;
    color: #666;
    font-size: 0.7rem;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.3rem;
    border-radius: 2px;
  }
  
  /* Message type specific styling */
  .msg-system {
    border-color: #00ff41;
  }
  
  .msg-system .message-entity {
    color: #00ff41;
  }
  
  .msg-dialogue {
    border-color: #44aaff;
    background: rgba(68, 170, 255, 0.05);
  }
  
  .msg-dialogue .message-content {
    color: #44aaff;
  }
  
  .msg-thought {
    border-color: #aa44ff;
    background: rgba(170, 68, 255, 0.05);
  }
  
  .msg-thought .message-content {
    color: #aa44ff;
    font-style: italic;
  }
  
  .msg-command {
    border-color: #ffaa44;
    background: rgba(255, 170, 68, 0.05);
  }
  
  .msg-command .message-entity {
    color: #ffaa44;
  }
  
  .msg-action {
    border-color: #44ff44;
    background: rgba(68, 255, 68, 0.05);
  }
  
  .msg-mission {
    border-color: #ffff44;
    background: rgba(255, 255, 68, 0.05);
  }
  
  .msg-mission .message-content {
    color: #ffff44;
    font-weight: bold;
  }
  
  .msg-environment {
    border-color: #888;
    background: rgba(136, 136, 136, 0.05);
  }
  
  .msg-environment .message-content {
    color: #aaa;
    font-style: italic;
  }
  
  /* Priority styling */
  .priority-high {
    border-width: 2px;
  }
  
  .priority-critical {
    border-width: 3px;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { border-opacity: 1; }
    50% { border-opacity: 0.5; }
  }
  
  .no-messages {
    text-align: center;
    color: #888;
    padding: 2rem;
    font-style: italic;
  }
  
  .no-messages .hint {
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
  
  .log-footer {
    border-top: 1px solid #333;
    padding-top: 0.5rem;
    margin-top: 1rem;
  }
  
  .message-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #888;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .auto-scroll-indicator {
    color: #00ff41;
    animation: blink 2s infinite;
  }
  
  @keyframes blink {
    0%, 70% { opacity: 1; }
    85%, 100% { opacity: 0.3; }
  }
  
  /* Scrollbar styling */
  .log-messages::-webkit-scrollbar {
    width: 8px;
  }
  
  .log-messages::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }
  
  .log-messages::-webkit-scrollbar-thumb {
    background: #00ff41;
    border-radius: 4px;
  }
  
  .log-messages::-webkit-scrollbar-thumb:hover {
    background: #44ff44;
  }
</style>
