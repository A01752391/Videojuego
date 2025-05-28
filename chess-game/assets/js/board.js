import { getSymbol, getPieceImageClass } from './utils.js'; // Assuming getSymbol is in utils.js
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
            }            if (piece) {
                const imageClass = getPieceImageClass(piece);
                cell.classList.add(imageClass);
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

            // NUEVA FUNCIONALIDAD: Mostrar selección de swap si está activa
            if (gameContext.swapSelection && gameContext.swapSelection.pieces.length > 0) {
                gameContext.swapSelection.pieces.forEach((piece, index) => {
                    if (piece.row === r && piece.col === c) {
                        if (index === 0) {
                            // Primera pieza seleccionada - verde
                            cell.style.background = 'linear-gradient(45deg, #4CAF50, #81C784)';
                            cell.style.border = '3px solid #2E7D32';
                            cell.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.7)';
                        } else {
                            // Segunda pieza seleccionada - azul
                            cell.style.background = 'linear-gradient(45deg, #2196F3, #64B5F6)';
                            cell.style.border = '3px solid #1565C0';
                            cell.style.boxShadow = '0 0 10px rgba(33, 150, 243, 0.7)';
                        }
                    }
                });
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

    // Handle white player powerups
    if (whitePowerUpsContainer) {
        // Get the powerup label for white player
        const whitePowerupTray = whitePowerUpsContainer.closest('.powerup-tray');
        const whitePowerupLabel = whitePowerupTray ? whitePowerupTray.querySelector('.powerup-label') : null;
        
        // Clear the container
        whitePowerUpsContainer.innerHTML = '';
        
        if (gameContext.powerUpsWhite.length > 0) {
            // Hide the "Poderes" label when powerups are present
            if (whitePowerupLabel) {
                whitePowerupLabel.classList.add('hidden');
            }
            
            gameContext.powerUpsWhite.forEach(powerUpType => {
                const btn = document.createElement('button');
                btn.textContent = powerUpType;
                btn.className = 'powerup-button';
                btn.onclick = () => attemptActivatePowerUp(powerUpType, 'w', gameContext);
                whitePowerUpsContainer.appendChild(btn);
            });
        } else {
            // Show the "Poderes" label when no powerups are present
            if (whitePowerupLabel) {
                whitePowerupLabel.classList.remove('hidden');
            }
        }
    }

    // Handle black player powerups
    if (blackPowerUpsContainer) {
        // Get the powerup label for black player
        const blackPowerupTray = blackPowerUpsContainer.closest('.powerup-tray');
        const blackPowerupLabel = blackPowerupTray ? blackPowerupTray.querySelector('.powerup-label') : null;
        
        // Clear the container
        blackPowerUpsContainer.innerHTML = '';
        
        if (gameContext.powerUpsBlack.length > 0) {
            // Hide the "Poderes" label when powerups are present
            if (blackPowerupLabel) {
                blackPowerupLabel.classList.add('hidden');
            }
            
            gameContext.powerUpsBlack.forEach(powerUpType => {
                const btn = document.createElement('button');
                btn.textContent = powerUpType;
                btn.className = 'powerup-button';
                btn.onclick = () => attemptActivatePowerUp(powerUpType, 'b', gameContext);
                blackPowerUpsContainer.appendChild(btn);
            });
        } else {
            // Show the "Poderes" label when no powerups are present
            if (blackPowerupLabel) {
                blackPowerupLabel.classList.remove('hidden');
            }
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
        
        // MENSAJE ESPECIAL PARA SWAP
        if (powerUpType === 'Swap') {
            gameContext.messageElement.textContent = `Selecciona la primera pieza para intercambiar con ${powerUpType}.`;
        } else {
            gameContext.messageElement.textContent = `Selecciona un objetivo en el tablero para ${powerUpType}.`;
        }
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

/**
 * NUEVA FUNCIÓN: Cancelar selección de Swap desde la UI
 * @param {object} gameContext - The current game context.
 */
export function cancelSwapSelection(gameContext) {
    if (gameContext.swapSelection) {
        gameContext.swapSelection = null;
        gameContext.awaitingPowerUpTarget = null;
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Selección de Swap cancelada.";
        }
        gameContext.renderBoard();
    }
}

/**
 * NUEVA FUNCIÓN: Agregar botón de cancelar swap cuando sea necesario
 * @param {object} gameContext - The current game context.
 */
export function addSwapCancelButton(gameContext) {
    // Verificar si ya existe un botón de cancelar
    let cancelButton = document.getElementById('cancel-swap-button');
    
    if (!cancelButton && gameContext.swapSelection && gameContext.swapSelection.count > 0) {
        cancelButton = document.createElement('button');
        cancelButton.id = 'cancel-swap-button';
        cancelButton.textContent = 'Cancelar Swap';
        cancelButton.className = 'powerup-button cancel-button';
        cancelButton.style.cssText = `
            background-color: #f44336;
            color: white;
            border: none;
            padding: 8px 12px;
            margin: 5px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        cancelButton.onclick = () => {
            cancelSwapSelection(gameContext);
            cancelButton.remove();
        };
        
        // Agregar el botón después del contenedor de power-ups
        const powerUpsContainer = document.getElementById('white-powerups-display') || document.getElementById('black-powerups-display');
        if (powerUpsContainer && powerUpsContainer.parentNode) {
            powerUpsContainer.parentNode.insertBefore(cancelButton, powerUpsContainer.nextSibling);
        } else {
            document.body.appendChild(cancelButton);
        }
    } else if (cancelButton && (!gameContext.swapSelection || gameContext.swapSelection.count === 0)) {
        // Remover el botón si ya no es necesario
        cancelButton.remove();
    }
}

/**
 * NUEVA FUNCIÓN: Mostrar información de ayuda para Swap
 * @param {object} gameContext - The current game context.
 */
export function showSwapHelp(gameContext) {
    if (gameContext.awaitingPowerUpTarget && gameContext.awaitingPowerUpTarget.powerUpType === 'Swap') {
        const helpElement = document.getElementById('swap-help');
        if (!helpElement) {
            const help = document.createElement('div');
            help.id = 'swap-help';
            help.className = 'swap-help-info';
            help.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                max-width: 200px;
                z-index: 1000;
            `;
            
            help.innerHTML = `
                <strong>Swap Power-Up:</strong><br>
                1. Selecciona la primera pieza<br>
                2. Selecciona la segunda pieza<br>
                3. Las piezas intercambiarán posiciones<br>
                <em>¡Tu turno terminará automáticamente!</em>
            `;
            
            document.body.appendChild(help);
        }
    } else {
        const helpElement = document.getElementById('swap-help');
        if (helpElement) {
            helpElement.remove();
        }
    }
}