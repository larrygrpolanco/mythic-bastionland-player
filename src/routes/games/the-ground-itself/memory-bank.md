# The Ground Itself - Memory Bank

## Project Brief
**The Ground Itself** is a narrative-driven web game adaptation of Everest Pipkin's tabletop game about places over time. Players collaboratively build stories about locations through card-driven prompts, establishing places with face cards, then exploring their evolution through number cards over 4 cycles separated by time gaps.

**Core Goal**: Create an engaging, immersive web experience that captures the magic of collaborative place-building while maintaining the game's core mechanics and narrative focus.

**Key Features**:
- Animated introduction with typewriter effect
- Modular page structure (introduction → setup → gameplay → cycle-end)
- Always-visible time viewport for navigation
- Image generation integration showing place evolution
- Consent mechanism and collaborative storytelling

## Product Context
This game transforms a tabletop experience into a digital narrative tool. Unlike traditional games with win conditions, this is about collaborative world-building and exploring the echoes of places over time.

**Why This Matters**:
- Places have memory - what happens there leaves traces
- Stories about places are as important as events themselves
- Time creates distance that reveals new perspectives
- Collaborative creation builds richer narratives

**User Experience Goals**:
- Immersive, story-like introduction
- Intuitive card-based gameplay
- Visual representation of place evolution
- Easy time navigation and history exploration
- Seamless flow between collaborative phases

## Active Context
**Current Focus**: Phase 1 - Introduction screen and modular structure
- Create animated introduction with typewriter effect
- Implement page routing for different game phases
- Build time viewport component
- Fix existing bugs in setup and gameplay

**Next Steps**:
- Phase 2: Enhanced gameplay with proper cycle transitions
- Phase 3: Time navigation and history
- Phase 4: Polish and testing

**Key Decisions Made**:
- Using SvelteKit for routing and component structure
- Single memory-bank.md file for simplicity
- Typewriter effect for introduction immersion
- Always-visible time viewport as core navigation

## System Patterns
**Architecture**:
- SvelteKit routing: `/introduction` → `/setup` → `/gameplay` → `/cycle-end`
- Component structure: reusable, focused components
- State management: Svelte stores with gameActions
- File organization: keep everything in the-ground-itself folder

**Code Patterns**:
- Reactive state with $state and $effect
- Game actions as pure functions
- Component composition over inheritance
- CSS custom properties for theming

**Game Flow**:
1. Introduction (animated text, "Begin" button)
2. Setup (place name, timeline, face cards)
3. Gameplay (card drawing, answering questions)
4. Cycle End (time gap, place evolution questions, image generation)
5. Repeat until 4th ten card

## Tech Context
**Technologies**:
- SvelteKit for routing and SSR
- Svelte 5 with runes ($state, $effect)
- Tailwind CSS for styling
- Svelte stores for state management

**Dependencies**:
- None special - keeping it lightweight
- Future: Image generation API integration

**Development Setup**:
- Project root: `/Users/larrygrpolanco/Documents/GitHub/mythic-bastionland-player`
- Game folder: `src/routes/games/the-ground-itself/`
- All game files contained within the-ground-itself folder

## Progress
**Completed**:
- Basic game structure with setup and gameplay
- Card drawing system with questions
- Face card establishment
- Time advancement on 10s
- Memory bank creation
- **PHASE 1 COMPLETE**: Introduction screen with typewriter effect
- Modular page routing (introduction → setup → gameplay)
- Time viewport component with real-time updates
- Improved setup flow with progress indicators
- Loading states and smooth transitions

**Completed**:
- **PHASE 2A COMPLETE**: Enhanced setup phase with guided sections and typewritten instructions
- Restructured setup into three guided sections: Our Setting, Our Timeline, Establishing Our Place
- Added typewritten guidance text for each section with collapsible toggle
- Implemented smooth section transitions with progress indicators
- Added back/forward navigation between sections
- **PHASE 2B COMPLETE**: Enhanced "Establishing Our Place" with card theming and navigation
- Added suit-specific visual theming (Clubs=Purple, Hearts=Red, Diamonds=Blue, Spades=Gray)
- Added card transition animations and improved layout
- Created review modal for quick card navigation with clean card names
- Added progress dots and encouragement messages
- Enhanced mobile responsiveness and user experience
- Moved navigation buttons to card content area for better UX
- Repositioned suit indicators above card titles
- Fixed completion screen guidance bug
- Refactored CSS into separate file for better organization
- **PHASE 2C COMPLETE**: Enhanced gameplay with proper cycle transitions
- Implemented cycle-based routing structure with dedicated cycle pages
- Enhanced gameStore to track card instances (1st, 2nd, 3rd, 4th questions)
- Created cycle-end page for time gap questions and place evolution
- Updated GamePlay component for proper cycle transitions
- Added navigation between gameplay and cycle pages

**In Progress**:
- Image generation API integration (dummy implementation)
- Testing and polishing cycle transitions

**Known Issues**:
- Image generation API not yet implemented
- Some minor styling inconsistencies
- Accessibility warnings in setup page (unrelated to cycles)

**Next Priorities**:
1. Create ending page for game conclusion
2. Implement dummy image generation API
3. Add more polish and error handling
4. Test cycle transitions thoroughly

## Core Ideas (Don't Forget)
- **Camera stays on the place** - never follow characters outside the frame
- **Places have memory** - events leave traces that persist
- **Time creates perspective** - gaps reveal new aspects
- **Stories matter** - fiction and legends are part of the place's identity
- **Consent is key** - coin flip mechanism for difficult content
- **Collaboration over competition** - build on others' ideas
- **Visual evolution** - images should change based on narrative
- **Time navigation** - players should explore the timeline freely
