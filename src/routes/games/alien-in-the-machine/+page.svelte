<script>
	// Alien in the Machine - Main Game Page
	// Phase 2: Enhanced bottom panel with character status and unified action flow

	import { onMount } from 'svelte';
	import {
		gameStatusStore,
		initializeWorld,
		advanceTime,
		executeCharacterAction,
		turnSystemStore,
		activeCharacterStore,
		worldStore
	} from './lib/stores/worldStore.js';
	import MapView from './lib/components/MapView.svelte';
	import TabbedRightPanel from './lib/components/TabbedRightPanel.svelte';

	let gameTitle = 'Alien in the Machine';

	// Reactive state
	$: gameStatus = $gameStatusStore;
	$: currentPhase = gameStatus.phase || 'Phase 0';
	$: turnSystem = $turnSystemStore;
	$: activeCharacter = $activeCharacterStore;

	// Pending action state (will be moved to store later)
	let pendingAction = null;
	let pendingActionCharacter = null;

	// Phase 1: Initialize world with data on mount
	onMount(async () => {
		console.log('Initializing world with Phase 1 data...');
		await initializeWorld();
	});

	// Handle action selection from TurnControl
	function handleActionSelected(event) {
		const { character, action } = event.detail;
		pendingAction = action;
		pendingActionCharacter = character;
		console.log('Action selected:', { character: character?.name, action: action?.name });
	}

	// Clear pending action
	function clearPendingAction() {
		pendingAction = null;
		pendingActionCharacter = null;
	}

	// Enhanced advance time function
	function handleAdvanceTime() {
		if (pendingAction && pendingActionCharacter) {
			// Execute the pending action
			console.log(
				'Executing pending action:',
				pendingAction.name,
				'for',
				pendingActionCharacter.name
			);
			const result = executeCharacterAction(pendingActionCharacter.entityId, pendingAction.name);

			if (result?.success) {
				clearPendingAction();
			} else {
				console.error('Action failed:', result?.errors);
			}
		} else {
			// No pending action, just advance time
			advanceTime();
		}
	}

	// Format timer display
	function formatTimer(timer) {
		if (timer <= 0) return 'READY';
		return `${timer} ticks`;
	}

	// Get character display color based on status
	function getCharacterColor(character) {
		if (character.isActive) return '#00ff00';
		if (character.isReady) return '#ffff00';
		return '#888888';
	}
</script>

<!-- 
  Future Layout Structure (for AI reference):
  - Terminal-style UI with retro sci-fi aesthetics
  - Left panel: Map view showing rooms and entities
  - Right panel: Info/debug panel and radio log
  - Bottom panel: Command input and game controls
  - All panels will be resizable and toggleable
-->

<div class="game-container">
	<header class="terminal-header">
		<h1 class="terminal-title">
			<span class="terminal-prompt">></span>
			{gameTitle}
		</h1>
		<div class="phase-indicator">{currentPhase}</div>
	</header>

	<main class="game-interface">
		<!-- Phase 0: Complete game interface layout -->
		<div class="interface-panels">
			<div class="left-panel">
				<MapView />
			</div>
      <div class="right-panel">
        <TabbedRightPanel on:actionSelected={handleActionSelected} />
      </div>
			<div class="bottom-panel">
				<div class="game-controls">
					<!-- Character Status Section -->
					<div class="control-section character-status-section">
						<h3>Character Status</h3>
						{#if turnSystem?.characterTimers}
							<div class="character-list">
								{#each Object.entries(turnSystem.characterTimers) as [entityId, character]}
									<div
										class="character-status-item"
										class:active={character.isActive}
										class:ready={character.isReady && !character.isActive}
									>
										<span class="character-indicator" style="color: {getCharacterColor(character)}">
											●
										</span>
										<span class="character-name">{character.name}</span>
										<span class="character-timer">{formatTimer(character.timer)}</span>
										<span class="character-speed">({character.speed} spd)</span>
										{#if character.isActive}
											<span class="active-label">ACTIVE</span>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<div class="no-characters">No characters loaded</div>
						{/if}
					</div>

					<!-- Action Status Section -->
					<div class="control-section action-status-section">
						<h3>Action Status</h3>
						<div class="action-status-display">
							{#if pendingAction && pendingActionCharacter}
								<div class="pending-action">
									<div class="action-info">
										<span class="action-character">{pendingActionCharacter.name}:</span>
										<span class="action-name"
											>{pendingAction.displayName || pendingAction.name}</span
										>
									</div>
									<div class="action-cost">Cost: {pendingAction.cost} ticks</div>
									<button class="clear-action-btn" on:click={clearPendingAction}> Clear </button>
								</div>
							{:else if activeCharacter}
								<div class="no-action">
									<span class="ready-character">{activeCharacter.name} ready</span>
									<span class="instruction">Select action in Turn Control →</span>
								</div>
							{:else}
								<div class="no-active">
									<span class="waiting">All characters on cooldown</span>
									<span class="instruction">Click Advance Time to continue</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Time Control Section -->
					<div class="control-section time-control-section">
						<h3>Time Control</h3>
						<div class="time-control-display">
							{#if turnSystem}
								<div class="game-tick">Tick: {turnSystem.gameTick}</div>
							{/if}
							<button
								class="control-btn advance-btn"
								class:has-pending={pendingAction}
								on:click={handleAdvanceTime}
							>
								{#if pendingAction}
									Execute Action
								{:else if activeCharacter}
									Advance Time
								{:else}
									Advance Time
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	/* Terminal/Retro Sci-Fi Theme - Foundation for all future styling */
	.game-container {
		background: #0a0a0a;
		color: #00ff41;
		font-family: 'Courier New', monospace;
		min-height: 100vh;
		padding: 1rem;
	}

	.terminal-header {
		border: 2px solid #00ff41;
		padding: 1rem;
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(0, 255, 65, 0.1);
	}

	.terminal-title {
		margin: 0;
		font-size: 1.5rem;
		text-shadow: 0 0 10px #00ff41;
	}

	.terminal-prompt {
		color: #ff4444;
	}

	.phase-indicator {
		font-size: 0.9rem;
		opacity: 0.8;
	}

	.game-interface {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Game interface layout */
	.interface-panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr auto;
		gap: 1rem;
		height: calc(100vh - 140px); /* Account for header (~80px) and gaps/padding (~60px) */
	}

	.left-panel {
		grid-row: 1 / 2;
	}

	.right-panel {
		grid-row: 1 / 2;
	}

	.bottom-panel {
		grid-column: 1 / -1;
		border: 2px solid #00ff41;
		background: rgba(0, 255, 65, 0.05);
		padding: 1rem;
		border-radius: 4px;
	}

	.game-controls {
		display: grid;
		grid-template-columns: auto 1fr auto;
		gap: 2rem;
		align-items: start;
	}

	.control-section h3 {
		margin: 0 0 0.5rem 0;
		color: #00ff41;
		font-size: 1rem;
	}

	/* Character Status Section Styles */
	.character-status-section {
		min-width: 200px;
	}

	.character-list {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.character-status-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.5rem;
		border-radius: 3px;
		font-size: 0.85rem;
		transition: background 0.2s;
	}

	.character-status-item.active {
		background: rgba(0, 255, 0, 0.1);
		border: 1px solid rgba(0, 255, 0, 0.3);
	}

	.character-status-item.ready {
		background: rgba(255, 255, 0, 0.05);
		border: 1px solid rgba(255, 255, 0, 0.2);
	}

	.character-indicator {
		font-size: 0.7rem;
	}

	.character-name {
		font-weight: bold;
		min-width: 60px;
	}

	.character-timer {
		min-width: 70px;
		color: #cccccc;
	}

	.character-speed {
		color: #888888;
		font-size: 0.75rem;
	}

	.active-label {
		background: #00ff00;
		color: #001100;
		padding: 0.1rem 0.3rem;
		border-radius: 2px;
		font-size: 0.7rem;
		font-weight: bold;
	}

	.no-characters {
		color: #888888;
		font-style: italic;
		padding: 1rem 0;
	}

	/* Action Status Section Styles */
	.action-status-section {
		flex: 1;
		min-width: 250px;
	}

	.action-status-display {
		min-height: 60px;
		display: flex;
		align-items: center;
	}

	.pending-action {
		background: rgba(0, 255, 170, 0.1);
		border: 1px solid rgba(0, 255, 170, 0.3);
		border-radius: 3px;
		padding: 0.8rem;
		width: 100%;
	}

	.action-info {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.3rem;
	}

	.action-character {
		color: #00ff00;
		font-weight: bold;
	}

	.action-name {
		color: #00ffaa;
	}

	.action-cost {
		color: #888888;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.clear-action-btn {
		background: transparent;
		border: 1px solid #666666;
		color: #888888;
		padding: 0.3rem 0.6rem;
		border-radius: 2px;
		cursor: pointer;
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		transition: all 0.2s;
	}

	.clear-action-btn:hover {
		border-color: #aaaaaa;
		color: #cccccc;
	}

	.no-action,
	.no-active {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.ready-character {
		color: #00ff00;
		font-weight: bold;
	}

	.waiting {
		color: #ffaa00;
	}

	.instruction {
		color: #888888;
		font-size: 0.8rem;
		font-style: italic;
	}

	/* Time Control Section Styles */
	.time-control-section {
		min-width: 140px;
	}

	.time-control-display {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-end;
	}

	.game-tick {
		color: #888888;
		font-size: 0.85rem;
	}

	.control-btn {
		background: rgba(0, 255, 65, 0.1);
		border: 1px solid #00ff41;
		color: #00ff41;
		padding: 0.5rem 1rem;
		border-radius: 3px;
		cursor: pointer;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		font-weight: bold;
		transition: all 0.2s;
		min-width: 120px;
	}

	.control-btn:hover {
		background: rgba(0, 255, 65, 0.2);
		transform: translateY(-1px);
	}

	.control-btn.advance-btn.has-pending {
		background: rgba(0, 255, 170, 0.2);
		border-color: #00ffaa;
		color: #00ffaa;
	}

	.control-btn.advance-btn.has-pending:hover {
		background: rgba(0, 255, 170, 0.3);
		transform: translateY(-2px);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.interface-panels {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
			height: auto; /* Override fixed height for mobile */
			min-height: calc(100vh - 140px); /* Allow expansion but maintain minimum */
		}

		.left-panel {
			grid-row: 1 / 2;
			min-height: 400px;
		}

		.right-panel {
			grid-row: 2 / 3;
		}

		.bottom-panel {
			grid-column: 1 / 2;
			grid-row: 3 / 4;
		}

		.game-controls {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
