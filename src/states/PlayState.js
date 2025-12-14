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
import SlowPowerUp from '../entities/SlowPowerUp.js';
import InvinciblePowerUp from '../entities/InvinciblePowerUp.js';
import Pipe from '../entities/Pipe.js';

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
		this.autoSaveTimer = 0;
		this.autoSaveInterval = 2.0; // Auto-save every 2 seconds
	}

	/**
	 * Called when entering this state.
	 * Only initialize if the game hasn't been started yet.
	 * If saved data exists, restore from it instead of initializing fresh.
	 */
	enter() {
		// Unpause player when entering PlayState (in case we're resuming from pause)
		if (this.player) {
			this.player.isPaused = false;
		}
		
		// Check if we have saved game data to restore
		const savedData = this.gameController.loadGameState();
		
		if (savedData && savedData.player && !this.isGameStarted) {
			// Restore from saved data
			this.restoreGameState(savedData);
			this.isGameStarted = true;
		} else if (!this.isGameStarted) {
			// Only initialize if the game hasn't been started yet
			// This prevents resetting the game when resuming from pause
			this.initializeGame();
		}
	}

	/**
	 * Initializes the game entities.
	 */
	initializeGame() {
		// Initialize player at center-left of screen
		const playerWidth = 16; // Base player width
		const playerHeight = 32; // Base player height
		const playerX = CANVAS_WIDTH * 0.2; // Position at 20% from left edge
		const playerY = CANVAS_HEIGHT / 2; // Position at vertical center

		// Create player with selected cat from GameController
		this.player = new Player(
			playerX, 
			playerY, 
			playerWidth, 
			playerHeight,
			this.gameController.selectedCatIndex // Use selected cat index
		);
		this.pipes = []; // Initialize empty pipe array
		this.stars = []; // Initialize empty star array
		this.hearts = []; // Initialize empty heart array
		this.powerUps = []; // Initialize empty power-up array
		this.pipeSpawnTimer = 0; // Reset pipe spawn timer
		this.starSpawnTimer = 0; // Reset star spawn timer
		this.heartSpawnTimer = 0; // Reset heart spawn timer
		this.powerUpSpawnTimer = 0; // Reset power-up spawn timer
		this.autoSaveTimer = 0; // Reset auto-save timer
		this.isGameStarted = true; // Mark game as started

		// Store player reference in gameController
		this.gameController.player = this.player; // Allow GameController to access player
		
		// Sync lives with player health (they represent the same thing)
		this.gameController.lives = this.player.health; // Ensure lives match player health
	}

	/**
	 * Restores the game state from saved data.
	 * Recreates all entities (player, pipes, stars, hearts, power-ups) from saved positions and states.
	 * @param {Object} savedData - The saved game data from localStorage
	 */
	restoreGameState(savedData) {
		// Restore basic game state
		this.gameController.score = savedData.score || 0;
		this.gameController.lives = savedData.lives || 3;
		this.gameController.selectedCatIndex = savedData.selectedCatIndex || 0;

		// Restore spawn timers
		if (savedData.spawnTimers) {
			this.pipeSpawnTimer = savedData.spawnTimers.pipeSpawnTimer || 0;
			this.starSpawnTimer = savedData.spawnTimers.starSpawnTimer || 0;
			this.heartSpawnTimer = savedData.spawnTimers.heartSpawnTimer || 0;
			this.powerUpSpawnTimer = savedData.spawnTimers.powerUpSpawnTimer || 0;
		}
		this.autoSaveTimer = 0; // Reset auto-save timer on restore

		// Restore player
		if (savedData.player) {
			const playerWidth = 16;
			const playerHeight = 32;
			this.player = new Player(
				savedData.player.position.x || CANVAS_WIDTH * 0.2,
				savedData.player.position.y || CANVAS_HEIGHT / 2,
				playerWidth,
				playerHeight,
				savedData.player.catIndex || this.gameController.selectedCatIndex
			);

			// Restore player state
			this.player.position.x = savedData.player.position.x;
			this.player.position.y = savedData.player.position.y;
			
			// Check if we're restoring to PauseState - if so, freeze player movement
			// This prevents the player from falling when reloading while paused
			if (savedData.activeState === 'pause') {
				// Freeze player when restoring to pause state
				this.player.velocity.x = 0;
				this.player.velocity.y = 0;
				this.player.isPaused = true; // Set paused flag to prevent physics updates
			} else {
				// Otherwise, restore the saved velocity
				this.player.velocity.x = savedData.player.velocity.x || 0;
				this.player.velocity.y = savedData.player.velocity.y || 0;
				this.player.isPaused = false; // Ensure player is not paused
			}
			this.player.health = savedData.player.health || 3;
			this.player.stars = savedData.player.stars || 0;
			this.player.isDead = savedData.player.isDead || false;
			this.player.isHurt = savedData.player.isHurt || false;
			this.player.hurtTimer = savedData.player.hurtTimer || 0;
			this.player.isInvincible = savedData.player.isInvincible || false;
			this.player.powerUpTimer = savedData.player.powerUpTimer || 0;

			// Restore active power-up if it exists
			if (savedData.player.activePowerUpType && savedData.player.powerUpTimer > 0) {
				if (savedData.player.activePowerUpType === 'invincible') {
					this.player.activePowerUp = new InvinciblePowerUp(0, 0);
					this.player.activePowerUp.isCollected = true; // Mark as collected since it's active
					this.player.isInvincible = true;
				} else if (savedData.player.activePowerUpType === 'slow') {
					this.player.activePowerUp = new SlowPowerUp(0, 0);
					this.player.activePowerUp.isCollected = true; // Mark as collected since it's active
					// Apply slow effect
					if (SlowPowerUp.originalSpeed === null) {
						SlowPowerUp.originalSpeed = Pipe.SPEED;
					}
					Pipe.SPEED = SlowPowerUp.originalSpeed / 2;
				}
			}

			this.gameController.player = this.player;
		} else {
			// Fallback: initialize normally if no player data
			this.initializeGame();
			return;
		}

		// Restore pipes
		this.pipes = [];
		if (savedData.pipes && Array.isArray(savedData.pipes)) {
			for (const pipeData of savedData.pipes) {
				if (pipeData.isDead) continue; // Skip dead pipes

				// Create pipe pair directly at saved position (don't use factory which spawns at canvas.width)
				const pipePair = new PipePair(pipeData.position.x);
				pipePair.position.x = pipeData.position.x;
				pipePair.isPassed = pipeData.isPassed || false;
				pipePair.isDead = pipeData.isDead || false;

				// Restore gap position by recreating pipes with correct gapY
				const gapY = pipeData.gapY || CANVAS_HEIGHT / 2;
				pipePair.pipes = [];
				pipePair.pipes.push(new Pipe(pipeData.position.x, gapY, true));
				pipePair.pipes.push(new Pipe(pipeData.position.x, gapY + PipePair.GAP_HEIGHT, false));
				
				// Update pipe positions
				pipePair.pipes.forEach(pipe => {
					pipe.position.x = pipeData.position.x;
				});

				this.pipes.push(pipePair);
			}
		}

		// Restore stars
		this.stars = [];
		if (savedData.stars && Array.isArray(savedData.stars)) {
			for (const starData of savedData.stars) {
				const star = this.starFactory.spawn();
				star.position.x = starData.position.x;
				star.position.y = starData.position.y;
				star.isCollected = false;
				this.stars.push(star);
			}
		}

		// Restore hearts
		this.hearts = [];
		if (savedData.hearts && Array.isArray(savedData.hearts)) {
			for (const heartData of savedData.hearts) {
				const heart = this.heartFactory.spawn();
				heart.position.x = heartData.position.x;
				heart.position.y = heartData.position.y;
				heart.animationTimer = heartData.animationTimer || 0;
				heart.isCollected = false;
				this.hearts.push(heart);
			}
		}

		// Restore power-ups
		this.powerUps = [];
		if (savedData.powerUps && Array.isArray(savedData.powerUps)) {
			for (const powerUpData of savedData.powerUps) {
				let powerUp;
				if (powerUpData.type === 'invincible') {
					powerUp = new InvinciblePowerUp(powerUpData.position.x, powerUpData.position.y);
				} else {
					powerUp = new SlowPowerUp(powerUpData.position.x, powerUpData.position.y);
				}
				powerUp.position.x = powerUpData.position.x;
				powerUp.position.y = powerUpData.position.y;
				powerUp.isCollected = false;
				this.powerUps.push(powerUp);
			}
		}
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
		// Sync lives with player health first (they represent the same thing in this game)
		if (this.player) {
			this.gameController.lives = this.player.health; // Keep lives in sync with player health
		}

		// Check for game over condition (player dead or no lives)
		if (!this.player || this.player.isDead || this.player.health <= 0 || this.gameController.isGameOver()) {
			// Game over - transition to GameOverState
			this.gameController.saveGameState(GameStateName.GameOver, this); // Pass PlayState for full save
			stateMachine.change(GameStateName.GameOver);
			return;
		}

		// Handle player input (jump/flap)
		if (input.isKeyPressed(Input.KEYS.SPACE) || 
		    input.isKeyPressed(Input.KEYS.ARROW_UP)) {
			this.player.flap(); // Apply upward force when space or up arrow is pressed
		}

		// Update player
		this.player.update(dt); // Update player position, animations, and power-ups
		
		// Sync lives with player health (they represent the same thing in this game)
		// Note: We also sync at the beginning of update to catch death immediately
		if (this.player) {
			this.gameController.lives = this.player.health; // Keep lives in sync with player health
		}

		// Check if slow motion is active (SlowPowerUp reduces Pipe.SPEED to half)
		const isSlowMotion = SlowPowerUp.originalSpeed !== null && 
		                      Pipe.SPEED < SlowPowerUp.originalSpeed;
		// Adjust delta time for spawn timers during slow motion
		const spawnDt = isSlowMotion ? dt * (Pipe.SPEED / SlowPowerUp.originalSpeed) : dt;

		// Keep player within screen bounds
		if (this.player.position.y < 0) {
			this.player.position.y = 0;
			this.player.velocity.y = 0;
		}
		if (this.player.position.y + this.player.dimensions.y > CANVAS_HEIGHT) {
			this.player.position.y = CANVAS_HEIGHT - this.player.dimensions.y;
			this.player.velocity.y = 0;
			// Player hit the ground - take damage
			if (!this.player.isDead && !this.player.isHurt) {
				this.player.takeDamage(); // Apply damage to player (decreases health)
				// Lives are synced with health in the update loop, so no need to manually update here
			}
		}

		// Spawn pipes
		this.pipeSpawnTimer += spawnDt; // Accumulate time since last pipe spawn (slowed during slow motion)
		if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
			this.pipes.push(this.pipeFactory.spawn()); // Create new pipe pair and add to array
			this.pipeSpawnTimer = 0; // Reset timer for next spawn
		}

		// Spawn stars
		this.starSpawnTimer += spawnDt; // Accumulate time since last star spawn (slowed during slow motion)
		if (this.starSpawnTimer >= this.starSpawnInterval) {
			this.stars.push(this.starFactory.spawn()); // Create new star and add to array
			this.starSpawnTimer = 0; // Reset timer for next spawn
		}

		// Spawn hearts
		this.heartSpawnTimer += spawnDt; // Accumulate time since last heart spawn (slowed during slow motion)
		if (this.heartSpawnTimer >= this.heartSpawnInterval) {
			this.hearts.push(this.heartFactory.spawn()); // Create new heart and add to array
			this.heartSpawnTimer = 0; // Reset timer for next spawn
		}

		// Spawn power-ups
		this.powerUpSpawnTimer += spawnDt; // Accumulate time since last power-up spawn (slowed during slow motion)
		if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
			this.powerUps.push(this.powerUpFactory.spawn()); // Create new power-up and add to array
			this.powerUpSpawnTimer = 0; // Reset timer for next spawn
		}

		// Update stars
		for (let i = this.stars.length - 1; i >= 0; i--) { // Iterate backwards to safely remove items
			const star = this.stars[i];
			star.update(dt); // Update star position and animation

			// Remove stars that are off screen or collected
			if (star.isCollected || star.position.x + star.dimensions.x < 0) {
				this.stars.splice(i, 1); // Remove from array if off-screen or collected
				continue;
			}

			// Check collision with player
			if (star.collidesWith(this.player)) {
				star.collect(this.player); // Trigger collection logic
				this.gameController.addScore(5); // Award points for collecting star
			}
		}

		// Update hearts
		for (let i = this.hearts.length - 1; i >= 0; i--) { // Iterate backwards to safely remove items
			const heart = this.hearts[i];
			heart.update(dt); // Update heart position and bounce animation

			// Remove hearts that are off screen or collected
			if (heart.isCollected || heart.position.x + heart.dimensions.x < 0) {
				this.hearts.splice(i, 1); // Remove from array if off-screen or collected
				continue;
			}

			// Check collision with player
			if (heart.collidesWith(this.player)) {
				heart.collect(this.player); // Trigger collection logic and heal player (restores 1 health)
				// Lives are synced with health in the update loop, so healing automatically restores a life
			}
		}

		// Update power-ups
		for (let i = this.powerUps.length - 1; i >= 0; i--) { // Iterate backwards to safely remove items
			const powerUp = this.powerUps[i];
			powerUp.update(dt); // Update power-up position

			// Remove power-ups that are off screen or collected
			if (powerUp.isCollected || powerUp.position.x + powerUp.dimensions.x < 0) {
				this.powerUps.splice(i, 1); // Remove from array if off-screen or collected
				continue;
			}

			// Check collision with player
			if (powerUp.collidesWith(this.player)) {
				powerUp.collect(this.player); // Trigger collection and apply power-up effect
				this.gameController.addScore(10); // Award points for collecting power-up
			}
		}

		// Update pipes
		for (let i = this.pipes.length - 1; i >= 0; i--) { // Iterate backwards to safely remove items
			const pipePair = this.pipes[i];
			pipePair.update(dt); // Update pipe position

			// Remove pipes that are off screen
			if (pipePair.isDead) {
				this.pipes.splice(i, 1); // Remove from array if off-screen
				continue;
			}

			// Check collision with player
			if (pipePair.collidesWith(this.player)) {
				if (!this.player.isDead && !this.player.isHurt) {
					this.player.takeDamage(); // Apply damage to player (decreases health)
					// Lives are synced with health in the update loop, so no need to manually update here
				}
			}

			// Check if player passed the pipe (scoring)
			if (!pipePair.isPassed && 
			    pipePair.position.x + pipePair.dimensions.x < this.player.position.x) {
				pipePair.isPassed = true; // Mark as passed to prevent double scoring
				this.gameController.addScore(10); // Award points for passing pipe
			}
		}

		// Auto-save game state periodically
		this.autoSaveTimer += dt;
		if (this.autoSaveTimer >= this.autoSaveInterval) {
			this.gameController.saveGameState(GameStateName.Play, this); // Auto-save full game state
			this.autoSaveTimer = 0; // Reset timer
		}

		/**
		 * Pause behavior:
		 * Pressing P instantly pauses the game.
		 * We also save the game so that a refresh during pause still resumes correctly.
		 */
		const userRequestedPause = input.isKeyPressed('P');

		if (userRequestedPause) {
			this.gameController.saveGameState(GameStateName.Play, this); // Pass PlayState for full save
			stateMachine.change(GameStateName.Pause);
			return; // Stop updating gameplay during same frame
		}
	}

	/**
	 * Checks if a collectible entity overlaps with any pipe.
	 * @param {Entity} collectible - The collectible entity to check
	 * @returns {boolean} True if overlapping with any pipe, false otherwise
	 */
	isOverlappingWithPipes(collectible) {
		for (const pipePair of this.pipes) {
			for (const pipe of pipePair.pipes) {
				// Check horizontal overlap
				const collectibleLeft = collectible.position.x;
				const collectibleRight = collectible.position.x + collectible.dimensions.x;
				
				// For hearts, account for bounce offset in vertical position
				let collectibleTop, collectibleBottom;
				if (collectible instanceof Heart) {
					// Heart has bounce animation, check with bounce offset
					const bounceOffset = Math.sin(collectible.animationTimer * Math.PI * 2) * 3;
					collectibleTop = collectible.position.y + bounceOffset;
					collectibleBottom = collectible.position.y + bounceOffset + collectible.dimensions.y;
				} else {
					collectibleTop = collectible.position.y;
					collectibleBottom = collectible.position.y + collectible.dimensions.y;
				}
				
				const pipeLeft = pipe.position.x;
				const pipeRight = pipe.position.x + Pipe.WIDTH;
				
				// Check if there's horizontal overlap
				if (collectibleRight > pipeLeft && collectibleLeft < pipeRight) {
					if (pipe.isTop) {
						// Top pipe: check if collectible is above the gap (inside the pipe)
						if (collectibleTop < pipe.position.y) return true;
					} else {
						// Bottom pipe: check if collectible is below the gap (inside the pipe)
						if (collectibleBottom > pipe.position.y) return true;
					}
				}
			}
		}
		return false;
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

		// Draw stars (only if not overlapping with pipes)
		this.stars.forEach(star => {
			if (!this.isOverlappingWithPipes(star)) {
				star.render(context);
			}
		});

		// Draw hearts (only if not overlapping with pipes)
		this.hearts.forEach(heart => {
			if (!this.isOverlappingWithPipes(heart)) {
				heart.render(context);
			}
		});

		// Draw power-ups (only if not overlapping with pipes)
		this.powerUps.forEach(powerUp => {
			if (!this.isOverlappingWithPipes(powerUp)) {
				powerUp.render(context);
			}
		});

		// Draw player
		if (this.player) {
			this.player.render(context);
		}

		// Apply slow-motion shader effect if active
		const isSlowMotion = SlowPowerUp.originalSpeed !== null && 
		                      Pipe.SPEED < SlowPowerUp.originalSpeed;
		if (isSlowMotion) {
			// Create slow-motion visual effect: blue/cyan tint overlay to indicate slow motion
			context.save();
			context.globalCompositeOperation = 'screen'; // Screen blend mode for brighter tint
			context.fillStyle = 'rgba(150, 200, 255, 0.25)'; // Cyan/blue tint overlay (25% opacity)
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Cover entire screen
			context.restore();
			
			// Add desaturation effect using overlay blend
			context.save();
			context.globalCompositeOperation = 'overlay'; // Overlay blend for desaturation
			context.globalAlpha = 0.15; // Subtle desaturation
			context.fillStyle = 'rgba(128, 128, 128, 0.5)'; // Gray overlay for desaturation
			context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Cover entire screen
			context.restore();
		}

		// Draw HUD
		// Left-aligned HUD text
		context.textAlign = 'left';
		context.font = fonts.FlappySmall;
		context.fillStyle = 'white';
		context.strokeStyle = 'black';
		context.lineWidth = 2;

		// Helper function to render label + number with different fonts
		const renderStat = (label, value, x, y) => {
			// Render label with FlappyBirdy font
			context.font = fonts.FlappySmall;
			const labelText = label + ': ';
			context.strokeText(labelText, x, y);
			context.fillText(labelText, x, y);
			
			// Measure label width to position number
			const labelWidth = context.measureText(labelText).width;
			
			// Render number with Arial font
			context.font = '20px Arial';
			const numberText = String(value);
			context.strokeText(numberText, x + labelWidth, y);
			context.fillText(numberText, x + labelWidth, y);
		};

		// Score (rounded)
		renderStat('Score', Math.floor(this.gameController.score), 10, 30);

		// Lives - display player health (synced with gameController.lives in update loop)
		const displayLives = this.player ? this.player.health : this.gameController.lives;
		renderStat('Lives', displayLives, 10, 55);

		// Stars (from player if available, otherwise from gameController)
		const stars = this.player?.stars || this.gameController.stars || 0;
		renderStat('Stars', stars, 10, 80);

		// High score (right aligned)
		context.textAlign = 'right';
		// Render label with FlappyBirdy font
		context.font = fonts.FlappySmall;
		const highScoreLabel = 'High Score: ';
		const highScoreLabelWidth = context.measureText(highScoreLabel).width;
		
		// Render number with Arial font (position it to the left of the label)
		context.font = '20px Arial';
		const highScoreNumber = String(this.gameController.highScore);
		const highScoreNumberWidth = context.measureText(highScoreNumber).width;
		
		// Calculate positions: number first, then label
		const numberX = CANVAS_WIDTH - 10;
		const labelX = numberX - highScoreNumberWidth;
		
		// Render number
		context.strokeText(highScoreNumber, numberX, 30);
		context.fillText(highScoreNumber, numberX, 30);
		
		// Render label
		context.font = fonts.FlappySmall;
		context.strokeText(highScoreLabel, labelX, 30);
		context.fillText(highScoreLabel, labelX, 30);
	}

}
