/**
 * This state is shown when the player loses all their lives.
 * 
 * Responsibilities:
 *  - Display the "Game Over" UI with score + high score
 *  - Allow the player to restart the game (ENTER)
 *  - Allow the player to return to the cat selection menu (C)
 *  - Update and save the high score if needed
 *  - Clear saved persistent game data so that the next run
 *    always starts clean (not from RestoreState)
 */

import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import {
	context,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	input,
	stateMachine,
	fonts,
} from '../globals.js';

export default class GameOverState extends State {
	constructor(gameController) {
		super();
		this.gameController = gameController;
	}

	/**
	 * Called when entering the Game Over screen.
	 * - Updates high score if the player reached a new record
	 * - Clears persistent game data in localStorage
	 */
	enter() {
		// Clear saved game state so next run starts fresh
		if (this.gameController.clearGameState) {
			this.gameController.clearGameState();
		}
	}

	/**
	 * update()
	 * Handles player inputs:
	 * - ENTER -> Restart the game immediately
	 * - C -> Return to CatSelectState
	 */
	update(dt) {
		// ENTER -> Retry with same cat
		if (input.isKeyPressed('ENTER')) {
			// Reset game state and restart
			this.gameController.resetAndCreateNewSession();
			// Reset the game started flag so PlayState will reinitialize
			const playState = stateMachine.states[GameStateName.Play];
			if (playState) {
				playState.isGameStarted = false;
			}
			stateMachine.change(GameStateName.Play);
		}

		// C -> Back to cat selection
		if (input.isKeyPressed('C')) {
			// Reset game state
			this.gameController.resetAndCreateNewSession();
			stateMachine.change(GameStateName.CatSelect);
		}
	}

	/**
	 * Draws the entire Game Over UI:
	 *  - Game screen in background
	 *  - Dark overlay
	 *  - Game Over box with stats
	 *  - Options for retrying or returning to menu
	 */
	render() {
		// First, render the game state in the background so it's visible
		const playState = stateMachine.states[GameStateName.Play];
		if (playState) {
			playState.render();
		}

		// Dark overlay
		context.fillStyle = 'rgba(0, 0, 0, 0.6)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// Draw game over box
		const boxWidth = 350;
		const boxHeight = 310; // Increased height to fit stars
		const boxX = (CANVAS_WIDTH - boxWidth) / 2;
		const boxY = (CANVAS_HEIGHT - boxHeight) / 2;

		// Box background
		context.fillStyle = 'rgba(40, 40, 40, 0.95)';
		context.fillRect(boxX, boxY, boxWidth, boxHeight);

		// Box border
		context.strokeStyle = 'white';
		context.lineWidth = 3;
		context.strokeRect(boxX, boxY, boxWidth, boxHeight);

		context.textAlign = 'center';
		context.fillStyle = 'white';

		// Game Over title
		context.font = fonts.FlappyLarge;
		context.fillText(
			'GAME OVER!',
			CANVAS_WIDTH / 2,
			boxY + 40
		);

		// "Here is your stats:" text
		context.font = fonts.FlappySmall;
		context.fillText(
			'Here is your stats:',
			CANVAS_WIDTH / 2,
			boxY + 75
		);

		// Stats section
		const statsY = boxY + 110;
		const lineHeight = 30;

		// Current Score
		context.font = fonts.FlappyMedium;
		context.fillText(
			`Current Score: ${Math.floor(this.gameController.score)}`,
			CANVAS_WIDTH / 2,
			statsY
		);

		// High Score
		context.fillText(
			`High Score: ${this.gameController.highScore}`,
			CANVAS_WIDTH / 2,
			statsY + lineHeight
		);

		// Stars collected (from player if available)
		const stars = this.gameController.player?.stars || 0;
		context.fillText(
			`Stars Collected: ${stars}`,
			CANVAS_WIDTH / 2,
			statsY + lineHeight * 2
		);

		// Options section
		const optionsY = statsY + lineHeight * 3 + 20;
		context.font = fonts.FlappySmall;
		context.fillText(
			'Press ENTER to Restart',
			CANVAS_WIDTH / 2,
			optionsY
		);

		context.fillText(
			'Press C to Choose Cat',
			CANVAS_WIDTH / 2,
			optionsY + 25
		);
	}
}
