import Entity from './Entity.js';
import { images } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import Sprite from '../../lib/Sprite.js';

export default class Pipe extends Entity {
    static WIDTH = 32;
    static SPEED = 100;
    static IMAGE_HEIGHT = 320;

    constructor(x, y, isTop) {
        // If top, y is the bottom of the top pipe
        // If bottom, y is the top of the bottom pipe
        super(x, y, Pipe.WIDTH, Pipe.IMAGE_HEIGHT);
        this.isTop = isTop;

        // Use Sprite to crop the image
        // Assuming the pipe is at 0,0 and is 32x320
        this.sprite = new Sprite(
            images.get(ImageName.Pipes),
            0, 0,
            Pipe.WIDTH, Pipe.IMAGE_HEIGHT
        );
    }

    update(dt) {
        // Position updated by PipePair
    }

    render(context) {
        context.save();
        if (this.isTop) {
            // Draw top pipe (flipped)
            // Translate to the bottom of the top pipe (which is this.position.y)
            context.translate(this.position.x, this.position.y);
            context.scale(1, -1);
            this.sprite.render(0, 0);
        } else {
            // Draw bottom pipe
            this.sprite.render(this.position.x, this.position.y);
        }
        context.restore();
    }

    collidesWith(player) {
        const playerLeft = player.position.x;
        const playerRight = player.position.x + player.dimensions.x;
        const playerTop = player.position.y;
        const playerBottom = player.position.y + player.dimensions.y;

        const pipeLeft = this.position.x;
        const pipeRight = this.position.x + Pipe.WIDTH;

        // Horizontal overlap
        if (playerRight > pipeLeft && playerLeft < pipeRight) {
            if (this.isTop) {
                // Top pipe collision: player top < pipe bottom (y)
                // Wait, this.position.y for top pipe is the BOTTOM of the pipe.
                // So if playerTop < this.position.y, collision?
                // Actually, the pipe extends UPWARDS from this.position.y.
                // So collision is if playerTop < this.position.y
                if (playerTop < this.position.y) return true;
            } else {
                // Bottom pipe collision: player bottom > pipe top (y)
                if (playerBottom > this.position.y) return true;
            }
        }

        return false;
    }
}
