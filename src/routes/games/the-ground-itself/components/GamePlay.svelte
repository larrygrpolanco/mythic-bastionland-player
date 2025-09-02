<script>
	// Gutted functionality - UI structure preserved
</script>

<div class="space-y-6">
	<!-- Image Display with Crossfade -->
	<div class="relative h-64 overflow-hidden rounded-lg border border-slate-600 md:h-80">
		<!-- Current Image -->
		<img
			src="/placeholder-image.jpg"
			alt="Your place evolving over time"
			class="h-full w-full object-cover"
		/>

		<!-- Image Overlay -->
		<div
			class="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4"
		>
			<p class="text-sm text-white">Your place evolves with each story told...</p>
		</div>
	</div>

	<!-- Current Card and Question -->
	<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
		<div class="mb-4 flex items-start justify-between">
			<div>
				<h3 class="text-xl font-semibold text-green-400">
					CARD PLACE HOLDER
				</h3>
				<p class="mt-1 text-sm text-yellow-400">This will advance time!</p>
			</div>
			<div class="text-right">
				<button
					class="rounded bg-purple-600 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-700"
				>
					Focused Action
				</button>
			</div>
		</div>

		<p class="mb-4 text-slate-300">What significant event occurs in your place during this moment?</p>

		<!-- Answer Input -->
		<div class="mb-4 rounded border border-yellow-700 bg-yellow-900/50 p-4">
			<p class="text-sm text-yellow-200">
				Drawing a 10 advances time. This will move 3 years into the future.
			</p>
		</div>

		<div class="flex justify-end">
			<button
				class="rounded bg-yellow-600 px-6 py-2 text-white transition-colors hover:bg-yellow-700"
			>
				Advance Time
			</button>
		</div>
	</div>

	<!-- Focused Situations Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6">
			<h3 class="mb-4 text-xl font-semibold text-purple-400">Choose a Focused Situation</h3>
			<div class="space-y-3">
				<button
					class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
				>
					<strong>Tell a Story</strong><br />
					<small class="text-slate-400">Adopt a storytelling character and narrate</small>
				</button>

				<button
					class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
				>
					<strong>Throw a Party</strong><br />
					<small class="text-slate-400">Describe and roleplay a celebration</small>
				</button>

				<button
					class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
				>
					<strong>Discover Something</strong><br />
					<small class="text-slate-400">Name a fact that enters the world</small>
				</button>

				<button
					class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
				>
					<strong>See an Omen</strong><br />
					<small class="text-slate-400">Gesture at a future possibility</small>
				</button>

				<button
					class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
				>
					<strong>Leave the Frame</strong><br />
					<small class="text-slate-400">Glance beyond your established place</small>
				</button>

				<button
					class="w-full rounded bg-slate-700 p-3 text-left transition-colors hover:bg-slate-600"
				>
					<strong>Move On</strong><br />
					<small class="text-slate-400">Skip this turn</small>
				</button>
			</div>

			<div class="mt-4 text-center">
				<button
					class="rounded border border-slate-600 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-700"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>

  <!-- Game Status -->
	<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
		<div class="flex items-center justify-between">
			<div>
				<h3 class="text-lg font-semibold text-blue-400">The Ancient Oak Grove</h3>
				<p class="text-sm text-slate-400">
					Cycle 2 • Ten cards drawn: 1/4
				</p>
			</div>
			<div class="text-right">
				<p class="text-sm text-slate-400">
					Timeline: years (3 unit gaps)
				</p>
				<button
					class="mt-1 text-xs text-green-400 hover:text-green-300 underline"
				>
					View Cycle Details
				</button>
			</div>
		</div>
	</div>

<!-- Guidance Toggle -->
	<div class="flex items-center justify-between">
		<div class="text-sm text-slate-400">
			Tip: Consider how the passage of time affects your place and its inhabitants.
		</div>
		<button
			class="rounded bg-slate-700 px-3 py-1 text-sm text-slate-300 transition-colors hover:bg-slate-600"
		>
			Hide Help
		</button>
	</div>

	<!-- Game Guidance -->
	<div class="rounded-lg border border-slate-600 bg-slate-800/30 p-4">
		<h4 class="text-md mb-2 font-semibold text-green-400">How to Play</h4>
		<ul class="space-y-1 text-sm text-slate-300">
			<li class="flex items-start">
				<span class="mr-2 text-green-400">•</span>
				<span>Draw cards to generate questions about your place</span>
			</li>
			<li class="flex items-start">
				<span class="mr-2 text-green-400">•</span>
				<span>Answer each question to build the story collaboratively</span>
			</li>
			<li class="flex items-start">
				<span class="mr-2 text-green-400">•</span>
				<span>Use focused actions for more detailed exploration</span>
			</li>
			<li class="flex items-start">
				<span class="mr-2 text-green-400">•</span>
				<span>Draw ten cards to advance the timeline</span>
			</li>
		</ul>

		<div class="mt-3 rounded border border-yellow-700 bg-yellow-900/30 p-3">
			<h5 class="mb-1 text-sm font-semibold text-yellow-400">Cycle Change!</h5>
			<p class="text-xs text-yellow-200">When you draw a ten card, you'll need to describe how time has changed your place.</p>
		</div>
	</div>

	<!-- Recent Answers -->
	<div class="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
		<h4 class="mb-3 text-lg font-semibold text-slate-300">Recent Answers</h4>
		<div class="max-h-40 space-y-2 overflow-y-auto">
			<div class="rounded bg-slate-700/50 p-3">
				<p class="mb-1 text-sm text-slate-400">
					KING of HEARTS • 3:41 PM
				</p>
				<p class="text-sm text-slate-300">The ancient oak tree grows taller and its roots spread deeper into the earth.</p>
			</div>
			<div class="rounded bg-slate-700/50 p-3">
				<p class="mb-1 text-sm text-slate-400">
					SEVEN of DIAMONDS • 3:38 PM
				</p>
				<p class="text-sm text-slate-300">A family of deer makes their home in the grove, creating small paths through the undergrowth.</p>
			</div>
		</div>
	</div>

	<!-- Game End Check -->
	<div class="rounded-lg border border-red-700 bg-red-900/50 p-6 text-center">
		<h3 class="mb-4 text-xl font-semibold text-red-400">The Story Reaches Its End</h3>
		<p class="mb-6 text-slate-300">
			You have drawn the fourth ten card. The window into your place begins to fog, and the
			clarity of vision you had fades.
		</p>
		<p class="mb-6 text-slate-300">
			What happens tomorrow in your place? Who wakes up? What do they see, and what feeling does
			it give them?
		</p>
		<button
			class="rounded bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700"
		>
			Start New Story
		</button>
	</div>
</div>
