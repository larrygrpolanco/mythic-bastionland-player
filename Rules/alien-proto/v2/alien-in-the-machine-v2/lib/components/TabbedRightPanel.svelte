<script>
	// TabbedRightPanel.svelte - Tabbed interface for V2
	// Foundation-first approach with working stubs

	import TurnControl from './TurnControl.svelte';
	import InfoView from './InfoView.svelte';
	import RadioLog from './RadioLog.svelte';

	// Tab state management
	let activeTab = 'turn-control';

	// Tab definitions for Phase 0.1
	const tabs = [
		{
			id: 'turn-control',
			label: 'Turn Control',
			icon: '⚡',
			description: 'Character actions and turn management'
		},
		{
			id: 'info-view',
			label: 'Inspector',
			icon: '🔍',
			description: 'Entity and world state inspection'
		},
		{
			id: 'radio-log',
			label: 'Radio Log',
			icon: '📻',
			description: 'Communication and AI dialogue log'
		}
	];

	// Handle tab switching
	function switchTab(tabId) {
		activeTab = tabId;
		console.log('[TabbedRightPanel] Switched to tab:', tabId);
	}
</script>

<div class="tabbed-panel">
	<!-- Tab header -->
	<div class="tab-header">
		{#each tabs as tab}
			<button
				class="tab-button"
				class:active={activeTab === tab.id}
				on:click={() => switchTab(tab.id)}
				title={tab.description}
			>
				<span class="tab-icon">{tab.icon}</span>
				<span class="tab-label">{tab.label}</span>
			</button>
		{/each}
	</div>

	<!-- Tab content -->
	<div class="tab-content">
		{#if activeTab === 'turn-control'}
			<div class="tab-pane">
				<TurnControl />
			</div>
		{:else if activeTab === 'info-view'}
			<div class="tab-pane">
				<InfoView />
			</div>
		{:else if activeTab === 'radio-log'}
			<div class="tab-pane">
				<RadioLog />
			</div>
		{:else}
			<div class="tab-pane error">
				<div class="error-message">Unknown tab: {activeTab}</div>
			</div>
		{/if}
	</div>

	<!-- Phase 0.1 foundation indicator -->
	<div class="foundation-indicator">
		<div class="indicator-text">V2 Foundation</div>
		<div class="indicator-status">Phase 0.1</div>
	</div>
</div>

<style>
	.tabbed-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		position: relative;
	}

	.tab-header {
		display: flex;
		border-bottom: 2px solid #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	.tab-button {
		flex: 1;
		background: transparent;
		border: none;
		color: #888888;
		padding: 0.75rem 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		transition: all 0.2s ease;
		border-right: 1px solid #333333;
	}

	.tab-button:last-child {
		border-right: none;
	}

	.tab-button:hover {
		background: rgba(0, 255, 65, 0.1);
		color: #cccccc;
	}

	.tab-button.active {
		background: rgba(0, 255, 65, 0.2);
		color: #00ff41;
		border-bottom: 2px solid #00ff41;
		margin-bottom: -2px;
	}

	.tab-icon {
		font-size: 1rem;
	}

	.tab-label {
		font-weight: bold;
	}

	.tab-content {
		flex: 1;
		overflow: hidden;
		background: rgba(0, 255, 65, 0.02);
	}

	.tab-pane {
		height: 100%;
		padding: 1rem;
		overflow-y: auto;
	}

	.tab-pane.error {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.error-message {
		color: #ff4444;
		font-style: italic;
		text-align: center;
	}

	.foundation-indicator {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		font-size: 0.7rem;
		color: #666666;
		text-align: right;
		pointer-events: none;
	}

	.indicator-text {
		color: #ffaa00;
	}

	.indicator-status {
		color: #888888;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.tab-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.8rem;
		}
		
		.tab-label {
			display: none;
		}
		
		.tab-icon {
			font-size: 1.2rem;
		}
	}
</style>
