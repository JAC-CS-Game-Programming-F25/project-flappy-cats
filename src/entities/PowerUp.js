import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { images, sounds } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import SoundName from '../enums/SoundName.js';
import Pipe from './Pipe.js';

/**
 * PowerUp - Base class for all power-up entities.
 * 
 * INHERITANCE: This class demonstrates inheritance by extending the Entity class.
 * PowerUp inherits all properties and methods from Entity (position, dimensions,
 * velocity, update, render, collidesWith, etc.) and adds power-up-specific
 * functionality (duration, collection status, apply method).
 * 
 * This is a parent/base class that will be extended by specific power-up types
 * such as InvinciblePowerUp and SlowPowerUp. This creates a class hierarchy:
 * Entity -> PowerUp -> InvinciblePowerUp / SlowPowerUp
 * 
 * POLYMORPHISM: The apply() method is designed to be overridden by subclasses,
 * enabling polymorphic behavior. When Player.applyPowerUp() is called with any
 * PowerUp subclass instance, it can call powerUp.apply() without knowing the
 * specific subclass type. The correct implementation (InvinciblePowerUp.apply()
 * or SlowPowerUp.apply()) will be called based on the actual object type.
 */
export default class PowerUp extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;

    constructor(x, y, duration) {
        // INHERITANCE: Call parent constructor using super() to initialize
        // Entity properties (position, dimensions, velocity)
        super(x, y, PowerUp.WIDTH, PowerUp.HEIGHT);
        this.duration = duration;
        this.isCollected = false;

        // Default sprite (can be overridden by subclasses)
        this.sprite = null;
    }

    update(dt) {
        this.position.x -= Pipe.SPEED * dt; // Move with pipes
    }

    render(context) {
        if (this.isCollected || !this.sprite) return;
        this.sprite.render(this.position.x, this.position.y);
    }

    collidesWith(player) {
        if (this.isCollected) return false;
        // INHERITANCE: Use super to call parent class method
        return super.collidesWith(player);
    }

    collect(player) {
        this.isCollected = true;
        sounds.play(SoundName.Powerup);
        player.applyPowerUp(this);
    }

    /**
     * POLYMORPHISM: This method is intentionally left as a template/placeholder.
     * Subclasses (InvinciblePowerUp, SlowPowerUp) MUST override this method
     * with their specific implementation. This enables polymorphic behavior:
     * - When powerUp.apply(player) is called, JavaScript's dynamic dispatch
     *   will call the correct subclass's apply() method based on the actual
     *   object type at runtime.
     * - The Player class can treat all PowerUp instances the same way,
     *   calling apply() without knowing which specific subclass it is.
     * 
     * @param {Player} player - The player to apply the power-up effect to
     */
    apply(player) {
        // To be implemented by subclasses (polymorphic method)
    }
}
