import Heart from '../entities/Heart.js';
import { canvas } from '../globals.js';

export default class HeartFactory {
    spawn() {
        const x = canvas.width;
        const y = Math.random() * (canvas.height - 100) + 50;
        return new Heart(x, y);
    }
}
