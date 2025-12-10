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
	input,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	stateMachine,
} from '../globals.js';

/**
 * List of available cats.
 */
const CAT_OPTIONS = ['Light Cat', 'Heavy Cat', 'Big Cat', 'Small Cat'];

export default class CatSelectState extends State {
	/**
	 * @param {GameController} gameController
	 *
	 * We receive one shared GameController instance, and we store:
	 *  - current selected index
	 *  - access to saving chosen cat
	 */
	constructor(gameController) {
		super();

		this.gameController = gameController;

		// Which cat is currently highlighted
		this.selectedIndex = 0;
	}

	/**
	 * update(dt)
	 * Handles input and navigation logic
	 */
	update(dt) {
		/**
		 * Move selection left:
		 * If index = 0 and player presses ←
		 * new index becomes 3 (wrap around)
		 *
		 * The formula "(x + length - 1) % length" wraps backwards.
		 */
		if (input.isKeyPressed('ARROWLEFT')) {
			this.selectedIndex = (this.selectedIndex + CAT_OPTIONS.length - 1) % CAT_OPTIONS.length;
		}

		/**
		 * Move selection right:
		 * If index = 3 and player presses →
		 * new index becomes 0
		 */
		if (input.isKeyPressed('ARROWRIGHT')) {
			this.selectedIndex = (this.selectedIndex + 1) % CAT_OPTIONS.length;
		}

		/**
		 * Confirm the selection:
		 * SPACE or ENTER chooses the current cat
		 */
		const userConfirmed =
			input.isKeyPressed(' ') || input.isKeyPressed('ENTER');

		if (userConfirmed) {
			// Save chosen cat
			this.gameController.setSelectedCat(this.selectedIndex);

			// Reset score/lives/etc so a new session truly begins
			this.gameController.resetAndCreateNewSession();

			// Move to PlayState
			stateMachine.change(GameStateName.Play);
		}
	}

	/**
	 * render()
	 * Draws the UI for choosing a cat, now using the FlappyBirdy pixel font.
	 */
	render() {
		context.textAlign = 'center';
		context.fillStyle = 'black';

		// Title text (big + bold)
		
		context.font = fonts.FlappyLarge; 
		context.fillText('Choose Your Cat', CANVAS_WIDTH / 2, 120);

		// Selected cat name (medium emphasis)
		context.font = fonts.FlappyMedium;
		context.fillText(
			CAT_OPTIONS[this.selectedIndex],
			CANVAS_WIDTH / 2,
			200
		);

		// Instruction text (small)
		context.font = fonts.FlappySmall;
		context.fillText(
			'Use ← and → arrows. Press SPACE to confirm.',
			CANVAS_WIDTH / 2,
			260
		);
	}

}
