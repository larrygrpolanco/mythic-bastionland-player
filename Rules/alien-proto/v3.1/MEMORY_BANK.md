### **`MEMORY_BANK.md`**

# Alien in the Machine - Living Memory Bank

## Version 2 Complete Post-Mortem

### The Journey
Version 2 began September 6, 2025, as a clean-slate rebuild after Version 1's "UI-first development trap." We successfully built a unified decision pipeline where human and AI players use identical systems. The project achieved production-ready UI quality with 15+ modular systems, comprehensive mission integration, and sophisticated mixed human-AI gameplay.

### What Actually Happened

**The Good:**
- Achieved the unified decision pipeline - a genuine architectural innovation
- Built working systems from day 1 with foundation-first approach
- Created beautiful, functional terminal UI that enhanced the experience
- Modular architecture proved maintainable and extensible
- Template system ensured perfect UI-AI consistency
- Mission system integrated seamlessly without breaking core systems

**The Reality Check:**
We built an excellent squad-based tactical game where players control individual marines. But this wasn't the vision. The vision was players as **commanders** sending **autonomous teams** on missions. We got caught up in making individual character control work perfectly, when we should have been building autonomous AI teams from the start.

### Critical Lessons Learned

#### Lesson 1: Design the Game First
**v2 Problem:** Actions and mechanics were invented during coding, leading to:
- Mock actions that didn't match intended gameplay
- AI coding assistant making game design decisions
- Inconsistent mechanics across different systems
- Constant refactoring as we discovered what we actually wanted

**v3 Solution:** Complete game design documentation BEFORE any coding:
- Full action list with exact effects and costs
- Skill system specifications
- Combat mechanics from Alien RPG
- Stress/panic system details
- Equipment and environmental interactions
- Clear rule references for every mechanic

#### Lesson 2: Build for the Actual Vision
**v2 Problem:** Built player-controlled marines first, then tried to add AI:
- UI assumed direct character control
- Systems optimized for human decision-making
- AI felt bolted-on rather than integral
- Never achieved commander perspective

**v3 Solution:** Commander-first architecture:
- Player IS the commander, not the marines
- Marines are ALWAYS AI-controlled (with override option)
- UI shows commander's perspective (radio reports, limited intel)
- Natural language orders are primary interaction

#### Lesson 3: Event Logging is Foundation, Not Feature
**v2 Problem:** State management through ECS components made it hard to:
- Reconstruct what happened for LLM context
- Debug complex interactions
- Provide rich narrative context
- Separate game events from UI updates

**v3 Solution:** Event log as architectural foundation:
- Every state change is an event
- Game state derived FROM events
- LLM context extracted FROM events
- Perfect history for debugging/replay
- Clean separation of concerns

#### Lesson 4: AI Must Work Independently First
**v2 Problem:** AI required human framework to function:
- Couldn't test AI without full UI
- AI broke whenever we changed human systems
- Mixed human-AI gameplay was complex to manage

**v3 Solution:** Autonomous AI as foundation:
- AI teams complete missions without ANY commander input
- Commander enhances but doesn't replace AI decision-making
- Test AI systems in isolation
- Human interaction is overlay, not requirement

#### Lesson 5: LLM Integration Needs Structure
**v2 Problem:** LLM context was assembled ad-hoc:
- No consistent structure for prompts
- Difficult to control context window size
- Hard to debug what LLM was "seeing"
- Response parsing was fragile

**v3 Solution:** Structured event-based context:
```javascript
// Clean, predictable context structure
{
  recent_events: [...],      // Last N ticks of relevant events
  current_situation: {...},   // Derived from events
  active_orders: [...],       // Commander's orders
  squad_status: {...},        // Team state
  environmental: {...},       // Local conditions
  mission: {...}             // Objectives and progress
}
```

### Insights from Research

#### From "Designing Games: A Guide to Engineering Experiences"
- **Mechanics create dynamics create aesthetics (MDA framework)**
- **Core loop must be satisfying in isolation**
- **Player agency comes from meaningful choices**
- **Feedback loops drive engagement**

Applied to v3: The core loop is "Commander gives orders → Teams execute → Commander receives reports → Commander adjusts orders." This loop must work and be satisfying even with simple mechanics.

#### From Alien RPG Study
- **Stress/Panic creates emergent narrative**
- **Resource scarcity drives tension**
- **Unknown threats more frightening than visible ones**
- **Character relationships affect group dynamics**

Applied to v3: Implement stress/panic affecting AI decisions, limited information creating uncertainty, team dynamics affecting mission success.

### The Shift in Thinking

**Version 2 Mindset:** "How do we make a game where players can control marines and AI can also control marines?"

**Version 3 Mindset:** "How do we make a game where the player commands autonomous AI teams through natural language and limited information?"

This fundamental shift changes EVERYTHING:
- UI shows command center, not battlefield
- Player gets reports, not omniscient view
- Success comes from good orders, not good clicking
- Drama comes from autonomy, not control

### Technical Insights

#### What Worked Well in v2 (Keep for v3)
- Modular system architecture
- Tick-based time system  
- Template system for consistency
- Action validation pipeline
- Mission objective framework

#### What Needs Fundamental Change
- State management (ECS → Event Log)
- UI perspective (Marine view → Commander view)
- Action system (Ad-hoc → Documented mechanics)
- AI integration (Bolted-on → Foundation)
- Context assembly (Component queries → Event filtering)

### Development Philosophy for v3

1. **Document Before Code:** Every mechanic fully specified before implementation
2. **AI-First, UI-Last:** Build autonomous systems, then add commander interface
3. **Events Are Truth:** All state changes through event log
4. **Test in Isolation:** Each system independently verifiable
5. **Commander Enhances:** AI teams work without commander input
6. **Portable Systems:** LLM integration separable for future projects

### Red Flags to Avoid in v3

🚫 **Starting coding before mechanics documentation is complete**
🚫 **Building UI before core systems work**
🚫 **Adding features the AI assistant "suggests" without design docs**
🚫 **Testing with human control before AI autonomy works**
🚫 **Mixing state management approaches**
🚫 **Creating "temporary" solutions that become permanent**

### Green Flags to Pursue in v3

✅ **Complete Alien RPG mechanics adaptation document**
✅ **Simplified Chariot of the Gods map ready**
✅ **Every action has documented effect**
✅ **AI teams complete mission without commander**
✅ **Event log tells complete story**
✅ **LLM context under token limit**
✅ **Each phase independently testable**

### The Path Forward

Version 3 isn't just an iteration - it's a fundamental reimagining based on hard-won lessons. We're not building a tactical squad game where the player controls marines. We're building a **command simulation** where the player sends **autonomous AI teams** on dangerous missions, experiencing the tension of limited information and indirect control.

The foundation will be:
1. **Comprehensive mechanics documentation** (no more ad-hoc game design)
2. **Event-driven architecture** (perfect history and LLM context)
3. **AI-first development** (autonomous teams are the core)
4. **Commander perspective** (limited information, natural language orders)
5. **Portable LLM system** (reusable for future projects)

### Session Notes for Next LLM

When starting v3 development:
1. **Demand to see the mechanics documentation first** - Don't write any code until you have the complete game design
2. **Build event log system before anything else** - This is the foundation everything depends on
3. **Create working AI teams before any UI** - They must function autonomously
4. **Test mechanics in isolation** - Verify rules work before integration
5. **Commander interface comes last** - It enhances but doesn't replace AI autonomy

### Version 2 Final Statistics

- **Development Period:** September 6-8, 2025
- **Sessions:** 11 documented (0.1, 1.1b, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, plus undocumented)
- **Modules Created:** 15+ core systems
- **Lines of Code:** ~5000+
- **Achievements:** Unified decision pipeline, production UI, mission system
- **Ultimate Learning:** We built the wrong game beautifully

### The Real Mission

Version 3 will deliver what we actually wanted: the experience of being a commander sending brave (AI) marines into darkness, knowing you can guide them but not control them, feeling the tension of limited information and the weight of command decisions. 

This is the game we meant to build. Now we know how.

---

## Version 3.1: The Great Simplification

### Date: September 9, 2025

After reviewing the multiple competing mechanics documents, we realized the scope had grown too complex for an MVP. The decision was made to drastically simplify while preserving the core vision.

### Key Simplifications Made

1. **Resolution System:** Abandoned dice pools for static probability: `(Attribute + Skill) × 10%`
2. **Actions:** Reduced to 7 core actions plus 3 panic states
3. **Combat:** Eliminated range bands, positioning, and ammunition
4. **Stress:** Simplified to 3 panic states with clear thresholds
5. **Missions:** Single objectives only (Retrieve, Activate, or Rescue)
6. **Commander Control:** Clear 3-option system (Advance, Radio, Override)

### The Unified Document

Created `GAME_MECHANICS_MVP.md` as the single source of truth, replacing:
- `GAME_MECHANICS_DOC.md` (v1.2 - overcomplicated)
- `revised_mechanics.md` (competing dice system)
- Various scattered rule clarifications

### Why This Matters

The simplified mechanics provide:
- **Clear AI decision space** - 7 actions are easy to reason about
- **Predictable outcomes** - Static percentages vs dice randomness
- **Fast implementation** - No complex subsystems to build
- **Focused gameplay** - Commander tension without micromanagement

### Development Status

- **Phase 0:** ✅ COMPLETE - Mechanics fully documented
- **Next Steps:** Build event-driven core with these simplified rules
- **Focus:** Get autonomous AI working with the 7 core actions before ANY commander interface

The simplification wasn't a retreat - it was a clarification of what actually matters: commanding autonomous teams through limited information and indirect control.
