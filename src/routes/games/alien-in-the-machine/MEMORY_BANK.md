### **`MEMORY_BANK.md`**

Alien in the Machine

Keep the memory_bank for this project to just this one file

A living record of our key decisions, philosophies, and future ideas.

#### **Core Philosophies**

- **Build Fast, Learn Faster:** Our primary currency is knowledge gained through rapid prototyping.
- **The Simulation is a Playground:** The architecture must make it trivially easy for a developer to modify a JSON file and immediately see the effect in the simulation.
- **Clean Foundations are Non-Negotiable:** It is faster to restart on a solid base than to patch a broken one.
- **Transparency and Debuggability First:** The state of the simulation must be easily inspectable at all times. Our primary UI is also our primary debugger. We cannot fix what we cannot see.

#### **Initial Architectural Decisions (As of Project Start)**

- **Decision:** Chose a "toy" Entity-Component-System (ECS) architecture over Object-Oriented (OOP).
- **Reasoning:** To master a data-driven pattern that cleanly separates data from logic. This avoids rigid class hierarchies and makes adding new features (e.g., a "Flammable" component) possible without touching existing code. This is a foundational learning objective.
- **Decision:** The game engine (`alien-in-the-machine/lib/game`) will be completely UI-agnostic. It will not know that Svelte exists.
- **Reasoning:** This allows the core logic to be tested independently and ensures a clean one-way data flow (`engine -> store -> UI`).
- **Decision:** AI interaction with the game will be mediated through structured JSON.
- **Reasoning:** The LLM's role is decision-making, not rule execution. Forcing it to return a JSON object (e.g., `{ "action": "moveTo", "target": "medbay" }`) eliminates the complexity of natural language parsing and ensures the AI can only perform valid actions the `actionSystem` knows how to handle. This dramatically reduces bugs and unpredictability in the critical early stages.

#### **Phase 0 Completion (January 5, 2025)**

**Status:** ✅ **COMPLETE** - Foundation successfully established

**What Was Built:**
- Complete ECS architecture with World.js (entities, components, systems)
- Comprehensive game systems framework in systems.js
- Rich data models for rooms and marines with JSON files
- Reactive state management with worldStore.js and logStore.js
- Full UI component suite: MapView, InfoView, RadioLog
- Complete terminal-aesthetic game interface
- Integrated debugging tools and entity inspection
- Turn-based game loop infrastructure

**Key Achievements:**
- ✅ SvelteKit application runs without errors
- ✅ Clean separation of concerns (UI-agnostic game engine)
- ✅ Comprehensive JSDoc documentation throughout
- ✅ Extensible component architecture ready for AI integration
- ✅ Real-time reactive UI with store subscriptions
- ✅ Proper project isolation within portfolio structure

**Architecture Validation:**
- ECS pattern working correctly with entities/components separation
- One-way data flow: engine → store → UI established
- Action queue system ready for Phase 2 implementation
- Logging infrastructure prepared for Phase 3 AI dialogue
- Debug tools functional for development support

#### **Phase 1 Completion (September 5, 2025)**

**Status:** ✅ **COMPLETE** - Data-driven world successfully implemented

**What Was Built:**
- **Complete World Initialization**: `initWorld()` function fully implemented to create entities from JSON data
- **JSON Data Loading**: Automatic loading of rooms.json and marines.json on application mount
- **Real Entity System**: 7 entities created (4 rooms + 3 marines) with proper ECS component structure
- **Interactive Map Rendering**: MapView now displays actual entities from worldStore with real-time reactivity
- **Entity Selection System**: Click handlers working for both rooms and marines with complete component inspection
- **Phase Progression**: Game properly tracks and displays current phase status

**Key Achievements:**
- ✅ **Data-first architecture**: World state entirely derived from external JSON files
- ✅ **Full ECS implementation**: Entities with proper component data (isMarine, isRoom, position, health, inventory, personality, skills, tag, environment)
- ✅ **Reactive UI system**: All changes flow through worldStore to update components automatically
- ✅ **Interactive debugging**: Entity inspector shows complete component data for any selected entity
- ✅ **Station layout functional**: 4-room station properly positioned and connected
- ✅ **Marine positioning**: All three marines correctly placed in Docking Bay from JSON data

**Architecture Validation:**
- JSON → ECS entities → reactive stores → UI components data flow working perfectly
- Entity selection system functional with real-time component inspection
- World state properly initialized with 7 entities and complex component structure
- Phase progression tracking implemented and displayed
- MapView renders dynamic content from worldStore with proper reactivity
- Game state management working (INITIALIZING → PLAYING transition)

**Critical Phase 1 Learnings:**
- **ECS Pattern Validated**: The "toy" ECS architecture handles complex entity relationships effectively
- **Data Modularity Achieved**: JSON files can be modified independently of code, making world "moddable"
- **Component System Proven**: Rich component data (personality, skills, environment) loads correctly
- **Reactive Architecture Working**: Svelte stores provide seamless UI updates when world state changes
- **Debug Infrastructure Solid**: Entity inspector provides clear visibility into ECS component data

**Ready for Phase 2:** Action queue implementation, player-controlled marines, and interactive game mechanics

#### **Phase 2 Completion (September 5, 2025)**

**Status:** ✅ **COMPLETE** - Interactive action system successfully implemented

**What Was Built:**
- **Enhanced Data Layer**: Complete room population with interactive elements
  - **rooms.json v0.2.0**: All 4 rooms now contain items, furniture, searchable containers, and hiding spots
  - **Interactive Items**: Security keycard, medical supplies, tools, data pads with proper pickup/use mechanics
  - **Furniture Systems**: Cargo containers, medical cabinets, equipment lockers with search mechanics
- **Complete Action System Implementation**: Full game mechanics in `systems.js`
  - **executeMoveTo()**: Door validation, key checking, room connectivity, position updates
  - **executePickUpItem()**: Inventory management, weight limits, item transfer mechanics
  - **executeSearchArea()**: Randomized search with difficulty rolls, item discovery system
- **Player Control Interface**: `DebugControls.svelte` - comprehensive marine control system
  - Marine selection with real-time position tracking
  - Dynamic action generation based on marine context and location
  - Turn processing with action queue management and real-time feedback
- **Complete Game Loop Integration**: UI → action queue → turn processing → world updates → UI reactivity
- **Enhanced World Architecture**: `World.js` updated with `world.roomData` for item/door management

**Key Achievements:**
- ✅ **Player-Controlled Marines**: Full marine control with contextual actions
- ✅ **Interactive World**: Items can be picked up, areas searched, doors unlocked with keys
- ✅ **Turn-Based Processing**: Complete action queue system with proper validation
- ✅ **Real-Time Feedback**: All actions provide immediate UI updates and error handling
- ✅ **Phase-Aware Systems**: Game systems activate based on current phase settings
- ✅ **Integrated UI**: DebugControls added as third tab in TabbedRightPanel

**Architecture Validation:**
- **Action System Proven**: All core game mechanics working with proper validation
- **ECS Pattern Validated**: Complex interactions handled cleanly through component system
- **Data-Driven Design**: Room interactions entirely driven by JSON configuration
- **Reactive Architecture**: Svelte stores provide seamless real-time updates
- **Error Handling**: Comprehensive validation prevents invalid game states

**Critical Phase 2 Learnings:**
- **Action Queue Architecture**: Turn-based processing enables complex multi-action gameplay
- **Component Modularity**: Interactive elements easily added through JSON without code changes
- **State Management**: Direct world modification in systems with reactive store updates works perfectly
- **UI Integration**: Debug controls provide excellent testing interface for game mechanics
- **Data Structure**: `world.roomData` separation enables complex door/item interactions

**Phase 2 Bugs & Known Issues (For Future Debugging):**
- **Search Results Display**: Found items may not always appear correctly in room after search
- **Inventory Reactivity**: Inventory updates may not reflect immediately in InfoView
- **Door Lock Status**: Bridge door lock status may not update properly after using keycard
- **Action Feedback**: Some action error messages could be more descriptive
- **Phase Transition**: Setting phase to 2 may require manual refresh to show all functionality

**Ready for Phase 3:** AI system integration, LLM service implementation, and autonomous marine behavior

#### **File Locations for Bug Fixing (Phase 2)**

**Core Game Logic:**
- `lib/game/systems.js` - All action implementations (movement, pickup, search)
- `lib/game/World.js` - Entity/component management, world initialization
- `lib/stores/worldStore.js` - State management, action queue processing

**UI Components:**
- `lib/components/DebugControls.svelte` - Player control interface, action generation
- `lib/components/TabbedRightPanel.svelte` - Tab integration
- `lib/components/MapView.svelte` - Visual updates after actions
- `lib/components/InfoView.svelte` - Entity inspection, component display

**Data Files:**
- `lib/data/rooms.json` - Interactive items, furniture, searchable areas
- `lib/data/marines.json` - Marine attributes, starting inventories

#### **Future Ideas & Wishlist (Parking Lot)**

- Capture the LLM's "actions I wish I could take" response to generate a backlog of new feature ideas.
- Consider a `SensesComponent` that defines what an entity can see/hear, limiting the information the `aiSystem` provides in its prompt.
- Evolve the `actionSystem` to handle actions that take multiple turns.
- Add keyboard accessibility handlers for map interactions
- Implement save/load game state functionality
- Consider WebGL rendering for larger station layouts
- Add sound effects for actions (pickup, movement, search)
- Implement item combination mechanics
- Add environmental hazards and damage systems
