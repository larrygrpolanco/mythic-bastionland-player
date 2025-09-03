<script>
	/**
	 * FOCUSED SITUATION MENU COMPONENT
	 * 
	 * This component handles when the player chooses a focused situation instead
	 * of answering the card's question directly. It presents the 6 focused situation
	 * options from the original game rules.
	 * 
	 * On submit:
	 * 1. Saves focused situation response to gameState.answers with unique key
	 * 2. Increments card rank count (same as answering)
	 * 3. Triggers image generation
	 * 4. Resets to drawing state for next turn
	 * 
	 * Uses existing data.js and follows clean architecture.
	 */
	
	import { gameState } from '../../stores.js';
	import { focusedSituations } from '../../data.js';
	import { submitFocusedSituation, setTurnState } from '../../logic/gameActions.js';

	let selectedSituation = null;
	let situationResponse = '';
	let isSubmitting = false;

	// Get current card info
	$: activeCard = $gameState.activeCard;
	$: cardRankCounts = $gameState.cardRankCounts;

	/**
	 * Handle selecting a focused situation
	 */
	function handleSelectSituation(situation) {
		selectedSituation = situation;
		situationResponse = ''; // Clear previous response
	}

	/**
	 * Handle submitting the focused situation response - uses centralized game actions service
	 * NO logic duplication - uses gameActions.js service
	 */
	async function handleSubmitResponse() {
		if (!activeCard || !selectedSituation || !situationResponse.trim() || isSubmitting) return;

		try {
			isSubmitting = true;

			// Use centralized game action - handles all logic
			const success = await submitFocusedSituation(selectedSituation, situationResponse.trim());
			
			if (success) {
				// Clear the form on success
				selectedSituation = null;
				situationResponse = '';
				console.log('Focused situation submitted successfully');
			} else {
				console.error('Failed to submit focused situation');
			}

		} catch (error) {
			console.error('Error submitting focused situation:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function formatCardName(card) {
		if (!card) return '';
		const rank = card.rank.charAt(0).toUpperCase() + card.rank.slice(1);
		const suit = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
		return `${rank} of ${suit}`;
	}

	function getSuitSymbol(suit) {
		const symbols = {
			clubs: '♣',
			hearts: '♥',
			diamonds: '♦',
			spades: '♠'
		};
		return symbols[suit] || '';
	}

	function getSuitColor(suit) {
		return (suit === 'hearts' || suit === 'diamonds') ? '#dc2626' : '#1f2937';
	}

	/**
	 * Handle going back to decision - uses service action
	 */
	function handleGoBack() {
		setTurnState('deciding');
	}

	// Calculate which occurrence this is
	$: occurrenceNumber = activeCard ? (cardRankCounts[activeCard.rank] || 0) + 1 : 1;
</script>

<div class="focused-situation-container">
	<div class="focused-situation-content">
		<h2>Choose a Focused Situation</h2>
		
		{#if activeCard}
			<div class="card-display">
				<div class="card" style="border-color: {getSuitColor(activeCard.suit)}">
					<div class="card-header" style="color: {getSuitColor(activeCard.suit)}">
						<span class="card-name">{formatCardName(activeCard)}</span>
						<span class="suit-symbol">{getSuitSymbol(activeCard.suit)}</span>
					</div>
				</div>
				<div class="card-info">
					<p class="occurrence-info">
						{occurrenceNumber}{occurrenceNumber === 1 ? 'st' : occurrenceNumber === 2 ? 'nd' : occurrenceNumber === 3 ? 'rd' : 'th'} 
						<strong>{activeCard.rank}</strong>
					</p>
				</div>
			</div>

			{#if !selectedSituation}
				<div class="situation-selection">
					<h3>Choose Your Focused Situation:</h3>
					<p class="instruction">
						Instead of answering the card's question, you can explore one of these alternative narrative paths:
					</p>

					<div class="situation-grid">
						{#each focusedSituations as situation}
							<button 
								on:click={() => handleSelectSituation(situation)}
								class="situation-button"
							>
								<div class="situation-content">
									<strong class="situation-name">{situation.name}</strong>
									<p class="situation-description">{situation.description}</p>
								</div>
							</button>
						{/each}
					</div>

					<div class="back-section">
						<button 
							on:click={handleGoBack}
							class="back-button"
						>
							← Back to Choices
						</button>
					</div>
				</div>
			{:else}
				<div class="response-section">
					<div class="selected-situation">
						<h3>Selected: {selectedSituation.name}</h3>
						<p class="situation-description">{selectedSituation.description}</p>
					</div>

					<div class="response-input-section">
						<h3>Describe Your Focused Situation:</h3>
						<textarea 
							bind:value={situationResponse}
							placeholder="Describe what happens in this focused moment..."
							rows="5"
							class="response-input"
							disabled={isSubmitting || $gameState.isGeneratingImage}
						></textarea>

						<div class="button-group">
							<button 
								on:click={() => selectedSituation = null}
								class="change-button"
								disabled={isSubmitting || $gameState.isGeneratingImage}
							>
								← Choose Different Situation
							</button>

							<button 
								on:click={handleSubmitResponse} 
								class="submit-button"
								disabled={!situationResponse.trim() || isSubmitting || $gameState.isGeneratingImage}
							>
								{#if isSubmitting || $gameState.isGeneratingImage}
									<div class="spinner"></div>
									Evolving Your World...
								{:else}
									Submit Response
								{/if}
							</button>
						</div>
					</div>

					<div class="help-text">
						<p><strong>Tip:</strong> Your focused situation will be added to your place's story and may generate a new image showing this special moment.</p>
					</div>
				</div>
			{/if}
		{:else}
			<div class="error-state">
				<p>No active card found. This shouldn't happen.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.focused-situation-container {
		max-width: 800px;
		margin: 0 auto;
	}

	.focused-situation-content {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.focused-situation-content h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #2d3748;
	}

	.card-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
	}

	.card {
		width: 120px;
		height: 80px;
		background: white;
		border: 2px solid;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 0.5rem;
	}

	.card-header {
		text-align: center;
		font-weight: bold;
	}

	.card-name {
		display: block;
		font-size: 0.8rem;
		margin-bottom: 0.25rem;
	}

	.suit-symbol {
		font-size: 1.5rem;
	}

	.card-info {
		text-align: center;
	}

	.occurrence-info {
		color: #4a5568;
		font-size: 0.9rem;
		margin: 0;
	}

	.situation-selection h3 {
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.instruction {
		color: #4a5568;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.situation-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.situation-button {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.situation-button:hover {
		border-color: #4299e1;
		box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
		background: #ebf8ff;
	}

	.situation-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.situation-name {
		color: #2d3748;
		font-size: 1rem;
	}

	.situation-description {
		color: #718096;
		font-size: 0.9rem;
		line-height: 1.4;
		margin: 0;
	}

	.back-section {
		text-align: center;
	}

	.back-button, .change-button {
		background: #edf2f7;
		color: #4a5568;
		border: 1px solid #cbd5e0;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.back-button:hover, .change-button:hover {
		background: #e2e8f0;
	}

	.selected-situation {
		background: white;
		padding: 1.5rem;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
		margin-bottom: 2rem;
	}

	.selected-situation h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.response-input-section {
		background: white;
		padding: 1.5rem;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.response-input-section h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.response-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 4px;
		font-size: 1rem;
		line-height: 1.5;
		resize: vertical;
		margin-bottom: 1rem;
		min-height: 120px;
	}

	.response-input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
	}

	.response-input:disabled {
		background: #f7fafc;
		cursor: not-allowed;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
	}

	.submit-button {
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
		justify-content: center;
		gap: 0.5rem;
		min-width: 150px;
	}

	.submit-button:hover:not(:disabled) {
		background: #38a169;
	}

	.submit-button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
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
		background: #f0fff4;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #48bb78;
	}

	.help-text p {
		margin: 0;
		color: #2f855a;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.error-state {
		background: #fed7d7;
		border: 1px solid #fc8181;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		color: #742a2a;
	}

	@media (max-width: 768px) {
		.focused-situation-content {
			padding: 1.5rem;
		}

		.situation-grid {
			grid-template-columns: 1fr;
		}

		.button-group {
			flex-direction: column;
		}

		.change-button, .submit-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
