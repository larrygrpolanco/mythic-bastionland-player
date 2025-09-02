<script>
	let { currentFaceCard, faceCardAnswers, onNextCard, onPreviousCard, currentCardIndex, faceCardsLength } = $props();

	function getSuitSymbol(suit) {
		const symbols = {
			clubs: '♣',
			hearts: '♥',
			diamonds: '♦',
			spades: '♠'
		};
		return symbols[suit] || '';
	}

	function getSuitName(suit) {
		const names = {
			clubs: 'Past',
			hearts: 'People',
			diamonds: 'Places',
			spades: 'Challenges'
		};
		return names[suit] || '';
	}
</script>

<div class="face-card {currentFaceCard.suit}">
	<div class="card-header-section">
		<div class="suit-indicator">
			<span class="suit-symbol">{getSuitSymbol(currentFaceCard.suit)}</span>
			<span class="suit-name">{getSuitName(currentFaceCard.suit)}</span>
		</div>
	</div>
	<h3 class="card-title">
		{currentFaceCard.name}
	</h3>

	<div class="card-content">
		<p class="card-question">
			{currentFaceCard.question}
		</p>

		<textarea
			bind:value={faceCardAnswers[currentFaceCard.name]}
			rows="5"
			placeholder="Share your thoughts about this aspect of the place..."
			class="card-textarea"
		></textarea>

		<!-- Navigation buttons moved here -->
		<div class="card-content-navigation">
			<button
				onclick={onPreviousCard}
				disabled={currentCardIndex === 0}
				class="btn-secondary"
			>
				← Previous
			</button>

			<button
				onclick={onNextCard}
				class="btn-primary"
			>
				{currentCardIndex === faceCardsLength - 1 ? 'Complete Setup' : 'Next Card →'}
			</button>
		</div>
	</div>
</div>
