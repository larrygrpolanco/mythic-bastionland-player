<script>
  export let tabs = [];
  export let activeTab;
  
  // Dispatch tab change event
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  function handleTabClick(tabId) {
    dispatch('tabChange', tabId);
  }
</script>

<div class="tabs-container">
  {#each tabs as tab}
    <button
      class="tab-button {activeTab === tab.id ? 'active' : ''}"
      on:click={() => handleTabClick(tab.id)}
    >
      <span class="tab-label">{tab.label}</span>
      {#if tab.notification}
        <span class="notification-badge"></span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .tabs-container {
    display: flex;
    background-color: var(--primary-bg);
    border-bottom: 2px solid var(--bevel-dark);
    padding: 4px 4px 0 4px;
    gap: 2px;
  }
  
  .tab-button {
    background-color: var(--bevel-light);
    border: 1px solid;
    border-color: var(--bevel-light) var(--bevel-dark) var(--bevel-dark) var(--bevel-light);
    border-bottom: none;
    padding: 6px 12px;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;
    color: var(--text-color);
    position: relative;
    margin: 0;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  .tab-button.active {
    background-color: var(--content-bg);
    border-color: var(--bevel-dark) var(--bevel-light) var(--content-bg) var(--bevel-light);
    border-bottom: 1px solid var(--content-bg);
    margin-bottom: -1px;
  }
  
  .tab-button:not(.active):hover {
    background-color: #d0d0d0;
  }
  
  .tab-label {
    margin-right: 4px;
  }
  
  .notification-badge {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: var(--notification-red);
    border-radius: 50%;
    border: 1px solid var(--bevel-dark);
  }
</style>
