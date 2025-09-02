<script>
	let { showCardReview, faceCards, currentCardIndex, faceCardAnswers, onClose, onSelectCard } = $props();

	function getSuitSymbol(suit) {
		const symbols = {
			clubs: '♣',
			hearts: '♥',
			diamonds: '♦',
			spades: '♠'
		};
		return symbols[suit] || '';
	}
</script>

{#if showCardReview}
	<div class="review-modal-overlay" onclick={onClose}>
		<div class="review-modal" onclick={(e) => e.stopPropagation()}>
			<h3 class="text-lg mb-4" style="font-family: var(--font-serif); color: var(--c-green);">Review Your Answers</h3>
			<div class="review-grid">
				{#each faceCards as card, index}
					<button
						class="review-card {card.suit}"
						class:current={index === currentCardIndex}
						onclick={() => onSelectCard(index, card)}
					>
						<div class="review-card-header">
							<span class="suit-symbol">{getSuitSymbol(card.suit)}</span>
							<span class="card-name">{card.name.split(' ')[1]}</span>
						</div>
						<div class="review-status">
							{faceCardAnswers[card.name] ? '✓' : '○'}
						</div>
					</button>
				{/each}
			</div>
			<button
				onclick={onClose}
				class="btn-secondary mt-4"
			>
				Close Review
			</button>
		</div>
	</div>
{/if}
