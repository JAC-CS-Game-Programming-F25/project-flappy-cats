import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { sounds, images } from '../globals.js';
import SoundName from '../enums/SoundName.js';
import { isAABBCollision } from '../../lib/Collision.js';
import ImageName from '../enums/ImageName.js';
import Pipe from './Pipe.js';
import Player from './player/Player.js';

export default class Star extends Entity {
    // Star sprite coordinates in spritesheet.png
    static STAR_SPRITESHEET_X = 0;        // X coordinate
    static STAR_SPRITESHEET_Y = 0;         // Y coordinate
    static STAR_SPRITESHEET_WIDTH = 188;   // Width
    static STAR_SPRITESHEET_HEIGHT = 207;  // Height
    
    static WIDTH = 32;   // Game width for star
    static HEIGHT = 35;  // Game height for star
    
    static STAR_SCALE = 32 / 188;  // Scale factor

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

    update(dt) {
        if (this.isCollected) return; // Don't update if already collected

        this.position.x -= Pipe.SPEED * dt; // Move left with pipes to stay synchronized
    }

    render(context) {
        if (this.isCollected || !this.sprite) return;
        
        // Render the star sprite scaled down to game size
        this.sprite.render(this.position.x, this.position.y, { 
            x: Star.STAR_SCALE, 
            y: Star.STAR_SCALE 
        });
    }

    collect(player) {
        if (!this.isCollected) {
            this.isCollected = true; // Mark as collected to prevent double collection
            sounds.play(SoundName.Coin); // Play collection sound effect
            player.collectStar(); // Increment player's star count
        }
    }

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