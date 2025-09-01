<script>
	import { gameStore, gameActions } from '../lib/gameStore.js';

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
			// Game ends
			return;
		}
	}

	function chooseFocusedSituation(situation) {
		// Handle focused situations (simplified for now)
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

<div class="space-y-6">
	<!-- Game Status -->
	<div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
		<div class="flex justify-between items-center">
			<div>
				<h3 class="text-lg font-semibold text-blue-400">{gameData.place.name || 'Your Place'}</h3>
				<p class="text-sm text-slate-400">Cycle {gameData.cycle} • Ten cards drawn: {gameData.tenCount}/4</p>
			</div>
			<div class="text-right">
				<p class="text-sm text-slate-400">Timeline: {gameData.timeline.unit} ({gameData.timeline.unitValue} unit gaps)</p>
			</div>
		</div>
	</div>

	<!-- Current Card and Question -->
	{#if gameData.currentCard}
		<div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
			<div class="flex justify-between items-start mb-4">
				<div>
					<h3 class="text-xl font-semibold text-green-400">
						{gameData.currentCard.value.toUpperCase()} of {gameData.currentCard.suit.toUpperCase()}
					</h3>
					{#if gameData.currentCard.value === '10'}
						<p class="text-sm text-yellow-400 mt-1">This will advance time!</p>
					{/if}
				</div>
				<div class="text-right">
					<button
						onclick={() => showFocusedSituations = !showFocusedSituations}
						class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
					>
						Focused Action
					</button>
				</div>
			</div>

			<p class="text-slate-300 mb-4">{gameData.currentQuestion}</p>

			<!-- Answer Input -->
			{#if gameData.currentCard.value !== '10'}
				<textarea
					bind:value={currentAnswer}
					rows="4"
					placeholder="Your answer..."
					class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-green-500 focus:outline-none mb-4"
				></textarea>

				<div class="flex justify-end">
					<button
						onclick={submitAnswer}
						disabled={!currentAnswer.trim()}
						class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors"
					>
						Submit Answer
					</button>
				</div>
			{:else}
				<div class="bg-yellow-900/50 rounded p-4 border border-yellow-700 mb-4">
					<p class="text-yellow-200 text-sm">
						Drawing a 10 advances time. This will move {gameData.timeline.unitValue} {gameData.timeline.unit} into the future.
					</p>
				</div>

				<div class="flex justify-end">
					<button
						onclick={handleTenCard}
						class="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
					>
						Advance Time
					</button>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Draw Card Button -->
		<div class="bg-slate-800/50 rounded-lg p-6 border border-slate-700 text-center">
			<h3 class="text-xl font-semibold text-blue-400 mb-4">Ready for the Next Moment?</h3>
			<p class="text-slate-300 mb-6">Draw a card to continue building the story of your place.</p>
			<button
				onclick={drawCard}
				class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-lg font-semibold"
			>
				Draw Card
			</button>
		</div>
	{/if}

	<!-- Focused Situations Modal -->
	{#if showFocusedSituations}
		<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div class="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
				<h3 class="text-xl font-semibold text-purple-400 mb-4">Choose a Focused Situation</h3>
				<div class="space-y-3">
					<button
						onclick={() => chooseFocusedSituation('tell_story')}
						class="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
					>
						<strong>Tell a Story</strong><br>
						<small class="text-slate-400">Adopt a storytelling character and narrate</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('throw_party')}
						class="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
					>
						<strong>Throw a Party</strong><br>
						<small class="text-slate-400">Describe and roleplay a celebration</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('discover')}
						class="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
					>
						<strong>Discover Something</strong><br>
						<small class="text-slate-400">Name a fact that enters the world</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('omen')}
						class="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
					>
						<strong>See an Omen</strong><br>
						<small class="text-slate-400">Gesture at a future possibility</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('leave_frame')}
						class="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
					>
						<strong>Leave the Frame</strong><br>
						<small class="text-slate-400">Glance beyond your established place</small>
					</button>

					<button
						onclick={() => chooseFocusedSituation('move_on')}
						class="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
					>
						<strong>Move On</strong><br>
						<small class="text-slate-400">Skip this turn</small>
					</button>
				</div>

				<div class="mt-4 text-center">
					<button
						onclick={() => showFocusedSituations = false}
						class="px-4 py-2 border border-slate-600 text-slate-300 rounded hover:bg-slate-700 transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Recent Answers -->
	{#if gameData.playerAnswers.length > 0}
		<div class="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
			<h4 class="text-lg font-semibold text-slate-300 mb-3">Recent Answers</h4>
			<div class="space-y-2 max-h-40 overflow-y-auto">
				{#each gameData.playerAnswers.slice(-3) as answer}
					<div class="bg-slate-700/50 rounded p-3">
						<p class="text-sm text-slate-400 mb-1">
							{answer.card.value} of {answer.card.suit} • {new Date(answer.timestamp).toLocaleTimeString()}
						</p>
						<p class="text-slate-300 text-sm">{answer.answer}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Game End Check -->
	{#if gameData.tenCount >= 4}
		<div class="bg-red-900/50 rounded-lg p-6 border border-red-700 text-center">
			<h3 class="text-xl font-semibold text-red-400 mb-4">The Story Reaches Its End</h3>
			<p class="text-slate-300 mb-6">
				You have drawn the fourth ten card. The window into your place begins to fog, and the clarity of vision you had fades.
			</p>
			<p class="text-slate-300 mb-6">
				What happens tomorrow in your place? Who wakes up? What do they see, and what feeling does it give them?
			</p>
			<button
				onclick={() => window.location.reload()}
				class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded transition-colors"
			>
				Start New Story
			</button>
		</div>
	{/if}
</div>
