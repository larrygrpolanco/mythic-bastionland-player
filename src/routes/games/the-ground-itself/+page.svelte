<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Redirect to introduction page
		goto('/games/the-ground-itself/introduction');
	});
</script>

<!-- Loading state while redirecting -->
<div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #F4F0E9 0%, #A8C5B8 100%);">
	<div style="text-align: center; color: #3A3232; font-family: 'Inter', sans-serif;">
		<div style="font-size: 1.5rem; margin-bottom: 1rem;">Loading The Ground Itself...</div>
		<div style="width: 40px; height: 40px; border: 3px solid #4A7C59; border-top: 3px solid transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
	</div>
</div>

<style>
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>
