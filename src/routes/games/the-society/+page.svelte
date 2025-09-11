<script>
  import MainLayout from './lib/components/layout/MainLayout.svelte';
  
  // Import mock data
  import { emails } from './lib/data/mockEmails.js';
  import { chats } from './lib/data/mockChats.js';
  import { news } from './lib/data/mockNews.js';
  import { monsters } from './lib/data/mockMonsters.js';
  import { mapData } from './lib/data/mockMapData.js';
</script>

<MainLayout
  {emails}
  {chats}
  {news}
  {monsters}
  {mapData}
/>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: black;
    font-family: "MS Sans Serif", "Geneva", "Verdana", "Arial", sans-serif;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: grayscale;
    font-smooth: never;
  }
</style>
