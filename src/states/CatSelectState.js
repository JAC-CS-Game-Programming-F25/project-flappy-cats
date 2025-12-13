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

		// Cloud background
		this.backgroundSprite = new Sprite(spriteSheet, 2898, -12, 584, 357);

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
				sprite: heavyCatSprite,
				scale: baseScale,
			},
			{
				name: 'Light Cat',
				sprite: lightCatSprite,
				scale: baseScale,
			},
			{
				name: 'Big Cat',
				sprite: bigCatSprite,
				scale: baseScale,
			},
			{
				// Bottom-right, intentionally smaller
				name: 'Small Cat',
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
		const scale = Math.max(
			CANVAS_WIDTH / this.backgroundSprite.width,
			CANVAS_HEIGHT / this.backgroundSprite.height
		);

		const drawWidth = this.backgroundSprite.width * scale + 2;
		const drawHeight = this.backgroundSprite.height * scale + 2;

		const x = (CANVAS_WIDTH - drawWidth) / 2;
		const y = (CANVAS_HEIGHT - drawHeight) / 2;

		this.backgroundSprite.render(x, y, { x: scale, y: scale });
	}

	renderTitle() {
		context.textAlign = 'center';
		context.fillStyle = 'black';
		context.font = '48px FlappyBirdy';

		context.fillText('Select Cat', CANVAS_WIDTH / 2, 90);
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

			cat.sprite.render(x, y, { x: cat.scale, y: cat.scale });

			if (i === this.selectedIndex) {
				this.drawSelectionBox(x, y, width, height);
			}
		}
	}

	renderSelectedName() {
		context.textAlign = 'center';
		context.fillStyle = 'black';
		context.font = '28px FlappyBirdy';

		context.fillText(
			this.cats[this.selectedIndex]?.name ?? '',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT - 60
		);
	}

	drawSelectionBox(x, y, width, height) {
		context.save();
		context.strokeStyle = '#FFD34D';
		context.lineWidth = 5;
		context.strokeRect(x - 10, y - 10, width + 20, height + 20);
		context.restore();
	}

	getCatPositions() {
		const centerX = CANVAS_WIDTH / 2;
		const centerY = CANVAS_HEIGHT / 2 + 40;

		const columnOffset = 170;
		const rowOffset = 140;

		return [
			{ x: centerX - columnOffset, y: centerY - rowOffset },
			{ x: centerX + columnOffset, y: centerY - rowOffset },
			{ x: centerX - columnOffset, y: centerY + rowOffset },
			{ x: centerX + columnOffset, y: centerY + rowOffset },
		];
	}
}
