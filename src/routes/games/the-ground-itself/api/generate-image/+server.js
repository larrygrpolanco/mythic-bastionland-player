// src/routes/games/the-ground-itself/api/generate-image/+server.js
import { json } from '@sveltejs/kit';
import { generateMockImageUrl } from '../../logic/promptBuilder.js';

export async function POST({ request }) {
	try {
		const { prompt, isDevelopmentMode } = await request.json();

		if (!prompt) {
			return json({ error: 'Prompt is required' }, { status: 400 });
		}

		// In development mode, return mock data
		if (isDevelopmentMode) {
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			const mockImageUrl = generateMockImageUrl(prompt);
			
			return json({
				success: true,
				imageUrl: mockImageUrl,
				prompt: prompt,
				isDevelopmentMode: true
			});
		}

		// Production mode - would call real Gemini API here
		// For now, we'll still return mock data until you're ready for real API calls
		const mockImageUrl = generateMockImageUrl(prompt);
		
		return json({
			success: true,
			imageUrl: mockImageUrl,
			prompt: prompt,
			isDevelopmentMode: false,
			note: 'Production API not yet implemented - using mock data'
		});

		/* 
		// Real Gemini API implementation would go here:
		// import { GoogleGenerativeAI } from '@google/generative-ai';
		// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		// ... actual API call logic
		*/

	} catch (error) {
		console.error('Image generation error:', error);
		return json({ 
			error: 'Failed to generate image',
			details: error.message 
		}, { status: 500 });
	}
}
