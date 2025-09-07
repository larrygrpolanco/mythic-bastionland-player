### **`MEMORY_BANK.md`**

Alien in the Machine - Version 2 (Clean Start)

A living record of our key decisions, philosophies, lessons learned from Version 1, and architectural innovations for Version 2.

#### **Core Philosophies**

- **Build Fast, Learn Faster:** Our primary currency is knowledge gained through rapid prototyping.
- **Unified Decision Pipeline:** Human players and AI must use the exact same decision-making flow. This is non-negotiable and architectural.
- **Foundation First:** Build systems correctly from the start rather than retrofitting. The tick-based turn system and context assembly are foundational, not add-ons.
- **Template-Driven Consistency:** All text (UI, prompts, descriptions) comes from shared templates. Change once, update everywhere.
- **Working Stubs Over Mocks:** Create early versions that look and work like final systems, not just placeholders.

#### **Critical Lessons Learned from Version 1**

**What Worked Well:**
- **ECS Architecture:** Entity-Component-System pattern proved solid and extensible
- **Three-Panel UI Layout:** Map left, tabbed right panel, status bottom was effective
- **Terminal Aesthetic:** Retro sci-fi UI was compelling and well-received
- **JSON Data Modularity:** Room and character data in separate files made world easily "moddable"
- **Phase-Based Development:** Clear progression through phases helped focus development
- **Documentation Quality:** Extensive JSDoc comments and architectural docs were invaluable

**What Failed and Why:**
- **Retrofitted Tick System:** Adding tick-based turns later caused architectural conflicts with the original batch-processing system
- **Monolithic Systems:** Single `systems.js` file became unwieldy and hard to debug
- **Broken Action Pipeline:** Despite polished UI, the core action execution path from UI → Store → Systems → World was non-functional
- **Debugging-First UI:** Built for debugging rather than user experience, then tried to make it user-friendly
- **Mock vs. Real Systems:** Mock systems didn't match how real systems would work, causing integration issues
- **Phase 2 Trap:** Achieved beautiful Phase 1 (data loading, reactive UI) but got stuck in Phase 2 because action execution was fundamentally broken

**The Core Problem Diagnosis:** Version 1 suffered from "UI-first" development that created a false sense of progress. The interface looked ready but the underlying game mechanics were non-functional. This is a classic architectural mistake: building the presentation before ensuring the foundation works.

#### **Version 2 Architectural Innovations**

**1. Unified Decision Pipeline (The Key Innovation)**
```
Decision Maker → Context Assembly → Action Selection → Validation → Execution → World Update
     ↑                                    ↑
Human UI Player                    LLM Player
(clicks button)                   (JSON response)
```

- **Decision:** Human players and AI use identical decision-making flows
- **Reasoning:** This eliminates the "two different games" problem where human rules differed from AI rules. It also means we can test the full AI pipeline using human players before adding LLM complexity.
- **Technical Impact:** Context assembly, action generation, validation, and execution are shared between human and AI paths. Only the decision-maker differs.
- **Learning Value:** Forces us to think about game mechanics from both human and AI perspectives simultaneously.

**2. Tick-Based Turn System as Foundation**
- **Decision:** Tick system built into the architecture from day 1, not retrofitted
- **Reasoning:** Version 1's batch-processing approach conflicted with individual character turns. The tick system handles both naturally through a priority queue.
- **Technical Impact:** All systems designed around "readyAt" times and action costs. Turn order emerges from the system rather than being managed separately.
- **AI Integration:** AI sees action costs in context and can make tactical time-vs-benefit decisions naturally.

**3. Modular System Architecture**
- **Decision:** Split monolithic `systems.js` into focused modules (ActionSystem, MovementSystem, InteractionSystem, etc.)
- **Reasoning:** Version 1's single file became unmaintainable. Focused modules are easier to debug, test, and extend.
- **Implementation:** Each system has clear responsibilities and interfaces. ActionSystem coordinates, while specialized systems handle specific logic.

**4. Context-Driven Action Generation**
- **Decision:** Actions are generated dynamically based on world state, not from static lists
- **Reasoning:** This ensures human UI and AI context always match actual possibilities. No "invalid action" edge cases.
- **Example:** Move actions include specific doors with calculated costs, examine actions list only visible entities.

**5. Template-Based Prompting System**
- **Decision:** All text (UI labels, AI prompts, descriptions) comes from shared templates
- **Reasoning:** Ensures consistency between what humans see and what AI processes. Changes propagate everywhere automatically.
- **Implementation:** PromptTemplates.js contains template components that compile to different formats for UI vs. AI use.

#### **Phase Development Strategy (LLM-Friendly)**

**Learning from Version 1's Phase 2 Trap:**
Version 1 achieved polished Phase 1 (data loading, reactive UI) but got stuck in Phase 2 because the action execution system wasn't actually functional. The interface looked ready but couldn't execute actions.

**Version 2 Solution: Working Stubs**
Each phase builds functional systems that work like final versions, not just mocks:

**Phase 0: Modular Foundation (Foundation Session)**
- **Goal:** Create file structure with proper interfaces and working stubs
- **Working Output:** All modules exist with proper JSDoc, interfaces work, data flows through the system
- **Validation:** Context assembly returns proper data structures, turn queue operates correctly
- **LLM Session Length:** 1-2 sessions to create foundation

**Phase 1: Context-Driven Human Actions (Core Mechanics Session)** 
- **Goal:** Human player can perform real actions through unified decision pipeline
- **Working Output:** UI displays context-aware actions, execution works through ActionSystem to specialized systems
- **Validation:** Human can move between rooms, examine objects, perform basic interactions
- **LLM Session Length:** 2-3 sessions to implement working action pipeline

**Phase 2: Template System & AI Integration (AI Integration Session)**
- **Goal:** AI uses same context and action execution as humans
- **Working Output:** LLM receives rich context, makes structured decisions, actions execute through same systems
- **Validation:** AI character takes turns, makes valid actions, follows game rules
- **LLM Session Length:** 2-3 sessions for prompt templates and LLM integration

**Phase 3: Advanced Features (Polish Session)**
- **Goal:** Complete interaction systems, add mission objectives, polish UI
- **Working Output:** Full game experience with objectives, complex interactions, polished interface
- **Validation:** Complete game loop with win/loss conditions, rich interactions
- **LLM Session Length:** 2-3 sessions for final features

#### **Critical Architectural Decisions (Pre-Phase 1 Requirements)**

**Decision: Context Assembly Before UI**
- **Reasoning:** Version 1 built UI first, then struggled to make it functional. Version 2 builds context assembly first, then UI displays the context.
- **Impact:** UI automatically shows correct options because context generation ensures validity.

**Decision: Shared Action Execution Path**
- **Reasoning:** Human and AI actions must use identical validation and execution to prevent "two games" divergence.
- **Impact:** Any action human can take, AI can take. Any game rule applies equally to both.

**Decision: Priority Queue Turn Management**
- **Reasoning:** Simple, elegant, handles all edge cases. Characters naturally reorder based on action costs.
- **Impact:** Fast characters act more often, heavy actions delay appropriately, no special cases needed.

**Decision: Template-Driven Text**
- **Reasoning:** Consistency between UI and AI prompts is crucial. Templates ensure they stay synchronized.
- **Impact:** Modify action description once, updates in both UI buttons and AI context.

#### **Technical Integration Points**

**ECS Integration with Turn System:**
- Turn queue stores character IDs that map to ECS entities
- Speed component determines countdown rate
- Action costs come from centralized ActionCosts.js
- World state changes flow through ECS component updates

**Context Assembly Integration:**
- Queries ECS components to build character state
- Uses World.js helpers to find related entities (rooms, items, etc.)
- ActionBuilder.js generates available actions based on ECS queries
- Templates compile with actual world data

**AI Integration Points:**
- ContextAssembler builds same data for AI as human UI uses
- LLMService receives composed prompts from templates
- ResponseParser validates AI JSON responses
- AI actions flow through same ActionValidator and execution systems

#### **Version 2 Success Metrics**

**Phase 0 Success:** All file stubs exist, interfaces work, data flows through system
**Phase 1 Success:** Human player can move, examine, interact through unified pipeline
**Phase 2 Success:** AI takes turns using same systems, makes valid contextual decisions
**Phase 3 Success:** Complete game experience with objectives and polished interactions

#### **Future Expansion Ideas (Parking Lot)**

- **Multi-Character Control:** Human controls multiple marines simultaneously
- **Procedural Station Generation:** Larger, randomly generated station layouts
- **Advanced AI Personalities:** Distinct behavioral patterns based on marine background
- **Cooperative AI:** Multiple AI characters coordinate and communicate
- **Dynamic Objectives:** Mission goals that change based on discoveries
- **Environmental Hazards:** Fire, depressurization, alien presence affecting decisions

#### **Development Anti-Patterns to Avoid**

- **UI-First Development:** Always build working foundation before polished interface
- **Mock Instead of Stub:** Create working early versions, not placeholders
- **Monolithic Systems:** Keep system modules focused and testable
- **Divergent Paths:** Human and AI must use identical game mechanics
- **Static Action Lists:** Actions must be generated from actual world state
- **Scattered Text:** All prompts and descriptions come from templates

#### **Phase 0.1 Implementation Status (September 6, 2025)**

**Status:** ✅ **COMPLETE** - Foundation successfully established and validated

**What Was Actually Built:**

**Core Architecture (15 Modules):**
- **`World.js`** - Complete ECS foundation with entity/component management, JSON data loading, and helper functions
- **`worldStore.js`** - Reactive Svelte store with derived stores for UI, automatic world initialization, and action execution bridge
- **`TurnManager.js`** - Priority queue turn system with character timers, tick advancement, and readiness calculation
- **`ActionSystem.js`** - Action execution coordinator that delegates to specialized systems
- **`MovementSystem.js`** - Room navigation logic with connection validation (foundation stub)
- **`InteractionSystem.js`** - Examine and search actions with skill-based contextual information (foundation stub)
- **`ActionTypes.js`** - Complete action definitions with requirements, costs, and UI metadata
- **`ActionValidator.js`** - Unified validation ensuring identical rules for human/AI actions (foundation stub)
- **`ActionCosts.js`** - Centralized tick costs with skill and environment modifiers
- **`ContextAssembler.js`** - Context building functions for unified human/AI decision pipeline (foundation stub)
- **`ActionBuilder.js`** - Dynamic action generation based on world state and character position (foundation stub)
- **`PromptTemplates.js`** - Template system with compile functions for UI/AI text consistency (foundation stub)
- **`LLMService.js`** - OpenRouter/OpenAI integration with mock responses for Phase 0.1 testing
- **`ResponseParser.js`** - LLM response processing with fallback strategies (foundation stub)
- **`+page.svelte`** - Complete terminal-style game interface with foundation status display and reactive world integration

**UI Components (5 Complete):**
- **`MapView.svelte`** - Interactive station map displaying rooms and marines from world state
- **`TabbedRightPanel.svelte`** - Organized tabbed interface (Turn Control, Inspector, Radio Log)
- **`TurnControl.svelte`** - Character status display and categorized action interface ready for Phase 1
- **`InfoView.svelte`** - Entity inspector with complete component data debugging
- **`RadioLog.svelte`** - Communication log with filtering, timestamps, and AI dialogue integration ready

**Data Integration:**
- **`rooms.json`** - 4-room station layout (Docking Bay, Main Corridor, Medical Bay, Command Bridge) with doors, environment, and expansion data
- **`marines.json`** - 3 distinct marines (Sarge, Rook, Doc) with personalities, skills, health, and speed values

**Key Phase 0.1 Achievements:**

1. **Unified Decision Pipeline Foundation:** All context assembly, action building, and validation systems share identical interfaces for human/AI use
2. **Working ECS Implementation:** 7 entities created (4 rooms + 3 marines) with proper component structure and relationships
3. **Foundation-First Success:** Every system is a working stub that matches final architecture, not a mock placeholder
4. **Export Resolution:** Fixed all import/export issues including `getAllEntitiesWith` alias and `gameStatusStore` missing export
5. **Reactive UI Integration:** Complete data flow from JSON → ECS → Stores → UI with real-time updates
6. **Terminal Aesthetic:** Authentic retro sci-fi interface with proper foundation status indicators
7. **Debug Infrastructure:** Entity inspector shows complete component data, world statistics, and system status
8. **Template System Foundation:** Consistent text generation system ready for Phase 1 UI/AI synchronization

**Critical Validation Results:**

✅ **All files exist and import without errors** - Resolved export issues, clean module dependencies
✅ **World.js creates entities from JSON data** - 7 entities with proper ECS component structure
✅ **TurnManager.js initializes turn queue** - Priority queue operational with character readiness calculation  
✅ **ContextAssembler.js builds context structures** - Foundation interfaces ready for Phase 1 enhancement
✅ **UI loads and displays world data** - Complete terminal interface with reactive world state display

**Development Server Status:** Running successfully at `http://localhost:5173/games/alien-in-the-machine-v2`

**Phase 0.1 vs Version 1 Comparison:**

**V1 Problem:** Beautiful UI with non-functional underlying systems (UI-first trap)
**V2 Solution:** Working systems from day 1 with foundation-first approach

**V1 Problem:** Monolithic `systems.js` file became unmaintainable  
**V2 Solution:** 15 focused modules with clear responsibilities and interfaces

**V1 Problem:** Retrofitted tick system caused architectural conflicts
**V2 Solution:** Tick-based priority queue built as foundation architecture

**V1 Problem:** Human and AI used different action pipelines ("two games")
**V2 Solution:** Unified decision pipeline ensures identical human/AI mechanics

**Ready for Phase 1:** Context-Driven Human Actions
- Foundation systems proven functional through Phase 0.1 validation
- UI framework ready to display context-aware actions from ActionBuilder
- Turn system ready to handle player-controlled character actions
- Validation pipeline ready to ensure action legality
- Template system ready to maintain UI/AI consistency

#### **Session 1.1b Implementation Status (September 6, 2025)**

**Status:** ✅ **COMPLETE** - UI Architecture Reset successfully eliminates premature complexity

**The Problem Identified:**
After completing the backend systems for Session 1.1 (Movement System Implementation), we discovered the UI components contained hardcoded assumptions and mock data that would create the same "UI-first development trap" that killed Version 1. The interface was making architectural decisions for features not yet implemented.

**What Was Actually Built:**

**UI Architecture Reset (4 Components Rewritten):**
- **`TurnControl.svelte`** - Stripped down to display only real actions from ActionBuilder, removed hardcoded action categories, now shows actual context-aware actions (11 generated dynamically)
- **`MapView.svelte`** - Simplified to show real marine positions from roomsStore/marinesStore, removed complex layout assumptions, now purely reactive to backend data
- **`InfoView.svelte`** - Converted to minimal debug interface showing raw ECS component data, removed entity selection complexity, now focused on backend inspection
- **`RadioLog.svelte`** - Reduced to simple message log ready for backend integration, removed complex filtering assumptions, now provides basic message display with export function

**Key Session 1.1b Achievements:**

1. **Eliminated UI-First Development Trap:** Removed all hardcoded assumptions about game features, UI now reflects only actual backend capabilities
2. **Achieved True Backend Reactivity:** Interface displays real data from ContextAssembler (11 actions generated from world state), not mock data
3. **Validated Unified Decision Pipeline:** End-to-end test successful - clicked "Move to Main Corridor" → full action execution → Rook moved from Docking Bay to Main Corridor → turn advanced to Sarge with 9 new actions
4. **Preserved Terminal Aesthetic:** Kept compelling retro sci-fi visual style without constraining functionality
5. **Established Minimal UI Foundation:** Clean interface ready to grow naturally with backend capabilities

**Critical Validation Results:**

✅ **Complete Action Execution Pipeline Works** - Button click → executeCharacterAction → ActionValidator → MovementSystem → World Update → UI Reactivity
✅ **Real Dynamic Action Generation** - 11 actions generated by ActionBuilder based on actual world state, not hardcoded lists  
✅ **Turn System Integration Functional** - Character timers, queue management, and turn advancement working correctly
✅ **UI-Backend Synchronization** - Interface updates reactively to show actual game state changes
✅ **Architecture-First Approach Validated** - UI follows backend reality instead of dictating it

**Session 1.1b vs Version 1 UI Comparison:**

**V1 Problem:** Polished UI with hardcoded features that didn't match backend reality
**V2 Solution:** Minimal UI that displays only actual backend capabilities

**V1 Problem:** Mock data created false sense of progress and integration conflicts  
**V2 Solution:** All UI data comes from real ECS components and world state

**V1 Problem:** UI assumptions constrained backend architecture
**V2 Solution:** UI grows naturally as backend systems are implemented

**V1 Problem:** Action execution pipeline was non-functional despite polished interface
**V2 Solution:** Verified working action execution before proceeding to next phase

**Ready for Session 1.2:** Interaction System Implementation
- Movement system proven functional through end-to-end testing
- UI foundation established without constraining future development  
- Context assembly system ready to generate interaction actions
- Validation pipeline ready for examine/search/communication actions
- Clean minimal interface ready to display new backend capabilities

#### **Key Learning: Foundation Over Polish**

Version 1 taught us that a beautiful, polished interface without working underlying systems is an architectural dead end. Version 2 prioritizes functional foundations that work correctly from day 1, then builds polish on top of solid mechanics.

**Phase 0.1 Validation:** This approach succeeded. Every component built can be enhanced without reconstruction, proving the foundation-first philosophy prevents the architectural dead ends that trapped Version 1.

**Session 1.1b Validation:** The UI Architecture Reset proved that premature interface complexity is as dangerous as premature optimization. By stripping the UI to reflect only actual backend capabilities, we avoided the "two games" problem (UI game vs. backend game) that plagued Version 1.

The unified decision pipeline ensures that when we achieve Phase 1 (human player working), we're 80% of the way to Phase 2 (AI integration) because they use the same systems. This prevents the "Phase 2 trap" that derailed Version 1.

#### **Session 1.2 Implementation Status (September 6, 2025)**

**Status:** ✅ **COMPLETE** - Interaction System Implementation successfully completed

**What Was Actually Built:**

**Complete Interaction System Pipeline:**
- **`InteractionSystem.js`** - Full implementation with `executeExamine()` and `executeSearch()` functions, providing skill-based contextual information and world state updates
- **`ActionBuilder.js`** - Enhanced with comprehensive interaction action generation (examine, examine thoroughly, search room, communication actions)
- **`ActionTypes.js`** - Complete action definitions with proper costs, requirements, effects, and UI metadata for all interaction types
- **`ActionSystem.js`** - Full integration with InteractionSystem delegation for EXAMINE, EXAMINE_THOROUGH, SEARCH, RADIO_QUICK, and LISTEN actions

**Key Session 1.2 Achievements:**

1. **Complete Interaction Pipeline Functional:** All interaction actions work end-to-end through unified decision pipeline
2. **Rich Contextual Information:** InteractionSystem provides skill-based examination results with character-specific insights
3. **Dynamic Action Generation:** ActionBuilder generates context-aware interaction actions based on entities in current room
4. **Multiple Interaction Types Working:**
   - **Examine Actions:** Quick (2 ticks) and thorough (5 ticks) examination of marines and rooms
   - **Search Actions:** Room searching (6 ticks) with discovery mechanics and state changes
   - **Communication Actions:** Radio messages (1 tick) and listening (2 ticks) through same pipeline
5. **Turn System Integration:** All interaction actions correctly apply tick costs and advance turn queue
6. **UI Reactivity Maintained:** Interface updates immediately to show new active character and available actions

**Critical End-to-End Validation Results:**

✅ **Examine Action Pipeline:** Rook examined Sarge (2 ticks) → ActionValidator → InteractionSystem → Turn advance to Sarge → UI reactive update
✅ **Search Action Pipeline:** Sarge searched Docking Bay (6 ticks) → InteractionSystem discovery mechanics → Turn advance to Doc → Context regeneration
✅ **Communication Action Pipeline:** Doc sent radio message (1 tick) → Communication system → Turn processing → Action logging
✅ **Context-Driven Action Generation:** 11 actions generated dynamically including examine/search options for current room entities
✅ **Skill-Based Information:** InteractionSystem provides character skill-modified examination results
✅ **Unified Decision Pipeline Validation:** All interaction actions use identical validation → execution → turn advancement path as movement actions

**Technical Integration Verification:**

- **ActionBuilder.js:** Generates specific interaction actions based on room occupancy (examine other marines, search current room)
- **ActionValidator.js:** Validates interaction targets and requirements before execution  
- **InteractionSystem.js:** Provides rich examination results based on target type and character skills
- **ActionSystem.js:** Properly delegates interaction actions to specialized systems
- **TurnManager.js:** Correctly applies action costs and advances queue for all interaction types
- **UI Components:** Display context-aware actions and update reactively to world state changes

**Session 1.2 vs. Project Plan Validation:**

**✅ InteractionSystem.js Complete Implementation:** executeExamine() and executeSearch() with skill-based contextual results
**✅ Enhanced ActionBuilder.js:** Context-sensitive interaction action generation based on room contents
**✅ ActionTypes.js Complete Definitions:** All action properties, costs, requirements, and UI metadata defined
**✅ End-to-End Interaction Testing:** All interaction types validated through complete action pipeline

**Phase 1 Status Update:** **NEAR COMPLETION**

With Session 1.2 complete, Phase 1 (Context-Driven Human Actions) has achieved:
- ✅ Movement System (Session 1.1b)
- ✅ Interaction System (Session 1.2) 
- ✅ Communication System (integrated with Session 1.2)
- ✅ Turn System Integration
- ✅ Context-Driven Action Generation  
- ✅ Unified Decision Pipeline Validation

**Ready for Phase 2:** Template System & AI Integration
- Complete human action pipeline proven functional through comprehensive testing
- All systems use unified decision pipeline ready for AI integration
- ActionBuilder generates rich context suitable for both human UI and AI decision-making
- Template system foundation ready for UI/AI text consistency
- Interaction results provide rich information for AI context assembly

**Session 1.2 Architectural Validation:**

The interaction system implementation successfully demonstrates the unified decision pipeline architecture:

1. **Context Assembly → Action Generation:** ActionBuilder dynamically generates interaction actions based on current room entities
2. **Action Selection → Validation:** Human clicks button, ActionValidator ensures action legality  
3. **Validation → Execution:** ActionSystem delegates to InteractionSystem for specialized processing
4. **Execution → World Update:** InteractionSystem updates world state and provides rich results
5. **World Update → Turn Processing:** TurnManager applies costs and advances queue
6. **Turn Processing → Context Regeneration:** New active character gets fresh context with available actions

This identical pipeline will be used by AI players in Phase 2, ensuring perfect human-AI parity in game mechanics.
