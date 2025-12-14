import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { images, sounds } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import SoundName from '../enums/SoundName.js';
import Pipe from './Pipe.js';
import Player from './player/Player.js';

export default class Heart extends Entity {
    static HEART_SPRITESHEET_X = 5500;    // X coordinate
    static HEART_SPRITESHEET_Y = 5;       // Y coordinate
    static HEART_SPRITESHEET_WIDTH = 200; // Width: 5700 - 5500 = 200
    static HEART_SPRITESHEET_HEIGHT = 173;// Height: 178 - 5 = 173
    
    static WIDTH = 32;   // Game width for heart
    static HEIGHT = 28;  // Game height for heart
    
    // Scale factor to shrink the heart sprite from spritesheet to game size
    static HEART_SCALE = 32 / 200;  // Scale factor: 32/200 = 0.16 (updated for new width)

    constructor(x, y) {
        super(x, y, Heart.WIDTH, Heart.HEIGHT);

        // Get the spritesheet image and extract the heart sprite
        const spriteSheet = images.get(ImageName.SpriteSheet);
        
        // Create sprite from the heart coordinates in the spritesheet
        this.sprite = spriteSheet ? new Sprite(
            spriteSheet,
            Heart.HEART_SPRITESHEET_X,
            Heart.HEART_SPRITESHEET_Y,
            Heart.HEART_SPRITESHEET_WIDTH,
            Heart.HEART_SPRITESHEET_HEIGHT
        ) : null;

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
        if (this.isCollected || !this.sprite) return;
        
        // Apply bounce offset to vertical position
        const renderY = this.position.y + this.bounceOffset;
        
        // Render the heart sprite scaled down to game size
        this.sprite.render(this.position.x, renderY, { 
            x: Heart.HEART_SCALE, 
            y: Heart.HEART_SCALE 
        });
    }

    collidesWith(entity) {
        if (this.isCollected) return false;
        
        // Only collide with Player, not with pipes or other entities
        if (!(entity instanceof Player)) return false;
        
        return super.collidesWith(entity);
    }

    collect(player) {
        this.isCollected = true; // Mark as collected to prevent double collection
        sounds.play(SoundName.Powerup); // Play collection sound effect
        player.heal(1); // Restore 1 health point to player
    }
}
