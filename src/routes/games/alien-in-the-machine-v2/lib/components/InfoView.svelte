<script>
	// InfoView.svelte - Minimal Debug Info Display
	// Architecture-first approach: Show raw backend data without assumptions

	import { worldStore, getWorldDebugInfo } from '../stores/worldStore.js';

	// Reactive state - purely from backend
	$: world = $worldStore;
	$: debugInfo = world ? getWorldDebugInfo() : null;

	// Simple entity selector
	let selectedEntityId = '';
	
	// Get raw entity data
	function getEntityData(entityId) {
		if (!world || !entityId) return null;
		
		const id = parseInt(entityId);
		const entityData = {};
		
		// Collect all components for this entity
		for (const [componentName, componentStore] of Object.entries(world.components)) {
			if (componentStore[id]) {
				entityData[componentName] = componentStore[id];
			}
		}
		
		return Object.keys(entityData).length > 0 ? entityData : null;
	}

	$: selectedEntityData = getEntityData(selectedEntityId);
</script>

<div class="info-view">
	{#if !world}
		<div class="loading">Loading debug info...</div>
	{:else}
		<!-- World State -->
		<div class="section">
			<h3>World State</h3>
			<pre class="data-display">{JSON.stringify(debugInfo, null, 2)}</pre>
		</div>

		<!-- Entity Inspector -->
		<div class="section">
			<h3>Entity Inspector</h3>
			<div class="entity-selector">
				<label>
					Entity ID:
					<input type="number" bind:value={selectedEntityId} min="1" max={world.nextEntityId - 1} />
				</label>
			</div>
			
			{#if selectedEntityData}
				<pre class="data-display">{JSON.stringify(selectedEntityData, null, 2)}</pre>
			{:else if selectedEntityId}
				<div class="no-data">No data for entity {selectedEntityId}</div>
			{:else}
				<div class="no-data">Enter entity ID to inspect</div>
			{/if}
		</div>

		<!-- Raw Component Data -->
		<div class="section">
			<h3>Component Summary</h3>
			<div class="component-list">
				{#each Object.entries(world.components) as [componentName, componentData]}
					<div class="component-item">
						<strong>{componentName}:</strong> {Object.keys(componentData).length} entities
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.info-view {
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

	.section {
		border: 1px solid #444444;
		padding: 0.75rem;
		background: rgba(0, 255, 65, 0.05);
	}

	.section h3 {
		margin: 0 0 0.5rem 0;
		color: #00ff41;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.25rem;
	}

	.data-display {
		background: #000000;
		border: 1px solid #333333;
		padding: 0.5rem;
		color: #cccccc;
		font-size: 0.75rem;
		line-height: 1.4;
		overflow-x: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
		max-height: 300px;
		overflow-y: auto;
	}

	.entity-selector {
		margin-bottom: 0.5rem;
	}

	.entity-selector label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #888888;
	}

	.entity-selector input {
		background: #000000;
		border: 1px solid #333333;
		color: #00ff41;
		padding: 0.25rem 0.5rem;
		font-family: 'Courier New', monospace;
		width: 80px;
	}

	.no-data {
		color: #888888;
		font-style: italic;
		text-align: center;
		padding: 1rem;
	}

	.component-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.component-item {
		font-size: 0.9rem;
		color: #cccccc;
	}

	.component-item strong {
		color: #00ff41;
	}
</style>
