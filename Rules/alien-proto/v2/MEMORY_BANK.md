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

#### **Key Learning: Foundation Over Polish**

Version 1 taught us that a beautiful, polished interface without working underlying systems is an architectural dead end. Version 2 prioritizes functional foundations that work correctly from day 1, then builds polish on top of solid mechanics.

The unified decision pipeline ensures that when we achieve Phase 1 (human player working), we're 80% of the way to Phase 2 (AI integration) because they use the same systems. This prevents the "Phase 2 trap" that derailed Version 1.
