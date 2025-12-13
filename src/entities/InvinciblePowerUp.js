import PowerUp from './PowerUp.js';
import Sprite from '../../lib/Sprite.js';
import { images } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';

/**
 * InvinciblePowerUp - Grants temporary invincibility to the player.
 * 
 * INHERITANCE: This class demonstrates inheritance by extending PowerUp.
 * InvinciblePowerUp inherits all properties and methods from PowerUp:
 * - Entity properties (position, dimensions, velocity) via PowerUp -> Entity
 * - PowerUp properties (duration, isCollected, sprite)
 * - PowerUp methods (update, render, collidesWith, collect)
 * 
 * This creates a multi-level inheritance hierarchy:
 * Entity -> PowerUp -> InvinciblePowerUp
 * 
 * POLYMORPHISM: This class demonstrates polymorphism by overriding the
 * apply() method from the PowerUp base class. When a Player instance calls
 * powerUp.apply(player), JavaScript's dynamic dispatch ensures that this
 * InvinciblePowerUp-specific implementation is called, not the base class
 * version. The Player class doesn't need to know it's dealing with an
 * InvinciblePowerUp - it just calls apply() on the PowerUp interface.
 * 
 * Additionally, this class implements a remove() method that is called
 * polymorphically when the power-up expires (see Player.updatePowerUp()).
 */
export default class InvinciblePowerUp extends PowerUp {
    constructor(x, y) {
        // INHERITANCE: Call parent constructor using super() to initialize
        // PowerUp properties (which in turn initializes Entity properties)
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

    /**
     * POLYMORPHISM: This method overrides the apply() method from the PowerUp
     * base class. When Player.applyPowerUp() calls powerUp.apply(this), and
     * powerUp is an InvinciblePowerUp instance, THIS implementation is called
     * (not the base class version). This is runtime polymorphism - the correct
     * method is selected based on the actual object type.
     * 
     * @param {Player} player - The player to make invincible
     */
    apply(player) {
        player.isInvincible = true;
    }

    /**
     * POLYMORPHISM: This method is called polymorphically from Player.updatePowerUp()
     * when the power-up timer expires. The Player class calls powerUp.remove(this)
     * without knowing the specific PowerUp subclass type. This InvinciblePowerUp
     * implementation removes the invincibility effect.
     * 
     * @param {Player} player - The player to remove invincibility from
     */
    remove(player) {
        player.isInvincible = false;
    }
}
