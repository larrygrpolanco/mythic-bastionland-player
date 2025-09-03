<script>
	/**
	 * TIME GAP COMPONENT
	 * 
	 * This component handles when a "10" card is drawn, triggering time gaps.
	 * Following the original rules exactly:
	 * 1. Roll dice for time jump duration
	 * 2. Choose direction (forward/backward)
	 * 3. Answer the three time gap questions
	 * 4. Generate dramatic transition image
	 * 5. Move to next cycle or end game
	 * 
	 * Uses existing services and follows clean architecture.
	 */
	
	import { gameState } from '../../stores.js';
	import { timeGapQuestions } from '../../data.js';
	import { rollD6 } from '../../logic/dice.js';
	import { generateTimeGapImage } from '../../logic/imageService.js';

	let timeJumpAmount = rollD6(); // Auto-roll when component loads
	let timeJumpDirection = 'forward';
	let timeGapAnswers = ['', '', ''];
	let currentStep = 'rollTime'; // rollTime, answerGaps, complete
	let isSubmitting = false;

	// Get current game state info
	$: currentCycle = $gameState.currentCycle;
	$: tensDrawn = $gameState.tensDrawn;
	$: timelineUnit = $gameState.timelineUnit;
	$: isLastTen = tensDrawn >= 4;

	/**
	 * Handle choosing time direction and moving to gap questions
	 */
	function handleTimeDirection(direction) {
		timeJumpDirection = direction;
		currentStep = 'answerGaps';
	}

	/**
	 * Handle submitting all time gap answers
	 */
	async function handleSubmitTimeGap() {
		if (timeGapAnswers.some(answer => !answer.trim()) || isSubmitting) return;

		try {
			isSubmitting = true;

			// Save time gap answers
			timeGapAnswers.forEach((answer, index) => {
				const gapAnswerKey = `timegap_${tensDrawn}_${index + 1}`;
				gameState.update(state => ({
					...state,
					answers: {
						...state.answers,
						[gapAnswerKey]: answer.trim()
					}
				}));
			});

			// Generate dramatic time gap image
			const timeGapInfo = {
				timeAmount: timeJumpAmount,
				timeUnit: timelineUnit,
				direction: timeJumpDirection
			};
			
			await generateTimeGapImage(timeGapInfo, timeGapAnswers);

			// Check if this was the 4th ten (game end)
			if (isLastTen) {
				gameState.update(state => ({
					...state,
					currentPhase: 'end'
				}));
			} else {
				// Move to next cycle
				gameState.update(state => ({
					...state,
					currentCycle: state.currentCycle + 1,
					currentPhase: 'mainPlay',
					turnState: 'drawing'
				}));
			}

			currentStep = 'complete';

		} catch (error) {
			console.error('Error submitting time gap:', error);
		} finally {
			isSubmitting = false;
		}
	}

	/**
	 * Get time unit display text
	 */
	function getTimeUnitText(amount, unit) {
		if (amount === 1) {
			// Singular forms
			const singular = {
				'days': 'day',
				'weeks': 'week',
				'years': 'year',
				'decades': 'decade',
				'centuries': 'century',
				'millennia': 'millennium'
			};
			return singular[unit] || unit;
		}
		return unit;
	}
</script>

<div class="time-gap-container">
	<div class="time-gap-content">
		<h2>Time Advances</h2>
		
		<div class="gap-info">
			<p class="gap-description">
				You drew a <strong>10</strong> - the {tensDrawn}{tensDrawn === 1 ? 'st' : tensDrawn === 2 ? 'nd' : tensDrawn === 3 ? 'rd' : 'th'} one. 
				{#if isLastTen}
					This is the final time gap. After this, your story will conclude.
				{:else}
					Time will advance, and your place will change. This will begin cycle {currentCycle + 1}.
				{/if}
			</p>
		</div>

		{#if currentStep === 'rollTime'}
			<div class="time-roll-section">
				<h3>Time Advances</h3>
				<div class="roll-result">
					<p class="roll-text">
						You rolled a <strong>{timeJumpAmount}</strong>!
					</p>
					<p class="time-description">
						Time will advance by <strong>{timeJumpAmount} {getTimeUnitText(timeJumpAmount, timelineUnit)}</strong>.
					</p>
				</div>

				<div class="direction-choice">
					<h4>Choose Direction:</h4>
					<div class="direction-buttons">
						<button 
							on:click={() => handleTimeDirection('forward')}
							class="direction-button"
						>
							<strong>Forward in Time</strong>
							<span>Move {timeJumpAmount} {getTimeUnitText(timeJumpAmount, timelineUnit)} into the future</span>
						</button>
						<button 
							on:click={() => handleTimeDirection('backward')}
							class="direction-button"
						>
							<strong>Backward in Time</strong>
							<span>Move {timeJumpAmount} {getTimeUnitText(timeJumpAmount, timelineUnit)} into the past</span>
						</button>
					</div>
				</div>
			</div>

		{:else if currentStep === 'answerGaps'}
			<div class="gap-questions-section">
				<h3>Time Gap Questions</h3>
				<div class="time-context">
					<p>
						<strong>{timeJumpAmount} {getTimeUnitText(timeJumpAmount, timelineUnit)}</strong> 
						{timeJumpDirection === 'forward' ? 'have passed' : 'ago'}.
						Answer these questions about your place:
					</p>
				</div>

				<div class="gap-questions">
					{#each timeGapQuestions as question, index}
						<div class="gap-question">
							<h4>{question}</h4>
							<textarea 
								bind:value={timeGapAnswers[index]}
								placeholder="Describe the changes..."
								rows="3"
								class="gap-answer-input"
								disabled={isSubmitting}
							></textarea>
						</div>
					{/each}
				</div>

				<button 
					on:click={handleSubmitTimeGap}
					class="final-submit-button"
					disabled={timeGapAnswers.some(answer => !answer.trim()) || isSubmitting}
				>
					{#if isSubmitting}
						<div class="spinner"></div>
						Evolving Through Time...
					{:else if isLastTen}
						Complete Final Time Gap
					{:else}
						Begin Cycle {currentCycle + 1}
					{/if}
				</button>
			</div>

		{:else if currentStep === 'complete'}
			<div class="completion-section">
				<h3>Time Has Advanced</h3>
				<p class="completion-text">
					{#if isLastTen}
						Your story approaches its conclusion. The final image of your place has been generated.
					{:else}
						Your place has changed through time. Cycle {currentCycle + 1} is ready to begin.
					{/if}
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.time-gap-container {
		max-width: 800px;
		margin: 0 auto;
	}

	.time-gap-content {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.time-gap-content h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #2d3748;
	}

	.gap-info {
		background: #fff5f5;
		border: 1px solid #fed7d7;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		border-left: 4px solid #e53e3e;
	}

	.gap-description {
		margin: 0;
		color: #742a2a;
		line-height: 1.6;
	}

	.time-roll-section {
		text-align: center;
	}

	.roll-result {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		margin-bottom: 2rem;
	}

	.roll-text {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.time-description {
		font-size: 1.1rem;
		color: #4a5568;
		margin: 0;
	}

	.direction-choice h4 {
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.direction-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.direction-button {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.direction-button:hover {
		border-color: #4299e1;
		box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
		background: #ebf8ff;
	}

	.direction-button strong {
		display: block;
		margin-bottom: 0.5rem;
		color: #2d3748;
	}

	.direction-button span {
		color: #718096;
		font-size: 0.9rem;
	}

	.gap-questions-section h3 {
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.time-context {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		margin-bottom: 2rem;
	}

	.time-context p {
		margin: 0;
		color: #2d3748;
		line-height: 1.6;
	}

	.gap-questions {
		margin-bottom: 2rem;
	}

	.gap-question {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		margin-bottom: 1rem;
	}

	.gap-question h4 {
		margin-top: 0;
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.gap-answer-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 4px;
		font-size: 1rem;
		line-height: 1.5;
		resize: vertical;
		margin-bottom: 1rem;
	}

	.gap-answer-input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
	}

	.final-submit-button {
		background: #e53e3e;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0 auto;
		min-width: 200px;
	}

	.final-submit-button:hover:not(:disabled) {
		background: #c53030;
	}

	.final-submit-button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.completion-section {
		text-align: center;
		background: white;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.completion-section h3 {
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.completion-text {
		color: #4a5568;
		line-height: 1.6;
		margin: 0;
	}

	@media (max-width: 768px) {
		.time-gap-content {
			padding: 1.5rem;
		}

		.direction-buttons {
			grid-template-columns: 1fr;
		}
	}
</style>
