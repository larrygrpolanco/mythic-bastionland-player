<script>
	let { currentSection, setupComplete } = $props();
</script>

<div class="progress-indicator mb-8">
	<div class="progress-step" class:active={currentSection === 'setting'}></div>
	<div class="progress-step" class:active={currentSection === 'timeline'}></div>
	<div class="progress-step" class:active={currentSection === 'establishing'}></div>
	<div class="progress-step" class:active={setupComplete}></div>
</div>
