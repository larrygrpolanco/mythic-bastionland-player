<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
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

		// Navigate to gameplay
		goto('/games/the-ground-itself/gameplay');
	}

	// Initialize first card when component mounts
	onMount(() => {
		if (placeName && placeDescription && timelineUnit) {
			currentFaceCard = faceCards[0];
		}
	});

	// Reactive effect for when basic setup is complete
	$effect(() => {
		if (placeName && placeDescription && timelineUnit && !currentFaceCard) {
			currentFaceCard = faceCards[0];
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

	* {
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.cosmic-bg {
		background: linear-gradient(135deg, var(--c-cream) 0%, var(--c-stardust) 100%);
		min-height: 100vh;
	}

	.setup-card {
		background-color: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(168, 197, 184, 0.3);
		border-radius: var(--space-md);
		padding: var(--space-lg);
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		box-shadow: 0 8px 25px rgba(74, 124, 89, 0.1);
	}

	.setup-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 35px rgba(74, 124, 89, 0.15);
	}

	.form-input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid rgba(168, 197, 184, 0.3);
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
		background: linear-gradient(135deg, var(--c-green) 0%, var(--c-cosmic) 100%);
		color: var(--c-cream);
		border: none;
		border-radius: var(--space-xs);
		padding: var(--space-sm) var(--space-md);
		font-family: var(--font-sans);
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(74, 124, 89, 0.4);
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
		background-color: rgba(168, 197, 184, 0.3);
		color: rgba(58, 50, 50, 0.6);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.progress-indicator {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-lg);
	}

	.progress-step {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: rgba(168, 197, 184, 0.3);
		margin: 0 var(--space-xs);
		transition: all 0.3s ease;
	}

	.progress-step.active {
		background-color: var(--c-green);
		transform: scale(1.2);
	}

	.card-counter {
		text-align: center;
		font-size: 0.875rem;
		color: var(--c-charcoal);
		margin-bottom: var(--space-md);
	}
</style>

<main class="cosmic-bg" style="padding: var(--space-xl) 0;">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<!-- Header -->
		<header class="text-center mb-8">
			<h1 class="text-3xl md:text-4xl mb-2" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">
				Establish Your Place
			</h1>
			<p style="color: var(--c-charcoal); font-family: var(--font-sans); font-weight: 300;">
				Let's build the foundation of your story
			</p>
		</header>

		<!-- Progress Indicator -->
		<div class="progress-indicator mb-8">
			<div class="progress-step active"></div>
			<div class="progress-step" class:active={placeName && placeDescription && timelineUnit}></div>
			<div class="progress-step" class:active={setupComplete}></div>
		</div>

		<!-- Basic Setup -->
		{#if !currentFaceCard && !setupComplete}
			<div class="setup-card">
				<h2 class="text-2xl mb-6" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Basic Information</h2>

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
		{/if}

		<!-- Face Cards Setup -->
		{#if currentFaceCard && !setupComplete}
			<div class="setup-card">
				<div class="card-counter">
					Card {currentCardIndex + 1} of {faceCards.length}
				</div>

				<h3 class="text-xl mb-4" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">
					{currentFaceCard.name}
				</h3>

				<p class="mb-4" style="color: var(--c-charcoal); font-weight: 300;">
					{currentFaceCard.question}
				</p>

				<textarea
					bind:value={faceCardAnswers[currentFaceCard.name]}
					rows="4"
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
				<h3 class="text-xl mb-4" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">
					Setup Complete!
				</h3>
				<p class="mb-6" style="color: var(--c-charcoal); font-weight: 300;">
					Your place has been established. Ready to begin the story?
				</p>
				<button
					onclick={startGame}
					class="btn-primary"
					style="padding: var(--space-md) var(--space-lg); font-size: 1.1rem;"
				>
					Start Playing
				</button>
			</div>
		{/if}
	</div>
</main>
