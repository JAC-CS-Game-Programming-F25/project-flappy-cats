import PlayerState from "./PlayerState.js";
import Animation from "../../../lib/Animation.js";

/**
 * Handles player death animation when falling or colliding with an enemy.
 */
export default class PlayerDyingState extends PlayerState {
	constructor(player) {
		super(player);
		this.elapsed = 0;
		this.duration = 1.8; // time before respawn
		this.jumpVelocity = -250; 
		this.gravity = 800;
	}

	enter() {
		this.player.currentAnimation = new Animation(
			this.player.sprites.death
		);

		//stop horizontal motion
		this.player.velocity.x = 0;
		this.player.velocity.y = this.jumpVelocity;
	}

	update(dt) {
		this.elapsed += dt;

		this.player.velocity.y += this.gravity * dt;
		this.player.position.y += this.player.velocity.y * dt;

		//when off screen or time passed reset
		if (
			this.player.position.y >
				this.player.map.height * this.player.map.tileSize ||
			this.elapsed > this.duration
		) {
			this.player.die(true); //respawn to starting position
		}
	}

	render() {
		const frame = this.player.currentAnimation.getCurrentFrame();
		frame.render(
			Math.floor(this.player.position.x),
			Math.floor(this.player.position.y)
		);
	}
}
