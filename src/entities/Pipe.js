import Entity from './Entity.js';
import { images, canvas } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import Sprite from '../../lib/Sprite.js';

export default class Pipe extends Entity {
    static WIDTH = 32;   // Pipe width in game 
    static SPEED = 100;
    static IMAGE_HEIGHT = 320;
    
    // Scale factor to shrink the large sprites from PowerPipes.png down to game size
    // Original sprite width is 265px, we want 32px, so scale = 32/265
    static SPRITE_SCALE = 32 / 265;  // Scale factor to make pipes skinny
    
    // Crop the bottom edge to remove visible line
    static TOP_CAP_X = 1302;  // X coordinate of top cap 
    static TOP_CAP_Y = 0;   // Y coordinate of top cap
    static TOP_CAP_WIDTH = 265;  // Width: 1567 - 1302 = 265
    static TOP_CAP_HEIGHT = 260; // Height: reduced by 5px to crop bottom edge and remove visible line
    
    // Top cap for top pipes
    static TOP_PIPE_CAP_X = 0;            // X coordinate of top pipe cap
    static TOP_PIPE_CAP_Y = 765;          // Y coordinate of top pipe cap
    static TOP_PIPE_CAP_WIDTH = 262;      // Width: 262 - 0 = 262
    static TOP_PIPE_CAP_HEIGHT = 275;     // Height: reduced by 5px to crop bottom edge and remove visible line
    
    // Bottom cap for bottom pipes
    static BOTTOM_CAP_X = 1942;           // X coordinate of bottom cap
    static BOTTOM_CAP_Y = 0;              // Y coordinate of bottom cap
    static BOTTOM_CAP_WIDTH = 260;        // Width: 2202 - 1942 = 260
    static BOTTOM_CAP_HEIGHT = 265;       // Height: reduced by 5px to crop bottom edge and remove visible line
    
    // Middle segment for the pipe
    static MIDDLE_SEGMENT_X = 1942;       // X coordinate of middle segment
    static MIDDLE_SEGMENT_Y = 0;          // Y coordinate of middle segment
    static MIDDLE_SEGMENT_WIDTH = 260;    // Width: 2202 - 1942 = 260
    static MIDDLE_SEGMENT_HEIGHT = 265;   // Height: reduced by 5px to crop bottom edge and remove visible line

    constructor(x, y, isTop) {
        // If top, y is the bottom of the top pipe
        // If bottom, y is the top of the bottom pipe
        super(x, y, Pipe.WIDTH, Pipe.IMAGE_HEIGHT);
        this.isTop = isTop;

        // Get the PowerPipes spritesheet image
        const pipeSheet = images.get(ImageName.PowerPipes);
        
        if (!pipeSheet) {
            console.warn('PowerPipes spritesheet not found! Make sure ImageName.PowerPipes points to PowerPipes.png.');
        }

        // Create sprites for 3 types: top cap, middle segment, bottom cap
        
        // Top cap
        this.topCapSprite = pipeSheet ? new Sprite(
            pipeSheet,
            Pipe.TOP_CAP_X,
            Pipe.TOP_CAP_Y,
            Pipe.TOP_CAP_WIDTH,
            Pipe.TOP_CAP_HEIGHT
        ) : null;

        // Middle segment
        this.middleSegmentSprite = pipeSheet ? new Sprite(
            pipeSheet,
            Pipe.MIDDLE_SEGMENT_X,
            Pipe.MIDDLE_SEGMENT_Y,
            Pipe.MIDDLE_SEGMENT_WIDTH,
            Pipe.MIDDLE_SEGMENT_HEIGHT
        ) : null;

        // Top pipe cap for top pipes
        this.topPipeCapSprite = pipeSheet ? new Sprite(
            pipeSheet,
            Pipe.TOP_PIPE_CAP_X,
            Pipe.TOP_PIPE_CAP_Y,
            Pipe.TOP_PIPE_CAP_WIDTH,
            Pipe.TOP_PIPE_CAP_HEIGHT
        ) : null;
        
        // Bottom cap: For bottom pipes
        this.bottomCapSprite = pipeSheet ? new Sprite(
            pipeSheet,
            Pipe.BOTTOM_CAP_X,
            Pipe.BOTTOM_CAP_Y,
            Pipe.BOTTOM_CAP_WIDTH,
            Pipe.BOTTOM_CAP_HEIGHT
        ) : null;
    }

    update(dt) {
        // Position updated by PipePair
    }

    render(context) {
        // If sprites aren't loaded, don't render
        if (!this.topCapSprite || !this.middleSegmentSprite || !this.topPipeCapSprite || !this.bottomCapSprite) {
            return;
        }

        context.save();

        if (this.isTop) {
            // Draw top pipe (extends from top of screen down to the gap)
            // Start from Y=0 (top edge of screen) and extend down to the gap
            let currentY = 0; // Start from top edge of screen (Y=0)
            const pipeBottom = this.position.y; // End at the gap
            
            // Calculate scale for top pipe cap: 32 / 262 = ~0.122
            const topPipeCapScale = 32 / Pipe.TOP_PIPE_CAP_WIDTH;
            const scaledTopCapHeight = Pipe.TOP_PIPE_CAP_HEIGHT * topPipeCapScale;
            
            // Tile middle segments (purple) seamlessly from top edge (Y=0) with more overlap to eliminate gaps
            // Start the first segment exactly at Y=0 to ensure pipe starts from screen edge
            const scaledMiddleHeight = Pipe.MIDDLE_SEGMENT_HEIGHT * Pipe.SPRITE_SCALE;
            const overlapAmount = 3; // Overlap by 3 pixels to ensure no gaps
            
            // Draw first middle segment starting exactly at Y=0 (top edge of screen)
            this.middleSegmentSprite.render(this.position.x, currentY, { x: Pipe.SPRITE_SCALE, y: Pipe.SPRITE_SCALE });
            currentY += scaledMiddleHeight - overlapAmount;
            
            // Keep tiling from the very top (Y=0) until we reach the gap
            while (currentY + scaledMiddleHeight - overlapAmount < pipeBottom - scaledTopCapHeight) {
                this.middleSegmentSprite.render(this.position.x, currentY, { x: Pipe.SPRITE_SCALE, y: Pipe.SPRITE_SCALE });
                currentY += scaledMiddleHeight - overlapAmount;  // Overlap more to eliminate gaps
            }
            
            // Add one more middle segment to fill any remaining gap before the cap
            // This ensures there are no visible gaps
            if (currentY < pipeBottom - scaledTopCapHeight) {
                this.middleSegmentSprite.render(this.position.x, currentY, { x: Pipe.SPRITE_SCALE, y: Pipe.SPRITE_SCALE });
            }
            
            // Draw top pipe cap at the BOTTOM of the pipe (facing the gap)
            // Position it with more overlap on the last middle segment
            this.topPipeCapSprite.render(this.position.x, pipeBottom - scaledTopCapHeight, { x: topPipeCapScale, y: topPipeCapScale });
            
        } else {
            // Draw bottom pipe (extends from the gap down to bottom edge of screen)
            // Start at the gap and extend all the way to the bottom edge (canvas.height)
            let currentY = this.position.y; // Start at the gap
            const pipeBottom = canvas.height; // End at bottom edge of screen (Y=canvas.height)
            
            // Draw top cap right after the gap - scale it down to be skinny
            const scaledTopCapHeight = Pipe.TOP_CAP_HEIGHT * Pipe.SPRITE_SCALE;
            this.topCapSprite.render(this.position.x, currentY, { x: Pipe.SPRITE_SCALE, y: Pipe.SPRITE_SCALE });
            const overlapAmount = 5; // Overlap by 5 pixels to ensure no gaps
            currentY += scaledTopCapHeight - overlapAmount;  // Overlap more with next segment
            
            // Tile middle segments to make the pipe long
            const scaledMiddleHeight = Pipe.MIDDLE_SEGMENT_HEIGHT * Pipe.SPRITE_SCALE;
            const scaledBottomCapHeight = Pipe.BOTTOM_CAP_HEIGHT * Pipe.SPRITE_SCALE;
            // Keep tiling with more overlap until we reach where the bottom cap should start
            while (currentY + scaledMiddleHeight - overlapAmount < pipeBottom - scaledBottomCapHeight) {
                this.middleSegmentSprite.render(this.position.x, currentY, { x: Pipe.SPRITE_SCALE, y: Pipe.SPRITE_SCALE });
                currentY += scaledMiddleHeight - overlapAmount;  // Overlap more to eliminate gaps
            }
            
            // Add one more middle segment to fill any remaining gap before the bottom cap
            // This ensures there are no visible gaps
            if (currentY < pipeBottom - scaledBottomCapHeight) {
                this.middleSegmentSprite.render(this.position.x, currentY, { x: Pipe.SPRITE_SCALE, y: Pipe.SPRITE_SCALE });
            }
            
            // Draw bottom cap at the very bottom edge of screen
            // Position it so it reaches exactly to canvas.height (bottom edge)
            const bottomCapY = pipeBottom - scaledBottomCapHeight;
            this.bottomCapSprite.render(this.position.x, bottomCapY, { x: Pipe.SPRITE_SCALE, y: Pipe.SPRITE_SCALE });
        }

        context.restore();
    }

    collidesWith(player) {
        const playerLeft = player.position.x;
        const playerRight = player.position.x + player.dimensions.x;
        const playerTop = player.position.y;
        const playerBottom = player.position.y + player.dimensions.y;

        const pipeLeft = this.position.x;
        const pipeRight = this.position.x + Pipe.WIDTH;

        // Horizontal overlap
        if (playerRight > pipeLeft && playerLeft < pipeRight) {
            if (this.isTop) {
                // Top pipe collision: player top < pipe bottom (y)
                // Wait, this.position.y for top pipe is the BOTTOM of the pipe.
                // So if playerTop < this.position.y, collision?
                // Actually, the pipe extends UPWARDS from this.position.y.
                // So collision is if playerTop < this.position.y
                if (playerTop < this.position.y) return true;
            } else {
                // Bottom pipe collision: player bottom > pipe top (y)
                if (playerBottom > this.position.y) return true;
            }
        }

        return false;
    }
}
