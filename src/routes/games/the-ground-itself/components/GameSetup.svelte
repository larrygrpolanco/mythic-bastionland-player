<script>
	import { gameStore, gameActions } from '../lib/gameStore.js';

	let placeName = $state('');
	let placeDescription = $state('');
	let timelineUnit = $state('');
	let timelineValue = $state(1);

	let currentFaceCard = $state(null);
	let faceCardAnswers = $state({});

	const faceCards = [
		{ suit: 'clubs', name: 'Jack of Clubs', question: 'What was this place in the past? How long ago was that?' },
		{ suit: 'clubs', name: 'Queen of Clubs', question: 'What was the greatest moment in this place\'s history?' },
		{ suit: 'clubs', name: 'King of Clubs', question: 'If there are inhabitants, what are the visions for the future that they hold?' },
		{ suit: 'hearts', name: 'Jack of Hearts', question: 'Who lives here? What is an average person like?' },
		{ suit: 'hearts', name: 'Queen of Hearts', question: 'Who or what has been in this place the longest?' },
		{ suit: 'hearts', name: 'King of Hearts', question: 'What stories are told in or about this place?' },
		{ suit: 'diamonds', name: 'Jack of Diamonds', question: 'What is this place named or called?' },
		{ suit: 'diamonds', name: 'Queen of Diamonds', question: 'What is valued in this place?' },
		{ suit: 'diamonds', name: 'King of Diamonds', question: 'Who or what is in power here?' },
		{ suit: 'spades', name: 'Jack of Spades', question: 'What are the threats to this place?' },
		{ suit: 'spades', name: 'Queen of Spades', question: 'What was the greatest tragedy in this place\'s past?' },
		{ suit: 'spades', name: 'King of Spades', question: 'What are they divided on?' }
	];

	let currentCardIndex = $state(0);
	let setupComplete = $state(false);

	function nextCard() {
		if (currentFaceCard && faceCardAnswers[currentFaceCard.name]) {
			gameActions.setFaceCardAnswer(
				currentFaceCard.suit,
				currentFaceCard.name.toLowerCase().replace(' ', '_'),
				faceCardAnswers[currentFaceCard.name]
			);
		}

		if (currentCardIndex < faceCards.length - 1) {
			currentCardIndex++;
			currentFaceCard = faceCards[currentCardIndex];
		} else {
			setupComplete = true;
		}
	}

	function previousCard() {
		if (currentCardIndex > 0) {
			currentCardIndex--;
			currentFaceCard = faceCards[currentCardIndex];
		}
	}

	function startGame() {
		// Save final answers
		if (currentFaceCard && faceCardAnswers[currentFaceCard.name]) {
			gameActions.setFaceCardAnswer(
				currentFaceCard.suit,
				currentFaceCard.name.toLowerCase().replace(' ', '_'),
				faceCardAnswers[currentFaceCard.name]
			);
		}

		// Set place name and description
		gameActions.setPlaceName(placeName);
		gameActions.setPlaceDescription(placeDescription);

		// Set timeline
		gameActions.setTimeline(timelineUnit, timelineValue);

		// Initialize first card
		currentFaceCard = faceCards[0];
	}

	// Reactive statements
	$effect(() => {
		if (placeName && placeDescription && timelineUnit) {
			startGame();
		}
	});
</script>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Lora:wght@400;500&display=swap');

	:root {
		--c-cream: #F4F0E9;
		--c-charcoal: #3A3232;
		--c-green: #4A7C59;
		--c-mint: #7FB685;
		--c-cosmic: #2D4A3E;
		--c-stardust: #A8C5B8;
		--font-serif: 'Lora', serif;
		--font-sans: 'Inter', sans-serif;
		--space-xs: 4px;
		--space-sm: 8px;
		--space-md: 16px;
		--space-lg: 32px;
		--space-xl: 64px;
	}

	.setup-card {
		background-color: #FFFFFF;
		border: 1px solid #EAEAEA;
		border-radius: var(--space-xs);
		padding: var(--space-lg);
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.setup-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(74, 124, 89, 0.1);
	}

	.form-input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid #EAEAEA;
		border-radius: var(--space-xs);
		font-family: var(--font-sans);
		font-weight: 300;
		color: var(--c-charcoal);
		background-color: var(--c-cream);
		transition: all 0.3s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--c-green);
		box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
	}

	.form-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--c-charcoal);
		margin-bottom: var(--space-sm);
	}

	.btn-primary {
		background-color: var(--c-green);
		color: var(--c-cream);
		border: none;
		border-radius: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-sans);
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-primary:hover {
		background-color: var(--c-cosmic);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(74, 124, 89, 0.2);
	}

	.btn-secondary {
		background-color: var(--c-mint);
		color: var(--c-charcoal);
		border: none;
		border-radius: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-sans);
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-secondary:hover:not(:disabled) {
		background-color: var(--c-stardust);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(168, 197, 184, 0.2);
	}

	.btn-secondary:disabled {
		background-color: #EAEAEA;
		color: #999;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
</style>

<div class="space-y-8" style="font-family: var(--font-sans); font-weight: 300; line-height: 1.7; color: var(--c-charcoal);">
	<!-- Basic Setup -->
	<div class="setup-card">
		<h2 class="text-2xl mb-6" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Establish Your Place</h2>

		<div class="space-y-4">
			<div>
				<label for="placeName" class="form-label">Place Name</label>
				<input
					id="placeName"
					bind:value={placeName}
					type="text"
					placeholder="e.g., The Forgotten Valley, Crystal City, Ancient Oak Grove"
					class="form-input"
				/>
			</div>

			<div>
				<label for="placeDescription" class="form-label">Place Description</label>
				<textarea
					id="placeDescription"
					bind:value={placeDescription}
					rows="3"
					placeholder="Describe your place in a few sentences..."
					class="form-input"
				></textarea>
			</div>

			<div class="grid md:grid-cols-2 gap-4">
				<div>
					<label for="timelineUnit" class="form-label">Timeline Unit</label>
					<select
						id="timelineUnit"
						bind:value={timelineUnit}
						class="form-input"
					>
						<option value="">Select unit...</option>
						<option value="days">Days</option>
						<option value="weeks">Weeks</option>
						<option value="years">Years</option>
						<option value="decades">Decades</option>
						<option value="centuries">Centuries</option>
						<option value="millennia">Millennia</option>
					</select>
				</div>

				<div>
					<label for="timelineValue" class="form-label">Gap Length</label>
					<input
						id="timelineValue"
						bind:value={timelineValue}
						type="number"
						min="1"
						max="6"
						class="form-input"
					/>
				</div>
			</div>
		</div>
	</div>

	<!-- Face Cards Setup -->
	{#if currentFaceCard && !setupComplete}
		<div class="setup-card">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-xl" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">{currentFaceCard.name}</h3>
				<span class="text-sm" style="color: var(--c-charcoal);">Card {currentCardIndex + 1} of {faceCards.length}</span>
			</div>

			<p class="mb-4" style="color: var(--c-charcoal);">{currentFaceCard.question}</p>

			<textarea
				bind:value={faceCardAnswers[currentFaceCard.name]}
				rows="3"
				placeholder="Your answer..."
				class="form-input mb-4"
			></textarea>

			<div class="flex justify-between">
				<button
					onclick={previousCard}
					disabled={currentCardIndex === 0}
					class="btn-secondary"
				>
					Previous
				</button>

				<button
					onclick={nextCard}
					class="btn-primary"
				>
					{currentCardIndex === faceCards.length - 1 ? 'Complete Setup' : 'Next Card'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Setup Complete -->
	{#if setupComplete}
		<div class="setup-card text-center">
			<h3 class="text-xl mb-4" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Setup Complete!</h3>
			<p class="mb-6" style="color: var(--c-charcoal);">Your place has been established. Ready to begin the story?</p>
			<button
				onclick={() => window.location.reload()}
				class="btn-primary"
				style="padding: var(--space-md) var(--space-lg);"
			>
				Start Playing
			</button>
		</div>
	{/if}
</div>
