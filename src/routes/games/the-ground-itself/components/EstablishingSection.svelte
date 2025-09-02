<script>
	import CardReviewModal from './CardReviewModal.svelte';
	import FaceCard from './FaceCard.svelte';

	let {
		currentFaceCard,
		setupComplete,
		currentCardIndex,
		faceCards,
		faceCardAnswers,
		showCardReview,
		onToggleReview,
		onNextCard,
		onPreviousCard
	} = $props();
</script>

{#if currentFaceCard && !setupComplete}
	<div class="establishing-section">
		<h2 class="text-2xl mb-6" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Establishing Our Place</h2>

		<!-- Progress and Navigation -->
		<div class="flex justify-between items-center mb-6">
			<div class="card-counter">
				Card {currentCardIndex + 1} of {faceCards.length}
			</div>
			<div class="flex gap-2">
				<button
					onclick={onToggleReview}
					class="btn-secondary text-sm"
				>
					{showCardReview ? 'Hide Review' : 'Review Cards'}
				</button>
			</div>
		</div>

		<!-- Card Review Modal -->
		<CardReviewModal
			{showCardReview}
			{faceCards}
			{currentCardIndex}
			{faceCardAnswers}
			onClose={onToggleReview}
			onSelectCard={(index, card) => {
				currentCardIndex = index;
				currentFaceCard = card;
				showCardReview = false;
			}}
		/>

		<!-- Main Card -->
		<FaceCard
			{currentFaceCard}
			{faceCardAnswers}
			{onNextCard}
			{onPreviousCard}
			{currentCardIndex}
			faceCardsLength={faceCards.length}
		/>

		<!-- Encouragement -->
		<div class="encouragement">
			<p class="encouragement-text">
				{currentCardIndex < 4 ? "Building the foundation..." :
				 currentCardIndex < 8 ? "Fleshing out the details..." :
				 "Putting the finishing touches..."}
			</p>
		</div>
	</div>
{/if}
