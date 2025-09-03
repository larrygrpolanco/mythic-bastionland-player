<script>
	/**
	 * MAIN PLAY PAGE - PHASE 2 IMPLEMENTATION
	 *
	 * This component handles the main gameplay loop where players:
	 * 1. Draw numerical cards (Ace through 9, and 10s for time gaps)
	 * 2. Answer questions or choose focused situations
	 * 3. See their world evolve through 4 cycles
	 *
	 * Following clean architecture - UI only, uses service abstractions
	 */

	import { gameState } from '../stores.js';
	import { goto } from '$app/navigation';
	import DrawCardPrompt from '../components/play/DrawCardPrompt.svelte';
	import TurnDecision from '../components/play/TurnDecision.svelte';
	import AnswerInput from '../components/play/AnswerInput.svelte';
	import FocusedSituationMenu from '../components/play/FocusedSituationMenu.svelte';
	import TimeGap from '../components/play/TimeGap.svelte';

	// Reactive state for UI rendering
	$: currentTurnState = $gameState.turnState;
	$: currentCycle = $gameState.currentCycle;
	$: currentPhase = $gameState.currentPhase;
	$: timelineUnit = $gameState.timelineUnit;
	$: timelineRoll = $gameState.timelineRoll;
	$: timelineDescription = $gameState.timelineDescription;

	// Handle navigation to end page when game ends
	$: if (currentPhase === 'end') {
		goto('/games/the-ground-itself/end');
	}

	// Debug timeline data
	$: if ($gameState.isDevelopmentMode) {
		console.log('Play page timeline data:', {
			timelineUnit: $gameState.timelineUnit,
			timelineRoll: $gameState.timelineRoll,
			timelineDescription: $gameState.timelineDescription,
			fullGameState: $gameState
		});
	}
</script>

<div class="main-play-container">
	<!-- Persistent Image Display -->
	<div class="image-section">
		{#if $gameState.isGeneratingImage}
			<div class="loading-placeholder">
				<div class="spinner"></div>
				<p>Your world evolves...</p>
			</div>
		{:else}
			<img src={$gameState.currentImageUrl} alt="Your evolving place" class="world-image" />
		{/if}

		{#if $gameState.isDevelopmentMode && $gameState.lastGeneratedPrompt}
			<div class="debug-info">
				<strong>Last Prompt:</strong>
				{$gameState.lastGeneratedPrompt}
			</div>
		{/if}
	</div>

	<!-- Dynamic Content Area -->
	<div class="content-section">
		<div class="game-header">
			<h1>The Ground Itself</h1>
			<div class="game-status">
				<span class="cycle-info">Cycle {currentCycle} of 4</span>
				{#if timelineUnit}
					<span
						class="timeline-info"
						title={timelineDescription || 'Time gaps measured in ' + timelineUnit}
					>
						🎲 {timelineRoll ? timelineRoll + ': ' : ''}{timelineUnit}
					</span>
				{:else}
					<span
						class="timeline-info timeline-missing"
						title="Timeline not set - this may indicate a setup issue"
					>
						⚠️ Timeline not set
					</span>
				{/if}
			</div>

			{#if $gameState.isDevelopmentMode && timelineDescription}
				<div class="timeline-debug">
					<strong>Timeline:</strong>
					{timelineDescription}
				</div>
			{/if}
		</div>

		<!-- Render different components based on phase and turn state -->
		{#if currentPhase === 'timeGap'}
			<TimeGap />
		{:else if currentTurnState === 'drawing'}
			<DrawCardPrompt />
		{:else if currentTurnState === 'deciding'}
			<TurnDecision />
		{:else if currentTurnState === 'answering'}
			<AnswerInput />
		{:else if currentTurnState === 'focusedSituation'}
			<FocusedSituationMenu />
		{:else}
			<div class="error-state">
				<p>Unknown game state: {currentTurnState} (Phase: {currentPhase})</p>
				<p>This shouldn't happen. Check the console for errors.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.main-play-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
	}

	.image-section {
		position: sticky;
		top: 2rem;
		height: fit-content;
	}

	.world-image {
		width: 100%;
		height: 400px;
		object-fit: cover;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.loading-placeholder {
		width: 100%;
		height: 400px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-top: 4px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.debug-info {
		margin-top: 1rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 4px;
		font-size: 0.9rem;
		border-left: 4px solid #007bff;
		white-space: pre-wrap;
	}

	.content-section {
		overflow-y: auto;
	}

	.game-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.game-header h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: #2d3748;
	}

	.game-status {
		display: flex;
		justify-content: center;
		gap: 2rem;
		font-size: 0.9rem;
		color: #718096;
	}

	.cycle-info,
	.timeline-info {
		padding: 0.25rem 0.75rem;
		background: #edf2f7;
		border-radius: 4px;
		cursor: help;
	}

	.timeline-info {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.timeline-missing {
		background: #fed7d7 !important;
		color: #742a2a !important;
		border: 1px solid #fc8181;
	}

	.timeline-debug {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: #f0fff4;
		border-radius: 4px;
		font-size: 0.8rem;
		color: #2f855a;
		border-left: 3px solid #48bb78;
	}

	.error-state {
		background: #fed7d7;
		border: 1px solid #fc8181;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		color: #742a2a;
	}

	@media (max-width: 768px) {
		.main-play-container {
			grid-template-columns: 1fr;
			gap: 1rem;
			padding: 1rem;
		}

		.image-section {
			position: relative;
			top: 0;
		}

		.game-status {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
