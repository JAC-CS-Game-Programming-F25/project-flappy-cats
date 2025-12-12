import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import Animation from '../../lib/Animation.js';
import { sounds } from '../globals.js';
import SoundName from '../enums/SoundName.js';
import { isAABBCollision } from '../../lib/Collision.js';

/**
 * Represents a coin in the game that can be collected by the player.
 * @extends Entity
 */
export default class Coin extends Entity {
	static WIDTH = 16;
	static HEIGHT = 16;
	
	//animation frames 
	static spinFrames = [5, 6, 7, 8];
	
	//stats for when the coin spawns from the blocks 
	static jumpVelocity = -300;
	static riseDuration = 0.25;
	static fallDuration = 0.25;
	static gravity = 800;

	constructor(x, y, spriteSheet, isSpawned = false) {
		super(x, y, Coin.WIDTH, Coin.HEIGHT);
		
		this.spriteSheet = spriteSheet;
		this.isSpawned = isSpawned;
		this.isCollected = false;
		this.spawnTimer = 0;

		this.sprites = Sprite.generateSpritesFromSpriteSheet(
			spriteSheet,
			Coin.WIDTH,
			Coin.HEIGHT
		);
		
		this.animation = new Animation(Coin.spinFrames, 0.1);
		
		if (isSpawned) {
			this.velocity.y = Coin.jumpVelocity;
		}
	}

	update(dt) {
		if (this.isCollected) {
			return;
		}

		this.animation.update(dt);

		if (this.isSpawned) {
			this.spawnTimer += dt;
			
			this.velocity.y += Coin.gravity * dt;
			this.position.y += this.velocity.y * dt;
			
			//mark as collected
			const totalDuration = Coin.riseDuration + Coin.fallDuration;
			if (this.spawnTimer >= totalDuration) {
				this.isCollected = true;
			}
		}
	}

	render() {

		if (this.isCollected) {
			return;
		}

		const frameIndex = this.animation.getCurrentFrame();

		this.sprites[frameIndex].render(
			
			Math.floor(this.position.x),
			Math.floor(this.position.y)
		);
	}

	collectCoin() {
		if (!this.isCollected) {

			this.isCollected = true;
			sounds.play(SoundName.Coin);
		}
	}

	didCollideWith(entity) {

		if (this.isCollected || this.isSpawned) {
			return false;
		}

		return isAABBCollision(
			this.position.x,
			this.position.y,
			this.dimensions.x,
			this.dimensions.y,
			entity.position.x,
			entity.position.y,
			entity.dimensions.x,
			entity.dimensions.y
		);
	}
}