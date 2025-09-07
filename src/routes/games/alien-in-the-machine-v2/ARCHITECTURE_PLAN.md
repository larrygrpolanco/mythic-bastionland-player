### **`ARCHITECTURE_PLAN.md`**

Alien in the Machine - Clean Start Architecture (Version 2)

This document outlines the architectural philosophy and technical design for the clean restart. It is the single source of truth for _how_ we build and _why_ we build it this way, incorporating lessons learned from Version 1.

#### **1. Core Philosophy**

- **Build to Learn:** Our goal is to understand architecture through working systems. Code should be written for human readability first. Use descriptive variable names, write extensive JSDoc comments explaining the _intent_ of functions and data structures.
- **Unified Decision Pipeline:** Human players and AI use the exact same decision-making flow. The only difference is the decision-maker (human UI vs LLM), not the action execution path.
- **Foundation First:** Build systems that work correctly from the start, rather than retrofitting complex features later. The tick-based turn system and context assembly are architectural foundations, not additions.
- **Template-Driven Consistency:** All prompts, descriptions, and UI text come from shared templates. Change once, update everywhere.

#### **2. Core Architecture: Enhanced Entity-Component-System (ECS)**

Building on the proven ECS foundation from Version 1, with improved modularity:

- **Entity:** A simple number (ID). It is nothing but a key.
- **Component:** Pure data. Stored in the `world` object, indexed by entity ID.
  - **Technical Example:** `Entity #5` is a marine named "Rook" in the medbay:
    ```javascript
    world: {
      components: {
        isMarine: { 5: { name: 'Rook', rank: 'Private' } },
        position: { 5: { roomId: 'medbay' } },
        health:   { 5: { current: 90, max: 100 } },
        speed:    { 5: { current: 5, base: 5 } },
        tag:      { 5: { name: 'marine_rook' } }  // For debugging
      }
    }
    ```
- **System:** A pure function that takes the `world` object as an argument, performs logic, and often returns a set of changes to be applied. Systems are now modular and focused.

#### **3. Unified Decision Pipeline: The Heart of Human-AI Parity**

This is the core architectural innovation that ensures human players and AI follow identical decision-making flows:

```
Decision Maker → Context Assembly → Action Selection → Validation → Execution → World Update
     ↑                                    ↑
Human UI Player                    LLM Player
(clicks button)                   (JSON response)
```

**Key Components:**

1. **Context Assembly:** `ContextAssembler.js` builds identical decision context for both human UI and AI
2. **Action Building:** `ActionBuilder.js` generates available actions with specific parameters and costs
3. **Unified Validation:** `ActionValidator.js` ensures all actions follow game rules regardless of source
4. **Single Execution Path:** All actions flow through the same system modules

**Example Context for Move Action:**
```javascript
// Both human UI and LLM see identical options
availableActions: [
  {
    type: 'MOVE',
    id: 'move_medical_bay',
    name: 'Move to Medical Bay',
    target: 'medical_bay',
    cost: 8,
    description: 'Travel to the Medical Bay through the north corridor'
  }
]
```

#### **4. Tick-Based Turn System: Built-In from Day 1**

Unlike Version 1 where this was retrofitted, the tick system is a foundational architectural component:

**Core Mechanics:**
- **Priority Queue:** Characters ordered by "readyAt" time (when they can next act)
- **Action Costs:** Actions directly cost time ticks (Move Room=8 ticks, Quick Look=2 ticks)
- **Natural Reordering:** After each action, character moves to new position in queue based on action cost
- **Speed Scaling:** Higher speed = acts more frequently relative to slower characters

**Turn Queue Implementation:**
```javascript
TurnQueue: [
  { characterId: 3, readyAt: 0, speed: 5 },     // Ready now
  { characterId: 1, readyAt: 4, speed: 3 },     // Ready in 4 ticks  
  { characterId: 2, readyAt: 7, speed: 2 }      // Ready in 7 ticks
]

// After character 3 takes 6-tick action:
// Queue automatically reorders to:
TurnQueue: [
  { characterId: 1, readyAt: 4, speed: 3 },     // Next to act
  { characterId: 3, readyAt: 6, speed: 5 },     // Moved back due to action cost
  { characterId: 2, readyAt: 7, speed: 2 }
]
```

**Benefits:**
- **Tactical Depth:** Heavy actions delay you more than light actions
- **Intuitive:** "This action takes time" makes perfect sense
- **AI-Friendly:** LLM can weigh action cost vs. benefit naturally
- **No Edge Cases:** Simple priority queue handles all scenarios

#### **5. Modular System Architecture**

Learning from Version 1's monolithic `systems.js`, we split responsibilities:

```
lib/game/
├── World.js                 (ECS core - entities, components, helpers)
├── TurnManager.js          (Turn queue, tick advancement, readiness)
├── systems/
│   ├── ActionSystem.js     (Execute validated actions, coordinate other systems)
│   ├── MovementSystem.js   (Room navigation, door checking, positioning)  
│   ├── InteractionSystem.js (Search, examine, pickup, use items)
│   ├── CombatSystem.js     (Future: combat resolution)
│   └── MissionSystem.js    (Objective checking, win/loss conditions)
├── context/
│   ├── ContextAssembler.js (Build decision context for human/AI)
│   ├── ActionBuilder.js    (Generate available actions with parameters)
│   └── PromptTemplates.js  (Template system for consistent text)
├── actions/
│   ├── ActionTypes.js      (Define all action types and their properties)
│   ├── ActionValidator.js  (Validate actions before execution)
│   └── ActionCosts.js      (Tick costs, skill modifiers)
└── ai/
    ├── LLMService.js       (API calls to OpenRouter/OpenAI)
    └── ResponseParser.js   (Parse and validate LLM JSON responses)
```

**System Responsibilities:**
- **ActionSystem.js:** Coordinates action execution, delegates to specific systems
- **MovementSystem.js:** Handles room-to-room navigation, door logic, positioning
- **InteractionSystem.js:** Object interaction (search containers, examine items, etc.)
- **TurnManager.js:** Pure turn logic - who acts next, tick advancement, queue management

#### **6. Template-Based Prompting Architecture**

All text comes from a single source of truth, ensuring consistency across UI and AI prompts:

```javascript
// PromptTemplates.js - Single source of truth
export const PROMPT_COMPONENTS = {
  // Character state templates
  CHARACTER_STATUS: `You are {name}, a {rank} in the Colonial Marines. 
Health: {health}/{maxHealth}. Location: {roomName}.
Speed: {speed} (higher speed = act more frequently).`,

  // Action instruction templates  
  MOVEMENT_OPTIONS: `Available movement:
{#each doors as door}
- Move to {door.targetRoomName} ({door.cost} ticks) - {door.description}
{/each}`,

  EXAMINATION_OPTIONS: `You can examine:
{#each examineTargets as target}  
- Examine {target.name} ({target.cost} ticks) - {target.description}
{/each}`,

  // Response format templates
  JSON_RESPONSE_FORMAT: `Respond with JSON: {
  "action": "ACTION_TYPE", 
  "target": "target_id",
  "reasoning": "why you chose this action",
  "dialogue": "what your character says or thinks"
}`,

  // UI display templates (same content, different format)
  UI_ACTION_BUTTON: `{actionName} ({cost} ticks)`,
  UI_CHARACTER_STATUS: `{name} ({rank}) - Speed: {speed}, Timer: {timer}`
};
```

**Template Usage:**
- **UI Components:** Use templates for button labels, status displays
- **LLM Prompts:** Compose from same templates for consistency
- **Action Descriptions:** Same text in UI and AI context
- **Centralized Changes:** Modify wording once, updates everywhere

#### **7. Context-Aware Action Generation**

Actions are not static lists but dynamically generated based on character state and environment:

```javascript
// ActionBuilder.js
export function buildAvailableActions(world, characterId) {
  const actions = [];
  const position = getComponent(world, characterId, 'position');
  const room = getRoomEntity(world, position.roomId);
  
  // Movement actions - specific destinations with costs
  const doors = getComponent(world, room, 'doors') || [];
  doors.forEach(door => {
    actions.push({
      type: 'MOVE',
      id: `move_${door.targetRoomId}`,
      name: compileTemplate(PROMPT_COMPONENTS.MOVE_ACTION_NAME, door),
      target: door.targetRoomId,
      cost: calculateMovementCost(characterId, door),
      description: compileTemplate(PROMPT_COMPONENTS.MOVE_ACTION_DESC, door)
    });
  });
  
  // Examination actions - visible entities only
  const visibleItems = getVisibleEntities(world, characterId, 'isItem');
  visibleItems.forEach(item => {
    actions.push({
      type: 'EXAMINE',
      id: `examine_${item.id}`,
      name: compileTemplate(PROMPT_COMPONENTS.EXAMINE_ACTION_NAME, item),
      target: item.entityId,
      cost: 2,
      description: compileTemplate(PROMPT_COMPONENTS.EXAMINE_ACTION_DESC, item)
    });
  });
  
  return actions;
}
```

**Benefits:**
- **Human UI:** Shows only valid actions with specific parameters
- **LLM Context:** Gets same specific, actionable options  
- **No Invalid Actions:** Context generation prevents impossible choices
- **Rich Information:** Actions include costs, descriptions, specific targets

#### **8. Data Flow: Unified Action Processing**

The precise order of operations for any action (human or AI):

1. **Context Assembly:** `ContextAssembler.buildDecisionContext(world, characterId)` 
   - Character state, location, available actions, visible entities, inventory
2. **Decision Making:** 
   - **Human:** UI displays context, player clicks action button
   - **AI:** LLM receives context as prompt, returns JSON action choice
3. **Action Validation:** `ActionValidator.validateAction(world, characterId, action)`
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
