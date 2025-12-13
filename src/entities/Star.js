import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import Animation from '../../lib/Animation.js';
import { sounds } from '../globals.js';
import SoundName from '../enums/SoundName.js';
import { isAABBCollision } from '../../lib/Collision.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';
import Pipe from './Pipe.js';

export default class Star extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;

    constructor(x, y, spriteSheet) {
        super(x, y, Star.WIDTH, Star.HEIGHT);

        this.isCollected = false; // Track if star has been collected by player

        // Create sparkle animation from all sparkle frames
        const sparkleSprites = smallSpriteConfig.sparkles.map(frame =>
            new Sprite(
                spriteSheet,
                frame.x,
                frame.y,
                frame.width,
                frame.height
            )
        );

        // Create animation with 0.15 second interval between frames
        this.sparkleAnimation = new Animation(sparkleSprites, 0.15);
    }

    update(dt) {
        if (this.isCollected) return; // Don't update if already collected

        this.position.x -= Pipe.SPEED * dt; // Move left with pipes to stay synchronized

        // Update sparkle animation
        this.sparkleAnimation.update(dt);
    }

    render(context) {
        if (this.isCollected) return;
        
        // Render current frame of sparkle animation
        const frame = this.sparkleAnimation.getCurrentFrame();
        frame.render(this.position.x, this.position.y);
    }

    collect(player) {
        if (!this.isCollected) {
            this.isCollected = true; // Mark as collected to prevent double collection
            sounds.play(SoundName.Coin); // Play collection sound effect
            player.collectStar(); // Increment player's star count
        }
    }

    collidesWith(entity) {
        if (this.isCollected) return false;

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