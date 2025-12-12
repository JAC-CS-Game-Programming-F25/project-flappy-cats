import PowerUp from './PowerUp.js';
import Sprite from '../../lib/Sprite.js';
import { images } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';

export default class InvinciblePowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y, 5); // 5 seconds duration

        // Use Star sprite for Invincible
        // star: [{ x: 307, y: 3566, width: 8, height: 8 }] (Sparkles?)
        // Actually Star.js uses a sprite sheet. Let's use a frame from smallSpriteConfig if possible or just reuse Star logic?
        // The prompt says "Use separate sprite animations for sparkle or bounce".
        // I'll use a specific frame from Mario sprites.
        // Let's use the "victory" pose as a placeholder or just a colored block.
        // Actually, let's use the "Star" sprite if available in config.
        // I don't see "Star" in smallSpriteConfig.
        // I'll use "sparkles" frame 0.
        const frame = smallSpriteConfig.sparkles[0];

        this.sprite = new Sprite(
            images.get(ImageName.Mario),
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );
    }

    apply(player) {
        player.isInvincible = true;
        setTimeout(() => {
            player.isInvincible = false;
        }, this.duration * 1000);
    }
}
