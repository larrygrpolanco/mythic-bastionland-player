<script>
	import { goto } from '$app/navigation';
	import { gameStore, gameActions } from '../lib/gameStore.js';
	import { imageService } from '../lib/imageService.js';
	import { gameGuidance, getRandomTip } from '../lib/gameGuidance.js';

	let gameData = $state($gameStore);
	let currentAnswer = $state('');
	let showFocusedSituations = $state(false);
	let showGuidance = $state(true);
	let currentImage = $state(null);
	let nextImage = $state(null);
	let isImageTransitioning = $state(false);
	let guidanceTip = $state(getRandomTip());

	// Initialize with first image
	$effect(() => {
		fetchNewImage();
	});

	// Check for cycle transitions
	$effect(() => {
		if (gameData.cycleTransition.inProgress) {
			// Navigate to cycle-end page for time gap questions
			goto('/games/the-ground-itself/cycle-end');
		}
	});

	async function fetchNewImage() {
		try {
			const imageData = await imageService.getRandomImage();
			if (currentImage) {
				// Start crossfade transition
				nextImage = imageData;
				isImageTransitioning = true;

				// Wait for transition to complete
				setTimeout(() => {
					currentImage = nextImage;
					nextImage = null;
					isImageTransitioning = false;
				}, 1000);
			} else {
				currentImage = imageData;
			}
		} catch (error) {
			console.error('Error loading image:', error);
		}
	}

	function drawCard() {
		gameActions.drawCard();
		currentAnswer = '';
		showFocusedSituations = false;
		guidanceTip = getRandomTip();
	}

	async function submitAnswer() {
		if (currentAnswer.trim()) {
			gameActions.answerQuestion(currentAnswer);
			currentAnswer = '';

			// Fetch new image after answer submission
			await fetchNewImage();
		}
	}

	function handleTenCard() {
		// For ten cards, advance to next cycle
		const gapValue = Math.floor(Math.random() * 6) + 1;
		gameActions.advanceCycle(gameData.timeline.unit, gapValue);

		// Navigation to cycle-end page is handled by the effect above
	}

	function chooseFocusedSituation(situation) {
		const situationResponses = {
			tell_story: 'You tell a captivating story about your place...',
			throw_party: 'A celebration begins in your place...',
			discover: 'You make an important discovery...',
			omen: 'You witness a significant omen...',
			leave_frame: 'You glimpse beyond your place...',
			move_on: 'You let this moment pass...'
		};

		gameActions.answerQuestion(
			situationResponses[situation] || 'You choose to focus on this moment...'
		);
		showFocusedSituations = false;

		// Fetch new image after focused situation
		fetchNewImage();
	}

	// Auto-draw first card when component mounts
	$effect(() => {
		if (!gameData.currentCard && gameData.cycle === 1) {
			drawCard();
		}
	});
</script>

<div class="space-y-6">
	<!-- Image Display with Crossfade -->
	{#if currentImage}
		<div class="relative h-64 overflow-hidden rounded-lg border border-slate-600 md:h-80">
			<!-- Current Image -->
			<img
				src={currentImage.url}
				alt="Your place evolving over time"
				class="h-full w-full object-cover transition-opacity duration-1000"
				class:opacity-100={!isImageTransitioning}
				class:opacity-0={isImageTransitioning}
			/>

			<!-- Next Image (during transition) -->
			{#if nextImage}
				<img
					src={nextImage.url}
					alt="Your place evolving over time"
					class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
					class:opacity-0={!isImageTransitioning}
					class:opacity-100={isImageTransitioning}
				/>
			{/if}

			<!-- Image Overlay -->
			<div
				class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4"
			>
				<p class="text-sm text-white">Your place evolves with each story told...</p>
			</div>
		</div>
	{/if}

	

	<!-- Current Card and Question -->
	{#if gameData.currentCard}
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
			<div class="mb-4 flex items-start justify-between">
				<div>
					<h3 class="text-xl font-semibold text-green-400">
						{gameData.currentCard.value.toUpperCase()} of {gameData.currentCard.suit.toUpperCase()}
					</h3>
					{#if gameData.currentCard.value === '10'}
						<p class="mt-1 text-sm text-yellow-400">This will advance time!</p>
					{/if}
				</div>
				<div class="text-right">
					<button
						onclick={() => (showFocusedSituations = !showFocusedSituations)}
						class="rounded bg-purple-600 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-700"
					>
						Focused Action
					</button>
				</div>
			</div>

			<p class="mb-4 text-slate-300">{gameData.currentQuestion}</p>

			<!-- Answer Input -->
			{#if gameData.currentCard.value !== '10'}
				<textarea
					bind:value={currentAnswer}
					rows="4"
					placeholder="Your answer..."
					class="mb-4 w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
				></textarea>

				<div class="flex justify-end">
					<button
						onclick={submitAnswer}
						disabled={!currentAnswer.trim()}
						class="rounded bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-600"
					>
						Submit Answer
					</button>
				</div>
			{:else}
				<div class="mb-4 rounded border border-yellow-700 bg-yellow-900/50 p-4">
					<p class="text-sm text-yellow-200">
						Drawing a 10 advances time. This will move {gameData.timeline.unitValue}
						{gameData.timeline.unit} into the future.
					</p>
				</div>

				<div class="flex justify-end">
					<button
						onclick={handleTenCard}
						class="rounded bg-yellow-600 px-6 py-2 text-white transition-colors hover:bg-yellow-700"
					>
						Advance Time
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Draw Card Button -->
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
			<h3 class="mb-4 text-xl font-semibold text-blue-400">Ready for the Next Moment?</h3>
			<p class="mb-6 text-slate-300">Draw a card to continue building the story of your place.</p>
			<button
				onclick={drawCard}
				class="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
			>
				Draw Card
			</button>
		</div>
	{/if}

	<!-- Focused Situations Modal -->
	{#if showFocusedSituations}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div class="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6">
				<h3 class="mb-4 text-xl font-semibold text-purple-400">Choose a Focused Situation</h3>
				<div class="space-y-3">
					<button
						onclick={() => chooseFocusedSituation('tell_story')}
						class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
					>
						<strong>Tell a Story</strong><br />
						<small class="text-slate-400">Adopt a storytelling character and narrate</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('throw_party')}
						class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
					>
						<strong>Throw a Party</strong><br />
						<small class="text-slate-400">Describe and roleplay a celebration</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('discover')}
						class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
					>
						<strong>Discover Something</strong><br />
						<small class="text-slate-400">Name a fact that enters the world</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('omen')}
						class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
					>
						<strong>See an Omen</strong><br />
						<small class="text-slate-400">Gesture at a future possibility</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('leave_frame')}
						class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
					>
						<strong>Leave the Frame</strong><br />
						<small class="text-slate-400">Glance beyond your established place</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('move_on')}
						class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
					>
						<strong>Move On</strong><br />
						<small class="text-slate-400">Skip this turn</small>
					</button>
				</div>

				<div class="mt-4 text-center">
					<button
						onclick={() => (showFocusedSituations = false)}
						class="rounded border border-slate-600 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-700"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

  <!-- Game Status -->
	<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-blue-400">{gameData.place.name || 'Your Place'}</h3>
				<p class="text-sm text-slate-400">
					Cycle {gameData.cycle} • Ten cards drawn: {gameData.tenCount}/4
				</p>
			</div>
			<div class="text-right">
				<p class="text-sm text-slate-400">
					Timeline: {gameData.timeline.unit} ({gameData.timeline.unitValue} unit gaps)
				</p>
				<button
					onclick={() => goto(`/games/the-ground-itself/cycle/${gameData.cycle}`)}
					class="mt-1 text-xs text-green-400 hover:text-green-300 underline"
				>
					View Cycle Details
				</button>
			</div>
		</div>
	</div>

<!-- Guidance Toggle -->
	<div class="flex items-center justify-between">
		<div class="text-sm text-slate-400">
			Tip: {guidanceTip}
		</div>
		<button
			onclick={() => (showGuidance = !showGuidance)}
			class="rounded bg-slate-700 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-slate-600"
		>
			{showGuidance ? 'Hide Help' : 'Show Help'}
		</button>
	</div>

	<!-- Game Guidance -->
	{#if showGuidance}
		<div class="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
			<h4 class="text-md mb-2 font-semibold text-green-400">How to Play</h4>
			<ul class="space-y-1 text-sm text-slate-300">
				{#each gameGuidance.gameplay.instructions as instruction}
					<li class="flex items-start">
						<span class="mr-2 text-green-400">•</span>
						<span>{instruction}</span>
					</li>
				{/each}
			</ul>

			{#if gameData.currentCard?.value === '10'}
				<div class="mt-3 rounded border border-yellow-700 bg-yellow-900/30 p-3">
					<h5 class="mb-1 text-sm font-semibold text-yellow-400">Cycle Change!</h5>
					<p class="text-xs text-yellow-200">{gameGuidance.gameplay.tenCard.description}</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Recent Answers -->
	{#if gameData.playerAnswers.length > 0}
		<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
			<h4 class="mb-3 text-lg font-semibold text-slate-300">Recent Answers</h4>
			<div class="max-h-40 space-y-2 overflow-y-auto">
				{#each gameData.playerAnswers.slice(-3) as answer}
					<div class="rounded bg-slate-700/50 p-3">
						<p class="mb-1 text-sm text-slate-400">
							{answer.card.value} of {answer.card.suit} • {new Date(
								answer.timestamp
							).toLocaleTimeString()}
						</p>
						<p class="text-sm text-slate-300">{answer.answer}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Game End Check -->
	{#if gameData.tenCount >= 4}
		<div class="rounded-lg border border-red-700 bg-red-900/50 p-6 text-center">
			<h3 class="mb-4 text-xl font-semibold text-red-400">The Story Reaches Its End</h3>
			<p class="mb-6 text-slate-300">
				You have drawn the fourth ten card. The window into your place begins to fog, and the
				clarity of vision you had fades.
			</p>
			<p class="mb-6 text-slate-300">
				What happens tomorrow in your place? Who wakes up? What do they see, and what feeling does
				it give them?
			</p>
			<button
				onclick={() => window.location.reload()}
				class="rounded bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700"
			>
				Start New Story
			</button>
		</div>
	{/if}
</div>
