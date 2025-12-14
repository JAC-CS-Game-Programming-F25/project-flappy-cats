import { images, sounds } from '../../globals.js';
import {
	loadPlayerSprites,
	smallSpriteConfig,
} from '../../../config/SpriteConfig.js';
import Vector from '../../../lib/Vector.js';
import ImageName from '../../enums/ImageName.js';
import Animation from '../../../lib/Animation.js';
import Entity from '../Entity.js';
import SoundName from "../../enums/SoundName.js";
import Sprite from '../../../lib/Sprite.js';

export default class Player extends Entity {
	/**
	 * Returns cat configuration based on cat index.
	 * Note: The order matches CatSelectState's cat array:
	 * Index 0: Heavy Cat, Index 1: Light Cat, Index 2: Big Cat, Index 3: Small Cat
	 * @param {number} catIndex - Index of selected cat (0-3)
	 * @returns {Object} Configuration with weight, size, and jumpStrength
	 */
	static getCatConfig(catIndex) {
		const configs = [
			// Index 0: Heavy Cat - falls faster, harder to keep up but more stable
			{ weight: 1.5, size: 1.0, jumpStrength: -350 },
			// Index 1: Light Cat - rises faster, easier to float but harder to control
			{ weight: 0.8, size: 1.0, jumpStrength: -450 },
			// Index 2: Big Cat - larger hitbox makes the game more challenging
			{ weight: 1.2, size: 1.3, jumpStrength: -400 },
			// Index 3: Small Cat - smaller hitbox, slightly easier to fit through gaps
			{ weight: 1.0, size: 0.8, jumpStrength: -400 },
		];

		// Default to first cat if index is out of range
		return configs[catIndex] || configs[0];
	}

	/**
	 * Loads the cat sprite based on the selected cat index.
	 * Uses the same sprite coordinates as CatSelectState.
	 * @param {number} catIndex - Index of selected cat (0-3)
	 * @returns {Sprite} The cat sprite for the selected cat
	 */
	static loadCatSprite(catIndex) {
		const spriteSheet = images.get(ImageName.SpriteSheet);
		const lightAndSmallCatSheet = images.get(ImageName.LightAndSmallCat);

		if (!spriteSheet || !lightAndSmallCatSheet) {
			// Fallback to a default sprite if images aren't loaded
			return null;
		}

		// Cat sprite configurations matching CatSelectState's order
		const catSprites = [
			// Index 0: Heavy Cat - from spritesheet
			new Sprite(spriteSheet, 4208, 46, 320, 443),
			// Index 1: Light Cat - from lightAndSmallCat sheet
			new Sprite(lightAndSmallCatSheet, 560, 64, 276, 422),
			// Index 2: Big Cat - from spritesheet
			new Sprite(spriteSheet, 4625, 17, 406, 478),
			// Index 3: Small Cat - from lightAndSmallCat sheet
			new Sprite(lightAndSmallCatSheet, 66, 29, 337, 442),
		];

		// Return the sprite for the selected cat, or first one as fallback
		return catSprites[catIndex] || catSprites[0];
	}

	constructor(x, y, width, height, catIndex = 0) {
		// Get cat configuration
		const catConfig = Player.getCatConfig(catIndex);

		// Apply size modifier to dimensions
		const scaledWidth = width * catConfig.size;
		const scaledHeight = height * catConfig.size;
		super(x, y, scaledWidth, scaledHeight);

		// Store base dimensions for reference
		this.baseWidth = width;
		this.baseHeight = height;

		this.velocity = new Vector(0, 0);
		this.gravity = 1500;
		this.jumpStrength = catConfig.jumpStrength;

		// Cat modifiers from configuration
		this.weight = catConfig.weight;
		this.size = catConfig.size;

		// Stats
		this.maxHealth = 3;
		this.health = this.maxHealth;
		this.stars = 0;

		// Store cat index for sprite loading
		this.catIndex = catIndex;

		// Load cat sprite based on selected cat
		// This uses the same sprites as CatSelectState
		this.catSprite = Player.loadCatSprite(catIndex);

		// Load player sprites (fallback for animations if needed)
		this.sprites = loadPlayerSprites(
			images.get(ImageName.Mario),
			smallSpriteConfig
		);

		// Animations (using cat sprite as single frame for now)
		// Create animations from the cat sprite for different states
		const catSpriteFrame = [this.catSprite]; // Single frame animation
		this.animations = {
			idle: new Animation(catSpriteFrame, 0.1),
			fly: new Animation(catSpriteFrame, 0.1),
			hurt: new Animation(catSpriteFrame, 0.1),
			fall: new Animation(catSpriteFrame, 0.1)
		};

		this.currentAnimation = this.animations.idle;
		this.isDead = false;
		this.isHurt = false;
		this.hurtTimer = 0;
		this.isInvincible = false;

		// Idle float animation properties
		this.floatTime = 0;
		this.floatOffset = 0;

		// Shake effect for hurt state
		this.shakeOffset = new Vector(0, 0);

		// Balloon stretch animation properties
		this.stretchScale = 1.0; // Vertical stretch scale (1.0 = normal, >1.0 = stretched)

		// Jump animation properties
		this.jumpAnimationTimer = 0; // Timer for jump animation
		this.jumpAnimationDuration = 0.3; // Duration of jump animation in seconds
		this.jumpRotation = 0; // Rotation angle for jump animation (in radians)
		this.jumpBounceScale = 1.0; // Scale bounce effect during jump

		// Invincibility glow animation properties
		this.glowTime = 0; // Timer for pulsing glow effect

		// PowerUp tracking
		this.activePowerUp = null; // Currently active power-up (or null if none)
		this.powerUpTimer = 0; // Remaining time for active power-up in seconds
		this.isPaused = false; // Flag to prevent physics updates when paused
	}

	update(dt) {
		if (this.isDead) return; // Don't update if player is dead
		if (this.isPaused) return; // Don't update physics if paused

		// Apply gravity with weight modifier
		this.velocity.y += this.gravity * this.weight * dt; // Heavier cats fall faster
		this.position.y += this.velocity.y * dt; // Update position based on velocity

		// Update idle float animation
		// When velocity is relatively small (near hovering), apply gentle float
		const isIdle = Math.abs(this.velocity.y) < 50; // Consider idle when moving slowly
		if (isIdle && !this.isHurt && !this.isDead) {
			this.floatTime += dt; // Accumulate time for float animation
			// Gentle sine wave oscillation: amplitude of 2 pixels, period of ~2 seconds
			this.floatOffset = Math.sin(this.floatTime * Math.PI) * 2; // Vertical float offset
		} else {
			// Reset float when actively moving
			this.floatOffset = 0; // No float offset when moving
		}

		// Update balloon stretch animation
		// When rising (negative velocity), stretch vertically to simulate balloon effect
		if (this.velocity.y < 0 && !this.isDead && !this.isHurt) {
			// Calculate stretch based on upward velocity
			// Normalize velocity to 0-1 range (most negative = max stretch)
			// jumpStrength is negative, so we compare against it
			const normalizedVelocity = Math.abs(this.velocity.y) / Math.abs(this.jumpStrength);
			// Stretch from 1.0 (normal) to 1.15 (15% taller) based on velocity
			this.stretchScale = 1.0 + (normalizedVelocity * 0.15); // Apply stretch based on upward speed
		} else {
			// Gradually return to normal when not rising
			this.stretchScale = 1.0 + (this.stretchScale - 1.0) * 0.8; // Decay factor (smooth return)
			if (Math.abs(this.stretchScale - 1.0) < 0.01) {
				this.stretchScale = 1.0; // Snap to normal when close enough to avoid floating point issues
			}
		}

		// Update animation
		this.currentAnimation.update(dt);

		// Update jump animation
		if (this.jumpAnimationTimer > 0) {
			this.jumpAnimationTimer -= dt; // Decrease jump animation timer
			// Calculate animation progress (1.0 at start, 0.0 at end)
			const progress = this.jumpAnimationTimer / this.jumpAnimationDuration;
			// Rotation: slight tilt upward when jumping (max 15 degrees = ~0.26 radians)
			this.jumpRotation = Math.sin(progress * Math.PI) * 0.26; // Sine wave for smooth animation
			// Bounce scale: slight scale up during jump (1.0 to 1.1)
			this.jumpBounceScale = 1.0 + (Math.sin(progress * Math.PI) * 0.1); // Scale bounce effect
		} else {
			// Reset jump animation values when timer expires
			this.jumpRotation = 0; // No rotation when not jumping
			this.jumpBounceScale = 1.0; // Normal scale when not jumping
		}

		// Update invincibility glow animation
		if (this.isInvincible) {
			this.glowTime += dt * 4; // Accumulate time for pulsing glow (4x speed for faster, more noticeable pulse)
		} else {
			this.glowTime = 0; // Reset glow timer when not invincible
		}

		// Update power-up timer
		this.updatePowerUp(dt);

		// Handle hurt timer and shake effect
		if (this.isHurt) {
			this.hurtTimer -= dt; // Decrease hurt timer
			
			// Calculate shake intensity based on remaining hurt time (stronger at start, decays)
			const shakeIntensity = this.hurtTimer / 1.0; // Normalize to 0-1, decays as timer decreases
			const maxShake = 3; // Maximum shake distance in pixels
			
			// Apply random shake that decays over time
			this.shakeOffset.x = (Math.random() - 0.5) * 2 * maxShake * shakeIntensity; // Random horizontal shake
			this.shakeOffset.y = (Math.random() - 0.5) * 2 * maxShake * shakeIntensity; // Random vertical shake
			
			if (this.hurtTimer <= 0) {
				this.isHurt = false; // End hurt state
				this.shakeOffset.x = 0; // Reset shake offset
				this.shakeOffset.y = 0; // Reset shake offset
				this.currentAnimation = this.animations.fly; // Return to flying animation
			}
		} else {
			// Reset shake when not hurt
			this.shakeOffset.x = 0; // No horizontal shake
			this.shakeOffset.y = 0; // No vertical shake
			// Switch animations based on state
			if (this.velocity.y < 0) {
				this.currentAnimation = this.animations.fly; // Use flying animation when rising
			} else if (isIdle) {
				// Use idle animation when floating gently
				this.currentAnimation = this.animations.idle; // Use idle animation when hovering
			} else {
				this.currentAnimation = this.animations.fall; // Use falling animation when descending
			}
		}
	}

	render(context) {
		context.save();
		
		// Calculate base render position with offsets (before any scaling)
		const baseX = this.position.x + this.shakeOffset.x;
		const baseY = this.position.y + this.floatOffset + this.shakeOffset.y;
		
		// Flash if hurt (but not invincible - invincible uses glow instead)
		if (this.isHurt && !this.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
			context.globalAlpha = 0.5;
		}

		if (this.catSprite) {
			// Render cat sprite - these are large sprites that need to be scaled down
			// Cat sprites are much larger (300-400px) than base player size (16x32)
			// Scale them down to fit the game scale
			const catScale = 0.08; // Scale factor to make cat sprites game-appropriate size
			const scaledWidth = this.catSprite.width * catScale * this.size; // Apply cat size modifier
			const scaledHeight = this.catSprite.height * catScale * this.size; // Apply cat size modifier
			
			// Apply balloon stretch to height only
			const finalHeight = scaledHeight * this.stretchScale; // Calculate final height with stretch
			
			// Calculate center point for rendering
			const centerX = baseX + scaledWidth / 2; // Horizontal center
			const centerY = baseY + finalHeight / 2; // Vertical center
			
			// Translate to center
			context.translate(centerX, centerY); // Move origin to sprite center
			
			// Apply jump rotation (tilt effect when jumping)
			if (this.jumpRotation !== 0) {
				context.rotate(this.jumpRotation); // Rotate sprite for jump animation
			}
			
			// Apply jump bounce scale (slight size increase during jump)
			if (this.jumpBounceScale !== 1.0) {
				context.scale(this.jumpBounceScale, this.jumpBounceScale); // Scale up during jump
			}
			
			// Apply balloon stretch (vertical scaling only)
			if (this.stretchScale !== 1.0) {
				context.scale(1.0, this.stretchScale); // Stretch vertically when rising
			}
			
			// Translate back
			context.translate(-scaledWidth / 2, -scaledHeight / 2); // Move origin back for rendering
			
			// Apply invincibility glow effect (dramatic pulsing glow)
			if (this.isInvincible) {
				// Use a faster sine wave for more noticeable pulsing
				// Calculate pulsing glow intensity (0.7 to 1.0 for very strong visibility)
				const glowIntensity = 0.7 + (Math.sin(this.glowTime * 2) * 0.3); // Faster pulse, very strong base
				// Calculate pulsing blur size (very dramatic range: 25-60px for huge visible glow)
				const glowBlur = 25 + (Math.sin(this.glowTime * 2) * 35); // Glow blur pulses between 25-60px
				// Use a vibrant golden/yellow color for better visibility
				const glowColor = `rgba(255, 215, 50, ${glowIntensity})`; // Bright golden glow with pulsing opacity
				
				// Set up shadow for glow effect (golden/yellow glow)
				context.shadowColor = glowColor; // Vibrant golden glow color with pulsing opacity
				context.shadowBlur = glowBlur; // Glow blur size that pulses dramatically (very large)
				context.shadowOffsetX = 0; // No horizontal offset
				context.shadowOffsetY = 0; // No vertical offset
			}
			
			// Render the cat sprite with appropriate scale
			// Shadow effect will be applied if invincible
			this.catSprite.render(0, 0, { 
				x: catScale * this.size, // Horizontal scale with cat size modifier
				y: catScale * this.size  // Vertical scale with cat size modifier
			});
			
			// Reset shadow effects after rendering
			if (this.isInvincible) {
				context.shadowColor = 'transparent'; // Clear shadow
				context.shadowBlur = 0; // Reset blur
				context.shadowOffsetX = 0; // Reset horizontal offset
				context.shadowOffsetY = 0; // Reset vertical offset
			}
		} else {
			// Fallback to animation frame (original Mario sprites)
			const frame = this.currentAnimation.getCurrentFrame();
			
			// Get frame dimensions
			const frameWidth = frame.width || this.baseWidth;
			const frameHeight = frame.height || this.baseHeight;
			
			// Calculate center point for scaling (in world coordinates)
			const centerX = baseX + (frameWidth * this.size) / 2;
			const centerY = baseY + (frameHeight * this.size) / 2;
			
			// Translate to center for scaling operations
			context.translate(centerX, centerY);
			
			// Apply size modifier
			if (this.size !== 1.0) {
				context.scale(this.size, this.size);
			}
			
			// Apply balloon stretch (vertical scaling only)
			if (this.stretchScale !== 1.0) {
				context.scale(1.0, this.stretchScale);
			}
			
			// Apply invincibility glow effect for fallback animation
			if (this.isInvincible) {
				// Use a faster sine wave for more noticeable pulsing
				const glowIntensity = 0.7 + (Math.sin(this.glowTime * 2) * 0.3); // Faster pulse, very strong base
				const glowBlur = 25 + (Math.sin(this.glowTime * 2) * 35); // Glow blur pulses between 25-60px
				const glowColor = `rgba(255, 215, 50, ${glowIntensity})`; // Bright golden glow with pulsing opacity
				
				context.shadowColor = glowColor;
				context.shadowBlur = glowBlur;
				context.shadowOffsetX = 0;
				context.shadowOffsetY = 0;
			}
			
			// Translate back and adjust for frame rendering
			context.translate(-frameWidth / 2, -frameHeight / 2);
			
			// Render the frame at origin (0, 0) since we've already translated
			frame.render(0, 0);
			
			// Reset shadow effects after rendering
			if (this.isInvincible) {
				context.shadowColor = 'transparent';
				context.shadowBlur = 0;
				context.shadowOffsetX = 0;
				context.shadowOffsetY = 0;
			}
		}
		
		context.restore();
	}

	flap() {
		if (this.isDead) return; // Don't flap if dead
		this.velocity.y = this.jumpStrength; // Apply upward force (negative value)
		sounds.play(SoundName.Jump); // Play jump sound effect
		this.currentAnimation = this.animations.fly; // Switch to flying animation
		this.jumpAnimationTimer = this.jumpAnimationDuration; // Start jump animation
	}

	die() {
		if (this.isDead) return;
		this.isDead = true;
		sounds.play(SoundName.PlayerDown);
		this.currentAnimation = this.animations.hurt;
	}

	takeDamage() {
		if (this.isHurt || this.isDead || this.isInvincible) return;

		this.health = Math.max(0, this.health - 1);

		if (this.health === 0) {
			this.die();
		} else {
			this.isHurt = true;
			this.hurtTimer = 1.0; // 1 second invincibility/hurt state
			this.currentAnimation = this.animations.hurt;
			sounds.play(SoundName.Bump); // Or some damage sound
		}
	}

	heal(amount) {
		if (this.isDead) return;
		this.health = Math.min(this.maxHealth, this.health + amount);
	}

	collectStar() {
		this.stars++;
	}

	/**
	 * POLYMORPHISM: This method demonstrates polymorphism by accepting any
	 * PowerUp subclass instance (InvinciblePowerUp, SlowPowerUp, or future
	 * power-up types) and treating them all the same through the PowerUp
	 * interface. The method calls powerUp.apply(this) without knowing
	 * the specific subclass type. JavaScript's dynamic dispatch ensures
	 * the correct subclass implementation is called at runtime.
	 * 
	 * This is a key example of polymorphism in action:
	 * - The parameter type is PowerUp (the base class)
	 * - But it can accept InvinciblePowerUp or SlowPowerUp instances
	 * - When powerUp.apply() is called, the correct subclass method executes
	 * 
	 * @param {PowerUp} powerUp - Any PowerUp subclass instance (polymorphic parameter)
	 */
	applyPowerUp(powerUp) {
		// Store the power-up and set timer
		this.activePowerUp = powerUp; // Store reference to active power-up
		this.powerUpTimer = powerUp.duration; // Set timer to power-up duration (5 seconds)
		
		// POLYMORPHISM: Call apply() method - the correct subclass implementation
		// (InvinciblePowerUp.apply() or SlowPowerUp.apply()) will be called
		// based on the actual object type at runtime, not the declared type.
		powerUp.apply(this); // Apply power-up effect to player
	}

	/**
	 * Updates the active power-up timer and removes it when expired.
	 * 
	 * POLYMORPHISM: This method demonstrates polymorphism by calling
	 * powerUp.remove(this) on the stored activePowerUp. Even though
	 * activePowerUp is typed as PowerUp, it could be an InvinciblePowerUp
	 * or SlowPowerUp instance. The correct remove() implementation is
	 * called based on the actual object type at runtime.
	 * 
	 * @param {number} dt - Delta time in seconds
	 */
	updatePowerUp(dt) {
		if (this.activePowerUp && this.powerUpTimer > 0) {
			this.powerUpTimer -= dt; // Decrease timer by delta time
			
			// When timer expires, remove the power-up effect
			if (this.powerUpTimer <= 0) {
				// POLYMORPHISM: Call remove() method if it exists.
				// The correct subclass implementation (InvinciblePowerUp.remove()
				// or SlowPowerUp.remove()) will be called based on the actual
				// object type. This is runtime polymorphism in action.
				if (this.activePowerUp.remove) {
					this.activePowerUp.remove(this); // Remove power-up effect
				}
				this.activePowerUp = null; // Clear active power-up reference
				this.powerUpTimer = 0; // Reset timer
			}
		}
	}
}


