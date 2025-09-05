### **`ARCHITECTURE_PLAN.md`**

Alien in the Machine

This document outlines the architectural philosophy and technical design. It is the single source of truth for _how_ we build and _why_ we build it this way.

#### **1. Core Philosophy**

- **Build to Learn:** Our goal is to understand architecture. Code should be written for human readability first. Use descriptive variable names, write extensive JSDoc comments explaining the _intent_ of functions and data structures.
- **Iterate and Rebuild:** This prototype is disposable. Do not over-engineer solutions for problems we don't have yet. Build the simplest thing that satisfies the current phase's requirements.
- **AI as a Collaborator:** The AI agent writes code; the human architect reviews it. The code must be transparent and easy to reason about. This means avoiding overly clever or opaque code. Functions should be small and have a single responsibility.

#### **2. Core Architecture: "Toy" Entity-Component-System (ECS)**

The entire state of the game is contained within a single JavaScript object we call the `world`. This pattern enforces a complete separation of data and logic.

- **Entity:** A simple number (ID). It is nothing but a key.
- **Component:** Pure data. Stored in the `world` object, indexed by entity ID.
  - **Technical Example:** `Entity #5` is a marine named "Rook" in the medbay. This is represented as:
    ```javascript
    world: {
      components: {
        isMarine: { 5: { name: 'Rook' } },
        position: { 5: { roomId: 'medbay' } },
        health:   { 5: { current: 90, max: 100 } }
        tag:      { 5: { name: 'marine_rook' } }  // We use this for debugging
        // Note: Entity #5 has no 'inventory' component yet.
      },
      // ... other world data
    }
    ```
  - To find where Rook is, you query `world.components.position[5]`. To see if an entity is a marine, you check `if (world.components.isMarine[entityId])`.
- **System:** A pure function that takes the `world` object as an argument, performs logic, and often returns a set of changes to be applied. It is the "verb" to the component "noun."

#### **3. Data Flow: Tick-Based Turn System**

This game uses **speed-based tick timers** where actions directly cost time, creating a unified and elegant turn system. This is the precise, non-negotiable order of operations for the tick-based system.

**Core Turn Mechanics:**
- **Speed-Based Timers:** Each character has countdown timer and speed stat (higher speed = faster countdown)
- **Tick-Cost Actions:** Actions cost time directly (Move Room=10 ticks, Search=6 ticks, Quick Look=3 ticks)
- **Dynamic Turn Order:** Character with lowest timer value gets to act next
- **Unified System:** Speed, timing, and actions all use the same tick currency

**Tick-Based Turn Flow:**

1.  **Turn Determination:**
    - `TurnManager.getNextCharacterToAct(world)` finds character with timer ≤ 0
    - Game displays active character: *"Rook can act (Search costs 6 ticks)"*
    - Only the active character can perform actions

2.  **Player Action Selection:**
    - Player clicks action button showing tick cost: *"Move to Medical Bay (10 ticks)"*
    - Svelte component calls `executeCharacterAction(characterId, actionType)`
    - Action cost retrieved from centralized `ActionCosts.js`

3.  **Action Validation:**
    - Validates action is legal for current character and world state
    - No "insufficient resource" checks needed - any character can take any action
    - Returns error only if action is impossible (e.g., move to non-connected room)

4.  **Single Action Processing:**
    - Action logic executes immediately, modifying world components
    - `TurnManager.executeAction()` adds tick cost to character's timer
    - **NO ACTION QUEUE** - actions processed individually and immediately

5.  **Timer Update:**
    - Character's timer increases by action cost (e.g., timer becomes 10 after "Move Room" action)
    - Character now must wait for timer to count down before acting again
    - Turn immediately available to next character with timer ≤ 0

6.  **Continuous Time Progression:**
    - `TurnManager.advanceTick()` subtracts each character's speed from their timer
    - Fast characters (high speed) count down quickly, slow characters count down slowly
    - Multiple characters may reach timer ≤ 0 simultaneously

7.  **AI Turn Processing (Phase 3):**
    - When AI character's timer ≤ 0, trigger AI decision-making
    - AI gets context including available actions with tick costs
    - AI action processed through same `TurnManager.executeAction()` system

8.  **State Update & UI Reactivity:**
    - Each action immediately updates `worldStore`
    - UI shows all character timers: *"Sarge: 3 ticks, Rook: ready, Doc: 7 ticks"*
    - Dynamic turn indicators update based on who can act next

**Key Architecture Points:**
- **Unified Currency:** Everything uses ticks - no separate systems to manage
- **Proportional Speed:** 2x speed = ~2x more actions (elegant scaling)
- **Tactical Depth:** Action choice directly affects turn timing
- **Immediate Feedback:** Every action shows tick cost and timer changes
- **Dynamic Order:** Turn sequence changes based on speed and action choices
- **Modular Logic:** All turn mechanics isolated in `TurnManager.js`

#### **4. Module Responsibilities**

- **`World.js`:** Defines the shape of the `world` object and provides helper functions for creating entities and attaching components. It is the **database schema**. Contains turn system state structure (`turnSystem`, `actionPoints` component).

- **`systems.js`:** Contains all core game logic (AI, actions, missions, **turn management**). These are the **business logic** functions. Key turn system functions: `processCharacterAction()`, `validateCharacterAction()`, `advanceToNextCharacter()`. They are the only modules that should be modifying the `world` object.

- **`/data/*.json`:** The raw content. These files should know nothing about the game engine. They are **pure data**. Marines.json defines turn order through entity creation sequence.

- **`/stores/*.js`:** The public API for the UI. Svelte components should **only** interact with the game engine through these stores. Key turn functions: `executeCharacterAction()`, `endCurrentTurn()`, `getCurrentCharacterDetails()`.

- **`/components/*.svelte`:** The presentation layer. These components should be "dumb." They read from stores and display data (including current character and action points). They emit user events to be handled by the game logic. Must show action costs and enforce turn-based interactions.

---

#### **5. Current Implementation Status (Phase 1 Complete)**

**✅ Phase 0 & 1 Infrastructure Complete:**

**Core Game Engine (`lib/game/`):**
- `World.js` - Complete ECS foundation with all component types defined, helper functions implemented, and **full `initWorld()` function** that creates entities from JSON data
- `systems.js` - Full system architecture with phase-aware processing, action handling, and AI hooks prepared

**Data Layer (`lib/data/`):**
- `rooms.json` - Complete 4-room station layout with detailed environmental data, door connections, and expansion plans
- `marines.json` - Three distinct marines (Sarge, Rook, Doc) with full personality profiles, skills, and AI-ready attributes

**State Management (`lib/stores/`):**
- `worldStore.js` - Complete reactive store with derived stores, manager functions, debug utilities, and **working `initializeWorld()` function** that loads JSON data
- `logStore.js` - Comprehensive logging system with message filtering, real-time updates, and AI dialogue support

**UI Components (`lib/components/`):**
- `MapView.svelte` - **Fully functional** interactive station map with real entity visualization, click handlers, and reactive data from worldStore
- `TurnControl.svelte` - **Enhanced turn management interface** with categorized action selection, character status display, and tick-based turn system integration
- `TabbedRightPanel.svelte` - **Tabbed interface** organizing Turn Control (default), Entity Inspector, and Communication Log
- `InfoView.svelte` - Entity inspector with component debugging and world status display  
- `RadioLog.svelte` - AI dialogue log with filtering, real-time updates, and message type differentiation

**Main Interface:**
- `+page.svelte` - Complete terminal-aesthetic game interface with **automatic world initialization on mount** and integrated tabbed right panel

**🎯 Current State (Phase 1 Complete):**
- **Data-driven world**: 7 entities (4 rooms + 3 marines) loaded from JSON files
- **Full ECS implementation**: Real entities with proper component data (isMarine, isRoom, position, health, inventory, personality, skills, tag, environment)
- **Interactive entity system**: Click any room or marine to inspect complete component data
- **Reactive UI**: All changes flow through worldStore to update components in real-time
- **Phase progression working**: Game shows "Phase 1" status and "PLAYING" state
- **Station layout functional**: 4-room station (Docking Bay, Main Corridor, Medical Bay, Command Bridge) with proper positioning
- **Marine positioning**: All three marines (Sarge, Rook, Doc) correctly positioned in Docking Bay from JSON data

**🎯 Pre-Phase 2 UI Foundation Complete:**
- **Enhanced Turn Interface**: TurnControl component with categorized action selection UI ready for Phase 2 implementation
- **Tabbed Right Panel**: Clean organization of Turn Control (default), Entity Inspector, and Communication Log
- **Action Categorization**: UI structure prepared for CORE_ACTIONS, MEDICAL_ACTIONS, TECHNICAL_ACTIONS, ENVIRONMENTAL_ACTIONS, COMBAT_ACTIONS
- **Character Status Display**: Real-time character timers, speeds, and turn readiness indicators
- **Tick System Integration**: UI properly displays tick costs and timer countdowns for Phase 2 testing
- **Scalable Interface**: Categorized action groups will expand to show individual actions with tick costs in Phase 2

**🎯 Ready for Phase 2 Implementation:**
- **Turn System Foundation**: Character-centric turn system architecture needs implementation to replace current batch processing
- **Component System**: All interactive components pre-defined (pickupable, usable, door, searchable, hideable)  
- **Entity Selection**: Working selection system ready for player control integration
- **Debug Infrastructure**: Entity inspector ready to show action results in real-time
- **Action Selection UI**: Categorized interface ready for player-controlled marine actions

**⚠️ Architecture Conflict**: Current `world.actionQueue` and `processGameTurn()` batch processing conflicts with character-centric design and must be replaced with individual turn management before Phase 2.

**🔧 Development Notes:**
- All code includes comprehensive JSDoc documentation
- Phase progression tracked in `world.metadata.phase` and displayed in UI
- Architecture validated: SvelteKit runs without errors, full reactivity confirmed
- JSON data structure rich and ready for Phase 2 expansion (items, furniture, interactive elements)
- Accessibility warnings present but non-blocking (keyboard handlers needed for map interactions)
- **Phase 1 Checkpoint Achieved**: "We see the 4-room station laid out with REAL entities loaded from JSON data. We see dots representing our marines (Sarge, Rook, Doc) in their starting room (Docking Bay). Clicking on any room or marine shows its complete component data in the info panel."

---
