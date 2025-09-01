<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { gameStore, gameActions } from '../lib/gameStore.js';
	import TimeViewport from '../components/TimeViewport.svelte';
	import Footer from '../components/Footer.svelte';

	let gameData = $state($gameStore);
	let currentAnswer = $state('');
	let showFocusedSituations = $state(false);

	function drawCard() {
		gameActions.drawCard();
		currentAnswer = '';
		showFocusedSituations = false;
	}

	function submitAnswer() {
		if (currentAnswer.trim()) {
			gameActions.answerQuestion(currentAnswer);
			currentAnswer = '';
		}
	}

	function handleTenCard() {
		// For ten cards, advance to next cycle
		const gapValue = Math.floor(Math.random() * 6) + 1;
		gameActions.advanceCycle(gameData.timeline.unit, gapValue);

		// Check if game should end (4th ten card)
		if (gameData.tenCount >= 4) {
			goto('/games/the-ground-itself/ending');
		} else {
			goto('/games/the-ground-itself/cycle-end');
		}
	}

	function chooseFocusedSituation(situation) {
		// Handle focused situations
		const situationResponses = {
			'tell_story': 'You tell a captivating story about your place...',
			'throw_party': 'A celebration begins in your place...',
			'discover': 'You make an important discovery...',
			'omen': 'You witness a significant omen...',
			'leave_frame': 'You glimpse beyond your place...',
			'move_on': 'You let this moment pass...'
		};

		gameActions.answerQuestion(situationResponses[situation] || 'You choose to focus on this moment...');
		showFocusedSituations = false;
	}

	// Auto-draw first card when component mounts
	$effect(() => {
		if (!gameData.currentCard && gameData.cycle === 1) {
			drawCard();
		}
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

	* {
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.game-layout {
		display: grid;
		grid-template-columns: 300px 1fr;
		min-height: 100vh;
		background: linear-gradient(135deg, var(--c-cream) 0%, var(--c-stardust) 100%);
	}

	.main-content {
		padding: var(--space-xl);
		overflow-y: auto;
	}

	.game-card {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(168, 197, 184, 0.3);
		border-radius: var(--space-md);
		padding: var(--space-lg);
		box-shadow: 0 8px 25px rgba(74, 124, 89, 0.1);
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
	}

	.game-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 35px rgba(74, 124, 89, 0.15);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: var(--space-md);
	}

	.card-title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 500;
		color: var(--c-green);
		line-height: 1.25;
	}

	.focused-btn {
		padding: var(--space-xs) var(--space-sm);
		background: linear-gradient(135deg, var(--c-mint) 0%, var(--c-stardust) 100%);
		color: var(--c-charcoal);
		border: none;
		border-radius: var(--space-xs);
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.focused-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(168, 197, 184, 0.3);
	}

	.question-text {
		color: var(--c-charcoal);
		font-weight: 300;
		line-height: 1.6;
		margin-bottom: var(--space-lg);
	}

	.ten-warning {
		background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
		border: 1px solid rgba(255, 193, 7, 0.3);
		border-radius: var(--space-sm);
		padding: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.ten-warning p {
		color: #856404;
		font-weight: 400;
		margin: 0;
	}

	.form-textarea {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid rgba(168, 197, 184, 0.3);
		border-radius: var(--space-xs);
		font-family: var(--font-sans);
		font-weight: 300;
		color: var(--c-charcoal);
		background-color: var(--c-cream);
		transition: all 0.3s ease;
		resize: vertical;
		min-height: 120px;
	}

	.form-textarea:focus {
		outline: none;
		border-color: var(--c-green);
		box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
	}

	.btn-submit {
		padding: var(--space-sm) var(--space-lg);
		background: linear-gradient(135deg, var(--c-green) 0%, var(--c-cosmic) 100%);
		color: var(--c-cream);
		border: none;
		border-radius: var(--space-xs);
		font-family: var(--font-sans);
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(74, 124, 89, 0.3);
	}

	.btn-submit:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(74, 124, 89, 0.4);
	}

	.btn-submit:disabled {
		background: rgba(168, 197, 184, 0.3);
		color: rgba(58, 50, 50, 0.6);
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.btn-advance {
		padding: var(--space-md) var(--space-xl);
		background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
		color: white;
		border: none;
		border-radius: var(--space-xs);
		font-family: var(--font-sans);
		font-size: 1.1rem;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
	}

	.btn-advance:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
	}

	.draw-card-section {
		text-align: center;
		padding: var(--space-xl);
	}

	.draw-title {
		font-family: var(--font-serif);
		font-size: 1.75rem;
		font-weight: 500;
		color: var(--c-green);
		margin-bottom: var(--space-md);
		line-height: 1.25;
	}

	.draw-description {
		color: var(--c-charcoal);
		font-weight: 300;
		line-height: 1.6;
		margin-bottom: var(--space-xl);
	}

	.btn-draw {
		padding: var(--space-lg) var(--space-xl);
		background: linear-gradient(135deg, var(--c-green) 0%, var(--c-cosmic) 100%);
		color: var(--c-cream);
		border: none;
		border-radius: var(--space-sm);
		font-family: var(--font-sans);
		font-size: 1.25rem;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 6px 20px rgba(74, 124, 89, 0.3);
	}

	.btn-draw:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 30px rgba(74, 124, 89, 0.4);
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: rgba(255, 255, 255, 0.95);
		border-radius: var(--space-md);
		padding: var(--space-xl);
		max-width: 500px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		box-shadow: 0 20px 40px rgba(74, 124, 89, 0.2);
	}

	.modal-title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 500;
		color: var(--c-green);
		margin-bottom: var(--space-lg);
		text-align: center;
	}

	.focused-option {
		display: block;
		width: 100%;
		padding: var(--space-md);
		margin-bottom: var(--space-sm);
		background: var(--c-cream);
		border: 1px solid rgba(168, 197, 184, 0.3);
		border-radius: var(--space-sm);
		text-align: left;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.focused-option:hover {
		background: var(--c-mint);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(168, 197, 184, 0.2);
	}

	.focused-option strong {
		color: var(--c-charcoal);
		font-weight: 500;
		display: block;
		margin-bottom: var(--space-xs);
	}

	.focused-option small {
		color: rgba(58, 50, 50, 0.7);
		font-size: 0.875rem;
	}

	.btn-cancel {
		display: block;
		margin: var(--space-lg) auto 0;
		padding: var(--space-sm) var(--space-lg);
		border: 1px solid rgba(168, 197, 184, 0.3);
		background: transparent;
		color: var(--c-charcoal);
		border-radius: var(--space-xs);
		font-family: var(--font-sans);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-cancel:hover {
		background: rgba(168, 197, 184, 0.1);
	}
</style>

<div class="game-layout">
	<!-- Time Viewport Sidebar -->
	<TimeViewport />

	<!-- Main Game Content -->
	<main class="main-content">
		<!-- Current Card and Question -->
		{#if gameData.currentCard}
			<div class="game-card">
				<div class="card-header">
					<div>
						<h2 class="card-title">
							{gameData.currentCard.value.toUpperCase()} of {gameData.currentCard.suit.toUpperCase()}
						</h2>
						{#if gameData.currentCard.value === '10'}
							<div class="ten-warning">
								<p>This will advance time!</p>
							</div>
						{/if}
					</div>
					<button
						onclick={() => showFocusedSituations = !showFocusedSituations}
						class="focused-btn"
					>
						Focused Action
					</button>
				</div>

				<p class="question-text">{gameData.currentQuestion}</p>

				<!-- Answer Input -->
				{#if gameData.currentCard.value !== '10'}
					<textarea
						bind:value={currentAnswer}
						rows="6"
						placeholder="Your answer..."
						class="form-textarea"
					></textarea>

					<div class="text-right" style="margin-top: var(--space-md);">
						<button
							onclick={submitAnswer}
							disabled={!currentAnswer.trim()}
							class="btn-submit"
						>
							Submit Answer
						</button>
					</div>
				{:else}
					<div class="text-center">
						<p class="question-text">
							Drawing a 10 advances time. This will move {gameData.timeline.unitValue} {gameData.timeline.unit} into the future.
						</p>
						<button
							onclick={handleTenCard}
							class="btn-advance"
						>
							Advance Time
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Draw Card Button -->
			<div class="draw-card-section">
				<h2 class="draw-title">Ready for the Next Moment?</h2>
				<p class="draw-description">
					Draw a card to continue building the story of your place.
				</p>
				<button
					onclick={drawCard}
					class="btn-draw"
				>
					Draw Card
				</button>
			</div>
		{/if}

		<!-- Focused Situations Modal -->
		{#if showFocusedSituations}
			<div class="modal-overlay" onclick={() => showFocusedSituations = false}>
				<div class="modal-content" onclick={(e) => e.stopPropagation()}>
					<h3 class="modal-title">Choose a Focused Situation</h3>
					<div>
						<button
							onclick={() => chooseFocusedSituation('tell_story')}
							class="focused-option"
						>
							<strong>Tell a Story</strong><br>
							<small>Adopt a storytelling character and narrate</small>
						</button>

						<button
							onclick={() => chooseFocusedSituation('throw_party')}
							class="focused-option"
						>
							<strong>Throw a Party</strong><br>
							<small>Describe and roleplay a celebration</small>
						</button>

						<button
							onclick={() => chooseFocusedSituation('discover')}
							class="focused-option"
						>
							<strong>Discover Something</strong><br>
							<small>Name a fact that enters the world</small>
						</button>

						<button
							onclick={() => chooseFocusedSituation('omen')}
							class="focused-option"
						>
							<strong>See an Omen</strong><br>
							<small>Gesture at a future possibility</small>
						</button>

						<button
							onclick={() => chooseFocusedSituation('leave_frame')}
							class="focused-option"
						>
							<strong>Leave the Frame</strong><br>
							<small>Glance beyond your established place</small>
						</button>

						<button
							onclick={() => chooseFocusedSituation('move_on')}
							class="focused-option"
						>
							<strong>Move On</strong><br>
							<small>Skip this turn</small>
						</button>
					</div>

					<button
						onclick={() => showFocusedSituations = false}
						class="btn-cancel"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}
	</main>
</div>

<Footer />
