import Entity from './Entity.js';
import Pipe from './Pipe.js';
import { canvas } from '../globals.js';

export default class PipePair extends Entity {
    static GAP_HEIGHT = 200;

    constructor(x) {
        super(x, 0, Pipe.WIDTH, canvas.height);

        this.gapHeight = PipePair.GAP_HEIGHT;
        this.pipes = [];
        this.isPassed = false;
        this.isDead = false;

        const gapY = Math.random() * (canvas.height - this.gapHeight - 100) + 50;

        // Top Pipe
        this.pipes.push(new Pipe(x, gapY, true));
        // Bottom Pipe
        this.pipes.push(new Pipe(x, gapY + this.gapHeight, false));
    }

    update(dt) {
        if (this.position.x < -Pipe.WIDTH) {
            this.isDead = true;
        }

        this.position.x -= Pipe.SPEED * dt;
        this.pipes.forEach(pipe => {
            pipe.position.x = this.position.x;
            pipe.update(dt);
        });
    }

    render(context) {
        this.pipes.forEach(pipe => pipe.render(context));
    }

    collidesWith(player) {
        return this.pipes.some(pipe => pipe.collidesWith(player));
    }
}
