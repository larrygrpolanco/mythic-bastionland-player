<script>
	import { gameStore } from '../lib/gameStore.js';

	let gameData = $state($gameStore);
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

	.viewport-sidebar {
		background: rgba(255, 255, 255, 0.95);
		border-right: 1px solid rgba(168, 197, 184, 0.3);
		padding: var(--space-lg);
		overflow-y: auto;
		min-height: 100vh;
	}

	.viewport-header {
		margin-bottom: var(--space-lg);
	}

	.viewport-title {
		font-family: var(--font-serif);
		font-size: 1.25rem;
		font-weight: 500;
		color: var(--c-green);
		margin-bottom: var(--space-sm);
		line-height: 1.25;
	}

	.place-name {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 400;
		color: var(--c-charcoal);
		margin-bottom: var(--space-xs);
	}

	.place-description {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 300;
		color: rgba(58, 50, 50, 0.8);
		line-height: 1.4;
		margin-bottom: var(--space-md);
	}

	.timeline-section {
		margin-bottom: var(--space-lg);
	}

	.section-title {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--c-charcoal);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: var(--space-sm);
	}

	.timeline-info {
		background: var(--c-cream);
		border: 1px solid rgba(168, 197, 184, 0.3);
		border-radius: var(--space-xs);
		padding: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.timeline-label {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 400;
		color: rgba(58, 50, 50, 0.7);
		margin-bottom: var(--space-xs);
	}

	.timeline-value {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--c-charcoal);
	}

	.cycle-info {
		background: linear-gradient(135deg, var(--c-mint) 0%, var(--c-stardust) 100%);
		border-radius: var(--space-xs);
		padding: var(--space-sm);
		margin-bottom: var(--space-sm);
	}

	.cycle-number {
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 500;
		color: var(--c-charcoal);
		margin-bottom: var(--space-xs);
	}

	.ten-count {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 400;
		color: rgba(58, 50, 50, 0.8);
	}

	.history-section {
		margin-bottom: var(--space-lg);
	}

	.history-item {
		background: var(--c-cream);
		border: 1px solid rgba(168, 197, 184, 0.2);
		border-radius: var(--space-xs);
		padding: var(--space-sm);
		margin-bottom: var(--space-xs);
		transition: all 0.3s ease;
	}

	.history-item:hover {
		background: var(--c-mint);
		transform: translateX(2px);
	}

	.history-cycle {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--c-green);
		margin-bottom: var(--space-xs);
	}

	.history-card {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--c-charcoal);
		margin-bottom: var(--space-xs);
	}

	.history-answer {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 300;
		color: rgba(58, 50, 50, 0.8);
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.placeholder-text {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 300;
		color: rgba(58, 50, 50, 0.6);
		font-style: italic;
		text-align: center;
		padding: var(--space-lg);
	}

	.consent-indicator {
		background: rgba(255, 193, 7, 0.1);
		border: 1px solid rgba(255, 193, 7, 0.3);
		border-radius: var(--space-xs);
		padding: var(--space-sm);
		margin-top: var(--space-md);
	}

	.consent-text {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		font-weight: 400;
		color: #856404;
		text-align: center;
	}
</style>

<div class="viewport-sidebar">
	<!-- Header -->
	<div class="viewport-header">
		<h2 class="viewport-title">Time Viewport</h2>
		{#if gameData.place.name}
			<div class="place-name">{gameData.place.name}</div>
			<div class="place-description">{gameData.place.description}</div>
		{:else}
			<div class="placeholder-text">Establish your place to begin</div>
		{/if}
	</div>

	<!-- Timeline Info -->
	{#if gameData.timeline.unit}
		<div class="timeline-section">
			<div class="section-title">Timeline</div>
			<div class="timeline-info">
				<div class="timeline-label">Unit</div>
				<div class="timeline-value">{gameData.timeline.unit}</div>
			</div>
			<div class="timeline-info">
				<div class="timeline-label">Gap Length</div>
				<div class="timeline-value">{gameData.timeline.unitValue} units</div>
			</div>
		</div>
	{/if}

	<!-- Current Cycle -->
	<div class="timeline-section">
		<div class="section-title">Current Status</div>
		<div class="cycle-info">
			<div class="cycle-number">Cycle {gameData.cycle}</div>
			<div class="ten-count">Ten cards: {gameData.tenCount}/4</div>
		</div>
	</div>

	<!-- Recent History -->
	<div class="history-section">
		<div class="section-title">Recent Events</div>
		{#if gameData.playerAnswers && gameData.playerAnswers.length > 0}
			{#each gameData.playerAnswers.slice(-5) as answer}
				<div class="history-item">
					<div class="history-cycle">Cycle {answer.cycle || gameData.cycle}</div>
					<div class="history-card">
						{answer.card.value} of {answer.card.suit}
					</div>
					<div class="history-answer">
						{answer.answer.length > 100 ? answer.answer.substring(0, 100) + '...' : answer.answer}
					</div>
				</div>
			{/each}
		{:else}
			<div class="placeholder-text">No events yet</div>
		{/if}
	</div>

	<!-- Consent Indicator -->
	{#if gameData.consentActive}
		<div class="consent-indicator">
			<div class="consent-text">Consent active - flip coin to pause</div>
		</div>
	{/if}
</div>
