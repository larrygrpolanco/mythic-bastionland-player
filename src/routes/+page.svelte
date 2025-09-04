<script>
	const games = [
		{
			id: 'the-ground-itself',
			title: 'The Ground Itself',
			description: 'A narrative game about places over time. Build stories around a single location as it evolves through cycles of change.'
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

	/* Global styles */
	main {
		background: linear-gradient(135deg, var(--c-cream) 0%, #fff 100%);
		color: var(--c-charcoal);
		font-family: var(--font-sans);
		font-weight: 300;
		line-height: 1.7;
		min-height: 100vh;
		padding: var(--space-lg) 0;
	}

	header h1 {
		font-family: var(--font-serif);
		font-weight: 500;
		color: var(--c-red);
		line-height: 1.25;
	}

	header p {
		color: var(--c-charcoal);
	}

	.section-card {
		background: linear-gradient(145deg, #FFFFFF 0%, var(--c-glow-light) 100%);
		border: 1px solid rgba(234, 234, 234, 0.5);
		border-radius: var(--space-xs);
		box-shadow: 0 4px 12px rgba(58, 50, 50, 0.08);
		padding: var(--space-lg);
	}

	.section-title {
		font-family: var(--font-serif);
		font-weight: 500;
		color: var(--c-charcoal);
		line-height: 1.25;
		margin-bottom: var(--space-md);
	}

	.game-grid-title {
		font-family: var(--font-serif);
		font-weight: 500;
		color: var(--c-charcoal);
		line-height: 1.25;
	}

	.game-card {
		background: linear-gradient(145deg, #FFFFFF 0%, var(--c-glow-light) 100%);
		border: 1px solid rgba(234, 234, 234, 0.5);
		border-radius: var(--space-xs);
		box-shadow: 0 4px 12px rgba(58, 50, 50, 0.08);
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		display: block;
		text-decoration: none;
		color: inherit;
		padding: var(--space-lg);
	}

	.game-card:hover {
		transform: translateY(-6px) scale(1.02) rotate(0.5deg);
		box-shadow: 0 12px 30px rgba(42, 37, 37, 0.15);
	}

	.game-card h3 {
		font-family: var(--font-serif);
		font-weight: 500;
		color: var(--c-charcoal);
		line-height: 1.25;
		margin-bottom: var(--space-sm);
		transition: color 0.3s ease;
	}

	.game-card:hover h3 {
		color: var(--c-red);
	}

	.game-card p {
		color: var(--c-charcoal);
	}
</style>

<main>
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<header class="text-center mb-12">
			<h1 class="text-4xl md:text-6xl mb-4">Mythic Player</h1>
			<p class="text-xl md:text-2xl max-w-3xl mx-auto">
				A portfolio of interactive tabletop game adaptations, powered by AI for enhanced storytelling and visual experiences.
			</p>
		</header>

		<!-- Project Description -->
		<section class="mb-12 max-w-4xl mx-auto">
			<div class="section-card">
				<h2 class="text-2xl section-title">About This Project</h2>
				<p class="leading-relaxed mb-4">This is a collection of web-based adaptations of tabletop games, designed to explore the intersection of traditional gaming mechanics and modern AI technologies. Each game is completely modular, with no shared assets, allowing for independent development and testing.</p>
				<p class="leading-relaxed">Starting with "The Ground Itself" by Everest Pipkin, these adaptations maintain the core gameplay while leveraging AI for enhanced narrative generation and visual storytelling.</p>
			</div>
		</section>

		<!-- Game Selection -->
		<section class="max-w-4xl mx-auto">
			<h2 class="text-3xl mb-8 text-center game-grid-title">Choose Your Game</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each games as game}
					<a class="game-card" href="/games/{game.id}">
						<h3 class="text-xl">{game.title}</h3>
						<p>{game.description}</p>
					</a>
				{/each}
			</div>
		</section>
	</div>
</main>
