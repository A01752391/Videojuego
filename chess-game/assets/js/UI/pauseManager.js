export class PauseManager {
    constructor(gameContext) {
        this.gameContext = gameContext;
        this.isPaused = false;
        this.pauseOverlay = document.getElementById('pause-overlay');
        this.resumeBtn = document.getElementById('resume-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.mainMenuBtn = document.getElementById('main-menu-btn');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // ESC key listener
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                this.togglePause();
            }
        });

        // Pause menu button listeners
        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', () => this.resume());
        }

        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => this.restart());
        }

        if (this.mainMenuBtn) {
            this.mainMenuBtn.addEventListener('click', () => this.goToMainMenu());
        }

        // Close pause menu when clicking outside
        if (this.pauseOverlay) {
            this.pauseOverlay.addEventListener('click', (event) => {
                if (event.target === this.pauseOverlay) {
                    this.resume();
                }
            });
        }
    }

    togglePause() {
        if (this.gameContext.gameOver) {
            return; // Don't allow pausing when game is over
        }

        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }

    pause() {
        if (this.gameContext.gameOver) return;
        
        this.isPaused = true;
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'flex';
        }
        
        // Store original message to restore later
        this.originalMessage = this.gameContext.messageElement.textContent;
        this.gameContext.messageElement.textContent = 'Juego pausado - Presiona ESC para continuar';
        
        // Disable board interactions
        this.disableBoardInteractions();
        
        console.log('Game paused');
    }

    resume() {
        this.isPaused = false;
        if (this.pauseOverlay) {
            this.pauseOverlay.style.display = 'none';
        }
        
        // Restore original message
        if (this.originalMessage) {
            this.gameContext.messageElement.textContent = this.originalMessage;
        }
        
        // Re-enable board interactions
        this.enableBoardInteractions();
        
        console.log('Game resumed');
    }    restart() {
        this.resume(); // Close pause menu first
        
        // Use the same confirmation dialog as the main reset button
        const shouldReset = confirm('¿Estás seguro de que quieres reiniciar el juego?');
        if (shouldReset) {
            // Use the existing reset game functionality from index.js
            if (this.gameContext.resetGame) {
                this.gameContext.resetGame(this.gameContext);
                if (this.gameContext.renderBoard) {
                    this.gameContext.renderBoard();
                }
            }
        }
    }

    goToMainMenu() {
        // Navigate to main menu
        window.location.href = 'index.html';
    }

    disableBoardInteractions() {
        // Add a CSS class to disable pointer events on the board
        if (this.gameContext.boardElement) {
            this.gameContext.boardElement.style.pointerEvents = 'none';
            this.gameContext.boardElement.style.opacity = '0.6';
        }
        
        // Disable power-up buttons
        const powerUpButtons = document.querySelectorAll('.powerup-button');
        powerUpButtons.forEach(button => {
            button.disabled = true;
            button.style.opacity = '0.6';
        });
    }

    enableBoardInteractions() {
        // Re-enable board interactions
        if (this.gameContext.boardElement) {
            this.gameContext.boardElement.style.pointerEvents = 'auto';
            this.gameContext.boardElement.style.opacity = '1';
        }
        
        // Re-enable power-up buttons
        const powerUpButtons = document.querySelectorAll('.powerup-button');
        powerUpButtons.forEach(button => {
            button.disabled = false;
            button.style.opacity = '1';
        });
    }

    // Method to check if game is currently paused
    get isGamePaused() {
        return this.isPaused;
    }
}