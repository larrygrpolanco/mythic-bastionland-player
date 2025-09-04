<script>
	import { gameState } from './stores.js';
	import { goto } from '$app/navigation';

	/**
	 * Navigate back to the main site home page
	 */
	function handleGoHome() {
		goto('/');
	}

	/**
	 * Restart the current game by resetting state and returning to intro
	 */
	function handleRestartGame() {
		// Reset the game state to initial values
		gameState.set({
			// Overall Game Flow
			currentPhase: 'intro',

			// Setup Data
			settingDescription: '',
			timelineUnit: null,
			timelineRoll: null,
			imageStyle: 'atmospheric, digital painting, high detail',
			faceCardDeck: [],
			currentFaceCard: null,
			faceCardIndex: 0,
			faceCardsComplete: false,

			// Core Gameplay Data
			numericalDeck: [],
			activeCard: null,
			tensDrawn: 0,
			currentCycle: 1,
			cardRankCounts: {
				ace: 0,
				two: 0,
				three: 0,
				four: 0,
				five: 0,
				six: 0,
				seven: 0,
				eight: 0,
				nine: 0
			},
			turnState: 'drawing',

			// Narrative & Visuals
			answers: {},
			imagePrompt: '',
			currentImageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/09/rcw120-threecolor-with-star-final.png?w=900',
			isGeneratingImage: false,

			// Development/Debug
			isDevelopmentMode: true,
			lastGeneratedPrompt: ''
		});
	}
</script>

<div class="game-layout">
	<header class="game-header">
		<div class="header-content">
			<h1 class="game-title">The Ground Itself</h1>
			<nav class="header-nav">
				<button 
					on:click={handleGoHome} 
					class="nav-button home-button"
					title="Return to main site"
				>
					Home
				</button>
				<button 
					on:click={handleRestartGame} 
					class="nav-button restart-button"
					title="Start a new game"
				>
					Restart
				</button>
			</nav>
		</div>
	</header>
	
	<main class="game-main">
		<slot />
	</main>
</div>

<style>
	.game-layout {
		min-height: 100vh;
		position: relative;
	}

	.game-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(4px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding: 0.5rem 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.game-title {
		font-size: 1.2rem;
		font-weight: 600;
		color: #2d3748;
		margin: 0;
		opacity: 0.8;
	}

	.header-nav {
		display: flex;
		gap: 0.75rem;
	}

	.nav-button {
		background: transparent;
		border: 1px solid #e2e8f0;
		color: #4a5568;
		padding: 0.25rem 0.75rem;
		font-size: 0.85rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.nav-button:hover {
		background: #f7fafc;
		border-color: #cbd5e0;
		color: #2d3748;
	}

	.home-button:hover {
		background: #4299e1;
		border-color: #4299e1;
		color: white;
	}

	.restart-button:hover {
		background: #e53e3e;
		border-color: #e53e3e;
		color: white;
	}

	.game-main {
		/* Add top padding to account for fixed header */
		padding-top: 3.5rem;
	}
</style>
