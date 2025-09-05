<!--
  MapView.svelte - Room and Entity Visualization Component
  
  This component renders the station layout and entity positions.
  It's the main visual interface for the game world.
  
  Phase 0: Basic structure and styling
  Phase 1: Render rooms from data, show entity dots
  Phase 2: Interactive elements, click handlers
  Phase 3: Real-time updates as AI moves
  Phase 4: Mission objectives visualization
  
  Future AI Development Notes:
  - Click handlers should use worldStore manager functions
  - Entity positions should be reactive to worldStore changes
  - Consider zoom/pan for larger station layouts
  - Visual feedback for selected entities and available actions
-->

<script>
  import { worldStore, selectedEntityStore, selectEntity } from '../stores/worldStore.js';
  import { getEntitiesWithComponent, getComponent } from '../game/World.js';
  
  // Phase 1: Derive real data from worldStore
  $: rooms = getRoomsFromWorld($worldStore);
  $: marines = getMarinesFromWorld($worldStore);
  $: selectedEntity = $selectedEntityStore;
  
  // Helper function to extract room data from world
  function getRoomsFromWorld(world) {
    const roomEntities = getEntitiesWithComponent(world, 'isRoom');
    return roomEntities.map(entityId => {
      const roomComponent = getComponent(world, entityId, 'isRoom');
      const positionComponent = getComponent(world, entityId, 'position');
      return {
        entityId: entityId,
        id: roomComponent.id,
        name: roomComponent.name,
        x: positionComponent.coordinates.x,
        y: positionComponent.coordinates.y,
        connections: world.roomConnections[roomComponent.id] || []
      };
    });
  }
  
  // Helper function to extract marine data from world
  function getMarinesFromWorld(world) {
    const marineEntities = getEntitiesWithComponent(world, 'isMarine');
    return marineEntities.map(entityId => {
      const marineComponent = getComponent(world, entityId, 'isMarine');
      const positionComponent = getComponent(world, entityId, 'position');
      return {
        entityId: entityId,
        id: marineComponent.id,
        name: marineComponent.name,
        roomId: positionComponent.roomId
      };
    });
  }
  
  // Click handlers
  function handleRoomClick(room) {
    console.log('Room clicked:', room.name);
    // Select the room entity for inspection
    selectEntity(room.entityId);
  }
  
  function handleEntityClick(entity) {
    console.log('Entity clicked:', entity.name);
    selectEntity(entity.entityId);
  }
  
  // Helper functions for rendering
  function getRoomPosition(roomId) {
    const room = rooms.find(r => r.id === roomId);
    return { x: room?.x || 0, y: room?.y || 0 };
  }
  
  function getEntitiesInRoom(roomId) {
    return marines.filter(m => m.roomId === roomId);
  }
</script>

<div class="map-container">
  <div class="map-header">
    <h2>Research Station Alpha-7</h2>
    <div class="map-controls">
      <!-- Phase 2: Add zoom, pan controls -->
      <span class="status">Phase 1 - Data-Driven World</span>
    </div>
  </div>
  
  <div class="map-viewport">
    <svg class="station-map" viewBox="-1.3 -0.3 1.8 2.8" preserveAspectRatio="xMidYMid meet">
      <!-- Background grid for reference -->
      <defs>
        <pattern id="grid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
          <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="#003300" stroke-width="0.02" opacity="0.3"/>
        </pattern>
      </defs>
      <rect x="-2" y="-1" width="4" height="4" fill="url(#grid)" />
      
      <!-- Room connections (drawn first, behind rooms) -->
      {#each rooms as room}
        {#each room.connections as connectionId}
          {@const targetRoom = rooms.find(r => r.id === connectionId)}
          {#if targetRoom && (room.x !== targetRoom.x || room.y !== targetRoom.y)}
            <line 
              x1={room.x} 
              y1={room.y} 
              x2={targetRoom.x} 
              y2={targetRoom.y}
              class="connection-line"
            />
          {/if}
        {/each}
      {/each}
      
      <!-- Rooms -->
      {#each rooms as room}
        <g class="room-group" transform="translate({room.x}, {room.y})">
          <rect 
            x="-0.4" 
            y="-0.3" 
            width="0.8" 
            height="0.6"
            class="room-rect"
            class:selected={selectedEntity === room.entityId}
            on:click={() => handleRoomClick(room)}
            role="button"
            tabindex="0"
          />
          <text 
            x="0" 
            y="-0.1" 
            text-anchor="middle" 
            class="room-name"
          >
            {room.name}
          </text>
          
          <!-- Entities in this room -->
          {#each getEntitiesInRoom(room.id) as entity, index}
            <circle
              cx={-0.2 + (index * 0.2)}
              cy={0.1}
              r="0.05"
              class="entity-dot marine-dot"
              class:selected={selectedEntity === entity.entityId}
              on:click|stopPropagation={() => handleEntityClick(entity)}
              role="button"
              tabindex="0"
            />
            <text
              x={-0.2 + (index * 0.2)}
              y={0.25}
              text-anchor="middle"
              class="entity-label"
            >
              {entity.name}
            </text>
          {/each}
        </g>
      {/each}
    </svg>
  </div>
  
</div>

<style>
  .map-container {
    background: rgba(0, 255, 65, 0.05);
    border: 2px solid #00ff41;
    border-radius: 4px;
    padding: 1rem;
    height: 100%;
    max-height: 500px; /* Match TabbedRightPanel height for consistent layout */
    display: flex;
    flex-direction: column;
  }
  
  .map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #00ff41;
  }
  
  .map-header h2 {
    margin: 0;
    color: #00ff41;
    font-size: 1.2rem;
  }
  
  .map-controls .status {
    color: #888;
    font-size: 0.9rem;
  }
  
  .map-viewport {
    flex: 1;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .station-map {
    width: 100%;
    max-width: 600px;
    height: 100%;
    border: 1px solid #00ff41;
    background: rgba(0, 0, 0, 0.8);
  }
  
  /* Room styling */
  .room-rect {
    fill: rgba(0, 255, 65, 0.1);
    stroke: #00ff41;
    stroke-width: 0.02;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .room-rect:hover {
    fill: rgba(0, 255, 65, 0.2);
    stroke-width: 0.03;
  }
  
  .room-rect.selected {
    fill: rgba(0, 255, 65, 0.3);
    stroke: #ff4444;
    stroke-width: 0.04;
  }
  
  .room-name {
    fill: #00ff41;
    font-family: 'Courier New', monospace;
    font-size: 0.08px;
    pointer-events: none;
  }
  
  /* Connection lines */
  .connection-line {
    stroke: #00ff41;
    stroke-width: 0.01;
    opacity: 0.6;
  }
  
  /* Entity styling */
  .entity-dot {
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .marine-dot {
    fill: #44aaff;
    stroke: #ffffff;
    stroke-width: 0.01;
  }
  
  .marine-dot:hover {
    fill: #66ccff;
    r: 0.06;
  }
  
  .marine-dot.selected {
    fill: #ff4444;
    stroke: #ffff44;
    stroke-width: 0.02;
  }
  
  .entity-label {
    fill: #44aaff;
    font-family: 'Courier New', monospace;
    font-size: 0.06px;
    pointer-events: none;
  }
  
  /* Future phase styling placeholders */
  /*
  .item-dot {
    fill: #ffaa44;
    stroke: #ffffff;
    stroke-width: 0.01;
  }
  
  .survivor-dot {
    fill: #aa44ff;
    stroke: #ffffff;
    stroke-width: 0.01;
  }
  
  .door-locked {
    stroke: #ff4444;
    stroke-dasharray: 0.05, 0.05;
  }
  
  .objective-highlight {
    fill: rgba(255, 255, 68, 0.2);
    stroke: #ffff44;
  }
  */
</style>
