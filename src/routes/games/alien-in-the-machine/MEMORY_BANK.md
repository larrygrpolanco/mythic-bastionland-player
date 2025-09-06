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

#### **Critical Turn System Decision (Pre-Phase 2 Clarification)**

- **Decision:** Tick-based turn system where actions directly cost time, NOT separate action points or fixed turn order.
- **Reasoning:** This was a planning oversight that needed immediate correction. The original character-centric approach with action points was still too complex - having both speed AND action points created unnecessary dual systems. The elegant solution: actions cost time ticks directly. Fast characters act more often because their timers count down faster. Heavy actions delay you longer than light actions.
- **Technical Impact:** Unified system where everything uses tick currency. Character speeds determine countdown rate. Action costs determine delay until next turn. No action queues, no turn boundaries, no action point tracking - just timers and speed. Dynamic turn order based on who reaches timer ≤ 0 first.
- **AI Integration:** When it's an AI character's turn in Phase 3, they see the same action costs and make decisions about time vs. benefit tradeoffs, just like human players. AI must consider "is this 10-tick action worth the delay?" creating natural tactical AI behavior.
- **Learning Value:** Forces us to think about time as the fundamental resource in tactical games. Speed becomes meaningful. Action choice has immediate consequences. Eliminates arbitrary gamey mechanics in favor of intuitive time-based decisions.
- **Architectural Beauty:** Entire complex turn system reduces to: `TurnManager.getNextCharacterToAct()` → action selected → `TurnManager.executeAction(cost)` → repeat. Modular, testable, understandable.

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

**Ready for Phase 2:** Character-centric turn system implementation, action point mechanics, and player-controlled individual marine turns

**⚠️ Critical Pre-Phase 2 Requirement:** The current `world.actionQueue` system must be **replaced** with character-centric turn management. The existing batch-processing approach in systems.js conflicts with the individual turn design and needs architectural revision before Phase 2 implementation.

#### **UI Enhancement Completion (September 5, 2025)**

**Status:** ✅ **COMPLETE** - Enhanced turn control interface successfully implemented

**What Was Built:**
- **TurnControl.svelte**: Comprehensive turn management component with categorized action selection, character status display, and tick-based turn system integration
- **TabbedRightPanel.svelte**: Enhanced tabbed interface organizing Turn Control as default tab, Entity Inspector, and Communication Log
- **Integrated UI Architecture**: Removed standalone TurnDisplay component and integrated all turn functionality into organized tabbed interface

**Key Achievements:**
- ✅ **Categorized Action Selection**: UI structure prepared for CORE_ACTIONS, MEDICAL_ACTIONS, TECHNICAL_ACTIONS, ENVIRONMENTAL_ACTIONS, COMBAT_ACTIONS
- ✅ **Character-Centric Interface**: Clear active character display with speed and timer status
- ✅ **Tick System Integration**: UI properly shows tick costs and character readiness states
- ✅ **Scalable Design**: Action categories ready to expand with individual actions in Phase 2
- ✅ **Clean Organization**: Turn Control as primary interface with seamless tab switching

**Architecture Benefits:**
- **Phase 2 Ready**: Categorized interface eliminates "unwieldy" action menu concern
- **User Experience**: Clear character status and action cost visibility for tactical decisions  
- **Maintainable Code**: Modular components with clear separation of concerns
- **Testing Friendly**: Organized interface perfect for Phase 2 player-controlled marine testing
- **AI Integration Ready**: Same interface will work for AI character actions in Phase 3

**Critical Phase 2 Foundation:** The enhanced UI provides the essential foundation for player-controlled marine actions, making Phase 2 testing smooth and intuitive rather than overwhelming.

#### **Phase 3 AI Integration Decisions (September 6, 2025)**

**Status:** **PLANNING COMPLETE** - Technical architecture decisions finalized for implementation

**Key Technical Decisions:**

- **Decision:** Use OpenRouter API with OpenAI SDK for LLM integration
- **Reasoning:** Enables testing multiple models (Claude, GPT-4, local models) through single interface. Provides flexibility for comparing AI behavior across different models without changing code architecture.

- **Decision:** Rich contextual prompts with full environment state
- **Reasoning:** AI needs complete tactical picture to make intelligent decisions. Include character state, visible environment, available actions with tick costs, personality traits, and current situation. This requires extensive testing and debugging but creates more believable AI behavior.

- **Decision:** Structured JSON responses from AI
- **Reasoning:** LLMs excel at structured output when given clear instructions. Format: `{"action": "MOVE_ROOM", "target": "medbay", "reasoning": "...", "dialogue": "..."}`. Eliminates natural language parsing complexity and ensures AI can only perform valid actions.

- **Decision:** Abstracted prompt template system
- **Reasoning:** Critical for maintainability and testing. Core instructions (movement, combat, searching) stored in separate prompt library files. Change one move instruction template, update everywhere that uses it. Enables rapid prompt iteration and A/B testing.

**Template Architecture Pattern:**
```javascript
// lib/prompts/PromptLibrary.js - Centralized prompt components
export const CORE_TEMPLATES = {
  MOVE_INSTRUCTION: "Move to {target}. Consider: distance={distance}, stealth needs, obstacles.",
  SEARCH_INSTRUCTION: "Search {target} for items/clues. Time cost: {ticks} ticks.",
  CHARACTER_STATE: "You are {name}, {personality}. Health: {health}. Location: {room}."
};

// Composable prompt building
const aiPrompt = buildPrompt([
  TEMPLATES.CHARACTER_STATE,
  TEMPLATES.SITUATION_CONTEXT,
  TEMPLATES.AVAILABLE_ACTIONS,  
  TEMPLATES.MOVE_INSTRUCTION
]);
```

**AI Integration Benefits:**
- **Multi-Model Testing:** Easy comparison between Claude, GPT, and local models
- **Rich Decision Context:** AI sees full tactical situation for intelligent choices  
- **Maintainable Prompts:** Template changes propagate automatically
- **Structured Responses:** No parsing ambiguity, validated JSON output
- **Same Turn System:** AI characters use identical tick mechanics as human players

**Phase 3 Learning Objectives:**
- Master prompt engineering for tactical AI behavior
- Understand LLM decision-making patterns in time-constrained scenarios
- Build robust AI-human interaction systems with shared game mechanics
- Create debugging tools for AI reasoning and decision transparency

#### **Phase 2 Reality Check (September 6, 2025)**

**Status:** **IN PROGRESS** - Significant work remaining before checkpoint

**Critical Gap Analysis:**
Despite having strong UI foundation and architectural framework, core Phase 2 functionality is incomplete:

- **Action Execution Pipeline:** TurnControl → worldStore → systems → TurnManager flow is broken
- **Interactive Object System:** Entity creation for items/furniture incomplete  
- **World State Updates:** Character actions not properly modifying world components
- **Turn Progression:** Timer updates and character sequencing needs debugging
- **Movement System:** Room-to-room navigation not implemented
- **Inventory Management:** Item pickup/drop mechanics incomplete

**Key Learning:** UI-first development created false confidence. The interface looks ready but the underlying game mechanics need substantial implementation work before Phase 2 checkpoint can be achieved.

**Phase 2 Checkpoint Requirement:** "Player can control individual marines through the tick system. Each character performs one action per turn (with associated tick cost), then waits for their timer to count down based on speed before acting again. Turn order is dynamic based on action choices."

**Current Reality:** Framework exists but core execution is non-functional. Must complete Phase 2 before Phase 3 AI integration.

#### **Future Ideas & Wishlist (Parking Lot)**

- Capture the LLM's "actions I wish I could take" response to generate a backlog of new feature ideas.
- Consider a `SensesComponent` that defines what an entity can see/hear, limiting the information the `aiSystem` provides in its prompt.
- Evolve the `actionSystem` to handle actions that take multiple turns.
- Add keyboard accessibility handlers for map interactions
- Implement save/load game state functionality
- Consider WebGL rendering for larger station layouts
