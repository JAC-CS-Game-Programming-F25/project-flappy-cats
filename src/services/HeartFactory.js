import Heart from '../entities/Heart.js';
import { canvas } from '../globals.js';

/**
 * Factory class for creating Heart collectible entities.
 * Responsible for spawning hearts at random vertical positions.
 */
export default class HeartFactory {
    /**
     * Creates and returns a new Heart at the right edge of the screen with a random Y position.
     * @returns {Heart} A new heart collectible ready to move across the screen
     */
    spawn() {
        const x = canvas.width; // Spawn at right edge of screen
        const y = Math.random() * (canvas.height - 100) + 50; // Random Y position (avoid edges)
        return new Heart(x, y);
    }
}
