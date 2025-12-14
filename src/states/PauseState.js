import State from '../../lib/State.js';
/**
 * This state appears when the user presses "P" during gameplay.
 *
 * Responsibilities:
 *  - Freeze gameplay updates
 *  - Show a pause menu box with score and collectables info
 *  - Wait for the user to press P to resume (with countdown)
 *  - Allow restarting the game
 *  - Play a 3 -> 2 -> 1 countdown before resuming gameplay (without box)
 *  - Use Timer.js to schedule countdown events
 *
 * Notes:
 *  - Nothing moves while paused (player, pipes, physics, etc.)
 */


import GameStateName from '../enums/GameStateName.js';
import {
	input,
	context,
	stateMachine,
	timer,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	fonts,
} from '../globals.js';

export default class PauseState extends State {
	/**
	 * @param {GameController} gameController
	 * Stores shared game data.
	 */
	constructor(gameController) {
		super();

		// Shared global controller with score/lives/etc
		this.gameController = gameController;

		/**
		 * countdownValue:
		 *  - null -> showing pause menu box, waiting for user input
		 *  - 3,2,1 -> active countdown (box hidden)
		 */
		this.countdownValue = null;
	}

	/**
	 * Called when entering this state.
	 * Reset countdown to show the pause menu box.
	 */
	enter() {
		this.countdownValue = null; // Reset to show pause menu
	}

	/**
	 * Called every frame, but gameplay is frozen here.
	 * Only countdown + input logic happens.
	 */
	update(dt) {
		// If countdown hasn't started yet, wait for player input.
		if (this.countdownValue === null) {
			// P -> Resume (start countdown)
			if (input.isKeyPressed('P')) {
				// Start countdown
				this.countdownValue = 3;

				/**
				 * timer.addTask(callback, interval, repeatCount, onComplete)
				 *
				 * We use the Timer system to:
				 *  - run callback once per second
				 *  - decrease countdownValue
				 *  - automatically resume game when complete
				 */
				timer.addTask(
					() => {
						this.countdownValue--;
					},
					1, // run every 1 second
					3, // run a total of 3 times (3 -> 2 -> 1)
					() => {
						// When countdown reaches 0, return to gameplay
						stateMachine.change(GameStateName.Play);
					}
				);
			}

			// R -> Restart game
			if (input.isKeyPressed('R')) {
				// Reset game state and restart
				this.gameController.resetAndCreateNewSession();
				// Reset the game started flag so PlayState will reinitialize
				const playState = stateMachine.states[GameStateName.Play];
				if (playState) {
					playState.isGameStarted = false;
				}
				stateMachine.change(GameStateName.Play);
			}

			// Stop here: do not update anything else while paused.
			return;
		}

		// Once countdown is active, update() does nothing else.
	}

	/**
	 * Draws the pause menu box with game info, or countdown if active
	 */
	render() {
		// First, render the game state in the background so it's visible
		// Get the PlayState from the state machine and render it
		const playState = stateMachine.states[GameStateName.Play];
		if (playState) {
			playState.render();
		}

		// Dark overlay for pause effect (lighter so game is still visible)
		context.fillStyle = 'rgba(0, 0, 0, 0.3)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		// If countdown is active, only show countdown (no box)
		if (this.countdownValue !== null) {
			context.textAlign = 'center';
			context.fillStyle = 'white';
			context.font = fonts.FlappyLarge;
			context.fillText(
				String(this.countdownValue),
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2
			);
			return;
		}

		// Draw pause menu box
		const boxWidth = 300;
		const boxHeight = 250;
		const boxX = (CANVAS_WIDTH - boxWidth) / 2;
		const boxY = (CANVAS_HEIGHT - boxHeight) / 2;

		// Box background
		context.fillStyle = 'rgba(40, 40, 40, 0.95)';
		context.fillRect(boxX, boxY, boxWidth, boxHeight);

		// Box border
		context.strokeStyle = 'white';
		context.lineWidth = 3;
		context.strokeRect(boxX, boxY, boxWidth, boxHeight);

		// Text styling
		context.textAlign = 'center';
		context.fillStyle = 'white';

		// Title
		context.font = fonts.FlappyLarge;
		context.fillText('PAUSED', CANVAS_WIDTH / 2, boxY + 40);

		// Game info
		context.font = fonts.FlappySmall;
		const infoY = boxY + 80;
		const lineHeight = 25;

		// Score
		context.fillText(
			`Score: ${this.gameController.score}`,
			CANVAS_WIDTH / 2,
			infoY
		);

		// Stars (from player if available)
		const stars = this.gameController.player?.stars || 0;
		context.fillText(
			`Stars: ${stars}`,
			CANVAS_WIDTH / 2,
			infoY + lineHeight
		);

		// Lives/Health
		context.fillText(
			`Lives: ${this.gameController.lives}`,
			CANVAS_WIDTH / 2,
			infoY + lineHeight * 2
		);

		// Instructions
		context.fillText(
			'Press P to resume',
			CANVAS_WIDTH / 2,
			infoY + lineHeight * 3 + 10
		);
		context.fillText(
			'Press R to restart',
			CANVAS_WIDTH / 2,
			infoY + lineHeight * 4 + 10
		);
	}

}
