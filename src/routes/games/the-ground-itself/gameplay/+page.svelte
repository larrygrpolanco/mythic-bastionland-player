<script>
	import { goto } from '$app/navigation';
	import { gameStore } from '../lib/gameStore.js';
	import Footer from '../components/Footer.svelte';
	import GamePlay from '../components/GamePlay.svelte';

	let gameData = $state($gameStore);

	// Check if setup is complete before allowing gameplay
	$effect(() => {
		if (!gameData.place.name || !gameData.timeline.unit) {
			goto('/games/the-ground-itself/setup');
		}
	});
</script>

<main class="cosmic-bg" style="padding: var(--space-xl) 0;">
	<div class="container mx-auto px-4 py-8 max-w-4xl">
		<!-- Header -->
		<header class="text-center mb-8">
			<h1 class="text-3xl md:text-4xl mb-2" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">
				The Story Unfolds
			</h1>
			<p style="color: var(--c-charcoal); font-family: var(--font-sans); font-weight: 300;">
				Building {gameData.place.name} through time
			</p>
		</header>

		<!-- GamePlay Component -->
		<GamePlay />
	</div>
</main>

<Footer />
