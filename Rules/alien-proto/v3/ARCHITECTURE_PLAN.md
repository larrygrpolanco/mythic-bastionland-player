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
- **Portable:** LLM integration can move to other projects
- **Scalable:** Can add persistence, character creation, etc. later

### Critical Success Factors

1. **No Coding Until Mechanics Complete:** Must have full game design first
2. **Event Log is Sacred:** Every state change must go through events
3. **AI Teams Work Independently:** Commander enhances but isn't required
4. **Clean Context Windows:** LLM gets exactly what it needs, no more
5. **Test Mechanics in Isolation:** Validate rules before integration

This architecture ensures v3 will have a solid mechanical foundation, clean AI integration, and achieve the commander-sending-autonomous-teams vision that v2 missed.
