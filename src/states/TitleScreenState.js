/**
 * This is the first screen the player sees when launching the game
 *
 *  - Display game name
 *  - Display high score (if any)
 *  - Listen for SPACE or ENTER to begin
 *  - Navigate to CatSelectState
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

export default class TitleScreenState extends State {
	/**
	 * @param {GameController} gameController
	 * We pass one common gameController instance into this state.
	 * This allows the TitleScreenState to read things such as high score.
	 */
	constructor(gameController) {
		super();
		this.gameController = gameController;
	}

	/**
	 * update(dt) — runs every frame
	 * Here we listen to keyboard input and react.
	 */
	update(dt) {
		/**
		 * input.isKeyPressed():
		 * used to detect a SINGLE press in that frame.
		 *
		 * We check both SPACE and ENTER because either begins the game.
		 */
		const userPressedStart =
			input.isKeyPressed(' ') || input.isKeyPressed('ENTER');

		if (userPressedStart) {
			/**
			 * Change to cat select screen.
			 * We do not reset score or lives here because CatSelectState
			 * will create a new run.
			 */
			stateMachine.change(GameStateName.CatSelect);
		}
	}

	/**
	 * render() — draws UI
	 * Called every frame after update() to visually show content.
	 */
	render() {
		// Center alignment is ideal for menu screens
		context.textAlign = 'center';

		// Draw Title
		context.font = '32px Arial';
		context.fillStyle = 'black';
		context.fillText('Flappy Cats', CANVAS_WIDTH / 2, 150);

		// Draw user prompt
		context.font = '18px Arial';
		context.fillText(
			'Press SPACE or ENTER to start',
			CANVAS_WIDTH / 2,
			220
		);

		// Draw high score
		context.font = '16px Arial';
		context.fillText(
			'High Score: ' + this.gameController.highScore,
			CANVAS_WIDTH / 2,
			260
        );
	}
}
