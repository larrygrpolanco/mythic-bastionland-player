<script>
	// Alien in the Machine V2 - Main Game Page
	// Foundation-First Architecture with Unified Decision Pipeline

	import { onMount } from 'svelte';
	import { worldStore, gameStatusStore, activeCharacterStore } from './lib/stores/worldStore.js';
	import MapView from './lib/components/MapView.svelte';
	import TabbedRightPanel from './lib/components/TabbedRightPanel.svelte';

	let gameTitle = 'Alien in the Machine V2';

	// Reactive state from stores
	$: world = $worldStore;
	$: gameStatus = $gameStatusStore;
	$: activeCharacter = $activeCharacterStore;

	// Initialize world on mount
	onMount(async () => {
		console.log('[V2] Initializing world with foundation-first architecture...');
		try {
			// Import the world initialization from our new architecture
			const { initializeWorld } = await import('./lib/stores/worldStore.js');
			await initializeWorld();
			console.log('[V2] World initialization complete');
		} catch (error) {
			console.error('[V2] World initialization failed:', error);
		}
	});

	// Format current game state for display
	function formatGameState() {
		if (!world) return 'Initializing...';
		
		const entityCount = world.nextEntityId - 1;
		const componentTypes = Object.keys(world.components).length;
		
		return `Entities: ${entityCount}, Components: ${componentTypes}`;
	}
</script>

<!-- Terminal-style sci-fi game interface -->
<div class="game-container">
	<header class="terminal-header">
		<h1 class="terminal-title">
			<span class="terminal-prompt">></span>
			{gameTitle}
		</h1>
		<div class="status-info">
			<div class="phase-indicator">Phase 0.1 - Foundation</div>
			<div class="world-state">{formatGameState()}</div>
		</div>
	</header>

	<main class="game-interface">
		{#if gameStatus?.status === 'INITIALIZING'}
			<div class="loading-state">
				<div class="loading-message">
					<span class="loading-spinner">◐</span>
					Initializing unified decision pipeline...
				</div>
				<div class="loading-details">
					• Loading ECS foundation
					• Initializing turn management
					• Setting up context assembly
					• Preparing action systems
				</div>
			</div>
		{:else if gameStatus?.status === 'ERROR'}
			<div class="error-state">
				<h3>System Error</h3>
				<p>Failed to initialize game foundation.</p>
				<pre>{gameStatus.error || 'Unknown error'}</pre>
			</div>
		{:else}
			<!-- Main game interface with foundation-first layout -->
			<div class="interface-panels">
				<!-- Left panel: Map visualization -->
				<div class="left-panel">
					<div class="panel-header">
						<h3>Station Map</h3>
						<div class="panel-status">
							{world ? `${world.nextEntityId - 1} entities` : 'Loading...'}
						</div>
					</div>
					<div class="panel-content">
						<MapView />
					</div>
				</div>

				<!-- Right panel: Tabbed interface -->
				<div class="right-panel">
					<TabbedRightPanel />
				</div>

				<!-- Bottom panel: System status and controls -->
				<div class="bottom-panel">
					<div class="system-status">
						<h3>System Status</h3>
						<div class="status-grid">
							<div class="status-item">
								<span class="status-label">Architecture:</span>
								<span class="status-value">Enhanced ECS</span>
							</div>
							<div class="status-item">
								<span class="status-label">Turn System:</span>
								<span class="status-value">Priority Queue</span>
							</div>
							<div class="status-item">
								<span class="status-label">Decision Pipeline:</span>
								<span class="status-value">Unified</span>
							</div>
							<div class="status-item">
								<span class="status-label">Active Character:</span>
								<span class="status-value">
									{activeCharacter ? `${activeCharacter.name} (${activeCharacter.readyAt} ticks)` : 'None'}
								</span>
							</div>
						</div>
					</div>

					<div class="foundation-info">
						<h4>Phase 0.1 Foundation Status</h4>
						<div class="foundation-checklist">
							<div class="check-item completed">✓ ECS Core Architecture</div>
							<div class="check-item completed">✓ Turn Management System</div>
							<div class="check-item completed">✓ Action Pipeline</div>
							<div class="check-item completed">✓ Context Assembly</div>
							<div class="check-item completed">✓ Template System</div>
							<div class="check-item completed">✓ AI Integration Stubs</div>
							<div class="check-item completed">✓ JSON Data Loading</div>
							<div class="check-item {world ? 'completed' : 'pending'}">
								{world ? '✓' : '○'} UI Components
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	/* Terminal/Retro Sci-Fi Theme - Foundation for V2 styling */
	:global(body) {
		background: #0a0a0a !important;
		margin: 0;
		padding: 0;
	}

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

	.status-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.phase-indicator {
		font-size: 0.9rem;
		opacity: 0.8;
		color: #ffaa00;
	}

	.world-state {
		font-size: 0.8rem;
		color: #aaaaaa;
	}

	/* Loading states */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: 1rem;
	}

	.loading-message {
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.loading-spinner {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.loading-details {
		color: #888888;
		text-align: center;
		line-height: 1.6;
	}

	.error-state {
		border: 2px solid #ff4444;
		padding: 2rem;
		background: rgba(255, 68, 68, 0.1);
		border-radius: 4px;
	}

	.error-state h3 {
		color: #ff4444;
		margin-top: 0;
	}

	.error-state pre {
		background: rgba(0, 0, 0, 0.5);
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
	}

	/* Main interface layout */
	.interface-panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr auto;
		gap: 1rem;
		height: calc(100vh - 160px);
	}

	.left-panel, .right-panel {
		border: 2px solid #00ff41;
		background: rgba(0, 255, 65, 0.05);
		border-radius: 4px;
		display: flex;
		flex-direction: column;
	}

	.panel-header {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #00ff41;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(0, 255, 65, 0.1);
	}

	.panel-header h3 {
		margin: 0;
		font-size: 1rem;
	}

	.panel-status {
		font-size: 0.8rem;
		color: #888888;
	}

	.panel-content {
		flex: 1;
		padding: 1rem;
		overflow: auto;
	}

	.bottom-panel {
		grid-column: 1 / -1;
		border: 2px solid #00ff41;
		background: rgba(0, 255, 65, 0.05);
		padding: 1rem;
		border-radius: 4px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.system-status h3, .foundation-info h4 {
		margin: 0 0 0.75rem 0;
		color: #00ff41;
	}

	.status-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.status-item {
		display: flex;
		justify-content: space-between;
		padding: 0.25rem 0;
	}

	.status-label {
		color: #888888;
	}

	.status-value {
		color: #00ff41;
		font-weight: bold;
	}

	.foundation-checklist {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.check-item {
		padding: 0.2rem 0;
		font-size: 0.85rem;
	}

	.check-item.completed {
		color: #00ff41;
	}

	.check-item.pending {
		color: #ffaa00;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.interface-panels {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto;
			height: auto;
		}

		.status-grid {
			grid-template-columns: 1fr;
		}

		.bottom-panel {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
