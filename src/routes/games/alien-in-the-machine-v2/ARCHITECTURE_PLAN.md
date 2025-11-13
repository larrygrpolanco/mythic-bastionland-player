### **`ARCHITECTURE_PLAN.md`**

# Alien in the Machine - Architecture Evolution

## Version 2 Post-Mortem

### What We Built
Version 2 successfully implemented a **Unified Decision Pipeline** where human players and AI characters use identical systems for decision-making. This was our core architectural achievement - eliminating the "two games" problem that plagued Version 1.

### Architectural Successes
- **ECS Architecture:** Entity-Component-System pattern proved robust and extensible
- **Modular Systems:** Clean separation of concerns with focused system modules
- **Tick-Based Turn System:** Priority queue implementation worked elegantly
- **Template System:** Ensured perfect UI-AI text consistency
- **Context Assembly:** Rich, dynamic action generation based on world state
- **Mission Integration:** Objectives seamlessly integrated without breaking core systems

### Critical Failures
1. **Action System Organic Growth:** Actions were added ad-hoc during development rather than planned upfront, leading to:
   - Inconsistent game mechanics
   - Mock implementations that diverged from intended design
   - AI making assumptions about how actions should work

2. **Player-Centric Development:** Built for human-controlled marines first, then tried to add AI:
   - AI integration constantly broke when finally attempted
   - Never achieved the commander-sending-teams vision
   - UI reflected individual control rather than command oversight

3. **Missing Game Design Foundation:** Lacked clear mechanical specifications:
   - No defined action list with clear effects
   - No skill system implementation
   - No combat/stress/panic mechanics
   - No equipment or environmental interaction rules

4. **Logging Architecture Gap:** Insufficient event recording for LLM context:
   - Missing structured event history
   - No clean separation of game events from UI updates
   - Difficult to reconstruct game state for AI decision-making

---

## Version 3 Architecture Vision

### Core Concept: Commander-Centric AI-First Design

The player is a **Commander** in a control room, sending **autonomous AI teams** on missions. The architecture must support:

1. **AI Autonomy First:** Teams operate independently based on mission briefings
2. **Natural Language Command:** Commander issues orders via text/radio
3. **Override Capability:** Force specific actions when needed
4. **Rich Observation:** Commander sees what teams report, not omniscient view

### Foundation: Comprehensive Game Mechanics

Before ANY coding begins, v3 requires complete mechanical documentation:

#### Mechanics Documentation Requirements
```
1. Actions System
   - Complete action list with exact costs, effects, requirements
   - Skill checks and modifiers
   - Success/failure conditions
   - Environmental modifiers

2. Character Systems  
   - Skills (Combat, Technical, Medical, Observation, etc.)
   - Stress & Panic mechanics from Alien RPG
   - Health, injuries, and conditions
   - Equipment and inventory

3. Environment Systems
   - Simplified Chariot of the Gods map
   - Room types and properties
   - Environmental hazards
   - Interactable objects and furniture

4. Combat System
   - Initiative and turn order
   - Attack/defense mechanics
   - Damage and armor
   - Ranged vs melee considerations

5. Mission Framework
   - Objective types and completion conditions
   - Threat escalation systems
   - Time pressure mechanics
   - Success/failure gradients
```

### Architecture: Event-Driven Logging System

The core architectural innovation for v3 is a **comprehensive event logging system** that serves as the foundation for both game state and LLM context.

#### Event Architecture
```javascript
// Every game action produces structured events
EventLog: [
  {
    id: "evt_001",
    timestamp: 0,
    tick: 0,
    type: "ACTION",
    actor: "marine_ripley",
    action: "MOVE",
    target: "corridor_b",
    result: "SUCCESS",
    effects: ["position_changed", "noise_generated"],
    context: {
      stress_level: 2,
      equipment: ["motion_tracker", "flamethrower"],
      squad_positions: {...}
    }
  },
  {
    id: "evt_002", 
    timestamp: 1,
    tick: 8,
    type: "OBSERVATION",
    observer: "marine_ripley",
    target: "corridor_b",
    details: "Dark corridor, emergency lighting only. Scratching sounds from ventilation.",
    visibility: "limited",
    threats_detected: []
  },
  {
    id: "evt_003",
    timestamp: 2,
    tick: 8,
    type: "COMMANDER_ORDER",
    from: "commander",
    to: "squad_alpha",
    order: "Proceed carefully and check all corners",
    delivery_method: "radio",
    acknowledged: true
  }
]
```

#### LLM Context Assembly
```javascript
// Clean context extraction from event log
function buildLLMContext(characterId, eventLog, tickWindow = 50) {
  return {
    recent_events: filterRelevantEvents(eventLog, characterId, tickWindow),
    current_situation: extractSituation(eventLog, characterId),
    active_orders: getActiveOrders(eventLog, characterId),
    squad_status: getSquadStatus(eventLog),
    environmental_factors: getEnvironment(eventLog, characterId),
    mission_objectives: getMissionStatus(eventLog)
  };
}
```

### System Architecture

```
lib/game/
├── core/
│   ├── EventLog.js          (Central event recording system)
│   ├── GameState.js         (State derived from events)
│   ├── MechanicsEngine.js   (Rules enforcement from documentation)
│   └── TimeManager.js       (Tick-based time with event timestamps)
├── mechanics/              (Implementations of documented mechanics)
│   ├── ActionResolver.js    (Executes actions per documentation)
│   ├── SkillSystem.js       (Skill checks and modifiers)
│   ├── StressPanic.js       (Alien RPG stress/panic system)
│   ├── CombatEngine.js      (Combat resolution)
│   └── EnvironmentSystem.js (Environmental effects)
├── ai/
│   ├── SquadAI.js           (Autonomous squad behavior)
│   ├── CharacterAI.js       (Individual marine AI)
│   ├── LLMIntegration.js    (Clean LLM prompt generation)
│   └── OrderProcessor.js    (Natural language order parsing)
├── commander/
│   ├── CommandInterface.js  (Commander's view of mission)
│   ├── RadioSystem.js       (Communication with squads)
│   ├── OrderSystem.js       (Issue and track orders)
│   └── IntelligenceView.js  (What commander knows vs reality)
└── data/
    ├── mechanics.json        (Complete game rules data)
    ├── chariot_map.json     (Simplified scenario map)
    └── equipment.json       (Gear and items data)
```

### Development Principles for v3

1. **Mechanics First:** Complete game design documentation before ANY coding
2. **AI-First Development:** Build for autonomous AI teams, then add commander interface
3. **Event-Driven Everything:** All state changes go through event log
4. **Clean LLM Integration:** Structured prompts from well-organized events
5. **Testable Systems:** Each mechanic independently testable
6. **Portable Architecture:** LLM system separable for future projects

### Phase Development Strategy

**Phase 0: Game Design Documentation**
- Complete mechanics documentation
- Simplify Chariot of the Gods for prototype
- Define all actions, skills, equipment
- Document stress/panic system
- Create clear rule references

**Phase 1: Core Event System**
- EventLog implementation
- GameState derivation from events
- MechanicsEngine rule enforcement
- Basic action resolution

**Phase 2: Autonomous Squad AI**
- Individual marine AI
- Squad coordination
- Mission execution without commander
- Stress/panic affecting decisions

**Phase 3: Commander Integration**
- Radio communication system
- Natural language order processing
- Limited information view
- Override capabilities

**Phase 4: Full LLM Integration**
- Context assembly from events
- Prompt engineering
- Response parsing
- Multi-agent coordination

### Key Architectural Benefits

- **Clean Separation:** Game mechanics separate from AI/UI concerns
- **Perfect History:** Event log provides complete game history for debugging/replay
- **LLM-Optimized:** Events structured for easy context extraction
- **Testable:** Can test mechanics without UI or AI
4. **Action Execution:** `ActionSystem.executeAction(world, validatedAction)`
   - Delegates to specific system (MovementSystem, InteractionSystem, etc.)
5. **Turn Processing:** `TurnManager.executeAction(characterId, actionCost)`
   - Updates character's position in turn queue
6. **World Update:** Modified world state flows to reactive stores
7. **UI Reactivity:** All Svelte components update automatically

#### **9. Module Responsibilities**

- **`World.js`:** ECS foundation, entity/component management, world state structure
- **`TurnManager.js`:** Pure turn logic - queue management, tick advancement, readiness calculation
- **`systems/ActionSystem.js`:** Coordinates action execution, delegates to specialized systems
- **`systems/MovementSystem.js`:** Room navigation, door logic, position updates
- **`systems/InteractionSystem.js`:** Object interaction, searching, item handling
- **`context/ContextAssembler.js`:** Builds decision context for both human UI and AI
- **`context/ActionBuilder.js`:** Generates available actions based on world state
- **`context/PromptTemplates.js`:** Template system for consistent text across UI and AI
- **`actions/ActionValidator.js`:** Validates actions before execution, prevents invalid states
- **`actions/ActionCosts.js`:** Defines tick costs, applies skill modifiers
- **`ai/LLMService.js`:** Handles LLM API calls, model selection, response parsing
- **`/stores/worldStore.js`:** Reactive bridge between game engine and UI
- **`/components/*.svelte`:** Presentation layer, displays context and available actions

#### **10. Development Progression Strategy**

**Phase 0: Modular Foundation**
- Create all file stubs with proper interfaces and JSDoc
- Implement core World.js ECS with component definitions
- Set up TurnManager.js with working priority queue
- Create ContextAssembler.js with stub functions that return proper data structures

**Phase 1: Context-Driven Actions (Human)**  
- Implement ActionBuilder.js to generate context-aware actions
- Build working MovementSystem.js and InteractionSystem.js
- Create functional ActionValidator.js and ActionSystem.js coordination
- UI displays real context and executes real actions through unified pipeline

**Phase 2: Template System & AI Integration**
- Complete PromptTemplates.js with comprehensive template library
- Implement LLMService.js and ResponseParser.js
- AI uses same context assembly and action execution as humans
- Both human and AI actions flow through identical validation and execution

**Phase 3: Advanced Features**
- Complete InteractionSystem.js with searching, item handling
- Add MissionSystem.js for objectives and win conditions
- Enhance ContextAssembler.js with richer environmental awareness
- Polish UI for production rather than debugging

#### **11. Key Architectural Benefits**

- **Human-AI Parity:** Identical decision-making pipeline ensures consistent game rules
- **Modular Systems:** Easy to modify, test, and extend individual components
- **Template Consistency:** All text managed centrally, changes propagate everywhere
- **Context-Driven:** Actions generated based on actual world state, eliminating invalid choices
- **Tick Foundation:** Turn system built correctly from start, not retrofitted
- **Working Stubs:** Each phase produces functional systems that look like final versions
- **LLM-Friendly:** Rich context and specific action choices make AI decision-making reliable

This architecture ensures we build working systems from day 1, with each phase adding capability while maintaining a solid foundation.
