<script>
	let { setupComplete, onStartGame } = $props();
</script>

{#if setupComplete}
	<div class="setup-card text-center">
		<h3 class="text-xl mb-4" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">
			Setup Complete!
		</h3>
		<p class="mb-6" style="color: var(--c-charcoal); font-weight: 300;">
			Your place has been established. Ready to begin the story?
		</p>
		<button
			onclick={onStartGame}
			class="btn-primary"
			style="padding: var(--space-md) var(--space-lg); font-size: 1.1rem;"
		>
			Start Playing
		</button>
	</div>
{/if}
