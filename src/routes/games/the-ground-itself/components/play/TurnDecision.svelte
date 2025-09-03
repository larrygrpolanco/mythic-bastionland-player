<script>
	/**
	 * TURN DECISION COMPONENT
	 * 
	 * This component displays the drawn card and its corresponding question,
	 * then presents the player with two choices:
	 * 1. Answer the question directly
	 * 2. Choose a focused situation instead
	 * 
	 * Uses existing data.js for questions and follows clean architecture.
	 */
	
	import { gameState } from '../../stores.js';
	import { numericalCardQuestions } from '../../data.js';
	import { setTurnState } from '../../logic/gameActions.js';

	// Get current question based on card rank and count
	$: activeCard = $gameState.activeCard;
	$: cardRankCounts = $gameState.cardRankCounts;
	
	$: currentQuestion = getCurrentQuestion(activeCard, cardRankCounts);

	/**
	 * Get the appropriate question for the current card
	 * Uses the card rank and how many times we've seen this rank
	 */
	function getCurrentQuestion(card, counts) {
		if (!card || !card.rank) return '';
		
		const rank = card.rank;
		const count = counts[rank] || 0; // Current count (0-based)
		const questions = numericalCardQuestions[rank];
		
		if (!questions || count >= questions.length) {
			return `No more questions for ${rank} cards.`;
		}
		
		return questions[count];
	}

	/**
	 * Handle choosing to answer the question - uses service action
	 */
	function handleAnswerQuestion() {
		setTurnState('answering');
	}

	/**
	 * Handle choosing a focused situation - uses service action
	 */
	function handleFocusedSituation() {
		setTurnState('focusedSituation');
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

	// Calculate which occurrence this is
	$: occurrenceNumber = activeCard ? (cardRankCounts[activeCard.rank] || 0) + 1 : 1;
</script>

<div class="turn-decision-container">
	<div class="turn-decision-content">
		<h2>You Drew a Card</h2>
		
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
						This is the <strong>{occurrenceNumber}</strong>{occurrenceNumber === 1 ? 'st' : occurrenceNumber === 2 ? 'nd' : occurrenceNumber === 3 ? 'rd' : 'th'} 
						time you've drawn a <strong>{activeCard.rank}</strong>.
					</p>
				</div>
			</div>

			<div class="question-section">
				<h3>Your Question:</h3>
				<div class="question-text">
					{currentQuestion}
				</div>
			</div>

			<div class="choice-section">
				<h3>What would you like to do?</h3>
				<div class="choice-buttons">
					<button 
						on:click={handleAnswerQuestion}
						class="choice-button answer-button"
					>
						<div class="button-content">
							<strong>Answer the Question</strong>
							<span class="button-description">
								Respond to this specific prompt about your place
							</span>
						</div>
					</button>

					<button 
						on:click={handleFocusedSituation}
						class="choice-button focused-button"
					>
						<div class="button-content">
							<strong>Choose Focused Situation</strong>
							<span class="button-description">
								Explore a different aspect of your world instead
							</span>
						</div>
					</button>
				</div>
			</div>

			<div class="help-text">
				<p><strong>Note:</strong> Either choice will advance your story and potentially generate a new image of your evolving place.</p>
			</div>
		{:else}
			<div class="error-state">
				<p>No active card found. This shouldn't happen.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.turn-decision-container {
		max-width: 700px;
		margin: 0 auto;
	}

	.turn-decision-content {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.turn-decision-content h2 {
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
		width: 140px;
		height: 90px;
		background: white;
		border: 2px solid;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		margin-bottom: 1rem;
	}

	.card-header {
		text-align: center;
		font-weight: bold;
	}

	.card-name {
		display: block;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
	}

	.suit-symbol {
		font-size: 1.8rem;
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

	.choice-section h3 {
		margin-bottom: 1rem;
		color: #2d3748;
		text-align: center;
	}

	.choice-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.choice-button {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.choice-button:hover {
		border-color: #4299e1;
		box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
	}

	.answer-button:hover {
		background: #ebf8ff;
	}

	.focused-button:hover {
		background: #f0fff4;
		border-color: #48bb78;
	}

	.button-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.button-content strong {
		color: #2d3748;
		font-size: 1rem;
	}

	.button-description {
		color: #718096;
		font-size: 0.9rem;
		line-height: 1.4;
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
		.turn-decision-content {
			padding: 1.5rem;
		}

		.choice-buttons {
			grid-template-columns: 1fr;
		}

		.choice-button {
			padding: 1rem;
		}
	}
</style>
