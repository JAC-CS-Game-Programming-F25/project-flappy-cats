import InvinciblePowerUp from '../entities/InvinciblePowerUp.js';
import SlowPowerUp from '../entities/SlowPowerUp.js';
import { canvas } from '../globals.js';

export default class PowerUpFactory {
    spawn() {
        const x = canvas.width;
        const y = Math.random() * (canvas.height - 100) + 50;

        if (Math.random() < 0.5) {
            return new InvinciblePowerUp(x, y);
        } else {
            return new SlowPowerUp(x, y);
        }
    }
}
