/**
 * This screen allows the player to choose which cat they want to play with.
 * Each cat represents a different difficulty:
 * - lighter cats go up faster
 * - heavier cats fall faster
 * - bigger cats have larger hitboxes (harder)
 * - smaller cats are easier to navigate through pipes
 * 
 *  - Show list of selectable cats
 *  - Allow user to change selection with arrow keys
 *  - Confirms choice using SPACE or ENTER
 *  - Set selected cat in GameController
 *  - Start a new run once chosen
 */

import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import {
	context,
	images,
	input,
	stateMachine,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
} from '../globals.js';
import Sprite from '../../lib/Sprite.js';
import ImageName from '../enums/ImageName.js';

export default class CatSelectState extends State {
	constructor(gameController) {
		super();

		this.gameController = gameController;

		this.selectedIndex = 0;

		this.backgroundSprite = null;

		this.cats = [];
	}

	enter() {
		const spriteSheet = images.get('spritesheet');
		const lightAndSmallCatSheet = images.get('lightAndSmallCat');

		if (!spriteSheet || !lightAndSmallCatSheet) return;

		// Use the sky background image
		this.backgroundSprite = images.get(ImageName.BackgroundSky);

		// Sprites
		const heavyCatSprite = new Sprite(spriteSheet, 4208, 46, 320, 443);
		const bigCatSprite = new Sprite(spriteSheet, 4625, 17, 406, 478);

		// White cat = Light Cat
		const lightCatSprite = new Sprite(lightAndSmallCatSheet, 560, 64, 276, 422);

		// Orange cat = Small Cat
		const smallCatSprite = new Sprite(lightAndSmallCatSheet, 66, 29, 337, 442);

		// Shared scale so cats look visually equal
		const baseScale = 0.32;

		this.cats = [
			{
				name: 'Heavy Cat',
				description: 'Falls faster, harder to keep up but more stable',
				sprite: heavyCatSprite,
				scale: baseScale,
			},
			{
				name: 'Light Cat',
				description: 'Rises faster, easier to float but harder to control',
				sprite: lightCatSprite,
				scale: baseScale,
			},
			{
				name: 'Big Cat',
				description: 'Larger hitbox makes the game more challenging',
				sprite: bigCatSprite,
				scale: baseScale,
			},
			{
				// Bottom-right, intentionally smaller
				name: 'Small Cat',
				description: 'Smaller hitbox, slightly easier to fit through gaps',
				sprite: smallCatSprite,
				scale: 0.25,
			},
		];
	}


	update(dt) {
		if (this.cats.length === 0) return;

		if (input.isKeyPressed('ARROWLEFT')) {
			this.selectedIndex =
				(this.selectedIndex + this.cats.length - 1) % this.cats.length;
		}

		if (input.isKeyPressed('ARROWRIGHT')) {
			this.selectedIndex = (this.selectedIndex + 1) % this.cats.length;
		}

		if (input.isKeyPressed('ARROWUP')) {
			this.selectedIndex =
				(this.selectedIndex + this.cats.length - 2) % this.cats.length;
		}

		if (input.isKeyPressed('ARROWDOWN')) {
			this.selectedIndex = (this.selectedIndex + 2) % this.cats.length;
		}

		const confirmed = input.isKeyPressed(' ') || input.isKeyPressed('ENTER');

		if (confirmed) {
			this.gameController.setSelectedCat(this.selectedIndex); // Set selected cat first
			this.gameController.resetAndCreateNewSession(); // Reset game state (but preserve selectedCatIndex)
			// Reset the game started flag so PlayState will reinitialize
			const playState = stateMachine.states[GameStateName.Play];
			if (playState) {
				playState.isGameStarted = false;
			}
			stateMachine.change(GameStateName.Play);
		}
	}

	render() {
		if (!this.backgroundSprite || this.cats.length === 0) return;

		this.renderBackground();
		this.renderTitle();
		this.renderCats();
		this.renderSelectedName();
	}

	renderBackground() {
		if (!this.backgroundSprite) return;

		// Scale background to fill entire screen (no tiling to avoid seams)
		const scale = Math.max(
			CANVAS_WIDTH / this.backgroundSprite.width,
			CANVAS_HEIGHT / this.backgroundSprite.height
		);

		const bgDrawWidth = this.backgroundSprite.width * scale;
		const bgDrawHeight = this.backgroundSprite.height * scale;

		const bgX = (CANVAS_WIDTH - bgDrawWidth) / 2;
		const bgY = (CANVAS_HEIGHT - bgDrawHeight) / 2;

		// Graphic.render takes (x, y, width, height) - not a scale object
		this.backgroundSprite.render(bgX, bgY, bgDrawWidth, bgDrawHeight);
	}

	renderTitle() {
		context.textAlign = 'center';
		context.fillStyle = 'black';
		context.font = '72px FlappyBirdy';

		context.fillText('Select Cat', CANVAS_WIDTH / 2, 70);
	}

	renderCats() {
		const positions = this.getCatPositions();

		for (let i = 0; i < this.cats.length; i++) {
			const cat = this.cats[i];
			const pos = positions[i];

			const width = cat.sprite.width * cat.scale;
			const height = cat.sprite.height * cat.scale;

			const x = pos.x - width / 2;
			const y = pos.y - height / 2;

			// If this is the selected cat, render with glow effect
			if (i === this.selectedIndex) {
				this.renderCatWithGlow(cat, x, y);
			} else {
				// Render normally without glow
				cat.sprite.render(x, y, { x: cat.scale, y: cat.scale });
			}
		}
	}

	renderSelectedName() {
		context.textAlign = 'center';
		context.fillStyle = 'black';
		
		const selectedCat = this.cats[this.selectedIndex];
		if (!selectedCat) return;

		// Calculate the bottom position of the lowest cat to position text below it
		const positions = this.getCatPositions();
		let maxCatBottom = 0;
		for (let i = 0; i < this.cats.length; i++) {
			const cat = this.cats[i];
			const pos = positions[i];
			const height = cat.sprite.height * cat.scale;
			const catBottom = pos.y + height / 2;
			if (catBottom > maxCatBottom) {
				maxCatBottom = catBottom;
			}
		}

		// Position text well below the cats with some padding
		const textStartY = maxCatBottom + 60;

		// Render cat name with Arial font (larger and bold)
		context.font = 'bold 32px Arial';
		context.fillText(
			selectedCat.name,
			CANVAS_WIDTH / 2,
			textStartY
		);

		// Render cat characteristics/abilities with Arial font
		context.font = '20px Arial';
		context.fillText(
			selectedCat.description,
			CANVAS_WIDTH / 2,
			textStartY + 35
		);
	}

	/**
	 * Renders a cat with a glowing selection effect around it.
	 * Uses multiple shadow layers to create a purple glow that follows the cat's shape.
	 */
	renderCatWithGlow(cat, x, y) {
		context.save();

		// Create a pulsing glow effect
		const time = Date.now() / 500; 
		const glowIntensity = 0.7 + Math.sin(time) * 0.3; 
		
		// First pass: Outer glow 
		context.shadowColor = `rgba(200, 100, 255, ${0.6 * glowIntensity})`; // Light purple
		context.shadowBlur = 60; // Larger blur for more visibility
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		
		// Render the cat with outer glow
		cat.sprite.render(x, y, { x: cat.scale, y: cat.scale });
		
		// Middle glow (medium size, vibrant purple)
		context.shadowColor = `rgba(180, 80, 255, ${0.7 * glowIntensity})`; // Brighter purple
		context.shadowBlur = 40;
		cat.sprite.render(x, y, { x: cat.scale, y: cat.scale });
		
		// Inner glow (smaller, intense purple)
		context.shadowColor = `rgba(160, 60, 255, ${0.8 * glowIntensity})`; // Very bright purple
		context.shadowBlur = 25;
		cat.sprite.render(x, y, { x: cat.scale, y: cat.scale });
		
		// Core glow (brightest, most intense)
		context.shadowColor = `rgba(140, 40, 255, ${0.9 * glowIntensity})`; // Deep purple
		context.shadowBlur = 15;
		cat.sprite.render(x, y, { x: cat.scale, y: cat.scale });
		
		// Render the cat normally on top (no shadow)
		context.shadowColor = 'transparent';
		context.shadowBlur = 0;
		cat.sprite.render(x, y, { x: cat.scale, y: cat.scale });
		
		context.restore();
	}

	getCatPositions() {
		const centerX = CANVAS_WIDTH / 2;
		// Move cats up a bit to avoid overlap with title and text
		const centerY = CANVAS_HEIGHT / 2 - 20;

		const columnOffset = 170;
		const rowOffset = 120; // Reduced to bring cats closer together vertically

		return [
			{ x: centerX - columnOffset, y: centerY - rowOffset },
			{ x: centerX + columnOffset, y: centerY - rowOffset },
			{ x: centerX - columnOffset, y: centerY + rowOffset },
			{ x: centerX + columnOffset, y: centerY + rowOffset },
		];
	}
}
