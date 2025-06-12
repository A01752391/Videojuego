import { getSymbol, coordsToAlgebraic } from './utils.js';
import { midgameBoards } from './boards/midgameBoards.js';
import { setupGameContext, initGame } from './game.js';

const EMPTY = null;

// Control de rondas
let round = 1;
let winsWhite = 0;
let winsBlack = 0;

// Round Statistics Modal
let roundStatsModal = null;

// Game Statistics Modal
let gameStatsModal = null;

// Global game context variable
let gameContext = null;

// Game series data collection
let gameSeriesData = {
    rounds: [],
    startDate: new Date().toISOString(),
    startTime: Date.now(),
    duration: null
};

/**
 * Selects a random board configuration from a given array and performs a deep copy.
 * @param {Array<Array<Array<object|null>>>} boardArray - Array of board configurations.
 * @returns {Array<Array<object|null>>|null} A deep copy of a random board, or null if error.
 */
function getRandomBoard(boardArray) {
    if (!boardArray || boardArray.length === 0) {
        console.error("Board array is empty or undefined. Cannot select a random board.");
        return null;
    }
    const randomIndex = Math.floor(Math.random() * boardArray.length);
    try {
        return JSON.parse(JSON.stringify(boardArray[randomIndex]));
    } catch (e) {
        console.error("Error deep copying board:", e);
        return null; // Fallback or re-throw
    }
}

/**
 * Updates the display of round wins for both players.
 */
function updateRoundWinsDisplay() {
    const whiteRoundsEl = document.getElementById('rounds1');
    const blackRoundsEl = document.getElementById('rounds2');
    if (whiteRoundsEl) whiteRoundsEl.textContent = winsWhite;
    if (blackRoundsEl) blackRoundsEl.textContent = winsBlack;
}

/**
 * Creates and appends a "Next Round" button to the document body.
 * @param {object} gameContext - The current game context.
 */
function createNextRoundButton(gameContext) {
    const existingBtn = document.querySelector('button.next-round-button');
    if (existingBtn) existingBtn.remove(); // Remove if one already exists

    const btn = document.createElement('button');
    btn.className = 'reset-button next-round-button image-button-game'; // Use general styling, add specific class
    
    // Create image element
    const img = document.createElement('img');
    img.src = '/images/nextroundbutton.png';
    img.alt = 'Next Round';
    img.className = 'game-button-image';
    
    btn.appendChild(img);    btn.addEventListener('click', async () => {
        round++;
        btn.remove();
        
        // NUEVO: Crear nueva ronda en base de datos
        try {
            if (gameContext.currentGameId) {
                const { createNewRound } = await import('./pruebasAPI.js');
                const roundId = await createNewRound(gameContext.currentGameId, round);
                gameContext.currentRoundId = roundId;
                console.log(`✅ Nueva ronda ${round} creada en BD con ID: ${roundId}`);
            }
        } catch (error) {
            console.error('❌ Error creando nueva ronda en BD:', error);
        }
        
        resetRound(gameContext); // Solo resetear la ronda
    });
    
    // Append to buttons container instead of document.body
    const buttonsContainer = document.getElementById('buttons-container');
    if (buttonsContainer) {
        buttonsContainer.appendChild(btn);
    } else {
        document.body.appendChild(btn);
    }
}

/**
 * Resets only the round state (keeps scores and power-ups between rounds).
 * @param {object} gameContext - The current game context.
 */
function resetRound(gameContext) {
    let newBoard;

    // Determine board based on current round and wins
    if (round === 1) {
        newBoard = getRandomBoard(midgameBoards.neutral);
    } else if (round === 2) {
        if (winsWhite === 1 && winsBlack === 0) {
            newBoard = getRandomBoard(midgameBoards.favorBlack);
        } else if (winsBlack === 1 && winsWhite === 0) {
            newBoard = getRandomBoard(midgameBoards.favorWhite);
        } else { // Draw or unexpected state
            newBoard = getRandomBoard(midgameBoards.neutral);
        }
    } else if (round === 3) { // Game is 1-1
        newBoard = getRandomBoard(midgameBoards.neutral);
    } else { // Should not be reached if game ends after 2 wins or 3 rounds
        newBoard = getRandomBoard(midgameBoards.neutral);
    }

    if (!newBoard && gameContext.standardInitialBoard) {
        console.error("Failed to load midgame board. Falling back to standard initial board.");
        newBoard = gameContext.standardInitialBoard();
    } else if (!newBoard) {
        console.error("CRITICAL: Failed to load any board. Game cannot continue.");
        if(gameContext.messageElement) gameContext.messageElement.textContent = "Error al cargar el tablero!";
        return;
    }
    gameContext.board = newBoard;

    // Reset game state for new round (NO resetear scores ni power-ups)
    gameContext.currentColor = 'w';
    gameContext.selected = null;
    gameContext.gameOver = false;
    
    // Reset power-ups activos y vallas (estos sí se resetean cada ronda)
    gameContext.fencedTiles = [];
    gameContext.activePowerUps = [];
    gameContext.awaitingPowerUpTarget = null;
    gameContext.swapSelection = null;
    gameContext.pawnRangeActive = {};
    gameContext.crazyKingActive = {};

    // CRÍTICO: Reset de estadísticas de ronda para ROUND STATS MODAL
    // Esto asegura que cada ronda empiece con estadísticas en 0
    console.log('🔄 Reseteando estadísticas de ronda. Puntajes acumulativos se mantienen:', {
        whiteTotal: gameContext.score1,
        blackTotal: gameContext.score2,
        round: round
    });
    
    gameContext.gameStats = {
        white: {
            turns: 0,
            captured: 0,
            powerupsUsed: 0,
            roundScore: 0
        },
        black: {
            turns: 0,
            captured: 0,
            powerupsUsed: 0,
            roundScore: 0
        }
    };

    updateRoundWinsDisplay();
    if(gameContext.messageElement) gameContext.messageElement.textContent = `Ronda ${round}. Turno de las Blancas.`;
    gameContext.renderBoard();
}

/**
 * Resets the entire game state (full restart).
 * @param {object} gameContext - The current game context.
 */
function resetGame(gameContext) {
    // Reset round counters
    round = 1;
    winsWhite = 0;
    winsBlack = 0;

    // Get neutral board for new game
    const newBoard = getRandomBoard(midgameBoards.neutral);
    
    if (!newBoard && gameContext.standardInitialBoard) {
        console.error("Failed to load midgame board. Falling back to standard initial board.");
        gameContext.board = gameContext.standardInitialBoard();
    } else if (!newBoard) {
        console.error("CRITICAL: Failed to load any board. Game cannot continue.");
        if(gameContext.messageElement) gameContext.messageElement.textContent = "Error al cargar el tablero!";
        return;
    } else {
        gameContext.board = newBoard;
    }

    // Reset scores for a full game restart
    gameContext.score1 = 0;
    gameContext.score2 = 0;
    const score1El = document.getElementById('score1');
    const score2El = document.getElementById('score2');
    if (score1El) score1El.textContent = '0';
    if (score2El) score2El.textContent = '0';

    // Reset power-ups for a full game restart
    gameContext.powerUpsWhite = [];
    gameContext.powerUpsBlack = [];
    gameContext.nextThresholdWhite = 5;
    gameContext.nextThresholdBlack = 5;

    // Reset game state
    gameContext.currentColor = 'w';
    gameContext.selected = null;
    gameContext.gameOver = false;
    
    // Reset power-ups activos y vallas
    gameContext.fencedTiles = [];
    gameContext.activePowerUps = [];
    gameContext.awaitingPowerUpTarget = null;
    gameContext.swapSelection = null;
    gameContext.pawnRangeActive = {};
    gameContext.crazyKingActive = {};

    // Reset estadísticas de ronda
    gameContext.gameStats = {
        white: {
            turns: 0,
            captured: 0,
            powerupsUsed: 0,
            roundScore: 0
        },
        black: {
            turns: 0,
            captured: 0,
            powerupsUsed: 0,
            roundScore: 0
        }
    };

    updateRoundWinsDisplay();
    if(gameContext.messageElement) gameContext.messageElement.textContent = `Ronda ${round}. Turno de las Blancas.`;
    gameContext.renderBoard();
}

/**
 * Handles the end of a round when a player wins.
 * @param {string} winner - The color of the winning player ('w' for white, 'b' for black, or 'stalemate').
 * @param {object} gameContext - The current game context.
 */
function handleRoundEnd(winner, gameContext) {
    // Handle stalemate case
    if (winner === 'stalemate') {
        // Both players get a win for stalemate
        winsWhite++;
        winsBlack++;
    } else if (winner === 'w') {
        winsWhite++;
    } else if (winner === 'b') {
        winsBlack++;
    }
      updateRoundWinsDisplay();    
    
    // CRITICAL FIX: Capturar solo los datos de la ronda actual para el modal
    const currentRoundWhiteStats = {
        turns: gameContext.gameStats?.white?.turns || 0,
        captured: gameContext.gameStats?.white?.captured || 0,
        powerupsUsed: gameContext.gameStats?.white?.powerupsUsed || 0,
        roundScore: gameContext.gameStats?.white?.roundScore || 0
    };
    const currentRoundBlackStats = {
        turns: gameContext.gameStats?.black?.turns || 0,
        captured: gameContext.gameStats?.black?.captured || 0,
        powerupsUsed: gameContext.gameStats?.black?.powerupsUsed || 0,
        roundScore: gameContext.gameStats?.black?.roundScore || 0
    };

    // CORREGIDO: Datos consistentes para el modal de ronda
    const roundData = {
        roundNumber: round,
        winner: winner,
        // Puntajes de la ronda actual solamente
        whiteScore: currentRoundWhiteStats.roundScore,
        blackScore: currentRoundBlackStats.roundScore,
        // Puntajes acumulativos para referencia
        whiteCumulativeScore: gameContext.score1 || 0,
        blackCumulativeScore: gameContext.score2 || 0,
        winsWhite: winsWhite,
        winsBlack: winsBlack,
        stalemateReason: winner === 'stalemate' ? 'Tablas por ahogado o solo dos reyes' : null,
        // Estadísticas detalladas de la ronda actual
        gameStats: {
            white: currentRoundWhiteStats,
            black: currentRoundBlackStats
        },
        gameSeriesData: gameSeriesData,
        timestamp: new Date().toISOString()
    };

    console.log('📊 Datos del modal de ronda:', {
        round: round,
        whiteRoundScore: currentRoundWhiteStats.roundScore,
        blackRoundScore: currentRoundBlackStats.roundScore,
        whiteCumulative: gameContext.score1,
        blackCumulative: gameContext.score2
    });

    // Prepare current round data for series (with cumulative scores)
    const currentRoundData = {
        roundNumber: round,
        winner: winner,
        whiteScore: gameContext.score1 || 0, // Cumulative score for series
        blackScore: gameContext.score2 || 0, // Cumulative score for series
        // Incluir también los puntajes de solo esta ronda
        whiteRoundScore: currentRoundWhiteStats.roundScore,
        blackRoundScore: currentRoundBlackStats.roundScore,
        gameStats: {
            white: currentRoundWhiteStats,
            black: currentRoundBlackStats
        },
        timestamp: new Date().toISOString()
    };
      // Add round data to series ALWAYS (for both ending and non-ending rounds)
    gameSeriesData.rounds.push(currentRoundData);
    
    // Check if game is over (best of 3)
    const gameEnded = winsWhite === 2 || winsBlack === 2 || round === 3;
    
    // NUEVO: Función para actualizar Jugador_Partida con puntajes acumulativos DESPUÉS DE CADA RONDA
    async function updateJugadorPartidaAfterRound() {
        try {
            console.log('📊 Actualizando Jugador_Partida después de ronda:', round);
            const { updateJugadorPartida } = await import('./pruebasAPI.js');
            const gameId = gameContext.currentGameId;
            const playerIds = gameContext.playerIds;
            
            if (!gameId || !playerIds || !playerIds.w || !playerIds.b) {
                console.warn('⚠️ Datos faltantes para actualizar Jugador_Partida:', { gameId, playerIds });
                return;
            }

            // Calcular turnos totales acumulados hasta esta ronda
            const totalWhiteTurns = gameSeriesData.rounds.reduce((total, round) => {
                return total + (round.gameStats?.white?.turns || 0);
            }, 0);
            
            const totalBlackTurns = gameSeriesData.rounds.reduce((total, round) => {
                return total + (round.gameStats?.black?.turns || 0);
            }, 0);

            console.log('📊 Estadísticas después de ronda:', {
                round: round,
                whiteCumulativeScore: gameContext.score1,
                blackCumulativeScore: gameContext.score2,
                totalWhiteTurns,
                totalBlackTurns
            });

            // Actualizar Jugador_Partida con puntajes acumulativos después de la ronda
            await updateJugadorPartida({
                id_jugador: playerIds.w,
                id_partida: gameId,
                puntaje: gameContext.score1 || 0, // Puntaje ACUMULATIVO actualizado
                turnos_jugados: totalWhiteTurns,
                color: 'w'
            });
            
            await updateJugadorPartida({
                id_jugador: playerIds.b,
                id_partida: gameId,
                puntaje: gameContext.score2 || 0, // Puntaje ACUMULATIVO actualizado
                turnos_jugados: totalBlackTurns,
                color: 'b'
            });
            
            console.log('✅ Jugador_Partida actualizado después de ronda', round);
        } catch (err) {
            console.error('❌ Error actualizando Jugador_Partida después de ronda:', err);
        }
    }
    
    // NUEVO: Actualizar Jugador_Partida después de cada ronda
    updateJugadorPartidaAfterRound();
    
    // NUEVO: Función para actualizar Jugador_Partida con puntajes finales acumulativos
    async function updateJugadorPartidaFinalStats() {
        try {
            console.log('🏁 Actualizando estadísticas finales de Jugador_Partida...');
            const { updateJugadorPartida } = await import('./pruebasAPI.js');
            const gameId = gameContext.currentGameId;
            const playerIds = gameContext.playerIds;
            
            if (!gameId || !playerIds || !playerIds.w || !playerIds.b) {
                console.warn('⚠️ Datos faltantes para actualizar Jugador_Partida:', { gameId, playerIds });
                return;
            }

            // Calcular turnos totales acumulados de todas las rondas
            const totalWhiteTurns = gameSeriesData.rounds.reduce((total, round) => {
                return total + (round.gameStats?.white?.turns || 0);
            }, 0);
            
            const totalBlackTurns = gameSeriesData.rounds.reduce((total, round) => {
                return total + (round.gameStats?.black?.turns || 0);
            }, 0);

            console.log('📊 Estadísticas finales:', {
                whiteFinalScore: gameContext.score1,
                blackFinalScore: gameContext.score2,
                totalWhiteTurns,
                totalBlackTurns
            });

            // Actualizar Jugador_Partida con puntajes acumulativos finales
            await updateJugadorPartida({
                id_jugador: playerIds.w,
                id_partida: gameId,
                puntaje: gameContext.score1 || 0, // Puntaje ACUMULATIVO final
                turnos_jugados: totalWhiteTurns,
                color: 'w'
            });
            
            await updateJugadorPartida({
                id_jugador: playerIds.b,
                id_partida: gameId,
                puntaje: gameContext.score2 || 0, // Puntaje ACUMULATIVO final
                turnos_jugados: totalBlackTurns,
                color: 'b'
            });
            
            console.log('✅ Estadísticas finales de Jugador_Partida actualizadas correctamente');
        } catch (err) {
            console.error('❌ Error actualizando estadísticas finales de Jugador_Partida:', err);
        }
    }
    
    // Show the round statistics modal ONLY if game hasn't ended
    if (!gameEnded && roundStatsModal) {
        roundStatsModal.show(roundData);
    }
    
    if (winsWhite === 2) {
        if(gameContext.messageElement) {
            gameContext.messageElement.textContent = "¡Las Blancas ganan la partida 2-" + winsBlack + "!";
        }
        gameContext.gameOver = true;
        gameSeriesData.winner = 'w';
        gameSeriesData.duration = Date.now() - gameSeriesData.startTime;
        
        // NUEVO: Finalizar partida en BD
        (async () => {
            try {
                if (gameContext.currentGameId && gameContext.playerIds && gameContext.playerIds.w) {
                    // 1. Actualizar Jugador_Partida con puntajes finales
                    await updateJugadorPartidaFinalStats();
                    
                    // 2. Finalizar partida
                    const { finalizeGame, createGameStats } = await import('./pruebasAPI.js');
                    await finalizeGame(gameContext.currentGameId, gameContext.playerIds.w, gameSeriesData.duration);
                    console.log('✅ Partida finalizada en BD - Ganador: Blancas');
                    
                    // 3. Crear estadísticas de partida
                    await createGameStats(gameContext.currentGameId);
                    console.log('✅ Estadísticas de partida creadas en BD');
                }
            } catch (error) {
                console.error('❌ Error finalizando partida en BD:', error);
            }
        })();
    } else if (winsBlack === 2) {
        if(gameContext.messageElement) {
            gameContext.messageElement.textContent = "¡Las Negras ganan la partida 2-" + winsWhite + "!";
        }
        gameContext.gameOver = true;
        gameSeriesData.winner = 'b';
        gameSeriesData.duration = Date.now() - gameSeriesData.startTime;
        
        // NUEVO: Finalizar partida en BD
        (async () => {
            try {
                if (gameContext.currentGameId && gameContext.playerIds && gameContext.playerIds.b) {
                    // 1. Actualizar Jugador_Partida con puntajes finales
                    await updateJugadorPartidaFinalStats();
                    
                    // 2. Finalizar partida
                    const { finalizeGame, createGameStats } = await import('./pruebasAPI.js');
                    await finalizeGame(gameContext.currentGameId, gameContext.playerIds.b, gameSeriesData.duration);
                    console.log('✅ Partida finalizada en BD - Ganador: Negras');
                    
                    // 3. Crear estadísticas de partida
                    await createGameStats(gameContext.currentGameId);
                    console.log('✅ Estadísticas de partida creadas en BD');
                }
            } catch (error) {
                console.error('❌ Error finalizando partida en BD:', error);
            }
        })();
    } else if (round === 3) {
        // Third round completed, determine winner
        if (winsWhite > winsBlack) {
            if(gameContext.messageElement) {
                gameContext.messageElement.textContent = "¡Las Blancas ganan la partida " + winsWhite + "-" + winsBlack + "!";
            }
            gameSeriesData.winner = 'w';
        } else if (winsBlack > winsWhite) {
            if(gameContext.messageElement) {
                gameContext.messageElement.textContent = "¡Las Negras ganan la partida " + winsBlack + "-" + winsWhite + "!";
            }
            gameSeriesData.winner = 'b';
        } else {
            if(gameContext.messageElement) {
                gameContext.messageElement.textContent = "¡Partida empatada " + winsWhite + "-" + winsBlack + "!";
            }
            gameSeriesData.winner = 'tie';
        }
        gameContext.gameOver = true;
        gameSeriesData.duration = Date.now() - gameSeriesData.startTime;
        
        // NUEVO: Finalizar partida en BD después de ronda 3
        (async () => {
            try {
                // Siempre actualizar Jugador_Partida, independientemente del resultado
                await updateJugadorPartidaFinalStats();
                
                if (gameContext.currentGameId && gameContext.playerIds && gameSeriesData.winner && gameSeriesData.winner !== 'tie') {
                    const winnerId = gameContext.playerIds[gameSeriesData.winner];
                    if (winnerId) {
                        const { finalizeGame, createGameStats } = await import('./pruebasAPI.js');
                        await finalizeGame(gameContext.currentGameId, winnerId, gameSeriesData.duration);
                        console.log(`✅ Partida finalizada en BD después de ronda 3 - Ganador: ${gameSeriesData.winner === 'w' ? 'Blancas' : 'Negras'}`);
                        
                        // Crear estadísticas de partida
                        await createGameStats(gameContext.currentGameId);
                        console.log('✅ Estadísticas de partida creadas en BD');
                    }
                } else if (gameSeriesData.winner === 'tie') {
                    console.log('🤝 Partida empatada - no se actualiza ganador en BD');
                    
                    // Incluso en empate, crear estadísticas de partida (sin ganador)
                    if (gameContext.currentGameId) {
                        const { createGameStats } = await import('./pruebasAPI.js');
                        await createGameStats(gameContext.currentGameId);
                        console.log('✅ Estadísticas de partida creadas en BD (empate)');
                    }
                }
            } catch (error) {
                console.error('❌ Error finalizando partida en BD:', error);
            }
        })();    }
      // If game ended, show game statistics modal directly
    if (gameEnded) {
        // CORREGIDO: Preparar gameSeriesData con estadísticas finales correctas
        gameSeriesData.finalStats = {
            totalWhiteScore: gameContext.score1 || 0,
            totalBlackScore: gameContext.score2 || 0,
            totalRounds: gameSeriesData.rounds.length,
            whiteWins: winsWhite,
            blackWins: winsBlack
        };
        
        console.log('📊 Datos del modal de partida completa:', {
            gameSeriesData: gameSeriesData,
            finalWhiteScore: gameContext.score1,
            finalBlackScore: gameContext.score2,
            totalRounds: gameSeriesData.rounds.length,
            whiteWins: winsWhite,
            blackWins: winsBlack
        });
        
        // Show game statistics modal immediately when game ends
        if (gameStatsModal) {
            setTimeout(() => {
                gameStatsModal.show(gameSeriesData);
            }, 500); // Small delay to allow win message to be seen
        } else {
            console.error('gameStatsModal is null or undefined');
        }
        
        // Listen for game stats modal events to handle new game
        const handleGameStatsEvent = (event) => {
            if (event.type === 'newGame') {
                // Reset everything for new game
                round = 1;
                winsWhite = 0;
                winsBlack = 0;
                
                // Reset game series data
                gameSeriesData = {
                    rounds: [],
                    startDate: new Date().toISOString(),
                    startTime: Date.now(),
                    duration: null
                };
                
                resetGame(gameContext);
            }
            
            // Remove the event listener after handling
            window.removeEventListener('newGame', handleGameStatsEvent);
        };
        
        // Add event listener for new game from game stats modal
        window.addEventListener('newGame', handleGameStatsEvent);} else {
        // Game continues - add simple event listeners for next round
        const handleContinueGame = async (event) => {
            if (event.type === 'nextRound' && gameContext && !gameContext.gameOver) {
                round++;
                
                // NUEVO: Crear nueva ronda en base de datos
                try {
                    if (gameContext.currentGameId) {
                        const { createNewRound } = await import('./pruebasAPI.js');
                        const roundId = await createNewRound(gameContext.currentGameId, round);
                        gameContext.currentRoundId = roundId;
                        console.log(`✅ Nueva ronda ${round} creada en BD con ID: ${roundId}`);
                    }
                } catch (error) {
                    console.error('❌ Error creando nueva ronda en BD:', error);
                }
                
                resetRound(gameContext); // Solo resetear la ronda, no el juego completo
            } else if (event.type === 'newGame' && gameContext) {
                round = 1;
                winsWhite = 0;
                winsBlack = 0;
                
                gameSeriesData = {
                    rounds: [],
                    startDate: new Date().toISOString(),
                    startTime: Date.now(),
                    duration: null
                };
                
                resetGame(gameContext); // Reset completo del juego
            }
            
            // Remove listeners after use
            window.removeEventListener('newGame', handleContinueGame);
            window.removeEventListener('nextRound', handleContinueGame);
        };
          window.addEventListener('newGame', handleContinueGame);
        window.addEventListener('nextRound', handleContinueGame);
    }

    // NUEVO: Actualizar ganador en la base de datos
    async function updateRoundWinnerInDB() {
        try {
            if (gameContext.currentRoundId && gameContext.playerIds && winner !== 'stalemate') {
                const winnerId = gameContext.playerIds[winner];
                if (winnerId) {
                    // Importar la función de actualización
                    const { updateRoundWinner } = await import('./pruebasAPI.js');
                    await updateRoundWinner(gameContext.currentRoundId, winnerId);
                    console.log('✅ Ganador de ronda actualizado en BD');
                } else {
                    console.warn('⚠️ No se encontró ID del jugador ganador para color:', winner);
                }
            } else {
                console.warn('⚠️ No se puede actualizar ganador - datos faltantes:', {
                    currentRoundId: gameContext.currentRoundId,
                    playerIds: gameContext.playerIds,
                    winner: winner
                });
            }
        } catch (error) {
            console.error('❌ Error actualizando ganador de ronda en BD:', error);
        }
    }

    // Llamar a la función para actualizar el ganador en BD
    if (winner !== 'stalemate') {
        updateRoundWinnerInDB();
    }

    // --- NUEVO: Actualizar estadísticas de ronda en la base de datos ---
    // --- NUEVO: Calcular piezas perdidas por jugador ---
    function calcularPiezasPerdidas(gameContext, color) {
        // Suponiendo que tienes acceso al board inicial y board final de la ronda
        // Si no, puedes llevar un contador en gameStats, ej: gameStats.white.lost
        // Aquí un ejemplo simple si tienes acceso a las piezas capturadas del rival:
        if (color === 'w') {
            // Piezas perdidas por blancas = capturas hechas por negras
            return gameContext.gameStats.black.captured || 0;
        } else {
            // Piezas perdidas por negras = capturas hechas por blancas
            return gameContext.gameStats.white.captured || 0;
        }
    }

    async function updateRoundStatsInDB() {
        try {
            const roundId = gameContext.currentRoundId;
            const playerIds = gameContext.playerIds;
            if (!roundId || !playerIds || !playerIds.w || !playerIds.b) return;

            // White
            await fetch(`/api/rounds/stats/${playerIds.w}/${roundId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    piezas_capturadas: gameContext.gameStats.white.captured,
                    piezas_perdidas: calcularPiezasPerdidas(gameContext, 'w'),
                    powerups_usados: gameContext.gameStats.white.powerupsUsed,
                    turnos_tomados: gameContext.gameStats.white.turns
                })
            });

            // Black
            await fetch(`/api/rounds/stats/${playerIds.b}/${roundId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    piezas_capturadas: gameContext.gameStats.black.captured,
                    piezas_perdidas: calcularPiezasPerdidas(gameContext, 'b'),
                    powerups_usados: gameContext.gameStats.black.powerupsUsed,
                    turnos_tomados: gameContext.gameStats.black.turns
                })
            });
        } catch (err) {
            console.error('Error actualizando estadísticas de ronda:', err);
        }
    }
    updateRoundStatsInDB();
    // --- FIN NUEVO ---

    // --- NUEVO: Actualizar estadísticas de jugador en la base de datos ---
    async function updatePlayerStatsInDB() {
        try {
            const gameId = gameContext.currentGameId;
            const playerIds = gameContext.playerIds;
            if (!gameId || !playerIds || !playerIds.w || !playerIds.b) return;

            // Blancas
            await fetch('/api/playerstats/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_jugador: playerIds.w,
                    id_partida: gameId,
                    piezas_capturadas: gameContext.gameStats.white.captured,
                    muertes: gameContext.gameStats.white.lost || 0, // Si tienes este dato
                    powerups_usados: gameContext.gameStats.white.powerupsUsed,
                    piezas_movidas: gameContext.gameStats.white.turns
                })
            });

            // Negras
            await fetch('/api/playerstats/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_jugador: playerIds.b,
                    id_partida: gameId,
                    piezas_capturadas: gameContext.gameStats.black.captured,
                    muertes: gameContext.gameStats.black.lost || 0, // Si tienes este dato
                    powerups_usados: gameContext.gameStats.black.powerupsUsed,
                    piezas_movidas: gameContext.gameStats.black.turns
                })
            });
        } catch (err) {
            console.error('Error actualizando estadísticas de jugador:', err);
        }
    }
    updatePlayerStatsInDB();
    // --- FIN NUEVO ---

    // NOTA: updateJugadorPartidaStats() se ha movido al final de la partida completa
}

// Registrar turno en la base de datos ---
async function registrarTurnoEnBD(turno) {
    try {
        const response = await fetch('/api/turns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(turno)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error registrando turno');
        console.log('Turno registrado en BD:', data);
    } catch (err) {
        console.error('Error registrando turno en BD:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const messageElement = document.getElementById('message');
    const resetButton = document.getElementById('reset');
    const startForm = document.getElementById('game-start-form');
    const mainLayout = document.getElementById('main-layout');
    const startButton = document.getElementById('start-game-btn');

    if (!boardElement || !messageElement || !resetButton || !startForm || !mainLayout || !startButton) {
        console.error("Essential UI elements not found!");
        return;
    }

    // Manejar el inicio de la partida
    startButton.addEventListener('click', async () => {
        const whitePlayerEmail = document.getElementById('white-player').value;
        const blackPlayerEmail = document.getElementById('black-player').value;

        if (!whitePlayerEmail || !blackPlayerEmail) {
            alert('Por favor ingresa el email de ambos jugadores');
            return;
        }

        if (whitePlayerEmail === blackPlayerEmail) {
            alert('Los jugadores deben tener emails diferentes');
            return;
        }

        try {
            // Mostrar mensaje de carga
            startButton.textContent = 'Iniciando partida...';
            startButton.disabled = true;
            
            // NUEVO: Reinicializar gameSeriesData para nueva partida
            gameSeriesData = {
                rounds: [],
                startDate: new Date().toISOString(),
                startTime: Date.now(),
                duration: null
            };
            
            // Inicializar el juego con los emails de los jugadores
            gameContext = await initGame(whitePlayerEmail, blackPlayerEmail);
              // Asignar el boardElement al gameContext
            gameContext.boardElement = boardElement;
            gameContext.messageElement = messageElement;
            
            // Agregar función para manejar el final de ronda
            gameContext.handleRoundEnd = handleRoundEnd;
            
            // Agregar funciones para declarar ganador y tablas
            gameContext.declareWinner = function(winnerColor) {
                handleRoundEnd(winnerColor, gameContext);
            };
            
            gameContext.declareStalemate = function() {
                handleRoundEnd('stalemate', gameContext);
            };
            
            // Ocultar el formulario y mostrar el tablero
            startForm.style.display = 'none';
            mainLayout.style.display = 'flex';

            // Configurar el resto del juego
            setupGame(gameContext);
        } catch (error) {
            console.error('Error iniciando el juego:', error);
            alert('Error iniciando el juego. Por favor, verifica los emails e intenta de nuevo.');
            
            // Restaurar botón
            startButton.textContent = 'Iniciar Partida';
            startButton.disabled = false;
        }
    });

    function setupGame(gameContext) {
        // Dynamically import modules
        Promise.all([
            import('./board.js'),
            import('./pieces.js'),
            import('./game.js'),
            import('./UI/pauseManager.js'),
        ]).then(([boardModule, piecesModule, gameModule, pauseModule]) => {
            const { initialBoard: standardInitialBoardFunc, renderBoard: renderBoardFunc } = boardModule;
            const { 
                isLegalMove, 
                getPossibleMoves, 
                isBasicLegalMove, 
                isSquareAttacked, 
                findKing, 
                isKingInCheck, 
                isCheckmate,
                isStalemate 
            } = piecesModule;
            const { updateScore: updateScoreFunc, handleClick: handleClickFunc } = gameModule;
            const { PauseManager } = pauseModule;            // Configurar el contexto del juego con todas las funciones necesarias
            Object.assign(gameContext, {
                renderBoard: () => renderBoardFunc(gameContext),
                standardInitialBoard: standardInitialBoardFunc,
                isLegalMove: (fr, fc, tr, tc) => isLegalMove(fr, fc, tr, tc, gameContext),
                getPossibleMoves: (r, c) => getPossibleMoves(r, c, gameContext),
                isBasicLegalMove: (fr, fc, tr, tc) => isBasicLegalMove(fr, fc, tr, tc, gameContext),
                isSquareAttacked: (r, c, color, attackingContext) => isSquareAttacked(r, c, color, attackingContext || gameContext),
                findKing: (board, color) => findKing(board, color),
                isKingInCheck: (boardToCheck, kingColor) => isKingInCheck(boardToCheck || gameContext.board, kingColor, { ...gameContext, board: boardToCheck || gameContext.board }),
                isCheckmate: (color) => isCheckmate(color, gameContext),
                isStalemate: (color) => isStalemate(color, gameContext),
                updateScore: (player) => updateScoreFunc(player, gameContext),
                resetGame: (context) => resetGame(context || gameContext) // Add the local resetGame function
            });

            // Configurar el manejador de pausa
            gameContext.pauseManager = new PauseManager(gameContext);

            // Configurar eventos del tablero
            boardElement.addEventListener('click', async (e) => {
                const cell = e.target.closest('.cell');
                if (cell) {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    await handleClickFunc(row, col, gameContext);
                }
            });

            // Configurar evento del botón de reset
            resetButton.addEventListener('click', () => {            const shouldReset = confirm('¿Estás seguro de que quieres reiniciar el juego?');
            if (shouldReset) {
                resetGame(gameContext); // Reset completo del juego
                gameContext.renderBoard();
            }
            });

            // Renderizar el tablero inicial
            gameContext.renderBoard();
            
            console.log('Juego inicializado correctamente');
            
            // Configurar funciones de debug si están disponibles
            if (window.setGameContextDebug) {
                window.setGameContextDebug();
            }
        }).catch(error => {
            console.error('Error cargando módulos del juego:', error);
            alert('Error cargando los módulos del juego');
        });
    }    // Initialize round statistics modal
    if (typeof RoundStatsModal !== 'undefined') {
        roundStatsModal = new RoundStatsModal();
        
        // Note: Event listeners for nextRound and newGame are now handled 
        // within handleRoundEnd to avoid conflicts with Game Stats Modal
    } else {
        console.warn('RoundStatsModal not available. Statistics will not be shown.');
    }    // Initialize game statistics modal
    if (typeof GameStatsModal !== 'undefined') {
        gameStatsModal = new GameStatsModal();
    } else {
        console.warn('GameStatsModal not available. Game statistics will not be shown.');
    }

    // NUEVO: Agregar funciones de ayuda para debug (opcional)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Función para establecer gameContext en window después de que se inicialice
        window.setGameContextDebug = () => {
            if (gameContext) {
                window.gameContext = gameContext;
                window.debugSwap = {
                    showSelection: () => console.log('Swap Selection:', gameContext.swapSelection),
                    clearSelection: () => {
                        if (gameContext) {
                            gameContext.swapSelection = null;
                            gameContext.renderBoard();
                        }
                    },
                    testSwap: (r1, c1, r2, c2) => {
                        if (gameContext && gameContext.board && gameContext.board[0]) {
                            const SwapPowerUp = import('./powerups/SwapPowerUp.js');
                            if (SwapPowerUp) {
                                SwapPowerUp.then(module => {
                                    console.log('Can swap:', module.SwapPowerUp.canSwapPieces(gameContext, r1, c1, r2, c2));
                                });
                            }
                        }
                    }
                };
                
                // NUEVO: Función de diagnóstico de puntajes
                window.debugScore = {
                    checkScores: () => {
                        if (gameContext) {
                            console.log('📊 DIAGNÓSTICO DE PUNTAJES:');
                            console.log('🎯 Puntajes en el juego (correctos):');
                            console.log('   - Blancas (gameContext.score1):', gameContext.score1);
                            console.log('   - Negras (gameContext.score2):', gameContext.score2);
                            console.log('');
                            console.log('🎯 Puntajes por ronda actual:');
                            console.log('   - Blancas (roundScore):', gameContext.gameStats?.white?.roundScore || 0);
                            console.log('   - Negras (roundScore):', gameContext.gameStats?.black?.roundScore || 0);
                            console.log('');
                            console.log('🎯 Estadísticas de la ronda:');
                            console.log('   - Ronda actual:', round);
                            console.log('   - Victorias Blancas:', winsWhite);
                            console.log('   - Victorias Negras:', winsBlack);
                            console.log('');
                            console.log('🎯 IDs de la partida:');
                            console.log('   - Game ID:', gameContext.currentGameId);
                            console.log('   - Round ID:', gameContext.currentRoundId);
                            console.log('   - Player IDs:', gameContext.playerIds);
                        } else {
                            console.warn('gameContext no está disponible');
                        }
                    },
                    
                    checkPieceValues: () => {
                        console.log('💎 VALORES DE LAS PIEZAS:');
                        console.log('   - Peón (p): 2 puntos');
                        console.log('   - Caballo (n): 4 puntos');
                        console.log('   - Alfil (b): 4 puntos');
                        console.log('   - Torre (r): 6 puntos');
                        console.log('   - Reina (q): 9 puntos');
                        console.log('   - Rey (k): 0 puntos (no se puede capturar)');
                    },
                    
                    simulateCapture: (pieceType) => {
                        let points = 0;
                        switch (pieceType) {
                            case 'p': points = 2; break;
                            case 'n': case 'b': points = 4; break;
                            case 'r': points = 6; break;
                            case 'q': points = 9; break;
                            default: points = 0;
                        }
                        console.log(`Capturar ${pieceType} otorgaría ${points} puntos`);
                        return points;
                    },
                    
                    // NUEVO: Diagnóstico de modales
                    checkModalData: () => {
                        console.log('🎭 DIAGNÓSTICO DE DATOS DE MODALES:');
                        console.log('📊 gameSeriesData:', gameSeriesData);
                        console.log('📊 Última ronda en gameSeriesData:');
                        if (gameSeriesData.rounds && gameSeriesData.rounds.length > 0) {
                            const lastRound = gameSeriesData.rounds[gameSeriesData.rounds.length - 1];
                            console.log('   - Puntaje Blancas (acumulativo):', lastRound.whiteScore);
                            console.log('   - Puntaje Negras (acumulativo):', lastRound.blackScore);
                            console.log('   - Puntaje Blancas (solo ronda):', lastRound.whiteRoundScore);
                            console.log('   - Puntaje Negras (solo ronda):', lastRound.blackRoundScore);
                        }
                        console.log('📊 finalStats (si existe):', gameSeriesData.finalStats);
                    },
                    
                    testRoundModal: () => {
                        if (gameContext && roundStatsModal) {
                            console.log('🧪 Probando modal de ronda con datos actuales...');
                            
                            console.log('📊 DIAGNÓSTICO COMPLETO DE MODAL DE RONDA:');
                            console.log('   🎯 Número de ronda:', round);
                            console.log('   🎯 Puntajes de ronda actual:');
                            console.log('      - Blancas (roundScore):', gameContext.gameStats?.white?.roundScore || 0);
                            console.log('      - Negras (roundScore):', gameContext.gameStats?.black?.roundScore || 0);
                            console.log('   🎯 Puntajes acumulativos:');
                            console.log('      - Blancas (total):', gameContext.score1 || 0);
                            console.log('      - Negras (total):', gameContext.score2 || 0);
                            console.log('   🎯 IDs para endpoints:');
                            console.log('      - Game ID:', gameContext.currentGameId);
                            console.log('      - Round ID:', gameContext.currentRoundId);
                            console.log('      - Player IDs:', gameContext.playerIds);
                            
                            const testRoundData = {
                                roundNumber: round,
                                winner: 'w', // Ejemplo
                                whiteScore: gameContext.gameStats?.white?.roundScore || 0,
                                blackScore: gameContext.gameStats?.black?.roundScore || 0,
                                whiteCumulativeScore: gameContext.score1 || 0,
                                blackCumulativeScore: gameContext.score2 || 0,
                                gameStats: gameContext.gameStats,
                                timestamp: new Date().toISOString()
                            };
                            
                            console.log('📊 Datos completos de prueba:', testRoundData);
                            roundStatsModal.show(testRoundData);
                        } else {
                            console.warn('Modal de ronda no disponible');
                        }
                    },
                    
                    testGameModal: () => {
                        if (gameStatsModal) {
                            console.log('🧪 Probando modal de partida con datos actuales...');
                            const testGameData = { ...gameSeriesData };
                            testGameData.finalStats = {
                                totalWhiteScore: gameContext?.score1 || 0,
                                totalBlackScore: gameContext?.score2 || 0,
                                totalRounds: testGameData.rounds?.length || 0,
                                whiteWins: winsWhite,
                                blackWins: winsBlack
                            };
                            
                            console.log('📊 DIAGNÓSTICO COMPLETO DE MODAL DE PARTIDA:');
                            console.log('   🎯 Puntajes reales del juego:');
                            console.log('      - Blancas:', gameContext?.score1 || 0);
                            console.log('      - Negras:', gameContext?.score2 || 0);
                            console.log('   🎯 finalStats que se envían:');
                            console.log('      - Blancas:', testGameData.finalStats.totalWhiteScore);
                            console.log('      - Negras:', testGameData.finalStats.totalBlackScore);
                            console.log('   🎯 Datos de rondas:');
                            testGameData.rounds?.forEach((round, i) => {
                                console.log(`      Ronda ${i + 1}:`, {
                                    winner: round.winner,
                                    whiteScore: round.whiteScore,
                                    blackScore: round.blackScore,
                                    whiteRoundScore: round.whiteRoundScore,
                                    blackRoundScore: round.blackRoundScore
                                });
                            });
                            
                            console.log('📊 Datos completos de prueba:', testGameData);
                            gameStatsModal.show(testGameData);
                        } else {
                            console.warn('Modal de partida no disponible');
                        }
                    }
                };
                
                console.log('Debug functions available: window.gameContext, window.debugSwap, window.debugScore');
            } else {
                console.warn('gameContext not initialized yet');
            }
        };
    }
});

// Export functions that might be needed by other modules
export {
    getRandomBoard,
    updateRoundWinsDisplay,
    createNextRoundButton,
    resetGame,
    resetRound,
    handleRoundEnd
};
