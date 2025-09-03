<script>
	/**
	 * END GAME PAGE
	 * 
	 * This page displays when the 4th "10" card is drawn, concluding the game.
	 * It presents the final prompt from the rulebook and allows one final
	 * image generation to show the ultimate state of the player's place.
	 * 
	 * Uses existing services and follows clean architecture.
	 */
	
	import { gameState } from '../stores.js';
	import { generateImageWithContext } from '../logic/imageService.js';

	let finalAnswer = '';
	let isSubmitting = false;
	let gameComplete = false;

	// Get current game state info
	$: currentImageUrl = $gameState.currentImageUrl;
	$: lastGeneratedPrompt = $gameState.lastGeneratedPrompt;
	$: isDevelopmentMode = $gameState.isDevelopmentMode;
	$: timelineUnit = $gameState.timelineUnit;
	$: settingDescription = $gameState.settingDescription;

	/**
	 * Handle submitting the final answer
	 */
	async function handleSubmitFinal() {
		if (!finalAnswer.trim() || isSubmitting) return;

		try {
			isSubmitting = true;

			// Save the final answer
			gameState.update(state => ({
				...state,
				answers: {
					...state.answers,
					final_tomorrow: finalAnswer.trim()
				}
			}));

			// Generate the ultimate final image
			await generateImageWithContext(
				"What happens tomorrow in your place? Who wakes up (does anyone)? What do they see, and what is the feeling they get from the world?",
				finalAnswer.trim()
			);

			gameComplete = true;

		} catch (error) {
			console.error('Error submitting final answer:', error);
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Handle starting a new game
	 */
	function handleNewGame() {
		// Reset the game state to initial values
		gameState.set({
			// Overall Game Flow
			currentPhase: 'intro',
			
			// Setup Data
			settingDescription: '',
			timelineUnit: null,
			timelineRoll: null,
			imageStyle: 'atmospheric, digital painting, high detail',
			faceCardDeck: [],
			currentFaceCard: null,
			faceCardIndex: 0,
			faceCardsComplete: false,
			
			// Core Gameplay Data
			numericalDeck: [],
			activeCard: null,
			tensDrawn: 0,
			currentCycle: 1,
			cardRankCounts: {
				ace: 0,
				two: 0,
				three: 0,
				four: 0,
				five: 0,
				six: 0,
				seven: 0,
				eight: 0,
				nine: 0
			},
			turnState: 'drawing',
			
			// Narrative & Visuals
			answers: {},
			imagePrompt: '',
			currentImageUrl: 'https://via.placeholder.com/800x600/2d3748/ffffff?text=Your+World+Awaits',
			isGeneratingImage: false,
			
			// Development/Debug
			isDevelopmentMode: true,
			lastGeneratedPrompt: ''
		});

		// Navigate back to the beginning
		window.location.href = '/games/the-ground-itself';
	}
</script>

<div class="end-game-container">
	<!-- Final Image Display -->
	<div class="final-image-section">
		{#if $gameState.isGeneratingImage}
			<div class="loading-placeholder">
				<div class="spinner"></div>
				<p>Creating your final vision...</p>
			</div>
		{:else}
			<img src={currentImageUrl} alt="Your place at the end of time" class="final-image" />
		{/if}
		
		{#if isDevelopmentMode && lastGeneratedPrompt}
			<div class="debug-info">
				<strong>Final Prompt:</strong> {lastGeneratedPrompt}
			</div>
		{/if}
	</div>

	<!-- End Game Content -->
	<div class="end-content-section">
		<div class="end-header">
			<h1>The Ground Itself</h1>
			<h2>Your Story Concludes</h2>
		</div>

		{#if !gameComplete}
			<div class="conclusion-text">
				<p>
					When the 4th ten card is drawn, the game is over— no matter the number of cards left in the pile, 
					or the stories that are in motion. Our window has fogged, and the clarity of vision we had into 
					our place is lost to us. It may feel sudden, but in truth there is never a clean exit. Places go 
					on forever, building narrative by their mere existence.
				</p>
				
				<p>
					However, just because we cannot know for certain what takes place after the window of our game 
					does not mean that we cannot make some conjectures. After all, this is a game about long traces 
					over time— by watching our place with such attention, maybe we have learned to predict what could 
					come to pass.
				</p>
			</div>

			<div class="final-question-section">
				<h3>One Final Question</h3>
				<div class="question-text">
					What happens tomorrow in your place? Who wakes up (does anyone)? What do they see, and what is the feeling they get from the world?
				</div>

				<div class="final-answer-section">
					<textarea 
						bind:value={finalAnswer}
						placeholder="Describe what tomorrow brings to your place..."
						rows="6"
						class="final-answer-input"
						disabled={isSubmitting || $gameState.isGeneratingImage}
					></textarea>

					<button 
						on:click={handleSubmitFinal}
						class="final-submit-button"
						disabled={!finalAnswer.trim() || isSubmitting || $gameState.isGeneratingImage}
					>
						{#if isSubmitting || $gameState.isGeneratingImage}
							<div class="spinner"></div>
							Creating Final Vision...
						{:else}
							Complete Your Story
						{/if}
					</button>
				</div>
			</div>
		{:else}
			<div class="completion-section">
				<h3>Your Story is Complete</h3>
				
				<div class="story-summary">
					<p>
						You have witnessed <strong>{settingDescription}</strong> across the span of <strong>{timelineUnit}</strong>, 
						through four cycles of change and growth. The place you began with has evolved, been shaped by time, 
						and now exists in its final form in your imagination.
					</p>
					
					<p>
						This is the ultimate image of your created place—a culmination of all the stories, changes, 
						and moments you've woven together. The ground itself remembers everything that has happened here.
					</p>
				</div>

				<div class="final-actions">
					<button 
						on:click={handleNewGame}
						class="new-game-button"
					>
						Create Another Place
					</button>
				</div>

				<div class="credits">
					<p>
						<em>"The Ground Itself"</em> by Everest Pipkin<br>
						Digital adaptation for immersive storytelling
					</p>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.end-game-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
	}

	.final-image-section {
		position: sticky;
		top: 2rem;
		height: fit-content;
	}

	.final-image {
		width: 100%;
		height: 500px;
		object-fit: cover;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border: 3px solid #d69e2e;
	}

	.loading-placeholder {
		width: 100%;
		height: 500px;
		background: linear-gradient(135deg, #d69e2e 0%, #b7791f 100%);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border: 3px solid #d69e2e;
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
		border-left: 4px solid #d69e2e;
	}

	.end-content-section {
		overflow-y: auto;
	}

	.end-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.end-header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #2d3748;
	}

	.end-header h2 {
		font-size: 1.5rem;
		color: #d69e2e;
		font-weight: normal;
		font-style: italic;
		margin: 0;
	}

	.conclusion-text {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		margin-bottom: 2rem;
		line-height: 1.7;
	}

	.conclusion-text p {
		margin-bottom: 1.5rem;
		color: #2d3748;
	}

	.conclusion-text p:last-child {
		margin-bottom: 0;
	}

	.final-question-section {
		background: #fffbf0;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #f6e05e;
		border-left: 4px solid #d69e2e;
		margin-bottom: 2rem;
	}

	.final-question-section h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.question-text {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #2d3748;
		font-weight: 500;
		margin-bottom: 1.5rem;
	}

	.final-answer-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 4px;
		font-size: 1rem;
		line-height: 1.5;
		resize: vertical;
		margin-bottom: 1rem;
		min-height: 150px;
	}

	.final-answer-input:focus {
		outline: none;
		border-color: #d69e2e;
		box-shadow: 0 0 0 3px rgba(214, 158, 46, 0.1);
	}

	.final-answer-input:disabled {
		background: #f7fafc;
		cursor: not-allowed;
	}

	.final-submit-button {
		background: #d69e2e;
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 auto;
		min-width: 200px;
	}

	.final-submit-button:hover:not(:disabled) {
		background: #b7791f;
	}

	.final-submit-button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.completion-section {
		text-align: center;
	}

	.completion-section h3 {
		color: #2d3748;
		margin-bottom: 2rem;
		font-size: 1.8rem;
	}

	.story-summary {
		background: #f0fff4;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #9ae6b4;
		border-left: 4px solid #48bb78;
		margin-bottom: 2rem;
		text-align: left;
	}

	.story-summary p {
		margin-bottom: 1.5rem;
		line-height: 1.7;
		color: #2d3748;
	}

	.story-summary p:last-child {
		margin-bottom: 0;
	}

	.final-actions {
		margin-bottom: 3rem;
	}

	.new-game-button {
		background: #4299e1;
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1.1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.new-game-button:hover {
		background: #3182ce;
	}

	.credits {
		color: #718096;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.credits em {
		color: #2d3748;
	}

	@media (max-width: 768px) {
		.end-game-container {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding: 1rem;
		}

		.final-image-section {
			position: relative;
			top: 0;
		}

		.final-image, .loading-placeholder {
			height: 300px;
		}

		.end-header h1 {
			font-size: 2rem;
		}

		.conclusion-text, .final-question-section, .story-summary {
			padding: 1.5rem;
		}
	}
</style>
