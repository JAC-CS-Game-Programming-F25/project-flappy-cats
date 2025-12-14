import PowerUp from './PowerUp.js';
import Sprite from '../../lib/Sprite.js';
import { images } from '../globals.js';
import ImageName from '../enums/ImageName.js';

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
    // Shield sprite coordinates in PowerPipes.png
    static SHIELD_SPRITESHEET_X = 616;        // X coordinate
    static SHIELD_SPRITESHEET_Y = 0;          // Y coordinate
    static SHIELD_SPRITESHEET_WIDTH = 684;    // Width
    static SHIELD_SPRITESHEET_HEIGHT = 804;   // Height
    
    static WIDTH = 24;   // Game width for shield
    static HEIGHT = 28;  // Game height for shield
    
    static SHIELD_SCALE = 24 / 684;  // Scale factor

    constructor(x, y) {
        // INHERITANCE: Call parent constructor using super() to initialize
        // PowerUp properties (which in turn initializes Entity properties)
        super(x, y, 5); // 5 seconds duration
        
        // Override dimensions to use shield size instead of base PowerUp size
        this.dimensions.x = InvinciblePowerUp.WIDTH;
        this.dimensions.y = InvinciblePowerUp.HEIGHT;

        // Get the PowerPipes spritesheet image and extract the shield sprite
        const powerPipesSheet = images.get(ImageName.PowerPipes);
        
        // Create sprite
        this.sprite = powerPipesSheet ? new Sprite(
            powerPipesSheet,
            InvinciblePowerUp.SHIELD_SPRITESHEET_X,
            InvinciblePowerUp.SHIELD_SPRITESHEET_Y,
            InvinciblePowerUp.SHIELD_SPRITESHEET_WIDTH,
            InvinciblePowerUp.SHIELD_SPRITESHEET_HEIGHT
        ) : null;
    }

    /**
     * Override render method to scale the shield sprite to game size
     */
    render(context) {
        if (this.isCollected || !this.sprite) return;
        
        // Render the shield sprite scaled down to game size
        this.sprite.render(this.position.x, this.position.y, { 
            x: InvinciblePowerUp.SHIELD_SCALE, 
            y: InvinciblePowerUp.SHIELD_SCALE 
        });
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
