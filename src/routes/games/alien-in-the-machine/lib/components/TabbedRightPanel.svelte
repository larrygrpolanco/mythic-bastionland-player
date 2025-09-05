<!--
  TabbedRightPanel.svelte - Tabbed wrapper for InfoView and RadioLog
  
  Simple tabbed interface that combines the existing InfoView and RadioLog
  components with minimal changes to preserve functionality.
-->

<script>
  import InfoView from './InfoView.svelte';
  import RadioLog from './RadioLog.svelte';
  import DebugControls from './DebugControls.svelte';
  
  let activeTab = 'inspector'; // inspector, log, debug
  
  function switchTab(tab) {
    activeTab = tab;
  }
</script>

<div class="tabbed-panel">
  <div class="tab-header">
    <button 
      class="tab-btn"
      class:active={activeTab === 'inspector'}
      on:click={() => switchTab('inspector')}
    >
      Entity Inspector
    </button>
    <button 
      class="tab-btn"
      class:active={activeTab === 'log'}
      on:click={() => switchTab('log')}
    >
      Communication Log
    </button>
    <button 
      class="tab-btn"
      class:active={activeTab === 'debug'}
      on:click={() => switchTab('debug')}
    >
      Debug Controls
    </button>
  </div>
  
  <div class="tab-content">
    {#if activeTab === 'inspector'}
      <InfoView />
    {:else if activeTab === 'log'}
      <RadioLog />
    {:else if activeTab === 'debug'}
      <DebugControls />
    {/if}
  </div>
</div>

<style>
  .tabbed-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 500px; /* Match MapView height for consistent layout */
    background: rgba(0, 255, 65, 0.05);
    border: 2px solid #00ff41;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .tab-header {
    display: flex;
    border-bottom: 1px solid #00ff41;
    background: rgba(0, 255, 65, 0.1);
    flex-shrink: 0; /* Don't shrink the tab header */
  }
  
  .tab-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: #888;
    padding: 0.8rem 1rem;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    border-right: 1px solid #333;
  }
  
  .tab-btn:last-child {
    border-right: none;
  }
  
  .tab-btn:hover {
    background: rgba(0, 255, 65, 0.1);
    color: #ccc;
  }
  
  .tab-btn.active {
    background: rgba(0, 255, 65, 0.2);
    color: #00ff41;
    font-weight: bold;
  }
  
  .tab-content {
    flex: 1;
    overflow: hidden;
    position: relative;
    min-height: 0; /* Allow content to shrink below its natural size */
  }
  
  /* Override the background and border from child components to avoid double styling */
  .tab-content :global(.info-panel),
  .tab-content :global(.radio-log),
  .tab-content :global(.debug-controls) {
    background: transparent;
    border: none;
    border-radius: 0;
    height: 100%;
  }
  
  /* Responsive height adjustments */
  @media (max-width: 1200px) {
    .tabbed-panel {
      max-height: 500px; /* Slightly smaller on mobile */
    }
  }
  
  @media (max-width: 768px) {
    .tabbed-panel {
      max-height: 400px; /* Even smaller on very small screens */
    }
  }
</style>
