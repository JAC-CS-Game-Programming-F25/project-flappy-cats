import PowerUp from './PowerUp.js';
import Sprite from '../../lib/Sprite.js';
import { images } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';
import Pipe from './Pipe.js';

export default class SlowPowerUp extends PowerUp {
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
        // Slow down pipes
        const originalSpeed = Pipe.SPEED;
        Pipe.SPEED = originalSpeed / 2;

        setTimeout(() => {
            Pipe.SPEED = originalSpeed;
        }, this.duration * 1000);
    }
}
