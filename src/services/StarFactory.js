import Star from '../entities/Star.js';
import { canvas, images } from '../globals.js';
import ImageName from '../enums/ImageName.js';

export default class StarFactory {
    spawn() {
        const x = canvas.width;
        const y = Math.random() * (canvas.height - 100) + 50;
        return new Star(x, y, images.get(ImageName.Mario));
    }
}
