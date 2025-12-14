/**
 * First screen shown when the game starts.
 * Draws:
 * - Full-screen cloud background
 * - "Flappy Cat" title 
 * - START button
 *
 * Starts the game with:
 * - SPACE / ENTER
 * - clicking the START button
 */

import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import {
	canvas,
	context,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	images,
	input,
	stateMachine,
} from '../globals.js';
import Sprite from '../../lib/Sprite.js';
import ImageName from '../enums/ImageName.js';

export default class TitleScreenState extends State {
	constructor() {
		super();

		this.backgroundSprite = null;
		this.titleSprite = null;
		this.startButtonSprite = null;

		this.startButtonScale = { x: 0.4, y: 0.4 };

		this.handleCanvasClick = this.handleCanvasClick.bind(this);
	}

	enter() {
		canvas.addEventListener('click', this.handleCanvasClick);

		const spriteSheet = images.get('spritesheet');
		if (!spriteSheet) return;

		// Background - use the sky background image
		this.backgroundSprite = images.get(ImageName.BackgroundSky);

		// Title
		this.titleSprite = new Sprite(spriteSheet, 3499, 28, 640, 179);

		// START button
		this.startButtonSprite = new Sprite(spriteSheet, 193, 14, 706, 348);
	}

	exit() {
		canvas.removeEventListener('click', this.handleCanvasClick);
	}

	update(dt) {
		if (!this.startButtonSprite) return;

		if (input.isKeyPressed(' ') || input.isKeyPressed('ENTER')) {
			stateMachine.change(GameStateName.CatSelect);
		}
	}

	render() {
	// If sprites are not ready yet, draw nothing
	if (!this.backgroundSprite || !this.titleSprite || !this.startButtonSprite) {
		return;
	}

	// Clear previous frame so no old color shows behind transparent pixels
	context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

	// Title centered near the top
	const titleX = (CANVAS_WIDTH - this.titleSprite.width) / 2;
	const titleY = 60;
	this.titleSprite.render(titleX, titleY);

	// START button centered near the bottom
	const startRect = this.getStartButtonRect();
	this.startButtonSprite.render(
		startRect.x,
		startRect.y,
		this.startButtonScale
	);
}



	getStartButtonRect() {
		const width = this.startButtonSprite.width * this.startButtonScale.x;
		const height = this.startButtonSprite.height * this.startButtonScale.y;

		return {
			x: (CANVAS_WIDTH - width) / 2,
			y: CANVAS_HEIGHT - 220,
			width,
			height,
		};
	}

	handleCanvasClick(event) {
		if (!this.startButtonSprite) return;

		const rect = canvas.getBoundingClientRect();
		const scaleX = CANVAS_WIDTH / rect.width;
		const scaleY = CANVAS_HEIGHT / rect.height;

		const mouseX = (event.clientX - rect.left) * scaleX;
		const mouseY = (event.clientY - rect.top) * scaleY;

		const startRect = this.getStartButtonRect();

		const clickedInside =
			mouseX >= startRect.x &&
			mouseX <= startRect.x + startRect.width &&
			mouseY >= startRect.y &&
			mouseY <= startRect.y + startRect.height;

		if (clickedInside) {
			stateMachine.change(GameStateName.CatSelect);
		}
	}
}
