const SAVE_KEY = 'flappy-cats-save';
const HIGH_SCORE_KEY = 'flappy-cats-high-score';

export default class GameController {
    constructor() {
        this.resetAndCreateNewSession();
    }

    resetAndCreateNewSession() {
        // Preserve selectedCatIndex if it's already been set (don't reset to 0)
        const preservedCatIndex = this.selectedCatIndex !== undefined ? this.selectedCatIndex : 0;
        
        this.score = 0;
        //this.stars = 0;
        this.lives = 3;
        this.selectedCatIndex = preservedCatIndex; // Preserve selected cat index
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
            score: this.score, // Current game score
            stars: this.player?.stars || 0, // Player's collected stars (from player object)
            lives: this.lives, // Remaining lives
            selectedCatIndex: this.selectedCatIndex, // Which cat was selected
            activeState, // Current game state (Play, Pause, GameOver)
            timestamp: Date.now() // When the game was saved
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data)); // Save to browser storage
    }

    loadGameState() {
        const raw = localStorage.getItem(SAVE_KEY); // Get saved data from browser storage
        if (!raw) return null; // Return null if no save exists
        return JSON.parse(raw); // Parse JSON string back to object
    }

    restoreFromData(data) {
        this.score = data.score; // Restore saved score
        // this.stars = data.stars;
        // this.lives = data.lives;
        this.selectedCatIndex = data.selectedCatIndex; // Restore selected cat
        this.addScore(0); // Refresh high score UI without changing score
    }

    clearGameState() {
        localStorage.removeItem(SAVE_KEY);
    }
}
