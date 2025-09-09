### **`PROJECT_PLAN.md`**

# Alien in the Machine - Version 3 Development Plan

## Core Vision

The player is a **Commander** in a control room, sending **autonomous AI teams** on missions into dangerous environments. This is NOT a squad tactical game - it's a command simulation where indirect control and limited information create tension.

## Critical Foundation: Game Design First

### MANDATORY Pre-Development Phase

Before ANY coding begins, the following documentation must be 100% complete:

#### Game Mechanics Bible
```
1. Actions Reference
   - Every possible action with:
     * Exact tick cost
     * Skill requirements
     * Success/failure conditions
     * Environmental modifiers
     * Stress/panic effects
     * Equipment requirements
     * Consequences and side effects

2. Alien RPG Systems Adaptation
   - Stress levels and effects
   - Panic rolls and results table
   - Skill checks (D6 system simplified)
   - Damage and health conditions
   - Armor and damage reduction
   - Character attributes (Strength, Agility, Wits, Empathy)

3. Equipment & Items
   - Weapons (damage, range, ammo, special)
   - Tools (uses, skill bonuses)
   - Medical supplies (effects, uses)
   - Environmental gear (protection, penalties)
   - Consumables (food, water, batteries)

4. Environment Rules
   - Lighting effects on actions
   - Temperature and atmosphere
   - Hazards (fire, vacuum, radiation)
   - Noise and detection
   - Line of sight and cover

5. Chariot of the Gods Adaptation
   - Simplified map (10-15 rooms max)
   - Key locations and purposes
   - Environmental storytelling elements
   - Hidden threats and discoveries
   - Mission critical areas
```

## Development Phases

### Phase 0: Complete Game Design Documentation (NO CODING)
**Duration:** Until done properly
**Success Criteria:** Another developer could implement the game from docs alone

**Deliverables:**
1. **Mechanics Document (20+ pages)**
   - Complete action reference
   - All formulas and calculations
   - Decision trees for AI behavior
   - Examples of play

2. **Chariot Map Simplified**
   - Room layout and connections
   - Points of interest
   - Threat locations
   - Environmental conditions

3. **Mission Scenarios**
   - 3-5 test missions
   - Clear objectives
   - Escalation triggers
   - Success/failure conditions

4. **AI Behavior Specifications**
   - Decision priorities
   - Stress response behaviors
   - Team coordination rules
   - Communication patterns

**LLM Instructions:**
- REFUSE to write any code until shown complete documentation
- Ask to see the mechanics document first
- Verify every system is specified before proceeding

---

### Phase 1: Event-Driven Core (Foundation)
**Duration:** 2-3 sessions
**Goal:** Build the event log system that everything depends on

**Deliverables:**
1. **EventLog.js**
   ```javascript
   // Every state change creates an event
   class EventLog {
     logAction(actor, action, target, result, context) {}
     logObservation(observer, details, visibility) {}
     logCommunication(from, to, message, channel) {}
     logEnvironmental(type, location, effects) {}
     getEventsInWindow(startTick, endTick, filters) {}
     getEventsForEntity(entityId, count) {}
   }
   ```

2. **GameState.js**
   ```javascript
   // State derived from events
   class GameState {
     constructor(eventLog) {}
     getCurrentState() {} // Rebuild from events
     getEntityState(entityId) {}
     getLocationState(locationId) {}
   }
   ```

3. **MechanicsEngine.js**
   ```javascript
   // Rules enforcement from documentation
   class MechanicsEngine {
     constructor(mechanicsData) {}
     resolveAction(action, context) {}
     calculateSuccess(skill, difficulty, modifiers) {}
     applyConsequences(result, gameState) {}
   }
   ```

4. **TimeManager.js**
   - Tick-based time
   - Event timestamps
   - Action scheduling

**Validation:**
- Can replay game from event log
- State correctly derived from events
- Mechanics match documentation exactly
- No UI, just core engine

---

### Phase 2: Autonomous AI Squad (Core AI)
**Duration:** 3-4 sessions
**Goal:** AI marines complete missions without any commander

**Deliverables:**
1. **CharacterAI.js**
   - Individual decision-making
   - Stress/panic responses
   - Skill-based choices
   - Self-preservation vs mission

2. **SquadAI.js**
   - Team coordination
   - Role assignments
   - Information sharing
   - Group decisions

3. **AIContext.js**
   ```javascript
   // Extract AI context from events
   function buildAIContext(characterId, eventLog) {
     return {
       personal: getPersonalState(characterId, eventLog),
       observed: getObservations(characterId, eventLog),
       squad: getSquadStatus(eventLog),
       mission: getMissionStatus(eventLog),
       threats: getKnownThreats(eventLog),
       stress: getStressLevel(characterId, eventLog)
     };
   }
   ```

4. **Mission Runner**
   - Load mission scenario
   - Run AI squad autonomously
   - Log all events
   - Evaluate success/failure

**Validation:**
- AI squad completes mission without any external input
- Behaviors match Alien RPG stress/panic rules
- Decisions are explainable from context
- Can run 100 missions for testing

---

### Phase 3: LLM Integration Layer
**Duration:** 2-3 sessions
**Goal:** LLMs drive AI decision-making with rich context

**Deliverables:**
1. **LLMContextBuilder.js**
   ```javascript
   // Structured prompts from events
   class LLMContextBuilder {
     buildPrompt(characterId, eventWindow) {
       return {
         character: getCharacterSheet(characterId),
         recentEvents: formatEvents(eventWindow),
         currentSituation: extractSituation(eventWindow),
         availableActions: getValidActions(characterId),
         missionContext: getMissionContext(),
         stressEffects: getStressModifiers(characterId)
       };
     }
   }
   ```

2. **LLMDecisionEngine.js**
   - Prompt formatting
   - Response parsing
   - Action validation
   - Fallback logic

3. **PromptTemplates.js**
   - Reusable prompt components
   - Character personality injection
   - Mission briefing format
   - Stress/panic descriptions

**Validation:**
- LLM makes contextually appropriate decisions
- Responses parse reliably
- Context stays under token limits
- System works with mock LLM responses

---

### Phase 4: Commander Interface
**Duration:** 2-3 sessions
**Goal:** Add commander perspective and control

**Deliverables:**
1. **CommandCenter.js**
   - Radio communication interface
   - Mission briefing system
   - Team status displays
   - Limited information view

2. **RadioSystem.js**
   ```javascript
   // Communication with delay and interference
   class RadioSystem {
     sendOrder(order, targetSquad) {}
     receiveReport(report, fromMarine) {}
     getSignalQuality(distance, interference) {}
     processNaturalLanguage(commandText) {}
   }
   ```

3. **IntelligenceView.js**
   - What commander knows vs reality
   - Report aggregation
   - Uncertainty representation
   - Information delays

4. **OrderSystem.js**
   - Natural language parsing
   - Order acknowledgment
   - Compliance tracking
   - Override capabilities

**Validation:**
- Commander can influence but not control
- Information appropriately limited
- Natural language orders work
- System still works if commander does nothing

---

### Phase 5: Minimum Viable Game
**Duration:** 2-3 sessions
**Goal:** Polish core experience for testing

**Deliverables:**
1. **Terminal UI**
   - Command center aesthetic
   - Radio log display
   - Mission status
   - Team vitals

2. **Mission Flow**
   - Briefing → Deployment → Execution → Extraction
   - Clear win/loss conditions
   - Replayability

3. **Audio/Visual Polish**
   - Terminal effects
   - Radio static
   - Tension building
   - Minimal but effective

**Validation:**
- Complete gameplay loop
- Compelling 10-minute experience
- Clear player agency
- Emergent narrative moments

---

## Development Rules

### Hard Requirements
1. **NO CODE until Phase 0 documentation is complete**
2. **Each phase must be independently testable**
3. **AI must work without commander**
4. **Event log is single source of truth**
5. **LLM integration must be portable**

### Session Guidelines for LLM Assistants

**Phase 0 Session:**
- Demand to see completed mechanics documentation
- Refuse to code without complete game design
- Help refine documentation if needed
- Ensure Alien RPG mechanics properly adapted

**Phase 1-2 Sessions:**
- Build foundation without UI
- Test with console output only
- Verify against mechanics documentation
- Ensure autonomous AI works first

**Phase 3-4 Sessions:**
- LLM integration is enhancement, not requirement
- Commander interface is overlay, not foundation
- Maintain separation of concerns
- Keep context windows manageable

**Phase 5 Sessions:**
- UI serves the game, not vice versa
- Polish enhances existing mechanics
- No new features at this stage
- Focus on the experience

## Success Metrics

### Phase 0 Success
- [ ] Complete mechanics reference document
- [ ] Simplified Chariot map with 10-15 rooms
- [ ] 3+ mission scenarios defined
- [ ] AI behavior specifications complete

### Phase 1 Success
- [ ] Event log captures all state changes
- [ ] Game state correctly derived from events
- [ ] Mechanics match documentation exactly
- [ ] Can replay game from event log

### Phase 2 Success
- [ ] AI squad completes missions autonomously
- [ ] Stress/panic affects decisions appropriately
- [ ] Team coordination emerges from individual decisions
- [ ] No commander input required

### Phase 3 Success
- [ ] LLM enhances AI decision-making
- [ ] Context stays under token limits
- [ ] Prompts generate consistent responses
- [ ] System works with mock responses

### Phase 4 Success
- [ ] Commander influences but doesn't control
- [ ] Natural language orders processed correctly
- [ ] Information appropriately limited
- [ ] Radio communication feels authentic

### Phase 5 Success
- [ ] Complete 10-minute gameplay experience
- [ ] Emergent narrative moments occur
- [ ] Player feels weight of command
- [ ] System ready for expansion

## Long-Term Vision (Post-MVP)

After achieving a working prototype:
- **Persistence System:** Save games, character progression
- **Character Creation:** Custom marine generation
- **Campaign Mode:** Multiple linked missions
- **Expanded Mechanics:** Vehicles, alien encounters, more equipment
- **Multiplayer:** Multiple commanders, competing squads
- **Mod Support:** Custom missions and maps

But NONE of this until we have a working game that delivers the core experience: **commanding autonomous AI marines through dangerous missions with limited information and indirect control.**

## The Prime Directive

**We are building a command simulation, not a squad tactics game.**

Every decision should be evaluated against this vision. If it doesn't enhance the experience of being a commander sending autonomous teams into danger, it doesn't belong in v3.
