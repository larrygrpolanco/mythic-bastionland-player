<script>
	// RadioLog.svelte - Minimal Message Log
	// Architecture-first approach: Display actual backend messages when available

	import { worldStore } from '../stores/worldStore.js';

	// Reactive state - purely from backend
	$: world = $worldStore;

	// Simple message log - will be populated by backend systems as they're built
	let messages = [];

	// Function to add message from backend (will be called by action results, AI, etc.)
	export function addMessage(source, text, type = 'info') {
		const message = {
			id: messages.length + 1,
			timestamp: new Date().toLocaleTimeString(),
			source,
			text,
			type
		};
		
		messages = [...messages, message];
		
		// Auto-scroll to bottom
		setTimeout(() => {
			const logContainer = document.querySelector('.message-list');
			if (logContainer) {
				logContainer.scrollTop = logContainer.scrollHeight;
			}
		}, 10);
	}

	// Clear messages
	function clearMessages() {
		messages = [];
	}

	// Add initial welcome message
	if (messages.length === 0) {
		addMessage('SYSTEM', 'Communication system initialized', 'system');
	}
</script>

<div class="radio-log">
	{#if !world}
		<div class="loading">Loading communications...</div>
	{:else}
		<div class="log-header">
			<h3>Communications</h3>
			<div class="log-controls">
				<span class="message-count">{messages.length} messages</span>
				<button class="clear-btn" on:click={clearMessages}>Clear</button>
			</div>
		</div>

		<div class="message-list">
			{#if messages.length === 0}
				<div class="empty-log">No messages</div>
			{:else}
				{#each messages as message}
					<div class="message-item" class:system={message.type === 'system'}>
						<div class="message-header">
							<span class="message-source">{message.source}</span>
							<span class="message-time">{message.timestamp}</span>
						</div>
						<div class="message-text">{message.text}</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Debug section -->
		<div class="debug-section">
			<h4>Debug</h4>
			<div class="debug-info">
				<div>Messages: {messages.length}</div>
				<div>Backend integration: Ready</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.radio-log {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		font-family: 'Courier New', monospace;
		color: #00ff41;
		background: #000000;
		border: 1px solid #333333;
		height: 100%;
	}

	.loading {
		color: #888888;
		text-align: center;
		padding: 2rem;
	}

	.log-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
	}

	.log-header h3 {
		margin: 0;
		color: #00ff41;
	}

	.log-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.message-count {
		color: #888888;
	}

	.clear-btn {
		background: transparent;
		border: 1px solid #444444;
		color: #888888;
		padding: 0.25rem 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.clear-btn:hover {
		border-color: #ff4444;
		color: #ff4444;
	}

	.message-list {
		flex: 1;
		overflow-y: auto;
		border: 1px solid #333333;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.empty-log {
		color: #888888;
		text-align: center;
		font-style: italic;
		padding: 2rem;
	}

	.message-item {
		border: 1px solid #444444;
		padding: 0.5rem;
		background: rgba(0, 255, 65, 0.05);
	}

	.message-item.system {
		border-color: #666666;
		background: rgba(100, 100, 100, 0.1);
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.25rem;
		font-size: 0.8rem;
	}

	.message-source {
		color: #00ff41;
		font-weight: bold;
	}

	.message-item.system .message-source {
		color: #888888;
	}

	.message-time {
		color: #666666;
	}

	.message-text {
		color: #cccccc;
		font-size: 0.9rem;
		line-height: 1.4;
	}

	.debug-section {
		border-top: 1px solid #333333;
		padding-top: 0.5rem;
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
