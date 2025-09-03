// src/routes/games/the-ground-itself/data.js

export const faceCardQuestions = {
	clubs: {
		jack: 'What was this place in the past? How long ago was that?',
		queen: 'What was the greatest moment in this place\'s history? (An innovation? A discovery? A revolution? A new sapling? The emergence of a cycle of cicadas?)',
		king: 'If there are inhabitants, what are the visions for the future that they hold? Is it a long view? A short one?'
	},
	hearts: {
		jack: 'Who lives here? What is an average person like in this place? What do they look like? What do they wear?\n\nOR\n\nDescribe the flora and fauna. What is the landscape like? What animals and plants call it home?',
		queen: 'Who or what (a person, landmark, society) has been in this place the longest? How did they come to be here?',
		king: 'What stories are told in or about this place? Does it have legends or myths? Does it have religion?'
	},
	diamonds: {
		jack: 'What is this place named or called? Who named it, and for what reason?',
		queen: 'What is valued in this place? What is it known to have in excess?',
		king: 'Who or what is in power here? (Is it a ruler? An apex predator? A series of laws that govern society? The weather?)'
	},
	spades: {
		jack: 'What are the threats to this place? Are these threats to the materiality of the place, or the people that live in it?',
		queen: 'What was the greatest tragedy in this place\'s past? How is it remembered?',
		king: 'If there are multiple people who live here, what are they divided on? What are the points of contention that are fought over?\n\nOR\n\nIf there are not multiple people, what resources do the plants, animals, or visitors to our place vie for?'
	}
};

export const numericalCardQuestions = {
	ace: [
		'What are the plants like in our place? The rocks? The soil?',
		'It is time to plant \'the seedlings\'. What are the seedlings and where are they planted? What is the harvest that is hoped for?',
		'The harvest day has arrived. What is being harvested, for what purpose, and how is it being stored?',
		'Sometimes change is so slow that the world shifts unnoticed. What is the groundswell that has been taking place so quietly?'
	],
	two: [
		'Name a monument, marker, statue, or other physicalized memory that exists in our place. What does it mark?',
		'What is produced in our place right now, and how does it make its way into the wider world? (Is this export a physical good? Knowledge? Something else?)',
		'A major modification is made to the environment of our place. What is this change? Was it made by someone or did it simply come to pass?',
		'A breakthrough moment (in technology, arts, politics, philosophy, or daily life) tips the scales of a power balance. What was this breakthrough, and how does it play out socially?'
	],
	three: [
		'What do people listen to and perform here? What is considered the folk art?',
		'What do people in our place argue about for fun (whether at the bar, in the square, or in other social spaces)?',
		'A new style, fad, or devotion sweeps our place. What is it? Who cares about it?',
		'A bad decision leaves marks on the land. What was this decision, and what trace does it leave?'
	],
	four: [
		'What is the primary building or natural material of our place?',
		'\'The bar\' opens their doors to all. What is the bar, and who is a regular there?\n\nOR\n\n\'The church\' changes a core mandate. What is the church, and what about their worldview has shifted?',
		'Something new has been constructed, and stands where there was once something else. What was once there, and what has replaced it?',
		'A creative or artistic achievement is unveiled. What is it? How is it received?'
	],
	five: [
		'What are the stars like in our place? The sky? The weather?',
		'What secrets are kept in our place? Why are they kept? By who and from whom?',
		'There is a union. Is it political? Emotional? Marital? What is newly aligned?',
		'Someone is found guilty, and is punished. What did they do, and what is the punishment?'
	],
	six: [
		'What is the most horrible thing in or about our place?',
		'Someone returns to our place changed. Who are they, and how are they different?',
		'Something small but noticeable is destroyed. What was it, and who or what destroyed it?',
		'A natural or architectural disaster strikes with no warning, leaving something in ruins. What was this disaster?'
	],
	seven: [
		'What is the most beautiful thing in or about our place?',
		'Invent a specific street, building, corner, overlook, or meeting-place. What is it called officially, and what do the locals call it?',
		'A forgotten aspect to our place is recovered. What is it? A corner? A basement? A hidden garden?',
		'A previous alliance shows cracks. There is bickering and infighting. Who is fighting? What are they fighting about?'
	],
	eight: [
		'What does success look like in our place? What do the inhabitants want?',
		'The news is dramatic, and tensions are high. What is the news? How is this reaction physicalized in space?',
		'Someone (or a group of people) comes to our place. Who are they, and why have they come? Do they bring anything with them?',
		'The future feels unsure, and the talk of our place has turned to preparations. What preparations are being taken, and for what?'
	],
	nine: [
		'What do people eat and drink here? What is considered traditional?',
		'Someone (or a group) leaves our place. Who are they, and why are they going? What do they take with them and what do they leave behind?',
		'There is planning going into a celebration. Is it a festival, holiday, or remembrance? What is it celebrating?',
		'New information about a past event is uncovered, casting it in a dramatically different light. What was found and how does it change how the past is perceived?'
	]
};

export const tenCardQuestions = [
	'The \'gardens\' are planted, the work has been done, and now we wait. What was planted, and what are we waiting for?',
	'There is a great victory that enables the inhabitants of our place to build towards a new future. What is this future they wish for? How will they set to work on it?',
	'There a great loss, one that sets new burdens on the inhabitants of our place. How do they cope, and what have they lost forever?',
	'Someone important (socially, political, or emotionally) in our place dies. Who were they, and how were they killed? How are they remembered after?',
	'It is a resting day, in anticipation of problems just across the horizon. What is believed to be coming, and how do the inhabitants of our place set these problems aside, for just one day?',
	'It is a resting day, in the knowledge of a secure future. What is taken as a given, and how do the inhabitants of our place spend a lazy day?'
];

export const timeGapQuestions = [
	'Do our characters/civilization still live here? If not, who lives here now? Does anyone?',
	'What does the place physically look like now? Has anything visually changed? How does it smell now? How does it feel here?',
	'Does the place still use the same name? If not, what is it called now, and who calls it that?'
];

export const focusedSituations = [
	{
		name: 'Tell a story',
		description: 'Adopt (or invent) a storytelling character in-game. Briefly describe them; their name, what they sound like. This may be an old bard, an entertainer on tv, a parent with a bedtime book, or something more abstract like a bird cawing at the morning.'
	},
	{
		name: 'Throw a party',
		description: 'Describe the situation of the party (A birthday? A ball? A festival in the street? The spring, when the flowers all bloom?), and describe who or what attends.'
	},
	{
		name: 'Discover something',
		description: 'This is a chance to name a fact that enters the world whole-cloth. Maybe a teenager unearths some strange old artifact, or a chemist synthesizes a new periodic element, or a water main breaks in the street.'
	},
	{
		name: 'See an omen',
		description: 'Gesture at a future possibility. An omen may be the classic type; a comet or a spell gone awry; or something that points at the materiality of the world— a hungry animal in from a famine in the countryside, or an heir to the throne that sickens ahead of a coup.'
	},
	{
		name: 'Leave the frame',
		description: 'Just for a second, the window widens and we are able to see a little bit more of our world. You may ask— what is the mountain like to the north of our house? Are there massing armies on the sea? What type of dogs do the neighbors have?'
	},
	{
		name: 'Move on',
		description: 'Skip this turn, merely discarding the card and letting the action rest elsewhere.'
	}
];

export const timelineUnits = {
	1: 'days',
	2: 'weeks', 
	3: 'years',
	4: 'decades',
	5: 'centuries',
	6: 'millennia'
};

export const imageStyleOptions = [
	'atmospheric, digital painting, high detail',
	'watercolor, soft, dreamy, impressionistic',
	'oil painting, classical, renaissance style',
	'pencil sketch, detailed line art, black and white',
	'fantasy art, vibrant colors, magical realism',
	'photorealistic, cinematic lighting, detailed',
	'minimalist, clean lines, simple composition',
	'surreal, abstract, otherworldly'
];
