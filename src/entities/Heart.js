import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { images, sounds } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import SoundName from '../enums/SoundName.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';
import Pipe from './Pipe.js';

export default class Heart extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;

    constructor(x, y) {
        super(x, y, Heart.WIDTH, Heart.HEIGHT);

        // Use "grow" (Mushroom) sprite as placeholder for Heart
        // grow: [{ x: 596, y: 258, width: 16, height: 32 }]
        // We'll just take the top 16x16 or resize
        const frame = smallSpriteConfig.grow[0];

        this.sprite = new Sprite(
            images.get(ImageName.Mario),
            frame.x,
            frame.y,
            frame.width,
            frame.height
        );

        this.isCollected = false;

        // Bounce animation properties
        this.animationTimer = 0;
        this.bounceOffset = 0;
    }

    update(dt) {
        if (this.isCollected) return; // Don't update if already collected

        this.position.x -= Pipe.SPEED * dt; // Move left with pipes to stay synchronized

        // Update bounce animation
        this.animationTimer += dt; // Accumulate time for animation
        // Bounce effect: sine wave with amplitude of 3 pixels, period of ~1 second
        this.bounceOffset = Math.sin(this.animationTimer * Math.PI * 2) * 3;
    }

    render(context) {
        if (this.isCollected) return;
        
        // Apply bounce offset to vertical position
        const renderY = this.position.y + this.bounceOffset;
        this.sprite.render(this.position.x, renderY);
    }

    collidesWith(player) {
        if (this.isCollected) return false;
        return super.collidesWith(player);
    }

    collect(player) {
        this.isCollected = true; // Mark as collected to prevent double collection
        sounds.play(SoundName.Powerup); // Play collection sound effect
        player.heal(1); // Restore 1 health point to player
    }
}
