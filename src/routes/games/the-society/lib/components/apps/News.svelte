<script>
  export let articles = [];

  let selectedArticle = null;

  function selectArticle(article) {
    selectedArticle = article;
    // Mark as read when selected
    if (!article.isRead) {
      article.isRead = true;
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
</script>

<div class="news-app">
  <div class="window-frame">
    <div class="window-title">News Feed</div>
    
    <div class="news-layout">
      <!-- Article List Pane -->
      <div class="article-list-pane">
        <div class="article-list-header">
          <h2>Latest Headlines</h2>
        </div>
        <div class="article-list">
          {#each articles as article}
            <div
              class="article-item {article.isRead ? 'read' : 'unread'} {selectedArticle?.id === article.id ? 'selected' : ''}"
              on:click={() => selectArticle(article)}
            >
              <div class="article-date">{formatDate(article.date)}</div>
              <div class="article-title">{article.title}</div>
              <div class="article-summary">{article.summary}</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Article Content Pane -->
      <div class="article-content-pane">
        {#if selectedArticle}
          <div class="article-content">
            <div class="article-header">
              <h2>{selectedArticle.title}</h2>
              <div class="article-meta">
                <span class="article-date">Published: {formatDate(selectedArticle.date)}</span>
              </div>
            </div>
            <div class="article-body">
              <p>{selectedArticle.summary}</p>
              <div class="article-details">
                <p>More details would appear here as the story develops. Investigators are encouraged to follow up on these leads and report any findings back to the Society.</p>
                <p>Check local sources and eyewitness accounts for additional information.</p>
              </div>
            </div>
          </div>
        {:else}
          <div class="no-article-selected">
            <p>Select a news article to read</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .news-app {
    height: 100%;
  }

  .news-layout {
    display: flex;
    height: 500px;
    gap: 16px;
  }

  .article-list-pane {
    flex: 0 0 300px;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    display: flex;
    flex-direction: column;
  }

  .article-list-header {
    background-color: var(--primary-bg);
    color: white;
    padding: 8px;
    font-weight: bold;
  }

  .article-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .article-item {
    padding: 12px;
    border: 1px solid var(--bevel-dark);
    margin-bottom: 4px;
    cursor: pointer;
    background-color: var(--bevel-light);
  }

  .article-item.unread {
    background-color: #e8e8ff;
    font-weight: bold;
  }

  .article-item.selected {
    border: 2px solid var(--accent-primary);
    background-color: #d0f0f0;
  }

  .article-date {
    font-size: 11px;
    color: #666;
    margin-bottom: 4px;
  }

  .article-title {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 14px;
  }

  .article-summary {
    font-size: 12px;
    color: #333;
    line-height: 1.3;
  }

  .article-content-pane {
    flex: 1;
    background-color: var(--content-bg);
    border: 2px inset var(--bevel-dark);
    padding: 20px;
    overflow-y: auto;
  }

  .article-content {
    height: 100%;
  }

  .article-header {
    border-bottom: 1px solid var(--bevel-dark);
    padding-bottom: 16px;
    margin-bottom: 20px;
  }

  .article-header h2 {
    margin-bottom: 8px;
    color: var(--primary-bg);
  }

  .article-meta {
    font-size: 12px;
    color: #666;
  }

  .article-body {
    line-height: 1.6;
  }

  .article-body p {
    margin-bottom: 16px;
  }

  .article-details {
    background-color: #f0f0f0;
    padding: 16px;
    border: 1px solid var(--bevel-dark);
    margin-top: 20px;
    font-style: italic;
  }

  .no-article-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    font-style: italic;
  }
</style>
