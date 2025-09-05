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

**Ready for Phase 1:** Data loading, world initialization, and static rendering

#### **Future Ideas & Wishlist (Parking Lot)**

- Capture the LLM's "actions I wish I could take" response to generate a backlog of new feature ideas.
- Consider a `SensesComponent` that defines what an entity can see/hear, limiting the information the `aiSystem` provides in its prompt.
- Evolve the `actionSystem` to handle actions that take multiple turns.
- Add keyboard accessibility handlers for map interactions
- Implement save/load game state functionality
- Consider WebGL rendering for larger station layouts
