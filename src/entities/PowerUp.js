import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { images, sounds } from '../globals.js';
import ImageName from '../enums/ImageName.js';
import SoundName from '../enums/SoundName.js';

export default class PowerUp extends Entity {
    static WIDTH = 16;
    static HEIGHT = 16;

    constructor(x, y, duration) {
        super(x, y, PowerUp.WIDTH, PowerUp.HEIGHT);
        this.duration = duration;
        this.isCollected = false;

        // Default sprite (can be overridden)
        this.sprite = null;
    }

    update(dt) {
        this.position.x -= 100 * dt; // Move with pipes
    }

    render(context) {
        if (this.isCollected || !this.sprite) return;
        this.sprite.render(this.position.x, this.position.y);
    }

    collidesWith(player) {
        if (this.isCollected) return false;
        return super.collidesWith(player);
    }

    collect(player) {
        this.isCollected = true;
        sounds.play(SoundName.Powerup);
        player.applyPowerUp(this);
    }

    apply(player) {
        // To be implemented by subclasses
    }
}
