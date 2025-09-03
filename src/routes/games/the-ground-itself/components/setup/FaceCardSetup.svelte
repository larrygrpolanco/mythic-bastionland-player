<script>
	import { gameState } from '../../stores.js';
	import { faceCardQuestions } from '../../data.js';
	import { createFaceCardDeck, drawCard } from '../../logic/deck.js';
	import { buildImagePrompt } from '../../logic/promptBuilder.js';

	let currentAnswer = '';
	let isSubmitting = false;

	// Initialize face card deck if not already done
	if ($gameState.faceCardDeck.length === 0) {
		gameState.update(state => ({
			...state,
			faceCardDeck: createFaceCardDeck(),
			faceCardIndex: 0,
			currentFaceCard: null
		}));
		
		// Set the first card
		const { card, remainingDeck } = drawCard($gameState.faceCardDeck);
		gameState.update(state => ({
			...state,
			currentFaceCard: card,
			faceCardDeck: remainingDeck
		}));
	}

	// Get current question text
	$: currentQuestion = $gameState.currentFaceCard ? 
		faceCardQuestions[$gameState.currentFaceCard.suit][$gameState.currentFaceCard.rank] : '';

	// Calculate progress
	$: progress = $gameState.faceCardIndex + 1;
	$: totalCards = 12;
	$: isLastCard = progress === totalCards;

	async function generateImage(prompt) {
		try {
			const response = await fetch('/games/the-ground-itself/api/generate-image', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: prompt,
					isDevelopmentMode: $gameState.isDevelopmentMode
				})
			});

			const result = await response.json();
			
			if (result.success) {
				gameState.update(state => ({
					...state,
					currentImageUrl: result.imageUrl,
					lastGeneratedPrompt: result.prompt,
					isGeneratingImage: false
				}));
			} else {
				console.error('Image generation failed:', result.error);
				gameState.update(state => ({
					...state,
					isGeneratingImage: false
				}));
			}
		} catch (error) {
			console.error('Error calling image API:', error);
			gameState.update(state => ({
				...state,
				isGeneratingImage: false
			}));
		}
	}

	async function submitAnswer() {
		if (!$gameState.currentFaceCard) return;

		isSubmitting = true;
		
		// Only store answer and generate image if there's actual content
		if (currentAnswer.trim()) {
			// Create unique key for this face card answer
			const answerKey = `setup_${$gameState.currentFaceCard.rank}_${$gameState.currentFaceCard.suit}`;
			
			// Store the answer
			gameState.update(state => ({
				...state,
				answers: {
					...state.answers,
					[answerKey]: currentAnswer.trim()
				},
				isGeneratingImage: true
			}));

			// Generate new image with updated world state
			const prompt = buildImagePrompt($gameState);
			await generateImage(prompt);
		}

		// Move to next card or complete setup (regardless of whether answer was provided)
		if (isLastCard) {
			// All face cards complete
			gameState.update(state => ({
				...state,
				faceCardsComplete: true,
				currentPhase: 'mainPlay'
			}));
		} else {
			// Draw next card
			const { card, remainingDeck } = drawCard($gameState.faceCardDeck);
			gameState.update(state => ({
				...state,
				currentFaceCard: card,
				faceCardDeck: remainingDeck,
				faceCardIndex: state.faceCardIndex + 1
			}));
		}

		// Reset form
		currentAnswer = '';
		isSubmitting = false;
	}

	function formatCardName(card) {
		if (!card) return '';
		const rank = card.rank.charAt(0).toUpperCase() + card.rank.slice(1);
		const suit = card.suit.charAt(0).toUpperCase() + card.suit.slice(1);
		return `${rank} of ${suit}`;
	}

	function getSuitSymbol(suit) {
		const symbols = {
			clubs: '♣',
			hearts: '♥',
			diamonds: '♦',
			spades: '♠'
		};
		return symbols[suit] || '';
	}

	function getSuitColor(suit) {
		return (suit === 'hearts' || suit === 'diamonds') ? '#dc2626' : '#1f2937';
	}
</script>

<div class="face-card-setup">
	<div class="progress-header">
		<h2>Establishing Your Place</h2>
		<div class="progress-bar">
			<div class="progress-fill" style="width: {(progress / totalCards) * 100}%"></div>
		</div>
		<p class="progress-text">Question {progress} of {totalCards}</p>
	</div>

	{#if $gameState.currentFaceCard}
		<div class="card-display">
			<div class="card" style="border-color: {getSuitColor($gameState.currentFaceCard.suit)}">
				<div class="card-header" style="color: {getSuitColor($gameState.currentFaceCard.suit)}">
					<span class="card-name">{formatCardName($gameState.currentFaceCard)}</span>
					<span class="suit-symbol">{getSuitSymbol($gameState.currentFaceCard.suit)}</span>
				</div>
			</div>
		</div>

		<div class="question-section">
			<div class="question-text">
				{currentQuestion}
			</div>

			<div class="answer-section">
				<textarea 
					bind:value={currentAnswer}
					placeholder="Describe this aspect of your place..."
					rows="4"
					class="answer-input"
					disabled={isSubmitting || $gameState.isGeneratingImage}
				></textarea>

				<button 
					on:click={submitAnswer} 
					class="submit-button"
					disabled={isSubmitting || $gameState.isGeneratingImage}
				>
					{#if isSubmitting || $gameState.isGeneratingImage}
						<div class="spinner"></div>
						{isLastCard ? 'Completing Your World...' : 'Evolving Your World...'}
					{:else}
						{isLastCard ? 'Complete World Setup' : 'Continue Building'}
					{/if}
				</button>
			</div>
		</div>

		<div class="help-text">
			<p><strong>Tip:</strong> Each answer will add new visual details to your world. Be descriptive and specific - these details will shape how your place looks and feels throughout the entire game.</p>
		</div>
	{/if}
</div>

<style>
	.face-card-setup {
		max-width: 600px;
		margin: 0 auto;
	}

	.progress-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.progress-header h2 {
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e2e8f0;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4299e1, #3182ce);
		transition: width 0.3s ease;
	}

	.progress-text {
		color: #718096;
		font-size: 0.9rem;
		margin: 0;
	}

	.card-display {
		display: flex;
		justify-content: center;
		margin-bottom: 2rem;
	}

	.card {
		width: 120px;
		height: 80px;
		background: white;
		border: 2px solid;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.card-header {
		text-align: center;
		font-weight: bold;
	}

	.card-name {
		display: block;
		font-size: 0.8rem;
		margin-bottom: 0.25rem;
	}

	.suit-symbol {
		font-size: 1.5rem;
	}

	.question-section {
		background: #f7fafc;
		padding: 2rem;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
		margin-bottom: 1.5rem;
	}

	.question-text {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #2d3748;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}

	.answer-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.answer-input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 4px;
		font-size: 1rem;
		line-height: 1.5;
		resize: vertical;
		min-height: 100px;
	}

	.answer-input:focus {
		outline: none;
		border-color: #4299e1;
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
	}

	.answer-input:disabled {
		background: #f7fafc;
		cursor: not-allowed;
	}

	.submit-button {
		background: #4299e1;
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 50px;
	}

	.submit-button:hover:not(:disabled) {
		background: #3182ce;
	}

	.submit-button:disabled {
		background: #a0aec0;
		cursor: not-allowed;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.help-text {
		background: #edf2f7;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid #4299e1;
	}

	.help-text p {
		margin: 0;
		color: #4a5568;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.face-card-setup {
			padding: 0 1rem;
		}

		.question-section {
			padding: 1.5rem;
		}
	}
</style>
