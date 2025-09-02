<script>
	let { currentSection, placeName, placeDescription, onNextSection } = $props();
</script>

{#if currentSection === 'setting'}
	<div class="setup-card">
		<h2 class="text-2xl mb-6" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Our Setting</h2>

		<div class="space-y-4">
			<div>
				<label for="placeName" class="form-label">Place Name</label>
				<input
					id="placeName"
					bind:value={placeName}
					type="text"
					placeholder="e.g., The Forgotten Valley, Crystal City, Ancient Oak Grove"
					class="form-input"
				/>
			</div>

			<div>
				<label for="placeDescription" class="form-label">Place Description</label>
				<textarea
					id="placeDescription"
					bind:value={placeDescription}
					rows="3"
					placeholder="Describe your place in a few sentences..."
					class="form-input"
				></textarea>
			</div>
		</div>

		<div class="text-right mt-6">
			<button
				onclick={onNextSection}
				disabled={!placeName || !placeDescription}
				class="btn-primary"
			>
				Continue to Timeline
			</button>
		</div>
	</div>
{/if}
