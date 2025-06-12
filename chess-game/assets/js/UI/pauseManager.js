export class PauseManager {
    constructor(gameContext) {
        this.gameContext = gameContext;
        this.isPaused = false;
        this.pauseOverlay = document.getElementById('pause-overlay');
        this.resumeBtn = document.getElementById('resume-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.mainMenuBtn = document.getElementById('main-menu-btn');
          // Audio control elements
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeDisplay = document.getElementById('volume-display');
        this.muteToggle = document.getElementById('mute-toggle');
        
        // Audio state
        this.isMuted = false;
        this.previousVolume = 25;
        
        this.initializeEventListeners();
        this.initializeAudioControls();
    }    initializeEventListeners() {
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

        // Audio control listeners
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (event) => this.handleVolumeChange(event));
        }

        if (this.muteToggle) {
            this.muteToggle.addEventListener('click', () => this.toggleMute());
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
    }    pause() {
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
        
        // Keep background music playing during pause (optional)
        // If you want to pause music during game pause, uncomment the next line:
        // this.pauseBackgroundMusic();
        
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
        
        // Resume background music if it was paused
        this.playBackgroundMusic();
        
        console.log('Game resumed');
    }restart() {
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
    }    enableBoardInteractions() {
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

    // Audio control methods
    initializeAudioControls() {
        // Get or create background music audio element
        this.backgroundMusic = document.getElementById('bg-music');
        
        if (!this.backgroundMusic) {
            // Create audio element if it doesn't exist
            this.backgroundMusic = document.createElement('audio');
            this.backgroundMusic.id = 'bg-music';
            this.backgroundMusic.src = '../Sonidos/musicaFondo.mp3';
            this.backgroundMusic.loop = true;
            this.backgroundMusic.autoplay = false;
            this.backgroundMusic.style.display = 'none';
            document.body.appendChild(this.backgroundMusic);
        }

        // Set initial volume
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = 0.25; // 25% default volume
        }

        // Load saved audio preferences
        this.loadAudioPreferences();
        
        // Try to play background music
        this.playBackgroundMusic();
    }

    handleVolumeChange(event) {
        const volume = parseInt(event.target.value);
        this.setVolume(volume);
    }

    setVolume(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = volume / 100;
        }
        
        // Update volume display
        if (this.volumeDisplay) {
            this.volumeDisplay.textContent = `${volume}%`;
        }
        
        // Update slider value
        if (this.volumeSlider) {
            this.volumeSlider.value = volume;
        }
        
        // Save preference
        this.saveAudioPreferences();
        
        // If volume is set above 0 and we were muted, unmute
        if (volume > 0 && this.isMuted) {
            this.isMuted = false;
            this.updateMuteUI();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            // Store current volume and mute
            this.previousVolume = parseInt(this.volumeSlider.value);
            this.setVolume(0);
        } else {
            // Restore previous volume
            this.setVolume(this.previousVolume);
        }
        
        this.updateMuteUI();
        this.saveAudioPreferences();
    }    updateMuteUI() {
        if (this.muteToggle) {
            const muteImg = this.muteToggle.querySelector('img');
            if (muteImg) {
                if (this.isMuted) {
                    // Change to muted state - could use a different image or add visual indicator
                    muteImg.style.opacity = '0.5';
                    muteImg.style.filter = 'grayscale(100%)';
                    this.muteToggle.classList.add('muted');
                } else {
                    // Normal state
                    muteImg.style.opacity = '1';
                    muteImg.style.filter = 'none';
                    this.muteToggle.classList.remove('muted');
                }
            }
        }
    }

    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.play().catch(error => {
                console.log('Could not play background music:', error);
            });
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    saveAudioPreferences() {
        const preferences = {
            volume: parseInt(this.volumeSlider?.value || 25),
            isMuted: this.isMuted,
            previousVolume: this.previousVolume
        };
        localStorage.setItem('chessAudioPreferences', JSON.stringify(preferences));
    }

    loadAudioPreferences() {
        try {
            const savedPrefs = localStorage.getItem('chessAudioPreferences');
            if (savedPrefs) {
                const preferences = JSON.parse(savedPrefs);
                this.isMuted = preferences.isMuted || false;
                this.previousVolume = preferences.previousVolume || 25;
                
                const volume = preferences.isMuted ? 0 : preferences.volume;
                this.setVolume(volume);
                this.updateMuteUI();
            }
        } catch (error) {
            console.log('Could not load audio preferences:', error);
        }
    }

    // Method to check if game is currently paused
    get isGamePaused() {
        return this.isPaused;
    }
}