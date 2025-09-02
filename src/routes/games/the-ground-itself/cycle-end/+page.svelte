<script>
	import { goto } from '$app/navigation';
	import { gameStore, gameActions } from '../lib/gameStore.js';
	import Footer from '../components/Footer.svelte';

	let gameData = $state($gameStore);
	let timeGapAnswers = $state({
		inhabitants: '',
		appearance: '',
		name: ''
	});

	// Check if we should be on this page
	$effect(() => {
		if (!gameData.cycleTransition.inProgress) {
			goto('/games/the-ground-itself/gameplay');
		}
	});

	function handleSubmit() {
		if (timeGapAnswers.inhabitants && timeGapAnswers.appearance && timeGapAnswers.name) {
			// Add the time gap answers to the game state
			gameActions.addNote(`Cycle ${gameData.cycle} Time Gap Answers: ${JSON.stringify(timeGapAnswers)}`);
			
			// Complete the cycle transition
			gameActions.completeCycleTransition();
			
			// Navigate back to gameplay for the next cycle
			goto('/games/the-ground-itself/gameplay');
		}
	}

	function getTimeGapDescription() {
		if (!gameData.timeline.unit || !gameData.cycleTransition.gapValue) return '';
		
		const direction = gameData.cycleTransition.direction;
		const amount = gameData.cycleTransition.gapValue;
		const unit = gameData.timeline.unit;
		
		return `${direction === 'forward' ? 'Forward' : 'Backward'} ${amount} ${unit}`;
	}
</script>

<main class="cosmic-bg" style="padding: var(--space-xl) 0;">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<!-- Header -->
		<header class="text-center mb-8">
			<h1 class="text-3xl md:text-4xl mb-2" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">
				Time Advances
			</h1>
			<p style="color: var(--c-charcoal); font-family: var(--font-sans); font-weight: 300;">
				Cycle {gameData.cycle} → Cycle {gameData.cycle + 1}
			</p>
			<div class="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
				<p class="text-lg text-yellow-400 font-semibold">
					{getTimeGapDescription()}
				</p>
				<p class="text-sm text-slate-400 mt-2">
					The story of {gameData.place.name} continues...
				</p>
			</div>
		</header>

		<!-- Time Gap Questions -->
		<div class="space-y-6">
			<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
				<h3 class="text-xl font-semibold text-blue-400 mb-4">
					After the Time Gap...
				</h3>
				<p class="text-slate-300 mb-6">
					Answer these questions collectively to describe how your place has changed:
				</p>

				<!-- Question 1 -->
				<div class="mb-6">
					<label class="block text-lg font-medium text-green-400 mb-2">
						1. Do our characters/civilization still live here? If not, who lives here now? Does anyone?
					</label>
					<textarea
						bind:value={timeGapAnswers.inhabitants}
						rows="3"
						placeholder="Describe the current inhabitants..."
						class="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
					></textarea>
				</div>

				<!-- Question 2 -->
				<div class="mb-6">
					<label class="block text-lg font-medium text-green-400 mb-2">
						2. What does the place physically look like now? Has anything visually changed? How does it smell now? How does it feel here?
					</label>
					<textarea
						bind:value={timeGapAnswers.appearance}
						rows="3"
						placeholder="Describe the physical changes..."
						class="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
					></textarea>
				</div>

				<!-- Question 3 -->
				<div class="mb-6">
					<label class="block text-lg font-medium text-green-400 mb-2">
						3. Does the place still use the same name? If not, what is it called now, and who calls it that?
					</label>
					<textarea
						bind:value={timeGapAnswers.name}
						rows="2"
						placeholder="Describe any name changes..."
						class="w-full rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white placeholder-slate-400 focus:border-green-500 focus:outline-none"
					></textarea>
				</div>

				<!-- Submit Button -->
				<div class="flex justify-end">
					<button
						onclick={handleSubmit}
						disabled={!timeGapAnswers.inhabitants || !timeGapAnswers.appearance || !timeGapAnswers.name}
						class="rounded bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-600"
					>
						Continue to Cycle {gameData.cycle + 1}
					</button>
				</div>
			</div>

			<!-- Guidance -->
			<div class="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
				<h4 class="text-md mb-2 font-semibold text-green-400">Time Gap Guidance</h4>
				<ul class="space-y-1 text-sm text-slate-300">
					<li class="flex items-start">
						<span class="mr-2 text-green-400">•</span>
						<span>Remember that places evolve and change over time</span>
					</li>
					<li class="flex items-start">
						<span class="mr-2 text-green-400">•</span>
						<span>Build on previous answers rather than contradicting them</span>
					</li>
					<li class="flex items-start">
						<span class="mr-2 text-green-400">•</span>
						<span>Consider how the time gap would realistically affect your place</span>
					</li>
					<li class="flex items-start">
						<span class="mr-2 text-green-400">•</span>
						<span>Think about all senses: sight, sound, smell, and feeling</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</main>

<Footer />
