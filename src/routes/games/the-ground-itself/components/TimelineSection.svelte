<script>
	let { currentSection, timelineUnit, timelineValue, onNextSection, onBackToSetting } = $props();
</script>

{#if currentSection === 'timeline'}
	<div class="setup-card">
		<h2 class="text-2xl mb-6" style="font-family: var(--font-serif); font-weight: 500; color: var(--c-green); line-height: 1.25;">Our Timeline</h2>

		<div class="grid md:grid-cols-2 gap-4">
			<div>
				<label for="timelineUnit" class="form-label">Timeline Unit</label>
				<select
					id="timelineUnit"
					bind:value={timelineUnit}
					class="form-input"
				>
					<option value="">Select unit...</option>
					<option value="days">Days</option>
					<option value="weeks">Weeks</option>
					<option value="years">Years</option>
					<option value="decades">Decades</option>
					<option value="centuries">Centuries</option>
					<option value="millennia">Millennia</option>
				</select>
			</div>

			<div>
				<label for="timelineValue" class="form-label">Gap Length</label>
				<input
					id="timelineValue"
					bind:value={timelineValue}
					type="number"
					min="1"
					max="6"
					class="form-input"
				/>
			</div>
		</div>

		<div class="flex justify-between mt-6">
			<button
				onclick={onBackToSetting}
				class="btn-secondary"
			>
				Back to Setting
			</button>

			<button
				onclick={onNextSection}
				disabled={!timelineUnit}
				class="btn-primary"
			>
				Continue to Establishing
			</button>
		</div>
	</div>
{/if}
