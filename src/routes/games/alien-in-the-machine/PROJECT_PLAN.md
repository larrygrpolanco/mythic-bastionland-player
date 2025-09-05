### **`PROJECT_PLAN.md`**

This plan breaks down the development of our Alien in the Machine MVP into distinct, testable phases. Each phase is a _learning module_ designed to build upon the last, ensuring we understand each part of the architecture before adding the next layer of complexity.

**Project Goal:** Create a functional, single-player prototype of a turn-based sci-fi simulation using SvelteKit and a "toy" Entity-Component-System (ECS) architecture. The MVP will feature AI-controlled marines navigating a small station, interacting with the environment, and pursuing a simple objective. The player acts as a commander, observing and issuing commands via a retro-terminal UI that also serves as a comprehensive debug tool.

---

#### **Phase 0: Foundation & Setup (The Blank Canvas)** ✅ **COMPLETE**

- **Goal:** Establish a clean, organized project structure that enforces a strict separation of concerns from the very beginning. This discipline is the bedrock of the entire project.
- **Sub-Phases:**
  1.  ✅ This is part of a portfolio project where each game is completely seperated in its own file so that it can be moved and worked on without affecting any other games in this portfolio. mythic-bastionland-player/src/routes/games/alien-in-the-machine
  2.  ✅ Create the core folder structure (`alien-in-the-machine/lib/game`, `alien-in-the-machine/lib/data`, `alien-in-the-machine/lib/stores`, `alien-in-the-machine/lib/components`).
  3.  ✅ Create comprehensive implementation files for all main modules (`World.js`, `systems.js`, `marines.json`, `rooms.json`, `worldStore.js`, `logStore.js`, etc.).
  4.  ✅ Complete UI component suite with integrated terminal aesthetic
  5.  ✅ Full ECS architecture with reactive state management
- **Checkpoint:** ✅ **ACHIEVED** - The SvelteKit application runs without errors, displaying complete game interface with map view, entity inspector, and communication log. All core systems initialized and operational.

**Implementation Summary:**
- Complete ECS world object with all component types defined
- Rich JSON data files for rooms and marines with detailed attributes
- Reactive Svelte stores connecting game engine to UI
- Interactive map showing 4-room station layout with marine entities
- Entity inspector for debugging component data
- Communication log system ready for AI dialogue
- Turn processing infrastructure operational
- Phase-aware system progression documented throughout codebase

---

#### **Phase 1: The Static World (Data Loading & Rendering)** 🎯 **NEXT PHASE**

- **Goal:** Implement the "data-first" principle. The simulation's state should be entirely derived from external data files, making the world "moddable" from the start. Our code will be the _engine_, not the _content_.

**Current Status:** Foundation complete, ready for data loading implementation

**Sub-Phases:**
  1.  ✅ **Data Modeling:** JSON structures complete in `rooms.json` and `marines.json`. Room structure includes `doors` array with `targetRoomId` connectivity. Marine data includes personalities, skills, and starting positions.
  
  2.  🔄 **World Initialization:** The `initWorld()` function skeleton exists in `World.js` but needs implementation. **TODO:**
     - Load JSON data and create entities for each room and marine
     - Attach appropriate components (`isRoom`, `isMarine`, `position`, `health`, etc.)
     - Build room connectivity data structure
     - Populate world with real entities instead of empty state
  
  3.  ✅ **State Management:** `worldStore.js` exists and is operational. **TODO:**
     - Implement `initializeWorld()` function to call `initWorld()` with loaded JSON data
     - Update phase indicator to Phase 1 when data is loaded
  
  4.  🔄 **UI - Map Rendering:** `MapView.svelte` exists with placeholder data. **TODO:**
     - Replace static room/marine arrays with dynamic data from `worldStore`
     - Implement `getRoomsFromWorld()` helper function
     - Update entity positioning to use real `PositionComponent` data
     - Ensure real-time reactivity to world state changes
  
  5.  ✅ **UI - Info Panel:** `InfoView.svelte` exists and functional. **Minor TODO:**
     - Ensure compatibility with real entity data structure
     - Test entity selection with actual world entities

**Implementation Notes for Next Developer:**
- `World.js` has all component types pre-defined - use `addComponent()` function
- JSON data structure is rich and ready - see expansion plans for Phase 2 items
- MapView click handlers are implemented - they connect to `selectEntity()` store function
- InfoView shows both selected entity details AND world summary when nothing selected
- Phase progression is tracked in `world.metadata.phase` - update this when Phase 1 complete

- **Checkpoint:** We see the 4-room station laid out with REAL entities loaded from JSON data. We see dots representing our marines (Sarge, Rook, Doc) in their starting room (Docking Bay). Clicking on any room or marine shows its complete component data in the info panel.

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
