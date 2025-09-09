<script>
	// TurnControl.svelte - Advanced UI Polish & Action Selection
	// Session 3.2: Enhanced action selection, turn order, and preview system

	import { 
		worldStore, 
		activeCharacterStore, 
		aiCharactersStore,
		humanCharactersStore,
		missionStatusStore,
		executeCharacterAction, 
		getActiveCharacterContext,
		makeCharacterAI,
		makeCharacterHuman,
		processActiveAITurn,
		isActiveAI,
		getCharacterDistribution,
		getTurnQueue
	} from '../stores/worldStore.js';
	import { CHARACTER_TEMPLATES, UI_TEMPLATES, compileUIText } from '../game/context/PromptTemplates.js';

	// Enhanced reactive state with mission and turn queue context
	$: world = $worldStore;
	$: activeCharacter = $activeCharacterStore;
	$: aiCharacters = $aiCharactersStore;
	$: humanCharacters = $humanCharactersStore;
	$: missionStatus = $missionStatusStore;
	$: context = activeCharacter ? getActiveCharacterContext() : null;
	$: characterDistribution = world ? getCharacterDistribution() : { ai: [], human: [], total: 0 };
	$: turnQueue = world ? getTurnQueue() : [];
	
	// Template-compiled UI text based on context
	$: uiText = context ? compileUIText(context) : null;

	// Enhanced UI state management
	let processingAI = false;
	let selectedAction = null;
	let showActionPreview = false;
	let actionCategories = ['movement', 'interaction', 'communication', 'utility'];
	
	// Categorize available actions for better organization
	$: categorizedActions = context?.availableActions?.reduce((categories, action) => {
		let category = 'utility';
		
		if (action.type === 'MOVE') category = 'movement';
		else if (['EXAMINE', 'EXAMINE_THOROUGH', 'SEARCH'].includes(action.type)) category = 'interaction';
		else if (['RADIO_QUICK', 'LISTEN'].includes(action.type)) category = 'communication';
		
		if (!categories[category]) categories[category] = [];
		categories[category].push(action);
		return categories;
	}, {}) || {};

	// Mission-relevant actions get priority highlighting
	$: missionRelevantActions = context?.availableActions?.filter(action => {
		if (!missionStatus?.objectives) return false;
		
		const primaryObjectives = missionStatus.objectives.primary || [];
		const secondaryObjectives = missionStatus.objectives.secondary || [];
		const allObjectives = [...primaryObjectives, ...secondaryObjectives];
		
		return allObjectives.some(obj => {
			if (obj.type === 'REACH_LOCATION' && action.type === 'MOVE') return action.target === obj.parameters?.targetRoomId;
			if (obj.type === 'SEARCH_LOCATION' && action.type === 'SEARCH') return action.target === obj.parameters?.targetRoomId;
			if (obj.type === 'EXAMINE_TARGET' && action.type === 'EXAMINE') return true;
			if (obj.type === 'TEAM_COMMUNICATION' && action.type === 'RADIO_QUICK') return true;
			return false;
		});
	}) || [];

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

	// Switch character between AI/Human control
	function toggleCharacterControl(characterId, currentlyAI) {
		if (currentlyAI) {
			makeCharacterHuman(characterId);
			console.log(`👤 Character ${characterId} is now human-controlled`);
		} else {
			makeCharacterAI(characterId, { 
				personality: { tactical: true, cautious: true },
				switchedFromHuman: true 
			});
			console.log(`🤖 Character ${characterId} is now AI-controlled`);
		}
	}

	// Process AI turn for active character
	async function processAITurn() {
		if (processingAI) return;
		
		processingAI = true;
		console.log('🤖 Processing AI turn...');
		
		try {
			const result = await processActiveAITurn();
			
			if (result.success) {
				console.log(`✅ AI turn completed for ${result.characterName}`);
				
				// Dispatch custom event with AI communication for RadioLog
				if (result.communication?.dialogue || result.action?.reasoning) {
					const aiCommunication = {
						characterId: result.characterId,
						characterName: result.characterName,
						action: result.action,
						dialogue: result.communication?.dialogue,
						reasoning: result.action?.reasoning,
						metadata: result.metadata,
						timestamp: new Date().toLocaleTimeString()
					};
					
					// Dispatch event for RadioLog to capture
					window.dispatchEvent(new CustomEvent('ai-communication', { 
						detail: aiCommunication 
					}));
				}
			} else {
				console.error('❌ AI turn failed:', result.error);
			}
		} catch (error) {
			console.error('❌ AI turn processing error:', error);
		} finally {
			processingAI = false;
		}
	}

	// Auto-process AI turn when AI character becomes active
	$: if (activeCharacter?.isAI && !processingAI) {
		// Small delay to allow UI to update
		setTimeout(() => {
			if (activeCharacter?.isAI && !processingAI) {
				processAITurn();
			}
		}, 100);
	}
</script>

<div class="turn-control">
	{#if !world}
		<div class="loading">Loading...</div>
	{:else}
		<!-- Enhanced Active Character Display -->
		<div class="active-character">
			<h3>⚡ Active Character</h3>
			{#if activeCharacter && uiText}
				<div class="character-card enhanced" class:ai-controlled={activeCharacter.isAI}>
					<div class="char-header">
						<div class="char-name">
							{activeCharacter.name} ({activeCharacter.rank})
							{#if missionRelevantActions.length > 0}
								<span class="mission-indicator" title="Mission-relevant actions available">🎯</span>
							{/if}
						</div>
						<div class="control-indicator">
							{#if activeCharacter.isAI}
								<span class="ai-badge">🤖 AI</span>
							{:else}
								<span class="human-badge">👤 HUMAN</span>
							{/if}
						</div>
					</div>
					<div class="char-status">{uiText.characterStatus}</div>
					{#if uiText.turnStatus}
						<div class="turn-status">{uiText.turnStatus}</div>
					{/if}
					
					<!-- AI Processing Indicator -->
					{#if activeCharacter.isAI && processingAI}
						<div class="ai-thinking">🧠 AI is thinking...</div>
					{/if}
					
					<!-- Enhanced Control Actions -->
					<div class="control-actions">
						<button 
							class="toggle-control-btn"
							on:click={() => toggleCharacterControl(activeCharacter.entityId, activeCharacter.isAI)}
							disabled={processingAI}
						>
							{activeCharacter.isAI ? 'Switch to Human' : 'Switch to AI'}
						</button>
						{#if activeCharacter.isAI && !processingAI}
							<button 
								class="manual-ai-btn"
								on:click={processAITurn}
							>
								Process AI Turn
							</button>
						{/if}
					</div>
				</div>
			{:else if activeCharacter}
				<div class="character-card" class:ai-controlled={activeCharacter.isAI}>
					<div class="char-header">
						<div class="char-name">{activeCharacter.name} ({activeCharacter.rank})</div>
						<div class="control-indicator">
							{#if activeCharacter.isAI}
								<span class="ai-badge">🤖 AI</span>
							{:else}
								<span class="human-badge">👤 HUMAN</span>
							{/if}
						</div>
					</div>
					<div class="char-status">Ready: {activeCharacter.isReady} | Timer: {activeCharacter.timer}</div>
					<div class="control-actions">
						<button 
							class="toggle-control-btn"
							on:click={() => toggleCharacterControl(activeCharacter.entityId, activeCharacter.isAI)}
						>
							{activeCharacter.isAI ? 'Switch to Human' : 'Switch to AI'}
						</button>
					</div>
				</div>
			{:else}
				<div class="no-character">No character ready</div>
			{/if}
		</div>

		<!-- Enhanced Turn Queue Display -->
		<div class="turn-queue-section">
			<h3>⏱️ Turn Queue</h3>
			<div class="turn-queue">
				{#each turnQueue.slice(0, 5) as queueEntry, index}
					<div class="queue-item" 
						 class:active={index === 0}
						 class:next={index === 1}
						 class:ai-character={queueEntry.isAI}
					>
						<div class="queue-position">{index === 0 ? '▶' : index + 1}</div>
						<div class="queue-info">
							<div class="queue-name">
								{queueEntry.name}
								{queueEntry.isAI ? '🤖' : '👤'}
							</div>
							<div class="queue-timing">
								{index === 0 ? 'ACTIVE' : `${queueEntry.readyAt}t`}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Mission Context Display -->
		{#if missionStatus && missionStatus.objectives}
			<div class="mission-context">
				<h3>🎯 Mission Priorities</h3>
				<div class="priority-objectives">
					{#each [...(missionStatus.objectives.primary || []), ...(missionStatus.objectives.secondary || [])].filter(obj => !obj.completed).slice(0, 2) as objective}
						<div class="priority-objective">
							<span class="objective-icon">
								{objective.completed ? '✅' : '⏳'}
							</span>
							<span class="objective-priority">
								{objective.description || objective.title}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Enhanced Actions Section with Categories -->
		<div class="actions-section">
			<h3>🎮 Available Actions</h3>
			{#if context?.availableActions && context.availableActions.length > 0}
				
				<!-- Mission-Relevant Actions Priority -->
				{#if missionRelevantActions.length > 0}
					<div class="action-category priority">
						<h4>🎯 Mission Priority</h4>
						<div class="action-list">
							{#each missionRelevantActions as action}
								<button 
									class="action-btn mission-priority"
									class:selected={selectedAction === action}
									on:click={() => handleActionExecute(action)}
									on:mouseenter={() => { selectedAction = action; showActionPreview = true; }}
									on:mouseleave={() => { selectedAction = null; showActionPreview = false; }}
								>
									<div class="action-content">
										<span class="action-name">{action.name}</span>
										<span class="action-description">{action.description || ''}</span>
									</div>
									<div class="action-meta">
										<span class="action-cost">{action.cost}⏱</span>
										<span class="mission-badge">🎯</span>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Categorized Actions -->
				{#each actionCategories as category}
					{#if categorizedActions[category] && categorizedActions[category].length > 0}
						<div class="action-category {category}">
							<h4>
								{#if category === 'movement'}🚶{:else if category === 'interaction'}🔍{:else if category === 'communication'}📻{:else}⚡{/if}
								{category.charAt(0).toUpperCase() + category.slice(1)}
							</h4>
							<div class="action-list compact">
								{#each categorizedActions[category] as action}
									{#if !missionRelevantActions.includes(action)}
										<button 
											class="action-btn {category}"
											class:selected={selectedAction === action}
											on:click={() => handleActionExecute(action)}
											on:mouseenter={() => { selectedAction = action; showActionPreview = true; }}
											on:mouseleave={() => { selectedAction = null; showActionPreview = false; }}
										>
											<span class="action-name">{action.name}</span>
											<span class="action-cost">{action.cost}⏱</span>
										</button>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				{/each}

				<!-- Action Preview Panel -->
				{#if selectedAction && showActionPreview}
					<div class="action-preview">
						<div class="preview-header">
							<span class="preview-title">Action Preview</span>
							<span class="preview-cost">{selectedAction.cost} ticks</span>
						</div>
						<div class="preview-description">
							{selectedAction.description || selectedAction.name}
						</div>
						{#if selectedAction.target}
							<div class="preview-target">Target: {selectedAction.target}</div>
						{/if}
						{#if missionRelevantActions.includes(selectedAction)}
							<div class="preview-mission">🎯 Mission Relevant</div>
						{/if}
					</div>
				{/if}

			{:else}
				<div class="no-actions">No actions available</div>
			{/if}
		</div>

		<!-- Enhanced Character Overview -->
		<div class="character-overview">
			<h3>👥 Squad Status ({characterDistribution.total} marines)</h3>
			<div class="character-grid enhanced">
				{#each [...humanCharacters, ...aiCharacters] as character}
					<div class="char-mini enhanced" 
						 class:ai-controlled={character.entityId && aiCharacters.find(ai => ai.entityId === character.entityId)}
						 class:active-char={character.entityId === activeCharacter?.entityId}>
						<div class="mini-header">
							<span class="mini-name">{character.name}</span>
							<span class="mini-control">
								{#if aiCharacters.find(ai => ai.entityId === character.entityId)}
									🤖
								{:else}
									👤
								{/if}
							</span>
						</div>
						<div class="mini-status">
							{#if character.isActive}
								<span class="status-active">▶ ACTIVE</span>
							{:else if character.isReady}
								<span class="status-ready">⚡ READY</span>
							{:else}
								<span class="status-waiting">⏱ {character.timer}t</span>
							{/if}
						</div>
						<div class="mini-health">
							<div class="health-bar-mini">
								<div class="health-fill-mini" style="width: {character.health?.percentage || 100}%"></div>
							</div>
							<span class="health-text-mini">{character.health?.percentage || 100}%</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Enhanced Debug Section -->
		<div class="debug-section">
			<h4>Debug Info</h4>
			<div class="debug-info">
				<div>Active: {activeCharacter?.name || 'None'}</div>
				<div>Actions: {context?.availableActions?.length || 0} (Mission: {missionRelevantActions.length})</div>
				<div>Turn Queue: {turnQueue.length} entries</div>
				{#if missionStatus}
					<div>Mission: {missionStatus.status} ({missionStatus.completedObjectives}/{missionStatus.totalObjectives})</div>
				{/if}
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
		font-size: 1rem;
	}

	/* Enhanced Character Card Styles */
	.character-card {
		border: 2px solid #00ff41;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		border-radius: 4px;
		transition: all 0.3s ease;
		position: relative;
	}

	.character-card.enhanced {
		background: rgba(0, 255, 65, 0.1);
		box-shadow: 0 0 8px rgba(0, 255, 65, 0.2);
	}

	.character-card.ai-controlled {
		border-color: #ffaa00;
		background: rgba(255, 170, 0, 0.1);
		box-shadow: 0 0 8px rgba(255, 170, 0, 0.2);
	}

	.char-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.char-name {
		font-weight: bold;
		font-size: 1.1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.mission-indicator {
		color: #ffaa00;
		font-size: 0.9rem;
		animation: glow 2s ease-in-out infinite alternate;
	}

	@keyframes glow {
		from { opacity: 0.7; }
		to { opacity: 1; }
	}

	.char-status {
		font-size: 0.9rem;
		color: #888888;
		margin-bottom: 0.5rem;
	}

	.control-indicator {
		display: flex;
		align-items: center;
	}

	.ai-badge {
		background: #ffaa00;
		color: #000000;
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
		box-shadow: 0 0 5px rgba(255, 170, 0, 0.3);
	}

	.human-badge {
		background: #00ff41;
		color: #000000;
		padding: 0.3rem 0.6rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: bold;
		box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
	}

	.ai-thinking {
		color: #ffaa00;
		font-style: italic;
		animation: pulse 2s infinite;
		margin-bottom: 0.5rem;
		text-align: center;
		background: rgba(255, 170, 0, 0.1);
		padding: 0.5rem;
		border-radius: 3px;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.control-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.toggle-control-btn, .manual-ai-btn {
		background: transparent;
		border: 1px solid #666666;
		color: #cccccc;
		padding: 0.4rem 0.8rem;
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 3px;
	}

	.toggle-control-btn:hover {
		border-color: #00ff41;
		color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
	}

	.manual-ai-btn:hover {
		border-color: #ffaa00;
		color: #ffaa00;
		background: rgba(255, 170, 0, 0.1);
	}

	.toggle-control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Turn Queue Styles */
	.turn-queue-section {
		border: 1px solid #333333;
		padding: 0.75rem;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.3);
	}

	.turn-queue {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.queue-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border: 1px solid #444444;
		border-radius: 3px;
		background: rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
	}

	.queue-item.active {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.15);
		box-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
	}

	.queue-item.next {
		border-color: #ffaa00;
		background: rgba(255, 170, 0, 0.1);
	}

	.queue-item.ai-character {
		border-left: 3px solid #ff8800;
	}

	.queue-position {
		font-weight: bold;
		color: #00ff41;
		min-width: 20px;
		text-align: center;
	}

	.queue-info {
		flex-grow: 1;
	}

	.queue-name {
		font-size: 0.9rem;
		font-weight: bold;
		color: #cccccc;
	}

	.queue-timing {
		font-size: 0.75rem;
		color: #888888;
	}

	/* Mission Context Styles */
	.mission-context {
		border: 1px solid rgba(255, 170, 0, 0.3);
		background: rgba(255, 170, 0, 0.05);
		padding: 0.75rem;
		border-radius: 4px;
	}

	.priority-objectives {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.priority-objective {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem;
		border-radius: 3px;
		background: rgba(255, 170, 0, 0.1);
	}

	.objective-icon {
		font-size: 1rem;
		min-width: 20px;
	}

	.objective-priority {
		font-size: 0.85rem;
		color: #cccccc;
	}

	/* Enhanced Actions Section */
	.actions-section {
		border: 1px solid #333333;
		padding: 0.75rem;
		border-radius: 4px;
	}

	.action-category {
		margin-bottom: 1rem;
	}

	.action-category h4 {
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
		padding-bottom: 0.25rem;
		border-bottom: 1px solid #444444;
	}

	.action-category.priority h4 {
		color: #ffaa00;
		border-bottom-color: rgba(255, 170, 0, 0.3);
	}

	.action-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.action-list.compact .action-btn {
		padding: 0.4rem;
		font-size: 0.85rem;
	}

	/* Enhanced Action Buttons */
	.action-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: transparent;
		border: 1px solid #444444;
		border-radius: 3px;
		color: #cccccc;
		font-family: 'Courier New', monospace;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.action-btn:hover {
		border-color: #00ff41;
		color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
		transform: translateY(-1px);
		box-shadow: 0 2px 5px rgba(0, 255, 65, 0.2);
	}

	.action-btn.selected {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.15);
		box-shadow: 0 0 8px rgba(0, 255, 65, 0.3);
	}

	.action-btn.mission-priority {
		border-color: #ffaa00;
		background: rgba(255, 170, 0, 0.1);
		position: relative;
	}

	.action-btn.mission-priority:hover {
		border-color: #ffaa00;
		color: #ffaa00;
		background: rgba(255, 170, 0, 0.2);
		box-shadow: 0 2px 8px rgba(255, 170, 0, 0.3);
	}

	.action-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex-grow: 1;
	}

	.action-name {
		font-weight: bold;
		font-size: 0.9rem;
	}

	.action-description {
		font-size: 0.75rem;
		color: #888888;
		margin-top: 0.2rem;
	}

	.action-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.action-cost {
		color: #ffaa00;
		font-weight: bold;
		font-size: 0.8rem;
		min-width: 35px;
		text-align: right;
	}

	.mission-badge {
		font-size: 0.8rem;
		color: #ffaa00;
	}

	/* Action Categories Color Coding */
	.action-btn.movement {
		border-left: 3px solid #00ff41;
	}

	.action-btn.interaction {
		border-left: 3px solid #00ffaa;
	}

	.action-btn.communication {
		border-left: 3px solid #ffaa00;
	}

	.action-btn.utility {
		border-left: 3px solid #888888;
	}

	/* Action Preview Panel */
	.action-preview {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.95);
		border: 1px solid #00ff41;
		border-radius: 4px;
		padding: 0.75rem;
		z-index: 10;
		box-shadow: 0 4px 12px rgba(0, 255, 65, 0.2);
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid #333333;
		padding-bottom: 0.25rem;
	}

	.preview-title {
		font-weight: bold;
		color: #00ff41;
		font-size: 0.9rem;
	}

	.preview-cost {
		color: #ffaa00;
		font-size: 0.8rem;
		font-weight: bold;
	}

	.preview-description {
		font-size: 0.85rem;
		color: #cccccc;
		margin-bottom: 0.5rem;
		line-height: 1.3;
	}

	.preview-target {
		font-size: 0.8rem;
		color: #888888;
		margin-bottom: 0.3rem;
	}

	.preview-mission {
		color: #ffaa00;
		font-size: 0.8rem;
		font-weight: bold;
	}

	/* Enhanced Character Overview */
	.character-overview {
		border: 1px solid #333333;
		padding: 0.75rem;
		border-radius: 4px;
	}

	.character-grid.enhanced {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.char-mini.enhanced {
		border: 1px solid #444444;
		padding: 0.5rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.char-mini.enhanced.active-char {
		border-color: #00ff41;
		background: rgba(0, 255, 65, 0.1);
		box-shadow: 0 0 8px rgba(0, 255, 65, 0.2);
	}

	.char-mini.ai-controlled {
		border-color: #ffaa00;
		background: rgba(255, 170, 0, 0.05);
	}

	.mini-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.4rem;
	}

	.mini-name {
		font-size: 0.85rem;
		font-weight: bold;
	}

	.mini-control {
		font-size: 0.8rem;
	}

	.mini-status {
		font-size: 0.75rem;
		margin-bottom: 0.4rem;
	}

	.status-active {
		color: #00ff41;
		font-weight: bold;
	}

	.status-ready {
		color: #ffaa00;
	}

	.status-waiting {
		color: #888888;
	}

	/* Mini Health Bar */
	.mini-health {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.health-bar-mini {
		flex-grow: 1;
		height: 6px;
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid #333333;
		border-radius: 3px;
		overflow: hidden;
	}

	.health-fill-mini {
		height: 100%;
		background: #00ff41;
		transition: width 0.3s ease;
	}

	.health-text-mini {
		font-size: 0.7rem;
		color: #cccccc;
		min-width: 30px;
		text-align: right;
	}

	/* Utility Styles */
	.no-character, .no-actions {
		color: #888888;
		text-align: center;
		padding: 1.5rem;
		font-style: italic;
		border: 1px dashed #444444;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.2);
	}

	/* Enhanced Debug Section */
	.debug-section {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid #333333;
	}

	.debug-section h4 {
		color: #666666;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
	}

	.debug-info {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: #666666;
		background: rgba(0, 0, 0, 0.2);
		padding: 0.5rem;
		border-radius: 3px;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.character-grid.enhanced {
			grid-template-columns: 1fr;
		}
		
		.action-btn {
			padding: 0.6rem;
		}
		
		.turn-queue {
			gap: 0.3rem;
		}
	}
</style>
