**Project Vision:**
To create a web-based, single-player or "pass-the-phone" adaptation of the tabletop game "The Ground Itself." The central, defining feature is the use of generative AI to create a visual representation of the game's location, which dynamically evolves as players answer narrative prompts. The goal is an immersive, story-driven experience where players see their collaborative world come to life.

**Core Mechanics:**

- **Game Flow:** The game progresses through distinct phases: Introduction -> Setup (Setting, Timeline, Establishing the Place) -> Main Gameplay (4 Cycles) -> Time Gaps -> Game End.
- **State Management:** All game state will be managed in a central Svelte store (`stores.js`). This includes the narrative text, card decks, turn progress, and the current AI image URL and prompt. The UI will be a reactive reflection of this central store.
- **Player Interaction:** A single, shared text box will be used for all inputs. The experience is designed to be guided, with contextual instructions appearing at each step.
- **Card System:** The game uses two decks: a "Face Card" deck for setup and a "Numerical Card" deck for main gameplay. The application must track which number card questions have been answered for each rank (Ace, Two, etc.) to ensure the correct prompt is always presented.

**Architectural Principles:**

- **File Structure:** The entire game MUST be self-contained within the `src/routes/games/the-ground-itself/` directory. All components, logic, and data files will reside here.
- **Technology:** SvelteKit with pure JavaScript. No TypeScript.
- **Componentization:** The UI will be broken down into small, single-purpose components. A main controller page (`/play/+page.svelte`) will manage which component is active based on the game's current state (`currentPhase` and `turnState` in the store).
- **Secure AI Integration:** AI image generation API calls will be handled by a dedicated, server-side-only SvelteKit endpoint (`/api/generate-image/+server.js`) to protect the API key. The frontend will never directly access the key.

**Core Data Flow (The Loop):**
This is the most critical process in the application. Nearly every player action that adds to the story will trigger it:

1.  **Player Action:** The player answers a prompt (from a card or a focused situation).
2.  **State Update:** The answer is saved to the `gameState` store.
3.  **Prompt Building:** A dedicated `promptBuilder.js` function reads the entire current game state (initial setting + all subsequent answers) and constructs a new, detailed prompt for the AI image model.
4.  **API Call:** The frontend sends this new prompt to the secure server-side endpoint.
5.  **Image Generation:** The server endpoint calls the Gemini API and receives a new image URL.
6.  **UI Update:** The server returns the URL to the frontend, which updates the `gameState` store. The `ImageDisplay` component automatically shows the new image and a loading state is handled.

---
