import PipePair from '../entities/PipePair.js';
import { canvas } from '../globals.js';

/**
 * Factory class for creating PipePair entities.
 * Responsible for spawning pipe pairs at the right edge of the screen.
 */
export default class PipeFactory {
    /**
     * Creates and returns a new PipePair at the right edge of the screen.
     * @returns {PipePair} A new pipe pair ready to move across the screen
     */
    spawn() {
        return new PipePair(canvas.width); // Spawn at right edge of screen
    }
}
