import Sprite from '../lib/Sprite.js';

// Small sprite configurations (16x16 or 16x32 sprites)
export const smallSpriteConfig = {
	// Sparkles/Stars - typically small sparkle effects
	sparkles: [
		{ x: 0, y: 0, width: 16, height: 16 },
		{ x: 16, y: 0, width: 16, height: 16 },
		{ x: 32, y: 0, width: 16, height: 16 },
	],
	// Grow/Mushroom - power-up items
	grow: [
		{ x: 596, y: 258, width: 16, height: 32 },
	],
	// Dust particles
	dust: [
		{ x: 0, y: 0, width: 16, height: 16 },
	],
};

// Enemy sprite configurations
export const enemySpriteConfig = {
	goomba: [
		{ x: 0, y: 0, width: 16, height: 16 },
		{ x: 16, y: 0, width: 16, height: 16 },
	],
};

// Object sprite configurations
export const objectSpriteConfig = {
	block: [
		{ x: 0, y: 0, width: 16, height: 16 },
	],
};

// Player sprite configurations
// Mario sprite sheet is 1004x3618, typically organized in rows
// These are placeholder coordinates - adjust based on actual sprite sheet layout
const playerSpriteFrames = {
	idle: [
		{ x: 0, y: 0, width: 16, height: 32 },
		{ x: 16, y: 0, width: 16, height: 32 },
	],
	jump: [
		{ x: 32, y: 0, width: 16, height: 32 },
	],
	death: [
		{ x: 48, y: 0, width: 16, height: 32 },
	],
	fall: [
		{ x: 64, y: 0, width: 16, height: 32 },
	],
};

/**
 * Loads player sprites from a sprite sheet
 * @param {Graphic} spriteSheet - The sprite sheet graphic
 * @param {Object} config - The sprite configuration (smallSpriteConfig)
 * @returns {Object} Object containing arrays of Sprites for each animation
 */
export function loadPlayerSprites(spriteSheet, config) {
	const sprites = {};
	
	// Convert frame definitions to Sprite objects
	Object.keys(playerSpriteFrames).forEach(key => {
		sprites[key] = playerSpriteFrames[key].map(frame => 
			new Sprite(
				spriteSheet,
				frame.x,
				frame.y,
				frame.width,
				frame.height
			)
		);
	});
	
	return sprites;
}
