/**
 * This state is the FIRST thing that runs when the game starts.
 * Its job is to check whether a previously saved game exists in localStorage.
 *
 * Responsibilities:
 *  - Attempt to load saved game data (score, lives, cat, etc.)
 *  - If a save exists -> restore it and jump directly to PlayState
 *  - If no save exists -> go to the Title screen
 *
 * User never sees this state for long — it transitions immediately.
 *
 * This state is essential for:
 *  - Persistence system (required by rubric)
 *  - Allowing the game to resume after browser refresh or tab closing
 */

import State from '../../lib/State.js';
import GameStateName from '../enums/GameStateName.js';
import {
	stateMachine,
	context,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
} from '../globals.js';

export default class RestoreState extends State {
	/**
	 * @param {GameController} gameController
	 * We store one shared GameController instance to read/write save data.
	 */
	constructor(gameController) {
		super();
		this.gameController = gameController;
	}

	/**
	 * Called IMMEDIATELY when the stateMachine switches to this state.
	 *
	 * This is where we:
	 *  - check localStorage
	 *  - restore data if present
	 *  - route player to correct next state
	 */
	enter() {
		// Attempt to fetch saved game data from localStorage
		const savedData = this.gameController.loadGameState();

		if (savedData) {
			/**
			 * Save exists -> restore values (score/lives/cat/etc.)
			 */
			this.gameController.restoreFromData(savedData);

			// Resume gameplay from saved state
			stateMachine.change(GameStateName.Play);
		} else {
			/**
			 * No save exists -> go to main title screen
			 */
			stateMachine.change(GameStateName.Title);
		}
	}

	/**
 * Very simple loading screen.
 * This is visible only for a tiny fraction of a second,
 * but required for correct visual behavior.
 */
render() {
	// Background
	context.fillStyle = 'black';
	context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	// using custom pixel font loaded from config.json
	// (fonts.FlappyMedium = 32px FlappyBirdy)
	context.fillStyle = 'white';
	context.font = fonts.FlappyMedium; 
	context.textAlign = 'center';

	// Loading text
	context.fillText(
		'Restoring...',
		CANVAS_WIDTH / 2,
		CANVAS_HEIGHT / 2
	);
}

}
