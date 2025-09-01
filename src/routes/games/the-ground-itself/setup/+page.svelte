<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { gameStore, gameActions } from '../lib/gameStore.js';
	import Footer from '../components/Footer.svelte';
	import './+page.css';

	let placeName = $state('');
	let placeDescription = $state('');
	let timelineUnit = $state('');
	let timelineValue = $state(1);

	let currentFaceCard = $state(null);
	let faceCardAnswers = $state({});

	let currentSection = $state('setting'); // 'setting', 'timeline', 'establishing'
	let showGuidance = $state(false);
	let guidanceText = $state('');
	let isTyping = $state(false);
	let timeoutId = $state(null);
	let showCardReview = $state(false);
	let cardTransitionDirection = $state(''); // 'next', 'prev', 'jump'

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

	const sectionGuidance = {
		setting: `The setting for our game should be decided collaboratively. This may be emergent— one player may suggest a place that involves animals. Another player may amend this suggestion to mean a zoo. A third player may agree— but suggest making it a zoo planet, established as a biodiversity reserve in the far future. You may feel out multiple options, but try not to say no to other's suggestions. Rather, build on top of existent ideas or ask clarifying questions to create a place that is everyone's.`,
		timeline: `This game is played in 4 cycles, and each cycle is separated by a gap in time. One player rolls the six sided die and records the result. This die will determine the unit of time that this gap is measured in, and this metric stays for the remainder of the game. A 1 means days, which might lend itself to an intimate and close-textured story. A 6 means millennia— you are playing a game over thousands of years, and what was here may not survive these jumps in recognizable ways.`,
		establishing: `Each player is dealt cards from the face-cards stack in a circle until no cards are left. Then, going in this same circle, each player sets down one card at a time and answers the question associated with that card. They may read the questions first, or pick between their cards at random. Keep going until the world feels established or each player is out of cards, whichever happens first. Try to keep this discussion under 25 minutes; keep your answers to each question very short.`
	};

	function typeText(text) {
		if (timeoutId) clearTimeout(timeoutId);
		guidanceText = '';
		isTyping = true;
		let index = 0;

		function type() {
			if (index < text.length) {
				guidanceText += text[index];
				index++;
				timeoutId = setTimeout(type, 25);
			} else {
				isTyping = false;
			}
		}
		type();
	}

	function nextSection() {
		if (currentSection === 'setting' && placeName && placeDescription) {
			currentSection = 'timeline';
			if (showGuidance) typeText(sectionGuidance.timeline);
		} else if (currentSection === 'timeline' && timelineUnit) {
			currentSection = 'establishing';
			currentFaceCard = faceCards[0];
			if (showGuidance) typeText(sectionGuidance.establishing);
		}
	}

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

	// Helper functions
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

	function getSuitGuidance(suit) {
		const guidance = {
			clubs: 'Think about what shaped this place before your story begins.',
			hearts: 'Consider the inhabitants and their daily lives.',
			diamonds: 'Explore the physical and social structures.',
			spades: 'Examine the conflicts and difficulties.'
		};
		return guidance[suit] || '';
	}

	// Initialize guidance
	onMount(() => {
		if (showGuidance) typeText(sectionGuidance.setting);
	});
</script>



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
			<div class="progress-step" class:active={currentSection === 'setting'}></div>
			<div class="progress-step" class:active={currentSection === 'timeline'}></div>
			<div class="progress-step" class:active={currentSection === 'establishing'}></div>
			<div class="progress-step" class:active={setupComplete}></div>
		</div>

		<!-- Guidance Toggle -->
		<div class="text-center mb-6">
			<button
				onclick={() => { showGuidance = !showGuidance; if (showGuidance) typeText(sectionGuidance[currentSection]); }}
				class="guidance-toggle"
			>
				{showGuidance ? 'Hide Guidance' : 'Show Guidance'}
			</button>
		</div>

		<!-- Guidance Text -->
		{#if showGuidance && !setupComplete}
			<div class="guidance-card mb-8">
				<div class="guidance-text">
					{guidanceText}
					{#if isTyping}
						<span class="cursor"></span>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Our Setting Section -->
		{#if currentSection === 'setting'}
			<div class="setup-card">
				<h2 class="text-2xl mb-6" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Our Setting</h2>

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
				</div>

				<div class="text-right mt-6">
					<button
						onclick={nextSection}
						disabled={!placeName || !placeDescription}
						class="btn-primary"
					>
						Continue to Timeline
					</button>
				</div>
			</div>
		{/if}

		<!-- Our Timeline Section -->
		{#if currentSection === 'timeline'}
			<div class="setup-card">
				<h2 class="text-2xl mb-6" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Our Timeline</h2>

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

				<div class="flex justify-between mt-6">
					<button
						onclick={() => { currentSection = 'setting'; if (showGuidance) typeText(sectionGuidance.setting); }}
						class="btn-secondary"
					>
						Back to Setting
					</button>

					<button
						onclick={nextSection}
						disabled={!timelineUnit}
						class="btn-primary"
					>
						Continue to Establishing
					</button>
				</div>
			</div>
		{/if}

		<!-- Establishing Our Place -->
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
							onclick={() => showCardReview = !showCardReview}
							class="btn-secondary text-sm"
						>
							{showCardReview ? 'Hide Review' : 'Review Cards'}
						</button>
					</div>
				</div>

				<!-- Card Review Modal -->
				{#if showCardReview}
					<div class="review-modal-overlay" onclick={() => showCardReview = false}>
						<div class="review-modal" onclick={(e) => e.stopPropagation()}>
							<h3 class="text-lg mb-4" style="font-family: var(--font-serif); color: var(--c-green);">Review Your Answers</h3>
							<div class="review-grid">
								{#each faceCards as card, index}
									<button
										class="review-card {card.suit}"
										class:current={index === currentCardIndex}
										onclick={() => { currentCardIndex = index; currentFaceCard = card; showCardReview = false; }}
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
								onclick={() => showCardReview = false}
								class="btn-secondary mt-4"
							>
								Close Review
							</button>
						</div>
					</div>
				{/if}

				<!-- Main Card -->
				<div class="face-card {currentFaceCard.suit}" class:transitioning={cardTransitionDirection}>
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
								onclick={previousCard}
								disabled={currentCardIndex === 0}
								class="btn-secondary"
							>
								← Previous
							</button>

							<button
								onclick={nextCard}
								class="btn-primary"
							>
								{currentCardIndex === faceCards.length - 1 ? 'Complete Setup' : 'Next Card →'}
							</button>
						</div>
					</div>
				</div>

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

<Footer />
