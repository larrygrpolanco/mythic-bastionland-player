<script>
	// RadioLog.svelte - Enhanced AI Communication & Event Log
	// Session 3.2: Improved AI communication display and conversation threading

	import { worldStore, marinesStore, activeCharacterStore } from '../stores/worldStore.js';
	import { onMount, onDestroy } from 'svelte';

	// Enhanced reactive state with character context
	$: world = $worldStore;
	$: marines = $marinesStore;
	$: activeCharacter = $activeCharacterStore;

	// Enhanced message log with conversation threading
	let messages = [];
	let messageIdCounter = 1;
	let searchTerm = '';
	let autoScroll = true;

	// Enhanced message types
	const MESSAGE_TYPES = {
		SYSTEM: 'system',
		AI_DIALOGUE: 'ai-dialogue',  
		AI_ACTION: 'ai-action',
		AI_REASONING: 'ai-reasoning',
		HUMAN_ACTION: 'human-action',
		MISSION_UPDATE: 'mission-update',
		ERROR: 'error',
		DEBUG: 'debug'
	};

	// Enhanced function to add message with better categorization
	export function addMessage(source, text, type = 'info', metadata = {}) {
		const message = {
			id: messageIdCounter++,
			timestamp: new Date().toLocaleTimeString(),
			fullTimestamp: new Date().toISOString(),
			source,
			text,
			type,
			metadata: {
				...metadata,
				characterId: metadata.characterId,
				isAI: metadata.isAI || false,
				priority: metadata.priority || 'normal',
				category: categorizeMessage(type, text, metadata)
			}
		};
		
		messages = [...messages, message];
		if (autoScroll) autoScrollToBottom();
	}

	// Categorize messages for better organization
	function categorizeMessage(type, text, metadata) {
		if (type.includes('ai')) {
			if (text.toLowerCase().includes('thinking') || text.toLowerCase().includes('consider')) {
				return 'reasoning';
			} else if (type === 'ai-dialogue') {
				return 'communication';
			} else {
				return 'action';
			}
		}
		if (type === 'system') return 'system';
		if (type === 'human-action') return 'action';
		if (type.includes('mission')) return 'mission';
		return 'general';
	}

	// Handle AI communication events from TurnControl
	function handleAICommunication(event) {
		const data = event.detail;
		
		// Add AI dialogue message if present
		if (data.dialogue) {
			addMessage(
				data.characterName, 
				data.dialogue, 
				'ai-dialogue',
				{
					characterId: data.characterId,
					action: data.action,
					isAI: true,
					...data.metadata
				}
			);
		}
		
		// Add AI reasoning/action message
		if (data.action) {
			const actionDesc = `${data.action.type}${data.action.target ? ` → ${data.action.target}` : ''}`;
			const reasoningText = data.reasoning ? ` (${data.reasoning})` : '';
			
			addMessage(
				`${data.characterName} AI`,
				`Action: ${actionDesc}${reasoningText}`,
				'ai-action',
				{
					characterId: data.characterId,
					action: data.action,
					isAI: true,
					...data.metadata
				}
			);
		}
	}

	// Handle human action communications (we can add this later)
	function handleHumanAction(characterName, actionName, result) {
		addMessage(
			characterName,
			`Executed: ${actionName}`,
			'human-action',
			{ isHuman: true }
		);
	}

	// Auto-scroll to bottom
	function autoScrollToBottom() {
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
		messageIdCounter = 1;
	}

	// Filter messages by type
	let activeFilter = 'all';
	$: filteredMessages = messages.filter(msg => {
		if (activeFilter === 'all') return true;
		if (activeFilter === 'ai') return msg.type.startsWith('ai-');
		if (activeFilter === 'human') return msg.type === 'human-action';
		if (activeFilter === 'system') return msg.type === 'system';
		return true;
	});

	// Export current messages for debugging
	export function exportMessages() {
		const exportData = {
			timestamp: new Date().toISOString(),
			totalMessages: messages.length,
			messages: messages
		};
		
		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `ai-communications-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Setup event listeners
	onMount(() => {
		// Listen for AI communication events
		window.addEventListener('ai-communication', handleAICommunication);
		
		// Add initial welcome message
		if (messages.length === 0) {
			addMessage('SYSTEM', 'Communication system initialized - AI dialogue integration active', 'system');
		}
	});

	onDestroy(() => {
		window.removeEventListener('ai-communication', handleAICommunication);
	});
</script>

<div class="radio-log">
	{#if !world}
		<div class="loading">Loading communications...</div>
	{:else}
		<!-- Enhanced Header with Search -->
		<div class="log-header">
			<div class="header-left">
				<h3>📻 Communications</h3>
				<div class="active-character-info">
					{#if activeCharacter}
						<span class="current-speaker">
							Active: {activeCharacter.name} 
							{activeCharacter.isAI ? '🤖' : '👤'}
						</span>
					{/if}
				</div>
			</div>
			<div class="log-controls">
				<span class="message-count">{filteredMessages.length}/{messages.length} messages</span>
				<button class="auto-scroll-btn" class:active={autoScroll} on:click={() => autoScroll = !autoScroll}>
					{autoScroll ? '🔒' : '🔓'} Scroll
				</button>
				<button class="export-btn" on:click={exportMessages}>💾 Export</button>
				<button class="clear-btn" on:click={clearMessages}>🗑️ Clear</button>
			</div>
		</div>

		<!-- Enhanced Search and Filter Controls -->
		<div class="search-controls">
			<div class="search-input-container">
				<input 
					type="text" 
					class="search-input"
					placeholder="Search messages..."
					bind:value={searchTerm}
				>
				<span class="search-icon">🔍</span>
			</div>
		</div>

		<div class="filter-controls">
			<div class="filter-categories">
				<button 
					class="filter-btn primary" 
					class:active={activeFilter === 'all'}
					on:click={() => activeFilter = 'all'}
				>
					📋 All ({messages.length})
				</button>
				<button 
					class="filter-btn ai" 
					class:active={activeFilter === 'ai'}
					on:click={() => activeFilter = 'ai'}
				>
					🤖 AI ({messages.filter(m => m.type.startsWith('ai-')).length})
				</button>
				<button 
					class="filter-btn human" 
					class:active={activeFilter === 'human'}
					on:click={() => activeFilter = 'human'}
				>
					👤 Human ({messages.filter(m => m.type === 'human-action').length})
				</button>
				<button 
					class="filter-btn system" 
					class:active={activeFilter === 'system'}
					on:click={() => activeFilter = 'system'}
				>
					⚙️ System ({messages.filter(m => m.type === 'system').length})
				</button>
			</div>
		</div>

		<!-- Enhanced Message List with Character Threading -->
		<div class="message-list">
			{#if filteredMessages.length === 0}
				<div class="empty-log">
					<div class="empty-icon">📭</div>
					<div class="empty-text">
						{#if messages.length === 0}
							No communications yet
						{:else if searchTerm}
							No messages match "{searchTerm}"
						{:else}
							No messages match current filter
						{/if}
					</div>
				</div>
			{:else}
				{#each filteredMessages as message, index}
					{@const isNewCharacter = index === 0 || filteredMessages[index - 1].source !== message.source}
					{@const characterData = marines.find(m => m.entityId === message.metadata?.characterId)}
					
					<div 
						class="message-item enhanced" 
						class:system={message.type === 'system'}
						class:ai-dialogue={message.type === 'ai-dialogue'}
						class:ai-action={message.type === 'ai-action'}
						class:ai-reasoning={message.metadata?.category === 'reasoning'}
						class:human-action={message.type === 'human-action'}
						class:mission-update={message.type === 'mission-update'}
						class:high-priority={message.metadata?.priority === 'high'}
						class:new-character={isNewCharacter}
					>
						<!-- Character Avatar and Source -->
						<div class="message-header enhanced">
							<div class="source-info">
								<div class="character-avatar">
									{#if message.metadata?.isAI}
										🤖
									{:else if message.metadata?.isHuman}
										👤
									{:else if message.type === 'system'}
										⚙️
									{:else}
										📡
									{/if}
								</div>
								<div class="source-details">
									<div class="message-source-name">
										{message.source}
										{#if characterData}
											<span class="character-rank">({characterData.rank})</span>
										{/if}
									</div>
									<div class="message-category">
										{message.metadata?.category || 'general'}
									</div>
								</div>
								{#if message.metadata?.priority === 'high'}
									<div class="priority-indicator">❗</div>
								{/if}
							</div>
							<div class="timestamp-info">
								<span class="message-time">{message.timestamp}</span>
								<span class="message-id">#{message.id}</span>
							</div>
						</div>

						<!-- Message Content with Enhanced Formatting -->
						<div class="message-content">
							<div class="message-text enhanced">{message.text}</div>
							
							<!-- Action Context -->
							{#if message.metadata?.action}
								<div class="action-context">
									<span class="action-type">{message.metadata.action.type}</span>
									{#if message.metadata.action.target}
										<span class="action-target">→ {message.metadata.action.target}</span>
									{/if}
									{#if message.metadata.action.cost}
										<span class="action-cost">({message.metadata.action.cost}⏱)</span>
									{/if}
								</div>
							{/if}

							<!-- Character Location -->
							{#if characterData}
								<div class="character-context">
									<span class="location-info">📍 {characterData.location}</span>
									<span class="health-info">❤️ {characterData.health.percentage}%</span>
								</div>
							{/if}
						</div>
						
						<!-- Enhanced AI Metadata -->
						{#if message.metadata?.provider}
							<div class="message-metadata enhanced">
								<div class="metadata-row">
									<span class="metadata-label">Provider:</span>
									<span class="metadata-value">{message.metadata.provider}</span>
								</div>
								{#if message.metadata.tokensUsed}
									<div class="metadata-row">
										<span class="metadata-label">Tokens:</span>
										<span class="metadata-value">{message.metadata.tokensUsed}</span>
									</div>
								{/if}
								{#if message.metadata.responseTime}
									<div class="metadata-row">
										<span class="metadata-label">Response:</span>
										<span class="metadata-value">{message.metadata.responseTime}ms</span>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<!-- Enhanced Stats Section -->
		<div class="stats-section">
			<div class="communication-stats">
				<div class="stat-item">
					<span class="stat-icon">💬</span>
					<span class="stat-value">{messages.filter(m => m.type === 'ai-dialogue').length}</span>
					<span class="stat-label">AI Messages</span>
				</div>
				<div class="stat-item">
					<span class="stat-icon">⚡</span>
					<span class="stat-value">{messages.filter(m => m.type.includes('action')).length}</span>
					<span class="stat-label">Actions</span>
				</div>
				<div class="stat-item">
					<span class="stat-icon">👥</span>
					<span class="stat-value">{new Set(messages.filter(m => m.metadata?.characterId).map(m => m.metadata.characterId)).size}</span>
					<span class="stat-label">Characters</span>
				</div>
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

	/* Enhanced Header Styling */
	.log-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.5rem;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.log-header h3 {
		margin: 0;
		color: #00ff41;
		font-size: 1.1rem;
	}

	.active-character-info {
		font-size: 0.8rem;
		color: #888888;
	}

	.current-speaker {
		color: #00ff41;
		font-weight: bold;
	}

	.log-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		flex-wrap: wrap;
	}

	.message-count {
		color: #888888;
		white-space: nowrap;
	}

	.auto-scroll-btn, .export-btn, .clear-btn {
		background: transparent;
		border: 1px solid #444444;
		color: #888888;
		padding: 0.25rem 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.auto-scroll-btn:hover, .export-btn:hover {
		border-color: #00ff41;
		color: #00ff41;
	}

	.auto-scroll-btn.active {
		border-color: #00ff41;
		color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	.clear-btn:hover {
		border-color: #ff4444;
		color: #ff4444;
	}

	/* Enhanced Search Controls */
	.search-controls {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.search-input-container {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		background: rgba(0, 0, 0, 0.6);
		border: 1px solid #444444;
		color: #00ff41;
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		outline: none;
		transition: border-color 0.2s;
	}

	.search-input:focus {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.05);
	}

	.search-input::placeholder {
		color: #666666;
	}

	.search-icon {
		position: absolute;
		right: 0.75rem;
		color: #666666;
		pointer-events: none;
	}

	/* Enhanced Filter Controls */
	.filter-controls {
		margin-bottom: 0.5rem;
	}

	.filter-categories {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
		border: 1px solid #333333;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
	}

	.filter-btn {
		background: transparent;
		border: 1px solid #444444;
		color: #888888;
		padding: 0.3rem 0.5rem;
		font-family: 'Courier New', monospace;
		font-size: 0.7rem;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.filter-btn:hover {
		border-color: #666666;
		color: #cccccc;
	}

	.filter-btn.active {
		border-color: #00ff41;
		color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	/* Enhanced Message List */
	.message-list {
		flex: 1;
		overflow-y: auto;
		border: 1px solid #333333;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: #444444 #222222;
	}

	.message-list::-webkit-scrollbar {
		width: 6px;
	}

	.message-list::-webkit-scrollbar-track {
		background: #222222;
	}

	.message-list::-webkit-scrollbar-thumb {
		background: #444444;
		border-radius: 3px;
	}

	.message-list::-webkit-scrollbar-thumb:hover {
		background: #666666;
	}

	.empty-log {
		color: #888888;
		text-align: center;
		font-style: italic;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.empty-icon {
		font-size: 2rem;
		opacity: 0.5;
	}

	.empty-text {
		font-size: 0.9rem;
	}

	/* Enhanced Message Items */
	.message-item {
		border: 1px solid #444444;
		padding: 0.75rem;
		background: rgba(0, 255, 65, 0.05);
		transition: all 0.2s;
		position: relative;
	}

	.message-item.enhanced {
		border-radius: 3px;
	}

	.message-item.new-character {
		margin-top: 0.5rem;
		border-top: 2px solid #666666;
	}

	.message-item.high-priority {
		border-left: 3px solid #ff4444;
		animation: pulse-priority 2s infinite;
	}

	@keyframes pulse-priority {
		0%, 100% { border-left-color: #ff4444; }
		50% { border-left-color: #ff8888; }
	}

	.message-item.system {
		border-color: #666666;
		background: rgba(100, 100, 100, 0.1);
	}

	.message-item.ai-dialogue {
		border-color: #ffaa00;
		background: rgba(255, 170, 0, 0.1);
	}

	.message-item.ai-action {
		border-color: #ff6600;
		background: rgba(255, 102, 0, 0.05);
	}

	.message-item.ai-reasoning {
		border-color: #aa66ff;
		background: rgba(170, 102, 255, 0.05);
	}

	.message-item.human-action {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	.message-item.mission-update {
		border-color: #00ccff;
		background: rgba(0, 204, 255, 0.1);
	}

	/* Enhanced Message Header */
	.message-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.message-header.enhanced {
		flex-wrap: wrap;
	}

	.source-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
	}

	.character-avatar {
		font-size: 1.2rem;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		flex-shrink: 0;
	}

	.source-details {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		flex: 1;
	}

	.message-source-name {
		color: #00ff41;
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.character-rank {
		color: #888888;
		font-weight: normal;
		font-size: 0.85em;
	}

	.message-category {
		color: #666666;
		font-size: 0.75em;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.priority-indicator {
		color: #ff4444;
		font-size: 1rem;
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.timestamp-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.1rem;
		font-size: 0.7rem;
		flex-shrink: 0;
	}

	.message-time {
		color: #666666;
	}

	.message-id {
		color: #444444;
		font-size: 0.6rem;
	}

	/* Message Type Specific Colors */
	.message-item.system .message-source-name {
		color: #888888;
	}

	.message-item.ai-dialogue .message-source-name {
		color: #ffaa00;
	}

	.message-item.ai-action .message-source-name {
		color: #ff6600;
	}

	.message-item.ai-reasoning .message-source-name {
		color: #aa66ff;
	}

	.message-item.human-action .message-source-name {
		color: #00ff41;
	}

	.message-item.mission-update .message-source-name {
		color: #00ccff;
	}

	/* Enhanced Message Content */
	.message-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.message-text {
		color: #cccccc;
		font-size: 0.9rem;
		line-height: 1.4;
		word-wrap: break-word;
	}

	.message-text.enhanced {
		padding: 0.25rem 0;
	}

	.message-item.ai-dialogue .message-text {
		color: #ffddaa;
		font-style: italic;
	}

	.message-item.ai-action .message-text {
		color: #ffbb88;
	}

	.message-item.ai-reasoning .message-text {
		color: #ccaaff;
		font-style: italic;
	}

	.message-item.human-action .message-text {
		color: #aaffaa;
	}

	.message-item.mission-update .message-text {
		color: #aaeeff;
		font-weight: bold;
	}

	/* Action Context */
	.action-context {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		border-left: 2px solid #444444;
		font-size: 0.8rem;
	}

	.action-type {
		color: #00ff41;
		font-weight: bold;
		text-transform: uppercase;
		font-size: 0.7rem;
		letter-spacing: 0.5px;
	}

	.action-target {
		color: #ffaa00;
		font-style: italic;
	}

	.action-cost {
		color: #888888;
		font-size: 0.75em;
	}

	/* Character Context */
	.character-context {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
		font-size: 0.8rem;
	}

	.location-info {
		color: #00ccff;
	}

	.health-info {
		color: #ff6666;
	}

	/* Enhanced Message Metadata */
	.message-metadata {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid #333333;
		font-size: 0.7rem;
	}

	.message-metadata.enhanced {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.metadata-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: space-between;
	}

	.metadata-label {
		color: #666666;
		font-weight: bold;
		min-width: 0;
		flex-shrink: 0;
	}

	.metadata-value {
		color: #888888;
		font-family: 'Courier New', monospace;
		text-align: right;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Enhanced Stats Section */
	.stats-section {
		border-top: 1px solid #333333;
		padding-top: 0.5rem;
		margin-top: auto;
		flex-shrink: 0;
	}

	.communication-stats {
		display: flex;
		justify-content: space-around;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid #333333;
		border-radius: 3px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
		min-width: 0;
	}

	.stat-icon {
		font-size: 1.2rem;
		opacity: 0.8;
	}

	.stat-value {
		color: #00ff41;
		font-weight: bold;
		font-size: 1.1rem;
		line-height: 1;
	}

	.stat-label {
		color: #888888;
		font-size: 0.7rem;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.log-header {
			flex-direction: column;
			align-items: stretch;
			gap: 0.5rem;
		}

		.log-controls {
			justify-content: space-between;
		}

		.search-controls {
			flex-direction: column;
		}

		.filter-categories {
			justify-content: center;
		}

		.communication-stats {
			flex-wrap: wrap;
		}

		.stat-item {
			min-width: 80px;
		}

		.message-header.enhanced {
			flex-direction: column;
			align-items: stretch;
		}

		.timestamp-info {
			align-items: flex-start;
		}

		.metadata-row {
			flex-direction: column;
			align-items: stretch;
			gap: 0.1rem;
		}

		.metadata-value {
			text-align: left;
		}
	}
</style>
