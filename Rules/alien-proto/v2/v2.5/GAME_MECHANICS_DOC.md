### **`GAME_MECHANICS_DOC.md`**

**Version 1.2 - Final MVP Specification**

**Change Log (from v1.1):**

- **Commander-Driven Pushing:** The "Pushing a Roll" mechanic is now a direct choice for the Commander, removing AI ambiguity and giving the player critical risk-management agency.
- **Added Inventory Actions:** `PICK UP ITEM` and `DROP ITEM` have been added as fast actions to allow for dynamic problem-solving and looting.
- **Clarified Combat Ranges:** The `Engaged` vs. `Distanced` states have been explicitly defined as combat-only mechanics to simplify non-combat interactions.
- **Specified Vague Actions:** The outcomes for `OBSERVE ZONE` and `INTERACT` have been clarified to depend on structured data from scenario files, making them programmatically implementable.
- **Simplified Item Rules:** Added a section specifying that all items have unlimited uses for the MVP to prevent ambiguity around ammo and resource tracking.
- **Simplified Probability Table:** Removed the "Pushed Roll" column to align with the new Commander-driven push mechanic.

---

#### **1.0 Core Philosophy & Gameplay Loop**

- **1.1 Vision:** The player is a **Commander** in a control room, not a marine on the field. The game is a command simulation focused on indirect control, limited information, and managing the psychological state of an autonomous AI squad. The core tension arises from the conflict between Company objectives, the crew's survival, and their individual agendas.
- **1.2 The Company Game Loop:**
  1.  **Receive Commander's Brief:** "The Company" issues a mission to the player. This brief contains all objectives, including classified or morally questionable goals.
  2.  **Prepare Crew Brief:** The player authors a separate mission brief for their AI squad. The player has full agency to be truthful, omit information, or lie to the crew to ensure compliance.
  3.  **Squad Selection:** The player selects a squad of 4 marines from the available roster.
  4.  **Mission Execution:** The Commander deploys the squad and monitors their progress. The AI marines act autonomously based on their individual traits, agendas, and the brief they were given. The Commander can interject with orders via the comms system.
- **1.3 Scoring (MVP):** Mission success is measured in "Money," a score awarded for completing Company objectives.

#### **2.0 Character Definition**

- **2.1 Attributes:** Four core statistics rated on a scale of 1-5 (human maximum).
  - **STRENGTH (STR):** Raw physical power, endurance, and toughness.
  - **AGILITY (AGI):** Speed, dexterity, and fine motor control.
  - **WITS (WTS):** Perception, intelligence, and technical aptitude.
  - **EMPATHY (EMP):** Social awareness, intuition, and force of personality.

- **2.2 Skills:** Twelve skills rated 0-5, each linked to a parent Attribute.
  - **STRENGTH:** `Heavy Machinery`, `Stamina`, `Close Combat`
  - **AGILITY:** `Mobility`, `Ranged Combat`, `Piloting`
  - **WITS:** `Observation`, `Comtech`, `Survival`
  - **EMPATHY:** `Command`, `Manipulation`, `Medical Aid`

- **2.3 Derived Stats:**
  - **Health:** `Max Health = STRENGTH`.
  - **Inventory Capacity:** A character can carry a number of items equal to `STRENGTH x 2`. Exceeding this limit applies a `Speed` penalty.
  - **Speed:** A base stat affecting the tick cost of movement actions.

- **2.4 Special Rules: Androids**
  - **Attribute Bonus:** Androids get +3 to two attributes at creation (e.g., STR and AGI), allowing them to exceed the human maximum of 5.
  - **Immunity:** Immune to Stress and Panic. They do not have a `Stress Level` and never make Panic Checks.
  - **No Pushing:** Cannot have their rolls pushed by the Commander.
  - **Damage Model:** Use a unique Critical Injury table focused on system damage and repair.

#### **3.0 The Tick & Action System**

- **3.1 Execution Model:** Time is measured in **ticks**. All actions resolve **instantly**. The `Tick Cost` of an action is a **cooldown** added to the character's personal timer. A character can act again only when the game clock advances to their next available tick.
- **3.2 Turn Order & Tick Resolution:** The game maintains a priority queue of all entities. The entity with the lowest "next action tick" value is the one to act next. After an entity performs an action, their `Tick Cost` is added to the current game tick, and they are re-inserted into the queue. **This system ensures only one entity acts at a time, preventing race conditions.** In the rare event of a tie, the entity that acted less recently takes precedence.
- **3.3 Action Categories:**
  - **Slow Actions (Base Cost: 8 Ticks):** Major, time-consuming efforts.
  - **Fast Actions (Base Cost: 4 Ticks):** Quick, secondary efforts.
  - **Reactions (No Direct Cost):** Defensive actions taken outside a character's turn. Using a Reaction adds a **+2 Tick Penalty** to the character's _next_ action's total cost.

#### **4.0 Core Resolution Mechanic: Skill Checks**

- **4.1 Dice Pool Calculation:** A character's Dice Pool for any skill check is the sum of two values:
  `Dice Pool = Attribute Level + Skill Level`
- **4.2 Success Resolution:** The Dice Pool is not rolled. It is used as an index on the **Probability Table** to determine the percentage chance of success. The `MechanicsEngine.js` will resolve this with a single random number generation.
- **4.3 Pushing a Roll (Commander's Choice):**
  - **Trigger:** On a failed Skill Check by any AI marine, the game will log the failure and pause, awaiting input from the Commander.
  - **Commander's Decision:** The Commander is presented with the option to **Push the Roll**.
  - **Cost:** If the Commander chooses to Push, the marine immediately increases their `Stress Level` by 1, and this event is logged.
  - **Resolution:** A _second and final_ check is made using the **original `Success Chance`** from the Probability Table. The outcome of this new check is definitive. This mechanic gives the Commander direct agency over risk management at the cost of their crew's psychological well-being.
  - **AI Autonomy:** If the Commander does not intervene within a set time, the AI will accept the failure and proceed with its next decision.

#### **5.0 Stress & Panic System (Revised)**

- **5.1 Gaining Stress:** A character's `Stress Level` increases by one from the following triggers:
  - Having a skill roll Pushed by the Commander.
  - Taking any amount of Health damage.
  - Witnessing a scripted horrific event (e.g., finding a body).
  - Witnessing a friendly character's Panic action (Scream, Flee, Psychotic).
  - Being attacked by an unknown hostile entity for the first time.
- **5.2 Stress Dice & The Panic Trigger:**
  - **Mechanic:** Whenever a character makes a Skill Check, they also programmatically roll a number of "Stress Dice" (D6s) equal to their current `Stress Level`.
  - **Trigger:** If any of these Stress Dice results in a '1', a **Panic Roll** is immediately triggered. This happens _regardless_ of whether the primary Skill Check succeeded or failed.
- **5.3 The Panic Roll:**
  - **Resolution:** When triggered, the system makes a roll of `D6 + Current Stress Level`. The result is checked against the Panic Table, forcing a specific, immediate action that cancels any other intended action.

- **5.4 Panic Table (MVP)**
  | Roll (D6 + Stress) | Result | Mechanical Effect |
  | :----------------- | :------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
  | **6 or less** | **Keep It Together** | Character flinches but maintains control. No mechanical effect. |
  | **7** | **Freeze** | Character is stunned. Their next action is lost, adding **4 ticks** to their personal timer. |
  | **8-9** | **Scream** | Character screams in terror. All friendly characters in the same zone gain **+1 Stress**. |
  | **10-12** | **Flee** | Forced `RUN` action to a random, adjacent, known-safe zone. If no zone is safe, they move to a random adjacent zone. |
  | **13-15** | **Psychotic Attack** | Forced `ATTACK (Close Quarters)` action on the nearest entity, friend or foe. If multiple are equidistant, the target is chosen randomly. |

- **5.5 Probability & Panic Table**
  | Dice Pool | Success Chance | Panic Chance (per Stress Level) |
  | :-------- | :------------- | :------------------------------ |
  | 1 | 17% | 17% |
  | 2 | 31% | 31% |
  | 3 | 42% | 42% |
  | 4 | 52% | 52% |
  | 5 | 60% | 60% |
  | 6+ | 67%+ | 67%+ |

#### **6.0 State Management & Combat**

- **6.1 Zone Proximity:** For non-combat purposes (e.g., `APPLY FIRST AID`), characters only need to be in the same zone. No specific range or tick cost is required to interact with friendlies within a zone.
- **6.2 Range Categories (Combat Only):** Within a single zone, a character is either at `Distanced` or `Engaged` range relative to hostile entities.
  - **Distanced:** The default combat state. Allows for ranged attacks and tactical movement.
  - **Engaged:** Represents close-quarters combat. A character who is `Engaged` with one or more hostiles is "locked" in melee.
- **6.3 Initiating & Breaking Engagement:**
  - **Entering an Occupied Zone:**
    - Using `MOVE CAREFULLY` into a zone with a hostile begins at `Distanced` range.
    - Using `RUN` into a zone with a hostile immediately puts the character at `Engaged` range with that hostile. This can be used for surprise attacks but is extremely risky.
  - **Breaking Engagement:** While `Engaged`, a character cannot use standard `MOVE` actions. They must use `PUSH` or `RETREAT` to create separation and return to `Distanced` range.
- **6.4 Stealth State:** An entity is either `Stealthed` or `Revealed`.
  - **Maintaining Stealth:** A character stays `Stealthed` by using `MOVE CAREFULLY` and avoiding hostile actions.
  - **Breaking Stealth:** Stealth is broken for a character if they:
    - Perform a `RUN` action.
    - Perform an `ATTACK` or other hostile action.
    - Are successfully detected by an `OBSERVE ZONE` action from an enemy.
    - Enter a zone occupied by a `Revealed` hostile.

#### **7.0 Health, Injury & Death**

- **7.1 Broken State (HP = 0):** A character becomes `Broken` when Health reaches 0.
  - **Limitations:** Can only perform `MOVE CAREFULLY` (crawl) or `REST`.
- **7.2 Critical Injury Roll:** Any attack reducing a character to 0 HP (or hitting them at 0 HP) forces this roll.
  - **Resolution:** A 33% chance to worsen the character's state to `Dying`.
- **7.3 Dying State:**
  - **Limitations:** Character is unconscious and cannot act.
  - **Death Checks:** Every **24 ticks**, the character must make a `STAMINA` check. Failure results in death. Success resets the timer.
- **7.4 Medical Aid:** Using `APPLY FIRST AID` on a `Dying` character upgrades their state back to `Broken` at 1 HP.

#### **8.0 Master Action List (MVP)**

**Slow Actions (Base: 8 Ticks)**

- **`ATTACK (Ranged/Close Quarters)`:** (Skill: `AGI/STR + Combat Skill`). Perform an attack against a **single, specified target**. If multiple hostiles are `Engaged`, the AI must choose one target per action. Breaks `Stealth`.
- **`MOVE (Run/Move Carefully)`:** Move to an adjacent zone. `Run` (8 ticks) breaks `Stealth`. `Move Carefully` (12 ticks) maintains `Stealth`.
- **`APPLY FIRST AID`:** (Skill: `EMP + Medical Aid`). Precondition: Must have Medkit. Restores HP.
- **`WELD DOOR`:** (Skill: `STR + Heavy Machinery`). Precondition: Must have Cutting Torch. Seals a door, making a zone "safe."
- **`INTERACT`:** (Skill varies). Use a zone-based object. The specific objects, the skill required, and the effect of the interaction will be defined in the scenario's map data (e.g., `chariot_map.json`).
- **`OBSERVE ZONE`:** (Skill: `WTS + Observation`). On success, reveals information about an adjacent zone. The `MechanicsEngine.js` will return data in a structured format, prioritizing discoveries as follows: 1) Presence of `Revealed` hostiles, 2) Signs of `Stealthed` hostiles (logged as a "sound" or "movement" event), 3) Key interactable objects, 4) Environmental hazards.
- **`CALM DOWN`:** (No Skill). Precondition: Must be in a "safe" zone (no known hostiles). Reduces Stress by 1.
- **`OVERWATCH`:** (No Skill). Character forgoes their turn to enter a state of readiness. They will automatically perform a free `ATTACK (Ranged)` action against the first hostile entity that enters or performs an action within their zone. The `OVERWATCH` state is removed after the attack or at the start of the character's next turn.

**Fast Actions (Base: 4 Ticks)**

- **`PICK UP ITEM`:** (No Skill). Take a specified item from the floor of the current zone. The character must have sufficient `Inventory Capacity`.
- **`DROP ITEM`:** (No Skill). Place a specified item from inventory onto the floor of the current zone.
- **`TAKE COVER`:** (No Skill). Gain temporary Armor based on zone's cover value.
- **`AIM WEAPON`:** (No Skill). Gain significant bonus to next `ATTACK (Ranged)` action.
- **`PUSH`:** (Skill: `STR + Close Combat`). Precondition: `Engaged`. On success, forces target to `Distanced`.
- **`RETREAT`:** (Skill: `AGI + Mobility`). Precondition: `Engaged`. On success, character moves to `Distanced`.

#### **9.0 Data Reference: Gear & Roster**

- **9.1 Character Roster:** Complete list of 8 characters with stats, bios, personalities, and agendas in characters.json

(Player selects 4 marines per mission from this roster)

| Last Name    | Career    | STR | AGI | WITS | EMP | Key Skills                    | Gear                        |
| :----------- | :-------- | :-: | :-: | :--: | :-: | :---------------------------- | :-------------------------- |
| **Miller**   | Officer   |  4  |  3  |  2   |  5  | Command, Piloting             | Pistol, Comp. Suit          |
| **Wilson**   | Co. Agent |  2  |  4  |  3   |  5  | Manipulation, Mobility        | Pistol, Comp. Suit          |
| **Davis**    | Pilot     |  2  |  5  |  3   |  4  | Piloting, Ranged Combat       | Pistol, Comp. Suit, Knife   |
| **Macwhirr** | Marshal   |  3  |  2  |  4   |  5  | Command, Observation          | Rifle, Pressure Suit, Knife |
| **Hirsch**   | Ex-Marine |  5  |  3  |  3   |  3  | Close Combat, Ranged Combat   | Rifle, Pressure Suit, Torch |
| **Sigg**     | Medic     |  2  |  4  |  4   |  4  | Medical Aid, Comtech          | Medkit, Comp. Suit          |
| **Cham**     | Roughneck |  5  |  3  |  2   |  4  | Heavy Machinery, Close Combat | Pistol, Comp. Suit, Torch   |
| **Holroyd**  | Android   |  7  |  6  |  4   |  3  | Heavy Machinery, Comtech      | Comp. Suit, Medkit, Torch   |

JSON example

```
{
  "characters": [
    {
      "id": "miller_vanessa",
      "name": "Vanessa Miller",
      "career": "Officer",
      "isAndroid": false,
      "attributes": {
        "strength": 4,
        "agility": 3,
        "wits": 2,
        "empathy": 5
      },
      "skills": {
        "rangedCombat": 1,
        "mobility": 1,
        "piloting": 2,
        "observation": 2,
        "medicalAid": 1,
        "command": 3
      },
      "health": 4,
      "gear": [
        "pistol",
        "compression_suit"
      ],
      "flavor": {
        "personality": "Thrifty",
        "bio": "You’re tired of being a corporate cog and want out. If you could finally get enough money to get your own ship, you could start controlling your own destiny on the Frontier. You need to find a way to make enough money to go independent and lease a new ship.",
        "agenda": "Follow company protocol, get the job done and cash in. Don’t do anything to risk your paycheck. Find a way to get out from under the corporate yoke with enough money to buy a new ship. Maybe the next run pays better. If things are going south, fast. Get all the cash you can and get the hell out of dodge, by any means necessary."
      }
    },
```

**Gear & Armor**

| Weapon              | Damage | Weight | Properties     |
| :------------------ | :----- | :----- | :------------- |
| M4A3 Service Pistol | 2      | 1      | -              |
| M41A Pulse Rifle    | 3      | 2      | Armor Piercing |
| Unarmed             | 1      | 0      | -              |
| Knife               | 2      | 1      | -              |
| Cutting Torch       | 3      | 1      | Armor Piercing |

| Armor                   | Block Chance (Rating) | Weight |
| :---------------------- | :-------------------- | :----- |
| IRC Mk.50 Comp. Suit    | 31% (2)               | 2      |
| IRC Mk.35 Pressure Suit | 60% (5)               | 2      |

- **9.5 Items**
  | Item | Weight | Description |
  | :--- | :--- | :--- |
  | Cutting Torch | 1 | Precondition for `WELD DOOR`. Can be used as a melee weapon. |
  | Medkit | 1 | Precondition for `APPLY FIRST AID`. |

- **9.5 MVP Item Rules**
  - **Unlimited Use:** For the MVP, all items and gear have unlimited uses. Medkits are not consumed, and weapons do not require ammunition. This is to focus the core gameplay loop on action and stress management rather than resource attrition.
  - **Story Items:** Certain items critical to mission objectives may be flagged as unique and will be defined in the mission scenario files.

#### **10.0 Systems Excluded for MVP**

- Resource Management (air, power, food, water).
- Complex Environmental Hazards (radiation, freezing).
- Item Crafting / Shops.
- Character Progression / Experience.
- **Inter-character commands (`GIVE COMMAND`, `MANIPULATE`).**

```

```
