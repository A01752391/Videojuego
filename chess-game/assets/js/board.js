import { getSymbol } from './utils.js'; // Assuming getSymbol is in utils.js
import { createPowerUpInstance } from './powerUpManager.js'; // For attemptActivatePowerUp

/**
 * Creates the initial board setup.
 * @returns {Array<Array<object|null>>} The initial 8x8 board array.
 */
export function initialBoard() {
    const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    const newBoard = [];

    newBoard.push(backRank.map(type => ({ type, color: 'b', hasMoved: false })));
    newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'b', hasMoved: false })));
    for (let i = 0; i < 4; i++) newBoard.push(Array(8).fill(null));
    newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'w', hasMoved: false })));
    newBoard.push(backRank.map(type => ({ type, color: 'w', hasMoved: false })));

    return newBoard;
}

/**
 * Renders the current state of the game board and power-up inventories in the UI.
 * @param {object} gameContext - The current game context.
 */
export function renderBoard(gameContext) {
    const { board, boardElement, selected, fencedTiles, powerUpsWhite, powerUpsBlack, currentColor } = gameContext;
    if (!boardElement) {
        console.error("Board element not found in gameContext for renderBoard.");
        return;
    }
    boardElement.innerHTML = '';

    // It's better to pass the full gameContext to isKingInCheck
    const kingIsCurrentlyInCheck = gameContext.isKingInCheck(gameContext.board, currentColor, gameContext);


    let possibleMovesList = [];
    if (selected) {
        possibleMovesList = gameContext.getPossibleMoves(selected[0], selected[1]);
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            // Use distinct class names for cell colors to avoid conflict with piece colors
            cell.classList.add((r + c) % 2 === 0 ? "white-cell" : "black-cell");
            cell.dataset.row = r;
            cell.dataset.col = c;

            const piece = board[r][c];
            const fence = fencedTiles ? fencedTiles.find(tile => tile.row === r && tile.col === c) : null;

            if (fence) {
                cell.classList.add("fenced-tile");
                const fenceMarker = document.createElement("div");
                fenceMarker.classList.add("fence-marker");
                fenceMarker.title = `Valla (${fence.remainingDuration} turnos restantes)`;
                cell.appendChild(fenceMarker);
            }

            if (piece) {
                const symbol = getSymbol(piece); // Make sure getSymbol is correctly imported/available
                cell.textContent = symbol;
                cell.classList.add("piece");
                cell.classList.add(piece.color === 'w' ? 'player1-piece' : 'player2-piece');

                if (piece.type === 'k' && piece.color === currentColor && kingIsCurrentlyInCheck) {
                    cell.classList.add("king-in-check");
                }
            }

            if (selected && selected[0] === r && selected[1] === c) {
                cell.classList.add("selected-piece");
            }

            const isPossibleMove = possibleMovesList.find(move => move.row === r && move.col === c);
            if (isPossibleMove) {
                cell.classList.add(isPossibleMove.capture ? "possible-capture" : "possible-move");
            }

            boardElement.appendChild(cell);
        }
    }
    renderPowerUpInventories(gameContext);
}

/**
 * Renders the power-up inventories for both players.
 * @param {object} gameContext - The current game context.
 */
function renderPowerUpInventories(gameContext) {
    const whitePowerUpsContainer = document.getElementById('white-powerups-display');
    const blackPowerUpsContainer = document.getElementById('black-powerups-display');

    if (whitePowerUpsContainer) {
        whitePowerUpsContainer.innerHTML = '<strong>Poderes Blancas:</strong> ';
        if (gameContext.powerUpsWhite.length > 0) {
            gameContext.powerUpsWhite.forEach(powerUpType => {
                const btn = document.createElement('button');
                btn.textContent = powerUpType;
                btn.className = 'powerup-button';
                btn.onclick = () => attemptActivatePowerUp(powerUpType, 'w', gameContext);
                whitePowerUpsContainer.appendChild(btn);
            });
        } else {
            whitePowerUpsContainer.innerHTML += ' Ninguno';
        }
    }

    if (blackPowerUpsContainer) {
        blackPowerUpsContainer.innerHTML = '<strong>Poderes Negras:</strong> ';
        if (gameContext.powerUpsBlack.length > 0) {
            gameContext.powerUpsBlack.forEach(powerUpType => {
                const btn = document.createElement('button');
                btn.textContent = powerUpType;
                btn.className = 'powerup-button';
                btn.onclick = () => attemptActivatePowerUp(powerUpType, 'b', gameContext);
                blackPowerUpsContainer.appendChild(btn);
            });
        } else {
            blackPowerUpsContainer.innerHTML += ' Ninguno';
        }
    }
}

/**
 * Handles the attempt to activate a power-up when its button is clicked.
 * @param {string} powerUpType - The type name of the power-up.
 * @param {string} playerColor - The color of the player attempting to activate ('w' or 'b').
 * @param {object} gameContext - The current game context.
 */
function attemptActivatePowerUp(powerUpType, playerColor, gameContext) {

    if (gameContext.pauseManager && gameContext.pauseManager.isGamePaused) {
        return;
    }
    if (gameContext.gameOver || gameContext.currentColor !== playerColor) {
        gameContext.messageElement.textContent = "No es tu turno o la partida ha terminado.";
        return;
    }
    if (gameContext.awaitingPowerUpTarget) {
        gameContext.messageElement.textContent = "Ya estás seleccionando un objetivo para otro poder.";
        return;
    }

    const powerUpInstance = createPowerUpInstance(powerUpType); // From powerUpManager.js
    if (!powerUpInstance) {
        console.error("No se pudo crear la instancia del poder:", powerUpType);
        gameContext.messageElement.textContent = `Error: Poder ${powerUpType} no encontrado.`;
        return;
    }

    // For power-ups that don't require a target, canActivate might still depend on game state
    // For those that do, canActivate might be a general check before targeting mode.
    // Here, we assume canActivate is a general check. Specific target validation happens in FencePowerUp.canActivate
    if (!powerUpInstance.canActivate(gameContext, playerColor, null)) { // Pass null for targetData for initial check
        // canActivate should set its own message if it fails specifically
        if(!gameContext.messageElement.textContent.includes("No se puede") && !gameContext.messageElement.textContent.includes("Error:")) {
             gameContext.messageElement.textContent = `No se puede activar ${powerUpType} ahora.`;
        }
        return;
    }

    if (powerUpInstance.requiresTarget) {
        gameContext.awaitingPowerUpTarget = { powerUpType, playerColor };
        gameContext.messageElement.textContent = `Selecciona un objetivo en el tablero para ${powerUpType}.`;
    } else {
        // Activate directly if no target is required
        const activationSuccessful = powerUpInstance.activate(gameContext, playerColor, null);
        if (activationSuccessful) {
            const inventory = playerColor === 'w' ? gameContext.powerUpsWhite : gameContext.powerUpsBlack;
            const index = inventory.indexOf(powerUpType);
            if (index > -1) inventory.splice(index, 1);
            // renderPowerUpInventories will be called by renderBoard
        }
        gameContext.renderBoard(); // Re-render for any immediate effects and to update inventory display
    }
}