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

    const roundData = {
        roundNumber: round,
        winner: winner,
        whiteScore: currentRoundWhiteStats.roundScore,
        blackScore: currentRoundBlackStats.roundScore,
        winsWhite: winsWhite,
        winsBlack: winsBlack,
        stalemateReason: winner === 'stalemate' ? 'Tablas por ahogado o solo dos reyes' : null,
        // Solo datos de la ronda actual
        gameStats: {
            white: currentRoundWhiteStats,
            black: currentRoundBlackStats
        },
        gameSeriesData: gameSeriesData,
        timestamp: new Date().toISOString()
    };



    // Prepare current round data for series (with cumulative scores)
    const currentRoundData = {
        roundNumber: round,
        winner: winner,
        whiteScore: gameContext.score1 || 0, // Cumulative score for series
        blackScore: gameContext.score2 || 0, // Cumulative score for series
        gameStats: gameContext.gameStats || null,
        timestamp: new Date().toISOString()
    };
      // Add round data to series ALWAYS (for both ending and non-ending rounds)
    gameSeriesData.rounds.push(currentRoundData);
    
    // Check if game is over (best of 3)
    const gameEnded = winsWhite === 2 || winsBlack === 2 || round === 3;
    
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
    } else if (winsBlack === 2) {
        if(gameContext.messageElement) {
            gameContext.messageElement.textContent = "¡Las Negras ganan la partida 2-" + winsWhite + "!";
        }
        gameContext.gameOver = true;
        gameSeriesData.winner = 'b';
        gameSeriesData.duration = Date.now() - gameSeriesData.startTime;
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
        gameSeriesData.duration = Date.now() - gameSeriesData.startTime;    }
      // If game ended, show game statistics modal directly
    if (gameEnded) {
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
        const handleContinueGame = (event) => {
            if (event.type === 'nextRound' && gameContext && !gameContext.gameOver) {
                round++;
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
            boardElement.addEventListener('click', (e) => {
                const cell = e.target.closest('.cell');
                if (cell) {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    handleClickFunc(row, col, gameContext);
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
                console.log('Debug functions available: window.gameContext, window.debugSwap');
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
