/**
 * Round Statistics Modal Manager
 * Handles the display of round statistics in a popup modal
 */
class RoundStatsModal {
    constructor() {
        this.modal = null;
        this.currentRoundData = null;
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
        const existingModal = document.getElementById('roundStatsModal');
        if (existingModal) {
            existingModal.remove();
        }        // Create modal HTML
        const modalHTML = `
            <div id="roundStatsModal" class="round-stats-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1>ESTADÍSTICAS DE RONDA</h1>
                        <p id="roundTitle">Ronda 1 Completada</p>
                    </div>

                    <!-- Loading State -->
                    <div id="modalLoadingState" class="loading-state">
                        <div class="loading-spinner"></div>
                        <p>Procesando estadísticas...</p>
                    </div>                    <!-- Error State -->
                    <div id="modalErrorState" class="error-state" style="display: none;">
                        <div class="error-icon">!</div>
                        <h3>Error al procesar estadísticas</h3>
                        <p id="modalErrorMessage">No se pudieron procesar las estadísticas de la ronda.</p>
                    </div>

                    <!-- Main Content -->
                    <div id="modalStatsContent" class="modal-stats-content" style="display: none;">                        <!-- Winner Announcement -->
                        <div class="winner-announcement">
                            <h2 id="modalRoundWinner">Ganador de la Ronda</h2>
                            <div class="winner-info">
                                <img id="modalWinnerIcon" class="winner-icon" src="" alt="Ganador">
                                <span id="modalWinnerName" class="winner-name"></span>
                            </div>
                        </div>                        <!-- Scores Summary -->
                        <div class="scores-summary">
                            <h3>Resumen de Puntuaciones</h3>
                            <div class="scores-grid"><div id="modalWhitePlayer" class="player-score">
                                    <div class="player-header">
                                        <img src="/images/whitelogo.png" alt="Blancas" class="player-icon">
                                    </div>
                                    <div class="score-details">
                                        <div class="main-score" id="modalWhiteScore">0</div>
                                        <div class="score-breakdown">
                                            <div>Piezas capturadas: <span id="modalWhiteCaptured">0</span></div>
                                            <div>PowerUps usados: <span id="modalWhitePowerups">0</span></div>
                                            <div>Turnos jugados: <span id="modalWhiteTurns">0</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="vs-divider">VS</div>                                <div id="modalBlackPlayer" class="player-score">
                                    <div class="player-header">
                                        <img src="/images/blacklogo.png" alt="Negras" class="player-icon">
                                    </div>
                                    <div class="score-details">
                                        <div class="main-score" id="modalBlackScore">0</div>
                                        <div class="score-breakdown">
                                            <div>Piezas capturadas: <span id="modalBlackCaptured">0</span></div>
                                            <div>PowerUps usados: <span id="modalBlackPowerups">0</span></div>
                                            <div>Turnos jugados: <span id="modalBlackTurns">0</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                        <!-- Performance Statistics -->
                        <div class="performance-stats">
                            <h3>Análisis de Rendimiento</h3>
                            <div class="stats-grid">
                                <div class="stat-category">
                                    <h4>Eficiencia Ofensiva</h4>
                                    <div class="stat-item">
                                        <span class="stat-label">Ratio Captura/Turno</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="modalWhiteCaptureBar">
                                                <span id="modalWhiteCaptureRatio">0.0</span>
                                            </div>
                                            <div class="black-bar" id="modalBlackCaptureBar">
                                                <span id="modalBlackCaptureRatio">0.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Puntos por Captura</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="modalWhitePointsBar">
                                                <span id="modalWhitePointsPerCapture">0.0</span>
                                            </div>
                                            <div class="black-bar" id="modalBlackPointsBar">
                                                <span id="modalBlackPointsPerCapture">0.0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>                                <div class="stat-category">
                                    <h4>Uso de PowerUps</h4>
                                    <div class="stat-item">
                                        <span class="stat-label">PowerUps por Turno</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="modalWhitePowerupBar">
                                                <span id="modalWhitePowerupRatio">0.0</span>
                                            </div>
                                            <div class="black-bar" id="modalBlackPowerupBar">
                                                <span id="modalBlackPowerupRatio">0.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">Eficiencia PowerUp</span>
                                        <div class="comparison-bar">
                                            <div class="white-bar" id="modalWhiteEfficiencyBar">
                                                <span id="modalWhitePowerupEfficiency">0%</span>
                                            </div>
                                            <div class="black-bar" id="modalBlackEfficiencyBar">
                                                <span id="modalBlackPowerupEfficiency">0%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>                        <!-- Series Progress -->
                        <div class="series-progress">
                            <h3>Progreso de la Serie</h3>                            <div class="wins-display">
                                <div class="wins-section">
                                    <img src="/images/whitelogo.png" alt="Blancas" class="wins-player-logo">
                                    <div class="wins-circles" id="modalWhiteWinsCircles"></div>
                                </div>                                <div class="series-info">
                                    <span id="modalSeriesStatus">Al mejor de 2 rondas</span>
                                </div>
                                <div class="wins-section">
                                    <img src="/images/blacklogo.png" alt="Negras" class="wins-player-logo">
                                    <div class="wins-circles" id="modalBlackWinsCircles"></div>
                                </div>
                            </div>
                        </div>                    </div>                    <!-- Action Buttons -->
                    <div id="modalActionButtons" class="modal-actions" style="display: none;">
                        <button id="modalNextRoundBtn" class="modal-btn modal-btn-image" style="display: none;">
                            <img src="/images/nextroundbutton.png" alt="Siguiente Ronda" class="button-image">
                        </button>                        <button id="modalNewGameBtn" class="modal-btn modal-btn-image" style="display: none;">
                            <img src="/images/newgamebutton.png" alt="Nueva Partida" class="button-image">
                        </button>
                        <button id="modalViewLeaderboardBtn" class="modal-btn modal-btn-image">
                            <img src="/images/leaderboardbuttonmainmenu.png" alt="Ver Ranking" class="button-image">
                        </button>
                        <button id="modalMainMenuBtn" class="modal-btn modal-btn-image">
                            <img src="/images/Photoroom_20250604_174552.png" alt="Menú Principal" class="button-image">
                        </button>
                        <button id="modalCloseBtn" class="modal-btn modal-btn-secondary">
                            ❌ Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Inject modal into body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('roundStatsModal');
    }

    /**
     * Attaches event listeners to modal elements
     */    attachEventListeners() {
        // Close modal events (only the close button in the bottom)
        document.getElementById('modalCloseBtn')?.addEventListener('click', this.hide);
        
        // Close on background click - DISABLED to prevent accidental closing
        // this.modal?.addEventListener('click', (e) => {
        //     if (e.target === this.modal) {
        //         this.hide();
        //     }
        // });

        // Action buttons
        document.getElementById('modalNextRoundBtn')?.addEventListener('click', () => {
            this.hide();
            this.triggerNextRound();
        });

        document.getElementById('modalNewGameBtn')?.addEventListener('click', () => {
            this.hide();
            this.triggerNewGame();
        });        document.getElementById('modalViewLeaderboardBtn')?.addEventListener('click', () => {
            window.location.href = 'leaderboard.html';
        });        document.getElementById('modalMainMenuBtn')?.addEventListener('click', () => {
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
    }    /**
     * Shows the modal with round statistics
     */
    show(roundData) {
        if (!this.modal) {
            console.error('Modal not initialized');
            return;
        }

        this.currentRoundData = roundData;
        this.isVisible = true;
        
        // Show modal
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Start loading process
        this.showLoadingState();
        
        // Process and display stats with a slight delay for effect
        setTimeout(() => {
            this.processAndDisplayStats(roundData);
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
    }    /**
     * Shows loading state
     */
    showLoadingState() {
        document.getElementById('modalLoadingState').style.display = 'block';
        document.getElementById('modalErrorState').style.display = 'none';
        document.getElementById('modalStatsContent').style.display = 'none';
        document.getElementById('modalActionButtons').style.display = 'none';
        
        // Update loading message to indicate database fetch
        const loadingElement = document.querySelector('#modalLoadingState p');
        if (loadingElement) {
            loadingElement.textContent = 'Cargando estadísticas desde la base de datos...';
        }
    }    /**
     * Shows error state
     */
    showErrorState(message = 'Error al procesar estadísticas') {
        document.getElementById('modalLoadingState').style.display = 'none';
        document.getElementById('modalErrorState').style.display = 'block';
        document.getElementById('modalStatsContent').style.display = 'none';
        document.getElementById('modalActionButtons').style.display = 'block';
        
        const errorMessageElement = document.getElementById('modalErrorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
    }

    /**
     * Shows a non-blocking warning and continues with fallback data
     */
    showDatabaseWarning(message) {
        console.warn(`Database Warning: ${message}`);
        
        // Could add a small notification banner here if desired
        // For now, just log the warning and continue with local data
    }

    /**
     * Shows main content
     */
    showMainContent() {
        document.getElementById('modalLoadingState').style.display = 'none';
        document.getElementById('modalErrorState').style.display = 'none';
        document.getElementById('modalStatsContent').style.display = 'block';
        document.getElementById('modalActionButtons').style.display = 'flex';
    }    /**
     * Processes and displays round statistics
     */
    async processAndDisplayStats(roundData) {
        try {
            // Update round title
            document.getElementById('roundTitle').textContent = `Ronda ${roundData.roundNumber || 1} Completada`;

            // Display winner
            this.displayWinnerInfo(roundData);

            // Fetch and display database statistics
            await this.fetchAndDisplayDatabaseStats(roundData);

            // Display series progress
            this.displaySeriesProgress(roundData);

            // Show appropriate action buttons
            this.configureActionButtons(roundData);

            // Show main content
            this.showMainContent();

        } catch (error) {
            console.error('Error processing round statistics:', error);
            this.showErrorState('Error al procesar las estadísticas de la ronda');
        }
    }    /**
     * Fetches round statistics from database and displays them
     */
    async fetchAndDisplayDatabaseStats(roundData) {
        try {
            // Get current round and player information from context
            const gameContext = this.getGameContext();
            
            // Try to fetch real statistics from the database
            const dbStats = await this.fetchRoundStatsFromAPI(gameContext);
            
            if (dbStats && dbStats.length > 0) {
                // Display real database statistics
                this.displayDatabaseScores(roundData, dbStats);
                this.displayDatabasePerformanceStats(roundData, dbStats);
            } else {
                // Fallback to local gameStats if available
                console.warn('No database stats found, using local gameStats');
                this.displayScores(roundData);
                this.displayPerformanceStats(roundData);
            }
            
        } catch (error) {
            console.warn('Error fetching database stats, using local data:', error);
            // Fallback to existing local data processing
            this.displayScores(roundData);
            this.displayPerformanceStats(roundData);
        }
    }

    /**
     * Fetches round statistics from the API
     */
    async fetchRoundStatsFromAPI(gameContext) {
        try {
            if (!gameContext || !gameContext.currentRoundId || !gameContext.playerIds) {
                console.warn('Datos insuficientes para obtener estadísticas de BD:', { 
                    gameContext, 
                    roundId: gameContext?.currentRoundId, 
                    playerIds: gameContext?.playerIds 
                });
                return null;
            }

            console.log('📊 Obteniendo estadísticas de ronda desde BD:', {
                roundId: gameContext.currentRoundId,
                playerIds: gameContext.playerIds
            });

            // Obtener estadísticas para ambos jugadores en paralelo
            const [whiteStats, blackStats] = await Promise.all([
                this.fetchPlayerRoundStats(gameContext.playerIds.w, gameContext.currentRoundId),
                this.fetchPlayerRoundStats(gameContext.playerIds.b, gameContext.currentRoundId)
            ]);

            if (whiteStats && blackStats) {
                return [
                    { ...whiteStats, color: 'white' },
                    { ...blackStats, color: 'black' }
                ];
            } else {
                console.warn('No se pudieron obtener estadísticas completas de BD');
                return null;
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas de ronda:', error);
            return null;
        }
    }

    /**
     * Fetches statistics for a specific player in a specific round
     */
    async fetchPlayerRoundStats(playerId, roundId) {
        try {
            const response = await fetch(`/api/rounds/stats/${playerId}/${roundId}`);
            
            if (!response.ok) {
                console.warn(`No se encontraron estadísticas para jugador ${playerId} en ronda ${roundId}`);
                return null;
            }
            
            const result = await response.json();
            console.log(`📊 Estadísticas obtenidas para jugador ${playerId}:`, result);
            
            return result;
        } catch (error) {
            console.error(`Error obteniendo estadísticas del jugador ${playerId}:`, error);
            return null;
        }
    }

    /**
     * Gets game context from various sources
     */
    getGameContext() {
        // Try to get context from current round data
        if (this.currentRoundData && this.currentRoundData.gameContext) {
            return this.currentRoundData.gameContext;
        }
        
        // Try to get from global window variables first
        if (window.gameContext) {
            return window.gameContext;
        }
        
        // Try to get from localStorage as fallback
        const gameContext = {
            currentGameId: localStorage.getItem('currentGameId'),
            currentRoundId: localStorage.getItem('currentRoundId'),
            playerIds: {
                w: localStorage.getItem('whitePlayerId'),
                b: localStorage.getItem('blackPlayerId')
            }
        };
        
        console.log('Game context retrieved:', gameContext);
        return gameContext;
    }

    /**
     * Displays player scores using database statistics
     */
    displayDatabaseScores(roundData, dbStats) {
        console.log('📊 Mostrando puntajes desde BD en modal de ronda:', { roundData, dbStats });
        
        // Basic scores from roundData (these come from the game logic)
        const roundWhiteScore = roundData.whiteScore || 0;
        const roundBlackScore = roundData.blackScore || 0;
        const cumulativeWhiteScore = roundData.whiteCumulativeScore || roundWhiteScore;
        const cumulativeBlackScore = roundData.blackCumulativeScore || roundBlackScore;

        // Mostrar puntajes de la ronda actual
        document.getElementById('modalWhiteScore').textContent = roundWhiteScore;
        document.getElementById('modalBlackScore').textContent = roundBlackScore;

        // Try to map database stats to players
        const whiteStats = this.findPlayerStats(dbStats, 'white');
        const blackStats = this.findPlayerStats(dbStats, 'black');

        console.log('📊 Estadísticas mapeadas:', { whiteStats, blackStats });

        // Display detailed breakdowns from database
        document.getElementById('modalWhiteCaptured').textContent = whiteStats.piezas_capturadas || 0;
        document.getElementById('modalWhitePowerups').textContent = whiteStats.powerups_usados || 0;
        document.getElementById('modalWhiteTurns').textContent = whiteStats.turnos_tomados || 0;

        document.getElementById('modalBlackCaptured').textContent = blackStats.piezas_capturadas || 0;
        document.getElementById('modalBlackPowerups').textContent = blackStats.powerups_usados || 0;
        document.getElementById('modalBlackTurns').textContent = blackStats.turnos_tomados || 0;

        // NUEVO: Mostrar puntajes acumulativos como información adicional
        const modalElement = document.querySelector('.round-stats-modal');
        if (modalElement && (cumulativeWhiteScore !== roundWhiteScore || cumulativeBlackScore !== roundBlackScore)) {
            let cumulativeInfo = modalElement.querySelector('.cumulative-scores-info');
            if (!cumulativeInfo) {
                cumulativeInfo = document.createElement('div');
                cumulativeInfo.className = 'cumulative-scores-info';
                cumulativeInfo.style.cssText = `
                    margin-top: 10px;
                    padding: 8px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 6px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #ccc;
                `;
                
                const scoresSection = modalElement.querySelector('.scores-section') || modalElement.querySelector('.modal-content');
                if (scoresSection) {
                    scoresSection.appendChild(cumulativeInfo);
                }
            }
            
            cumulativeInfo.innerHTML = `
                <div style="margin-bottom: 4px;">📊 <strong>Puntajes Acumulativos:</strong></div>
                <div>Blancas: ${cumulativeWhiteScore} | Negras: ${cumulativeBlackScore}</div>
            `;
        }
    }

    /**
     * Displays performance statistics using database data
     */
    displayDatabasePerformanceStats(roundData, dbStats) {
        const whiteScore = roundData.whiteScore || 0;
        const blackScore = roundData.blackScore || 0;
        
        // Get database stats for each player
        const whiteStats = this.findPlayerStats(dbStats, 'white');
        const blackStats = this.findPlayerStats(dbStats, 'black');

        // Calculate ratios using database values
        const whiteCaptureRatio = whiteStats.turnos_tomados > 0 ? 
            (whiteStats.piezas_capturadas / whiteStats.turnos_tomados).toFixed(2) : '0.00';
        const blackCaptureRatio = blackStats.turnos_tomados > 0 ? 
            (blackStats.piezas_capturadas / blackStats.turnos_tomados).toFixed(2) : '0.00';
        
        const whitePointsPerCapture = whiteStats.piezas_capturadas > 0 ? 
            (whiteScore / whiteStats.piezas_capturadas).toFixed(1) : '0.0';
        const blackPointsPerCapture = blackStats.piezas_capturadas > 0 ? 
            (blackScore / blackStats.piezas_capturadas).toFixed(1) : '0.0';
        
        const whitePowerupRatio = whiteStats.turnos_tomados > 0 ? 
            (whiteStats.powerups_usados / whiteStats.turnos_tomados).toFixed(2) : '0.00';
        const blackPowerupRatio = blackStats.turnos_tomados > 0 ? 
            (blackStats.powerups_usados / blackStats.turnos_tomados).toFixed(2) : '0.00';

        // PowerUp efficiency calculation
        const whitePowerupEfficiency = whiteStats.powerups_usados > 0 ? 
            Math.min(100, Math.round((whiteScore / whiteStats.powerups_usados) * 10)) : 0;
        const blackPowerupEfficiency = blackStats.powerups_usados > 0 ? 
            Math.min(100, Math.round((blackScore / blackStats.powerups_usados) * 10)) : 0;

        // Update display
        document.getElementById('modalWhiteCaptureRatio').textContent = whiteCaptureRatio;
        document.getElementById('modalBlackCaptureRatio').textContent = blackCaptureRatio;
        document.getElementById('modalWhitePointsPerCapture').textContent = whitePointsPerCapture;
        document.getElementById('modalBlackPointsPerCapture').textContent = blackPointsPerCapture;
        document.getElementById('modalWhitePowerupRatio').textContent = whitePowerupRatio;
        document.getElementById('modalBlackPowerupRatio').textContent = blackPowerupRatio;
        document.getElementById('modalWhitePowerupEfficiency').textContent = `${whitePowerupEfficiency}%`;
        document.getElementById('modalBlackPowerupEfficiency').textContent = `${blackPowerupEfficiency}%`;

        // Update comparison bar widths
        this.updateComparisonBars(whiteCaptureRatio, blackCaptureRatio, 'modalWhiteCaptureBar', 'modalBlackCaptureBar');
        this.updateComparisonBars(whitePointsPerCapture, blackPointsPerCapture, 'modalWhitePointsBar', 'modalBlackPointsBar');
        this.updateComparisonBars(whitePowerupRatio, blackPowerupRatio, 'modalWhitePowerupBar', 'modalBlackPowerupBar');
    }

    /**
     * Finds statistics for a specific player from database results
     */
    findPlayerStats(dbStats, playerColor) {
        // Default empty stats
        const defaultStats = {
            piezas_capturadas: 0,
            piezas_perdidas: 0,
            powerups_usados: 0,
            turnos_tomados: 0,
            rondas_jugadas: 0
        };

        if (!dbStats || !Array.isArray(dbStats) || dbStats.length === 0) {
            console.warn('No hay estadísticas de BD disponibles, usando defaults');
            return defaultStats;
        }

        // Buscar estadísticas por color asignado en fetchRoundStatsFromAPI
        const playerStats = dbStats.find(stat => stat.color === playerColor);
        
        if (playerStats) {
            console.log(`📊 Estadísticas encontradas para ${playerColor}:`, playerStats);
            return {
                piezas_capturadas: playerStats.piezas_capturadas || 0,
                piezas_perdidas: playerStats.piezas_perdidas || 0,
                powerups_usados: playerStats.powerups_usados || 0,
                turnos_tomados: playerStats.turnos_tomados || 0,
                rondas_jugadas: playerStats.rondas_jugadas || 0
            };
        }

        // Fallback: if we have exactly 2 players, assign by index
        if (dbStats.length === 2) {
            const playerIndex = playerColor === 'white' ? 0 : 1;
            const playerStats = dbStats[playerIndex];
            console.log(`📊 Usando fallback por índice para ${playerColor}:`, playerStats);
            return {
                piezas_capturadas: playerStats.piezas_capturadas || 0,
                piezas_perdidas: playerStats.piezas_perdidas || 0,
                powerups_usados: playerStats.powerups_usados || 0,
                turnos_tomados: playerStats.turnos_tomados || 0,
                rondas_jugadas: playerStats.rondas_jugadas || 0
            };
        }

        // Final fallback: use first available stats or defaults
        console.warn(`No se pudieron mapear estadísticas para ${playerColor}, usando defaults`);
        return dbStats.length > 0 ? {
            piezas_capturadas: dbStats[0].piezas_capturadas || 0,
            piezas_perdidas: dbStats[0].piezas_perdidas || 0,
            powerups_usados: dbStats[0].powerups_usados || 0,
            turnos_tomados: dbStats[0].turnos_tomados || 0,
            rondas_jugadas: dbStats[0].rondas_jugadas || 0
        } : defaultStats;
    }

    /**
     * Displays winner information
     */displayWinnerInfo(roundData) {
        const whiteCard = document.getElementById('modalWhitePlayer');
        const blackCard = document.getElementById('modalBlackPlayer');
        
        whiteCard.classList.remove('winner');
        blackCard.classList.remove('winner');
        
        if (roundData.winner === 'stalemate') {
            // Stalemate case - show draw
            document.getElementById('modalRoundWinner').textContent = 'Tablas por Ahogado';
            document.getElementById('modalWinnerIcon').src = '/images/whitelogo.png'; // Use white icon as placeholder
            document.getElementById('modalWinnerName').textContent = 'Ambos jugadores reciben 1 punto';
            
            // Don't highlight any card for stalemate
        } else {
            // Regular winner case
            const winnerName = roundData.winner === 'w' ? 'Blancas' : 'Negras';
            const winnerIcon = roundData.winner === 'w' ? '/images/whitelogo.png' : '/images/blacklogo.png';
            
            document.getElementById('modalRoundWinner').textContent = `${winnerName} Ganan la Ronda`;
            document.getElementById('modalWinnerIcon').src = winnerIcon;
            document.getElementById('modalWinnerName').textContent = winnerName;
            
            if (roundData.winner === 'w') {
                whiteCard.classList.add('winner');
            } else {
                blackCard.classList.add('winner');
            }
        }
    }

    /**
     * Displays player scores
     */
    displayScores(roundData) {        
        // CORREGIDO: Mostrar puntajes de ronda actual y acumulativos
        const roundWhiteScore = roundData.whiteScore || 0;
        const roundBlackScore = roundData.blackScore || 0;
        const cumulativeWhiteScore = roundData.whiteCumulativeScore || roundWhiteScore;
        const cumulativeBlackScore = roundData.blackCumulativeScore || roundBlackScore;

        console.log('📊 Mostrando puntajes en modal de ronda:', {
            roundWhite: roundWhiteScore,
            roundBlack: roundBlackScore,
            cumulativeWhite: cumulativeWhiteScore,
            cumulativeBlack: cumulativeBlackScore
        });

        // Mostrar puntajes de la ronda actual
        document.getElementById('modalWhiteScore').textContent = roundWhiteScore;
        document.getElementById('modalBlackScore').textContent = roundBlackScore;

        // NUEVO: Mostrar puntajes acumulativos como información adicional
        const modalElement = document.querySelector('.round-stats-modal');
        if (modalElement && (cumulativeWhiteScore !== roundWhiteScore || cumulativeBlackScore !== roundBlackScore)) {
            // Solo mostrar puntajes acumulativos si son diferentes a los de la ronda
            let cumulativeInfo = modalElement.querySelector('.cumulative-scores-info');
            if (!cumulativeInfo) {
                cumulativeInfo = document.createElement('div');
                cumulativeInfo.className = 'cumulative-scores-info';
                cumulativeInfo.style.cssText = `
                    margin-top: 10px;
                    padding: 8px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 6px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #ccc;
                `;
                
                // Insertarlo después de las estadísticas principales
                const scoresSection = modalElement.querySelector('.scores-section') || modalElement.querySelector('.modal-content');
                if (scoresSection) {
                    scoresSection.appendChild(cumulativeInfo);
                }
            }
            
            cumulativeInfo.innerHTML = `
                <div style="margin-bottom: 4px;">📊 <strong>Puntajes Acumulativos:</strong></div>
                <div>Blancas: ${cumulativeWhiteScore} | Negras: ${cumulativeBlackScore}</div>
            `;
        }

        // Get real detailed stats from gameStats
        const whiteStats = this.getRealStats(roundData.gameStats, 'white');
        const blackStats = this.getRealStats(roundData.gameStats, 'black');

        // Display detailed breakdowns
        document.getElementById('modalWhiteCaptured').textContent = whiteStats.captured;
        document.getElementById('modalWhitePowerups').textContent = whiteStats.powerups;
        document.getElementById('modalWhiteTurns').textContent = whiteStats.turns;

        document.getElementById('modalBlackCaptured').textContent = blackStats.captured;
        document.getElementById('modalBlackPowerups').textContent = blackStats.powerups;
        document.getElementById('modalBlackTurns').textContent = blackStats.turns;
    }    /**
     * Displays performance statistics with comparison bars
     */
    displayPerformanceStats(roundData) {
        const whiteScore = roundData.whiteScore || 0;
        const blackScore = roundData.blackScore || 0;
        
        // Get real performance metrics from gameStats
        const whiteStats = this.getRealStats(roundData.gameStats, 'white');
        const blackStats = this.getRealStats(roundData.gameStats, 'black');

        // Calculate ratios
        const whiteCaptureRatio = whiteStats.turns > 0 ? (whiteStats.captured / whiteStats.turns).toFixed(2) : '0.00';
        const blackCaptureRatio = blackStats.turns > 0 ? (blackStats.captured / blackStats.turns).toFixed(2) : '0.00';
        
        const whitePointsPerCapture = whiteStats.captured > 0 ? (whiteScore / whiteStats.captured).toFixed(1) : '0.0';
        const blackPointsPerCapture = blackStats.captured > 0 ? (blackScore / blackStats.captured).toFixed(1) : '0.0';
        
        const whitePowerupRatio = whiteStats.turns > 0 ? (whiteStats.powerups / whiteStats.turns).toFixed(2) : '0.00';
        const blackPowerupRatio = blackStats.turns > 0 ? (blackStats.powerups / blackStats.turns).toFixed(2) : '0.00';

        // Update display
        document.getElementById('modalWhiteCaptureRatio').textContent = whiteCaptureRatio;
        document.getElementById('modalBlackCaptureRatio').textContent = blackCaptureRatio;
        document.getElementById('modalWhitePointsPerCapture').textContent = whitePointsPerCapture;
        document.getElementById('modalBlackPointsPerCapture').textContent = blackPointsPerCapture;
        document.getElementById('modalWhitePowerupRatio').textContent = whitePowerupRatio;
        document.getElementById('modalBlackPowerupRatio').textContent = blackPowerupRatio;
        document.getElementById('modalWhitePowerupEfficiency').textContent = `${Math.min(100, Math.round(whiteStats.powerups * 20))}%`;
        document.getElementById('modalBlackPowerupEfficiency').textContent = `${Math.min(100, Math.round(blackStats.powerups * 20))}%`;

        // Update comparison bar widths
        this.updateComparisonBars(whiteCaptureRatio, blackCaptureRatio, 'modalWhiteCaptureBar', 'modalBlackCaptureBar');
        this.updateComparisonBars(whitePointsPerCapture, blackPointsPerCapture, 'modalWhitePointsBar', 'modalBlackPointsBar');
        this.updateComparisonBars(whitePowerupRatio, blackPowerupRatio, 'modalWhitePowerupBar', 'modalBlackPowerupBar');
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
     * Displays series progress with win circles
     */
    displaySeriesProgress(roundData) {
        const whiteWins = roundData.winsWhite || 0;
        const blackWins = roundData.winsBlack || 0;
        
        // Create win circles for white
        const whiteCirclesContainer = document.getElementById('modalWhiteWinsCircles');
        whiteCirclesContainer.innerHTML = '';        for (let i = 0; i < 2; i++) {
            const circle = document.createElement('div');
            circle.className = `win-circle ${i < whiteWins ? 'filled' : ''}`;
            whiteCirclesContainer.appendChild(circle);
        }
        
        // Create win circles for black
        const blackCirclesContainer = document.getElementById('modalBlackWinsCircles');
        blackCirclesContainer.innerHTML = '';        for (let i = 0; i < 2; i++) {
            const circle = document.createElement('div');
            circle.className = `win-circle ${i < blackWins ? 'filled' : ''}`;
            blackCirclesContainer.appendChild(circle);
        }// Update series status
        const maxWins = Math.max(whiteWins, blackWins);
        if (maxWins >= 2) {
            document.getElementById('modalSeriesStatus').textContent = 'Serie Completada';
        } else {
            document.getElementById('modalSeriesStatus').textContent = `Al mejor de 2 rondas`;
        }
    }    /**
     * Configures action buttons based on game state
     */    configureActionButtons(roundData) {
        const nextRoundBtn = document.getElementById('modalNextRoundBtn');
        const newGameBtn = document.getElementById('modalNewGameBtn');
        const continueBtn = document.getElementById('modalCloseBtn');
        
        const whiteWins = roundData.winsWhite || 0;
        const blackWins = roundData.winsBlack || 0;
        const maxWins = Math.max(whiteWins, blackWins);
        
        if (maxWins >= 2) {
            // Series is over (best of 2 means first to 2 wins)
            nextRoundBtn.style.display = 'none';
            newGameBtn.style.display = 'flex';
            continueBtn.style.display = 'none'; // Hide Continue button when series is over
        } else {
            // Series continues - show Next Round button prominently and hide Continue
            nextRoundBtn.style.display = 'flex';
            newGameBtn.style.display = 'none';
            continueBtn.style.display = 'none'; // Hide Continue button to avoid confusion
        }
    }    /**
     * Gets real game statistics from gameStats (fallback method)
     * This method is now used as a fallback when database data is not available
     */
    getRealStats(gameStats, color) {
        if (!gameStats || !gameStats[color]) {
            // Fallback to default values if gameStats is not available
            return {
                turns: 0,
                captured: 0,
                powerups: 0
            };
        }
        
        return {
            turns: gameStats[color].turns || 0,
            captured: gameStats[color].captured || 0,
            powerups: gameStats[color].powerupsUsed || 0
        };
    }/**
     * Triggers next round action
     */    triggerNextRound() {
        // Dispatch custom event for next round
        window.dispatchEvent(new CustomEvent('nextRound', {
            detail: { roundData: this.currentRoundData }
        }));
    }

    /**
     * Triggers new game action
     */    triggerNewGame() {
        // Dispatch custom event for new game
        window.dispatchEvent(new CustomEvent('newGame', {
            detail: { roundData: this.currentRoundData }
        }));
    }

    /**
     * Resets modal state
     */
    resetModalState() {
        this.showLoadingState();
        this.currentRoundData = null;
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
    module.exports = RoundStatsModal;
} else {
    window.RoundStatsModal = RoundStatsModal;
}
