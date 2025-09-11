export const mapData = {
  boroughs: {
    manhattan: {
      name: 'Manhattan',
      locations: [
        {
          id: 'loc01',
          name: 'Central Park',
          details: 'Reports of strange fog formations and unusual animal behavior. Several missing persons cases reported here in the last month.',
          npcs: [
            { id: 'npc01', name: 'Park Ranger Davis', role: 'Information source about park anomalies' }
          ],
          hasActiveEvent: true,
          visited: false
        },
        {
          id: 'loc02',
          name: 'Financial District',
          details: 'Unexplained power fluctuations reported. Security cameras show brief glimpses of shadowy figures moving through empty office buildings.',
          npcs: [
            { id: 'npc02', name: 'Security Guard Miller', role: 'Witness to strange occurrences' }
          ],
          hasActiveEvent: false,
          visited: true
        },
        {
          id: 'loc03',
          name: 'East River Waterfront',
          details: 'Multiple reports of greenish, slimy residue appearing on piers and walkways. Fishermen report unusual catches and strange sounds from the water.',
          npcs: [
            { id: 'npc03', name: 'Fisherman Kowalski', role: 'First-hand witness to river anomalies' }
          ],
          hasActiveEvent: true,
          visited: false
        }
      ]
    },
    brooklyn: {
      name: 'Brooklyn',
      locations: [
        {
          id: 'loc04',
          name: 'Gowanus Canal',
          details: 'The polluted waters seem to be getting darker and more viscous. Residents report hearing whispers coming from the canal at night.',
          npcs: [
            { id: 'npc04', name: 'Local Artist Maria', role: 'Noticed strange symbols appearing along canal walls' }
          ],
          hasActiveEvent: true,
          visited: false
        },
        {
          id: 'loc05',
          name: 'Brooklyn Navy Yard',
          details: 'Abandoned buildings show signs of recent occupation. Strange symbols carved into walls and floors of several structures.',
          npcs: [
            { id: 'npc05', name: 'Urban Explorer Alex', role: 'Discovered the symbols during exploration' }
          ],
          hasActiveEvent: false,
          visited: false
        },
        {
          id: 'loc06',
          name: 'Prospect Park',
          details: 'Similar anomalies to Central Park but less frequent. Wildlife seems particularly agitated around the lake area.',
          npcs: [
            { id: 'npc06', name: 'Bird Watcher Thompson', role: 'Documenting unusual animal behavior' }
          ],
          hasActiveEvent: false,
          visited: true
        }
      ]
    },
    queens: {
      name: 'Queens',
      locations: [
        {
          id: 'loc07',
          name: 'Flushing Meadows',
          details: 'The Unisphere has been the center of several strange energy readings. Park workers report equipment malfunctions in the area.',
          npcs: [
            { id: 'npc07', name: 'Maintenance Worker Lee', role: 'Experienced technical anomalies firsthand' }
          ],
          hasActiveEvent: true,
          visited: false
        },
        {
          id: 'loc08',
          name: 'Astoria',
          details: 'Residents report unusual fog patterns moving through the neighborhood. Some claim to have seen figures moving within the fog.',
          npcs: [
            { id: 'npc08', name: 'Restaurant Owner Dimitri', role: 'Witness to fog phenomena' }
          ],
          hasActiveEvent: false,
          visited: false
        }
      ]
    },
    bronx: {
      name: 'The Bronx',
      locations: [
        {
          id: 'loc09',
          name: 'Bronx Zoo',
          details: 'Animals have been unusually agitated, especially after dark. Night guards report hearing strange calls that don\'t match any known species.',
          npcs: [
            { id: 'npc09', name: 'Zookeeper Rodriguez', role: 'Monitoring animal behavior changes' }
          ],
          hasActiveEvent: false,
          visited: false
        },
        {
          id: 'loc10',
          name: 'Yankee Stadium',
          details: 'During night games, players and fans have reported seeing shadowy figures in the upper decks. Security finds nothing upon investigation.',
          npcs: [
            { id: 'npc10', name: 'Stadium Security Johnson', role: 'Investigating the sightings' }
          ],
          hasActiveEvent: true,
          visited: false
        }
      ]
    },
    statenIsland: {
      name: 'Staten Island',
      locations: [
        {
          id: 'loc11',
          name: 'Freshkills Park',
          details: 'Former landfill now showing signs of unusual activity. Ground sensors detect movement where there should be none.',
          npcs: [
            { id: 'npc11', name: 'Environmental Scientist Chen', role: 'Studying the anomalous readings' }
          ],
          hasActiveEvent: true,
          visited: false
        },
        {
          id: 'loc12',
          name: 'Staten Island Ferry Terminal',
          details: 'Commuters report feeling watched and experiencing sudden temperature drops while waiting for ferries, especially during late runs.',
          npcs: [
            { id: 'npc12', name: 'Ferry Worker O\'Malley', role: 'Collecting reports from passengers' }
          ],
          hasActiveEvent: false,
          visited: false
        }
      ]
    }
  }
};
