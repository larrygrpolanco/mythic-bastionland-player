<script>
	// TurnControl.svelte - Minimal Turn Control Interface
	// Architecture-first approach: UI follows backend reality

	import { worldStore, activeCharacterStore, executeCharacterAction, getActiveCharacterContext } from '../stores/worldStore.js';

	// Reactive state - purely from backend
	$: world = $worldStore;
	$: activeCharacter = $activeCharacterStore;
	$: context = activeCharacter ? getActiveCharacterContext() : null;

	// Execute action through backend pipeline
	function handleActionExecute(action) {
		if (!activeCharacter) {
			console.warn('No active character');
			return;
		}

		console.log('🎮 Executing action:', action);
		const result = executeCharacterAction(activeCharacter.entityId, {
			type: action.type,
			target: action.target,
			parameters: action.parameters || {}
		});

		if (result.success) {
			console.log('✅ Action successful:', result.actionResult?.message);
		} else {
			console.error('❌ Action failed:', result.errors);
		}
	}
</script>

<div class="turn-control">
	{#if !world}
		<div class="loading">Loading...</div>
	{:else}
		<!-- Active Character Display -->
		<div class="active-character">
			<h3>Active Character</h3>
			{#if activeCharacter}
				<div class="character-card">
					<div class="char-name">{activeCharacter.name} ({activeCharacter.rank})</div>
					<div class="char-status">Ready: {activeCharacter.isReady} | Timer: {activeCharacter.timer}</div>
				</div>
			{:else}
				<div class="no-character">No character ready</div>
			{/if}
		</div>

		<!-- Available Actions - Direct from Backend -->
		<div class="actions-section">
			<h3>Available Actions</h3>
			{#if context?.availableActions && context.availableActions.length > 0}
				<div class="action-list">
					{#each context.availableActions as action}
						<button 
							class="action-btn"
							on:click={() => handleActionExecute(action)}
						>
							<span class="action-name">{action.name}</span>
							<span class="action-cost">{action.cost}t</span>
						</button>
					{/each}
				</div>
			{:else}
				<div class="no-actions">No actions available</div>
			{/if}
		</div>

		<!-- Debug Info -->
		<div class="debug-section">
			<h4>Debug</h4>
			<div class="debug-info">
				<div>Active: {activeCharacter?.name || 'None'}</div>
				<div>Actions: {context?.availableActions?.length || 0}</div>
				<div>World Status: {world?.metadata?.status || 'Unknown'}</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.turn-control {
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

	h3, h4 {
		margin: 0 0 0.5rem 0;
		color: #00ff41;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.25rem;
	}

	.character-card {
		border: 1px solid #00ff41;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.char-name {
		font-weight: bold;
	}

	.char-status {
		font-size: 0.9rem;
		color: #888888;
	}

	.no-character, .no-actions {
		color: #888888;
		text-align: center;
		padding: 1rem;
		font-style: italic;
	}

	.action-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.action-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: transparent;
		border: 1px solid #444444;
		color: #cccccc;
		font-family: 'Courier New', monospace;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.action-btn:hover {
		border-color: #00ff41;
		color: #00ff41;
	}

	.action-name {
		flex: 1;
		text-align: left;
	}

	.action-cost {
		color: #ffaa00;
		font-weight: bold;
		font-size: 0.8rem;
	}

	.debug-section {
		margin-top: auto;
		padding-top: 0.5rem;
		border-top: 1px solid #333333;
	}

	.debug-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		color: #666666;
	}
</style>
