import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { sounds, images } from '../globals.js';
import SoundName from '../enums/SoundName.js';
import { isAABBCollision } from '../../lib/Collision.js';
import ImageName from '../enums/ImageName.js';
import Pipe from './Pipe.js';
import Player from './player/Player.js';

/**
 * Star collectible entity - increases score and star count when collected.
 * Stars are coin-like collectibles that move across the screen.
 */
export default class Star extends Entity {
    // Star sprite coordinates in spritesheet.png
    static STAR_SPRITESHEET_X = 0;        // X coordinate
    static STAR_SPRITESHEET_Y = 0;         // Y coordinate
    static STAR_SPRITESHEET_WIDTH = 188;   // Width
    static STAR_SPRITESHEET_HEIGHT = 207;  // Height
    
    static WIDTH = 32;   // Game width for star
    static HEIGHT = 35;  // Game height for star
    
    static STAR_SCALE = 32 / 188;  // Scale factor

    /**
     * Creates a new Star collectible at the specified position.
     * @param {number} x - X position (typically canvas.width for spawning)
     * @param {number} y - Y position (random vertical position)
     */
    constructor(x, y) {
        super(x, y, Star.WIDTH, Star.HEIGHT);

        this.isCollected = false; // Track if star has been collected by player

        // Get the spritesheet image and extract the star sprite
        const spriteSheet = images.get(ImageName.SpriteSheet);
        
        // Create sprite from the star coordinates in the spritesheet
        this.sprite = spriteSheet ? new Sprite(
            spriteSheet,
            Star.STAR_SPRITESHEET_X,
            Star.STAR_SPRITESHEET_Y,
            Star.STAR_SPRITESHEET_WIDTH,
            Star.STAR_SPRITESHEET_HEIGHT
        ) : null;
    }

    /**
     * Updates the star's position (moves left across screen).
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        if (this.isCollected) return; // Don't update if already collected

        this.position.x -= Pipe.SPEED * dt; // Move left with pipes to stay synchronized
    }

    /**
     * Renders the star sprite.
     * @param {CanvasRenderingContext2D} context - The canvas rendering context
     */
    render(context) {
        if (this.isCollected || !this.sprite) return;
        
        // Render the star sprite scaled down to game size
        this.sprite.render(this.position.x, this.position.y, { 
            x: Star.STAR_SCALE, 
            y: Star.STAR_SCALE 
        });
    }

    /**
     * Handles collection of the star by the player.
     * Increments player's star count and plays sound effect.
     * @param {Player} player - The player that collected the star
     */
    collect(player) {
        if (!this.isCollected) {
            this.isCollected = true; // Mark as collected to prevent double collection
            sounds.play(SoundName.Coin); // Play collection sound effect
            player.collectStar(); // Increment player's star count
        }
    }

    /**
     * Checks if this star collides with the given entity (AABB collision detection).
     * Only collides with Player entities.
     * @param {Entity} entity - The entity to check collision with
     * @returns {boolean} True if collision detected, false otherwise
     */
    collidesWith(entity) {
        if (this.isCollected) return false;
        
        // Only collide with Player, not with pipes or other entities
        if (!(entity instanceof Player)) return false;

        return isAABBCollision(
            this.position.x,
            this.position.y,
            this.dimensions.x,
            this.dimensions.y,
            entity.position.x,
            entity.position.y,
            entity.dimensions.x,
            entity.dimensions.y
        );
    }
}