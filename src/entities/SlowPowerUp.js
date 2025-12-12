import PowerUp from './PowerUp.js';
import Sprite from '../../lib/Sprite.js';
import { images } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';
import Pipe from './Pipe.js';

export default class SlowPowerUp extends PowerUp {
    // Store original pipe speed (only set once, on first application)
    static originalSpeed = null;

    constructor(x, y) {
        super(x, y, 5); // 5 seconds duration

        // Use "dust" sprite as placeholder
        const frame = smallSpriteConfig.dust[0];

        this.sprite = new Sprite(
            images.get(ImageName.Mario),
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );
    }

    apply(player) {
        // Store original speed if not already stored
        if (SlowPowerUp.originalSpeed === null) {
            SlowPowerUp.originalSpeed = Pipe.SPEED;
        }

        // Slow down pipes to half speed
        Pipe.SPEED = SlowPowerUp.originalSpeed / 2;
    }

    remove(player) {
        // Restore original pipe speed
        if (SlowPowerUp.originalSpeed !== null) {
            Pipe.SPEED = SlowPowerUp.originalSpeed;
        }
    }
}
