import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { sounds } from '../globals.js';
import SoundName from '../enums/SoundName.js';
import { isAABBCollision } from '../../lib/Collision.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';

export default class Star extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;

    constructor(x, y, spriteSheet) {
        super(x, y, Star.WIDTH, Star.HEIGHT);

        this.isCollected = false;

        // Use sparkles (Star) sprite
        const frame = smallSpriteConfig.sparkles[0];
        this.sprite = new Sprite(
            spriteSheet,
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );

        this.animationTimer = 0;
    }

    update(dt) {
        if (this.isCollected) return;

        this.position.x -= 100 * dt; // Move with pipes

        this.animationTimer += dt;
    }

    render(context) {
        if (this.isCollected) return;
        this.sprite.render(this.position.x, this.position.y);
    }

    collect(player) {
        if (!this.isCollected) {
            this.isCollected = true;
            sounds.play(SoundName.Coin);
            player.collectStar();
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