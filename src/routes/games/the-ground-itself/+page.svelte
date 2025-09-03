<script>
	import { gameState } from './stores.js';
	import { imageStyleOptions } from './data.js';
	import { buildImagePrompt } from './logic/promptBuilder.js';
	import FaceCardSetup from './components/setup/FaceCardSetup.svelte';

	let settingInput = '';
	let selectedImageStyle = $gameState.imageStyle;
	let isGenerating = false;

	async function generateImage(prompt) {
		try {
			const response = await fetch('/games/the-ground-itself/api/generate-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: prompt,
					isDevelopmentMode: $gameState.isDevelopmentMode
				})
			});

			const result = await response.json();
			
			if (result.success) {
				gameState.update(state => ({
					...state,
					currentImageUrl: result.imageUrl,
					lastGeneratedPrompt: result.prompt,
					isGeneratingImage: false
				}));
			} else {
				console.error('Image generation failed:', result.error);
				gameState.update(state => ({
					...state,
					isGeneratingImage: false
				}));
			}
		} catch (error) {
			console.error('Error calling image API:', error);
			gameState.update(state => ({
				...state,
				isGeneratingImage: false
			}));
		}
	}

	async function startGame() {
		if (!settingInput.trim()) {
			alert('Please describe your place before continuing.');
			return;
		}

		// Update the game state
		gameState.update(state => ({
			...state,
			settingDescription: settingInput.trim(),
			imageStyle: selectedImageStyle,
			currentPhase: 'setup-timeline',
			isGeneratingImage: true
		}));

		// Generate the first image
		const prompt = buildImagePrompt({
			...$gameState,
			settingDescription: settingInput.trim(),
			imageStyle: selectedImageStyle
		});

		await generateImage(prompt);
	}

	function rollTimeline() {
		const roll = Math.floor(Math.random() * 6) + 1;
		const units = {
			1: 'days',
			2: 'weeks',
			3: 'years',
			4: 'decades',
			5: 'centuries',
			6: 'millennia'
		};

		gameState.update(state => ({
			...state,
			timelineRoll: roll,
			timelineUnit: units[roll],
			currentPhase: 'setup-place'
		}));
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

					<button on:click={startGame} class="start-button" disabled={isGenerating}>
						{isGenerating ? 'Creating Your World...' : 'Begin Your Story'}
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
						<h3>You rolled: {$gameState.timelineRoll}</h3>
						<p>Your story will unfold over <strong>{$gameState.timelineUnit}</strong>.</p>
						<p>This means each cycle will be separated by gaps measured in {$gameState.timelineUnit}.</p>
						
						<button on:click={() => gameState.update(state => ({ ...state, currentPhase: 'setup-place' }))} class="continue-button">
							Continue to Place Setup
						</button>
					</div>
				{:else}
					<button on:click={rollTimeline} class="roll-button">
						Roll for Timeline
					</button>
				{/if}
			</div>
		{:else if $gameState.currentPhase === 'setup-place'}
			<FaceCardSetup />
		{:else if $gameState.currentPhase === 'mainPlay'}
			<div class="main-play">
				<h2>Main Gameplay</h2>
				<p>The main gameplay loop will be implemented here.</p>
				<p>Current cycle: {$gameState.currentCycle}</p>
				<p>Timeline unit: {$gameState.timelineUnit}</p>
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

	.start-button, .continue-button, .roll-button {
		background: #4299e1;
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.start-button:hover, .continue-button:hover, .roll-button:hover {
		background: #3182ce;
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
	}
</style>
