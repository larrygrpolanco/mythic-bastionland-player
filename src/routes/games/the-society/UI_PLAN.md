### **File 2: `UI_PLAN.md`**

# SvelteKit UI Development Plan

## 1. Guiding Principles & Setup

- **UI/Backend Decoupling:** This plan focuses on building a "Static UI Shell." All components will be built to accept data via `props`. We will create mock data files to populate the UI for development and testing. This ensures the backend can be developed independently and plugged in later by simply replacing the mock data source.
- **Component-Based Architecture:** Each "app" (Email, Map, etc.) will be a distinct Svelte component. Sub-elements (like a list pane or a map icon) will also be components.
- **Single Source of Truth (for UI state):** A main layout component will manage which "app" is currently active.

## 2. Project Structure

````
/src
├── lib
│   ├── components
│   │   ├── layout          # Main UI shell and navigation
│   │   │   ├── MainLayout.svelte
│   │   │   └── Tabs.svelte
│   │   ├── apps            # The main feature components
│   │   │   ├── Email.svelte
│   │   │   ├── Chat.svelte
│   │   │   ├── News.svelte
│   │   │   ├── Monsterpedia.svelte
│   │   │   └── NYCMap.svelte
│   │   └── shared          # Reusable components
│   │       ├── Button.svelte
│   │       ├── WindowFrame.svelte
│   │       └── Icon.svelte
│   └── data                # Mock data for UI development
│       ├── mockEmails.js
│       ├── mockChats.js
│       ├── mockNews.js
│       ├── mockMonsters.js
│       └── mockMapData.js
└── routes
    └── +page.svelte        # The main entry point for the game UI```

## 3. Step-by-Step Implementation Plan

### **Step 0: Global Styles & Setup**

1.  Create a new SvelteKit project.
2.  In `src/app.html`, set the main `<body>` background color to black or a repeating pattern.
3.  Create a global stylesheet (`/src/app.css` or similar) to define the CSS custom properties from the Style Guide (e.g., `--primary-bg: #000080;`), the pixelated font rendering rules, and base styles for links and body text.

### **Step 1: The Main UI Shell**

**File:** `src/lib/components/layout/MainLayout.svelte`
**Purpose:** This component is the master container for the entire UI.
**Logic:**
1.  Holds the state for the currently active tab (e.g., `let activeTab = 'Email';`).
2.  Renders the `<Tabs>` component at the top.
3.  Uses an `{#if ...}` block or Svelte's `<svelte:component>` to dynamically render the active "app" component below the tabs.
4.  Passes the mock data down to the child components.

**File:** `src/lib/components/layout/Tabs.svelte`
**Props:** `tabs` (an array of tab names), `activeTab` (the currently active tab name).
**Logic:**
1.  Renders a button for each tab in the `tabs` array.
2.  Applies a special class if a tab's name matches `activeTab`.
3.  When a tab is clicked, it dispatches an event to `MainLayout` to update the state.
4.  Will display a notification badge if a `tab` object has a `notification: true` property.

### **Step 2: Mock Data Creation**

Create each file in `src/lib/data/` and export a constant array of objects. This defines the "API contract" for each component.

*   `mockEmails.js`: `export const emails = [{ id: 'e01', from: 'Anonymous', subject: 'Strange howling near Gowanus', body: '...', timestamp: '...', read: false, flagged: false }, ...]`
*   `mockChats.js`: `export const investigators = [{ id: 'inv01', name: 'Shadow', messages: [{ sender: 'player', text: '...' }, { sender: 'inv01', text: '...' }] }, ...]`
*   `mockMonsters.js`: `export const monsters = [{ id: 'm01', name: 'Jenny Greenteeth', summary: '...', details: '...', knownWeaknesses: '...' }, ...]`
*   `mockNews.js`: `export const articles = [{ id: 'n01', headline: 'Subway Power Outages Plague Downtown', source: 'NYC Local Beat', date: '...', body: '...', image: '/images/grainy-subway.jpg' }, ...]`
*   `mockMapData.js`: `export const mapData = { boroughs: { brooklyn: { locations: [{ id: 'loc01', name: 'Brooklyn Public Library', details: '...', npcs: [{ id: 'npc01', name: 'Librarian Eleanor' }] }] } } }`

### **Step 3: Build the "App" Components**

For each component in `src/lib/components/apps/`, the task is to build the UI to display the data received via props.

1.  **Email.svelte**
    *   **Props:** `emails` (array of email objects).
    *   **UI:** A two-pane layout. Left pane is a scrollable list of emails (showing From, Subject, and Flag icon). Right pane shows the body of the selected email.
    *   **Interactivity:** Clicking an email in the list displays its content. Clicking a "flag" icon toggles the `flagged` state for that email (state will be managed locally or passed up). Unread emails should be bold.

2.  **News.svelte**
    *   **Props:** `articles` (array of article objects).
    *   **UI:** A layout resembling a simple news website. A list of headlines on the left/top, with the full article text and a grainy JPEG displayed in a main content area when a headline is selected.
    *   **Interactivity:** Clicking a headline shows the article.

3.  **Monsterpedia.svelte**
    *   **Props:** `monsters` (array of monster objects).
    *   **UI:** A two-pane layout. Left is a searchable, alphabetical list of monster names. Right pane displays the entry for the selected monster. The text should be formatted simply, perhaps with some "user-submitted" warnings or contradictory info.
    *   **Interactivity:** A text input filters the list of monsters in real-time. Clicking a name displays the details.

4.  **NYCMap.svelte**
    *   **Props:** `mapData` (the map data object).
    *   **UI:** Initially shows a vector outline of NYC with clickable boroughs. Clicking a borough zooms in/transitions to a view of that borough with 5-10 labeled, clickable key locations. Clicking a location brings up a small info pop-up/pane with details and known NPCs.
    *   **Interactivity:** Manages its own internal state (which borough/location is selected).

5.  **Chat.svelte**
    *   **Props:** `investigators` (array of investigator objects).
    *   **UI:** A two-pane layout. The left pane is a list of investigators you can chat with. The right pane is the chat window. The chat window itself is a scrollable `div` showing messages, and a text input at the bottom to "send" a message.
    *   **Interactivity:** Clicking an investigator on the left loads their message history. Typing in the input and hitting "Enter" adds a new message from the "player" to the array of messages for that conversation.
    *   **Sub-Component:** Implement the "simple map info navigation" here. This could be a small button that opens a modal/pop-up allowing the player to browse location and NPC names from `mapData` without leaving the chat, to help them formulate instructions.

### **Step 4: Assembling in the Main Route**

**File:** `/src/routes/+page.svelte`
**Purpose:** This is the entry point that brings everything together.
**Logic:**
1.  Import `MainLayout.svelte`.
2.  Import all mock data from `/src/lib/data/`.
3.  Render `<MainLayout>` and pass all the mock data down as props.
    ```svelte
    <script>
      import MainLayout from '$lib/components/layout/MainLayout.svelte';
      import { emails } from '$lib/data/mockEmails.js';
      // ... import other data
    </script>

    <MainLayout
      initialEmails={emails}
      // ... pass other data
    />
    ```
````
