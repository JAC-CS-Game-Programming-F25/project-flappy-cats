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
	 * - Ensures score is properly restored if coming from a saved state
	 * - Does NOT clear game state - score should persist until user chooses to restart
	 */
	enter() {
		// If we're restoring from a saved state, make sure score and stars are loaded
		const savedData = this.gameController.loadGameState();
		if (savedData) {
			if (savedData.score !== undefined) {
				this.gameController.score = savedData.score || 0;
			}
			if (savedData.stars !== undefined) {
				this.gameController.stars = savedData.stars || 0;
			}
		}
		
		// DO NOT clear game state here - we want to preserve the score and stars
		// so they display correctly when the user reloads the page
		// Game state will be cleared when user chooses to restart or select a new cat
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
			// Clear saved game state before restarting
			this.gameController.clearGameState();
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
			// Clear saved game state before going to cat selection
			this.gameController.clearGameState();
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
		context.font = fonts.FlappyMedium; 
		context.fillText(
			'Here is your stats:',
			CANVAS_WIDTH / 2,
			boxY + 75
		);

		// Stats section
		const statsY = boxY + 110;
		const lineHeight = 30;

		// Helper function to render label + number with different fonts
		// Labels on the left, numbers on the right (at the corners of the box)
		const renderStat = (label, value, y) => {
			const padding = 20; // Padding from box edges
			
			// Render label on the left with FlappyBirdy font (smaller)
			context.textAlign = 'left';
			context.font = fonts.FlappyMedium; // Changed from FlappyLarge to FlappyMedium
			const labelText = label + ': ';
			context.fillText(labelText, boxX + padding, y);
			
			// Render number on the right with Arial font (smaller)
			context.textAlign = 'right';
			context.font = '24px Arial'; // Changed from 32px to 24px
			const numberText = String(value);
			context.fillText(numberText, boxX + boxWidth - padding, y);
		};

		// Current Score (ensure it's a valid number)
		const currentScore = Number(this.gameController.score) || 0;
		renderStat('Current Score', Math.floor(currentScore), statsY);

		// High Score
		renderStat('High Score', this.gameController.highScore, statsY + lineHeight);

		// Stars collected (from GameController, which persists across reloads)
		// Ensure it's a number, not an array or object
		const stars = Number(this.gameController.stars) || 0;
		renderStat('Stars Collected', stars, statsY + lineHeight * 2);

		// Options section (shifted more to the right)
		const optionsY = statsY + lineHeight * 3 + 20;
		const boxCenterX = boxX + boxWidth / 2; // Center of the box, not the canvas
		const rightOffset = 80; // Shift even more to the right
		
		context.font = fonts.FlappyMedium;
		context.fillText(
			'Press ENTER to Restart',
			boxCenterX + rightOffset, // Shifted more to the right
			optionsY
		);

		context.fillText(
			'Press C to Choose Cat',
			boxCenterX + rightOffset, // Shifted more to the right
			optionsY + 30
		);
	}
}
