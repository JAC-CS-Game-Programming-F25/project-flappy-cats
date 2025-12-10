const SAVE_KEY = 'flappy-cats-save';
const HIGH_SCORE_KEY = 'flappy-cats-high-score';

export default class GameController {
    constructor() {
        this.resetAndCreateNewSession();
    }

    resetAndCreateNewSession() {
        this.score = 0;
        //this.stars = 0;
        this.lives = 3;
        this.selectedCatIndex = 0;
        this.highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);

        this.player = null;
        this.pipes = [];
        //this.hearts = [];
        this.starsEntities = [];
        //this.powerUps = [];
        //this.activePowerUp = null;
        //this.remainingPowerUpTime = 0;
    }

    setSelectedCat(index) {
        this.selectedCatIndex = index;
    }

    addScore(amount) {
        this.score += amount;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(HIGH_SCORE_KEY, this.highScore);
        }
    }

    //addStar() { this.stars++; }
    loseLife() { this.lives = Math.max(0, this.lives - 1); }
    isGameOver() { return this.lives <= 0; }

    saveGameState(activeState) {
        const data = {
            score: this.score,
            stars: this.stars,
            lives: this.lives,
            selectedCatIndex: this.selectedCatIndex,
            activeState,
            timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }

    loadGameState() {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    }

    restoreFromData(data) {
        this.score = data.score;
        // this.stars = data.stars;
        // this.lives = data.lives;
        this.selectedCatIndex = data.selectedCatIndex;
        this.addScore(0); // refresh high score UI
    }

    clearGameState() {
        localStorage.removeItem(SAVE_KEY);
    }
}
