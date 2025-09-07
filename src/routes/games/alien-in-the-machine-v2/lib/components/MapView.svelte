<script>
	// MapView.svelte - Enhanced Station Map with Visual Representation
	// Session 3.2: Rich visual station representation with entity states

	import { worldStore, roomsStore, marinesStore, activeCharacterStore, missionStatusStore } from '../stores/worldStore.js';

	// Reactive state - enhanced with mission and active character context
	$: world = $worldStore;
	$: rooms = $roomsStore;
	$: marines = $marinesStore;
	$: activeCharacter = $activeCharacterStore;
	$: missionStatus = $missionStatusStore;

	// Group marines by room with enhanced status
	$: marinesByRoom = marines.reduce((groups, marine) => {
		const roomId = marine.location;
		if (!groups[roomId]) groups[roomId] = [];
		groups[roomId].push(marine);
		return groups;
	}, {});

	// Enhanced room status calculation
	$: roomStatuses = rooms.reduce((statuses, room) => {
		const occupants = marinesByRoom[room.id] || [];
		const hasActiveCharacter = occupants.some(m => m.entityId === activeCharacter?.entityId);
		const hasSearched = room.searched || false;
		
		// Fix: Handle correct mission objectives structure
		let missionRelevant = false;
		if (missionStatus?.objectives) {
			const primaryObjectives = missionStatus.objectives.primary || [];
			const secondaryObjectives = missionStatus.objectives.secondary || [];
			const allObjectives = [...primaryObjectives, ...secondaryObjectives];
			
			missionRelevant = allObjectives.some(obj => 
				(obj.type === 'REACH_LOCATION' && obj.parameters?.targetRoomId === room.id) ||
				(obj.type === 'SEARCH_LOCATION' && obj.parameters?.targetRoomId === room.id)
			);
		}
		
		statuses[room.id] = {
			hasActiveCharacter,
			hasSearched,
			missionRelevant,
			occupantCount: occupants.length,
			averageHealth: occupants.length > 0 ? 
				Math.round(occupants.reduce((sum, m) => sum + m.health.percentage, 0) / occupants.length) : 100
		};
		return statuses;
	}, {});

	// Visual room layout helper
	function getRoomVisualClass(room) {
		const status = roomStatuses[room.id];
		let classes = ['room-visual'];
		
		if (status.hasActiveCharacter) classes.push('active');
		if (status.missionRelevant) classes.push('mission-relevant');
		if (status.hasSearched) classes.push('searched');
		if (status.occupantCount === 0) classes.push('empty');
		
		return classes.join(' ');
	}

	// Marine status visual helper
	function getMarineStatusClass(marine) {
		let classes = ['marine-status'];
		
		if (marine.entityId === activeCharacter?.entityId) classes.push('active');
		if (marine.controlType === 'AI') classes.push('ai-controlled');
		if (marine.health.percentage < 50) classes.push('injured');
		if (marine.turnStatus.isReady) classes.push('ready');
		
		return classes.join(' ');
	}
</script>

<div class="map-view">
	{#if !world}
		<div class="loading">Loading map...</div>
	{:else}
		<div class="map-header">
			<h3>📍 Station Layout</h3>
			<div class="map-stats">
				{rooms.length} rooms | {marines.length} marines
				{#if missionStatus}
					| Mission: {missionStatus.status}
				{/if}
			</div>
		</div>

		<!-- Enhanced Station Visual Map -->
		<div class="station-visual">
			{#each rooms as room}
				<div class="{getRoomVisualClass(room)}" 
					 title="{room.name} - {marinesByRoom[room.id]?.length || 0} occupants">
					
					<!-- Room Visual Container -->
					<div class="room-container">
						<div class="room-header-visual">
							<div class="room-name-visual">
								{room.name}
								{#if roomStatuses[room.id].missionRelevant}
									<span class="mission-marker">🎯</span>
								{/if}
								{#if roomStatuses[room.id].hasSearched}
									<span class="searched-marker">🔍</span>
								{/if}
							</div>
							<div class="room-connections">
								{room.doors?.length || 0} exits
							</div>
						</div>
						
						<!-- Enhanced Marine Display -->
						<div class="room-occupants-visual">
							{#if marinesByRoom[room.id] && marinesByRoom[room.id].length > 0}
								{#each marinesByRoom[room.id] as marine}
									<div class="{getMarineStatusClass(marine)}">
										<div class="marine-icon">
											{marine.controlType === 'AI' ? '🤖' : '👤'}
										</div>
										<div class="marine-info">
											<div class="marine-name-visual">
												{marine.name}
												{#if marine.entityId === activeCharacter?.entityId}
													<span class="active-marker">▶</span>
												{/if}
											</div>
											<div class="marine-vitals">
												<span class="health-bar">
													<span class="health-fill" 
														  style="width: {marine.health.percentage}%"
														  class:critical={marine.health.percentage < 25}
														  class:injured={marine.health.percentage < 50}>
													</span>
												</span>
												<span class="health-text">{marine.health.percentage}%</span>
											</div>
											<div class="marine-turn-info">
												{#if marine.turnStatus.isReady}
													<span class="ready-indicator">READY</span>
												{:else}
													<span class="timer-indicator">{marine.turnStatus.timer}⏱</span>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							{:else}
								<div class="empty-room">
									<span class="empty-icon">🏠</span>
									<span class="empty-text">Empty</span>
								</div>
							{/if}
						</div>

						<!-- Room Environment Info -->
						<div class="room-environment">
							<div class="environment-status">
								{#if room.atmosphere}
									<span class="atmosphere">🌬️ {room.atmosphere}</span>
								{/if}
								{#if room.lighting}
									<span class="lighting">💡 {room.lighting}</span>
								{/if}
								{#if room.temperature}
									<span class="temperature">🌡️ {room.temperature}</span>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Mission Context Display -->
		{#if missionStatus && missionStatus.objectives}
			<div class="mission-overview">
				<h4>🎯 Mission Status</h4>
				<div class="objectives-summary">
					{#each [...(missionStatus.objectives.primary || []), ...(missionStatus.objectives.secondary || [])].slice(0, 3) as objective}
						<div class="objective-item" class:completed={objective.completed}>
							<span class="objective-icon">
								{objective.completed ? '✅' : '⏳'}
							</span>
							<span class="objective-text">
								{objective.description || objective.title}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Enhanced Debug Section -->
		<div class="debug-section">
			<h4>Debug Info</h4>
			<div class="debug-info">
				<div>World Status: {world?.metadata?.status || 'Unknown'}</div>
				<div>Active Character: {activeCharacter?.name || 'None'}</div>
				{#if missionStatus}
					<div>Mission Progress: {missionStatus.completedObjectives}/{missionStatus.totalObjectives}</div>
				{/if}
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
		font-size: 1.1rem;
	}

	.map-stats {
		font-size: 0.9rem;
		color: #888888;
	}

	/* Enhanced Station Visual Layout */
	.station-visual {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.room-visual {
		border: 2px solid #444444;
		padding: 0.75rem;
		background: rgba(0, 255, 65, 0.05);
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.room-visual.active {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.15);
		box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
	}

	.room-visual.mission-relevant {
		border-left: 4px solid #ffaa00;
		background: rgba(255, 170, 0, 0.1);
	}

	.room-visual.searched {
		border-right: 3px solid #00ffaa;
	}

	.room-visual.empty {
		opacity: 0.7;
		border-style: dashed;
	}

	/* Room Container Layout */
	.room-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.room-header-visual {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #333333;
	}

	.room-name-visual {
		font-weight: bold;
		color: #00ff41;
		font-size: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mission-marker {
		color: #ffaa00;
		font-size: 0.9rem;
	}

	.searched-marker {
		color: #00ffaa;
		font-size: 0.9rem;
	}

	.room-connections {
		font-size: 0.8rem;
		color: #888888;
	}

	/* Enhanced Marine Display */
	.room-occupants-visual {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.marine-status {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border: 1px solid rgba(0, 255, 170, 0.3);
		background: rgba(0, 255, 170, 0.05);
		border-radius: 3px;
		transition: all 0.2s ease;
	}

	.marine-status.active {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.15);
		box-shadow: 0 0 5px rgba(0, 255, 65, 0.4);
	}

	.marine-status.ai-controlled {
		border-color: #ff8800;
		background: rgba(255, 136, 0, 0.1);
	}

	.marine-status.injured {
		border-color: #ff4444;
		background: rgba(255, 68, 68, 0.1);
	}

	.marine-status.ready {
		box-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
	}

	.marine-icon {
		font-size: 1.2rem;
		min-width: 20px;
		text-align: center;
	}

	.marine-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex-grow: 1;
	}

	.marine-name-visual {
		font-weight: bold;
		color: #00ffaa;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.active-marker {
		color: #00ff41;
		font-weight: bold;
		animation: pulse 1.5s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		from { opacity: 1; }
		to { opacity: 0.5; }
	}

	/* Health Bar Visualization */
	.marine-vitals {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.health-bar {
		flex-grow: 1;
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid #333333;
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}

	.health-fill {
		height: 100%;
		background: #00ff41;
		transition: width 0.5s ease;
	}

	.health-fill.injured {
		background: #ffaa00;
	}

	.health-fill.critical {
		background: #ff4444;
		animation: critical-pulse 1s ease-in-out infinite alternate;
	}

	@keyframes critical-pulse {
		from { opacity: 1; }
		to { opacity: 0.6; }
	}

	.health-text {
		font-size: 0.8rem;
		color: #cccccc;
		min-width: 35px;
		text-align: right;
	}

	/* Turn Status Indicators */
	.marine-turn-info {
		display: flex;
		justify-content: flex-end;
	}

	.ready-indicator {
		color: #00ff41;
		font-weight: bold;
		font-size: 0.8rem;
		padding: 2px 6px;
		border: 1px solid #00ff41;
		border-radius: 3px;
		background: rgba(0, 255, 65, 0.1);
	}

	.timer-indicator {
		color: #ffaa00;
		font-size: 0.8rem;
		font-weight: bold;
	}

	/* Empty Room Display */
	.empty-room {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem;
		color: #666666;
		font-style: italic;
	}

	.empty-icon {
		font-size: 1.5rem;
		opacity: 0.5;
	}

	.empty-text {
		font-size: 0.9rem;
	}

	/* Room Environment Info */
	.room-environment {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.environment-status {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.environment-status span {
		font-size: 0.75rem;
		color: #888888;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	/* Mission Overview Panel */
	.mission-overview {
		background: rgba(255, 170, 0, 0.1);
		border: 1px solid rgba(255, 170, 0, 0.3);
		padding: 0.75rem;
		border-radius: 4px;
		margin-top: 0.5rem;
	}

	.mission-overview h4 {
		margin: 0 0 0.5rem 0;
		color: #ffaa00;
		font-size: 0.95rem;
	}

	.objectives-summary {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.objective-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem;
		border-radius: 2px;
		font-size: 0.85rem;
	}

	.objective-item.completed {
		background: rgba(0, 255, 65, 0.1);
		color: #00ff41;
	}

	.objective-icon {
		font-size: 0.9rem;
		min-width: 20px;
	}

	.objective-text {
		flex-grow: 1;
	}

	/* Enhanced Debug Section */
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
