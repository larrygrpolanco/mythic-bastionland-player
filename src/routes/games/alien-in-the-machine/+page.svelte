<script>
  // Alien in the Machine - Main Game Page
  // Phase 0: Foundation & Setup - Complete interface layout
  
  import { gameStatusStore, nextTurn, resetGame } from './lib/stores/worldStore.js';
  import MapView from './lib/components/MapView.svelte';
  import InfoView from './lib/components/InfoView.svelte';
  import RadioLog from './lib/components/RadioLog.svelte';
  
  let gameTitle = "Alien in the Machine";
  let currentPhase = "Phase 0: Foundation & Setup";
  
  $: gameStatus = $gameStatusStore;
  
  // Phase 0: Basic game controls for testing
  function handleNextTurn() {
    nextTurn();
  }
  
  function handleResetGame() {
    resetGame();
  }
</script>

<!-- 
  Future Layout Structure (for AI reference):
  - Terminal-style UI with retro sci-fi aesthetics
  - Left panel: Map view showing rooms and entities
  - Right panel: Info/debug panel and radio log
  - Bottom panel: Command input and game controls
  - All panels will be resizable and toggleable
-->

<div class="game-container">
  <header class="terminal-header">
    <h1 class="terminal-title">
      <span class="terminal-prompt">></span> {gameTitle}
    </h1>
    <div class="phase-indicator">{currentPhase}</div>
  </header>

  <main class="game-interface">
    <!-- Phase 0: Complete game interface layout -->
    <div class="interface-panels">
      <div class="left-panel">
        <MapView />
      </div>
      <div class="right-panel">
        <div class="right-top">
          <InfoView />
        </div>
        <div class="right-bottom">
          <RadioLog />
        </div>
      </div>
      <div class="bottom-panel">
        <div class="game-controls">
          <div class="control-section">
            <h3>Game Controls</h3>
            <div class="control-buttons">
              <button class="control-btn" on:click={handleNextTurn}>
                Next Turn
              </button>
              <button class="control-btn secondary" on:click={handleResetGame}>
                Reset Game
              </button>
            </div>
          </div>
          <div class="control-section">
            <h3>Game Status</h3>
            <div class="status-display">
              <span class="status-item">State: {gameStatus.gameState}</span>
              <span class="status-item">Turn: {gameStatus.currentTurn}</span>
              <span class="status-item">Entities: {gameStatus.activeEntitiesCount}</span>
              <span class="status-item">Queue: {gameStatus.actionQueueLength}</span>
            </div>
          </div>
          <div class="control-section">
            <h3>Development</h3>
            <div class="dev-info">
              <span class="phase-info">Current: {currentPhase}</span>
              <span class="next-phase">Next: Phase 1 - Static World</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<style>
  /* Terminal/Retro Sci-Fi Theme - Foundation for all future styling */
  .game-container {
    background: #0a0a0a;
    color: #00ff41;
    font-family: 'Courier New', monospace;
    min-height: 100vh;
    padding: 1rem;
  }

  .terminal-header {
    border: 2px solid #00ff41;
    padding: 1rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 255, 65, 0.1);
  }

  .terminal-title {
    margin: 0;
    font-size: 1.5rem;
    text-shadow: 0 0 10px #00ff41;
  }

  .terminal-prompt {
    color: #ff4444;
  }

  .phase-indicator {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .game-interface {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Game interface layout */
  .interface-panels {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr auto;
    gap: 1rem;
    min-height: 75vh;
  }

  .left-panel {
    grid-row: 1 / 2;
  }

  .right-panel {
    grid-row: 1 / 2;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .right-top {
    flex: 1;
  }

  .right-bottom {
    flex: 1;
  }

  .bottom-panel {
    grid-column: 1 / -1;
    border: 2px solid #00ff41;
    background: rgba(0, 255, 65, 0.05);
    padding: 1rem;
    border-radius: 4px;
  }

  .game-controls {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 2rem;
    align-items: start;
  }

  .control-section h3 {
    margin: 0 0 0.5rem 0;
    color: #00ff41;
    font-size: 1rem;
  }

  .control-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .control-btn {
    background: rgba(0, 255, 65, 0.1);
    border: 1px solid #00ff41;
    color: #00ff41;
    padding: 0.5rem 1rem;
    border-radius: 3px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    transition: all 0.2s;
  }

  .control-btn:hover {
    background: rgba(0, 255, 65, 0.2);
    transform: translateY(-1px);
  }

  .control-btn.secondary {
    border-color: #888;
    color: #888;
    background: rgba(136, 136, 136, 0.1);
  }

  .control-btn.secondary:hover {
    background: rgba(136, 136, 136, 0.2);
    border-color: #aaa;
    color: #aaa;
  }

  .status-display {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .status-item {
    color: #ccc;
    font-size: 0.9rem;
  }

  .dev-info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .phase-info {
    color: #44aaff;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .next-phase {
    color: #888;
    font-size: 0.8rem;
    font-style: italic;
  }

  /* Responsive design */
  @media (max-width: 1200px) {
    .interface-panels {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
    
    .left-panel {
      grid-row: 1 / 2;
      min-height: 400px;
    }
    
    .right-panel {
      grid-row: 2 / 3;
      flex-direction: row;
    }
    
    .bottom-panel {
      grid-column: 1 / 2;
      grid-row: 3 / 4;
    }
    
    .game-controls {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
