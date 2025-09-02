// Game guidance text based on The Ground Itself rules
export const gameGuidance = {
    gameplay: {
        title: "How to Play The Ground Itself",
        instructions: [
            "During gameplay, you'll draw cards from the numerical pile (Aces through 10s)",
            "Each card type has specific questions to answer about your place",
            "Answer the questions in order - first time you draw an Ace, answer the 1st Ace question, etc.",
            "When you draw a 10 card, the cycle ends and time advances",
            "After each cycle, you'll move forward or backward in time based on your timeline unit",
            "The game ends after the 4th ten card is drawn"
        ],
        cardTypes: {
            aces: "Aces - Focus on the physical environment: plants, rocks, soil, and gradual changes",
            twos: "Twos - Explore monuments, production, environmental changes, and breakthroughs",
            threes: "Threes - Discover arts, arguments, trends, and decisions that leave marks",
            fours: "Fours - Examine building materials, social spaces, construction, and artistic achievements",
            fives: "Fives - Look at weather, secrets, unions, and punishments",
            sixes: "Sixes - Confront horrors, changes, destruction, and disasters",
            sevens: "Sevens - Appreciate beauty, specific locations, rediscoveries, and alliances",
            eights: "Eights - Consider success, news, arrivals, and preparations",
            nines: "Nines - Explore food, departures, celebrations, and historical revelations",
            tens: "Tens - Major events that trigger time advancement and cycle changes"
        },
        tenCard: {
            title: "Cycle Change - Time Advances!",
            description: "You've drawn a 10 card. This means the current cycle ends and time moves forward or backward.",
            questions: [
                "Do our characters/civilization still live here? If not, who lives here now?",
                "What does the place physically look like now? Has anything visually changed?",
                "Does the place still use the same name? If not, what is it called now?"
            ],
            timeMovement: "Roll the die to determine how much time passes based on your timeline unit"
        },
        focusedSituations: [
            "Tell a story - Adopt a storytelling character and share a legend or fiction",
            "Throw a party - Describe a celebration and roleplay as attendees",
            "Discover something - Introduce a new fact or artifact into the world",
            "See an omen - Gesture at future possibilities or set things in motion",
            "Leave the frame - Briefly widen the view to see beyond your place",
            "Move on - Skip this turn and let the action rest elsewhere"
        ]
    },
    timelineUnits: {
        days: "Days - Intimate, close-textured story with quick-paced action",
        weeks: "Weeks - Short-term changes and developments",
        years: "Years - Medium-term evolution of your place",
        decades: "Decades - Generational changes and shifts",
        centuries: "Centuries - Major historical transformations",
        millennia: "Millennia - Epic spans where what was here may not survive recognizably"
    },
    gamePhilosophy: [
        "Remember: Places have memory - what happens is written into the walls, stones, and future",
        "This is a game about the echoes and traces we leave for others after we are gone",
        "Focus on the place itself, not individual characters - watch from the established frame",
        "Build on others' ideas rather than contradicting them",
        "Use all senses: describe how the place looks, smells, sounds, and feels"
    ]
};

// Helper function to get random guidance tip
export function getRandomTip() {
    const tips = [
        "Think about daily patterns and routines in your place",
        "Describe the materials and textures that make up your world",
        "Consider how weather and seasons affect life here",
        "What stories or legends are told about this place?",
        "How do the inhabitants mark time and celebrate milestones?",
        "What secrets might be hidden in forgotten corners?",
        "How does this place interact with the wider world?",
        "What traces of the past remain visible today?"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}
