<script>
	/**
	 * DRAW CARD PROMPT COMPONENT
	 * 
	 * This component handles the card drawing phase of main gameplay.
	 * Uses existing deck.js logic and follows clean architecture.
	 * 
	 * Functionality:
	 * - Creates numerical deck on first draw
	 * - Draws cards and updates game state
	 * - Detects "10" cards for time gaps
	 * - Transitions to decision phase for other cards
	 */
	
	import { gameState } from '../../stores.js';
	import { drawNumericalCard } from '../../logic/gameActions.js';

	let isDrawing = false;

	/**
	 * Handle card drawing - uses centralized game actions service
	 * NO logic duplication - uses gameActions.js service
	 */
	async function handleDrawCard() {
		if (isDrawing) return;

		try {
			isDrawing = true;

			// Use centralized game action - handles all logic
			const result = await drawNumericalCard();
			
			if (!result.success) {
				console.error('Failed to draw card:', result.error);
				return;
			}

			// Log the action taken for debugging
			console.log('Card drawn successfully:', result.action, result.card);

		} catch (error) {
			console.error('Error drawing card:', error);
		} finally {
			isDrawing = false;
		}
	}

	// Reactive calculations
	$: cardsRemaining = $gameState.numericalDeck.length === 0 ? 40 : $gameState.numericalDeck.length; // 40 cards total (4 suits × 10 ranks)
	$: tensDrawn = $gameState.tensDrawn;
	$: currentCycle = $gameState.currentCycle;
</script>

<div class="draw-card-container">
	<div class="draw-card-content">
		<h2>Draw Your Next Card</h2>
		
		<div class="game-info">
			<div class="info-item">
				<span class="label">Cycle:</span>
				<span class="value">{currentCycle} of 4</span>
			</div>
			<div class="info-item">
				<span class="label">Cards Remaining:</span>
				<span class="value">{cardsRemaining}</span>
			</div>
			<div class="info-item">
				<span class="label">Time Gaps Passed:</span>
				<span class="value">{tensDrawn}</span>
			</div>
		</div>

		<div class="draw-section">
			<p class="instruction">
				Draw a card to continue your story. Each card will present you with a question 
				about your place, or you can choose to explore a focused situation instead.
			</p>

			<button 
				on:click={handleDrawCard} 
				class="draw-button"
				disabled={isDrawing}
			>
				{#if isDrawing}
					<div class="spinner"></div>
					Drawing Card...
				{:else}
					Draw Card
				{/if}
			</button>
		</div>

		<div class="help-text">
			<p><strong>Remember:</strong> If you draw a "10", time will advance and your place will change. 
			Drawing the 4th "10" will end the game.</p>
		</div>
	</div>
</div>

<style>
	.draw-card-container {
		max-width: 600px;
		margin: 0 auto;
	}

	.draw-card-content {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.draw-card-content h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #2d3748;
	}

	.game-info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: white;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
	}

	.info-item {
		text-align: center;
	}

	.label {
		display: block;
		font-size: 0.8rem;
		color: #718096;
		margin-bottom: 0.25rem;
	}

	.value {
		display: block;
		font-size: 1.1rem;
		font-weight: bold;
		color: #2d3748;
	}

	.draw-section {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.instruction {
		margin-bottom: 1.5rem;
		line-height: 1.6;
		color: #4a5568;
	}

	.draw-button {
		background: #4299e1;
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
		min-width: 150px;
		min-height: 50px;
	}

	.draw-button:hover:not(:disabled) {
		background: #3182ce;
	}

	.draw-button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.help-text {
		background: #edf2f7;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #4299e1;
	}

	.help-text p {
		margin: 0;
		color: #4a5568;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.draw-card-content {
			padding: 1.5rem;
		}

		.game-info {
			grid-template-columns: 1fr;
		}
	}
</style>
