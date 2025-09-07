### **`PROJECT_PLAN.md`**

This plan breaks down the development of our Alien in the Machine MVP into distinct, testable phases. Each phase is a _learning module_ designed to build upon the last, ensuring we understand each part of the architecture before adding the next layer of complexity.

**Project Goal:** Create a functional, single-player prototype of a turn-based sci-fi simulation using SvelteKit and a "toy" Entity-Component-System (ECS) architecture. The MVP will feature AI-controlled marines navigating a small station, interacting with the environment, and pursuing a simple objective. The player acts as a commander, observing and issuing commands via a retro-terminal UI that also serves as a comprehensive debug tool.

---

#### **Phase 0: Foundation & Setup (The Blank Canvas)**

- **Goal:** Establish a clean, organized project structure that enforces a strict separation of concerns from the very beginning. This discipline is the bedrock of the entire project.
- **Sub-Phases:**
  1.  This is part of a portfolio project where each game is completely seperated in its own file so that it can be moved and worked on without affecting any other games in this portfolio. mythic-bastionland-player/src/routes/games/alien-in-the-machine
  2.  Create the core folder structure (`alien-in-the-machine/lib/game`, `alien-in-the-machine/lib/data`, `alien-in-the-machine/lib/stores`, `alien-in-the-machine/lib/components`).
  3.  Create empty "stub" files for our main modules (`World.js`, `systems.js`, `marines.json`, `rooms.json`, `marinesStore.js`, etc.).
- **Checkpoint:** The SvelteKit application runs without errors, displaying a single, basic `+page.svelte` with a "Hello World" message.

---

#### **Phase 1: The Static World (Data Loading & Rendering)**

- **Goal:** Implement the "data-first" principle. The simulation's state should be entirely derived from external data files, making the world "moddable" from the start. Our code will be the _engine_, not the _content_.
- **Sub-Phases:**
  1.  **Data Modeling:** Define the JSON structure for `rooms.json` and `marines.json`. The room structure _must_ include an array of `doors` with `targetRoomId` to define connectivity.
  2.  **World Initialization:** In `World.js`, create an `initWorld()` function. This function will be pure: it will take the raw JSON data as arguments and return a fully populated `world` object. This makes it testable and decoupled. It will create entities and attach components based on the loaded data.
  3.  **State Management:** Create a `worldStore.js` Svelte store. This is the _only_ bridge between the game engine and the UI. Initialize the game world via `initWorld()` and set the store's initial value.
  4.  **UI - Map Rendering:** Create `MapView.svelte`. It subscribes to `worldStore` and renders rooms. Crucially, it should also render entities that have a `PositionComponent`, showing them as dots within their respective rooms.
  5.  **UI - Info Panel:** Create `InfoView.svelte`. When an entity (room or marine dot) is clicked, this panel displays all components and their data associated with that entity's ID. This is our primary debugging tool for viewing the raw state.
- **Checkpoint:** We see the 4-room station laid out. We see dots representing our marines in their starting room. Clicking on any room or marine shows its complete data in the info panel.

---

#### **Phase 2: Action & Interaction (The Player-Controlled Puppet)**

- **Goal:** Build and validate the complete set of game rules and interactions _before_ introducing the complexity of an AI. The player-controlled marine acts as a direct, reliable way to unit-test our `actionSystem` in real-time.
- **Sub-Phases:**
  1.  **Component Creation:** In `World.js`, define the data structures for "property" components: `Pickupable`, `Hideable`, `Searchable`, `Usable`, `Door`. Add this data to items/furniture/doors in your JSON files.
  2.  **Action Queue:** The `world` object will have an `actionQueue` array. The UI will push action objects into this queue (e.g., `{ action: 'moveTo', entityId: 1, target: 'docking_bay' }`).
  3.  **Action System:** In `systems.js`, create the `actionSystem`. Its sole job is to process every action in the `actionQueue` each turn, calling the appropriate logic function and then clearing the queue.
  4.  **Action Logic:** Write the individual action functions (`moveTo`, `pickUpItem`, etc.). These are pure-style functions: they take the `world` and an `action` object, and return the _modified parts_ of the world state. The `actionSystem` is responsible for applying these changes.
  5.  **UI - Debug Controls:** Create a "Debug" tab in the UI. It allows selecting a marine as "player-controlled." It will then dynamically generate buttons for every possible action that marine can take by querying the world state (e.g., if in a room with a `DoorComponent`, a "Move" button for that door appears).
- **Checkpoint:** We can fully play the game as a single marine, moving, picking things up, hiding, and searching. The info panel correctly reflects all state changes in real-time. The game's rules are now proven to be solid.

---

#### **Phase 3: The Living World (The AI Ghost in the Machine)**

- **Goal:** To cleanly delegate decision-making to an external "brain" (the LLM) while the core game engine remains the sole authority on rules and state changes.
- **Sub-Phases:**
  1.  **AI System:** Create an `aiSystem` in `systems.js`. It runs _before_ the `actionSystem`.
  2.  **Prompt Assembly (The Context Package):** The `aiSystem` will query the `world` to build a comprehensive, structured context package (the prompt) for each AI entity. This is the game's "API" for the LLM.
  3.  **LLM Service:** Create a helper module (`LLMService.js`). Its only job is to manage the API call: take a prompt string, send it, and return the parsed JSON response. This isolates the external dependency.
  4.  **Response Parsing & Queuing:** The `aiSystem` takes the structured JSON response from the LLM and translates it into a valid action object, which it then pushes into the `world.actionQueue`. This ensures the AI must "play by the rules" defined in our `actionSystem`.
  5.  **Log Integration:** Create a `logStore.js` and `RadioLog.svelte`. The `aiSystem` will push the `dialogue` and `thoughts` from the LLM response into this store for immediate visibility into the AI's reasoning.
- **Checkpoint:** On each turn, the AI marine thinks, its dialogue appears in the log, and it performs a valid action in the world. We can now "watch" the simulation play itself.

---

#### **Phase 4: The Mission (Objectives & The Survivor)**

- **Goal:** Demonstrate the power of ECS by adding a new layer of gameplay (objectives) and a new type of AI entity simply by creating a new component and a new system, with minimal changes to existing code.
- **Sub-Phases:**
  1.  **Objective Component:** Define an `ObjectiveComponent` that holds conditions (e.g., `{ type: 'FETCH_ITEM', itemId: 'keycard', destination: 'shuttle' }`). Attach it to a global "mission" entity.
  2.  **Mission System:** Create a `missionSystem` that runs each turn. It reads the `ObjectiveComponent` and checks the world state to see if the conditions are met.
  3.  **Survivor Entity & AI Differentiation:** Create a "survivor" entity. Add a `PersonalityComponent` to both marines and survivors. The `aiSystem` will now use this component to alter the prompt it sends to the LLM, creating distinct behaviors for different entity types from the same core logic.
  4.  **Player Commands:** Implement the player's command input. A simple parser turns commands into actions. A command like "Sarge, find the survivor" might modify the `ObjectiveComponent` on Sarge's entity, guiding his AI behavior.
- **Checkpoint:** The game is fully playable. The player can issue a high-level objective, and the AI marines will work to accomplish it, including interacting with another autonomous AI entity (the survivor).

---
