<script>
  export let chats = [];

  let selectedChat = null;

  function selectChat(chat) {
    selectedChat = chat;
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="chat-app">
  <div class="window-frame">
    <div class="window-title">Chat</div>
    
    <div class="chat-layout">
      <!-- Chat List Pane -->
      <div class="chat-list-pane">
        <div class="chat-list-header">
          <h2>Conversations</h2>
        </div>
        <div class="chat-list">
          {#each chats as chat}
            <div
              class="chat-item {selectedChat?.id === chat.id ? 'selected' : ''}"
              on:click={() => selectChat(chat)}
            >
              <div class="chat-item-header">
                <span class="chat-from">{chat.from}</span>
                <span class="chat-date">{formatDate(chat.timestamp)}</span>
              </div>
              <div class="chat-message">{chat.message}</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Chat Content Pane -->
      <div class="chat-content-pane">
        {#if selectedChat}
          <div class="chat-content">
            <div class="chat-header">
              <div class="chat-meta">
                <div><strong>From:</strong> {selectedChat.from}</div>
                <div><strong>Date:</strong> {formatDate(selectedChat.timestamp)}</div>
              </div>
            </div>
            <div class="chat-message">
              {selectedChat.message}
            </div>
          </div>
        {:else}
          <div class="no-chat-selected">
            <p>Select a conversation</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .chat-app {
    height: 100%;
  }

  .chat-layout {
    display: flex;
    height: 500px;
    gap: 16px;
  }

  .chat-list-pane {
    flex: 0 0 300px;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    display: flex;
    flex-direction: column;
  }

  .chat-list-header {
    background-color: var(--primary-bg);
    color: white;
    padding: 8px;
    font-weight: bold;
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .chat-item {
    padding: 8px;
    border: 1px solid var(--bevel-dark);
    margin-bottom: 4px;
    cursor: pointer;
    background-color: var(--bevel-light);
  }

  .chat-item.selected {
    background-color: var(--accent-primary);
    color: white;
  }

  .chat-item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .chat-from {
    font-weight: bold;
  }

  .chat-date {
    font-size: 11px;
    color: #666;
  }

  .chat-message {
    font-size: 12px;
    color: #333;
  }

  .chat-content-pane {
    flex: 1;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    padding: 16px;
    overflow-y: auto;
  }

  .chat-content {
    height: 100%;
  }

  .chat-header {
    border-bottom: 1px solid var(--bevel-dark);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .chat-message {
    line-height: 1.4;
    white-space: pre-wrap;
  }

  .no-chat-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    font-style: italic;
  }
</style>
