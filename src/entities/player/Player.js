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

export default class Player extends Entity {
	/**
	 * Returns cat configuration based on cat index.
	 * @param {number} catIndex - Index of selected cat (0-3)
	 * @returns {Object} Configuration with weight, size, and jumpStrength
	 */
	static getCatConfig(catIndex) {
		const configs = [
			// Index 0: Light Cat - rises faster, easier to float but harder to control
			{ weight: 0.8, size: 1.0, jumpStrength: -450 },
			// Index 1: Heavy Cat - falls faster, harder to keep up but more stable
			{ weight: 1.5, size: 1.0, jumpStrength: -350 },
			// Index 2: Big Cat - larger hitbox makes the game more challenging
			{ weight: 1.2, size: 1.3, jumpStrength: -400 },
			// Index 3: Small Cat - smaller hitbox, slightly easier to fit through gaps
			{ weight: 1.0, size: 0.8, jumpStrength: -400 },
		];

		// Default to first cat if index is out of range
		return configs[catIndex] || configs[0];
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

		// Load player sprites
		this.sprites = loadPlayerSprites(
			images.get(ImageName.Mario),
			smallSpriteConfig
		);

		// Animations
		this.animations = {
			idle: new Animation(this.sprites.idle, 0.1),
			fly: new Animation(this.sprites.jump, 0.1),
			hurt: new Animation(this.sprites.death, 0.1),
			fall: new Animation(this.sprites.fall, 0.1)
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
	}

	update(dt) {
		if (this.isDead) return;

		// Apply gravity with weight modifier
		this.velocity.y += this.gravity * this.weight * dt;
		this.position.y += this.velocity.y * dt;

		// Update idle float animation
		// When velocity is relatively small (near hovering), apply gentle float
		const isIdle = Math.abs(this.velocity.y) < 50; // Consider idle when moving slowly
		if (isIdle && !this.isHurt && !this.isDead) {
			this.floatTime += dt;
			// Gentle sine wave oscillation: amplitude of 2 pixels, period of ~2 seconds
			this.floatOffset = Math.sin(this.floatTime * Math.PI) * 2;
		} else {
			// Reset float when actively moving
			this.floatOffset = 0;
		}

		// Update balloon stretch animation
		// When rising (negative velocity), stretch vertically to simulate balloon effect
		if (this.velocity.y < 0 && !this.isDead && !this.isHurt) {
			// Calculate stretch based on upward velocity
			// Normalize velocity to 0-1 range (most negative = max stretch)
			// jumpStrength is negative, so we compare against it
			const normalizedVelocity = Math.abs(this.velocity.y) / Math.abs(this.jumpStrength);
			// Stretch from 1.0 (normal) to 1.15 (15% taller) based on velocity
			this.stretchScale = 1.0 + (normalizedVelocity * 0.15);
		} else {
			// Gradually return to normal when not rising
			this.stretchScale = 1.0 + (this.stretchScale - 1.0) * 0.8; // Decay factor
			if (Math.abs(this.stretchScale - 1.0) < 0.01) {
				this.stretchScale = 1.0; // Snap to normal when close enough
			}
		}

		// Update animation
		this.currentAnimation.update(dt);

		// Handle hurt timer and shake effect
		if (this.isHurt) {
			this.hurtTimer -= dt;
			
			// Calculate shake intensity based on remaining hurt time (stronger at start, decays)
			const shakeIntensity = this.hurtTimer / 1.0; // Normalize to 0-1, decays as timer decreases
			const maxShake = 3; // Maximum shake distance in pixels
			
			// Apply random shake that decays over time
			this.shakeOffset.x = (Math.random() - 0.5) * 2 * maxShake * shakeIntensity;
			this.shakeOffset.y = (Math.random() - 0.5) * 2 * maxShake * shakeIntensity;
			
			if (this.hurtTimer <= 0) {
				this.isHurt = false;
				this.shakeOffset.x = 0;
				this.shakeOffset.y = 0;
				this.currentAnimation = this.animations.fly;
			}
		} else {
			// Reset shake when not hurt
			this.shakeOffset.x = 0;
			this.shakeOffset.y = 0;
			// Switch animations based on state
			if (this.velocity.y < 0) {
				this.currentAnimation = this.animations.fly;
			} else if (isIdle) {
				// Use idle animation when floating gently
				this.currentAnimation = this.animations.idle;
			} else {
				this.currentAnimation = this.animations.fall;
			}
		}
	}

	render(context) {
		const frame = this.currentAnimation.getCurrentFrame();

		context.save();
		
		// Calculate base render position with offsets (before any scaling)
		const baseX = this.position.x + this.shakeOffset.x;
		const baseY = this.position.y + this.floatOffset + this.shakeOffset.y;
		
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
		
		// Translate back and adjust for frame rendering
		context.translate(-frameWidth / 2, -frameHeight / 2);

		// Flash if hurt or invincible
		if ((this.isHurt || this.isInvincible) && Math.floor(Date.now() / 100) % 2 === 0) {
			context.globalAlpha = 0.5;
		}

		// Render the frame at origin (0, 0) since we've already translated
		frame.render(0, 0);
		context.restore();
	}

	flap() {
		if (this.isDead) return;
		this.velocity.y = this.jumpStrength;
		sounds.play(SoundName.Jump);
		this.currentAnimation = this.animations.fly;
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

	applyPowerUp(powerUp) {
		powerUp.apply(this);
	}
}


