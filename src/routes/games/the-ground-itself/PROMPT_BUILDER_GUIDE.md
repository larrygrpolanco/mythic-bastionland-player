# Prompt Builder Guide - The Ground Itself

## Overview

The new prompt builder system has been completely redesigned to embrace AI-human collaboration and preserve the user's natural voice while providing AI image generators with the context they need to create coherent, evolving visuals.

## Philosophy Change

### Old Approach (Problematic)
- **Strong-armed prompt creation** with rigid keyword extraction
- **Over-processed user input** breaking it into predetermined patterns
- **Lost narrative flow** by fragmenting user stories
- **Ignored AI capabilities** by being overly prescriptive

### New Approach (AI-Friendly)
- **User voice priority** - Preserves actual words and phrasing
- **Phase-based context** - Different strategies for different game phases
- **Smart length management** - Intelligent truncation while maintaining meaning
- **AI instruction-following** - Leverages AI's ability to understand context and rules

## Core Architecture

### Main Function
```javascript
buildImagePrompt(state, options = {})
```

### Prompt Structure
```
[Game Context] + [Place Foundation] + [Current Narrative] + [Time Context] + [Style Instructions]
```

### Configuration (Easy Testing)
```javascript
const CONFIG = {
    maxPromptLength: 800,        // Increased for better AI instruction following
    placeDescriptionLimit: 200,  // Word limit for core place description
    recentNarrativeLimit: 300,   // Space for recent user answers
    debugMode: true              // Set to false in production
};
```

## Phase-Based Content Management

### 1. Setup Phase
- **Place Foundation**: User's exact words with intelligent length management
- **Context**: "Describe your place" with current answer
- **Result**: Clean, natural prompt that preserves user voice

### 2. Face Card Phase (`setup-place`)
- **Current Question & Answer**: Highest priority
- **Recent Face Card Answers**: For continuity (last 2)
- **Cumulative Building**: Each answer adds to the world
- **Result**: Iterative world-building with preserved narrative flow

### 3. Main Gameplay Phase (`mainPlay`)
- **Current Event**: Question + answer get top priority
- **Recent Developments**: Last 2 gameplay answers
- **Place Foundation**: Summarized if needed, never removed
- **Result**: Focus on recent narrative while maintaining place identity

### 4. Time Gap Phase (`timeGap`)
- **Dramatic Instructions**: Special handling for time transitions
- **Time Amount & Direction**: Forward/backward in time
- **Change Descriptions**: What changed vs what remained
- **Result**: Most dramatic visual changes happen here

## Key Features

### 1. User Voice Preservation
```javascript
// Keeps user's exact words
let description = state.settingDescription.trim();

// Only truncates intelligently if too long
if (description.length > CONFIG.placeDescriptionLimit) {
    // Find last complete sentence within limit
    const truncated = description.substring(0, CONFIG.placeDescriptionLimit);
    const lastSentence = truncated.lastIndexOf('.');
    if (lastSentence > CONFIG.placeDescriptionLimit * 0.7) {
        description = truncated.substring(0, lastSentence + 1);
    }
}
```

### 2. Game Context Integration
```javascript
function getGameContext() {
    return `This is "The Ground Itself" - a storytelling game about a single place over time. 
    IMPORTANT: Everything happens in this one location. The camera is anchored to this place 
    and cannot move outside this frame or show events elsewhere.`;
}
```

### 3. Smart Length Management
- **Priority 1**: Game context + current user input (never truncated)
- **Priority 2**: Place foundation (summarized if needed, never removed)
- **Priority 3**: Recent narrative (intelligently condensed)
- **Priority 4**: Historical context (first to be shortened)

### 4. Enhanced Context System
Components can now pass rich context:
```javascript
const prompt = buildImagePrompt($gameState, {
    currentContext: {
        currentQuestion: "What stories are told in or about this place?",
        currentAnswer: "The library holds ancient tales of the Tree Keepers..."
    }
});
```

## Usage Examples

### Basic Usage
```javascript
import { buildImagePrompt } from './logic/promptBuilder.js';

// Simple prompt generation
const prompt = buildImagePrompt(gameState);
```

### With Enhanced Context (Face Cards)
```javascript
const prompt = buildImagePrompt($gameState, {
    currentContext: {
        currentQuestion: currentQuestion,
        currentAnswer: currentAnswer.trim()
    }
});
```

### With Time Gap Context
```javascript
const prompt = buildImagePrompt($gameState, {
    currentContext: {
        timeGapInfo: {
            timeAmount: 5,
            timeUnit: 'centuries',
            direction: 'forward'
        },
        timeGapAnswers: ['The library is now ruins', 'New trees have grown']
    }
});
```

## Testing and Debugging

### Debug Mode
Set `CONFIG.debugMode = true` to enable:
- Console logging of prompt sections
- Prompt length tracking
- Section-by-section breakdown

### Test Function
```javascript
import { testPromptBuilder } from './logic/promptBuilder.js';

// Test with debug output
testPromptBuilder(gameState, { debug: true });
```

### Manual Testing
The system includes a `testPromptBuilder()` function for development:
```javascript
export function testPromptBuilder(state, options = {}) {
    const prompt = buildImagePrompt(state, { ...options, debug: true });
    console.log('=== PROMPT BUILDER TEST ===');
    console.log('Final Prompt:', prompt);
    console.log('Length:', prompt.length);
    console.log('========================');
    return prompt;
}
```

## Integration with Game Components

### Updated Components
1. **FaceCardSetup.svelte** - Now uses enhanced context
2. **Main page (+page.svelte)** - Uses context-aware system
3. **Future components** - Ready for main gameplay and time gaps

### Backward Compatibility
- All existing game state structures work unchanged
- Old prompt calls still function (just without enhanced context)
- No breaking changes to existing functionality

## Example Generated Prompts

### Setup Phase
```
This is "The Ground Itself" - a storytelling game about a single place over time. 
IMPORTANT: Everything happens in this one location. The camera is anchored to this 
place and cannot move outside this frame or show events elsewhere. An ancient library 
built into the roots of a massive oak tree, with glowing crystals providing soft light 
and shelves carved directly into the living wood Style: atmospheric, digital painting, 
high detail. High detail, atmospheric, immersive. Focus on the place itself rather 
than individual people.
```

### Face Card Phase
```
This is "The Ground Itself" - a storytelling game about a single place over time. 
IMPORTANT: Everything happens in this one location. An ancient library built into 
the roots of a massive oak tree, with glowing crystals providing soft light and 
shelves carved directly into the living wood Currently: What stories are told in 
or about this place? Answer: The library holds ancient tales of the Tree Keepers, 
mystical guardians who once tended to the great oak. Legend says their spirits 
still whisper through the leaves, sharing forgotten knowledge with those who listen 
carefully. Style: atmospheric, digital painting, high detail. High detail, 
atmospheric, immersive. Focus on the place itself rather than individual people.
```

## Benefits of New System

### For Development
- **Easy to modify** - Modular functions for each section
- **Easy to test** - Built-in debugging and test functions
- **Easy to extend** - Phase-based system ready for new game phases
- **Easy to maintain** - Clear separation of concerns

### For AI Image Generation
- **Natural language** - AI can understand context and instructions
- **Preserved user voice** - Maintains the player's creative input
- **Game rule awareness** - AI understands the "fixed location" constraint
- **Context continuity** - Each image builds on the previous one

### For Players
- **Coherent visuals** - Images that truly reflect their narrative choices
- **Evolving world** - Visual progression that matches story development
- **Preserved creativity** - Their words and ideas remain central
- **Immersive experience** - Seamless integration of text and visuals

## Future Enhancements

The system is designed to easily accommodate:
- **Main gameplay prompts** - Ready for numerical card questions
- **Time gap transitions** - Special handling for dramatic changes
- **Focused situations** - Alternative narrative paths
- **End game sequences** - Final image generation

## Configuration for Production

When ready for real AI image generation:
1. Set `CONFIG.debugMode = false`
2. Adjust `maxPromptLength` based on your AI service limits
3. Fine-tune length limits based on testing results
4. Consider adding more sophisticated summarization for very long games

## Conclusion

The new prompt builder successfully transforms the game's approach to AI image generation from a rigid, keyword-based system to a flexible, context-aware system that preserves the user's voice while providing AI with the information it needs to create coherent, evolving visuals that truly represent the player's creative vision.
