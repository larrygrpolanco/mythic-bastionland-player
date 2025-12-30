<script>
	import { writable } from 'svelte/store';
	import Tabs from './Tabs.svelte';

	// Import app components
	import Email from '../apps/Email.svelte';
	import Chat from '../apps/Chat.svelte';
	import News from '../apps/News.svelte';
	import Monsterpedia from '../apps/Monsterpedia.svelte';
	import NYCMap from '../apps/NYCMap.svelte';

	// Props for mock data
	export let emails = [];
	export let chats = [];
	export let news = [];
	export let monsters = [];
	export let mapData = {};

	// Active tab state
	const activeTab = writable('Email');

	// Tab definitions with notifications
	const tabs = [
		{ id: 'Email', label: 'Email', notification: false },
		{ id: 'Chat', label: 'Chat', notification: true },
		{ id: 'News', label: 'News', notification: false },
		{ id: 'Monsterpedia', label: 'Monsterpedia', notification: false },
		{ id: 'Map', label: 'NYC Map', notification: false }
	];

	// Function to handle tab changes
	function handleTabChange(event) {
		activeTab.set(event.detail);
	}
</script>

<div class="app-container">
	<Tabs {tabs} activeTab={$activeTab} on:tabChange={handleTabChange} />

	<div class="content-area">
		{#if $activeTab === 'Email'}
			<Email {emails} />
		{:else if $activeTab === 'Chat'}
			<Chat {chats} />
		{:else if $activeTab === 'News'}
			<News articles={news} />
		{:else if $activeTab === 'Monsterpedia'}
			<Monsterpedia {monsters} />
		{:else if $activeTab === 'Map'}
			<NYCMap {mapData} />
		{/if}
	</div>
</div>

<style>
	.app-container {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.content-area {
		flex: 1;
		padding: 16px;
	}
</style>
