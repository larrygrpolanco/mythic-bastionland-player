# Alien in the Machine - MVP Game Mechanics
**Version 1.0 - Simplified & Unified**

## Core Philosophy
The player is a **Commander** watching autonomous AI marines through monitors, guiding them via radio. Marines act independently based on training and personality, but the Commander can intervene at critical moments.

---

## 1. Character Stats

### Attributes (1-5 scale)
- **STRENGTH (STR):** Physical power and endurance
- **AGILITY (AGI):** Speed and dexterity  
- **WITS (WTS):** Perception and intelligence
- **EMPATHY (EMP):** Social awareness and leadership

### Skills (0-3 scale)
Each skill pairs with an attribute for resolution:
- **Combat:** Fighting ability (STR for melee, AGI for ranged)
- **Mobility:** Movement and evasion (AGI)
- **Technical:** Computer and mechanical systems (WTS)
- **Observation:** Spotting threats and details (WTS)
- **Medical:** First aid and field medicine (EMP)
- **Command:** Leadership and persuasion (EMP)

### Derived Stats
- **Health:** `STR` value (when 0, character is incapacitated)
- **Stress:** 0-10 scale (affects behavior and panic)
- **Inventory:** Can carry `STR × 2` items

---

## 2. Resolution System

### Basic Roll
**Success Chance = (Attribute + Skill) × 10%**

Examples:
- STR 3 + Combat 2 = 50% chance
- WTS 4 + Observation 1 = 50% chance
- AGI 2 + Mobility 0 = 20% chance

**Difficulty Modifiers:**
- Easy: +20% 
- Normal: 0%
- Hard: -20%
- Extreme: -40%

### Success Table (Quick Reference)
| Pool | Success % |
|------|-----------|
| 1    | 10%       |
| 2    | 20%       |
| 3    | 30%       |
| 4    | 40%       |
| 5    | 50%       |
| 6    | 60%       |
| 7    | 70%       |
| 8    | 80%       |

---

## 3. Turn Flow & Commander Interaction

### The Core Loop
1. **Marine's Turn Begins**
   - AI evaluates situation based on personality, stress, and mission
   - AI selects intended action
   
2. **Commander Review Phase** (Game Pauses)
   - Screen shows: "Marine [Name] intends to [Action]"
   - Commander can:
     - View map and current positions
     - Check marine's stress and health
     - Review recent radio communications
     - See mission objectives
   
3. **Commander Decision**
   - **Advance:** Let the marine proceed with their action
   - **Radio Command:** Issue verbal order (marine may ignore)
   - **Override:** Force specific action (costs +1 marine stress)
   
4. **Action Resolution**
   - Action executes with appropriate skill check
   - Results logged to radio/event system
   - Next marine in initiative order

### Radio Commands
- Commander types/selects command: "Fall back!" or "Check that door carefully"
- Marine evaluates based on:
  - Current stress (high stress = less likely to obey)
  - Command logic (does it make sense?)
  - Personality (some marines more independent)
- **Compliance chance:** `(10 - Stress) × 10%`

### Override System
- Commander forces specific action from available list
- Marine gains +1 Stress from being micromanaged
- Action automatically executes (no compliance check)
- Too many overrides risk panic

---

## 4. Actions (7 Core + Panic)

### Movement Actions
**MOVE** (8 ticks)
- Move to adjacent room/zone
- Automatically opens doors
- Reveals new area upon entry

### Combat Actions  
**ATTACK** (8 ticks)
- Target enemy in same room
- Roll: `AGI + Combat` for ranged, `STR + Combat` for melee
- Damage: Weapon rating (Pistol=1, Rifle=2)

**TAKE COVER** (4 ticks)
- Gain +20% defense until next turn
- Must have cover available in room

### Utility Actions
**INTERACT** (8 ticks)
- Use computer terminal, grab objective item, activate machinery
- Roll: Varies by object (usually `WTS + Technical`)

**OBSERVE** (4 ticks)
- Scan room for threats, clues, or details
- Roll: `WTS + Observation`
- Success reveals hidden information

**APPLY FIRST AID** (8 ticks)
- Heal injured marine in same room
- Roll: `EMP + Medical`
- Success: Restore 1 Health

### Panic Actions (Involuntary)
**FREEZE** (Stress 5-6)
- Skip turn, cannot act
- -1 Stress after freezing

**FLEE** (Stress 7-8)
- Forced move to previous "safe" room
- Ignores commander orders

**FIGHT** (Stress 9-10)
- Attack nearest target (enemy or ally!)
- Cannot be controlled until stress reduces

---

## 5. Stress & Panic System

### Gaining Stress
- Taking damage: +1 Stress
- Witnessing marine death: +2 Stress
- Encountering alien: +1 Stress
- Commander override: +1 Stress
- Mission timer pressure: +1 Stress per warning

### Reducing Stress
- Completing objective: -2 Stress
- No enemies visible full turn: -1 Stress
- Commander encouragement (radio): -1 Stress (once per mission)

### Panic Thresholds
- **0-4 Stress:** Normal behavior
- **5-6 Stress:** May FREEZE when threatened
- **7-8 Stress:** May FLEE from danger
- **9-10 Stress:** May FIGHT irrationally

**Panic Check:** When stress reaches threshold, 50% chance of panic action

---

## 6. Combat Simplified

### Engagement
- All combat happens at "same room" range
- No complex positioning or range bands
- Cover provides defense bonus when taken

### Damage
- Successful attack deals weapon damage
- Armor (if any) reduces damage by 1
- 0 Health = Incapacitated (needs medical aid or mission fails)

### Weapons (Simple)
- **Unarmed:** 1 damage
- **Pistol:** 1 damage, standard sidearm
- **Rifle:** 2 damage, marine primary weapon
- **Shotgun:** 3 damage, close range only

---

## 7. Mission Structure

### Setup
1. **Briefing:** Commander receives objective from Company
2. **Squad Selection:** Choose 4 marines from roster
3. **Deployment:** Squad starts in entry point (safe room)

### Objective Types (MVP = Single Objective)
- **Retrieve:** Get to Room X, grab Item Y, return to start
- **Activate:** Reach terminal/machinery, activate it, extract
- **Rescue:** Find survivor, escort them to extraction

### Success Conditions
- **Full Success:** Objective complete, all marines extracted
- **Partial Success:** Objective complete, some casualties
- **Failure:** Objective incomplete OR total squad loss

### Extraction
- Marines must return to starting room
- Commander calls extraction when ready
- Marines not at extraction point are left behind

---

## 8. AI Behavior Priorities

Marines evaluate actions in this order:

### Priority 1: Self-Preservation
- If Health = 1, seek medical aid or cover
- If Stress >= 7, try to reduce stress
- If overwhelmed (3+ enemies), consider fleeing

### Priority 2: Mission Objectives
- Move toward objective room if known
- Interact with objective items
- Protect objective carriers

### Priority 3: Squad Support
- Aid wounded teammates 
- Provide covering fire
- Stay within 2 rooms of squad

### Priority 4: Exploration
- Scout unknown rooms
- Mark cleared areas
- Search for better equipment

### Personality Modifiers
Each marine has traits affecting priorities:
- **Brave:** Less likely to flee
- **Cautious:** More observation actions
- **Team Player:** Prioritizes squad support
- **Lone Wolf:** Ignores squad cohesion

---

## 9. Commander Tools

### Information Available
- **Map View:** Explored rooms and marine positions
- **Marine Status:** Health, stress, current action
- **Radio Log:** Recent communications and events
- **Mission Timer:** Turns remaining (if applicable)

### Intervention Options
1. **Radio Message** (Free)
   - General orders: "Fall back to airlock"
   - Specific guidance: "Check the maintenance room"
   - Encouragement: "You've got this, marine!"

2. **Direct Override** (Costs stress)
   - Select from marine's available actions
   - Marine executes immediately
   - Use sparingly to maintain squad morale

3. **Do Nothing** (Default)
   - Let marines follow their training
   - Often the best choice
   - Builds marine confidence

---

## 10. Data Structures for Implementation

### Marine State
```json
{
  "id": "marine_1",
  "name": "Hudson",
  "attributes": {"STR": 3, "AGI": 2, "WTS": 2, "EMP": 3},
  "skills": {"combat": 2, "mobility": 1, "technical": 0, 
             "observation": 1, "medical": 0, "command": 1},
  "health": 3,
  "stress": 0,
  "inventory": ["rifle", "medkit"],
  "personality": ["brave", "team_player"],
  "currentRoom": "cargo_bay",
  "intendedAction": null
}
```

### Action Structure
```json
{
  "type": "MOVE",
  "target": "corridor_a", 
  "tickCost": 8,
  "skillCheck": null,
  "stressEffect": 0
}
```

### Event Log Entry
```json
{
  "tick": 24,
  "actor": "marine_1",
  "action": "ATTACK",
  "target": "alien_drone",
  "success": true,
  "damage": 2,
  "narrative": "Hudson fires his rifle, hitting the creature!",
  "commanderIntervention": false
}
```

---

## 11. Edge Cases & Clarifications

### Room Capacity
- Unlimited marines can occupy one room
- Enemies block doorways (must defeat to pass)

### Simultaneous Actions
- Use tick system: lower tick acts first
- Ties broken by AGI, then random

### Communication Range
- Radio works everywhere (no range limit)
- Video feed may have static in some areas (narrative only)

### Death & Revival
- 0 Health = Incapacitated, not dead
- Can be revived with medical aid
- Left behind = presumed dead

---

## 12. What's NOT in MVP

To keep scope manageable, these are excluded:
- Complex cover/positioning system
- Ammunition tracking
- Equipment degradation
- Environmental hazards
- Stealth mechanics
- Multiple objectives per mission
- Skill advancement
- Inventory management puzzles
- Complex alien AI behaviors

---

## Quick Reference Card

**Every Turn:**
1. Marine AI decides action
2. Commander reviews and can intervene
3. Action resolves with `(Attribute + Skill) × 10%`
4. Update stress and health
5. Next marine

**Stress Levels:**
- 0-4: Fine
- 5-6: May freeze
- 7-8: May flee  
- 9-10: May fight wildly

**Commander Options:**
- Advance (let it happen)
- Radio (may be ignored)
- Override (+1 stress to marine)

**Mission Flow:**
Brief → Deploy → Execute → Extract → Score

---

This document represents the complete, authoritative rules for the MVP. Any conflicts with other documents should defer to this simplified version.
