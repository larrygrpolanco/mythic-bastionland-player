# Revised Game Mechanics - Critical Fixes

## 1. Core Resolution System (D6 Dice Pool)

**Dice Pool Calculation:** `Attribute + Skill = Total Dice`

**Success Resolution:** 
- Roll dice equal to your dice pool
- Each die showing **6** = 1 Success
- Most actions require 1 Success to complete
- Some complex actions may require 2+ Successes

**Stress Dice (Panic Trigger):**
- Whenever making any skill check, also roll dice equal to current Stress Level
- If ANY stress die shows **1**, immediately trigger Panic Roll
- Stress dice are separate from success dice - they only check for panic

**Mathematical Example:**
```
Marine with STR 3, Close Combat 2 attacks (5 dice pool, 2 stress)
- Roll 5d6 for success: [3,4,6,2,6] = 2 Successes ✓
- Roll 2d6 for stress: [1,4] = Panic Triggered!
- Result: Attack succeeds but marine panics
```

## 2. Simplified Movement System (No Stealth)

**Movement Actions:**
- **MOVE CAREFULLY (12 ticks):** Quiet movement to adjacent zone
- **RUN (8 ticks):** Fast movement to adjacent zone, creates noise

**Detection System:**
- All entities are visible when in the same zone unless specifically hidden by cover
- No stealth mechanics in MVP
- Enemies may be unaware of marines until they enter the same zone
- Some large enemies may be heard from adjacent zones

## 3. Combat Range System

**Within Same Zone:**
- **Distanced:** Default state. Can use ranged weapons freely
- **Engaged:** Close combat. Ranged weapons cannot be used

**Ranged Combat Rules:**
- Can shoot at Distanced enemies in same zone
- Can shoot past Engaged friendlies (no penalty)
- Cannot use ranged weapons while Engaged
- Must use PUSH or RETREAT to break engagement before shooting

**Combat Actions by Range:**
- **ATTACK (Ranged):** AGI + Ranged Combat - Only at Distanced range
- **ATTACK (Close):** STR + Close Combat - Any range, required when Engaged
- **PUSH/RETREAT:** Break from Engaged to Distanced

## 4. Damage and Armor System

**Damage Resolution:**
1. Successful attack deals weapon damage to target
2. Target rolls armor dice (if wearing armor)
3. Each **6** on armor dice blocks 1 point of damage
4. Apply remaining damage to Health

**Armor Table:**
| Armor Type | Armor Dice | Weight |
|------------|-----------|--------|
| Compression Suit | 2d6 | 2 |
| Pressure Suit | 5d6 | 2 |

**Damage Example:**
```
Pulse Rifle hit (3 damage) vs Compression Suit (2d6 armor)
Armor roll: [4,6] = 1 damage blocked
Final damage: 3 - 1 = 2 Health lost
```

## 5. Inventory System (Simplified)

**Carrying Capacity:** `STRENGTH × 2 = Maximum Items`
**Weight System:** Most items weight 1, heavy items weight 2
**Over-Capacity Penalty:** -1 die to all physical actions when over limit

**Item Weights:**
- Weapons, Tools, Medkits: 1 weight each
- Armor, Heavy Equipment: 2 weight each
- Small items (knife, flashlight): 1 weight each

## 6. Medical System (Revised)

**Health States:**
- **Healthy:** Full Health points
- **Injured:** 1+ Health remaining
- **Broken:** 0 Health, can only MOVE CAREFULLY or REST
- **Dying:** Unconscious, making death saves

**Medical Actions:**
- **APPLY FIRST AID:** Restores 1d6 Health (requires Medkit)
- **STABILIZE DYING:** Any character can attempt, prevents death saves for 10 minutes
- **FIELD SURGERY:** With Medkit, upgrades Dying to Broken at 1 Health

**Death Save System:**
- Dying characters make STR + Stamina check every 24 ticks
- Success: Continue dying, reset timer
- Failure: Character dies
- Stabilized characters don't make death saves until effect wears off

## 7. Turn Order & Timing Details

**Priority Queue System:**
```javascript
// Each entity has nextActionTick value
priorityQueue = [
  {entityId: "marine_1", nextTick: 8},
  {entityId: "alien_1", nextTick: 12},
  {entityId: "marine_2", nextTick: 15}
]

// Process lowest nextTick first
// After action, add tick cost to current time
marine_1.nextTick = currentTick + actionCost
```

**Tie Breaking:**
1. Friendly entities act before hostiles
2. Higher AGI acts first
3. Random if still tied

**Reaction Timing:**
- Reactions interrupt normal turn order
- Add +2 ticks to character's NEXT action as penalty
- Can only react to actions targeting you or adjacent allies

## 8. AI Decision Framework

**Priority Matrix (Highest to Lowest):**

1. **Self-Preservation (Panic/Dying)**
   - If panicking: Follow panic table result
   - If Dying: Seek medical aid
   - If Broken: Move to safety

2. **Immediate Threats**
   - Engage visible hostiles
   - Take cover if under fire
   - Assist engaged teammates

3. **Mission Objectives**
   - Complete primary objectives
   - Investigate secondary objectives
   - Search for required items

4. **Team Support**
   - Provide medical aid to injured
   - Share information about threats
   - Maintain team cohesion

5. **Exploration**
   - Move toward unexplored areas
   - Follow squad leader's directions
   - Investigate interesting features

**Stress-Based Behavior Modifiers:**
- **Stress 0-2:** Follow priorities normally
- **Stress 3-4:** Prioritize safety over objectives
- **Stress 5+:** May ignore orders, seek immediate safety

## 9. Mission Flow & Completion

**Mission Start:** All marines begin in Landing Shuttle (safe zone)

**Mission Completion Triggers:**
- **SUCCESS:** All primary objectives completed + all marines return to shuttle
- **PARTIAL:** Some objectives completed + survivors return to shuttle  
- **FAILURE:** No objectives completed OR no survivors return

**Extraction Protocol:**
1. Marines can return to shuttle at any time
2. Commander calls "MISSION COMPLETE" when ready
3. Any marine not in shuttle when extraction begins is left behind
4. Mission scoring based on objectives completed vs marines lost

**Emergency Extraction:**
- Available if 50%+ of squad is Broken/Dying
- Lower mission rewards but prevents total failure
- Commander's choice, not automatic

## 10. Android Limitations (Balance)

**Advantages:**
- +3 to two attributes (exceeds human max of 5)
- Immune to Stress and Panic
- Don't need life support

**Disadvantages:**
- Cannot be healed with APPLY FIRST AID (need specialized repair)
- EMP weapons deal double damage
- Other marines get +1 Stress when android is destroyed (uncanny valley)
- Limited to 1 android per squad maximum
- Cannot push dice pools (no stress to leverage)

## 11. Critical Missing Elements to Add

**Environmental Hazards:**
```
- Vacuum: 1 damage per turn without pressure suit
- Fire: 1d6 damage, spreads to adjacent areas
- Darkness: -2 dice to all Observation-based actions
- Loud Areas: -2 dice to hearing-based detection
```

**Equipment Durability (Simple):**
- Weapons jam on attack roll of all 1s
- Armor loses 1 die after taking 5+ damage in single hit
- Medkits have 3 uses before depletion

**Communication System:**
- Radio range: Same zone + 1 adjacent zone
- Interference: -1d6 in certain areas
- Radio silence: Commander loses contact, marines act autonomously

## 11. Key MVP Exclusions (Avoid Scope Creep)

**Explicitly NOT in MVP:**
- Environmental hazards (fire, vacuum, radiation)
- Equipment durability and jamming
- Resource management (ammo, power, air)
- Line of sight and lighting systems  
- Complex stealth mechanics
- Radio interference or communication limits
- Character advancement/experience
- Multiple squad management

**Focus Remains On:**
- Commander sending autonomous AI teams
- Stress/panic affecting AI decision-making
- Simple but deadly combat
- Clear mission objectives and extraction
- Event-driven architecture for LLM context

## MVP Success Criteria

**Mechanical Completeness:**
- [ ] Every action has clear resolution rules
- [ ] AI decision priorities are specified
- [ ] All edge cases between systems are documented
- [ ] No "we'll figure it out during coding" gaps remain

**Playable Experience:**
- [ ] 10-minute missions feel complete
- [ ] Commander has meaningful choices to make
- [ ] AI teams can complete objectives without commander input
- [ ] Stress system creates emergent narrative moments

**Technical Foundation:**
- [ ] Event log captures all game state changes
- [ ] LLM context assembly is well-defined
- [ ] System can replay games from event history
- [ ] Mechanics engine enforces rules consistently

This simplified, focused approach ensures you have a bulletproof foundation for development without getting lost in complexity that doesn't serve the core vision.