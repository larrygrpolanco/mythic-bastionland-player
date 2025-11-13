<script>
	// InfoView.svelte - Enhanced Mission Briefing & Entity Examination
	// Session 3.2: Mission briefing, status display, and detailed entity examination

	import { 
		worldStore, 
		roomsStore, 
		marinesStore, 
		missionStatusStore,
		activeCharacterStore,
		getWorldDebugInfo 
	} from '../stores/worldStore.js';
	import { getMissionStatus } from '../game/systems/MissionSystem.js';

	// Enhanced reactive state with mission and entity context
	$: world = $worldStore;
	$: rooms = $roomsStore;
	$: marines = $marinesStore;
	$: missionStatus = $missionStatusStore;
	$: activeCharacter = $activeCharacterStore;
	$: debugInfo = world ? getWorldDebugInfo() : null;

	// UI state management
	let activeTab = 'mission'; // mission, entities, world, debug
	let selectedEntityId = '';
	let selectedEntityType = 'marine'; // marine, room
	
	// Enhanced entity data with user-friendly descriptions
	function getEnhancedEntityData(entityId, entityType) {
		if (!world || !entityId) return null;
		
		let entityData;
		let description;
		
		if (entityType === 'marine') {
			entityData = marines.find(m => m.entityId === parseInt(entityId));
			if (entityData) {
				description = generateMarineDescription(entityData);
			}
		} else if (entityType === 'room') {
			entityData = rooms.find(r => r.entityId === parseInt(entityId));
			if (entityData) {
				description = generateRoomDescription(entityData);
			}
		}
		
		return entityData ? { ...entityData, enhancedDescription: description } : null;
	}

	// Generate rich marine descriptions
	function generateMarineDescription(marine) {
		let description = `${marine.name} is a ${marine.rank} in the Colonial Marines. `;
		
		if (marine.health.percentage >= 80) {
			description += `They appear to be in excellent physical condition. `;
		} else if (marine.health.percentage >= 50) {
			description += `They show signs of fatigue but remain combat-ready. `;
		} else {
			description += `They appear injured and may need medical attention. `;
		}
		
		if (marine.skills) {
			const topSkills = Object.entries(marine.skills)
				.sort(([,a], [,b]) => b - a)
				.slice(0, 2)
				.map(([skill, level]) => `${skill} (${level})`);
			if (topSkills.length > 0) {
				description += `Notable skills: ${topSkills.join(', ')}. `;
			}
		}
		
		if (marine.personality) {
			description += `Personality: ${Object.keys(marine.personality).join(', ')}. `;
		}
		
		description += `Currently located in ${marine.location}.`;
		
		return description;
	}

	// Generate rich room descriptions
	function generateRoomDescription(room) {
		let description = `${room.name}: ${room.description || 'A standard ship compartment.'}`;
		
		if (room.atmosphere) description += ` Atmosphere: ${room.atmosphere}.`;
		if (room.lighting) description += ` Lighting: ${room.lighting}.`;
		if (room.temperature) description += ` Temperature: ${room.temperature}.`;
		
		const occupants = marines.filter(m => m.location === room.id);
		if (occupants.length > 0) {
			description += ` Currently occupied by: ${occupants.map(m => m.name).join(', ')}.`;
		} else {
			description += ` Currently unoccupied.`;
		}
		
		if (room.doors && room.doors.length > 0) {
			description += ` Connected to: ${room.doors.map(d => d.targetRoomName || d.targetRoomId).join(', ')}.`;
		}
		
		return description;
	}

	$: selectedEntityData = getEnhancedEntityData(selectedEntityId, selectedEntityType);

	// Mission briefing data - handle primary/secondary objectives structure
	$: missionBriefing = world ? {
		title: "First Contact Protocol",
		overview: "Your team has boarded the research station to investigate and establish team communication. Work together to complete all mission objectives while ensuring team safety.",
		objectives: missionStatus?.objectives ? [
			...(missionStatus.objectives.primary || []),
			...(missionStatus.objectives.secondary || [])
		] : [],
		status: missionStatus?.status || 'IN_PROGRESS',
		timeElapsed: world.metadata?.gameTime || 0,
		criticalInfo: [
			"Maintain team communication at all times",
			"Document all discoveries thoroughly", 
			"Report any anomalous readings immediately",
			"Follow standard Colonial Marine protocols"
		]
	} : null;
</script>

<div class="info-view">
	{#if !world}
		<div class="loading">Loading information...</div>
	{:else}
		<!-- Enhanced Tabbed Interface -->
		<div class="tab-nav">
			<button 
				class="tab-btn" 
				class:active={activeTab === 'mission'}
				on:click={() => activeTab = 'mission'}
			>
				📋 Mission
			</button>
			<button 
				class="tab-btn" 
				class:active={activeTab === 'entities'}
				on:click={() => activeTab = 'entities'}
			>
				🔍 Entities
			</button>
			<button 
				class="tab-btn" 
				class:active={activeTab === 'world'}
				on:click={() => activeTab = 'world'}
			>
				🌍 World
			</button>
			<button 
				class="tab-btn" 
				class:active={activeTab === 'debug'}
				on:click={() => activeTab = 'debug'}
			>
				🔧 Debug
			</button>
		</div>

		<!-- Tab Content -->
		<div class="tab-content">
			
			<!-- Mission Briefing & Status Tab -->
			{#if activeTab === 'mission'}
				<div class="mission-tab">
					{#if missionBriefing}
						<!-- Mission Header -->
						<div class="mission-header">
							<h2>{missionBriefing.title}</h2>
							<div class="mission-status" class:in-progress={missionBriefing.status === 'IN_PROGRESS'}>
								Status: {missionBriefing.status}
							</div>
						</div>

						<!-- Mission Overview -->
						<div class="mission-section">
							<h3>📖 Mission Overview</h3>
							<div class="mission-overview">
								{missionBriefing.overview}
							</div>
						</div>

						<!-- Objectives -->
						<div class="mission-section">
							<h3>🎯 Mission Objectives</h3>
							<div class="objectives-list">
								{#each missionBriefing.objectives as objective}
									<div class="objective-item" class:completed={objective.status === 'COMPLETED'}>
										<div class="objective-status">
											{objective.status === 'COMPLETED' ? '✅' : '⏳'}
										</div>
										<div class="objective-details">
											<div class="objective-title">
												{objective.description || objective.type}
											</div>
											<div class="objective-meta">
												Priority: {objective.priority} | 
												Type: {objective.type}
												{#if objective.target}
													| Target: {objective.target}
												{/if}
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- Critical Information -->
						<div class="mission-section">
							<h3>⚠️ Critical Information</h3>
							<ul class="critical-info">
								{#each missionBriefing.criticalInfo as info}
									<li>{info}</li>
								{/each}
							</ul>
						</div>

						<!-- Mission Stats -->
						<div class="mission-section">
							<h3>📊 Mission Statistics</h3>
							<div class="mission-stats">
								<div class="stat-item">
									<span class="stat-label">Time Elapsed:</span>
									<span class="stat-value">{missionBriefing.timeElapsed} ticks</span>
								</div>
								<div class="stat-item">
									<span class="stat-label">Objectives Complete:</span>
									<span class="stat-value">
										{missionBriefing.objectives.filter(o => o.status === 'COMPLETED').length} / {missionBriefing.objectives.length}
									</span>
								</div>
								<div class="stat-item">
									<span class="stat-label">Active Character:</span>
									<span class="stat-value">{activeCharacter?.name || 'None'}</span>
								</div>
							</div>
						</div>
					{:else}
						<div class="no-mission">No mission data available</div>
					{/if}
				</div>
			{/if}

			<!-- Enhanced Entity Examination Tab -->
			{#if activeTab === 'entities'}
				<div class="entities-tab">
					<!-- Entity Type Selector -->
					<div class="entity-type-selector">
						<h3>🔍 Entity Examination</h3>
						<div class="type-buttons">
							<button 
								class="type-btn"
								class:active={selectedEntityType === 'marine'}
								on:click={() => { selectedEntityType = 'marine'; selectedEntityId = ''; }}
							>
								👤 Marines
							</button>
							<button 
								class="type-btn"
								class:active={selectedEntityType === 'room'}
								on:click={() => { selectedEntityType = 'room'; selectedEntityId = ''; }}
							>
								🏠 Rooms
							</button>
						</div>
					</div>

					<!-- Entity List -->
					<div class="entity-list-section">
						{#if selectedEntityType === 'marine'}
							<h4>Marine Personnel</h4>
							<div class="entity-list">
								{#each marines as marine}
									<button 
										class="entity-item"
										class:selected={selectedEntityId == marine.entityId}
										on:click={() => selectedEntityId = marine.entityId}
									>
										<div class="entity-icon">👤</div>
										<div class="entity-info">
											<div class="entity-name">{marine.name}</div>
											<div class="entity-details">
												{marine.rank} | {marine.location} | {marine.health.percentage}% HP
											</div>
										</div>
									</button>
								{/each}
							</div>
						{:else if selectedEntityType === 'room'}
							<h4>Station Compartments</h4>
							<div class="entity-list">
								{#each rooms as room}
									<button 
										class="entity-item"
										class:selected={selectedEntityId == room.entityId}
										on:click={() => selectedEntityId = room.entityId}
									>
										<div class="entity-icon">🏠</div>
										<div class="entity-info">
											<div class="entity-name">{room.name}</div>
											<div class="entity-details">
												{marines.filter(m => m.location === room.id).length} occupants | 
												{room.doors?.length || 0} exits
											</div>
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Entity Details -->
					{#if selectedEntityData}
						<div class="entity-details-section">
							<h4>Detailed Examination</h4>
							<div class="entity-description">
								{selectedEntityData.enhancedDescription}
							</div>
							
							<div class="entity-properties">
								<h5>Properties:</h5>
								<div class="property-grid">
									{#if selectedEntityType === 'marine'}
										<div class="property-item">
											<span class="property-label">Health:</span>
											<span class="property-value">
												{selectedEntityData.health.current}/{selectedEntityData.health.max} 
												({selectedEntityData.health.percentage}%)
											</span>
										</div>
										<div class="property-item">
											<span class="property-label">Speed:</span>
											<span class="property-value">{selectedEntityData.speed.current}</span>
										</div>
										<div class="property-item">
											<span class="property-label">Control:</span>
											<span class="property-value">
												{selectedEntityData.controlType || 'Human'} 
												{selectedEntityData.controlType === 'AI' ? '🤖' : '👤'}
											</span>
										</div>
										{#if selectedEntityData.skills}
											<div class="property-item skills">
												<span class="property-label">Skills:</span>
												<div class="skills-list">
													{#each Object.entries(selectedEntityData.skills) as [skill, level]}
														<span class="skill-tag">{skill}: {level}</span>
													{/each}
												</div>
											</div>
										{/if}
									{:else if selectedEntityType === 'room'}
										<div class="property-item">
											<span class="property-label">Atmosphere:</span>
											<span class="property-value">{selectedEntityData.atmosphere || 'Normal'}</span>
										</div>
										<div class="property-item">
											<span class="property-label">Lighting:</span>
											<span class="property-value">{selectedEntityData.lighting || 'Normal'}</span>
										</div>
										<div class="property-item">
											<span class="property-label">Temperature:</span>
											<span class="property-value">{selectedEntityData.temperature || 'Normal'}</span>
										</div>
										{#if selectedEntityData.doors}
											<div class="property-item doors">
												<span class="property-label">Connections:</span>
												<div class="doors-list">
													{#each selectedEntityData.doors as door}
														<span class="door-tag">→ {door.targetRoomName || door.targetRoomId}</span>
													{/each}
												</div>
											</div>
										{/if}
									{/if}
								</div>
							</div>
						</div>
					{:else if selectedEntityId}
						<div class="no-data">Entity not found</div>
					{:else}
						<div class="no-data">Select an entity to examine</div>
					{/if}
				</div>
			{/if}

			<!-- World Information Tab -->
			{#if activeTab === 'world'}
				<div class="world-tab">
					<h3>🌍 World Information</h3>
					
					<div class="world-section">
						<h4>System Status</h4>
						<div class="world-stats">
							<div class="stat-row">
								<span class="stat-label">World Status:</span>
								<span class="stat-value">{world.metadata?.status || 'Unknown'}</span>
							</div>
							<div class="stat-row">
								<span class="stat-label">Game Time:</span>
								<span class="stat-value">{world.metadata?.gameTime || 0} ticks</span>
							</div>
							<div class="stat-row">
								<span class="stat-label">Total Entities:</span>
								<span class="stat-value">{world.nextEntityId - 1}</span>
							</div>
						</div>
					</div>

					<div class="world-section">
						<h4>Component Summary</h4>
						<div class="component-grid">
							{#each Object.entries(world.components) as [componentName, componentData]}
								<div class="component-card">
									<div class="component-name">{componentName}</div>
									<div class="component-count">{Object.keys(componentData).length} entities</div>
								</div>
							{/each}
						</div>
					</div>

					<div class="world-section">
						<h4>Station Overview</h4>
						<div class="station-overview">
							<div class="overview-item">
								<span class="overview-label">Compartments:</span>
								<span class="overview-value">{rooms.length}</span>
							</div>
							<div class="overview-item">
								<span class="overview-label">Personnel:</span>
								<span class="overview-value">{marines.length}</span>
							</div>
							<div class="overview-item">
								<span class="overview-label">Average Health:</span>
								<span class="overview-value">
									{Math.round(marines.reduce((sum, m) => sum + m.health.percentage, 0) / marines.length)}%
								</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Debug Information Tab -->
			{#if activeTab === 'debug'}
				<div class="debug-tab">
					<h3>🔧 Debug Information</h3>
					
					<div class="debug-section">
						<h4>Raw World State</h4>
						<pre class="debug-display">{JSON.stringify(debugInfo, null, 2)}</pre>
					</div>

					<div class="debug-section">
						<h4>Entity Inspector</h4>
						<div class="debug-entity-selector">
							<label>
								Entity ID:
								<input type="number" bind:value={selectedEntityId} min="1" max={world.nextEntityId - 1} />
							</label>
						</div>
						
						{#if selectedEntityData}
							<pre class="debug-display">{JSON.stringify(selectedEntityData, null, 2)}</pre>
						{:else if selectedEntityId}
							<div class="no-debug-data">No data for entity {selectedEntityId}</div>
						{:else}
							<div class="no-debug-data">Enter entity ID to inspect</div>
						{/if}
					</div>
				</div>
			{/if}

		</div>
	{/if}
</div>

<style>
	.info-view {
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
		color: #00ff41;
		background: #000000;
		border: 1px solid #333333;
		height: 100%;
		overflow: hidden;
	}

	.loading {
		color: #888888;
		text-align: center;
		padding: 2rem;
	}

	/* Enhanced Tab Navigation */
	.tab-nav {
		display: flex;
		border-bottom: 2px solid #333333;
		background: rgba(0, 0, 0, 0.5);
	}

	.tab-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 3px solid transparent;
		color: #888888;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.tab-btn:hover {
		color: #cccccc;
		background: rgba(0, 255, 65, 0.1);
	}

	.tab-btn.active {
		color: #00ff41;
		border-bottom-color: #00ff41;
		background: rgba(0, 255, 65, 0.15);
	}

	/* Tab Content */
	.tab-content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	/* Mission Tab Styles */
	.mission-tab h2 {
		margin: 0 0 1rem 0;
		color: #00ff41;
		font-size: 1.3rem;
		text-align: center;
	}

	.mission-header {
		text-align: center;
		margin-bottom: 1.5rem;
		padding: 1rem;
		border: 2px solid #00ff41;
		border-radius: 4px;
		background: rgba(0, 255, 65, 0.1);
	}

	.mission-status {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 170, 0, 0.1);
		border: 1px solid #ffaa00;
		border-radius: 3px;
		color: #ffaa00;
		font-weight: bold;
		display: inline-block;
	}

	.mission-status.in-progress {
		animation: statusPulse 2s ease-in-out infinite alternate;
	}

	@keyframes statusPulse {
		from { opacity: 0.8; }
		to { opacity: 1; }
	}

	.mission-section {
		margin-bottom: 1.5rem;
		border: 1px solid #444444;
		padding: 1rem;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.3);
	}

	.mission-section h3 {
		margin: 0 0 0.75rem 0;
		color: #00ff41;
		font-size: 1.1rem;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.mission-overview {
		color: #cccccc;
		line-height: 1.5;
		font-size: 0.95rem;
	}

	/* Objectives Styles */
	.objectives-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.objective-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		border: 1px solid #444444;
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.02);
		transition: all 0.2s ease;
	}

	.objective-item.completed {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	.objective-status {
		font-size: 1.2rem;
		min-width: 25px;
		text-align: center;
	}

	.objective-details {
		flex: 1;
	}

	.objective-title {
		color: #cccccc;
		font-weight: bold;
		margin-bottom: 0.25rem;
	}

	.objective-meta {
		color: #888888;
		font-size: 0.8rem;
	}

	/* Critical Info */
	.critical-info {
		margin: 0;
		padding-left: 1.5rem;
		color: #cccccc;
	}

	.critical-info li {
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	/* Mission Stats */
	.mission-stats {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 3px;
	}

	.stat-label {
		color: #888888;
	}

	.stat-value {
		color: #00ff41;
		font-weight: bold;
	}

	/* Entity Tab Styles */
	.entities-tab h3 {
		margin: 0 0 1rem 0;
		color: #00ff41;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.entity-type-selector {
		margin-bottom: 1.5rem;
	}

	.type-buttons {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}

	.type-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 1px solid #444444;
		color: #cccccc;
		font-family: 'Courier New', monospace;
		cursor: pointer;
		border-radius: 3px;
		transition: all 0.2s ease;
	}

	.type-btn:hover {
		border-color: #00ff41;
		color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	.type-btn.active {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.15);
		color: #00ff41;
		box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
	}

	.entity-list-section h4 {
		margin: 0 0 0.75rem 0;
		color: #00ff41;
		font-size: 1rem;
	}

	.entity-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		max-height: 300px;
		overflow-y: auto;
		border: 1px solid #333333;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
	}

	.entity-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: transparent;
		border: 1px solid #444444;
		border-radius: 3px;
		color: #cccccc;
		font-family: 'Courier New', monospace;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.entity-item:hover {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	.entity-item.selected {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.15);
		box-shadow: 0 0 8px rgba(0, 255, 65, 0.2);
	}

	.entity-icon {
		font-size: 1.2rem;
		min-width: 25px;
		text-align: center;
	}

	.entity-info {
		flex: 1;
	}

	.entity-name {
		font-weight: bold;
		color: #00ff41;
		margin-bottom: 0.25rem;
	}

	.entity-details {
		font-size: 0.8rem;
		color: #888888;
	}

	/* Entity Details Section */
	.entity-details-section {
		border: 1px solid #444444;
		padding: 1rem;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.2);
	}

	.entity-details-section h4 {
		margin: 0 0 0.75rem 0;
		color: #00ff41;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.entity-details-section h5 {
		margin: 0.75rem 0 0.5rem 0;
		color: #00ff41;
		font-size: 0.9rem;
	}

	.entity-description {
		color: #cccccc;
		line-height: 1.5;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: rgba(0, 255, 65, 0.05);
		border-left: 3px solid #00ff41;
		border-radius: 3px;
	}

	.property-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.property-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 3px;
	}

	.property-item.skills,
	.property-item.doors {
		flex-direction: column;
		align-items: flex-start;
	}

	.property-label {
		color: #888888;
		font-weight: bold;
		min-width: 80px;
	}

	.property-value {
		color: #cccccc;
		flex: 1;
	}

	.skills-list,
	.doors-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.skill-tag,
	.door-tag {
		padding: 0.25rem 0.5rem;
		background: rgba(0, 255, 65, 0.1);
		border: 1px solid #00ff41;
		border-radius: 3px;
		font-size: 0.8rem;
		color: #00ff41;
	}

	.door-tag {
		background: rgba(255, 170, 0, 0.1);
		border-color: #ffaa00;
		color: #ffaa00;
	}

	/* World Tab Styles */
	.world-tab h3 {
		margin: 0 0 1rem 0;
		color: #00ff41;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.world-section {
		margin-bottom: 1.5rem;
		border: 1px solid #444444;
		padding: 1rem;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.2);
	}

	.world-section h4 {
		margin: 0 0 0.75rem 0;
		color: #00ff41;
		font-size: 1rem;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.world-stats {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 3px;
	}

	.component-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.5rem;
	}

	.component-card {
		padding: 0.75rem;
		border: 1px solid #444444;
		border-radius: 3px;
		background: rgba(0, 255, 65, 0.05);
		text-align: center;
	}

	.component-name {
		color: #00ff41;
		font-weight: bold;
		margin-bottom: 0.25rem;
	}

	.component-count {
		color: #888888;
		font-size: 0.8rem;
	}

	.station-overview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.overview-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 3px;
	}

	.overview-label {
		color: #888888;
	}

	.overview-value {
		color: #00ff41;
		font-weight: bold;
	}

	/* Debug Tab Styles */
	.debug-tab h3 {
		margin: 0 0 1rem 0;
		color: #00ff41;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.debug-section {
		margin-bottom: 1.5rem;
		border: 1px solid #444444;
		padding: 1rem;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.2);
	}

	.debug-section h4 {
		margin: 0 0 0.75rem 0;
		color: #666666;
		font-size: 1rem;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.debug-display {
		background: #000000;
		border: 1px solid #333333;
		padding: 0.75rem;
		color: #cccccc;
		font-size: 0.75rem;
		line-height: 1.4;
		overflow-x: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
		max-height: 300px;
		overflow-y: auto;
		border-radius: 3px;
	}

	.debug-entity-selector {
		margin-bottom: 0.75rem;
	}

	.debug-entity-selector label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #888888;
	}

	.debug-entity-selector input {
		background: #000000;
		border: 1px solid #333333;
		color: #00ff41;
		padding: 0.5rem;
		font-family: 'Courier New', monospace;
		width: 100px;
		border-radius: 3px;
	}

	/* Utility Styles */
	.no-data,
	.no-debug-data,
	.no-mission {
		color: #888888;
		font-style: italic;
		text-align: center;
		padding: 2rem;
		border: 1px dashed #444444;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.2);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.tab-nav {
			flex-wrap: wrap;
		}
		
		.tab-btn {
			flex: 1 1 50%;
		}
		
		.type-buttons {
			flex-direction: column;
		}
		
		.component-grid {
			grid-template-columns: 1fr;
		}
		
		.property-item {
			flex-direction: column;
			align-items: flex-start;
		}
		
		.property-label {
			min-width: auto;
		}
	}

	/* Scrollbar Styling */
	.tab-content::-webkit-scrollbar,
	.entity-list::-webkit-scrollbar,
	.debug-display::-webkit-scrollbar {
		width: 8px;
	}

	.tab-content::-webkit-scrollbar-track,
	.entity-list::-webkit-scrollbar-track,
	.debug-display::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.5);
	}

	.tab-content::-webkit-scrollbar-thumb,
	.entity-list::-webkit-scrollbar-thumb,
	.debug-display::-webkit-scrollbar-thumb {
		background: #333333;
		border-radius: 4px;
	}

	.tab-content::-webkit-scrollbar-thumb:hover,
	.entity-list::-webkit-scrollbar-thumb:hover,
	.debug-display::-webkit-scrollbar-thumb:hover {
		background: #00ff41;
	}
</style>
