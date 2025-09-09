### **`PROJECT_PLAN.md`**

# Alien in the Machine - Version 3 Development Plan

## Core Vision

The player is a **Commander** in a control room, sending **autonomous AI teams** on missions into dangerous environments. This is NOT a squad tactical game - it's a command simulation where indirect control and limited information create tension.

## Critical Foundation: Game Design First

### MVP Game Mechanics (COMPLETE)

The MVP mechanics are fully documented in `GAME_MECHANICS_MVP.md`:

#### Core Systems ✅
```
1. Actions (7 Core + 3 Panic)
   - MOVE, ATTACK, TAKE COVER
   - INTERACT, OBSERVE, APPLY FIRST AID  
   - FREEZE, FLEE, FIGHT (panic states)

2. Resolution System
   - Static probability: (Attribute + Skill) × 10%
   - 4 Attributes (STR, AGI, WTS, EMP)
   - 6 Skills (Combat, Mobility, Technical, Observation, Medical, Command)

3. Commander Interaction
   - Radio commands (may be ignored based on stress)
   - Direct override (costs +1 stress)
   - Turn-by-turn review and intervention

4. Simplified Combat
   - Same-room combat only
   - Basic weapons: Pistol (1), Rifle (2), Shotgun (3)
   - Simple armor reduces damage by 1

5. Mission Structure
   - Single objectives (Retrieve, Activate, Rescue)
   - Clear extraction mechanics
   - Success = objective + survivors
```

#### Still Needed for Implementation:
- [ ] Simplified map (5-10 rooms max)
- [ ] Character roster with MVP stats
- [ ] Basic scenario file

## Development Phases

### Phase 0: Complete Game Design Documentation ✅ COMPLETE
**Status:** COMPLETE - See `GAME_MECHANICS_MVP.md`

**Completed Deliverables:**
1. **Mechanics Document** ✅
   - 7 core actions with exact tick costs
   - Static probability system: (Attribute + Skill) × 10%
   - Simplified stress/panic (3 states)
   - Commander intervention mechanics

2. **AI Behavior Specifications** ✅
   - 4-tier priority system
   - Personality modifiers
   - Stress-based behavior changes
   - Commander compliance mechanics

3. **Mission Framework** ✅
   - Single objective missions
   - Clear extraction rules
   - Success/failure conditions

**Still Needed Before Phase 1:**
- [ ] Simplified Chariot map (5-10 rooms)
- [ ] Character roster JSON with MVP stats
- [ ] Basic equipment list (3-4 weapons, 2-3 items)

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

### Phase 0 Success ✅
- [x] Complete mechanics reference document (GAME_MECHANICS_MVP.md)
- [x] AI behavior specifications complete (4-tier priority system)
- [x] Mission framework defined (single objectives)
- [ ] Simplified Chariot map with 5-10 rooms
- [ ] Character roster JSON with MVP stats

### Phase 1 Success
- [ ] Event log captures all 7 core actions + panic states
- [ ] Game state correctly derived from events
- [ ] Static probability system working ((Attr + Skill) × 10%)
- [ ] Can replay game from event log

### Phase 2 Success
- [ ] AI squad completes single-objective missions autonomously
- [ ] Stress/panic triggers at thresholds (5-6, 7-8, 9-10)
- [ ] 4-tier priority system drives decisions
- [ ] Personality modifiers affect behavior

### Phase 3 Success
- [ ] LLM makes decisions from simplified context
- [ ] Context includes only relevant MVP data
- [ ] Actions limited to 7 core + panic states
- [ ] System works with mock LLM responses

### Phase 4 Success
- [ ] Radio commands work with compliance mechanics
- [ ] Direct override adds stress as intended
- [ ] Turn-by-turn review phase implemented
- [ ] System works if commander does nothing

### Phase 5 Success
- [ ] Complete 10-minute single-objective mission
- [ ] Clear extraction mechanics work
- [ ] Stress/panic creates dramatic moments
- [ ] Commander feels agency without direct control

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
