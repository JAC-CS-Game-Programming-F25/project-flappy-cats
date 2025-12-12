/**
 * This is the main gameplay loop.
 *
 * Responsibilities:
 *  - Update gameplay elements (later: player, pipes, stars, hearts, powerups)
 *  - Handle pause input
 *  - Handle scoring (temporary until A's entities are integrated)
 *  - Detect game-over and transition to GameOverState
 *  - Draw all HUD elements (score, lives, stars, high score)
 */

import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import {
	input,
	context,
	stateMachine,
	CANVAS_WIDTH,
	fonts,
} from '../globals.js';

export default class PlayState extends State {
	/**
	 * @param {GameController} gameController
	 * Stores a reference to the shared gameController object,
	 * which tracks score, lives, stars, selected cat, and persistence.
	 */
	constructor(gameController) {
		super();

		this.gameController = gameController;
	}

	/**
	 * Called every frame.
	 *
	 * This handles:
	 *  - temporary scoring
	 *  - pause input
	 *  - game-over detection
	 *  - (later) updating player, pipes, collectibles, powerups
	 */
	update(dt) {

		// Temporary scoring mechanism: (WILL BE REMOVED LATER)
		// this.gameController.addScore(dt * 10); // 10 points per second

		/**
		 * Pause behavior:
		 * Pressing P instantly pauses the game.
		 * We also save the game so that a refresh during pause still resumes correctly.
		 */
		const userRequestedPause = input.isKeyPressed('P');

		if (userRequestedPause) {
			this.gameController.saveGameState(GameStateName.Play);
			stateMachine.change(GameStateName.Pause);
			return; // Stop updating gameplay during same frame
		}

		/**
		 * Game Over condition:
		 * If lives reach zero, transition to GameOverState.
		 */
		if (this.gameController.isGameOver()) {
			this.gameController.saveGameState(GameStateName.GameOver);
			stateMachine.change(GameStateName.GameOver);
		}
	}

	/**
	 * Draws the heads-up display (HUD) on screen.
	 * Later, this function will also draw:
	 *  - Player sprite
	 *  - Pipes
	 *  - Stars / Hearts
	 *  - Active power-up icons
	 */
	render() {
		// Left-aligned HUD text
		context.textAlign = 'left';
		context.font = fonts.FlappySmall;
		context.fillStyle = 'black';

		// Score (rounded)
		context.fillText(
			'Score: ' + Math.floor(this.gameController.score),
			10,
			30
		);

		// Lives
		context.fillText(
			'Lives: ' + this.gameController.lives,
			10,
			55
		);

		// Stars
		context.fillText(
			'Stars: ' + this.gameController.stars,
			10,
			80
		);

		// High score (right aligned)
		context.textAlign = 'right';
		context.fillText(
			'High Score: ' + this.gameController.highScore,
			CANVAS_WIDTH - 10,
			30
		);
	}

}
