# The Ground Itself - Memory Bank

## Project Status: PHASE 2 COMPLETE - NEEDS DEBUGGING ⚠️

**Last Updated**: December 3, 2025  
**Current Phase**: Phase 2 Implementation Complete - Ready for Bug Fixes  
**Development Server**: Running at `http://localhost:5173/games/the-ground-itself`

---

## Project Vision
A web-based, single-player adaptation of Everest Pipkin's tabletop game "The Ground Itself." The defining feature is AI-generated images that dynamically evolve as players answer narrative prompts, creating an immersive storytelling experience about places over time.

---

## Current Implementation Status

### ✅ **COMPLETED - Phase 1 (MVP) - WORKING CORRECTLY**

**Core Architecture Established:**
- Self-contained game directory: `src/routes/games/the-ground-itself/`
- Centralized state management via `stores.js`
- Modular file structure with separated logic, components, and data
- Secure server-side API endpoint for image generation

**Working Game Flow:**
1. **Intro Phase** - Game introduction and rules explanation ✅
2. **Setting Setup** - Player describes their place + selects visual style ✅
3. **Timeline Setup** - Dice roll determines time scale (days to millennia) ✅
4. **Face Card Setup** - Complete 12-card world-building system ✅
5. **Mock Image Generation** - Builds prompts from game state, calls API ✅

### ✅ **COMPLETED - Phase 2 (Main Gameplay) - NEEDS DEBUGGING ⚠️**

**All Components Implemented:**
1. **Main Play Page** (`play/+page.svelte`) - Layout and state management ✅
2. **Card Drawing** (`DrawCardPrompt.svelte`) - Numerical deck creation and drawing ✅
3. **Turn Decision** (`TurnDecision.svelte`) - Question display and choice interface ✅
4. **Answer Input** (`AnswerInput.svelte`) - Question answering with image generation ✅
5. **Focused Situations** (`FocusedSituationMenu.svelte`) - Alternative narrative paths ✅

**Integration Status:**
- Navigation from setup to main gameplay ✅
- Component state transitions ✅
- Image generation system ready ✅
- Card logic using existing `deck.js` ✅

---

## ⚠️ CRITICAL: KNOWN ISSUES REQUIRING DEBUG

### **Testing Results - What Works:**
- ✅ Complete setup flow (intro → timeline → face cards)
- ✅ Image generation with mock API
- ✅ Face card progression with world building
- ✅ Phase transitions working
- ✅ Component rendering and UI

### **Testing Results - What Needs Fixing:**
- ⚠️ **Main gameplay loop not fully tested** - Components exist but may have integration bugs
- ⚠️ **Card drawing to question flow** - Transition states may not work correctly
- ⚠️ **Answer submission loop** - Save → increment → generate → reset cycle needs verification
- ⚠️ **Focused situation integration** - Alternative path may have state issues
- ⚠️ **Navigation between components** - State management across turn states
- ⚠️ **"10" card detection** - Time gap triggers not tested
- ⚠️ **Card rank counting** - Question progression (1st Ace, 2nd Ace, etc.) needs verification

---

## File Structure & Implementation Status

```
src/routes/games/the-ground-itself/
├── +page.svelte              # ✅ Setup phases working
├── play/+page.svelte         # ✅ Created, needs debugging
├── stores.js                 # ✅ State management working
├── data.js                   # ✅ All questions and data complete
├── logic/
│   ├── imageService.js       # ✅ Working with mock API
│   ├── gameActions.js        # ✅ Setup actions working, main gameplay untested
│   ├── promptBuilder.js      # ✅ Working for setup, ready for main gameplay
│   ├── dice.js              # ✅ Working correctly
│   └── deck.js              # ✅ Working correctly
├── components/
│   ├── setup/
│   │   └── FaceCardSetup.svelte # ✅ Working correctly
│   └── play/                # ⚠️ ALL NEED DEBUGGING
│       ├── DrawCardPrompt.svelte     # ⚠️ Created, not tested
│       ├── TurnDecision.svelte       # ⚠️ Created, not tested
│       ├── AnswerInput.svelte        # ⚠️ Created, not tested
│       └── FocusedSituationMenu.svelte # ⚠️ Created, not tested
└── api/
    └── generate-image/+server.js # ✅ Working with mock mode
```

---

## Core Data Flow - IMPLEMENTED BUT NEEDS VERIFICATION

### **Main Gameplay Loop (Phase 2) - NEEDS TESTING:**

1. **Draw Card** (`DrawCardPrompt.svelte`)
   - Creates numerical deck on first draw
   - Draws card using `deck.js`
   - Detects "10" cards for time gaps
   - Sets `turnState = 'deciding'`

2. **Make Decision** (`TurnDecision.svelte`)
   - Shows card and question
   - Uses `cardRankCounts` to get correct question
   - Two buttons: "Answer Question" or "Choose Focused Situation"

3. **Answer/Focused Situation** (`AnswerInput.svelte` or `FocusedSituationMenu.svelte`)
   - Saves answer to `gameState.answers`
   - Increments `cardRankCounts[rank]`
   - Calls `generateImageWithContext()`
   - Resets `turnState = 'drawing'`

### **Potential Bug Areas:**
- State synchronization between components
- Card rank counting logic
- Question progression tracking
- Image generation triggers
- Navigation flow between turn states

---

## Game State Structure - COMPLETE

```javascript
gameState = {
  // Phase Management
  currentPhase: 'intro', // intro → setup-timeline → setup-place → mainPlay
  turnState: 'drawing', // drawing → deciding → answering/focusedSituation → drawing
  
  // Player Data
  settingDescription: '', // Player's place description
  imageStyle: '', // Selected visual style
  timelineUnit: null, // 'days', 'weeks', 'years', etc.
  timelineRoll: null, // Actual dice result (1-6)
  
  // Main Gameplay
  numericalDeck: [], // Created by DrawCardPrompt
  activeCard: null, // Current drawn card
  cardRankCounts: { ace: 0, two: 0, ... }, // Track question progression
  tensDrawn: 0, // Count of "10" cards for time gaps
  currentCycle: 1, // Game cycle (1-4)
  
  // Narrative Storage
  answers: {}, // All player answers with unique keys
  
  // Visual System
  currentImageUrl: '', // Current displayed image
  lastGeneratedPrompt: '', // For debugging
  isGeneratingImage: false, // Loading state
  
  // Development
  isDevelopmentMode: true // Enables mock API and debug info
}
```

---

## Architecture Status - CLEAN AND READY

### **Service Layer - WORKING:**
- `imageService.js` - Centralized image generation ✅
- `gameActions.js` - Game state management (setup working, main gameplay untested) ⚠️
- `promptBuilder.js` - AI prompt building (ready for main gameplay) ✅
- `deck.js` - Card logic (working) ✅
- `dice.js` - Dice rolling (working) ✅

### **Component Architecture - IMPLEMENTED:**
- Clean separation of UI and logic ✅
- No code duplication ✅
- Service abstractions used correctly ✅
- Consistent styling and patterns ✅

---

## Development Environment - READY

**Current Setup:**
- SvelteKit development server running on port 5173 ✅
- Hot reloading enabled and working ✅
- Google AI SDK installed (`@google/generative-ai`) ✅
- Environment file configured ✅
- Mock API mode enabled for testing ✅

**Debug Features Available:**
- `isDevelopmentMode: true` shows generated prompts
- Console logging for state changes
- Mock image URLs with encoded prompts
- Error handling and user feedback

---

## Next Developer Instructions

### **IMMEDIATE PRIORITIES:**

1. **Test Main Gameplay Flow**
   - Navigate to `/games/the-ground-itself/play` directly
   - Test card drawing → decision → answer → reset cycle
   - Verify state transitions work correctly
   - Check card rank counting and question progression

2. **Debug Integration Issues**
   - Component state synchronization
   - Answer saving and retrieval
   - Image generation triggers
   - Navigation between turn states

3. **Verify Core Game Loop**
   - Draw card → show question → answer → increment count → generate image → reset
   - Test both answer path and focused situation path
   - Ensure "10" card detection works

### **TESTING APPROACH:**
1. Start server: `npm run dev`
2. Navigate to: `http://localhost:5173/games/the-ground-itself/play`
3. Manually set game state for testing main gameplay
4. Test each component individually
5. Test complete flow integration

### **KEY FILES TO DEBUG:**
- `play/+page.svelte` - Main gameplay controller
- `components/play/*.svelte` - All main gameplay components
- `gameActions.js` - May need main gameplay actions
- `stores.js` - State management verification

---

## Success Metrics for Next Phase

### **Phase 2 Debug Goals:**
- ✅ Card drawing works and creates deck
- ✅ Questions display correctly based on card rank counts
- ✅ Answer submission saves and increments counts
- ✅ Image generation triggers after answers
- ✅ State resets correctly for next turn
- ✅ Focused situations work as alternative path
- ✅ "10" card detection triggers time gaps

### **Ready for Phase 3:**
- Time gap implementation
- End game sequence
- Final polish and testing

---

## Architecture Decisions - PROVEN EFFECTIVE

**What's Working Well:**
- Service layer architecture prevents code duplication
- Centralized state management handles complex game flow
- Mock API system allows unlimited testing
- Component separation makes debugging easier
- Existing utilities (`dice.js`, `deck.js`) work perfectly

**Maintain These Patterns:**
- Always use service abstractions
- Keep components focused on UI only
- Use existing logic components
- Maintain debug mode for development
- Follow established styling patterns

---

## Conclusion

Phase 2 implementation is **architecturally complete** with all components created and integrated. The foundation is solid, but the main gameplay loop needs thorough testing and debugging to ensure all state transitions, data flow, and user interactions work correctly. The next developer should focus on testing and fixing integration issues rather than building new features.
