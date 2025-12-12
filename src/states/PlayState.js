/**
 * This is the main gameplay loop.
 *
 * Responsibilities:
 *  - Update gameplay elements (player, pipes, stars, hearts, powerups)
 *  - Handle pause input
 *  - Handle scoring
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
	CANVAS_HEIGHT,
	fonts,
	images,
} from '../globals.js';
import Player from '../entities/player/Player.js';
import PipePair from '../entities/PipePair.js';
import PipeFactory from '../services/PipeFactory.js';
import Star from '../entities/Star.js';
import StarFactory from '../services/StarFactory.js';
import Heart from '../entities/Heart.js';
import HeartFactory from '../services/HeartFactory.js';
import PowerUp from '../entities/PowerUp.js';
import PowerUpFactory from '../services/PowerUpFactory.js';
import ImageName from '../enums/ImageName.js';
import Input from '../../lib/Input.js';

export default class PlayState extends State {
	/**
	 * @param {GameController} gameController
	 * Stores a reference to the shared gameController object,
	 * which tracks score, lives, stars, selected cat, and persistence.
	 */
	constructor(gameController) {
		super();

		this.gameController = gameController;
		this.player = null;
		this.pipes = [];
		this.stars = [];
		this.hearts = [];
		this.powerUps = [];
		this.pipeFactory = new PipeFactory();
		this.starFactory = new StarFactory();
		this.heartFactory = new HeartFactory();
		this.powerUpFactory = new PowerUpFactory();
		this.pipeSpawnTimer = 0;
		this.pipeSpawnInterval = 2.0; // Spawn a pipe every 2 seconds
		this.starSpawnTimer = 0;
		this.starSpawnInterval = 3.0; // Spawn a star every 3 seconds
		this.heartSpawnTimer = 0;
		this.heartSpawnInterval = 5.0; // Spawn a heart every 5 seconds
		this.powerUpSpawnTimer = 0;
		this.powerUpSpawnInterval = 8.0; // Spawn a power-up every 8 seconds
		this.isGameStarted = false;
	}

	/**
	 * Called when entering this state.
	 */
	enter() {
		this.initializeGame();
	}

	/**
	 * Initializes the game entities.
	 */
	initializeGame() {
		// Initialize player at center-left of screen
		const playerWidth = 16;
		const playerHeight = 32;
		const playerX = CANVAS_WIDTH * 0.2;
		const playerY = CANVAS_HEIGHT / 2;

		// Create player with selected cat from GameController
		this.player = new Player(
			playerX, 
			playerY, 
			playerWidth, 
			playerHeight,
			this.gameController.selectedCatIndex
		);
		this.pipes = [];
		this.stars = [];
		this.hearts = [];
		this.powerUps = [];
		this.pipeSpawnTimer = 0;
		this.starSpawnTimer = 0;
		this.heartSpawnTimer = 0;
		this.powerUpSpawnTimer = 0;
		this.isGameStarted = true;

		// Store player reference in gameController
		this.gameController.player = this.player;
	}

	/**
	 * Called every frame.
	 *
	 * This handles:
	 *  - Player input and movement
	 *  - Pipe spawning and movement
	 *  - Collision detection
	 *  - Scoring
	 *  - Pause input
	 *  - Game-over detection
	 */
	update(dt) {
		if (!this.player || this.player.isDead) {
			// Game over - player is dead
			if (this.gameController.isGameOver()) {
				this.gameController.saveGameState(GameStateName.GameOver);
				stateMachine.change(GameStateName.GameOver);
			}
			return;
		}

		// Handle player input (jump/flap)
		if (input.isKeyPressed(Input.KEYS.SPACE) || 
		    input.isKeyPressed(Input.KEYS.ARROW_UP)) {
			this.player.flap();
		}

		// Update player
		this.player.update(dt);

		// Keep player within screen bounds
		if (this.player.position.y < 0) {
			this.player.position.y = 0;
			this.player.velocity.y = 0;
		}
		if (this.player.position.y + this.player.dimensions.y > CANVAS_HEIGHT) {
			this.player.position.y = CANVAS_HEIGHT - this.player.dimensions.y;
			this.player.velocity.y = 0;
			// Player hit the ground - take damage
			if (!this.player.isDead) {
				this.player.takeDamage();
				if (this.player.health <= 0) {
					this.gameController.loseLife();
				}
			}
		}

		// Spawn pipes
		this.pipeSpawnTimer += dt;
		if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
			this.pipes.push(this.pipeFactory.spawn());
			this.pipeSpawnTimer = 0;
		}

		// Spawn stars
		this.starSpawnTimer += dt;
		if (this.starSpawnTimer >= this.starSpawnInterval) {
			this.stars.push(this.starFactory.spawn());
			this.starSpawnTimer = 0;
		}

		// Spawn hearts
		this.heartSpawnTimer += dt;
		if (this.heartSpawnTimer >= this.heartSpawnInterval) {
			this.hearts.push(this.heartFactory.spawn());
			this.heartSpawnTimer = 0;
		}

		// Spawn power-ups
		this.powerUpSpawnTimer += dt;
		if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
			this.powerUps.push(this.powerUpFactory.spawn());
			this.powerUpSpawnTimer = 0;
		}

		// Update stars
		for (let i = this.stars.length - 1; i >= 0; i--) {
			const star = this.stars[i];
			star.update(dt);

			// Remove stars that are off screen or collected
			if (star.isCollected || star.position.x + star.dimensions.x < 0) {
				this.stars.splice(i, 1);
				continue;
			}

			// Check collision with player
			if (star.collidesWith(this.player)) {
				star.collect(this.player);
				this.gameController.addScore(5); // Award points for collecting star
			}
		}

		// Update hearts
		for (let i = this.hearts.length - 1; i >= 0; i--) {
			const heart = this.hearts[i];
			heart.update(dt);

			// Remove hearts that are off screen or collected
			if (heart.isCollected || heart.position.x + heart.dimensions.x < 0) {
				this.hearts.splice(i, 1);
				continue;
			}

			// Check collision with player
			if (heart.collidesWith(this.player)) {
				heart.collect(this.player);
				// Hearts restore health, which may restore a life
				if (this.player.health > 0 && this.gameController.lives < 3) {
					// If player was at 0 health but now has health, restore a life
					// This is handled by the heart's collect method which calls player.heal(1)
				}
			}
		}

		// Update power-ups
		for (let i = this.powerUps.length - 1; i >= 0; i--) {
			const powerUp = this.powerUps[i];
			powerUp.update(dt);

			// Remove power-ups that are off screen or collected
			if (powerUp.isCollected || powerUp.position.x + powerUp.dimensions.x < 0) {
				this.powerUps.splice(i, 1);
				continue;
			}

			// Check collision with player
			if (powerUp.collidesWith(this.player)) {
				powerUp.collect(this.player);
				this.gameController.addScore(10); // Award points for collecting power-up
			}
		}

		// Update pipes
		for (let i = this.pipes.length - 1; i >= 0; i--) {
			const pipePair = this.pipes[i];
			pipePair.update(dt);

			// Remove pipes that are off screen
			if (pipePair.isDead) {
				this.pipes.splice(i, 1);
				continue;
			}

			// Check collision with player
			if (pipePair.collidesWith(this.player)) {
				if (!this.player.isDead && !this.player.isHurt) {
					this.player.takeDamage();
					if (this.player.health <= 0) {
						this.gameController.loseLife();
					}
				}
			}

			// Check if player passed the pipe (scoring)
			if (!pipePair.isPassed && 
			    pipePair.position.x + pipePair.dimensions.x < this.player.position.x) {
				pipePair.isPassed = true;
				this.gameController.addScore(10);
			}
		}

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
	 * Draws the game entities and HUD on screen.
	 */
	render() {
		// Draw background (if available)
		const background = images.get(ImageName.Background);
		if (background) {
			// Tile the background
			for (let x = 0; x < CANVAS_WIDTH; x += background.width) {
				for (let y = 0; y < CANVAS_HEIGHT; y += background.height) {
					background.render(x, y);
				}
			}
		}

		// Draw pipes
		this.pipes.forEach(pipePair => {
			pipePair.render(context);
		});

		// Draw stars
		this.stars.forEach(star => {
			star.render(context);
		});

		// Draw hearts
		this.hearts.forEach(heart => {
			heart.render(context);
		});

		// Draw power-ups
		this.powerUps.forEach(powerUp => {
			powerUp.render(context);
		});

		// Draw player
		if (this.player) {
			this.player.render(context);
		}

		// Draw HUD
		// Left-aligned HUD text
		context.textAlign = 'left';
		context.font = fonts.FlappySmall;
		context.fillStyle = 'white';
		context.strokeStyle = 'black';
		context.lineWidth = 2;

		// Score (rounded)
		context.strokeText(
			'Score: ' + Math.floor(this.gameController.score),
			10,
			30
		);
		context.fillText(
			'Score: ' + Math.floor(this.gameController.score),
			10,
			30
		);

		// Lives
		context.strokeText(
			'Lives: ' + this.gameController.lives,
			10,
			55
		);
		context.fillText(
			'Lives: ' + this.gameController.lives,
			10,
			55
		);

		// Stars (from player if available, otherwise from gameController)
		const stars = this.player?.stars || this.gameController.stars || 0;
		context.strokeText(
			'Stars: ' + stars,
			10,
			80
		);
		context.fillText(
			'Stars: ' + stars,
			10,
			80
		);

		// High score (right aligned)
		context.textAlign = 'right';
		context.strokeText(
			'High Score: ' + this.gameController.highScore,
			CANVAS_WIDTH - 10,
			30
		);
		context.fillText(
			'High Score: ' + this.gameController.highScore,
			CANVAS_WIDTH - 10,
			30
		);
	}

}
