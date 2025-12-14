import Star from '../entities/Star.js';
import { canvas } from '../globals.js';

/**
 * Factory class for creating Star collectible entities.
 * Responsible for spawning stars at random vertical positions.
 */
export default class StarFactory {
    /**
     * Creates and returns a new Star at the right edge of the screen with a random Y position.
     * @returns {Star} A new star collectible ready to move across the screen
     */
    spawn() {
        const x = canvas.width; // Spawn at right edge of screen
        const y = Math.random() * (canvas.height - 100) + 50; // Random Y position (avoid edges)
        return new Star(x, y);
    }
}
