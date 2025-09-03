<script>
	/**
	 * ANSWER INPUT COMPONENT
	 * 
	 * This component handles when the player chooses to answer the card's question.
	 * It displays the question, provides a text input, and handles submission.
	 * 
	 * On submit:
	 * 1. Saves answer to gameState.answers with unique key
	 * 2. Increments card rank count
	 * 3. Triggers image generation
	 * 4. Resets to drawing state for next turn
	 * 
	 * Uses existing services and follows clean architecture.
	 */
	
	import { gameState } from '../../stores.js';
	import { numericalCardQuestions } from '../../data.js';
	import { submitNumericalCardAnswer, setTurnState } from '../../logic/gameActions.js';

	let currentAnswer = '';
	let isSubmitting = false;

	// Get current question and card info
	$: activeCard = $gameState.activeCard;
	$: cardRankCounts = $gameState.cardRankCounts;
	$: currentQuestion = getCurrentQuestion(activeCard, cardRankCounts);

	/**
	 * Get the appropriate question for the current card
	 */
	function getCurrentQuestion(card, counts) {
		if (!card || !card.rank) return '';
		
		const rank = card.rank;
		const count = counts[rank] || 0;
		const questions = numericalCardQuestions[rank];
		
		if (!questions || count >= questions.length) {
			return `No more questions for ${rank} cards.`;
		}
		
		return questions[count];
	}

	/**
	 * Handle answer submission - uses centralized game actions service
	 * NO logic duplication - uses gameActions.js service
	 */
	async function handleSubmitAnswer() {
		if (!activeCard || !currentAnswer.trim() || isSubmitting) return;

		try {
			isSubmitting = true;

			// Use centralized game action - handles all logic
			const success = await submitNumericalCardAnswer(currentAnswer.trim(), currentQuestion);
			
			if (success) {
				// Clear the form on success
				currentAnswer = '';
				console.log('Answer submitted successfully');
			} else {
				console.error('Failed to submit answer');
			}

		} catch (error) {
			console.error('Error submitting answer:', error);
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

<div class="answer-input-container">
	<div class="answer-input-content">
		<h2>Answer Your Question</h2>
		
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

			<div class="question-section">
				<h3>Your Question:</h3>
				<div class="question-text">
					{currentQuestion}
				</div>
			</div>

			<div class="answer-section">
				<h3>Your Answer:</h3>
				<textarea 
					bind:value={currentAnswer}
					placeholder="Describe what happens in your place..."
					rows="5"
					class="answer-input"
					disabled={isSubmitting || $gameState.isGeneratingImage}
				></textarea>

				<div class="button-group">
					<button 
						on:click={handleGoBack}
						class="back-button"
						disabled={isSubmitting || $gameState.isGeneratingImage}
					>
						← Back to Choices
					</button>

					<button 
						on:click={handleSubmitAnswer} 
						class="submit-button"
						disabled={!currentAnswer.trim() || isSubmitting || $gameState.isGeneratingImage}
					>
						{#if isSubmitting || $gameState.isGeneratingImage}
							<div class="spinner"></div>
							Evolving Your World...
						{:else}
							Submit Answer
						{/if}
					</button>
				</div>
			</div>

			<div class="help-text">
				<p><strong>Tip:</strong> Your answer will be added to your place's story and may generate a new image showing how your world has changed.</p>
			</div>
		{:else}
			<div class="error-state">
				<p>No active card found. This shouldn't happen.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.answer-input-container {
		max-width: 700px;
		margin: 0 auto;
	}

	.answer-input-content {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.answer-input-content h2 {
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

	.question-section {
		background: white;
		padding: 1.5rem;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
		margin-bottom: 2rem;
	}

	.question-section h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.question-text {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #2d3748;
		font-weight: 500;
	}

	.answer-section {
		background: white;
		padding: 1.5rem;
		border-radius: 4px;
		border: 1px solid #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.answer-section h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.answer-input {
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

	.answer-input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
	}

	.answer-input:disabled {
		background: #f7fafc;
		cursor: not-allowed;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
	}

	.back-button {
		background: #edf2f7;
		color: #4a5568;
		border: 1px solid #cbd5e0;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.back-button:hover:not(:disabled) {
		background: #e2e8f0;
	}

	.back-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submit-button {
		background: #4299e1;
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
		background: #3182ce;
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

	.error-state {
		background: #fed7d7;
		border: 1px solid #fc8181;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		color: #742a2a;
	}

	@media (max-width: 768px) {
		.answer-input-content {
			padding: 1.5rem;
		}

		.button-group {
			flex-direction: column;
		}

		.back-button, .submit-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>
