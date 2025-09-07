### **`PROJECT_PLAN.md`**

Alien in the Machine - Version 2 Development Plan

This plan breaks down the clean start development into LLM-friendly sessions. Each session is designed to be manageable for an AI coding assistant while building towards the unified decision pipeline architecture.

**Project Goal:** Create a functional turn-based sci-fi simulation where human players and AI use identical decision-making systems. The prototype features marines navigating a station through a tick-based turn system with rich contextual decision-making.

---

## **Development Strategy: Foundation-First Approach**

**Key Principle:** Build working foundations before polish. Each phase produces functional systems that work like final versions, not mocks or placeholders.

**LLM Session Guidelines:**
- Each session should be 1-3 hours of focused development
- Clear entry and exit criteria for each session
- Always prioritize working functionality over visual polish
- Validate each session's output before proceeding
- Build with the end architecture in mind from day 1

---

## **Phase 0: Modular Foundation (1-2 Sessions)**

**Goal:** Establish the file structure and core interfaces that enable the unified decision pipeline.

### **Session 0.1: Core ECS and File Structure (Foundation Session)**

**Entry Criteria:** Empty project directory, access to Version 1 JSON data files

**Deliverables:**
1. **File Structure Creation:**
   ```
   src/routes/games/alien-in-the-machine-v2/
   ├── +page.svelte                   (Basic UI shell)
   ├── lib/
   │   ├── game/
   │   │   ├── World.js              (ECS core)
   │   │   ├── TurnManager.js        (Turn queue system) 
   │   │   ├── systems/
   │   │   │   ├── ActionSystem.js   (Action coordination)
   │   │   │   ├── MovementSystem.js (Movement logic - stub)
   │   │   │   └── InteractionSystem.js (Interaction logic - stub)
   │   │   ├── context/
   │   │   │   ├── ContextAssembler.js (Context building)
   │   │   │   ├── ActionBuilder.js    (Action generation)
   │   │   │   └── PromptTemplates.js  (Template system - stub)
   │   │   ├── actions/
   │   │   │   ├── ActionTypes.js      (Action definitions)
   │   │   │   ├── ActionValidator.js  (Validation logic)
   │   │   │   └── ActionCosts.js      (Tick costs)
   │   │   └── ai/
   │   │       ├── LLMService.js       (AI service - stub)
   │   │       └── ResponseParser.js   (Response parsing - stub)
   │   ├── stores/
   │   │   └── worldStore.js          (Svelte store)
   │   ├── components/                (UI is in a 1980 terminal style)
   │   │   ├── MapView.svelte         (Map display - basic)
   │   │   ├── TabbedRightPanel.svelte (Panel holding the other UI elements)
   │   │   ├── RadioLog.svelte        (AI Dialogue and Game Events Display)
   │   │   ├── InfoView.svelte        (screen for examinig)
   │   │   └── TurnControl.svelte     (Turn interface - basic)

   │   └── data/
   │       ├── rooms.json             (Copy from V1)
   │       └── marines.json           (Copy from V1)
   ```

2. **Core ECS Implementation in World.js:**
   - Entity creation and management
   - Component storage and access
   - Helper functions for queries
   - World initialization from JSON data

3. **Turn Queue System in TurnManager.js:**
   - Priority queue based on "readyAt" times
   - Character readiness checking
   - Action cost application
   - Turn advancement logic

4. **Working Stubs with Proper Interfaces:**
   - All files exist with JSDoc documentation
   - Function signatures defined with proper parameters
   - Stub functions return correct data structures
   - No "TODO" placeholders - working minimal implementations

**Validation Criteria:**
- ✅ All files exist and can be imported without errors
- ✅ World.js can create entities and components from JSON data
- ✅ TurnManager.js can initialize turn queue and determine next active character
- ✅ ContextAssembler.js can build basic context object structure
- ✅ Basic UI loads and displays world data without errors

**Exit Criteria:** Foundation exists with working data flow from JSON → World → TurnManager → Context → UI

---

### **Session 0.2: Context Assembly Foundation (Integration Session)**

**Entry Criteria:** Session 0.1 complete, foundation files exist and load

**Deliverables:**
1. **ContextAssembler.js Implementation:**
   - `buildDecisionContext(world, characterId)` function
   - Character state extraction from ECS components
   - Current location and environment data
   - Basic available actions structure

2. **ActionBuilder.js Implementation:**
   - `generateAvailableActions(world, characterId)` function
   - Movement actions based on room connections
   - Basic examination actions for visible entities
   - Action cost integration from ActionCosts.js

3. **ActionValidator.js Implementation:**
   - `validateAction(world, characterId, action)` function
   - Basic validation (character exists, action exists, character ready)
   - Target validation (target exists, is accessible)
   - Cost validation (action cost is valid)

4. **Integration Testing:**
   - Context assembly produces consistent data structure
   - Available actions include specific targets and costs
   - Validation correctly accepts/rejects actions

**Validation Criteria:**
- ✅ Context includes character state, location, available actions
- ✅ Available actions are specific (not generic) with costs and targets
- ✅ Validation prevents impossible actions
- ✅ Data flows through: World → Context → Actions → Validation

**Exit Criteria:** Context assembly system produces rich, actionable data that both human UI and future AI can use

---

## **Phase 1: Context-Driven Human Actions (2-3 Sessions)**

**Goal:** Human player can perform real actions through the unified decision pipeline.

### **Session 1.1: Movement System Implementation (Core Mechanics Session)**

**Entry Criteria:** Phase 0 complete, context assembly working

**Deliverables:**
1. **MovementSystem.js Complete Implementation:**
   - `executeMove(world, characterId, targetRoomId)` function
   - Room connection validation
   - Position component updates
   - Movement cost calculation based on character stats

2. **ActionSystem.js Coordination:**
   - `executeAction(world, action)` delegates to appropriate systems
   - Integrates with TurnManager for tick cost application
   - Handles action results and world state updates

3. **Enhanced ActionBuilder.js:**
   - Movement actions include specific room names and costs
   - Actions based on actual door connections from room data
   - Dynamic cost calculation based on character speed/skills

4. **UI Integration in TurnControl.svelte:**
   - Displays available actions from context
   - Shows current character and their readiness status
   - Action buttons trigger execution through worldStore

**Validation Criteria:**
- ✅ Human can click "Move to Medical Bay (8 ticks)" button
- ✅ Character position updates in world state
- ✅ Turn queue advances correctly after action
- ✅ Next character becomes active based on readiness times

**Exit Criteria:** Human player can move characters between rooms through context-driven UI

---

### **Session 1.2: Interaction System Implementation (Core Mechanics Session)**

**Entry Criteria:** Session 1.1 complete, movement working

**Deliverables:**
1. **InteractionSystem.js Complete Implementation:**
   - `executeExamine(world, characterId, targetId)` function
   - `executeSearch(world, characterId, targetId)` function
   - Entity examination with detailed descriptions
   - Container searching with item discovery

2. **Enhanced ActionBuilder.js:**
   - Examination actions for all visible entities
   - Search actions for searchable containers
   - Context-sensitive action generation based on location

3. **ActionTypes.js Complete Definitions:**
   - All action types with properties and costs
   - Action descriptions and requirements
   - Category organization for UI display

4. **MapView.svelte Enhancement:**
   - Visual representation of entities in rooms
   - Click handlers for entity selection and examination
   - Real-time updates based on world state changes

**Validation Criteria:**
- ✅ Human can examine items, furniture, and other characters
- ✅ Examination provides detailed, contextual information
- ✅ Search actions discover items and update world state
- ✅ UI shows relevant actions based on current room contents

**Exit Criteria:** Human player has full interaction capabilities through the unified pipeline

---

### **Session 1.3: Action Pipeline Validation (Integration Session)**

**Entry Criteria:** Sessions 1.1 and 1.2 complete, core interactions working

**Deliverables:**
1. **Comprehensive Action Validation:**
   - Edge case handling in ActionValidator.js
   - Error messages and user feedback
   - Action prerequisite checking

2. **Turn System Polish:**
   - Multiple character support with proper queue management
   - Speed differences affect turn frequency
   - Action costs create tactical depth

3. **UI Polish for Core Features:**
   - Clear display of available actions with costs
   - Character status and readiness indicators
   - Action feedback and result display

4. **Phase 1 Integration Testing:**
   - Multiple characters taking turns correctly
   - All basic actions working through unified pipeline
   - World state consistency maintained

**Validation Criteria:**
- ✅ Multiple characters can take turns in correct order
- ✅ All actions (move, examine, search) work reliably
- ✅ Turn queue handles speed differences and action costs
- ✅ UI provides clear feedback for all interactions

**Exit Criteria:** Solid foundation ready for AI integration - human player experience is complete and working

---

## **Phase 2: Template System & AI Integration (2-3 Sessions)**

**Goal:** AI uses same context and action execution as humans.

### **Session 2.1: Template System Implementation (Template Session)**

**Entry Criteria:** Phase 1 complete, human player fully functional

**Deliverables:**
1. **PromptTemplates.js Complete Implementation:**
   - Template components for character state, actions, context
   - Template compilation system for different formats
   - Consistent text between UI and AI prompts

2. **UI Template Integration:**
   - Action buttons use template-generated text
   - Character status displays use templates
   - Consistent terminology throughout interface

3. **AI Context Formatting:**
   - Templates compile to AI-friendly prompt format
   - Rich context includes all decision-making information
   - Structured format for LLM consumption

4. **Template Validation:**
   - Templates produce consistent output
   - UI and AI contexts contain identical information
   - Easy template modification system

**Validation Criteria:**
- ✅ UI text comes from templates, not hardcoded strings
- ✅ Template changes update both UI and AI context
- ✅ AI context contains all information human UI shows
- ✅ Templates are easy to modify and extend

**Exit Criteria:** Template system ensures UI-AI consistency

---

### **Session 2.2: LLM Service Implementation (AI Integration Session)**

**Entry Criteria:** Session 2.1 complete, template system working

**Deliverables:**
1. **LLMService.js Complete Implementation:**
   - OpenRouter/OpenAI API integration
   - Prompt composition from templates
   - Response handling and error management
   - Model selection and configuration

2. **ResponseParser.js Complete Implementation:**
   - JSON response validation
   - Action extraction and formatting
   - Error handling for malformed responses
   - Dialogue and reasoning capture

3. **AI Turn Processing:**
   - AI characters get turns through same TurnManager
   - Context assembly for AI identical to human
   - AI decisions validated through same ActionValidator

4. **Basic AI Testing:**
   - AI can make simple decisions (move, examine)
   - Responses are valid and execute correctly
   - AI follows same game rules as human

**Validation Criteria:**
- ✅ AI character can take turns when readiness timer reaches 0
- ✅ AI receives identical context to what human UI shows
- ✅ AI actions are validated and executed through same systems
- ✅ AI responses are parsed and applied correctly

**Exit Criteria:** AI integration working through unified pipeline

---

### **Session 2.3: Human-AI Mixed Gameplay (Integration Session)**

**Entry Criteria:** Session 2.2 complete, basic AI integration working

**Deliverables:**
1. **Mixed Turn Management:**
   - Human and AI characters in same turn queue
   - Seamless switching between human and AI control
   - Consistent game state regardless of decision-maker

2. **AI Dialogue Integration:**
   - AI reasoning and dialogue captured and displayed
   - Communication log for AI thoughts and decisions
   - Rich AI behavior visibility for debugging

3. **Advanced AI Context:**
   - Environmental awareness and tactical context
   - Mission objectives and character motivations
   - Rich prompt composition for intelligent decisions

4. **Phase 2 Integration Testing:**
   - Human controls some characters, AI controls others
   - Both follow identical game rules and systems
   - Turn order based purely on tick timing

**Validation Criteria:**
- ✅ Human and AI characters can be mixed in same game
- ✅ Both use identical action validation and execution
- ✅ AI makes contextually appropriate decisions
- ✅ Game rules apply equally to both

**Exit Criteria:** Complete human-AI parity achieved through unified systems

---

## **Phase 3: Advanced Features & Polish (2-3 Sessions)**

**Goal:** Complete game experience with objectives and polished interactions.

### **Session 3.1: Mission System Implementation (Features Session)**

**Entry Criteria:** Phase 2 complete, human-AI integration working

**Deliverables:**
1. **MissionSystem.js Complete Implementation:**
   - Objective tracking and completion checking
   - Win/loss condition evaluation
   - Dynamic objective updates based on discoveries

2. **Enhanced InteractionSystem.js:**
   - Complex item interactions and usage
   - Inventory management and item effects
   - Environmental puzzle elements

3. **Advanced Context Assembly:**
   - Mission-aware context for decision-making
   - Objective progress information
   - Strategic situation assessment

4. **Mission Integration:**
   - Objectives influence AI decision-making
   - Human players see mission status and goals
   - Victory/failure conditions trigger appropriately

**Validation Criteria:**
- ✅ Clear mission objectives guide gameplay
- ✅ AI makes mission-relevant decisions
- ✅ Victory/failure conditions work correctly
- ✅ Complex interactions enhance gameplay depth

**Exit Criteria:** Complete game loop with meaningful objectives

---

### **Session 3.2: UI Polish & User Experience (Polish Session)**

**Entry Criteria:** Session 3.1 complete, mission system working

**Deliverables:**
1. **Enhanced MapView.svelte:**
   - Rich visual representation of station
   - Entity state visualization (items, characters, interactive objects)
   - Visual feedback for actions and state changes

2. **Advanced TurnControl.svelte:**
   - Intuitive action selection and execution
   - Clear turn order and timing display
   - Action preview and confirmation system

3. **Information Systems:**
   - Detailed entity examination interface
   - Mission briefing and status display
   - AI communication and reasoning log

4. **User Experience Polish:**
   - Smooth interactions and transitions
   - Clear feedback for all player actions
   - Intuitive interface for complex decisions

**Validation Criteria:**
- ✅ Interface is intuitive and informative
- ✅ All game state is clearly visible to player
- ✅ Actions provide immediate and clear feedback
- ✅ UI supports both debugging and gameplay

**Exit Criteria:** Professional-quality user interface ready for extended play

---

### **Session 3.3: Final Integration & Testing (Validation Session)**

**Entry Criteria:** All previous sessions complete, full feature set implemented

**Deliverables:**
1. **Comprehensive Testing:**
   - End-to-end gameplay validation
   - Edge case handling and error recovery
   - Performance optimization and debugging tools

2. **Documentation Completion:**
   - Updated architecture documentation
   - Usage guide for extending the system
   - AI integration guide for future development

3. **Final Polish:**
   - Bug fixes and stability improvements
   - Balance tweaks for gameplay experience
   - Code cleanup and optimization

4. **Deployment Preparation:**
   - Production build configuration
   - Performance monitoring setup
   - Future development roadmap

**Validation Criteria:**
- ✅ Complete gameplay experience from start to finish
- ✅ Stable performance with no critical bugs
- ✅ Human-AI integration seamless and reliable
- ✅ Ready for extended play and future development

**Exit Criteria:** Production-ready prototype demonstrating unified decision pipeline architecture

---

## **Development Anti-Patterns to Avoid**

**For LLM Development Sessions:**
- **Don't build polish before functionality** - Always ensure core mechanics work first
- **Don't create divergent human/AI paths** - Use unified systems for both
- **Don't use placeholder mocks** - Create working stubs that match final architecture
- **Don't skip validation steps** - Each session must prove its deliverables work
- **Don't build monolithic files** - Keep systems modular and focused

**Session Success Indicators:**
- Can demonstrate working functionality at end of each session
- Each system integrates cleanly with existing architecture
- No "TODO" comments or placeholder functions remain
- Code follows established patterns and documentation standards

**Key to Success:** Each session builds working, validated functionality that moves us closer to the unified decision pipeline goal. No session should end without demonstrable progress toward the final architecture.
