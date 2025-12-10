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
		if (this.gameController.updateHighScore) {
			// this.gameController.updateHighScore();
		}

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
			if (this.gameController.startNewRun) {
				this.gameController.startNewRun();
			}
			stateMachine.change(GameStateName.Play);
		}

		// C -> Back to cat selection
		if (input.isKeyPressed('C')) {
			if (this.gameController.resetAndCreateNewSession) {
				this.gameController.resetAndCreateNewSession();
			}
			stateMachine.change(GameStateName.CatSelect);
		}
	}

	/**
	 * Draws the entire Game Over UI:
	 *  - Dark overlay background
	 *  - Large "GAME OVER" title
	 *  - Final score + high score
	 *  - Options for retrying or returning to menu
	 */
	render() {
		// Dark overlay
		context.fillStyle = 'rgba(0, 0, 0, 0.7)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		context.textAlign = 'center';
		context.fillStyle = 'white';

		// Game Over title
		context.font = fonts.FlappyLarge;
		context.fillText(
			'GAME OVER',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT / 2 - 80
		);

		// Score + High Score
		context.font = fonts.FlappyMedium;
		context.fillText(
			'Score: ' + Math.floor(this.gameController.score),
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT / 2 - 30
		);

		// HIGH SCORE
		context.fillText(
			'High Score: ' + this.gameController.highScore,
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT / 2
		);

		// Options (Retry or Return to Menu)
		context.font = fonts.FlappySmall;
		context.fillText(
			'Press ENTER to Retry',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT / 2 + 50
		);

		context.fillText(
			'Press C to Choose Cat (Main Menu)',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT / 2 + 80
		);
	}
}
