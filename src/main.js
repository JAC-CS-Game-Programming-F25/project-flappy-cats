/**
 * Flappy Cats
 *
 * Alaa Kirdi
 * Antonina Kosyakova
 *
 * Brief description
 *
 * Asset sources
 */

import GameStateName from './enums/GameStateName.js';
import GameController from './GameController.js'; // Handles score, lives, selected cat, persistence
import Game from '../lib/Game.js';
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	fonts,
	images,
	timer,
	sounds,
	stateMachine,
} from './globals.js';
import PlayState from './states/PlayState.js';
import GameOverState from './states/GameOverState.js';
import TitleScreenState from './states/TitleScreenState.js';
import CatSelectState from './states/CatSelectState.js';
import PauseState from './states/PauseState.js';
import RestoreState from './states/RestoreState.js';

// One shared GameController for the whole game.
// All states will receive this so they can read/update score, lives, selected cat, etc.
const gameController = new GameController();

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute('tabindex', '1'); // Allows the canvas to receive user input.

// Now that the canvas element has been prepared, we can add it to the DOM.
document.body.appendChild(canvas);

// Fetch the asset definitions from config.json.
const {
	images: imageDefinitions,
	fonts: fontDefinitions,
	sounds: soundDefinitions,
} = await fetch('./src/config.json').then((response) => response.json());

// Load all the assets from their definitions.
images.load(imageDefinitions);
fonts.load(fontDefinitions);
sounds.load(soundDefinitions);

// Add all the states to the state machine.
// We inject the same GameController instance into each state
// so they all share score, lives, selected cat, persistence, etc.
stateMachine.add(GameStateName.Restore, new RestoreState(gameController));       // First state: try to load saved run
stateMachine.add(GameStateName.Title, new TitleScreenState(gameController));     // Title screen
stateMachine.add(GameStateName.CatSelect, new CatSelectState(gameController));   // Cat selection screen
stateMachine.add(GameStateName.Play, new PlayState(gameController));             // Main gameplay
stateMachine.add(GameStateName.Pause, new PauseState(gameController));           // Pause + countdown
stateMachine.add(GameStateName.GameOver, new GameOverState(gameController));     // Game over screen

// Start in the Restore state.
// If a save exists, RestoreState will jump to PlayState.
// If not, it will go to TitleState.
stateMachine.change(GameStateName.Title);



const game = new Game(
	stateMachine,
	context,
	timer,
	canvas.width,
	canvas.height
);

game.start();

// Focus the canvas so that the player doesn't have to click on it.
canvas.focus();
