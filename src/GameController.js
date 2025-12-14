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

    saveGameState(activeState, playState = null) {
        const data = {
            score: this.score, // Current game score
            stars: this.player?.stars || 0, // Player's collected stars (from player object)
            lives: this.lives, // Remaining lives
            selectedCatIndex: this.selectedCatIndex, // Which cat was selected
            activeState, // Current game state (Play, Pause, GameOver)
            timestamp: Date.now(), // When the game was saved
        };

        // If PlayState is provided, save full game state
        if (playState && playState.player) {
            // Save player state
            data.player = {
                position: { x: playState.player.position.x, y: playState.player.position.y },
                velocity: { x: playState.player.velocity.x, y: playState.player.velocity.y },
                health: playState.player.health,
                stars: playState.player.stars,
                isDead: playState.player.isDead,
                isHurt: playState.player.isHurt,
                hurtTimer: playState.player.hurtTimer,
                isInvincible: playState.player.isInvincible,
                powerUpTimer: playState.player.powerUpTimer,
                activePowerUpType: playState.player.activePowerUp ? 
                    (playState.player.activePowerUp.constructor.name === 'InvinciblePowerUp' ? 'invincible' : 'slow') : null,
                catIndex: playState.player.catIndex
            };

            // Save pipes
            data.pipes = playState.pipes.map(pipePair => ({
                position: { x: pipePair.position.x, y: pipePair.position.y },
                gapY: pipePair.pipes[0] ? pipePair.pipes[0].position.y : 0, // Top pipe Y position = gap Y
                isPassed: pipePair.isPassed,
                isDead: pipePair.isDead
            }));

            // Save stars (only uncollected ones)
            data.stars = playState.stars
                .filter(star => !star.isCollected && star.position.x > -100) // Only save visible, uncollected stars
                .map(star => ({
                    position: { x: star.position.x, y: star.position.y }
                }));

            // Save hearts (only uncollected ones)
            data.hearts = playState.hearts
                .filter(heart => !heart.isCollected && heart.position.x > -100) // Only save visible, uncollected hearts
                .map(heart => ({
                    position: { x: heart.position.x, y: heart.position.y },
                    animationTimer: heart.animationTimer || 0
                }));

            // Save power-ups (only uncollected ones)
            data.powerUps = playState.powerUps
                .filter(powerUp => !powerUp.isCollected && powerUp.position.x > -100) // Only save visible, uncollected power-ups
                .map(powerUp => ({
                    position: { x: powerUp.position.x, y: powerUp.position.y },
                    type: powerUp.constructor.name === 'InvinciblePowerUp' ? 'invincible' : 'slow',
                    duration: powerUp.duration
                }));

            // Save spawn timers
            data.spawnTimers = {
                pipeSpawnTimer: playState.pipeSpawnTimer,
                starSpawnTimer: playState.starSpawnTimer,
                heartSpawnTimer: playState.heartSpawnTimer,
                powerUpSpawnTimer: playState.powerUpSpawnTimer
            };
        }

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

    /**
     * Saves the current UI state name (Title, CatSelect, Play, Pause, GameOver).
     * This allows the game to restore to the same screen on reload.
     * Preserves existing game state data if it exists.
     * @param {string} stateName - The name of the current state
     */
    saveCurrentState(stateName) {
        const existingData = this.loadGameState() || {};
        // Preserve all existing data, just update the activeState
        const data = {
            ...existingData,
            activeState: stateName,
            timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    }
}
