<script>
  export let monsters = [];

  let selectedMonster = null;
  let searchQuery = '';

  function selectMonster(monster) {
    selectedMonster = monster;
  }

  // Filter monsters based on search query
  $: filteredMonsters = monsters.filter(monster =>
    monster.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    monster.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function clearSearch() {
    searchQuery = '';
  }
</script>

<div class="monsterpedia-app">
  <div class="window-frame">
    <div class="window-title">Monsterpedia</div>
    
    <div class="monsterpedia-layout">
      <!-- Monster List Pane -->
      <div class="monster-list-pane">
        <div class="monster-list-header">
          <h2>Creature Database</h2>
          <div class="search-box">
            <input
              type="text"
              placeholder="Search monsters..."
              bind:value={searchQuery}
              class="search-input"
            />
            {#if searchQuery}
              <button on:click={clearSearch} class="clear-search">✕</button>
            {/if}
          </div>
        </div>
        <div class="monster-list">
          {#each filteredMonsters as monster}
            <div
              class="monster-item {selectedMonster?.id === monster.id ? 'selected' : ''}"
              on:click={() => selectMonster(monster)}
            >
              <div class="monster-name">{monster.name}</div>
              <div class="monster-summary">{monster.summary}</div>
            </div>
          {/each}
          {#if filteredMonsters.length === 0}
            <div class="no-results">
              No monsters found matching "{searchQuery}"
            </div>
          {/if}
        </div>
      </div>

      <!-- Monster Details Pane -->
      <div class="monster-details-pane">
        {#if selectedMonster}
          <div class="monster-details">
            <div class="monster-header">
              <h2>{selectedMonster.name}</h2>
            </div>
            <div class="monster-content">
              <div class="monster-section">
                <h3>Description</h3>
                <p>{selectedMonster.details}</p>
              </div>
              <div class="monster-section">
                <h3>Known Weaknesses</h3>
                <p>{selectedMonster.knownWeaknesses}</p>
              </div>
              <div class="monster-notes">
                <h3>Investigator Notes</h3>
                <p>Report any sightings or additional information to the Society immediately. Exercise extreme caution when encountering this entity.</p>
              </div>
            </div>
          </div>
        {:else}
          <div class="no-monster-selected">
            <p>Select a creature from the list to view details</p>
            <p class="hint">Use the search box to filter the list</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .monsterpedia-app {
    height: 100%;
  }

  .monsterpedia-layout {
    display: flex;
    height: 500px;
    gap: 16px;
  }

  .monster-list-pane {
    flex: 0 0 300px;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    display: flex;
    flex-direction: column;
  }

  .monster-list-header {
    background-color: var(--primary-bg);
    color: white;
    padding: 8px;
    font-weight: bold;
  }

  .search-box {
    position: relative;
    margin-top: 8px;
  }

  .search-input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--bevel-dark);
    font-family: inherit;
    font-size: 12px;
  }

  .clear-search {
    position: absolute;
    right: 4px;
    top: 4px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: #666;
  }

  .monster-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .monster-item {
    padding: 8px;
    border: 1px solid var(--bevel-dark);
    margin-bottom: 4px;
    cursor: pointer;
    background-color: var(--bevel-light);
  }

  .monster-item.selected {
    border: 2px solid var(--accent-primary);
    background-color: #d0f0f0;
  }

  .monster-name {
    font-weight: bold;
    margin-bottom: 4px;
    font-size: 14px;
  }

  .monster-summary {
    font-size: 12px;
    color: #333;
    line-height: 1.2;
  }

  .no-results {
    padding: 16px;
    text-align: center;
    color: #666;
    font-style: italic;
  }

  .monster-details-pane {
    flex: 1;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    padding: 20px;
    overflow-y: auto;
  }

  .monster-details {
    height: 100%;
  }

  .monster-header {
    border-bottom: 1px solid var(--bevel-dark);
    padding-bottom: 16px;
    margin-bottom: 20px;
  }

  .monster-header h2 {
    color: var(--primary-bg);
    margin: 0;
  }

  .monster-section {
    margin-bottom: 24px;
  }

  .monster-section h3 {
    color: var(--accent-primary);
    margin-bottom: 8px;
    font-size: 14px;
  }

  .monster-section p {
    line-height: 1.4;
    margin: 0;
  }

  .monster-notes {
    background-color: #f0f0f0;
    padding: 16px;
    border: 1px solid var(--bevel-dark);
    margin-top: 24px;
    font-style: italic;
  }

  .monster-notes h3 {
    color: #666;
    margin-bottom: 8px;
  }

  .no-monster-selected {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    text-align: center;
  }

  .hint {
    font-size: 11px;
    margin-top: 8px;
    font-style: italic;
  }
</style>
