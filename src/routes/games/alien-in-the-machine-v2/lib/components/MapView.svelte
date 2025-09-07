<script>
	// MapView.svelte - Minimal Station Map
	// Architecture-first approach: Display actual backend room/marine data

	import { worldStore, roomsStore, marinesStore } from '../stores/worldStore.js';

	// Reactive state - purely from backend stores
	$: world = $worldStore;
	$: rooms = $roomsStore;
	$: marines = $marinesStore;

	// Group marines by room for display
	$: marinesByRoom = marines.reduce((groups, marine) => {
		const roomId = marine.location;
		if (!groups[roomId]) groups[roomId] = [];
		groups[roomId].push(marine);
		return groups;
	}, {});
</script>

<div class="map-view">
	{#if !world}
		<div class="loading">Loading map...</div>
	{:else}
		<div class="map-header">
			<h3>Station Layout</h3>
			<div class="map-stats">
				{rooms.length} rooms | {marines.length} marines
			</div>
		</div>

		<div class="room-list">
			{#each rooms as room}
				<div class="room-item">
					<div class="room-header">
						<div class="room-name">{room.name}</div>
						<div class="room-id">{room.id}</div>
					</div>
					
					<div class="room-occupants">
						{#if marinesByRoom[room.id] && marinesByRoom[room.id].length > 0}
							{#each marinesByRoom[room.id] as marine}
								<div class="marine-item">
									<span class="marine-name">{marine.name}</span>
									<span class="marine-status">
										{marine.health.percentage}% HP
									</span>
									<span class="turn-indicator" class:ready={marine.turnStatus.isReady}>
										{marine.turnStatus.isReady ? 'RDY' : marine.turnStatus.timer}
									</span>
								</div>
							{/each}
						{:else}
							<div class="no-occupants">Empty</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Debug info -->
		<div class="debug-section">
			<h4>Debug</h4>
			<div class="debug-info">
				<div>Rooms loaded: {rooms.length}</div>
				<div>Marines loaded: {marines.length}</div>
				<div>World status: {world?.metadata?.status || 'Unknown'}</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.map-view {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		font-family: 'Courier New', monospace;
		color: #00ff41;
		background: #000000;
		border: 1px solid #333333;
		height: 100%;
		overflow-y: auto;
	}

	.loading {
		color: #888888;
		text-align: center;
		padding: 2rem;
	}

	.map-header {
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.map-header h3 {
		margin: 0 0 0.25rem 0;
		color: #00ff41;
	}

	.map-stats {
		font-size: 0.9rem;
		color: #888888;
	}

	.room-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.room-item {
		border: 1px solid #444444;
		padding: 0.75rem;
		background: rgba(0, 255, 65, 0.05);
	}

	.room-header {
		margin-bottom: 0.5rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid #333333;
	}

	.room-name {
		font-weight: bold;
		color: #00ff41;
	}

	.room-id {
		font-size: 0.8rem;
		color: #666666;
	}

	.room-occupants {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.marine-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.25rem 0.5rem;
		background: rgba(0, 255, 170, 0.1);
		border: 1px solid rgba(0, 255, 170, 0.2);
		font-size: 0.85rem;
	}

	.marine-name {
		color: #00ffaa;
		font-weight: bold;
	}

	.marine-status {
		color: #cccccc;
	}

	.turn-indicator {
		color: #ffaa00;
		font-weight: bold;
		font-size: 0.75rem;
		min-width: 30px;
		text-align: right;
	}

	.turn-indicator.ready {
		color: #00ff41;
	}

	.no-occupants {
		color: #666666;
		font-style: italic;
		text-align: center;
		padding: 0.5rem;
	}

	.debug-section {
		margin-top: auto;
		padding-top: 0.5rem;
		border-top: 1px solid #333333;
	}

	.debug-section h4 {
		margin: 0 0 0.5rem 0;
		color: #666666;
		font-size: 0.9rem;
	}

	.debug-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: #666666;
	}
</style>
