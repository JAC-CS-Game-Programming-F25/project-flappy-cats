import State from '../../lib/State.js';
/**
 * This state appears when the user presses "P" during gameplay.
 *
 * Responsibilities:
 *  - Freeze gameplay updates
 *  - Show a dark overlay indicating paused state
 *  - Wait for the user to press SPACE to resume
 *  - Play a 3 -> 2 -> 1 countdown before resuming gameplay
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
		 *  - null -> waiting for user to press SPACE
		 *  - 3,2,1 -> active countdown
		 */
		this.countdownValue = null;
	}

	/**
	 * Called every frame, but gameplay is frozen here.
	 * Only countdown + input logic happens.
	 */
	update(dt) {
		// If countdown hasn't started yet, wait for player input.
		if (this.countdownValue === null) {
			const userInitiatedResume = input.isKeyPressed(' ');

			if (userInitiatedResume) {
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

			// Stop here: do not update anything else while paused.
			return;
		}

		// Once countdown is active, update() does nothing else.
	}

	/**
	 * Draws a dark overlay + pause message + countdown (if active)
	 */
	render() {
		// Dark overlay for pause effect
		context.fillStyle = 'rgba(0, 0, 0, 0.6)';
		context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		context.textAlign = 'center';
		context.fillStyle = 'white';

		// Pause title
		context.font = fonts.FlappyLarge;
		context.fillText(
			'PAUSED',
			CANVAS_WIDTH / 2,
			CANVAS_HEIGHT / 2 - 60
		);

		// Show resume message (no countdown yet)
		if (this.countdownValue === null) {
			context.font = fonts.FlappySmall;
			context.fillText(
				'Press SPACE to resume',
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2
			);
		}
		// Show countdown number (3, 2, 1)
		else {
			context.font = fonts.FlappyLarge;
			context.fillText(
				String(this.countdownValue),
				CANVAS_WIDTH / 2,
				CANVAS_HEIGHT / 2
			);
		}
	}

}
