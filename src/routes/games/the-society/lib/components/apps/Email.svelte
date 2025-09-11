<script>
  export let emails = [];

  let selectedEmail = null;

  function selectEmail(email) {
    selectedEmail = email;
    // Mark as read when selected
    if (!email.read) {
      email.read = true;
    }
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

<div class="email-app">
  <div class="window-frame">
    <div class="window-title">Inbox</div>
    
    <div class="email-layout">
      <!-- Email List Pane -->
      <div class="email-list-pane">
        <div class="email-list-header">
          <h2>Messages</h2>
        </div>
        <div class="email-list">
          {#each emails as email}
            <div
              class="email-item {email.read ? 'read' : 'unread'} {selectedEmail?.id === email.id ? 'selected' : ''}"
              on:click={() => selectEmail(email)}
            >
              <div class="email-item-header">
                <span class="email-from">{email.from}</span>
                <span class="email-date">{formatDate(email.timestamp)}</span>
              </div>
              <div class="email-subject">{email.subject}</div>
              {#if email.flagged}
                <div class="email-flag">⚠️</div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Email Content Pane -->
      <div class="email-content-pane">
        {#if selectedEmail}
          <div class="email-content">
            <div class="email-header">
              <div class="email-meta">
                <div><strong>From:</strong> {selectedEmail.from}</div>
                <div><strong>Subject:</strong> {selectedEmail.subject}</div>
                <div><strong>Date:</strong> {formatDate(selectedEmail.timestamp)}</div>
              </div>
              {#if selectedEmail.flagged}
                <div class="email-flag-badge">Flagged</div>
              {/if}
            </div>
            <div class="email-body">
              {selectedEmail.body}
            </div>
          </div>
        {:else}
          <div class="no-email-selected">
            <p>Select an email to read</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .email-app {
    height: 100%;
  }

  .email-layout {
    display: flex;
    height: 500px;
    gap: 16px;
  }

  .email-list-pane {
    flex: 0 0 300px;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    display: flex;
    flex-direction: column;
  }

  .email-list-header {
    background-color: var(--primary-bg);
    color: white;
    padding: 8px;
    font-weight: bold;
  }

  .email-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .email-item {
    padding: 8px;
    border: 1px solid var(--bevel-dark);
    margin-bottom: 4px;
    cursor: pointer;
    background-color: var(--bevel-light);
    position: relative;
  }

  .email-item.unread {
    background-color: #e8e8ff;
    font-weight: bold;
  }

  .email-item.selected {
    border: 2px solid var(--accent-primary);
    background-color: #d0f0f0;
  }

  .email-item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .email-from {
    font-weight: bold;
  }

  .email-date {
    font-size: 11px;
    color: #666;
  }

  .email-subject {
    font-size: 12px;
    color: #333;
  }

  .email-flag {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 14px;
  }

  .email-content-pane {
    flex: 1;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    padding: 16px;
    overflow-y: auto;
  }

  .email-content {
    height: 100%;
  }

  .email-header {
    border-bottom: 1px solid var(--bevel-dark);
    padding-bottom: 16px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: start;
  }

  .email-meta div {
    margin-bottom: 4px;
  }

  .email-flag-badge {
    background-color: var(--highlight-bg);
    padding: 4px 8px;
    border: 1px solid var(--bevel-dark);
    font-size: 11px;
    font-weight: bold;
  }

  .email-body {
    line-height: 1.4;
    white-space: pre-wrap;
  }

  .no-email-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    font-style: italic;
  }
</style>
