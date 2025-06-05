import { getSymbol, coordsToAlgebraic } from './utils.js';
import { midgameBoards } from './boards/midgameBoards.js';
import { setupGameContext, initGame } from './game.js';

const EMPTY = null;

// Control de rondas
let round = 1;
let winsWhite = 0;
let winsBlack = 0;

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
    btn.addEventListener('click', async () => {
        round++;
        btn.remove();
        await resetGame(gameContext, false); // false for not a full game reset
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

        try {
            // Inicializar el juego con los emails de los jugadores
            const gameContext = await initGame(whitePlayerEmail, blackPlayerEmail);
            
            // Asignar el boardElement al gameContext
            gameContext.boardElement = boardElement;
            
            // Ocultar el formulario y mostrar el tablero
            startForm.style.display = 'none';
            mainLayout.style.display = 'flex';

            // Configurar el resto del juego
            setupGame(gameContext);
        } catch (error) {
            console.error('Error iniciando el juego:', error);
            alert('Error iniciando el juego. Por favor, verifica los emails e intenta de nuevo.');
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
            const { PauseManager } = pauseModule;

            // Configurar el contexto del juego con todas las funciones necesarias
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
                updateScore: (player) => updateScoreFunc(player, gameContext)
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
            resetButton.addEventListener('click', () => {
                const shouldReset = confirm('¿Estás seguro de que quieres reiniciar el juego?');
                if (shouldReset) {
                    resetGame(gameContext, true);
                    gameContext.renderBoard();
                }
            });

            // Renderizar el tablero inicial
            gameContext.renderBoard();
        });
    }
});