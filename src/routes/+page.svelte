<script>
	let selectedGame = $state(null);
	const games = [
		{
			id: 'the-ground-itself',
			title: 'The Ground Itself',
			description: 'A narrative game about places over time. Build stories around a single location as it evolves through cycles of change.',
			status: 'Available'
		}
	];
</script>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Lora:wght@400;500&display=swap');

	:root {
		--c-red: #D95B43;
		--c-cream: #F4F0E9;
		--c-charcoal: #3A3232;
		--c-wood: #6E4A34;
		--c-slate: #31363F;
		--c-twilight: #4A4C5E;
		--c-glow-red: rgba(217, 91, 67, 0.25);
		--c-glow-light: rgba(244, 240, 233, 0.7);
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

	.game-card {
		transition: transform 0.4s ease, box-shadow 0.4s ease;
	}

	.game-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 25px rgba(42, 37, 37, 0.1);
	}

	.btn-primary {
		transition: all 0.3s ease;
	}

	.btn-primary:hover {
		background-color: #C14431;
		transform: translateY(-2px);
	}
</style>

<main class="min-h-screen" style="background-color: var(--c-cream); color: var(--c-charcoal); font-family: var(--font-sans); font-weight: 300; line-height: 1.7;">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<header class="text-center mb-12">
			<h1 class="text-4xl md:text-6xl mb-4" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-red); line-height: 1.25;">
				Mythic Player
			</h1>
			<p class="text-xl md:text-2xl max-w-3xl mx-auto" style="color: var(--c-charcoal);">
				A portfolio of interactive tabletop game adaptations, powered by AI for enhanced storytelling and visual experiences.
			</p>
		</header>

		<!-- Project Description -->
		<section class="mb-12 max-w-4xl mx-auto">
			<div class="rounded-lg p-6 border" style="background-color: #FFFFFF; border-color: #EAEAEA; border-radius: var(--space-xs);">
				<h2 class="text-2xl mb-4" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-charcoal); line-height: 1.25;">About This Project</h2>
				<p class="leading-relaxed mb-4" style="color: var(--c-charcoal);">
					This is a collection of web-based adaptations of tabletop games, designed to explore the intersection of traditional gaming mechanics and modern AI technologies. Each game is completely modular, with no shared assets, allowing for independent development and testing.
				</p>
				<p class="leading-relaxed" style="color: var(--c-charcoal);">
					Starting with "The Ground Itself" by Everest Pipkin, these adaptations maintain the core gameplay while leveraging AI for enhanced narrative generation and visual storytelling.
				</p>
			</div>
		</section>

		<!-- Game Selection -->
		<section class="max-w-4xl mx-auto">
			<h2 class="text-3xl mb-8 text-center" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-charcoal); line-height: 1.25;">Choose Your Game</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each games as game}
					<div class="game-card rounded-lg p-6 border cursor-pointer"
						 style="background-color: #FFFFFF; border-color: #EAEAEA; border-radius: var(--space-xs);"
						 onclick={() => selectedGame = game}>
						<h3 class="text-xl mb-2" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-charcoal); line-height: 1.25;">{game.title}</h3>
						<p class="mb-4" style="color: var(--c-charcoal);">{game.description}</p>
						<span class="inline-block px-3 py-1 text-sm rounded-full" style="background-color: var(--c-red); color: var(--c-cream);">
							{game.status}
						</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- Game Modal -->
		{#if selectedGame}
			<div class="fixed inset-0 flex items-center justify-center p-4 z-50" style="background-color: rgba(0, 0, 0, 0.5);">
				<div class="rounded-lg p-6 max-w-md w-full border" style="background-color: #FFFFFF; border-color: #EAEAEA; border-radius: var(--space-xs);">
					<h3 class="text-2xl mb-4" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-charcoal); line-height: 1.25;">{selectedGame.title}</h3>
					<p class="mb-6" style="color: var(--c-charcoal);">{selectedGame.description}</p>
					<div class="flex gap-4">
						<a href="/games/{selectedGame.id}"
						   class="btn-primary flex-1 px-4 py-2 rounded text-center" style="background-color: var(--c-red); color: var(--c-cream); text-decoration: none; display: inline-block;">
							Play Now
						</a>
						<button onclick={() => selectedGame = null}
								class="px-4 py-2 border rounded" style="border-color: #EAEAEA; color: var(--c-charcoal); background-color: transparent;">
							Cancel
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</main>
