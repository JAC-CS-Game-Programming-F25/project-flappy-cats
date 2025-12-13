import PowerUp from './PowerUp.js';
import Sprite from '../../lib/Sprite.js';
import { images } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import { smallSpriteConfig } from '../../config/SpriteConfig.js';
import Pipe from './Pipe.js';

/**
 * SlowPowerUp - Temporarily slows down pipe movement speed.
 * 
 * INHERITANCE: This class demonstrates inheritance by extending PowerUp.
 * SlowPowerUp inherits all properties and methods from PowerUp:
 * - Entity properties (position, dimensions, velocity) via PowerUp -> Entity
 * - PowerUp properties (duration, isCollected, sprite)
 * - PowerUp methods (update, render, collidesWith, collect)
 * 
 * This creates a multi-level inheritance hierarchy:
 * Entity -> PowerUp -> SlowPowerUp
 * 
 * POLYMORPHISM: This class demonstrates polymorphism by overriding the
 * apply() method from the PowerUp base class. When a Player instance calls
 * powerUp.apply(player), JavaScript's dynamic dispatch ensures that this
 * SlowPowerUp-specific implementation is called, not the base class version.
 * The Player class doesn't need to know it's dealing with a SlowPowerUp -
 * it just calls apply() on the PowerUp interface.
 * 
 * Additionally, this class implements a remove() method that is called
 * polymorphically when the power-up expires (see Player.updatePowerUp()).
 */
export default class SlowPowerUp extends PowerUp {
    // Store original pipe speed (only set once, on first application)
    static originalSpeed = null;

    constructor(x, y) {
        // INHERITANCE: Call parent constructor using super() to initialize
        // PowerUp properties (which in turn initializes Entity properties)
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

    /**
     * POLYMORPHISM: This method overrides the apply() method from the PowerUp
     * base class. When Player.applyPowerUp() calls powerUp.apply(this), and
     * powerUp is a SlowPowerUp instance, THIS implementation is called
     * (not the base class version). This is runtime polymorphism - the correct
     * method is selected based on the actual object type.
     * 
     * This implementation slows down the global pipe speed, which affects
     * all pipes, stars, hearts, and other entities that use Pipe.SPEED.
     * 
     * @param {Player} player - The player (not directly used, but required by interface)
     */
    apply(player) {
        // Store original speed if not already stored
        if (SlowPowerUp.originalSpeed === null) {
            SlowPowerUp.originalSpeed = Pipe.SPEED;
        }

        // Slow down pipes to half speed
        Pipe.SPEED = SlowPowerUp.originalSpeed / 2;
    }

    /**
     * POLYMORPHISM: This method is called polymorphically from Player.updatePowerUp()
     * when the power-up timer expires. The Player class calls powerUp.remove(this)
     * without knowing the specific PowerUp subclass type. This SlowPowerUp
     * implementation restores the original pipe speed.
     * 
     * @param {Player} player - The player (not directly used, but required by interface)
     */
    remove(player) {
        // Restore original pipe speed
        if (SlowPowerUp.originalSpeed !== null) {
            Pipe.SPEED = SlowPowerUp.originalSpeed;
        }
    }
}
