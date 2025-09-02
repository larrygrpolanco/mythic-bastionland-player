<script>
	let { showGuidance, currentSection, sectionGuidance, setupComplete } = $props();

	let guidanceText = $state('');
	let isTyping = $state(false);
	let timeoutId = $state(null);

	function typeText(text) {
		if (timeoutId) clearTimeout(timeoutId);
		guidanceText = '';
		isTyping = true;
		let index = 0;

		function type() {
			if (index < text.length) {
				guidanceText += text[index];
				index++;
				timeoutId = setTimeout(type, 25);
			} else {
				isTyping = false;
			}
		}
		type();
	}

	$effect(() => {
		if (showGuidance && !setupComplete) {
			typeText(sectionGuidance[currentSection]);
		}
	});
</script>

{#if showGuidance && !setupComplete}
	<div class="guidance-card mb-8">
		<div class="guidance-text">
			{guidanceText}
			{#if isTyping}
				<span class="cursor"></span>
			{/if}
		</div>
	</div>
{/if}
