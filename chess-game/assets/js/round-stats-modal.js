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
            document.getElementById('roundTitle').textContent = `Ronda ${roundData.round} Completada`;

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
        // Usar el endpoint correcto que existe en el servidor
        const apiUrl = '/api/rounds/stats';
        
        // Build query parameters based on available context
        const params = new URLSearchParams();
        
        // Prioridad 1: Filtrar por IDs de jugadores si están disponibles
        if (gameContext.playerIds && (gameContext.playerIds.w || gameContext.playerIds.b)) {
            // Agregar ambos jugadores como filtros separados si están disponibles
            if (gameContext.playerIds.w) {
                params.append('id_jugador', gameContext.playerIds.w);
                console.log('Adding white player filter:', gameContext.playerIds.w);
            }
            if (gameContext.playerIds.b) {
                // Para obtener estadísticas de ambos jugadores, hacer 2 llamadas separadas
                // Por ahora, usar solo un jugador para simplicidad
                if (!gameContext.playerIds.w) {
                    params.append('id_jugador', gameContext.playerIds.b);
                    console.log('Adding black player filter:', gameContext.playerIds.b);
                }
            }
        }
        
        // Nota: El endpoint /api/rounds/stats no acepta filtro por id_partida o id_ronda
        // Se basa en estadísticas agregadas por jugador a través de todas las rondas
        
        const fullUrl = params.toString() ? `${apiUrl}?${params}` : apiUrl;
        
        console.log('Fetching round stats from:', fullUrl);
        
        const response = await fetch(fullUrl);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            console.log('Round stats fetched successfully:', result.data);
            return result.data;
        } else {
            throw new Error('Invalid API response format');
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
        // Basic scores from roundData (these come from the game logic)
        document.getElementById('modalWhiteScore').textContent = roundData.whiteScore || 0;
        document.getElementById('modalBlackScore').textContent = roundData.blackScore || 0;

        // Try to map database stats to players
        const whiteStats = this.findPlayerStats(dbStats, 'white');
        const blackStats = this.findPlayerStats(dbStats, 'black');

        // Display detailed breakdowns from database
        document.getElementById('modalWhiteCaptured').textContent = whiteStats.piezasCapturadas || 0;
        document.getElementById('modalWhitePowerups').textContent = whiteStats.powerupsUsados || 0;
        document.getElementById('modalWhiteTurns').textContent = whiteStats.turnosTomados || 0;

        document.getElementById('modalBlackCaptured').textContent = blackStats.piezasCapturadas || 0;
        document.getElementById('modalBlackPowerups').textContent = blackStats.powerupsUsados || 0;
        document.getElementById('modalBlackTurns').textContent = blackStats.turnosTomados || 0;
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
        const whiteCaptureRatio = whiteStats.turnosTomados > 0 ? 
            (whiteStats.piezasCapturadas / whiteStats.turnosTomados).toFixed(2) : '0.00';
        const blackCaptureRatio = blackStats.turnosTomados > 0 ? 
            (blackStats.piezasCapturadas / blackStats.turnosTomados).toFixed(2) : '0.00';
        
        const whitePointsPerCapture = whiteStats.piezasCapturadas > 0 ? 
            (whiteScore / whiteStats.piezasCapturadas).toFixed(1) : '0.0';
        const blackPointsPerCapture = blackStats.piezasCapturadas > 0 ? 
            (blackScore / blackStats.piezasCapturadas).toFixed(1) : '0.0';
        
        const whitePowerupRatio = whiteStats.turnosTomados > 0 ? 
            (whiteStats.powerupsUsados / whiteStats.turnosTomados).toFixed(2) : '0.00';
        const blackPowerupRatio = blackStats.turnosTomados > 0 ? 
            (blackStats.powerupsUsados / blackStats.turnosTomados).toFixed(2) : '0.00';

        // PowerUp efficiency calculation
        const whitePowerupEfficiency = whiteStats.powerupsUsados > 0 ? 
            Math.min(100, Math.round((whiteScore / whiteStats.powerupsUsados) * 10)) : 0;
        const blackPowerupEfficiency = blackStats.powerupsUsados > 0 ? 
            Math.min(100, Math.round((blackScore / blackStats.powerupsUsados) * 10)) : 0;

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
            piezasCapturadas: 0,
            piezasPerdidas: 0,
            powerupsUsados: 0,
            turnosTomados: 0,
            rondasJugadas: 0
        };

        if (!dbStats || !Array.isArray(dbStats) || dbStats.length === 0) {
            return defaultStats;
        }

        // Try to get player context
        const gameContext = this.getGameContext();
        
        if (gameContext.playerIds) {
            const playerId = playerColor === 'white' ? gameContext.playerIds.w : gameContext.playerIds.b;
            
            // Find stats by player ID
            const playerStats = dbStats.find(stat => stat.jugadorId === parseInt(playerId));
            if (playerStats) {
                return {
                    piezasCapturadas: playerStats.piezasCapturadas || 0,
                    piezasPerdidas: playerStats.piezasPerdidas || 0,
                    powerupsUsados: playerStats.powerupsUsados || 0,
                    turnosTomados: playerStats.turnosTomados || 0,
                    rondasJugadas: playerStats.rondasJugadas || 0
                };
            }
        }

        // Fallback: if we have exactly 2 players, assign by index
        if (dbStats.length === 2) {
            const playerIndex = playerColor === 'white' ? 0 : 1;
            const playerStats = dbStats[playerIndex];
            return {
                piezasCapturadas: playerStats.piezasCapturadas || 0,
                piezasPerdidas: playerStats.piezasPerdidas || 0,
                powerupsUsados: playerStats.powerupsUsados || 0,
                turnosTomados: playerStats.turnosTomados || 0,
                rondasJugadas: playerStats.rondasJugadas || 0
            };
        }

        // Fallback: use first available stats or defaults
        return dbStats.length > 0 ? {
            piezasCapturadas: dbStats[0].piezasCapturadas || 0,
            piezasPerdidas: dbStats[0].piezasPerdidas || 0,
            powerupsUsados: dbStats[0].powerupsUsados || 0,
            turnosTomados: dbStats[0].turnosTomados || 0,
            rondasJugadas: dbStats[0].rondasJugadas || 0        } : defaultStats;
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
