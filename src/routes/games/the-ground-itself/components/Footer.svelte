<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let isVisible = $state(false);

	function handleScroll() {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		// Show footer when user is within 200px of the bottom
		const threshold = 200;
		isVisible = (documentHeight - scrollTop - windowHeight) < threshold;
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Check initial position

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
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

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.95);
		border-top: 1px solid rgba(168, 197, 184, 0.3);
		padding: var(--space-md);
		text-align: center;
		backdrop-filter: blur(10px);
		z-index: 100;
		opacity: 0;
		visibility: hidden;
		transition: all 0.3s ease;
	}

	.footer.visible {
		opacity: 1;
		visibility: visible;
	}

	.home-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: linear-gradient(135deg, var(--c-green) 0%, var(--c-cosmic) 100%);
		color: var(--c-cream);
		border: none;
		border-radius: var(--space-xs);
		font-family: var(--font-sans);
		font-weight: 400;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(74, 124, 89, 0.2);
	}

	.home-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(74, 124, 89, 0.3);
	}

	.home-icon {
		width: 16px;
		height: 16px;
		opacity: 0.9;
	}
</style>

<footer class="footer" class:visible={isVisible}>
	<button class="home-btn" onclick={() => goto('/')}>
		<svg class="home-icon" viewBox="0 0 24 24" fill="currentColor">
			<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
		</svg>
		Return to Homescreen
	</button>
</footer>
