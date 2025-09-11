<script>
  export let mapData = {};

  let selectedBorough = null;
  let selectedLocation = null;
  let viewMode = 'boroughs'; // 'boroughs' or 'locations'

  function selectBorough(boroughKey) {
    selectedBorough = mapData.boroughs[boroughKey];
    viewMode = 'locations';
    selectedLocation = null;
  }

  function selectLocation(location) {
    selectedLocation = location;
    // Mark as visited when selected
    if (!location.visited) {
      location.visited = true;
    }
  }

  function backToBoroughs() {
    viewMode = 'boroughs';
    selectedBorough = null;
    selectedLocation = null;
  }

  function getBoroughColor(boroughKey) {
    const colors = {
      manhattan: '#ff6b6b',
      brooklyn: '#4ecdc4',
      queens: '#45b7d1',
      bronx: '#f9ca24',
      statenIsland: '#6c5ce7'
    };
    return colors[boroughKey] || '#95a5a6';
  }
</script>

<div class="map-app">
  <div class="window-frame">
    <div class="window-title">NYC Map</div>
    
    <div class="map-layout">
      <!-- Map Navigation Pane -->
      <div class="map-nav-pane">
        <div class="map-nav-header">
          {#if viewMode === 'boroughs'}
            <h2>Boroughs</h2>
          {:else}
            <div class="back-nav">
              <button on:click={backToBoroughs} class="back-button">← Back</button>
              <h2>{selectedBorough.name}</h2>
            </div>
          {/if}
        </div>
        
        <div class="map-nav-content">
          {#if viewMode === 'boroughs'}
            <div class="borough-list">
              {#each Object.entries(mapData.boroughs) as [key, borough]}
                <div
                  class="borough-item"
                  on:click={() => selectBorough(key)}
                  style="border-left: 4px solid {getBoroughColor(key)}"
                >
                  <div class="borough-name">{borough.name}</div>
                  <div class="location-count">{borough.locations.length} locations</div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="location-list">
              {#each selectedBorough.locations as location}
                <div
                  class="location-item {location.visited ? 'visited' : ''} {selectedLocation?.id === location.id ? 'selected' : ''}"
                  on:click={() => selectLocation(location)}
                >
                  <div class="location-name">{location.name}</div>
                  {#if location.hasActiveEvent}
                    <div class="active-event">Active Event</div>
                  {/if}
                  {#if location.visited}
                    <div class="visited-indicator">✓</div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Map Details Pane -->
      <div class="map-details-pane">
        {#if selectedLocation}
          <div class="location-details">
            <div class="location-header">
              <h2>{selectedLocation.name}</h2>
              <div class="location-meta">
                <span class="borough-name">{selectedBorough.name}</span>
                {#if selectedLocation.hasActiveEvent}
                  <span class="event-status">Active Investigation</span>
                {/if}
              </div>
            </div>
            
            <div class="location-content">
              <div class="location-description">
                <h3>Details</h3>
                <p>{selectedLocation.details}</p>
              </div>
              
              {#if selectedLocation.npcs && selectedLocation.npcs.length > 0}
                <div class="npcs-section">
                  <h3>Key Contacts</h3>
                  <div class="npc-list">
                    {#each selectedLocation.npcs as npc}
                      <div class="npc-item">
                        <div class="npc-name">{npc.name}</div>
                        <div class="npc-role">{npc.role}</div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
              
              <div class="investigation-notes">
                <h3>Investigation Notes</h3>
                <p>Report any findings to the Society. Document all anomalies and collect evidence when safe to do so.</p>
              </div>
            </div>
          </div>
        {:else}
          <div class="no-location-selected">
            {#if viewMode === 'boroughs'}
              <p>Select a borough to view its locations</p>
              <div class="map-hint">
                <p>Each borough contains multiple locations with reported anomalies.</p>
                <p>Focus investigations on areas with active events.</p>
              </div>
            {:else}
              <p>Select a location to view details</p>
              <div class="map-hint">
                <p>Locations with active events require immediate attention.</p>
                <p>Visit locations to gather information and speak with contacts.</p>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .map-app {
    height: 100%;
  }

  .map-layout {
    display: flex;
    height: 500px;
    gap: 16px;
  }

  .map-nav-pane {
    flex: 0 0 300px;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    display: flex;
    flex-direction: column;
  }

  .map-nav-header {
    background-color: var(--primary-bg);
    color: white;
    padding: 8px;
    font-weight: bold;
  }

  .back-nav {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 12px;
    padding: 2px 6px;
  }

  .back-button:hover {
    text-decoration: underline;
  }

  .map-nav-content {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .borough-list, .location-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .borough-item {
    padding: 12px;
    border: 1px solid var(--bevel-dark);
    cursor: pointer;
    background-color: var(--bevel-light);
    transition: background-color 0.2s;
  }

  .borough-item:hover {
    background-color: #e0e0e0;
  }

  .borough-name {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .location-count {
    font-size: 11px;
    color: #666;
  }

  .location-item {
    padding: 8px;
    border: 1px solid var(--bevel-dark);
    cursor: pointer;
    background-color: var(--bevel-light);
    position: relative;
  }

  .location-item.visited {
    background-color: #e8f5e8;
  }

  .location-item.selected {
    border: 2px solid var(--accent-primary);
    background-color: #d0f0f0;
  }

  .location-name {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .active-event {
    display: inline-block;
    background-color: var(--notification-red);
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    margin-right: 4px;
  }

  .visited-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    color: var(--accent-primary);
    font-weight: bold;
  }

  .map-details-pane {
    flex: 1;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    padding: 20px;
    overflow-y: auto;
  }

  .location-details {
    height: 100%;
  }

  .location-header {
    border-bottom: 1px solid var(--bevel-dark);
    padding-bottom: 16px;
    margin-bottom: 20px;
  }

  .location-header h2 {
    color: var(--primary-bg);
    margin-bottom: 8px;
  }

  .location-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #666;
  }

  .event-status {
    color: var(--notification-red);
    font-weight: bold;
  }

  .location-content {
    line-height: 1.6;
  }

  .location-description, .npcs-section, .investigation-notes {
    margin-bottom: 24px;
  }

  .location-description h3, .npcs-section h3, .investigation-notes h3 {
    color: var(--accent-primary);
    margin-bottom: 8px;
    font-size: 14px;
  }

  .npc-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .npc-item {
    padding: 8px;
    border: 1px solid var(--bevel-dark);
    background-color: #f8f8f8;
  }

  .npc-name {
    font-weight: bold;
    margin-bottom: 2px;
  }

  .npc-role {
    font-size: 11px;
    color: #666;
  }

  .investigation-notes {
    background-color: #f0f0f0;
    padding: 16px;
    border: 1px solid var(--bevel-dark);
    font-style: italic;
  }

  .no-location-selected {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    text-align: center;
  }

  .map-hint {
    margin-top: 16px;
    font-size: 12px;
    max-width: 300px;
  }

  .map-hint p {
    margin-bottom: 8px;
  }
</style>
