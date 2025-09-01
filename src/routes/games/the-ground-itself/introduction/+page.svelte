<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Footer from '../components/Footer.svelte';

	let displayText = $state('');
	let currentIndex = $state(0);
	let isTyping = $state(true);
	let showButton = $state(false);
	let showSkipButton = $state(true);
	let timeoutId = $state(null);

	const fullText = `The Ground Itself

This is a game about places over time.

Think about places that have been important to you; your childhood fort under the rosebush; your first apartment, the one with the view; the town where your grandmother spent her last few years. Or, think about places that have been or will be important to others; a city-state in revolt; an ant colony; a generation ship 400 centuries into its voyage towards another star.

Although there may be times during the game when we are compelled to widen or narrow our focus, this is not possible for us; the story we are building is about this place, this field, this star, this city, this tree, this crossroads. No matter how we feel about our characters, if they leave our frame we may not follow. Our camera is anchored to our place, and may not pivot or stray.

Remember that places have memory— that what has happened here is always, in some small or big way, written into the walls, the stones, or the future of the people who continue to live here.

Fundamentally, this is a game about the echoes and traces we leave for others after we are gone.`;

	const typingSpeed = 25; // milliseconds per character (faster)

	onMount(() => {
		typeText();
	});

	function typeText() {
		if (currentIndex < fullText.length) {
			displayText += fullText[currentIndex];
			currentIndex++;
			timeoutId = setTimeout(typeText, typingSpeed);
		} else {
			isTyping = false;
			showButton = true;
			showSkipButton = false;
		}
	}

	function startGame() {
		goto('/games/the-ground-itself/setup');
	}

	function skipIntro() {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		displayText = fullText;
		currentIndex = fullText.length;
		isTyping = false;
		showButton = true;
		showSkipButton = false;
	}
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

	* {
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.cosmic-bg {
		background: linear-gradient(135deg, var(--c-cream) 0%, var(--c-stardust) 100%);
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.introduction-container {
		max-width: 800px;
		padding: var(--space-xl);
		background: rgba(255, 255, 255, 0.95);
		border-radius: var(--space-md);
		box-shadow: 0 20px 40px rgba(74, 124, 89, 0.1);
		border: 1px solid rgba(168, 197, 184, 0.3);
	}

	.title {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		font-weight: 500;
		color: var(--c-green);
		text-align: center;
		margin-bottom: var(--space-lg);
		line-height: 1.2;
	}

	.text-content {
		font-family: var(--font-sans);
		font-size: 1.1rem;
		line-height: 1.7;
		color: var(--c-charcoal);
		font-weight: 300;
		white-space: pre-line;
		margin-bottom: var(--space-xl);
		min-height: 400px;
	}

	.cursor {
		display: inline-block;
		width: 2px;
		height: 1.2em;
		background-color: var(--c-green);
		margin-left: 2px;
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0; }
	}

	.begin-button {
		display: block;
		margin: 0 auto;
		padding: var(--space-md) var(--space-xl);
		background: linear-gradient(135deg, var(--c-green) 0%, var(--c-cosmic) 100%);
		color: var(--c-cream);
		border: none;
		border-radius: var(--space-sm);
		font-family: var(--font-sans);
		font-size: 1.2rem;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
	}

	.begin-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(74, 124, 89, 0.4);
	}

	.skip-button {
		display: block;
		margin: 0 auto var(--space-md);
		padding: var(--space-sm) var(--space-lg);
		background: transparent;
		color: var(--c-charcoal);
		border: 1px solid var(--c-mint);
		border-radius: var(--space-sm);
		font-family: var(--font-sans);
		font-size: 0.9rem;
		font-weight: 300;
		cursor: pointer;
		transition: all 0.3s ease;
		opacity: 0.7;
	}

	.skip-button:hover {
		background: var(--c-mint);
		color: var(--c-cream);
		opacity: 1;
		transform: translateY(-1px);
	}

	.fade-in {
		opacity: 0;
		animation: fadeIn 1s ease-in-out forwards;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}
</style>

<main class="cosmic-bg">
	<div class="introduction-container">
		<h1 class="title">The Ground Itself</h1>

		<div class="text-content">
			{displayText}
			{#if isTyping}
				<span class="cursor"></span>
			{/if}
		</div>

		{#if showSkipButton}
			<button class="skip-button fade-in" onclick={skipIntro}>
				Skip Introduction
			</button>
		{/if}

		{#if showButton}
			<button class="begin-button fade-in" onclick={startGame}>
				Begin
			</button>
		{/if}
	</div>
</main>

<Footer />
