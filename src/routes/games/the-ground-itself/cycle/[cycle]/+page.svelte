<script>
	import { goto } from '$app/navigation';
	import { gameStore } from '../../lib/gameStore.js';
	import Footer from '../../components/Footer.svelte';

	let { data } = $props();
	let gameData = $state($gameStore);

	// Check if we should be on this page
	$effect(() => {
		if (gameData.cycle !== parseInt(data.params.cycle)) {
			goto('/games/the-ground-itself/gameplay');
		}
	});
</script>

<main class="cosmic-bg" style="padding: var(--space-xl) 0;">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<!-- Header -->
		<header class="text-center mb-8">
			<h1 class="text-3xl md:text-4xl mb-2" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">
				Cycle {data.params.cycle}
			</h1>
			<p style="color: var(--c-charcoal); font-family: var(--font-sans); font-weight: 300;">
				The story of {gameData.place.name} continues...
			</p>
		</header>

		<!-- Cycle Content -->
		<div class="space-y-6">
			<!-- Current Status -->
			<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
				<h3 class="text-xl font-semibold text-blue-400 mb-4">
					Current Progress
				</h3>
				<div class="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p class="text-slate-400">Cards Drawn This Cycle:</p>
						<p class="text-lg font-semibold text-white">
							{gameData.playerAnswers.length}
						</p>
					</div>
					<div>
						<p class="text-slate-400">Total Ten Cards:</p>
						<p class="text-lg font-semibold text-yellow-400">
							{gameData.tenCount}/4
						</p>
					</div>
				</div>
			</div>

			<!-- Navigation -->
			<div class="rounded-lg border border-slate-600 bg-slate-800/30 p-6 text-center">
				<h3 class="text-lg font-semibold text-green-400 mb-4">
					Continue Your Story
				</h3>
				<p class="text-slate-300 mb-6">
					Draw cards to build upon the narrative of your place during this cycle.
				</p>
				<button
					onclick={() => goto('/games/the-ground-itself/gameplay')}
					class="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-700"
				>
					Return to Gameplay
				</button>
			</div>

			<!-- Recent Answers -->
			{#if gameData.playerAnswers.length > 0}
				<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
					<h4 class="text-lg font-semibold text-slate-300 mb-4">
						Recent Answers (Cycle {data.params.cycle})
					</h4>
					<div class="space-y-3 max-h-60 overflow-y-auto">
						{#each gameData.playerAnswers as answer}
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
		</div>
	</div>
</main>

<Footer />
