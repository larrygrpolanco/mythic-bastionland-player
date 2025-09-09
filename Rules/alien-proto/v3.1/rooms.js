/**
 * Array of Room objects defining the ship map.
 * 7 rooms total: Linear path from Airlock to Engineering (objective), with branches to Med Bay/Cargo Hold (support) and Corridor B/Bridge (exploration risk).
 * Graph is connected, no dead-ends; ensures AI can path to objective and extract.
 * Ties to GAME_MECHANICS_MVP.md: Unlimited occupancy, auto-door open on MOVE, same-room combat.
 * For MVP missions: Start in Airlock, objective in Engineering, extract to Airlock.
 *
 * @type {Room[]}
 */
const rooms = [
	{
		id: 'airlock',
		name: 'Airlock - Entry Point',
		description:
			'The shuttle docking bay, dimly lit with emergency lights flickering. Safe extraction point for the mission.',
		connections: ['corridor_a'],
		size: 'medium',
		features: ['shuttle_console'],
		objective: null, // Start/extraction only
		initialEnemies: []
	},
	{
		id: 'corridor_a',
		name: 'Main Corridor A',
		description:
			'A long, narrow corridor with flickering fluorescent lights and exposed wiring. Central hub connecting to key areas.',
		connections: ['airlock', 'med_bay', 'cargo_hold', 'corridor_b'],
		size: 'large',
		features: ['ventilation_grate', 'emergency_panel'],
		objective: null,
		initialEnemies: []
	},
	{
		id: 'med_bay',
		name: 'Med Bay',
		description:
			'Medical facility with overturned gurneys and scattered supplies. Potential for APPLY FIRST AID actions.',
		connections: ['corridor_a', 'cargo_hold'],
		size: 'small',
		features: ['medkit', 'surgical_console'],
		objective: null,
		initialEnemies: []
	},
	{
		id: 'cargo_hold',
		name: 'Cargo Hold',
		description:
			'Spacious storage area filled with crates and debris. Good for cover (TAKE COVER +20%) and potential loot.',
		connections: ['corridor_a', 'med_bay', 'engineering'],
		size: 'large',
		features: ['storage_crates', 'loading_dock'],
		objective: null,
		initialEnemies: []
	},
	{
		id: 'engineering',
		name: 'Engineering Deck',
		description:
			"The heart of the ship's systems, humming with machinery. Primary objective location for Retrieve/Activate missions.",
		connections: ['cargo_hold'],
		size: 'medium',
		features: ['reactor_core', 'control_terminal'],
		objective: 'retrieve_item', // Example for MVP; configurable per scenario
		initialEnemies: ['alien_drone'] // Basic threat for combat testing
	},
	{
		id: 'corridor_b',
		name: 'Side Corridor B',
		description:
			'A maintenance corridor with flickering lights and strange noises echoing from the walls. Risky branch for exploration.',
		connections: ['corridor_a', 'bridge'],
		size: 'small',
		features: ['access_panel'],
		objective: null,
		initialEnemies: []
	},
	{
		id: 'bridge',
		name: 'Bridge - Command Center',
		description:
			"The ship's command bridge, abandoned with consoles sparking. Optional exploration for clues or risks.",
		connections: ['corridor_b'],
		size: 'medium',
		features: ['captains_console', 'navigation_terminal'],
		objective: null,
		initialEnemies: ['alien_drone'] // Higher risk for AI priority testing
	}
];

export default rooms;
