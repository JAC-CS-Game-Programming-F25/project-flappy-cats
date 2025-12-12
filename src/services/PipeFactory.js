import PipePair from '../entities/PipePair.js';
import { canvas } from '../globals.js';

export default class PipeFactory {
    spawn() {
        return new PipePair(canvas.width);
    }
}
