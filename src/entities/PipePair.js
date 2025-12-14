import Entity from './Entity.js';
import Pipe from './Pipe.js';
import { canvas } from '../globals.js';
import Player from './player/Player.js';

/**
 * PipePair entity - represents a pair of pipes (top and bottom) with a gap between them.
 * The player must navigate through the gap to avoid collision.
 */
export default class PipePair extends Entity {
    static GAP_HEIGHT = 200; // Height of the gap between top and bottom pipes

    /**
     * Creates a new PipePair at the specified X position with a random gap position.
     * @param {number} x - X position where the pipe pair starts (typically canvas.width)
     */
    constructor(x) {
        super(x, 0, Pipe.WIDTH, canvas.height);

        this.gapHeight = PipePair.GAP_HEIGHT;
        this.pipes = [];
        this.isPassed = false;
        this.isDead = false;

        const gapY = Math.random() * (canvas.height - this.gapHeight - 100) + 50; // Random gap position

        // Top Pipe - extends from top of screen down to gapY
        this.pipes.push(new Pipe(x, gapY, true));
        // Bottom Pipe - extends from gapY + gapHeight down to bottom of screen
        this.pipes.push(new Pipe(x, gapY + this.gapHeight, false));
    }

    /**
     * Updates the pipe pair position (moves left across screen).
     * Marks as dead when off-screen.
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (this.position.x < -Pipe.WIDTH) {
            this.isDead = true;
        }

        this.position.x -= Pipe.SPEED * dt;
        this.pipes.forEach(pipe => {
            pipe.position.x = this.position.x;
            pipe.update(dt);
        });
    }

    /**
     * Renders both pipes in the pair.
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     */
    render(context) {
        this.pipes.forEach(pipe => pipe.render(context)); // Render each pipe in the pair
    }

    /**
     * Checks if this pipe pair collides with the given entity.
     * Only collides with Player entities.
     * @param {Entity} entity - The entity to check collision with
     * @returns {boolean} True if collision detected with either pipe, false otherwise
     */
    collidesWith(entity) {
        // Only collide with Player, not with collectibles or other entities
        if (!(entity instanceof Player)) return false;
        
        return this.pipes.some(pipe => pipe.collidesWith(entity)); // Check collision with either pipe
    }
}
