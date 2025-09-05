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

#### **3. Data Flow: Anatomy of a Turn**

This is the precise, non-negotiable order of operations for a single game tick.

1.  **UI Interaction:** A player clicks a debug button or enters a command. The Svelte component _does not modify the world directly_. It calls a manager function, pushing a structured action object into `world.actionQueue`.
2.  **Turn Trigger:** A central `nextTurn()` function is called.
3.  **`aiSystem` Runs:**
    - It queries for all entities with an `AIControlComponent`.
    - For each, it generates a prompt and calls the `LLMService`.
    - It pushes the returned action from the LLM into the `world.actionQueue`.
4.  **`actionSystem` Runs:**
    - It iterates through every action in the `world.actionQueue` in order.
    - It executes the logic for each action, directly modifying the `world.components` data.
    - After processing all actions, it clears the `world.actionQueue`.
5.  **`missionSystem` Runs:**
    - It checks the state of components to see if any objective conditions are now met. It might set a `world.gameState` flag (e.g., from 'PLAYING' to 'WON').
6.  **State Commit:** The `nextTurn()` function completes.
7.  **Store Update:** The _final, fully updated_ `world` object is passed to the `worldStore.set(world)` method.
8.  **UI Reactivity:** Svelte detects the store change and all subscribed components (MapView, InfoView, etc.) re-render automatically, displaying the new state of the world.

#### **4. Module Responsibilities**

- **`World.js`:** Defines the shape of the `world` object and provides helper functions for creating entities and attaching components. It is the **database schema**.
- **`systems.js`:** Contains all core game logic (AI, actions, missions). These are the **business logic** functions. They are the only modules that should be modifying the `world` object.
- **`/data/*.json`:** The raw content. These files should know nothing about the game engine. They are **pure data**.
- **`/stores/*.js`:** The public API for the UI. Svelte components should **only** interact with the game engine through these stores (and any exposed manager functions).
- **`/components/*.svelte`:** The presentation layer. These components should be "dumb." They read from stores and display data. They emit user events to be handled by the game logic.

---

#### **5. Current Implementation Status (Phase 2 Complete)**

**✅ Phase 0, 1, & 2 Infrastructure Complete:**

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
- `InfoView.svelte` - Entity inspector with component debugging and world status display  
- `RadioLog.svelte` - AI dialogue log with filtering, real-time updates, and message type differentiation

**Main Interface:**
- `+page.svelte` - Complete terminal-aesthetic game interface with **automatic world initialization on mount**

**🎯 Current State (Phase 2 Complete):**
- **Interactive World**: Fully implemented action system with player-controlled marines
- **Enhanced Data Layer**: All rooms populated with interactive items, furniture, searchable containers, and hiding spots
  - **Docking Bay**: Security keycard, emergency toolkit, searchable cargo containers
  - **Medical Bay**: Medical supplies, diagnostic scanner, searchable medical cabinets
  - **Main Corridor**: Emergency flashlight, equipment locker, maintenance alcove
  - **Command Bridge**: Research data pad, usable command console, communication terminal
- **Complete Action System**: Full implementation of core game mechanics
  - **Movement**: `executeMoveTo()` with door validation, key checking, room connectivity
  - **Item Management**: `executePickUpItem()` with inventory limits, weight management
  - **Exploration**: `executeSearchArea()` with randomized results, item discovery
- **Player Control Interface**: `DebugControls.svelte` provides full marine control
  - Marine selection dropdown with real-time position tracking
  - Dynamic action generation based on context (movement/items/exploration)
  - Turn processing with action queue management
  - Real-time feedback log with categorized messages
- **Complete Game Loop**: UI → action queue → turn processing → world update → UI reactivity

**🎯 Phase 2 Architecture Validated:**
- **Action Queue System**: Working `world.actionQueue` with proper processing
- **Turn-Based Processing**: `nextTurn()` and `processGameTurn()` fully operational
- **Phase-Aware Systems**: Systems activate based on `world.metadata.phase`
- **Real-Time Reactivity**: All changes flow through worldStore to update UI components
- **Debug Infrastructure**: Complete player control and action feedback system

**🔧 Phase 2 Technical Implementation:**
- **World.js Enhanced**: Added `world.roomData` for door checking and item management
- **systems.js Complete**: Full action logic with validation, error handling, and state updates
- **TabbedRightPanel.svelte**: Integrated DebugControls as third tab
- **Comprehensive Error Handling**: Actions validate entity existence, component requirements, and game rules
- **Phase 2 Checkpoint Achieved**: "We can fully play the game as a single marine, moving, picking things up, hiding, and searching. The info panel correctly reflects all state changes in real-time."

**🎯 Ready for Phase 3:**
- **AI System Infrastructure**: `processAISystem()` skeleton ready for LLM integration
- **Prompt Assembly**: Component system ready to build AI context packages
- **Action Validation**: All AI actions will go through same validated action system
- **Logging Integration**: `logStore.js` ready for AI dialogue and reasoning display

---
