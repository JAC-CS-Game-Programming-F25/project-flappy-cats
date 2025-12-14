import InvinciblePowerUp from '../entities/InvinciblePowerUp.js';
import SlowPowerUp from '../entities/SlowPowerUp.js';
import { canvas } from '../globals.js';

/**
 * Factory class for creating PowerUp entities.
 * Randomly spawns either InvinciblePowerUp or SlowPowerUp.
 */
export default class PowerUpFactory {
    /**
     * Creates and returns a new PowerUp at the right edge of the screen with a random Y position.
     * Randomly chooses between InvinciblePowerUp and SlowPowerUp (50/50 chance).
     * @returns {PowerUp} A new power-up (either InvinciblePowerUp or SlowPowerUp) ready to move across the screen
     */
    spawn() {
        const x = canvas.width; // Spawn at right edge of screen
        const y = Math.random() * (canvas.height - 100) + 50; // Random Y position (avoid edges)

        // Randomly choose between InvinciblePowerUp and SlowPowerUp (50/50 chance)
        if (Math.random() < 0.5) {
            return new InvinciblePowerUp(x, y); // 50% chance: invincibility power-up
        } else {
            return new SlowPowerUp(x, y); // 50% chance: slow-motion power-up
        }
    }
}
