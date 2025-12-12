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
	}

	update(dt) {
		if (this.isDead) return;

		// Apply gravity with weight modifier
		this.velocity.y += this.gravity * this.weight * dt;
		this.position.y += this.velocity.y * dt;

		// Update animation
		this.currentAnimation.update(dt);

		// Handle hurt timer
		if (this.isHurt) {
			this.hurtTimer -= dt;
			if (this.hurtTimer <= 0) {
				this.isHurt = false;
				this.currentAnimation = this.animations.fly;
			}
		} else {
			// Switch animations based on state
			if (this.velocity.y < 0) {
				this.currentAnimation = this.animations.fly;
			} else {
				this.currentAnimation = this.animations.fall;
			}
		}
	}

	render(context) {
		const frame = this.currentAnimation.getCurrentFrame();

		context.save();
		// Apply size modifier
		if (this.size !== 1.0) {
			context.scale(this.size, this.size);
		}

		// Flash if hurt or invincible
		if ((this.isHurt || this.isInvincible) && Math.floor(Date.now() / 100) % 2 === 0) {
			context.globalAlpha = 0.5;
		}

		frame.render(this.position.x / this.size, this.position.y / this.size);
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


