<script>
	/**
	 * MAIN GAME PAGE - REFACTORED FOR CLEAN ARCHITECTURE
	 * 
	 * This component ONLY handles UI rendering and user interactions.
	 * ALL game logic has been moved to service layers:
	 * - gameActions.js: Game state changes and business logic
	 * - imageService.js: Image generation
	 * - dice.js: Dice rolling (DO NOT reimplement here)
	 * - deck.js: Card logic (DO NOT reimplement here)
	 * 
	 * IMPORTANT: Do not add game logic to this component!
	 * Always use the service abstractions instead.
	 */
	
	import { gameState } from './stores.js';
	import { imageStyleOptions } from './data.js';
	import { startGame, rollTimeline, rollTimelineWithDetails, acceptTimeline, rerollTimeline, navigateToPhase } from './logic/gameActions.js';
	import FaceCardSetup from './components/setup/FaceCardSetup.svelte';

	// UI state only - no game logic here
	let settingInput = '';
	let selectedImageStyle = $gameState.imageStyle;
	let isSubmitting = false;

	/**
	 * Handle game start - uses centralized game actions
	 * NO game logic here - just UI handling and service calls
	 */
	async function handleStartGame() {
		if (isSubmitting) return;
		
		try {
			isSubmitting = true;
			// Use the centralized game action - no logic duplication!
			await startGame(settingInput, selectedImageStyle);
		} catch (error) {
			alert(error.message);
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Handle enhanced timeline roll with full details
	 */
	function handleRollTimelineWithDetails() {
		rollTimelineWithDetails();
	}

	/**
	 * Handle accepting the current timeline
	 */
	function handleAcceptTimeline() {
		acceptTimeline();
	}

	/**
	 * Handle rerolling the timeline
	 */
	function handleRerollTimeline() {
		rerollTimeline();
	}

	/**
	 * Handle phase navigation - uses centralized actions
	 */
	function handleNavigateToPhase(phase) {
		navigateToPhase(phase);
	}
</script>

<div class="game-container">
	<div class="image-section">
		{#if $gameState.isGeneratingImage}
			<div class="loading-placeholder">
				<div class="spinner"></div>
				<p>Generating your world...</p>
			</div>
		{:else}
			<img src={$gameState.currentImageUrl} alt="Your place" class="world-image" />
		{/if}
		
		{#if $gameState.isDevelopmentMode && $gameState.lastGeneratedPrompt}
			<div class="debug-info">
				<strong>Last Prompt:</strong> {$gameState.lastGeneratedPrompt}
			</div>
		{/if}
	</div>

	<div class="content-section">
		{#if $gameState.currentPhase === 'intro'}
			<div class="intro-content">
				<h1>The Ground Itself</h1>
				<p class="subtitle">A game about places over time</p>
				
				<div class="intro-text">
					<p>This is a game about places over time. Think about places that have been important to you; your childhood fort under the rosebush; your first apartment, the one with the view; the town where your grandmother spent her last few years.</p>
					
					<p>Our camera is anchored to our place, and may not pivot or stray. Remember that places have memory— that what has happened here is always, in some small or big way, written into the walls, the stones, or the future of the people who continue to live here.</p>
					
					<p>Fundamentally, this is a game about the echoes and traces we leave for others after we are gone.</p>
				</div>

				<div class="setup-form">
					<h2>Describe Your Place</h2>
					<p>Begin by describing the place where your story will unfold. This can be anywhere - real or imagined, past, present, or future.</p>
					
					<textarea 
						bind:value={settingInput}
						placeholder="A small coastal village with weathered stone houses... An abandoned space station drifting between stars... A grove of ancient oak trees in the heart of a modern city..."
						rows="4"
						class="setting-input"
					></textarea>

					<div class="style-selection">
						<h3>Choose Visual Style</h3>
						<select bind:value={selectedImageStyle} class="style-select">
							{#each imageStyleOptions as style}
								<option value={style}>{style}</option>
							{/each}
						</select>
					</div>

					<button on:click={handleStartGame} class="start-button" disabled={isSubmitting || $gameState.isGeneratingImage}>
						{isSubmitting || $gameState.isGeneratingImage ? 'Creating Your World...' : 'Begin Your Story'}
					</button>
				</div>
			</div>
		{:else if $gameState.currentPhase === 'setup-timeline'}
			<div class="timeline-setup">
				<h2>Establish Your Timeline</h2>
				<p>This game is played in 4 cycles, separated by gaps in time. Roll the die to determine the unit of time that will measure these gaps.</p>
				
				<div class="timeline-info">
					<ul>
						<li><strong>1 = days</strong> - intimate, close-textured story</li>
						<li><strong>2 = weeks</strong> - short-term changes</li>
						<li><strong>3 = years</strong> - seasonal cycles, growth</li>
						<li><strong>4 = decades</strong> - generational changes</li>
						<li><strong>5 = centuries</strong> - historical epochs</li>
						<li><strong>6 = millennia</strong> - geological time</li>
					</ul>
				</div>

				{#if $gameState.timelineRoll}
					<div class="timeline-result">
						<div class="roll-display">
							<h3>🎲 You rolled: {$gameState.timelineRoll}</h3>
							<div class="timeline-unit">
								<strong>{$gameState.timelineUnit}</strong>
							</div>
						</div>

						{#if $gameState.timelineDescription}
							<div class="timeline-details">
								<div class="timeline-description">
									<h4>What this means:</h4>
									<p><strong>{$gameState.timelineDescription}</strong></p>
									<p class="implication">{$gameState.timelineImplication}</p>
									<p class="example"><em>Example: {$gameState.timelineExample}</em></p>
								</div>

								<div class="timeline-choice">
									<p class="choice-text">
										<strong>From the original rules:</strong> "If the collective group feels that the given timeline is antagonistic to the story that you would like to tell, you may re-roll."
									</p>
									
									<div class="choice-buttons">
										<button on:click={handleAcceptTimeline} class="accept-button">
											✓ Accept This Timeline
										</button>
										<button on:click={handleRerollTimeline} class="reroll-button">
											🎲 Reroll Timeline
										</button>
									</div>
								</div>
							</div>
						{:else}
							<div class="simple-result">
								<p>Your story will unfold over <strong>{$gameState.timelineUnit}</strong>.</p>
								<p>This means each cycle will be separated by gaps measured in {$gameState.timelineUnit}.</p>
								
								<button on:click={handleAcceptTimeline} class="continue-button">
									Continue to Place Setup
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<div class="roll-section">
						<button on:click={handleRollTimelineWithDetails} class="roll-button">
							🎲 Roll for Timeline
						</button>
						<p class="roll-hint">Click to discover the time scale of your story</p>
					</div>
				{/if}
			</div>
		{:else if $gameState.currentPhase === 'setup-place'}
			<FaceCardSetup />
		{:else if $gameState.currentPhase === 'mainPlay'}
			<div class="main-play-redirect">
				<h2>Entering Main Gameplay</h2>
				<p>Your world has been established. Time to begin the main story...</p>
				<button on:click={() => window.location.href = '/games/the-ground-itself/play'} class="play-button">
					Begin Playing
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.game-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
	}

	.image-section {
		position: sticky;
		top: 2rem;
		height: fit-content;
	}

	.world-image {
		width: 100%;
		height: 400px;
		object-fit: cover;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.loading-placeholder {
		width: 100%;
		height: 400px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top: 4px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.debug-info {
		margin-top: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 4px;
		font-size: 0.9rem;
		border-left: 4px solid #007bff;
	}

	.content-section {
		overflow-y: auto;
	}

	.intro-content h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #2d3748;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #718096;
		margin-bottom: 2rem;
		font-style: italic;
	}

	.intro-text {
		margin-bottom: 2rem;
		line-height: 1.6;
		color: #4a5568;
	}

	.setup-form {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.setting-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 4px;
		font-size: 1rem;
		line-height: 1.5;
		resize: vertical;
		margin-bottom: 1.5rem;
	}

	.setting-input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
	}

	.style-selection {
		margin-bottom: 1.5rem;
	}

	.style-select {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e2e8f0;
		border-radius: 4px;
		font-size: 1rem;
		background: white;
	}

	.start-button, .continue-button, .roll-button, .play-button {
		background: #4299e1;
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.start-button:hover, .continue-button:hover, .roll-button:hover, .play-button:hover {
		background: #3182ce;
	}

	.main-play-redirect {
		text-align: center;
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.main-play-redirect h2 {
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.main-play-redirect p {
		color: #4a5568;
		margin-bottom: 2rem;
		font-size: 1.1rem;
	}

	.start-button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.timeline-info ul {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0;
	}

	.timeline-info li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #e2e8f0;
	}

	.timeline-result {
		background: #f0fff4;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #9ae6b4;
		margin-top: 1rem;
	}

	.timeline-result h3 {
		color: #2f855a;
		margin-bottom: 0.5rem;
	}

	/* Enhanced Timeline Styles */
	.roll-section {
		text-align: center;
		margin-top: 2rem;
	}

	.roll-hint {
		color: #718096;
		font-style: italic;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	.roll-display {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.roll-display h3 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.timeline-unit {
		font-size: 2rem;
		color: #2f855a;
		font-weight: bold;
		text-transform: capitalize;
		margin-bottom: 1rem;
	}

	.timeline-details {
		margin-top: 1.5rem;
	}

	.timeline-description {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.timeline-description h4 {
		color: #2d3748;
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.timeline-description p {
		margin-bottom: 0.75rem;
		line-height: 1.6;
	}

	.implication {
		color: #4a5568;
		font-style: italic;
	}

	.example {
		color: #718096;
		font-size: 0.9rem;
	}

	.timeline-choice {
		background: #fef5e7;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #f6ad55;
	}

	.choice-text {
		color: #744210;
		margin-bottom: 1.5rem;
		line-height: 1.6;
		font-size: 0.95rem;
	}

	.choice-buttons {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.accept-button {
		background: #48bb78;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.accept-button:hover {
		background: #38a169;
	}

	.reroll-button {
		background: #ed8936;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.reroll-button:hover {
		background: #dd6b20;
	}

	.simple-result {
		text-align: center;
		margin-top: 1rem;
	}

	.simple-result p {
		margin-bottom: 1rem;
		color: #4a5568;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.game-container {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding: 1rem;
		}

		.image-section {
			position: relative;
			top: 0;
		}

		.choice-buttons {
			flex-direction: column;
		}

		.accept-button, .reroll-button {
			justify-content: center;
		}

		.timeline-unit {
			font-size: 1.5rem;
		}
	}
</style>
