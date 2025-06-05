// Round Statistics JavaScript
class RoundStatsManager {
    constructor() {
        this.roundData = null;
        this.gameState = null;
        this.initializeElements();
        this.setupEventListeners();
        this.loadRoundStats();
    }

    initializeElements() {
        // Header elements
        this.roundTitle = document.getElementById('roundTitle');
        
        // State elements
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.statsContent = document.getElementById('statsContent');
        this.actionButtons = document.getElementById('actionButtons');
        
        // Error handling
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Round result elements
        this.roundWinner = document.getElementById('roundWinner');
        this.winnerInfo = document.getElementById('winnerInfo');
        
        // Score elements
        this.whiteScore = document.getElementById('whiteScore');
        this.blackScore = document.getElementById('blackScore');
        this.whiteCaptured = document.getElementById('whiteCaptured');
        this.blackCaptured = document.getElementById('blackCaptured');
        this.whitePowerups = document.getElementById('whitePowerups');
        this.blackPowerups = document.getElementById('blackPowerups');
        this.whiteTurns = document.getElementById('whiteTurns');
        this.blackTurns = document.getElementById('blackTurns');
        
        // Performance stats elements
        this.whiteCaptureRatio = document.getElementById('whiteCaptureRatio');
        this.blackCaptureRatio = document.getElementById('blackCaptureRatio');
        this.whitePointsPerCapture = document.getElementById('whitePointsPerCapture');
        this.blackPointsPerCapture = document.getElementById('blackPointsPerCapture');
        this.whitePowerupRatio = document.getElementById('whitePowerupRatio');
        this.blackPowerupRatio = document.getElementById('blackPowerupRatio');
        this.whitePowerupEfficiency = document.getElementById('whitePowerupEfficiency');
        this.blackPowerupEfficiency = document.getElementById('blackPowerupEfficiency');
        
        // Series progress elements
        this.whiteWinsCircles = document.getElementById('whiteWinsCircles');
        this.blackWinsCircles = document.getElementById('blackWinsCircles');
        this.seriesStatus = document.getElementById('seriesStatus');
        
        // Action buttons
        this.nextRoundBtn = document.getElementById('nextRoundBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');
        this.backToGameBtn = document.getElementById('backToGameBtn');
    }

    setupEventListeners() {
        // Retry button
        this.retryBtn.addEventListener('click', () => {
            this.loadRoundStats();
        });

        // Action buttons
        this.nextRoundBtn.addEventListener('click', () => {
            this.nextRound();
        });

        this.newGameBtn.addEventListener('click', () => {
            this.newGame();
        });

        this.viewLeaderboardBtn.addEventListener('click', () => {
            window.location.href = '/assets/html/leaderboard.html';
        });

        this.backToGameBtn.addEventListener('click', () => {
            window.location.href = '/assets/html/game.html';
        });
    }

    showState(state) {
        // Hide all states
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'none';
        this.statsContent.style.display = 'none';
        this.actionButtons.style.display = 'none';

        // Show requested state
        switch (state) {
            case 'loading':
                this.loadingState.style.display = 'block';
                break;
            case 'error':
                this.errorState.style.display = 'block';
                break;
            case 'data':
                this.statsContent.style.display = 'block';
                this.actionButtons.style.display = 'flex';
                break;
        }
    }

    async loadRoundStats() {
        this.showState('loading');

        try {
            // Get round information from URL parameters or localStorage
            const urlParams = new URLSearchParams(window.location.search);
            const roundNumber = urlParams.get('round') || localStorage.getItem('currentRound') || '1';
            const winnerColor = urlParams.get('winner') || localStorage.getItem('roundWinner');
            const whiteScore = urlParams.get('whiteScore') || localStorage.getItem('whiteScore') || '0';
            const blackScore = urlParams.get('blackScore') || localStorage.getItem('blackScore') || '0';
            const winsWhite = urlParams.get('winsWhite') || localStorage.getItem('winsWhite') || '0';
            const winsBlack = urlParams.get('winsBlack') || localStorage.getItem('winsBlack') || '0';

            // Create mock round data (in a real implementation, this would come from the API)
            this.roundData = {
                roundNumber: parseInt(roundNumber),
                winner: winnerColor,
                whitePlayer: {
                    score: parseInt(whiteScore),
                    piezasCapturadas: Math.floor(parseInt(whiteScore) / 3), // Estimate based on score
                    powerupsUsados: Math.floor(parseInt(whiteScore) / 8), // Estimate
                    turnosJugados: 15 + Math.floor(Math.random() * 10) // Random estimate
                },
                blackPlayer: {
                    score: parseInt(blackScore),
                    piezasCapturadas: Math.floor(parseInt(blackScore) / 3),
                    powerupsUsados: Math.floor(parseInt(blackScore) / 8),
                    turnosJugados: 15 + Math.floor(Math.random() * 10)
                }
            };

            this.gameState = {
                winsWhite: parseInt(winsWhite),
                winsBlack: parseInt(winsBlack),
                round: parseInt(roundNumber)
            };

            // Optionally try to fetch real data from API
            await this.tryFetchRealData();

            this.renderRoundStats();
            this.showState('data');

        } catch (error) {
            console.error('Error loading round stats:', error);
            this.errorMessage.textContent = error.message;
            this.showState('error');
        }
    }

    async tryFetchRealData() {
        try {
            // Try to fetch round statistics from the API
            const response = await fetch('/api/rounds/stats');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data && result.data.length > 0) {
                    // Use the most recent round data
                    const latestRound = result.data[0];
                    this.updateDataFromAPI(latestRound);
                }
            }
        } catch (error) {
            console.log('Could not fetch real API data, using mock data');
        }
    }

    updateDataFromAPI(apiData) {
        // Update round data with real API data if available
        if (apiData) {
            this.roundData.whitePlayer.piezasCapturadas = apiData.piezasCapturadas || this.roundData.whitePlayer.piezasCapturadas;
            this.roundData.whitePlayer.powerupsUsados = apiData.powerupsUsados || this.roundData.whitePlayer.powerupsUsados;
            this.roundData.whitePlayer.turnosJugados = apiData.turnosJugados || this.roundData.whitePlayer.turnosJugados;
        }
    }

    renderRoundStats() {
        // Update header
        this.roundTitle.textContent = `Ronda ${this.roundData.roundNumber} Completada`;

        // Update winner announcement
        this.updateWinnerAnnouncement();

        // Update scores
        this.updateScores();

        // Update performance stats
        this.updatePerformanceStats();

        // Update series progress
        this.updateSeriesProgress();

        // Update action buttons
        this.updateActionButtons();
    }

    updateWinnerAnnouncement() {
        const winner = this.roundData.winner;
        if (winner === 'w' || winner === 'white' || winner === 'Blancas') {
            this.roundWinner.textContent = '🏆 ¡Las Blancas Ganan!';
            this.winnerInfo.innerHTML = `
                <div style="color: #1a1a1a; font-size: 1.1rem;">
                    Victoria decisiva con <strong>${this.roundData.whitePlayer.score}</strong> puntos
                </div>
            `;
        } else if (winner === 'b' || winner === 'black' || winner === 'Negras') {
            this.roundWinner.textContent = '🏆 ¡Las Negras Ganan!';
            this.winnerInfo.innerHTML = `
                <div style="color: #1a1a1a; font-size: 1.1rem;">
                    Victoria decisiva con <strong>${this.roundData.blackPlayer.score}</strong> puntos
                </div>
            `;
        } else {
            this.roundWinner.textContent = '🤝 Ronda Empatada';
            this.winnerInfo.innerHTML = `
                <div style="color: #1a1a1a; font-size: 1.1rem;">
                    Ambos jugadores con puntuaciones similares
                </div>
            `;
        }
    }

    updateScores() {
        // White player scores
        this.whiteScore.textContent = this.roundData.whitePlayer.score;
        this.whiteCaptured.textContent = this.roundData.whitePlayer.piezasCapturadas;
        this.whitePowerups.textContent = this.roundData.whitePlayer.powerupsUsados;
        this.whiteTurns.textContent = this.roundData.whitePlayer.turnosJugados;

        // Black player scores
        this.blackScore.textContent = this.roundData.blackPlayer.score;
        this.blackCaptured.textContent = this.roundData.blackPlayer.piezasCapturadas;
        this.blackPowerups.textContent = this.roundData.blackPlayer.powerupsUsados;
        this.blackTurns.textContent = this.roundData.blackPlayer.turnosJugados;

        // Highlight winner's score
        if (this.roundData.whitePlayer.score > this.roundData.blackPlayer.score) {
            document.querySelector('.white-player').classList.add('winner-highlight');
        } else if (this.roundData.blackPlayer.score > this.roundData.whitePlayer.score) {
            document.querySelector('.black-player').classList.add('winner-highlight');
        }
    }

    updatePerformanceStats() {
        const white = this.roundData.whitePlayer;
        const black = this.roundData.blackPlayer;

        // Calculate ratios
        const whiteCaptureRatio = white.turnosJugados > 0 ? (white.piezasCapturadas / white.turnosJugados).toFixed(2) : '0.00';
        const blackCaptureRatio = black.turnosJugados > 0 ? (black.piezasCapturadas / black.turnosJugados).toFixed(2) : '0.00';

        const whitePointsPerCapture = white.piezasCapturadas > 0 ? (white.score / white.piezasCapturadas).toFixed(1) : '0.0';
        const blackPointsPerCapture = black.piezasCapturadas > 0 ? (black.score / black.piezasCapturadas).toFixed(1) : '0.0';

        const whitePowerupRatio = white.turnosJugados > 0 ? (white.powerupsUsados / white.turnosJugados).toFixed(3) : '0.000';
        const blackPowerupRatio = black.turnosJugados > 0 ? (black.powerupsUsados / black.turnosJugados).toFixed(3) : '0.000';

        // PowerUp efficiency (mock calculation)
        const whitePowerupEfficiency = white.powerupsUsados > 0 ? Math.min(100, Math.round((white.score / (white.powerupsUsados * 5)) * 100)) : 0;
        const blackPowerupEfficiency = black.powerupsUsados > 0 ? Math.min(100, Math.round((black.score / (black.powerupsUsados * 5)) * 100)) : 0;

        // Update display
        this.whiteCaptureRatio.textContent = whiteCaptureRatio;
        this.blackCaptureRatio.textContent = blackCaptureRatio;
        this.whitePointsPerCapture.textContent = whitePointsPerCapture;
        this.blackPointsPerCapture.textContent = blackPointsPerCapture;
        this.whitePowerupRatio.textContent = whitePowerupRatio;
        this.blackPowerupRatio.textContent = blackPowerupRatio;
        this.whitePowerupEfficiency.textContent = `${whitePowerupEfficiency}%`;
        this.blackPowerupEfficiency.textContent = `${blackPowerupEfficiency}%`;

        // Update comparison bar widths
        this.updateComparisonBars();
    }

    updateComparisonBars() {
        const comparisons = [
            { white: parseFloat(this.whiteCaptureRatio.textContent), black: parseFloat(this.blackCaptureRatio.textContent) },
            { white: parseFloat(this.whitePointsPerCapture.textContent), black: parseFloat(this.blackPointsPerCapture.textContent) },
            { white: parseFloat(this.whitePowerupRatio.textContent), black: parseFloat(this.blackPowerupRatio.textContent) },
            { white: parseFloat(this.whitePowerupEfficiency.textContent), black: parseFloat(this.blackPowerupEfficiency.textContent) }
        ];

        const barPairs = document.querySelectorAll('.comparison-bar');
        
        barPairs.forEach((barPair, index) => {
            const whiteBars = barPair.querySelector('.white-bar');
            const blackBars = barPair.querySelector('.black-bar');
            const comparison = comparisons[index];
            
            if (comparison && whiteBars && blackBars) {
                const total = comparison.white + comparison.black;
                if (total > 0) {
                    const whitePercent = (comparison.white / total) * 100;
                    const blackPercent = (comparison.black / total) * 100;
                    
                    // Visual emphasis for better performance
                    if (comparison.white > comparison.black) {
                        whiteBars.style.opacity = '1';
                        blackBars.style.opacity = '0.7';
                    } else if (comparison.black > comparison.white) {
                        blackBars.style.opacity = '1';
                        whiteBars.style.opacity = '0.7';
                    } else {
                        whiteBars.style.opacity = '0.9';
                        blackBars.style.opacity = '0.9';
                    }
                }
            }
        });
    }    updateSeriesProgress() {
        // Create win circles for white player
        this.whiteWinsCircles.innerHTML = '';        for (let i = 0; i < 2; i++) {
            const circle = document.createElement('div');
            circle.className = `win-circle ${i < this.gameState.winsWhite ? 'won' : 'empty'}`;
            this.whiteWinsCircles.appendChild(circle);
        }

        // Create win circles for black player
        this.blackWinsCircles.innerHTML = '';        for (let i = 0; i < 2; i++) {
            const circle = document.createElement('div');
            circle.className = `win-circle ${i < this.gameState.winsBlack ? 'won' : 'empty'}`;
            this.blackWinsCircles.appendChild(circle);
        }        // Update series status
        const totalWins = this.gameState.winsWhite + this.gameState.winsBlack;
        if (this.gameState.winsWhite === 2 || this.gameState.winsBlack === 2) {
            this.seriesStatus.textContent = '🏆 ¡Serie Completada!';
        } else {
            this.seriesStatus.textContent = `Al mejor de 2 rondas (${this.gameState.winsWhite}-${this.gameState.winsBlack})`;
        }
    }

    updateActionButtons() {        // Determine which buttons to show
        const gameEnded = this.gameState.winsWhite === 2 || this.gameState.winsBlack === 2;

        if (gameEnded) {
            this.nextRoundBtn.style.display = 'none';
            this.newGameBtn.style.display = 'inline-flex';
        } else {
            this.nextRoundBtn.style.display = 'inline-flex';
            this.newGameBtn.style.display = 'none';
        }
    }

    nextRound() {
        // Store updated game state
        const newRound = this.gameState.round + 1;
        localStorage.setItem('currentRound', newRound.toString());
        
        // Navigate back to game for next round
        window.location.href = '/assets/html/game.html?nextRound=true';
    }

    newGame() {
        // Clear game state
        localStorage.removeItem('currentRound');
        localStorage.removeItem('roundWinner');
        localStorage.removeItem('whiteScore');
        localStorage.removeItem('blackScore');
        localStorage.removeItem('winsWhite');
        localStorage.removeItem('winsBlack');
        
        // Navigate to game for new game
        window.location.href = '/assets/html/game.html?newGame=true';
    }

    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString();
    }
}

// Initialize the round stats manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RoundStatsManager();
});
