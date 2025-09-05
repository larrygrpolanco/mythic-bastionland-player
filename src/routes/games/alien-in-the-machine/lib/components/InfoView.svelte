<!--
  InfoView.svelte - Entity Inspection and Debug Panel
  
  This component displays detailed information about selected entities.
  It's the primary debugging tool and entity inspector for all phases.
  
  Phase 0: Basic structure, placeholder data
  Phase 1: Display actual entity components from worldStore
  Phase 2: Show available actions, interactive debugging
  Phase 3: Show AI state, personality, objectives
  Phase 4: Mission status, objective progress
  
  Future AI Development Notes:
  - This component is crucial for debugging AI behavior
  - Should show complete entity state in readable format
  - Consider JSON tree view for complex component data
  - Add component editing capabilities for development
-->

<script>
	import {
		selectedEntityDetailsStore,
		worldSummaryStore,
		gameStatusStore
	} from '../stores/worldStore.js';

	$: selectedEntity = $selectedEntityDetailsStore;
	$: worldSummary = $worldSummaryStore;
	$: gameStatus = $gameStatusStore;

	// Helper functions for component display
	function formatComponentValue(value) {
		if (typeof value === 'object' && value !== null) {
			return JSON.stringify(value, null, 2);
		}
		return String(value);
	}

	function getComponentTypeClass(componentType) {
		// Different colors for different component types
		const typeClasses = {
			position: 'component-position',
			health: 'component-health',
			inventory: 'component-inventory',
			isMarine: 'component-identity',
			personality: 'component-ai',
			objective: 'component-mission'
		};
		return typeClasses[componentType] || 'component-default';
	}
</script>

<div class="info-panel">
	<div class="panel-header">
		<h2>Entity Inspector</h2>
		<div class="panel-status">
			{#if selectedEntity}
				<span class="entity-id">Entity #{selectedEntity.entityId}</span>
			{:else}
				<span class="no-selection">No entity selected</span>
			{/if}
		</div>
	</div>

	<div class="panel-content">
		{#if selectedEntity}
			<!-- Selected Entity Details -->
			<div class="entity-details">
				<h3>Components</h3>
				<div class="components-list">
					{#each Object.entries(selectedEntity.components) as [componentType, componentData]}
						<div class="component-item {getComponentTypeClass(componentType)}">
							<div class="component-header">
								<span class="component-type">{componentType}</span>
								<div class="component-indicator"></div>
							</div>
							<div class="component-data">
								<pre>{formatComponentValue(componentData)}</pre>
							</div>
						</div>
					{/each}
				</div>

				<!-- Available Actions -->
				{#if selectedEntity.availableActions && selectedEntity.availableActions.length > 0}
					<h3>Available Actions</h3>
					<div class="actions-list">
						{#each selectedEntity.availableActions as action}
							<div class="action-item">
								<span class="action-type">{action.type}</span>
								<span class="action-label">{action.label}</span>
								{#if action.requiresTarget}
									<span class="requires-target">*</span>
								{/if}
							</div>
						{/each}
						<div class="action-note">* Requires target selection</div>
					</div>
				{/if}
			</div>
		{:else}
			<!-- No Selection - Show World Summary -->
			<div class="world-summary">
				<h3>Game Status</h3>
				<div class="status-grid">
					<div class="status-item">
						<span class="status-label">Game State:</span>
						<span class="status-value game-state">{gameStatus.gameState}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Current Turn:</span>
						<span class="status-value">{gameStatus.currentTurn}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Phase:</span>
						<span class="status-value">Phase {gameStatus.phase}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Entities:</span>
						<span class="status-value">{gameStatus.activeEntitiesCount}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Action Queue:</span>
						<span class="status-value">{gameStatus.actionQueueLength}</span>
					</div>
				</div>

				<h3>World Summary</h3>
				<div class="world-stats">
					<div class="stat-section">
						<h4>Components</h4>
						<div class="component-counts">
							{#if worldSummary.components}
								{#each Object.entries(worldSummary.components) as [componentType, count]}
									<div class="component-count-item">
										<span class="component-name">{componentType}:</span>
										<span class="component-count">{count}</span>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</div>

				<div class="selection-hint">
					<p>Click on rooms or entities in the map to inspect their details.</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.info-panel {
		background: rgba(0, 255, 65, 0.05);
		border: 2px solid #00ff41;
		border-radius: 4px;
		padding: 1rem;
		height: 100%;
		display: flex;
		flex-direction: column;
		font-family: 'Courier New', monospace;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #00ff41;
	}

	.panel-header h2 {
		margin: 0;
		color: #00ff41;
		font-size: 1.2rem;
	}

	.entity-id {
		color: #44aaff;
		font-weight: bold;
	}

	.no-selection {
		color: #888;
		font-style: italic;
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
	}

	/* Entity details styling */
	.entity-details h3 {
		color: #00ff41;
		margin: 1rem 0 0.5rem 0;
		font-size: 1rem;
	}

	.components-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.component-item {
		border: 1px solid #333;
		border-radius: 3px;
		overflow: hidden;
	}

	.component-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.3rem 0.5rem;
		background: rgba(0, 255, 65, 0.1);
		border-bottom: 1px solid #333;
	}

	.component-type {
		color: #00ff41;
		font-weight: bold;
		font-size: 0.9rem;
	}

	.component-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #00ff41;
	}

	.component-data {
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.5);
	}

	.component-data pre {
		margin: 0;
		color: #ccc;
		font-size: 0.8rem;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	/* Component type specific colors */
	.component-position .component-indicator {
		background: #44aaff;
	}

	.component-health .component-indicator {
		background: #ff4444;
	}

	.component-inventory .component-indicator {
		background: #ffaa44;
	}

	.component-identity .component-indicator {
		background: #aa44ff;
	}

	.component-ai .component-indicator {
		background: #44ff44;
	}

	.component-mission .component-indicator {
		background: #ffff44;
	}

	/* Actions styling */
	.actions-list {
		border: 1px solid #333;
		border-radius: 3px;
		background: rgba(0, 0, 0, 0.3);
	}

	.action-item {
		padding: 0.3rem 0.5rem;
		border-bottom: 1px solid #333;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.action-item:last-child {
		border-bottom: none;
	}

	.action-type {
		color: #44aaff;
		font-weight: bold;
		min-width: 80px;
	}

	.action-label {
		color: #ccc;
		flex: 1;
	}

	.requires-target {
		color: #ffaa44;
		font-weight: bold;
	}

	.action-note {
		padding: 0.3rem 0.5rem;
		color: #888;
		font-size: 0.8rem;
		font-style: italic;
		background: rgba(0, 0, 0, 0.5);
	}

	/* World summary styling */
	.status-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.status-item {
		display: flex;
		justify-content: space-between;
		padding: 0.3rem 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid #333;
		border-radius: 3px;
	}

	.status-label {
		color: #888;
	}

	.status-value {
		color: #00ff41;
		font-weight: bold;
	}

	.game-state {
		text-transform: uppercase;
	}

	.component-counts {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.component-count-item {
		display: flex;
		justify-content: space-between;
		padding: 0.2rem 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}

	.component-name {
		color: #ccc;
	}

	.component-count {
		color: #44aaff;
		font-weight: bold;
	}

	.selection-hint {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px dashed #333;
		border-radius: 3px;
		text-align: center;
		color: #888;
		font-style: italic;
	}

	/* Debug section */
	.debug-section {
		margin-top: 2rem;
		border-top: 1px solid #333;
		padding-top: 1rem;
	}

	.debug-section details {
		color: #888;
	}

	.debug-section summary {
		cursor: pointer;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 3px;
	}

	.debug-section summary:hover {
		background: rgba(0, 255, 65, 0.1);
	}

	.mock-entity-display {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.mock-entity-display h4 {
		margin: 0 0 0.5rem 0;
		color: #44aaff;
	}
</style>
