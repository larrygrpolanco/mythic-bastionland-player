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

#### **Phase 1: The Static World (Data Loading & Rendering)** ✅ **COMPLETE**

- **Goal:** Implement the "data-first" principle. The simulation's state should be entirely derived from external data files, making the world "moddable" from the start. Our code will be the _engine_, not the _content_.

**Status:** ✅ **ACHIEVED** - Data-driven world successfully implemented

**Sub-Phases:**
  1.  ✅ **Data Modeling:** JSON structures complete in `rooms.json` and `marines.json`. Room structure includes `doors` array with `targetRoomId` connectivity. Marine data includes personalities, skills, and starting positions.
  
  2.  ✅ **World Initialization:** `initWorld()` function fully implemented in `World.js`:
     - ✅ Loads JSON data and creates entities for each room and marine
     - ✅ Attaches appropriate components (`isRoom`, `isMarine`, `position`, `health`, `inventory`, `personality`, `skills`, `tag`, `environment`)
     - ✅ Builds room connectivity data structure from door relationships
     - ✅ Populates world with 7 real entities (4 rooms + 3 marines) instead of empty state
  
  3.  ✅ **State Management:** `worldStore.js` fully operational:
     - ✅ `initializeWorld()` function loads JSON data and calls `initWorld()` 
     - ✅ Phase indicator updates to "Phase 1" when data is loaded
     - ✅ Automatic world initialization on application mount
  
  4.  ✅ **UI - Map Rendering:** `MapView.svelte` fully functional:
     - ✅ Replaced static room/marine arrays with dynamic data from `worldStore`
     - ✅ Implemented `getRoomsFromWorld()` and `getMarinesFromWorld()` helper functions
     - ✅ Entity positioning uses real `PositionComponent` data with coordinates
     - ✅ Real-time reactivity confirmed - all changes flow through worldStore
  
  5.  ✅ **UI - Info Panel:** `InfoView.svelte` fully compatible:
     - ✅ Works perfectly with real entity data structure
     - ✅ Entity selection tested with actual world entities
     - ✅ Shows complete component data for both rooms and marines

**Implementation Summary:**
- **Data-driven architecture**: World state entirely derived from external JSON files
- **Full ECS implementation**: 7 entities with proper component structure
- **Interactive entity system**: Click any room or marine to inspect complete component data
- **Reactive UI**: All changes flow through worldStore to update components in real-time
- **Phase progression**: Game shows "Phase 1" status and proper state transitions
- **Station layout**: 4-room station (Docking Bay, Main Corridor, Medical Bay, Command Bridge) with correct positioning
- **Marine positioning**: All three marines (Sarge, Rook, Doc) correctly positioned in Docking Bay

- **Checkpoint:** ✅ **ACHIEVED** - We see the 4-room station laid out with REAL entities loaded from JSON data. We see dots representing our marines (Sarge, Rook, Doc) in their starting room (Docking Bay). Clicking on any room or marine shows its complete component data in the info panel.

---

#### **Pre-Phase 2: Tick-Based Turn System Foundation** ✅ **UI FOUNDATION COMPLETE**

- **Goal:** Establish the tick-based turn system architecture before implementing game actions. This elegant system unifies speed, timing, and actions into one cohesive mechanism where actions directly cost time ticks.

**Status:** ✅ **UI FOUNDATION ACHIEVED** - Enhanced turn control interface successfully implemented for Phase 2 readiness

**Core Turn Mechanics:**
- **Speed-Based Timers:** Each character has a countdown timer and speed stat (higher speed = faster countdown)
- **Tick-Cost Actions:** Actions directly cost time ticks (Move Room=10 ticks, Search=6 ticks, Quick Look=3 ticks)
- **Dynamic Turn Order:** Character with lowest timer goes next (speed determines how quickly timers count down)
- **Unified System:** No separate action points - everything is ticks

**Turn Flow Example:**
```
Rook (Speed 5): Timer=0 → Acts → "Search Container (6 ticks)" → Timer=6
- Next tick: 6-5=1, then 1-5=(-4) → Can act again relatively soon

Sarge (Speed 3): Timer=2 → 2-3=(-1) → Acts → "Move to Medical (10 ticks)" → Timer=10  
- Longer wait: 10→7→4→1→(-2) before next action

Doc (Speed 2): Timer=5 → Very slow countdown: 5→3→1→(-1) → Finally can act
```

**✅ UI Implementation Complete:**
1. **TurnControl.svelte:** Enhanced turn management component with:
   - Categorized action selection UI (CORE, MEDICAL, TECHNICAL, ENVIRONMENTAL, COMBAT)
   - Character status display with speed and timer information
   - Tick cost visibility and action state management
   - Real-time character readiness indicators

2. **TabbedRightPanel.svelte:** Organized interface structure:
   - Turn Control as primary default tab
   - Entity Inspector for debugging
   - Communication Log for future AI dialogue
   - Seamless tab switching and clean organization

3. **Integrated Architecture:** Removed standalone TurnDisplay, consolidated all turn functionality into organized tabbed interface

**🎯 Architecture Implementation Remaining:**
1. **World.js Extensions:**
   - Add `SpeedComponent`: `{ entityId: { current: 5, base: 5, modifiers: [] }}`
   - Add `turnSystem` state: `{ characterTimers: {}, gameTick: 0 }`
   - Update `initWorld()` to initialize speed from marines.json

2. **New Modular Files:**
   - **`TurnManager.js`**: Isolated turn logic module with pure functions
     - `getNextCharacterToAct(world)` - finds character with timer ≤ 0
     - `advanceTick(world)` - subtracts speed from all character timers  
     - `executeAction(world, characterId, action)` - adds action tick cost to timer
     - `initializeTurnSystem(world)` - sets up character timers from speed
   - **`ActionCosts.js`**: ✅ **COMPLETE** - Centralized action cost definitions with categories

3. **Systems.js Integration:**
   - **REMOVE** `processGameTurn()` batch processing entirely
   - **ADD** `processCharacterTurn(world)` - handle single character's action using TurnManager
   - Import and delegate to TurnManager functions for all turn logic

4. **WorldStore.js Turn Management:**
   - **REPLACE** `nextTurn()` with `executeCharacterAction(characterId, actionType)`
   - **ADD** `getCurrentActiveCharacter()` - get character who can act now
   - **ADD** derived stores for current character and available actions

5. **Marines.json Data Updates:**
   - Add speed values: `"speed": 5` for Rook, `"speed": 3` for Sarge, `"speed": 2` for Doc
   - These create natural character differentiation (Rook=agile, Sarge=balanced, Doc=careful)

- **Checkpoint:** ✅ **UI FOUNDATION COMPLETE** - Enhanced turn control interface ready for Phase 2 implementation. Tick system operational UI displays whose turn it is, shows tick costs, and will provide clean action selection once backend turn logic is implemented.

**Key Benefits:**
- ✅ **UI Ready for Phase 2:** Categorized action selection eliminates "unwieldy" menu concerns
- ✅ **Simpler:** One unified tick system instead of separate speed + action points
- ✅ **More Tactical:** Action choice directly affects turn timing (UI shows this clearly)
- ✅ **Intuitive:** "Heavy actions take more time" makes perfect sense to players
- ✅ **Scalable:** UI ready to display new actions with different tick costs
- ✅ **Modular:** All turn UI logic isolated in TurnControl component for clarity

---

#### **Phase 2: Action & Interaction (The Player-Controlled Puppet)** 🔧 **IN PROGRESS**

- **Goal:** Build and validate the complete set of game rules and interactions using the tick-based turn system established in Pre-Phase 2. Each action costs time ticks and is processed immediately, allowing the player to control individual marines and unit-test our game mechanics in real-time.

**Status:** **MAJOR IMPLEMENTATION WORK REQUIRED** - UI framework exists but core action execution is non-functional

**Prerequisites:** Pre-Phase 2 tick-based turn system must be complete and operational.

- **Sub-Phases:**
  1.  **Interactive Components:** ⚠️ **INCOMPLETE** - In `World.js`, define data structures for "property" components: `Pickupable`, `Hideable`, `Searchable`, `Usable`, `Door`. Add this data to items/furniture/doors in your JSON files with expansion plans from rooms.json.

  2.  **Action Logic Functions:** ⚠️ **INCOMPLETE** - Write individual action functions (`moveTo`, `pickUpItem`, `searchArea`, `useItem`, `hideInCover`). These are pure functions: take `world` and `action`, return success/failure and apply changes. Each action has a defined tick cost from `ActionCosts.js`.

  3.  **Tick Cost Integration:** ⚠️ **BROKEN** - Integrate action tick costs into `processCharacterTurn()` via TurnManager. When player selects action, add tick cost to character's timer using `TurnManager.executeAction()`. Character's next turn depends on their speed and action cost.

  4.  **Interactive UI Controls:** ✅ **UI READY** / ⚠️ **BACKEND BROKEN** - Transform the debug panel into the primary player interface. Show only the currently active character's available actions based on their position and world state. Display tick costs clearly: *"Search Cargo Container (6 ticks)"*.

  5.  **World State Validation:** ⚠️ **INCOMPLETE** - Add items, furniture, and searchable areas to rooms.json. Create entities for these objects during world initialization. Ensure characters can interact with environmental objects through proper component queries.

**Critical Issues Blocking Phase 2 Completion:**
- **Action Execution Pipeline Broken:** TurnControl → worldStore → systems → TurnManager flow not working
- **Interactive Object Creation Incomplete:** Entity creation for items/furniture during world initialization
- **Movement System Missing:** Room-to-room character navigation not implemented  
- **Inventory System Incomplete:** Item pickup/drop mechanics not functional
- **Turn Timer Synchronization:** Character timer updates and turn progression needs debugging
- **World State Updates:** Character actions not properly modifying world components

**Implementation Reality Check:**
Despite having polished UI components and solid architectural framework, the core game mechanics that make Phase 2 functional are not implemented. The categorized action interface looks ready but clicking actions doesn't execute properly through the game systems.

- **Checkpoint:** ❌ **NOT ACHIEVED** - Player can control individual marines through the tick system. Each character performs one action per turn (with associated tick cost), then waits for their timer to count down based on speed before acting again. Turn order is dynamic based on action choices. All game rules validated through direct player interaction.

**Success Criteria Status:**
- ❌ Only the current active character (timer ≤ 0) can perform actions - **UI shows this but execution fails**
- ❌ Action tick costs are enforced and displayed clearly - **Displayed but not enforced in execution**
- ❌ Character timers increase by action cost after each action - **Not working**
- ❌ Turn order changes dynamically based on speed and action choices - **Not working**
- ❌ All actions modify world state and show immediate feedback - **Not working** 
- ❌ Environmental interactions work (searching, movement, item handling) - **Not implemented**
- ❌ Players can see character timers counting down between turns - **UI shows static data**

**Phase 2 Completion Required Before Phase 3:** AI integration cannot begin until human player control is fully functional.

---

#### **Phase 3: The Living World (The AI Ghost in the Machine)**

- **Goal:** To cleanly delegate decision-making to an external "brain" (the LLM) while the core game engine remains the sole authority on rules and state changes. AI characters use the same tick-based turn system as human players.

**Prerequisites:** ⚠️ **Phase 2 must be complete and functional** with working tick-based turn system.

**Technical Architecture Decisions (Finalized September 6, 2025):**

**LLM Integration Stack:**
- **API Provider:** OpenRouter with OpenAI SDK for multi-model testing
- **Response Format:** Structured JSON: `{"action": "MOVE_ROOM", "target": "medbay", "reasoning": "...", "dialogue": "..."}`
- **Context Strategy:** Rich contextual prompts with full environment state
- **Prompt System:** Abstracted template library for maintainable prompt engineering

**Prompt Template Architecture:**
```javascript
// lib/prompts/PromptLibrary.js - Centralized prompt components
export const ACTION_TEMPLATES = {
  MOVE_INSTRUCTION: "Move to {target} room. Consider: obstacles, distance, stealth needs.",
  SEARCH_INSTRUCTION: "Search {target}. Look for: items, clues, threats. Cost: {ticks} ticks.",
  COMBAT_INSTRUCTION: "Engage {target}. Tactics: cover, weapon choice, team coordination.",
  CHARACTER_STATE: "You are {name}, {personality}. Health: {health}/{maxHealth}. Location: {room}."
};

// Composable prompt building system
const aiPrompt = buildPrompt([
  TEMPLATES.CHARACTER_STATE,
  TEMPLATES.SITUATION_CONTEXT,
  TEMPLATES.AVAILABLE_ACTIONS,
  TEMPLATES.ACTION_TEMPLATES[selectedAction]
]);
```

- **Sub-Phases:**
  1.  **Prompt Template System:** Create `lib/prompts/PromptLibrary.js` with reusable prompt components. Build prompt composition system for easy testing and modification. Template changes propagate to all AI decision points.

  2.  **LLM Service Module:** Create `LLMService.js` with OpenRouter integration. Handle model selection, API calls, JSON response validation, and error handling. Isolate external dependency from game logic.

  3.  **AI Turn Integration:** When AI character's timer ≤ 0, trigger AI decision-making instead of player input. Assemble rich contextual prompt with character state, environment, available actions with tick costs, and personality traits.

  4.  **Context Assembly System:** Build comprehensive context package: current position, inventory, visible environment, personality traits, available actions with tick costs, tactical situation, and mission objectives.

  5.  **AI Action Processing:** Parse and validate AI JSON response. Process through same `processCharacterTurn()` system as human players via TurnManager. Ensure AI follows all game rules and tick cost limitations.

  6.  **Dialogue & Reasoning Logging:** Extend `logStore.js` and `RadioLog.svelte` to capture AI internal thoughts and dialogue from LLM responses. Provide real-time visibility into AI reasoning and decision transparency.

- **Checkpoint:** When it's an AI marine's turn, they automatically think (visible in log), choose a valid action with appropriate tick cost, execute it through the normal TurnManager system, and wait for their timer to count down before acting again. Players can watch the simulation run itself with dynamic turn order.

**Success Criteria:**
- ✅ AI characters take turns using the same tick-based timing as human players
- ✅ AI respects tick costs and speed limitations (no cheating the timer system)
- ✅ AI dialogue and reasoning appears in communication log with clear timestamps
- ✅ AI actions processed through same TurnManager validation as human actions
- ✅ Turn system seamlessly handles mixed AI and human players in dynamic order
- ✅ AI decisions factor in tick costs when choosing between actions (time vs. benefit analysis)
- ✅ Prompt template system allows easy modification of AI instruction without code changes
- ✅ Multi-model testing capability through OpenRouter for behavior comparison

**AI Learning Objectives:**
- Master prompt engineering for tactical decision-making in time-constrained environments
- Understand LLM behavior patterns across different models (Claude vs GPT vs local models)
- Build maintainable AI prompt systems with template reuse and easy modification
- Create transparent AI debugging tools for understanding decision-making processes
- Achieve seamless AI-human player integration through shared game mechanics

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
