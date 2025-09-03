# Architecture Guide - The Ground Itself

## ⚠️ CRITICAL: READ THIS BEFORE MAKING CHANGES ⚠️

This document explains the clean architecture implemented to prevent code bloat and redundancy. **DO NOT** duplicate logic that already exists in service layers.

## The Problem We Solved

### Before Refactoring (WRONG APPROACH)
- **Duplicated image generation logic** in multiple components
- **Inline dice rolling** instead of using existing `dice.js`
- **Direct state manipulation** scattered across components
- **Hundreds of lines of redundant code** in the main page
- **No separation of concerns** between UI and business logic

### After Refactoring (CORRECT APPROACH)
- **Centralized services** handle all business logic
- **Components focus only on UI** and user interactions
- **Existing logic components** (`dice.js`, `deck.js`) are properly utilized
- **Clean, maintainable code** with clear abstractions

## Service Layer Architecture

### 1. Image Generation Service (`logic/imageService.js`)

**Purpose**: Centralized image generation for the entire game.

```javascript
// ✅ CORRECT: Use the service
import { generateImageWithContext } from './logic/imageService.js';
await generateImageWithContext(question, answer);

// ❌ WRONG: Don't duplicate this logic in components
async function generateImage(prompt) {
  // This logic already exists in imageService.js!
}
```

**Key Functions**:
- `generateImage(options)` - Basic image generation
- `generateImageWithContext(question, answer)` - For face cards/gameplay
- `generateTimeGapImage(timeGapInfo, answers)` - For time transitions

### 2. Game Actions Service (`logic/gameActions.js`)

**Purpose**: Centralized game state management and business logic.

```javascript
// ✅ CORRECT: Use the service
import { startGame, rollTimeline, submitFaceCardAnswer } from './logic/gameActions.js';
await startGame(description, style);

// ❌ WRONG: Don't duplicate game logic in components
function rollTimeline() {
  const roll = Math.floor(Math.random() * 6) + 1; // This is wrong!
  // dice.js already exists for this!
}
```

**Key Functions**:
- `startGame(description, style)` - Initialize game with place description
- `rollTimeline()` - Uses `dice.js` properly for timeline setup
- `submitFaceCardAnswer(answer, question)` - Handle face card progression
- `navigateToPhase(phase)` - Clean phase transitions

### 3. Existing Logic Components (DO NOT DUPLICATE)

#### `dice.js` - Dice Rolling Logic
```javascript
// ✅ CORRECT: Use existing functions
import { rollD6, getTimelineUnit } from './dice.js';
const roll = rollD6();
const unit = getTimelineUnit(roll);

// ❌ WRONG: Don't reimplement dice logic
const roll = Math.floor(Math.random() * 6) + 1; // NO!
```

#### `deck.js` - Card Logic
```javascript
// ✅ CORRECT: Use existing functions
import { createFaceCardDeck, drawCard } from './deck.js';
const deck = createFaceCardDeck();
const { card, remainingDeck } = drawCard(deck);

// ❌ WRONG: Don't reimplement card logic
// Complex card creation logic already exists!
```

#### `promptBuilder.js` - AI Prompt Generation
```javascript
// ✅ CORRECT: Use existing function
import { buildImagePrompt } from './promptBuilder.js';
const prompt = buildImagePrompt(state, options);

// ❌ WRONG: Don't create prompts manually
// Sophisticated prompt building logic already exists!
```

## Component Responsibilities

### ✅ Components SHOULD:
- Handle UI rendering and styling
- Manage local UI state (form inputs, loading states)
- Call service functions for business logic
- Display data from the game state store

### ❌ Components SHOULD NOT:
- Make direct API calls (use `imageService.js`)
- Implement dice rolling (use `dice.js`)
- Create or shuffle cards (use `deck.js`)
- Build AI prompts (use `promptBuilder.js`)
- Directly manipulate game state (use `gameActions.js`)

## Examples of Clean Component Code

### Main Page Component
```javascript
// ✅ CORRECT: Clean, focused component
import { startGame, rollTimeline } from './logic/gameActions.js';

async function handleStartGame() {
  try {
    await startGame(settingInput, selectedImageStyle);
  } catch (error) {
    alert(error.message);
  }
}

function handleRollTimeline() {
  rollTimeline(); // Uses dice.js internally
}
```

### Face Card Setup Component
```javascript
// ✅ CORRECT: Uses service abstractions
import { submitFaceCardAnswer } from './logic/gameActions.js';

async function handleSubmitAnswer() {
  const result = await submitFaceCardAnswer(currentAnswer, currentQuestion);
  if (result.isComplete) {
    console.log('Setup complete!');
  }
}
```

## File Structure and Responsibilities

```
src/routes/games/the-ground-itself/
├── +page.svelte              # UI only - uses services
├── stores.js                 # State management
├── data.js                   # Static game data
├── logic/
│   ├── imageService.js       # 🔥 CENTRALIZED image generation
│   ├── gameActions.js        # 🔥 CENTRALIZED game logic
│   ├── promptBuilder.js      # AI prompt generation
│   ├── dice.js              # Dice rolling utilities
│   └── deck.js              # Card creation and management
├── components/
│   └── setup/
│       └── FaceCardSetup.svelte # UI only - uses services
└── api/
    └── generate-image/
        └── +server.js        # Server-side API endpoint
```

## Common Mistakes to Avoid

### 1. Duplicating Image Generation
```javascript
// ❌ WRONG: Don't do this in components
async function generateImage(prompt) {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    // ... duplicate logic
  });
}

// ✅ CORRECT: Use the service
import { generateImageWithContext } from './logic/imageService.js';
await generateImageWithContext(question, answer);
```

### 2. Reimplementing Dice Logic
```javascript
// ❌ WRONG: Don't reimplement dice rolling
const roll = Math.floor(Math.random() * 6) + 1;
const units = { 1: 'days', 2: 'weeks' /* ... */ };

// ✅ CORRECT: Use existing dice.js
import { rollD6, getTimelineUnit } from './dice.js';
const roll = rollD6();
const unit = getTimelineUnit(roll);
```

### 3. Direct State Manipulation
```javascript
// ❌ WRONG: Don't manipulate state directly in components
gameState.update(state => ({
  ...state,
  currentPhase: 'setup-place',
  timelineRoll: roll,
  // ... complex state changes
}));

// ✅ CORRECT: Use game actions
import { navigateToPhase, rollTimeline } from './logic/gameActions.js';
rollTimeline(); // Handles all state changes internally
```

## Testing and Debugging

### Service Layer Benefits
- **Easy to test**: Services can be tested independently
- **Easy to debug**: Logic is centralized and well-documented
- **Easy to modify**: Changes in one place affect the whole system
- **Easy to extend**: New features use existing services

### Debug Mode
The system includes comprehensive debugging:
```javascript
// In development, you can see exactly what's happening
console.log('Generated prompt:', prompt);
console.log('Game state after action:', state);
```

## Future Development Guidelines

### When Adding New Features:
1. **Check existing services first** - Don't duplicate logic
2. **Add to appropriate service** - Don't put logic in components
3. **Use existing utilities** - `dice.js`, `deck.js`, `promptBuilder.js`
4. **Follow the pattern** - Services handle logic, components handle UI

### When Fixing Bugs:
1. **Fix in the service layer** - Not in individual components
2. **Update documentation** - Keep this guide current
3. **Test across all components** - Services affect multiple places

## Performance Benefits

### Before Refactoring:
- Duplicated code increased bundle size
- Multiple API call implementations
- Inconsistent error handling
- Hard to maintain and debug

### After Refactoring:
- Smaller, cleaner components
- Single source of truth for each concern
- Consistent behavior across the app
- Much easier to maintain and extend

## Conclusion

This architecture ensures:
- **No code duplication** - Each piece of logic exists in one place
- **Clear separation of concerns** - UI vs business logic
- **Proper use of existing components** - `dice.js`, `deck.js`, etc.
- **Maintainable codebase** - Easy to understand and modify
- **Extensible design** - Ready for future features

**Remember**: Always use the service abstractions. Never duplicate logic that already exists in the service layer or utility files.
