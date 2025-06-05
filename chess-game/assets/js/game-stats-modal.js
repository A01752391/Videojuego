/**
 * Game Statistics Modal Manager
 * Handles the display of game statistics in a popup modal (aggregated from all rounds)
 */
class GameStatsModal {
    constructor() {
        this.modal = null;
        this.currentGameData = null;
        this.isVisible = false;
        
        // Bind methods
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        
        // Create modal on initialization
        this.createModal();
        this.attachEventListeners();
    }

    /**
     * Creates the modal HTML structure and injects it into the page
     */
    createModal() {
        // Remove existing modal if it exists
        const existingModal = document.getElementById('gameStatsModal');
        if (existingModal) {
            existingModal.remove();
        }        // Create modal HTML
        const modalHTML = `
            <div id="gameStatsModal" class="game-stats-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1>ESTADÍSTICAS DE PARTIDA</h1>
                        <p id="gameTitle">Partida Completada</p>
                    </div>

                    <!-- Loading State -->
                    <div id="gameModalLoadingState" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Procesando estadísticas de la partida...</p>
                    </div>

                    <!-- Error State -->
                    <div id="gameModalErrorState" class="error-state" style="display: none;">
                        <div class="error-icon">!</div>
                        <h3>Error al procesar estadísticas</h3>
                        <p id="gameModalErrorMessage">No se pudieron procesar las estadísticas de la partida.</p>
                    </div>                    <!-- Main Content -->
                    <div id="gameModalStatsContent" class="modal-stats-content" style="display: none;">
                        <!-- Game Summary -->
                        <div class="game-summary">                            <div class="winner-announcement">
                                <div class="trophy-section">
                                    <h2 id="gameWinner" class="winner-title">¡Partida Completada!</h2>
                                </div>
                                <div class="winner-details">
                                    <div class="winner-display">
                                        <img id="gameWinnerIcon" class="winner-icon" src="" alt="Ganador">
                                        <div class="winner-info">
                                            <span id="gameWinnerName" class="winner-name">Ganador</span>
                                            <span id="gameWinnerTitle" class="winner-subtitle">Campeón de la Partida</span>
                                            <div id="gameWinnerStats" class="winner-quick-stats">
                                                <span id="winnerRoundsWon" class="stat-highlight">2 Rondas Ganadas</span>
                                                <span id="winnerTotalScore" class="stat-highlight">0 Puntos Totales</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="series-result">
                                        <div class="series-score">
                                            <div class="score-display">
                                                <span id="whiteSeriesScore" class="white-score">0</span>
                                                <span class="score-separator">-</span>
                                                <span id="blackSeriesScore" class="black-score">0</span>
                                            </div>
                                            <div class="series-label">Resultado Final</div>
                                        </div>
                                    </div>
                                </div>
                            </div>                            <div class="game-info-details">
                                <div class="game-details">
                                    <div class="detail-item">
                                        <span class="detail-label">Duración:</span>
                                        <span id="gameDuration" class="detail-value">--:--</span>
                                    </div>
                                    <div class="detail-item">
                                        <span class="detail-label">Rondas jugadas:</span>
                                        <span id="totalRounds" class="detail-value">0</span>
                                    </div>                                    <div class="detail-item">
                                        <span class="detail-label">Fecha:</span>
                                        <span id="gameDate" class="detail-value">--</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Aggregate Scores -->
                        <div class="aggregate-scores">
                            <h3>Puntuaciones Totales</h3>
                            <div class="scores-grid">
                                <div id="gameWhitePlayer" class="player-score">
                                    <div class="player-header">
                                        <img src="/images/whitelogo.png" alt="Blancas" class="player-icon">
                                        <span class="player-name">Jugador Blancas</span>
                                    </div>
                                    <div class="score-details">
                                        <div class="main-score" id="gameWhiteScore">0</div>
                                        <div class="score-breakdown">
                                            <div>Total piezas capturadas: <span id="gameWhiteCaptured">0</span></div>
                                            <div>Total PowerUps usados: <span id="gameWhitePowerups">0</span></div>
                                            <div>Total turnos jugados: <span id="gameWhiteTurns">0</span></div>
                                            <div>Rondas ganadas: <span id="gameWhiteWins">0</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="vs-divider">VS</div>

                                <div id="gameBlackPlayer" class="player-score">
                                    <div class="player-header">
                                        <img src="/images/blacklogo.png" alt="Negras" class="player-icon">
                                        <span class="player-name">Jugador Negras</span>
                                    </div>
                                    <div class="score-details">
                                        <div class="main-score" id="gameBlackScore">0</div>
                                        <div class="score-breakdown">
                                            <div>Total piezas capturadas: <span id="gameBlackCaptured">0</span></div>
                                            <div>Total PowerUps usados: <span id="gameBlackPowerups">0</span></div>
                                            <div>Total turnos jugados: <span id="gameBlackTurns">0</span></div>
                                            <div>Rondas ganadas: <span id="gameBlackWins">0</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Game Performance Statistics -->
                        <div class="game-performance-stats">
                            <h3>Análisis de Rendimiento Global</h3>
                            <div class="stats-grid">
                                <div class="stat-category">
                                    <h4>Eficiencia Promedio</h4>
                                    <div class="stat-item">
                                        <span class="stat-label">Promedio Captura/Turno</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="gameWhiteCaptureBar">
                                                <span id="gameWhiteCaptureRatio">0.0</span>
                                            </div>
                                            <div class="black-bar" id="gameBlackCaptureBar">
                                                <span id="gameBlackCaptureRatio">0.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Promedio Puntos/Captura</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="gameWhitePointsBar">
                                                <span id="gameWhitePointsPerCapture">0.0</span>
                                            </div>
                                            <div class="black-bar" id="gameBlackPointsBar">
                                                <span id="gameBlackPointsPerCapture">0.0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="stat-category">
                                    <h4>Uso de PowerUps</h4>
                                    <div class="stat-item">
                                        <span class="stat-label">PowerUps por Turno</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="gameWhitePowerupBar">
                                                <span id="gameWhitePowerupRatio">0.0</span>
                                            </div>
                                            <div class="black-bar" id="gameBlackPowerupBar">
                                                <span id="gameBlackPowerupRatio">0.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Efectividad PowerUp</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="gameWhiteEfficiencyBar">
                                                <span id="gameWhitePowerupEfficiency">0%</span>
                                            </div>
                                            <div class="black-bar" id="gameBlackEfficiencyBar">
                                                <span id="gameBlackPowerupEfficiency">0%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PowerUps Most Used -->
                        <div class="powerups-analysis">
                            <h3>Análisis de PowerUps</h3>
                            <div class="powerups-grid">
                                <div class="powerup-stats">
                                    <h4>PowerUps Más Usados</h4>
                                    <div id="topPowerups" class="powerup-list">
                                        <!-- PowerUps will be populated here -->
                                    </div>
                                </div>
                                <div class="powerup-stats">
                                    <h4>Distribución de Uso</h4>
                                    <div class="usage-chart" id="powerupChart">
                                        <!-- Usage chart will be populated here -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Round by Round Progress -->
                        <div class="rounds-progress">
                            <h3>Progreso por Rondas</h3>
                            <div class="rounds-timeline" id="roundsTimeline">
                                <!-- Rounds timeline will be populated here -->
                            </div>
                        </div>
                    </div>                    <!-- Action Buttons -->
                    <div id="gameModalActionButtons" class="modal-actions" style="display: none;">
                        <button id="gameModalNewGameBtn" class="modal-btn modal-btn-image">
                            <img src="/images/newgamebutton.png" alt="Nueva Partida" class="button-image">
                        </button>
                        <button id="gameModalViewLeaderboardBtn" class="modal-btn modal-btn-image">
                            <img src="/images/leaderboardbuttonmainmenu.png" alt="Ver Ranking" class="button-image">
                        </button>
                        <button id="gameModalMainMenuBtn" class="modal-btn modal-btn-image">
                            <img src="/images/Photoroom_20250604_174552.png" alt="Menú Principal" class="button-image">
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Inject modal into body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('gameStatsModal');
    }

    /**
     * Attaches event listeners to modal elements
     */    attachEventListeners() {
        // Close on background click
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });// Action buttons
        document.getElementById('gameModalNewGameBtn')?.addEventListener('click', () => {
            this.hide();
            this.triggerNewGame();
        });

        document.getElementById('gameModalViewLeaderboardBtn')?.addEventListener('click', () => {
            window.location.href = '/assets/html/leaderboard.html';
        });        document.getElementById('gameModalMainMenuBtn')?.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Keyboard events
        document.addEventListener('keydown', this.handleKeyPress);
    }

    /**
     * Handles keyboard events
     */
    handleKeyPress(e) {
        if (!this.isVisible) return;
        
        if (e.key === 'Escape') {
            this.hide();
        }
    }

    /**
     * Shows the modal with game statistics
     */
    show(gameData) {
        if (!this.modal) {
            console.error('Game modal not initialized');
            return;
        }

        this.currentGameData = gameData;
        this.isVisible = true;
        
        // Show modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Start loading process
        this.showLoadingState();
        
        // Process and display stats with a slight delay for effect
        setTimeout(() => {
            this.processAndDisplayGameStats(gameData);
        }, 500);
    }

    /**
     * Hides the modal
     */
    hide() {
        if (!this.modal) return;
        
        this.isVisible = false;
        this.modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Reset modal state
        setTimeout(() => {
            this.resetModalState();
        }, 300);
    }

    /**
     * Shows loading state
     */
    showLoadingState() {
        document.getElementById('gameModalLoadingState').style.display = 'block';
        document.getElementById('gameModalErrorState').style.display = 'none';
        document.getElementById('gameModalStatsContent').style.display = 'none';
        document.getElementById('gameModalActionButtons').style.display = 'none';
    }

    /**
     * Shows error state
     */
    showErrorState(message = 'Error al procesar estadísticas de la partida') {
        document.getElementById('gameModalLoadingState').style.display = 'none';
        document.getElementById('gameModalErrorState').style.display = 'block';
        document.getElementById('gameModalStatsContent').style.display = 'none';
        document.getElementById('gameModalActionButtons').style.display = 'block';
        document.getElementById('gameModalErrorMessage').textContent = message;
    }

    /**
     * Shows main content
     */
    showMainContent() {
        document.getElementById('gameModalLoadingState').style.display = 'none';
        document.getElementById('gameModalErrorState').style.display = 'none';
        document.getElementById('gameModalStatsContent').style.display = 'block';
        document.getElementById('gameModalActionButtons').style.display = 'flex';
    }

    /**
     * Processes and displays game statistics
     */
    async processAndDisplayGameStats(gameData) {
        try {
            // Update game title
            document.getElementById('gameTitle').textContent = `Partida Completada`;

            // Aggregate data from all rounds
            const aggregatedData = this.aggregateRoundData(gameData);

            // Display game summary
            this.displayGameSummary(aggregatedData);

            // Display aggregated scores
            this.displayAggregatedScores(aggregatedData);

            // Display performance stats
            this.displayGamePerformanceStats(aggregatedData);

            // Fetch and display powerup statistics
            await this.displayPowerupAnalysis();

            // Display round progress
            this.displayRoundsProgress(gameData);

            // Show main content
            this.showMainContent();

        } catch (error) {
            console.error('Error processing game statistics:', error);
            this.showErrorState('Error al procesar las estadísticas de la partida');
        }
    }

    /**
     * Aggregates data from all rounds in the game
     */
    aggregateRoundData(gameData) {
        const aggregated = {
            totalRounds: gameData.rounds ? gameData.rounds.length : 0,
            winner: gameData.winner,
            duration: gameData.duration,
            startDate: gameData.startDate,
            white: {
                totalScore: 0,
                totalCaptured: 0,
                totalPowerups: 0,
                totalTurns: 0,
                roundsWon: 0
            },
            black: {
                totalScore: 0,
                totalCaptured: 0,
                totalPowerups: 0,
                totalTurns: 0,
                roundsWon: 0
            }
        };

        // Aggregate data from all rounds
        if (gameData.rounds) {
            gameData.rounds.forEach(round => {
                // White player stats
                if (round.gameStats && round.gameStats.white) {
                    aggregated.white.totalScore += round.whiteScore || 0;
                    aggregated.white.totalCaptured += round.gameStats.white.captured || 0;
                    aggregated.white.totalPowerups += round.gameStats.white.powerupsUsed || 0;
                    aggregated.white.totalTurns += round.gameStats.white.turns || 0;
                    if (round.winner === 'w') aggregated.white.roundsWon++;
                }

                // Black player stats
                if (round.gameStats && round.gameStats.black) {
                    aggregated.black.totalScore += round.blackScore || 0;
                    aggregated.black.totalCaptured += round.gameStats.black.captured || 0;
                    aggregated.black.totalPowerups += round.gameStats.black.powerupsUsed || 0;
                    aggregated.black.totalTurns += round.gameStats.black.turns || 0;
                    if (round.winner === 'b') aggregated.black.roundsWon++;
                }
            });
        }

        return aggregated;
    }    /**
     * Displays game summary information
     */
    displayGameSummary(aggregatedData) {
        // Determine winner
        const winner = aggregatedData.winner || (aggregatedData.white.roundsWon > aggregatedData.black.roundsWon ? 'w' : 'b');
        const winnerName = winner === 'w' ? 'Blancas' : 'Negras';
        const loserName = winner === 'w' ? 'Negras' : 'Blancas';
        const winnerIcon = winner === 'w' ? '/images/whitelogo.png' : '/images/blacklogo.png';
        
        // Update winner announcement
        document.getElementById('gameWinner').textContent = `¡${winnerName} Ganan la Partida!`;
        document.getElementById('gameWinnerIcon').src = winnerIcon;
        document.getElementById('gameWinnerName').textContent = `Jugador ${winnerName}`;
        
        // Update winner title with more details
        const winnerStats = winner === 'w' ? aggregatedData.white : aggregatedData.black;
        const totalRoundsWon = winnerStats.roundsWon;
        const totalScore = winnerStats.totalScore;
        
        document.getElementById('gameWinnerTitle').textContent = 
            `Campeón de la Partida - Victoria por ${totalRoundsWon}-${aggregatedData.totalRounds - totalRoundsWon}`;
          // Update winner quick stats
        document.getElementById('winnerRoundsWon').textContent = 
            `${totalRoundsWon} Rondas Ganadas`;
        document.getElementById('winnerTotalScore').textContent = 
            `${totalScore} Puntos Totales`;
        
        // Update series score display
        document.getElementById('whiteSeriesScore').textContent = aggregatedData.white.roundsWon;
        document.getElementById('blackSeriesScore').textContent = aggregatedData.black.roundsWon;
        
        // Add winner highlighting to score
        const whiteScoreEl = document.getElementById('whiteSeriesScore');
        const blackScoreEl = document.getElementById('blackSeriesScore');
        whiteScoreEl.classList.remove('winner-score');
        blackScoreEl.classList.remove('winner-score');
        
        if (winner === 'w') {
            whiteScoreEl.classList.add('winner-score');
        } else {
            blackScoreEl.classList.add('winner-score');
        }

        // Update game details with more information
        const duration = aggregatedData.duration || 'No disponible';
        const gameDate = aggregatedData.startDate ? 
            new Date(aggregatedData.startDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        
        document.getElementById('gameDuration').textContent = duration;
        document.getElementById('totalRounds').textContent = aggregatedData.totalRounds;
        document.getElementById('gameDate').textContent = gameDate;
    }

    /**
     * Displays aggregated scores
     */
    displayAggregatedScores(aggregatedData) {
        // White player aggregated scores
        document.getElementById('gameWhiteScore').textContent = aggregatedData.white.totalScore;
        document.getElementById('gameWhiteCaptured').textContent = aggregatedData.white.totalCaptured;
        document.getElementById('gameWhitePowerups').textContent = aggregatedData.white.totalPowerups;
        document.getElementById('gameWhiteTurns').textContent = aggregatedData.white.totalTurns;
        document.getElementById('gameWhiteWins').textContent = aggregatedData.white.roundsWon;

        // Black player aggregated scores
        document.getElementById('gameBlackScore').textContent = aggregatedData.black.totalScore;
        document.getElementById('gameBlackCaptured').textContent = aggregatedData.black.totalCaptured;
        document.getElementById('gameBlackPowerups').textContent = aggregatedData.black.totalPowerups;
        document.getElementById('gameBlackTurns').textContent = aggregatedData.black.totalTurns;
        document.getElementById('gameBlackWins').textContent = aggregatedData.black.roundsWon;

        // Highlight overall winner's score card
        const whiteCard = document.getElementById('gameWhitePlayer');
        const blackCard = document.getElementById('gameBlackPlayer');
        
        whiteCard.classList.remove('winner');
        blackCard.classList.remove('winner');
        
        if (aggregatedData.white.totalScore > aggregatedData.black.totalScore) {
            whiteCard.classList.add('winner');
        } else if (aggregatedData.black.totalScore > aggregatedData.white.totalScore) {
            blackCard.classList.add('winner');
        }
    }

    /**
     * Displays game performance statistics
     */
    displayGamePerformanceStats(aggregatedData) {
        const white = aggregatedData.white;
        const black = aggregatedData.black;

        // Calculate average ratios
        const whiteCaptureRatio = white.totalTurns > 0 ? (white.totalCaptured / white.totalTurns).toFixed(2) : '0.00';
        const blackCaptureRatio = black.totalTurns > 0 ? (black.totalCaptured / black.totalTurns).toFixed(2) : '0.00';

        const whitePointsPerCapture = white.totalCaptured > 0 ? (white.totalScore / white.totalCaptured).toFixed(1) : '0.0';
        const blackPointsPerCapture = black.totalCaptured > 0 ? (black.totalScore / black.totalCaptured).toFixed(1) : '0.0';

        const whitePowerupRatio = white.totalTurns > 0 ? (white.totalPowerups / white.totalTurns).toFixed(2) : '0.00';
        const blackPowerupRatio = black.totalTurns > 0 ? (black.totalPowerups / black.totalTurns).toFixed(2) : '0.00';

        // PowerUp effectiveness (score improvement per powerup used)
        const whitePowerupEfficiency = white.totalPowerups > 0 ? Math.min(100, Math.round((white.totalScore / white.totalPowerups) * 2)) : 0;
        const blackPowerupEfficiency = black.totalPowerups > 0 ? Math.min(100, Math.round((black.totalScore / black.totalPowerups) * 2)) : 0;

        // Update display
        document.getElementById('gameWhiteCaptureRatio').textContent = whiteCaptureRatio;
        document.getElementById('gameBlackCaptureRatio').textContent = blackCaptureRatio;
        document.getElementById('gameWhitePointsPerCapture').textContent = whitePointsPerCapture;
        document.getElementById('gameBlackPointsPerCapture').textContent = blackPointsPerCapture;
        document.getElementById('gameWhitePowerupRatio').textContent = whitePowerupRatio;
        document.getElementById('gameBlackPowerupRatio').textContent = blackPowerupRatio;
        document.getElementById('gameWhitePowerupEfficiency').textContent = `${whitePowerupEfficiency}%`;
        document.getElementById('gameBlackPowerupEfficiency').textContent = `${blackPowerupEfficiency}%`;

        // Update comparison bar widths
        this.updateComparisonBars(whiteCaptureRatio, blackCaptureRatio, 'gameWhiteCaptureBar', 'gameBlackCaptureBar');
        this.updateComparisonBars(whitePointsPerCapture, blackPointsPerCapture, 'gameWhitePointsBar', 'gameBlackPointsBar');
        this.updateComparisonBars(whitePowerupRatio, blackPowerupRatio, 'gameWhitePowerupBar', 'gameBlackPowerupBar');
    }

    /**
     * Updates comparison bar widths based on values
     */
    updateComparisonBars(whiteValue, blackValue, whiteBarId, blackBarId) {
        const whiteNum = parseFloat(whiteValue) || 0;
        const blackNum = parseFloat(blackValue) || 0;
        const total = whiteNum + blackNum;
        
        if (total === 0) {
            document.getElementById(whiteBarId).style.width = '50%';
            document.getElementById(blackBarId).style.width = '50%';
        } else {
            const whitePercent = (whiteNum / total) * 100;
            const blackPercent = (blackNum / total) * 100;
            document.getElementById(whiteBarId).style.width = `${Math.max(15, whitePercent)}%`;
            document.getElementById(blackBarId).style.width = `${Math.max(15, blackPercent)}%`;
        }
    }

    /**
     * Displays PowerUp analysis using API data
     */
    async displayPowerupAnalysis() {
        try {
            const response = await fetch('/api/powerups');
            if (response.ok) {
                const powerupData = await response.json();
                
                const topPowerupsContainer = document.getElementById('topPowerups');
                const powerupChartContainer = document.getElementById('powerupChart');
                
                // Display top 5 most used powerups
                topPowerupsContainer.innerHTML = '';
                if (powerupData.data && powerupData.data.length > 0) {
                    powerupData.data.slice(0, 5).forEach((powerup, index) => {
                        const powerupElement = document.createElement('div');
                        powerupElement.className = 'powerup-item';
                        powerupElement.innerHTML = `
                            <span class="powerup-rank">${index + 1}</span>
                            <span class="powerup-name">${powerup.nombre}</span>
                            <span class="powerup-uses">${powerup.vecesUsado} usos</span>
                        `;
                        topPowerupsContainer.appendChild(powerupElement);
                    });
                } else {
                    topPowerupsContainer.innerHTML = '<p>No hay datos de PowerUps disponibles</p>';
                }

                // Simple usage chart representation
                powerupChartContainer.innerHTML = '';
                if (powerupData.estadisticas) {
                    powerupChartContainer.innerHTML = `
                        <div class="chart-stat">
                            <span class="chart-label">Total usos:</span>
                            <span class="chart-value">${powerupData.estadisticas.totalUsos}</span>
                        </div>
                        <div class="chart-stat">
                            <span class="chart-label">Más popular:</span>
                            <span class="chart-value">${powerupData.estadisticas.powerupMasPopular || 'N/A'}</span>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error fetching powerup data:', error);
            document.getElementById('topPowerups').innerHTML = '<p>Error al cargar datos de PowerUps</p>';
        }
    }

    /**
     * Displays round by round progress
     */    displayRoundsProgress(gameData) {
        const timelineContainer = document.getElementById('roundsTimeline');
        timelineContainer.innerHTML = '';

        if (gameData.rounds && gameData.rounds.length > 0) {
            gameData.rounds.forEach((round, index) => {
                const roundElement = document.createElement('div');
                roundElement.className = 'round-item';
                
                let winnerIcon, winnerName;
                if (round.winner === 'stalemate') {
                    winnerIcon = '/images/whitelogo.png'; // Use neutral icon for stalemate
                    winnerName = 'Tablas';
                } else {
                    winnerIcon = round.winner === 'w' ? '/images/whitelogo.png' : '/images/blacklogo.png';
                    winnerName = round.winner === 'w' ? 'Blancas' : 'Negras';
                }
                
                roundElement.innerHTML = `
                    <div class="round-number">R${index + 1}</div>
                    <div class="round-info">
                        <div class="round-winner">
                            <img src="${winnerIcon}" alt="${winnerName}" class="round-winner-icon">
                            <span>${winnerName}</span>
                        </div>
                        <div class="round-scores">
                            ${round.whiteScore || 0} - ${round.blackScore || 0}
                        </div>
                    </div>
                `;
                timelineContainer.appendChild(roundElement);
            });
        } else {
            timelineContainer.innerHTML = '<p>No hay datos de rondas disponibles</p>';
        }
    }

    /**
     * Triggers new game action
     */
    triggerNewGame() {
        // Dispatch custom event for new game
        window.dispatchEvent(new CustomEvent('newGame', {
            detail: { gameData: this.currentGameData }
        }));
    }

    /**
     * Resets modal state
     */
    resetModalState() {
        this.showLoadingState();
        this.currentGameData = null;
    }

    /**
     * Destroys the modal
     */
    destroy() {
        document.removeEventListener('keydown', this.handleKeyPress);
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameStatsModal;
} else {
    window.GameStatsModal = GameStatsModal;
}
