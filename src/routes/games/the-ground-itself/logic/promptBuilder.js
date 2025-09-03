// src/routes/games/the-ground-itself/logic/promptBuilder.js

export function buildImagePrompt(state) {
	let prompt = '';

	// Start with the basic setting
	if (state.settingDescription) {
		prompt += `A vivid scene of ${state.settingDescription}. `;
	}

	// Process face card answers in a structured way
	const setupAnswers = [];
	const faceCardOrder = [
		'setup_jack_clubs', 'setup_queen_clubs', 'setup_king_clubs',
		'setup_jack_hearts', 'setup_queen_hearts', 'setup_king_hearts', 
		'setup_jack_diamonds', 'setup_queen_diamonds', 'setup_king_diamonds',
		'setup_jack_spades', 'setup_queen_spades', 'setup_king_spades'
	];

	// Collect setup answers in order
	faceCardOrder.forEach(key => {
		if (state.answers[key]) {
			setupAnswers.push(state.answers[key]);
		}
	});

	if (setupAnswers.length > 0) {
		// Extract different types of visual elements
		const allSetupText = setupAnswers.join(' ').toLowerCase();
		
		// Materials and textures
		const materials = allSetupText.match(/\b(?:stone|wood|metal|crystal|glass|brick|marble|granite|oak|pine|iron|gold|silver|bronze|copper|clay|sand|coral|bone|leather|fabric|silk|wool|concrete|steel|bamboo|jade|obsidian)\w*\b/g);
		
		// Colors and lighting
		const colors = allSetupText.match(/\b(?:red|blue|green|yellow|purple|orange|pink|brown|black|white|gray|grey|golden|silver|crimson|azure|emerald|amber|violet|scarlet|ivory|ebony|pearl|copper|bronze|rust|faded|bright|dark|pale|vivid|muted|glowing|shimmering|gleaming)\w*\b/g);
		
		// Architectural and natural features
		const features = allSetupText.match(/\b(?:tower|spire|dome|arch|pillar|column|wall|gate|bridge|fountain|garden|courtyard|plaza|street|alley|market|temple|shrine|palace|cottage|hut|cave|cliff|hill|valley|river|lake|forest|grove|meadow|field|mountain|peak|shore|harbor|dock|lighthouse|windmill|waterfall|spring|pond)\w*\b/g);
		
		// Atmospheric elements
		const atmosphere = allSetupText.match(/\b(?:mist|fog|smoke|steam|dust|rain|snow|wind|storm|lightning|thunder|sunshine|moonlight|starlight|shadow|darkness|twilight|dawn|dusk|noon|midnight|cloudy|clear|overcast|humid|dry|warm|cold|hot|cool|peaceful|bustling|quiet|noisy|ancient|timeless|weathered|worn|pristine|new|old|crumbling|sturdy)\w*\b/g);

		// Build descriptive elements
		let descriptiveElements = [];
		
		if (materials && materials.length > 0) {
			descriptiveElements.push(`built from ${materials.slice(0, 3).join(', ')}`);
		}
		
		if (colors && colors.length > 0) {
			descriptiveElements.push(`with ${colors.slice(0, 3).join(', ')} tones`);
		}
		
		if (features && features.length > 0) {
			descriptiveElements.push(`featuring ${features.slice(0, 3).join(', ')}`);
		}
		
		if (atmosphere && atmosphere.length > 0) {
			descriptiveElements.push(`${atmosphere.slice(0, 2).join(', ')} atmosphere`);
		}

		if (descriptiveElements.length > 0) {
			prompt += `${descriptiveElements.slice(0, 3).join(', ')}. `;
		}

		// Add specific details from recent answers
		if (setupAnswers.length > 0) {
			const recentAnswers = setupAnswers.slice(-2); // Last 2 face card answers
			const specificDetails = recentAnswers.join(' ').match(/\b(?:carved|painted|decorated|adorned|surrounded|filled|crowned|lined|bordered|covered|draped|hung|suspended|embedded|inlaid|engraved|etched|inscribed)\s+(?:with|by|in)\s+[^.!?]*[.!?]/gi);
			
			if (specificDetails && specificDetails.length > 0) {
				const cleanDetail = specificDetails[0].replace(/[.!?]+$/, '');
				prompt += `${cleanDetail}. `;
			}
		}
	}

	// Add details from main gameplay answers
	const gameplayAnswers = [];
	Object.entries(state.answers).forEach(([key, answer]) => {
		if (key.startsWith('card_') || key.startsWith('focused_')) {
			gameplayAnswers.push(answer);
		}
	});

	if (gameplayAnswers.length > 0) {
		// Extract recent narrative elements
		const recentAnswers = gameplayAnswers.slice(-3); // Last 3 answers
		const narrativeElements = recentAnswers
			.join(' ')
			.toLowerCase()
			.match(/\b(?:built|destroyed|planted|harvested|discovered|created|abandoned|restored|changed|transformed|grew|withered|flourished|decayed|emerged|vanished|appeared|disappeared|constructed|demolished|established|founded|ruined|renovated)\w*\b/g);
		
		if (narrativeElements && narrativeElements.length > 0) {
			prompt += `Recently ${narrativeElements.slice(0, 3).join(', ')}. `;
		}
	}

	// Add time period context if we have timeline info
	if (state.timelineUnit) {
		const timeContext = {
			'days': 'captured in a single moment, immediate and present',
			'weeks': 'showing recent changes and short-term evolution',
			'years': 'displaying seasonal cycles, growth and natural wear',
			'decades': 'revealing architectural changes and generational shifts',
			'centuries': 'layered with historical depth, ancient and new elements',
			'millennia': 'shaped by geological time, deep history and transformation'
		};
		prompt += `${timeContext[state.timelineUnit]}. `;
	}

	// Add the artistic style
	if (state.imageStyle) {
		prompt += `Rendered in ${state.imageStyle} style.`;
	}

	// Clean up the prompt
	prompt = prompt.trim();
	
	// Ensure it's not too long (most AI models have token limits)
	if (prompt.length > 600) {
		prompt = prompt.substring(0, 600) + '...';
	}

	return prompt;
}

// Mock function for development - generates fake image URLs
export function generateMockImageUrl(prompt) {
	// In development, we'll return a placeholder with the prompt encoded
	const encodedPrompt = encodeURIComponent(prompt.substring(0, 100));
	return `https://via.placeholder.com/800x600/4a5568/ffffff?text=${encodedPrompt}`;
}
