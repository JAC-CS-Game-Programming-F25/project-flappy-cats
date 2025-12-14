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
	fonts,
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
		// Prevent infinite recursion - if we're already restoring, just go to Title
		if (stateMachine.isRestoring) {
			stateMachine.isRestoring = false;
			setTimeout(() => stateMachine.change(GameStateName.Title), 0);
			return;
		}

		// Set flag to prevent saving state transitions during restore
		stateMachine.isRestoring = true;
		
		// Use setTimeout to defer state changes until after enter() completes
		// This prevents infinite recursion
		setTimeout(() => {
			// Attempt to fetch saved game data from localStorage
			const savedData = this.gameController.loadGameState();

			// If no save exists, start on title screen 
			if (!savedData || !savedData.activeState) {
				stateMachine.isRestoring = false; // Clear flag before changing
				stateMachine.change(GameStateName.Title);
				return;
			}

			// Safety check: if saved state is "restore", clear it and go to Title
			// This prevents infinite loops if RestoreState was accidentally saved
			if (savedData.activeState === GameStateName.Restore) {
				this.gameController.clearGameState();
				stateMachine.isRestoring = false; // Clear flag before changing
				stateMachine.change(GameStateName.Title);
				return;
			}

			/**
			 * Save exists -> restore basic values (score/lives/cat/etc.)
			 * Then restore to the saved UI state
			 */
			this.gameController.restoreFromData(savedData);

			// Restore to the saved state
			const savedState = savedData.activeState;
			
			// If saved state is Title, just go to Title (don't restore game data)
			if (savedState === GameStateName.Title) {
				stateMachine.isRestoring = false; // Clear flag before changing
				stateMachine.change(GameStateName.Title);
				return;
			}
			
			// For Play and Pause states, full game state restoration happens in PlayState.enter()
			if (savedState === GameStateName.Play || savedState === GameStateName.Pause) {
				// First restore PlayState (which will restore full game state)
				stateMachine.change(GameStateName.Play);
				
				// If it was paused, freeze player movement and transition to Pause state immediately
				if (savedState === GameStateName.Pause) {
					// Freeze player immediately to prevent falling
					// This must happen before any update() calls
					const playState = stateMachine.states[GameStateName.Play];
					if (playState && playState.player) {
						playState.player.velocity.x = 0;
						playState.player.velocity.y = 0;
					}
					
					// Transition immediately to prevent any update() calls on PlayState
					// The player velocity is already frozen in restoreGameState and here
					stateMachine.isRestoring = false; // Clear flag before changing
					stateMachine.change(GameStateName.Pause);
				} else {
					stateMachine.isRestoring = false; // Clear flag after restore
				}
			} else {
				// For other states (CatSelect, GameOver), just go to that state
				stateMachine.isRestoring = false; // Clear flag before changing
				stateMachine.change(savedState);
			}
		}, 0);
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
