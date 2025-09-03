### **`project-plan.md`**

This is a sequential plan to build "The Ground Itself." Execute each chunk in order.

#### **Phase 0: Foundation & Project Setup**

**Goal:** Create the necessary files and directory structure and install dependencies.

- **Chunk 0.1: Create Directory Structure**
  - Navigate to `src/routes/games/`.
  - Create the main game directory: `the-ground-itself/`.
  - Inside `the-ground-itself/`, create the following subdirectories:
    - `api/`
    - `components/`
    - `logic/`
    - `play/`

- **Chunk 0.2: Create Core Files**
  - Inside `the-ground-itself/`, create the following empty files:
    - `+page.svelte` (This will be the game's introduction page).
    - `stores.js`
    - `data.js`
  - Inside `the-ground-itself/logic/`, create:
    - `deck.js`
    - `dice.js`
    - `promptBuilder.js`
  - Inside `the-ground-itself/play/`, create:
    - `+page.svelte` (This will be the main gameplay screen).
  - Inside `the-ground-itself/api/`, create:
    - `generate-image/` directory, and inside it, `+server.js`.

- **Chunk 0.3: Install Dependencies & Setup Environment**
  - In the project's root terminal, install the Google AI SDK: `npm install @google/generative-ai`
  - In the project's root directory, create a `.env` file.
  - Add your Gemini API key to the `.env` file: `GEMINI_API_KEY="YOUR_API_KEY_HERE"`

---

#### **Phase 1: Game Setup & First Image Generation**

**Goal:** Implement the full setup flow, from the intro page to the player generating their first image after establishing the setting.

- **Chunk 1.1: Initialize Game State Store**
  - In `stores.js`, set up the main writable store with the initial structure for the entire game.

    ```javascript
    // src/routes/games/the-ground-itself/stores.js
    import { writable } from 'svelte/store';

    export const gameState = writable({
    	// Overall Game Flow
    	currentPhase: 'intro', // intro, setup-setting, setup-timeline, setup-place, mainPlay, timeGap, end

    	// Setup Data
    	settingDescription: '',
    	timelineUnit: null, // e.g., 'days', 'weeks'
    	faceCardDeck: [],

    	// Core Gameplay Data
    	numericalDeck: [],
    	activeCard: null,
    	tensDrawn: 0,
    	currentCycle: 1,
    	cardRankCounts: {
    		ace: 0,
    		two: 0,
    		three: 0,
    		four: 0,
    		five: 0,
    		six: 0,
    		seven: 0,
    		eight: 0,
    		nine: 0
    	},
    	turnState: 'drawing', // drawing, deciding, answering, focusedSituation

    	// Narrative & Visuals
    	answers: {}, // A single object to hold all answers, keyed uniquely
    	imagePrompt: '',
    	currentImageUrl: '/placeholder-cosmic.webp', // Provide a default starting image
    	isGeneratingImage: false
    });
    ```

- **Chunk 1.2: Populate Game Data**
  - In `data.js`, add the questions for the setup phase.
    ```javascript
    // src/routes/games/the-ground-itself/data.js
    export const faceCardQuestions = {
    	clubs: {
    		jack: 'What was this place in the past? How long ago was that?' /* ...and so on for all face cards */
    	},
    	hearts: {
    		/* ... */
    	},
    	diamonds: {
    		/* ... */
    	},
    	spades: {
    		/* ... */
    	}
    };
    // We will add more data later.
    ```

- **Chunk 1.3: Implement Intro and Setting Setup**
  - In `the-ground-itself/+page.svelte`, create the user interface for the introduction and the first step: setting up the place. Use `$gameState.currentPhase` to show the correct UI.
  - Create a component `components/setup/SettingSetup.svelte`. This component will contain a textarea and a button.
  - When the button is clicked, it will:
    1.  Update `$gameState.settingDescription` with the text from the textarea.
    2.  Set `$gameState.isGeneratingImage = true`.
    3.  Call a new function (which you will create) that builds the prompt and calls the API.
    4.  After the API call, update `$gameState.currentImageUrl`.
    5.  Set `$gameState.isGeneratingImage = false`.
    6.  Finally, change the phase: `$gameState.currentPhase = 'setup-timeline'`.

- **Chunk 1.4: Implement the AI Image Endpoint & Prompt Builder**
  - In `api/generate-image/+server.js`, implement the server-side logic to call the Gemini API. (Reference the code from our previous discussion).
  - In `logic/promptBuilder.js`, create the initial `buildImagePrompt` function. For now, it will just use the setting description.
    ```javascript
    // src/routes/games/the-ground-itself/logic/promptBuilder.js
    export function buildImagePrompt(state) {
    	let basePrompt = `A vivid scene of ${state.settingDescription}.`;
    	// We will add more logic later to incorporate more answers.
    	return `${basePrompt}, atmospheric, digital painting, high detail.`;
    }
    ```

- **Chunk 1.5: Implement Timeline and Place Setup**
  - Create components for `setup-timeline` and `setup-place` phases.
  - The timeline component will use a `dice.js` logic file to roll a d6 and update `$gameState.timelineUnit`.
  - The place setup component will be the most complex in this phase. It will:
    1.  Use a `deck.js` function to create and shuffle the face cards.
    2.  Deal the cards (for a single-player experience, just present them one by one).
    3.  For each card, display the corresponding question from `data.js`.
    4.  Provide a text input for the answer.
    5.  **Crucially**, on submitting each answer, save it to `$gameState.answers` and **re-run the full image generation loop** (`buildImagePrompt` -> API call -> update image). This will make the world visually evolve as it's being described.
    6.  After all face cards are answered, update the phase: `$gameState.currentPhase = 'mainPlay'` and navigate the user to the `/play` page.

---

#### **Phase 2: The Main Gameplay Loop**

**Goal:** Build the core gameplay screen where players draw cards, answer prompts, and see the world evolve over four cycles.

- **Chunk 2.1: Build the Main Play Page Controller**
  - In `play/+page.svelte`, create the main layout. It should include a persistent `ImageDisplay` component and a content area that will render different components based on `$gameState.turnState`.

- **Chunk 2.2: Implement Card Drawing**
  - Create a component `components/play/DrawCardPrompt.svelte`.
  - This component has one button, "Draw Card."
  - On click, it will:
    1.  On the first draw, use a function in `deck.js` to create and shuffle the numerical deck and save it to `$gameState.numericalDeck`.
    2.  Draw the top card and save it to `$gameState.activeCard`.
    3.  Check if the card is a 10. If so, handle the time gap/end game logic (Phase 3).
    4.  If not a 10, update `$gameState.turnState = 'deciding'`.

- **Chunk 2.3: Implement the Turn Decision**
  - Create `components/play/TurnDecision.svelte`.
  - This component displays the active card.
  - It uses `$gameState.activeCard.rank` and `$gameState.cardRankCounts` to find and display the correct question from `data.js`.
  - It presents two buttons: "Answer Question" (sets `turnState` to `answering`) and "Choose Focused Situation" (sets `turnState` to `focusedSituation`).

- **Chunk 2.4: Implement Answering and Focused Situations**
  - Create `components/play/AnswerInput.svelte` and `components/play/FocusedSituationMenu.svelte`.
  - Both components will have a text input and a submit button.
  - On submit, they will perform the same core actions:
    1.  Save the new text to the `$gameState.answers` object with a unique key (e.g., `ace_${$gameState.cardRankCounts.ace}`).
    2.  **Increment the count** for the active card's rank in `$gameState.cardRankCounts`.
    3.  **Trigger the full image generation loop**.
    4.  Reset the state for the next turn: `$gameState.turnState = 'drawing'`.

- **Chunk 2.5: Enhance the Prompt Builder**
  - Update `logic/promptBuilder.js`. The function should now be more intelligent. It should iterate through the `$gameState.answers` object and append key details to the prompt string, creating an ever-richer visual description.

---

#### **Phase 3: Time Gaps & Game End**

**Goal:** Implement the logic for when a "10" is drawn, handling the time jumps and the conclusion of the game.

- **Chunk 3.1: Handle the "10" Card Draw**
  - In the `DrawCardPrompt` component's logic, when a 10 is drawn:
    1.  Increment `$gameState.tensDrawn`.
    2.  Check if `$gameState.tensDrawn === 4`. If so, set `$gameState.currentPhase = 'end'` and navigate to a new `/end` route.
    3.  If not the fourth ten, set `$gameState.currentPhase = 'timeGap'`.

- **Chunk 3.2: Implement the Time Gap Component**
  - In `play/+page.svelte`, add a condition to show a `TimeGap.svelte` component when `$gameState.currentPhase === 'timeGap'`.
  - The `TimeGap.svelte` component will:
    1.  Guide the player to answer one of the special "10" card questions.
    2.  Roll the dice for the time jump duration.
    3.  Present the three time gap questions ("Do our characters still live here?", etc.).
    4.  On submitting the answers, save them and trigger a final, dramatic image generation for this cycle.
    5.  Increment `$gameState.currentCycle`.
    6.  Reset the game for the next cycle: `$gameState.currentPhase = 'mainPlay'` and `$gameState.turnState = 'drawing'`.

- **Chunk 3.3: Implement the End Game Screen**
  - Create a new route `the-ground-itself/end/+page.svelte`.
  - This page will display the concluding text from the rulebook.
  - It will present the final prompt: "What happens tomorrow...".
  - On submission, it will trigger one final image generation, leaving the player with the ultimate visual of their created place.
