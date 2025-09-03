# The Ground Itself - Memory Bank

## Project Status: COMPLETE Phase 1 ✅

**Last Updated**: December 3, 2025  
**Current Phase**: Phase 1 FULLY COMPLETE - Ready for Phase 2 Implementation  
**Development Server**: Running at `http://localhost:5173/games/the-ground-itself`

---

## Project Vision
A web-based, single-player adaptation of Everest Pipkin's tabletop game "The Ground Itself." The defining feature is AI-generated images that dynamically evolve as players answer narrative prompts, creating an immersive storytelling experience about places over time.

---

## Current Implementation Status

### ✅ **COMPLETED - Phase 0 & Phase 1 (MVP)**

**Core Architecture Established:**
- Self-contained game directory: `src/routes/games/the-ground-itself/`
- Centralized state management via `stores.js`
- Modular file structure with separated logic, components, and data
- Secure server-side API endpoint for image generation

**Working Game Flow:**
1. **Intro Phase** - Game introduction and rules explanation
2. **Setting Setup** - Player describes their place + selects visual style
3. **Timeline Setup** - Dice roll determines time scale (days to millennia)
4. **Mock Image Generation** - Builds prompts from game state, calls API
5. **Phase Transitions** - Smooth navigation between game phases

**Technical Infrastructure:**
- **Mock Development Mode**: Uses placeholder.com for testing (cost-effective)
- **Debug Information**: Shows generated prompts during development
- **Responsive UI**: Clean, professional interface that works on all devices
- **Error Handling**: Graceful fallbacks for API failures
- **Hot Reloading**: Development environment with live updates

---

## File Structure & Key Components

```
src/routes/games/the-ground-itself/
├── +page.svelte              # Main game controller & UI
├── stores.js                 # Centralized game state management
├── data.js                   # All questions, cards, and game data
├── memory-bank.md           # This file - project context
├── project-plan.md          # Sequential implementation plan
├── ground_itself_plaintext.txt # Original game rules
├── logic/
│   ├── deck.js              # Card creation, shuffling, drawing
│   ├── dice.js              # Dice rolling utilities
│   └── promptBuilder.js     # AI prompt generation + mock functions
├── api/
│   └── generate-image/
│       └── +server.js       # Secure server-side image API
└── components/              # (Empty - ready for Phase 2)
    └── setup/               # (Empty - ready for Phase 2)
```

---

## Core Data Flow (The Loop) - IMPLEMENTED ✅

This is the heart of the application and is **working correctly**:

1. **Player Input** → Player answers a prompt or describes their place
2. **State Update** → Answer saved to `gameState.answers` object
3. **Prompt Building** → `promptBuilder.js` reads entire game state and creates AI prompt
4. **API Call** → Frontend calls `/api/generate-image` with prompt
5. **Mock Response** → Server returns placeholder URL with encoded prompt
6. **UI Update** → Image updates, debug info shows generated prompt

**Key Implementation Details:**
- All answers stored in `gameState.answers` with unique keys
- Prompt builder extracts visual elements from narrative text
- Mock mode prevents expensive API calls during development
- Debug mode shows generated prompts for testing

---

## Game State Structure - IMPLEMENTED ✅

```javascript
gameState = {
  // Phase Management
  currentPhase: 'intro', // intro → setup-timeline → setup-place → mainPlay
  
  // Player Data
  settingDescription: '', // Player's place description
  imageStyle: '', // Selected visual style
  timelineUnit: null, // 'days', 'weeks', 'years', etc.
  timelineRoll: null, // Actual dice result (1-6)
  
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

## Testing Results - VERIFIED ✅

**Tested Successfully:**
- ✅ Game loads at correct URL
- ✅ Intro phase displays properly
- ✅ Setting input accepts text and validates
- ✅ Image style selection works
- ✅ Phase transitions are smooth
- ✅ Timeline dice rolling functions
- ✅ Mock image generation creates proper prompts
- ✅ Debug information displays correctly
- ✅ State persistence across phases
- ✅ Responsive design on different screen sizes

**Example Working Flow:**
1. Player enters: "An ancient library built into the roots of a massive oak tree, with glowing crystals providing soft light"
2. System generates prompt: "A vivid scene of An ancient library built into the roots of a massive oak tree, with glowing crystals providing soft light. atmospheric, digital painting, high detail."
3. Mock API returns placeholder image with encoded prompt
4. Game transitions to timeline setup
5. Dice roll determines time scale
6. Game ready for next phase

---

## Ready for Phase 2 Implementation

### ✅ **COMPLETED IN THIS SESSION - FULL PHASE 1:**

1. **Face Card Setup Phase** - ✅ FULLY IMPLEMENTED
   - ✅ Created `FaceCardSetup.svelte` component with full UI
   - ✅ Implemented all 12 face card questions (Jack/Queen/King of each suit)
   - ✅ Built question display and answer input system
   - ✅ Added progress tracking (Question X of 12 with visual progress bar)
   - ✅ Implemented card display with suit symbols and colors
   - ✅ Added image generation trigger after each answer
   - ✅ Built cumulative world description through iterative prompts
   - ✅ Added loading states and user feedback
   - ✅ Implemented automatic progression through face card deck
   - ✅ Added completion transition to main gameplay

2. **Enhanced Game State Management** - ✅ COMPLETED
   - ✅ Added face card tracking properties to stores.js
   - ✅ Implemented face card deck initialization and management
   - ✅ Added progress tracking for face card completion

3. **Advanced Prompt Builder** - ✅ COMPLETED
   - ✅ Enhanced `promptBuilder.js` with sophisticated keyword extraction
   - ✅ Added material, color, feature, and atmosphere detection
   - ✅ Implemented cumulative world-building logic
   - ✅ Added timeline context integration
   - ✅ Built structured prompt generation from face card answers

4. **Complete Integration** - ✅ TESTED AND VERIFIED
   - ✅ Updated main page controller to use FaceCardSetup component
   - ✅ Verified smooth phase transitions
   - ✅ Tested complete flow: Intro → Setting → Timeline → Face Cards
   - ✅ Confirmed iterative image generation works
   - ✅ Validated state persistence across all phases
   - ✅ Tested responsive design and user experience

### **NEXT PRIORITIES FOR PHASE 2:**

1. **Main Gameplay Loop** - Ready to Implement
   - Card drawing system for numerical cards (Ace through 9)
   - Question progression tracking (1st Ace, 2nd Ace, etc.)
   - Focused situation alternatives
   - Image updates after each narrative addition

2. **Time Gap System** - Ready to Implement
   - Handle "10" card draws
   - Time jump mechanics with dice rolling
   - Three transition questions
   - Dramatic image generation for time passage

3. **End Game System** - Ready to Implement
   - Final question and conclusion
   - Game completion flow
   - Final image generation

### **Implementation Notes for Next Developer:**

**Critical Patterns to Follow:**
- Always update `gameState.answers` with unique keys
- Call image generation after every narrative addition
- Use the existing `buildImagePrompt()` function - it's working well
- Maintain the debug mode for development testing
- Follow the existing component structure and styling

**Key Functions Ready to Use:**
- `createFaceCardDeck()` - Creates and shuffles face cards
- `drawCard(deck)` - Draws next card from deck
- `buildImagePrompt(state)` - Builds AI prompts from game state
- `generateMockImageUrl(prompt)` - Creates mock images for testing

**API Integration:**
- Mock mode is enabled and working
- Real Gemini API code is commented in `+server.js`
- Environment variable `GEMINI_API_KEY` is set up
- Switch `isDevelopmentMode: false` when ready for real API

---

## Development Environment

**Current Setup:**
- SvelteKit development server running on port 5173
- Hot reloading enabled and working
- Google AI SDK installed (`@google/generative-ai`)
- Environment file configured with dummy API key
- No TypeScript - pure JavaScript as requested

**To Continue Development:**
1. Server should already be running at `http://localhost:5173`
2. Navigate to `/games/the-ground-itself` to see current state
3. All files are in place and ready for Phase 2 implementation
4. Mock mode allows unlimited testing without API costs

---

## Architecture Decisions Made

**State Management**: Single centralized store - works well, don't change
**Image Generation**: Server-side API calls for security - keep this pattern
**Component Structure**: Small, focused components - continue this approach
**Styling**: Inline styles in Svelte components - maintain consistency
**Data Organization**: Separate data.js file - all questions are there
**Development Flow**: Mock first, real API later - proven effective

---

## Known Issues & Considerations

**Minor Issues:**
- Placeholder image URLs sometimes fail to load (cosmetic only)
- Some accessibility warnings in console (non-blocking)

**Design Decisions:**
- Chose placeholder.com over local images for simplicity
- Mock mode returns URLs with encoded prompts for debugging
- Debug info only shows in development mode
- Single-page application with phase-based rendering

**Performance Notes:**
- Image generation is the slowest part (by design)
- State updates are instant and reactive
- No optimization needed yet - performance is good

---

## Success Metrics Achieved

✅ **MVP Goals Met:**
- Complete setup flow implemented and tested
- Image generation system working with mock data
- State management handling complex game flow
- Professional UI that matches game's aesthetic
- Development environment optimized for iteration
- All core architectural decisions validated through testing

**Ready for Phase 2 with confidence** - the foundation is solid and extensible.
