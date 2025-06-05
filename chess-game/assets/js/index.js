import { getSymbol, coordsToAlgebraic } from './utils.js';
import { midgameBoards } from './boards/midgameBoards.js';
import { setupGameContext } from './game.js'; // NUEVO IMPORT

const EMPTY = null;

// Control de rondas
let round = 1;
let winsWhite = 0;
let winsBlack = 0;

// Round Statistics Modal
let roundStatsModal = null;

// Game Statistics Modal
let gameStatsModal = null;

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
    
    btn.appendChild(img);
    btn.addEventListener('click', () => {
        round++;
        btn.remove();
        resetGame(gameContext, false); // false for not a full game reset
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
 * Resets the game state for a new round or a full game restart.
 * @param {object} gameContext - The current game context.
 * @param {boolean} [fullReset=false] - True to reset all rounds and scores, false for next round.
 */
function resetGame(gameContext, fullReset = false) {
    let newBoard;

    if (fullReset) {
        round = 1;
        winsWhite = 0;
        winsBlack = 0;
        newBoard = getRandomBoard(midgameBoards.neutral);
    } else { // Starting a new round (round has already been incremented by createNextRoundButton)
        if (round === 1) { // Should ideally not happen if fullReset is for round 1
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
    }

    if (!newBoard && gameContext.standardInitialBoard) { // Fallback if midgame board loading fails
        console.error("Failed to load midgame board. Falling back to standard initial board.");
        newBoard = gameContext.standardInitialBoard();
    } else if (!newBoard) {
        console.error("CRITICAL: Failed to load any board. Game cannot continue.");
        // Display error to user
        if(gameContext.messageElement) gameContext.messageElement.textContent = "Error al cargar el tablero!";
        return;
    }
    gameContext.board = newBoard;

    // MODIFICACIÓN: Solo resetear puntos y power-ups en reset completo
    if (fullReset) {
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
    }
    // NOTA: Los puntos y power-ups se mantienen entre rondas (solo se resetean en fullReset)

    // Reset game state (esto se resetea siempre)
    gameContext.currentColor = 'w';
    gameContext.selected = null;
    gameContext.gameOver = false;
    
    // Reset power-ups activos y vallas (estos sí se resetean cada ronda)
    gameContext.fencedTiles = [];
    gameContext.activePowerUps = [];
    gameContext.awaitingPowerUpTarget = null;
    
    // NUEVO: Reset específico para Swap
    gameContext.swapSelection = null;
    
    // Reset efectos temporales de power-ups
    gameContext.pawnRangeActive = {};
    gameContext.crazyKingActive = {};

    updateRoundWinsDisplay();
    if(gameContext.messageElement) gameContext.messageElement.textContent = `Ronda ${round}. Turno de las Blancas.`;
    gameContext.renderBoard();
}

document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const messageElement = document.getElementById('message');
    const resetButton = document.getElementById('reset');

    if (!boardElement || !messageElement || !resetButton) {
        console.error("Essential UI elements (board, message, reset button) not found!");
        return;
    }

    // Dynamically import modules
    Promise.all([
        import('./board.js'),
        import('./pieces.js'),
        import('./game.js'),
        import('./UI/pauseManager.js'),
        // import('./powerUpManager.js') // Not directly used here, but by game.js
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
        const { updateScore: updateScoreFunc, handleClick: handleClickFunc, setupGameContext: setupGameContextFunc } = gameModule;
        const { PauseManager } = pauseModule;

        round = 1; // Initialize for the very first game load
        winsWhite = 0;
        winsBlack = 0;

        let initialMidgameBoard = getRandomBoard(midgameBoards.neutral);
        if (!initialMidgameBoard) {
            console.warn("Failed to load initial midgame board. Using standard board.");
            initialMidgameBoard = standardInitialBoardFunc();
        }        const gameContext = {
            board: initialMidgameBoard,
            currentColor: 'w',
            selected: null,
            score1: 0,
            score2: 0,
            boardElement,
            messageElement,
            EMPTY, // Make sure EMPTY is defined (const EMPTY = null;)
            gameOver: false,

            powerUpsWhite: [],
            powerUpsBlack: [],
            nextThresholdWhite: 5,
            nextThresholdBlack: 5,
            fencedTiles: [],
            activePowerUps: [],
            awaitingPowerUpTarget: null,

            // NUEVO: Estado específico para Swap Power-Up
            swapSelection: null,

            // NUEVO: Sistema de seguimiento de estadísticas reales
            gameStats: {
                white: {
                    turns: 0,
                    captured: 0,
                    powerupsUsed: 0
                },
                black: {
                    turns: 0,
                    captured: 0,
                    powerupsUsed: 0
                }
            },

            getSymbol, // from utils.js
            coordsToAlgebraic, // from utils.js
            isLegalMove: (fr, fc, tr, tc) => isLegalMove(fr, fc, tr, tc, gameContext),
            getPossibleMoves: (r, c) => getPossibleMoves(r, c, gameContext),
            isBasicLegalMove: (fr, fc, tr, tc) => isBasicLegalMove(fr, fc, tr, tc, gameContext),
            isSquareAttacked: (r, c, color, attackingContext) => isSquareAttacked(r, c, color, attackingContext || gameContext), // Pass specific context if needed
            findKing: (board, color) => findKing(board, color),
            // Pass full gameContext to isKingInCheck as it's needed by isSquareAttacked
            isKingInCheck: (boardToCheck, kingColor) => isKingInCheck(boardToCheck || gameContext.board, kingColor, { ...gameContext, board: boardToCheck || gameContext.board }),
            // NUEVA FUNCIÓN: Agregar isCheckmate al gameContext
            isCheckmate: (color) => isCheckmate(color, gameContext),
            // NUEVA FUNCIÓN: Agregar isStalemate al gameContext (opcional para detectar ahogado)
            isStalemate: (color) => isStalemate(color, gameContext),
            updateScore: (player, capturedPiece) => updateScoreFunc(player, capturedPiece, gameContext), // Ensure updateScoreFunc is correctly defined in game.js
            handleClick: (r, c) => handleClickFunc(r, c, gameContext),
            renderBoard: () => renderBoardFunc(gameContext),
            standardInitialBoard: standardInitialBoardFunc,
            resetGame: resetGame,            grantPowerUp: (color, type) => {
                if (!type) {
                    console.warn("Attempted to grant an undefined power-up type.");
                    return;
                }
                const inventory = color === 'w' ? gameContext.powerUpsWhite : gameContext.powerUpsBlack;
                if (inventory.length < 5) {
                    inventory.push(type);
                    
                    // Track newly added powerups for animation
                    if (!gameContext.newlyAddedPowerUps) {
                        gameContext.newlyAddedPowerUps = { white: [], black: [] };
                    }
                    const colorKey = color === 'w' ? 'white' : 'black';
                    gameContext.newlyAddedPowerUps[colorKey].push(type);
                      gameContext.messageElement.textContent = `${color === 'w' ? 'Blancas' : 'Negras'} obtienen poder: ${type}!`;
                    renderBoardFunc(gameContext); // Re-render to update power-up display
                } else {
                    gameContext.messageElement.textContent = "Inventario de poderes lleno.";
                }
            },            declareWinner: (winnerColor) => { // Winner of the ROUND
                if (gameContext.gameOver && !messageElement.textContent.includes("Ahogado")) return;

                if (winnerColor === 'w') winsWhite++;
                else if (winnerColor === 'b') winsBlack++;
                updateRoundWinsDisplay();

                const winnerName = winnerColor === 'w' ? 'Blancas' : 'Negras';
                messageElement.textContent = `¡${winnerName} ganan la Ronda ${round}!`;
                gameContext.gameOver = true; // Round is over

                const existingNextRoundBtn = document.querySelector('button.next-round-button');
                if(existingNextRoundBtn) existingNextRoundBtn.remove();
                const existingFinalBtn = document.querySelector('button.final-reset-button');
                if(existingFinalBtn) existingFinalBtn.remove();

                // Prepare round data for statistics
                const roundData = {
                    round: round,
                    winner: winnerColor,
                    whiteScore: gameContext.score1,
                    blackScore: gameContext.score2,
                    winsWhite: winsWhite,
                    winsBlack: winsBlack,
                    gameStats: { ...gameContext.gameStats } // Deep copy of game statistics
                };

                // Store round data in series data
                gameSeriesData.rounds.push(roundData);                // Check if this completes the series (first to 2 wins)
                const seriesComplete = winsWhite >= 2 || winsBlack >= 2;

                if (seriesComplete) {
                    // Calculate total game duration and format it
                    const durationMs = Date.now() - gameSeriesData.startTime;
                    const minutes = Math.floor(durationMs / 60000);
                    const seconds = Math.floor((durationMs % 60000) / 1000);
                    gameSeriesData.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    
                    // Set the overall winner of the series
                    gameSeriesData.winner = winsWhite >= 2 ? 'w' : 'b';
                    
                    // Create detailed victory message
                    const seriesWinner = gameSeriesData.winner === 'w' ? 'Blancas' : 'Negras';
                    const finalScore = `${winsWhite}-${winsBlack}`;
                    let victoryType = '';
                    
                    if (round === 2) {
                        victoryType = 'victoria perfecta 2-0';
                    } else if (round === 3) {
                        victoryType = 'victoria por 2-1 tras una batalla reñida';
                    }
                    
                    messageElement.textContent = `🏆 ¡${seriesWinner} ganan la serie completa ${finalScore}! ${victoryType.charAt(0).toUpperCase() + victoryType.slice(1)}`;
                    
                    // Show game statistics modal for complete series
                    setTimeout(() => {
                        if (gameStatsModal) {
                            gameStatsModal.show(gameSeriesData);
                        }
                    }, 2000); // Show victory message for 2 seconds before showing modal
                } else {
                    // Show round statistics modal for incomplete series
                    setTimeout(() => {
                        if (roundStatsModal) {
                            roundStatsModal.show(roundData);
                        }                    }, 1500); // Show win message for 1.5 seconds before showing modal
                }
            }
        };        declareStalemate: () => { // Stalemate/Draw - both players get 1 point each
            if (gameContext.gameOver) return;

            // Both players receive 1 point each (full point, not half)
            winsWhite += 1;
            winsBlack += 1;
            updateRoundWinsDisplay();

            messageElement.textContent = `¡Tablas por Ahogado! Ambos jugadores reciben 1 punto.`;
            gameContext.gameOver = true; // Round is over

            const existingNextRoundBtn = document.querySelector('button.next-round-button');
            if(existingNextRoundBtn) existingNextRoundBtn.remove();
            const existingFinalBtn = document.querySelector('button.final-reset-button');
            if(existingFinalBtn) existingFinalBtn.remove();

            // Prepare round data for statistics
            const roundData = {
                round: round,
                winner: 'stalemate', // Special case for stalemate
                whiteScore: gameContext.score1,
                blackScore: gameContext.score2,
                winsWhite: winsWhite,
                winsBlack: winsBlack,
                gameStats: { ...gameContext.gameStats } // Deep copy of game statistics
            };

            // Store round data in series data
            gameSeriesData.rounds.push(roundData);            // Check if this completes the series 
            // With stalemate giving 1 point to each player, we need to handle ties
            const seriesComplete = winsWhite >= 2 || winsBlack >= 2;

            if (seriesComplete) {
                // Calculate total game duration and format it
                const durationMs = Date.now() - gameSeriesData.startTime;
                const minutes = Math.floor(durationMs / 60000);
                const seconds = Math.floor((durationMs % 60000) / 1000);
                gameSeriesData.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Determine the overall winner of the series
                if (winsWhite > winsBlack) {
                    gameSeriesData.winner = 'w';
                } else if (winsBlack > winsWhite) {
                    gameSeriesData.winner = 'b';
                } else {
                    // In case of a tie (both have same score >= 2), the series continues
                    // or we can declare it a tie series - for now we'll say it continues
                    gameSeriesData.winner = 'w'; // Arbitrary choice for tie-breaking, or add tie logic
                }
                
                // Create detailed victory message
                const seriesWinner = gameSeriesData.winner === 'w' ? 'Blancas' : 'Negras';
                const finalScore = `${winsWhite}-${winsBlack}`;
                
                messageElement.textContent = `🏆 ¡${seriesWinner} ganan la serie completa ${finalScore}!`;
                
                // Show game statistics modal for complete series
                setTimeout(() => {
                    if (gameStatsModal) {
                        gameStatsModal.show(gameSeriesData);
                    }
                }, 2000); // Show victory message for 2 seconds before showing modal
            } else {
                // Show round statistics modal for incomplete series
                setTimeout(() => {
                    if (roundStatsModal) {
                        roundStatsModal.show(roundData);
                    }
                }, 1500); // Show stalemate message for 1.5 seconds before showing modal
            }
        };// NUEVO: Configurar funciones auxiliares para gameContext (incluyendo switchTurn para Swap)
        setupGameContextFunc(gameContext);

        // Initialize pause manager
        const pauseManager = new PauseManager(gameContext);
        gameContext.pauseManager = pauseManager;        // Initialize round statistics modal
        if (typeof RoundStatsModal !== 'undefined') {
            roundStatsModal = new RoundStatsModal();
            
            // Add event listeners for modal actions
            window.addEventListener('nextRound', (event) => {
                round++;
                resetGame(gameContext, false);
            });
              window.addEventListener('newGame', (event) => {
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
                resetGame(gameContext, true);
            });
        } else {
            console.warn('RoundStatsModal not available. Statistics will not be shown.');
        }        // Initialize game statistics modal
        if (typeof GameStatsModal !== 'undefined') {
            gameStatsModal = new GameStatsModal();
        } else {
            console.warn('GameStatsModal not available. Game statistics will not be shown.');
        }

        updateRoundWinsDisplay();
        messageElement.textContent = `Ronda ${round}. Turno de las Blancas.`;
        gameContext.renderBoard();

        boardElement.addEventListener('click', (event) => {
            if (pauseManager.isGamePaused) {
                return;
            }
            const cell = event.target.closest('.cell');
            if (cell && cell.dataset.row && cell.dataset.col) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                gameContext.handleClick(row, col);
            }
        });

        resetButton.addEventListener('click', () => {
          if (pauseManager.isGamePaused) {
                return;
            }
            resetGame(gameContext, true);
        });

        // NUEVO: Agregar listener para tecla ESC para cancelar selección de Swap
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && gameContext.swapSelection) {
                import('./game.js').then(gameModule => {
                    gameModule.cancelSwapSelection(gameContext);
                });
            }
        });

        // NUEVO: Agregar funciones de ayuda para debug (opcional)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.gameContext = gameContext; // Para debug en consola
            window.debugSwap = {
                showSelection: () => console.log('Swap Selection:', gameContext.swapSelection),
                clearSelection: () => {
                    gameContext.swapSelection = null;
                    gameContext.renderBoard();
                },
                testSwap: (r1, c1, r2, c2) => {
                    const SwapPowerUp = gameContext.board && gameContext.board[0] ? 
                        import('./powerups/SwapPowerUp.js') : null;
                    if (SwapPowerUp) {
                        SwapPowerUp.then(module => {
                            console.log('Can swap:', module.SwapPowerUp.canSwapPieces(gameContext, r1, c1, r2, c2));
                        });
                    }
                }
            };
        }

    }).catch(error => {
        console.error("Error loading game modules:", error);
        if(messageElement) messageElement.textContent = "Error al cargar el juego. Revisa la consola.";
    });
});
