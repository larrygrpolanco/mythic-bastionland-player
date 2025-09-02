// Simple image service for fetching placeholder images
// Using Lorem Picsum for simplicity (no API key required)

export class ImageService {
    constructor() {
        this.currentImage = null;
        this.imageHistory = [];
    }

	// Get a random landscape-oriented image from a curated list
	async getRandomImage(width = 800, height = 600) {
		try {
			// Use a curated list of reliable Unsplash images
			const landscapeImages = [
				'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop', // Mountain
				'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop', // Forest
				'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop', // Beach
				'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&h=600&fit=crop', // Desert
				'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop', // Waterfall
				'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop', // Lake
				'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&h=600&fit=crop', // Rocks
				'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', // Forest path
				'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop', // Mountains
				'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=600&fit=crop'  // Valley
			];
			
			const randomIndex = Math.floor(Math.random() * landscapeImages.length);
			const imageUrl = landscapeImages[randomIndex];
			
			// Preload the image to ensure it loads properly
			await this.preloadImage(imageUrl);
			
			const imageData = {
				url: imageUrl,
				id: `img-${Date.now()}-${randomIndex}`,
				timestamp: new Date()
			};
			
			this.imageHistory.push(imageData);
			this.currentImage = imageData;
			
			return imageData;
		} catch (error) {
			console.error('Error fetching image:', error);
			// Fallback to a default placeholder
			return this.getFallbackImage();
		}
	}

    // Preload an image to check if it exists and is accessible
    async preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error('Image failed to load'));
            img.src = url;
        });
    }

    // Fallback image in case of API failure
    getFallbackImage() {
        const fallbackImages = [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop', // Mountain
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop', // Forest
            'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop'  // Beach
        ];
        
        const randomIndex = Math.floor(Math.random() * fallbackImages.length);
        const imageData = {
            url: fallbackImages[randomIndex],
            id: `fallback-${randomIndex}`,
            timestamp: new Date()
        };
        
        this.imageHistory.push(imageData);
        this.currentImage = imageData;
        
        return imageData;
    }

    // Get the current image
    getCurrentImage() {
        return this.currentImage;
    }

    // Get image history
    getImageHistory() {
        return this.imageHistory;
    }

    // Clear image history
    clearHistory() {
        this.imageHistory = [];
        this.currentImage = null;
    }
}

// Create a singleton instance
export const imageService = new ImageService();
