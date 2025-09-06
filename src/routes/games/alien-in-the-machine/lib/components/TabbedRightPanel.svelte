<!--
TabbedRightPanel.svelte - Tabbed wrapper for Turn Control, InfoView and RadioLog

Simple tabbed interface that combines the turn control interface with
the existing InfoView and RadioLog components.
-->

<script>
	import { createEventDispatcher } from 'svelte';
	import TurnControl from './TurnControl.svelte';
	import InfoView from './InfoView.svelte';
	import RadioLog from './RadioLog.svelte';

	const dispatch = createEventDispatcher();

	// Active tab state - default to Turn Control
	let activeTab = 'turn-control';

	// Handle action selection events from TurnControl and forward to parent
	function handleActionSelected(event) {
		dispatch('actionSelected', event.detail);
	}

	// Handle action cleared events from TurnControl and forward to parent
	function handleActionCleared(event) {
		dispatch('actionCleared', event.detail);
	}

	function setActiveTab(tab) {
		activeTab = tab;
	}
</script>

<div class="tabbed-panel">
	<!-- Tab Headers -->
	<div class="tab-headers">
		<button
			class="tab-header"
			class:active={activeTab === 'turn-control'}
			on:click={() => setActiveTab('turn-control')}
		>
			Turn Control
		</button>
		<button
			class="tab-header"
			class:active={activeTab === 'info'}
			on:click={() => setActiveTab('info')}
		>
			Entity Inspector
		</button>
		<button
			class="tab-header"
			class:active={activeTab === 'radio'}
			on:click={() => setActiveTab('radio')}
		>
			Communication Log
		</button>
	</div>

	<!-- Tab Content -->
	<div class="tab-content">
		{#if activeTab === 'turn-control'}
			<TurnControl 
				on:actionSelected={handleActionSelected}
				on:actionCleared={handleActionCleared}
			/>
		{:else if activeTab === 'info'}
			<InfoView />
		{:else if activeTab === 'radio'}
			<RadioLog />
		{/if}
	</div>
</div>

<style>
	.tabbed-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		border: 2px solid #00ff41;
		border-radius: 4px;
		background: rgba(0, 255, 65, 0.05);
		overflow: hidden;
	}

	.tab-headers {
		display: flex;
		border-bottom: 2px solid #00ff41;
		background: rgba(0, 255, 65, 0.1);
		flex-shrink: 0;
	}

	.tab-header {
		flex: 1;
		padding: 0.8rem 1rem;
		background: transparent;
		border: none;
		color: #888888;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
		border-right: 1px solid #003366;
	}

	.tab-header:last-child {
		border-right: none;
	}

	.tab-header:hover {
		background: rgba(0, 255, 65, 0.1);
		color: #00ff41;
	}

	.tab-header.active {
		background: rgba(0, 255, 65, 0.2);
		color: #00ff41;
		font-weight: bold;
		border-bottom: 2px solid #00ff41;
		margin-bottom: -2px;
	}

	.tab-content {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
</style>
