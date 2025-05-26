import { getAvailablePowerUpTypes, createPowerUpInstance } from './powerUpManager.js';

/**
 * Processes active power-ups at the start of a player's turn.
 * This includes decrementing durations and deactivating expired power-ups.
 * @param {object} gameContext - The current game context.
 */
function processTurnStartPowerUps(gameContext) {
    if (gameContext.activePowerUps && gameContext.activePowerUps.length > 0) {
        let boardNeedsRender = false;
        // Iterate backwards for safe removal if a power-up deactivates itself
        for (let i = gameContext.activePowerUps.length - 1; i >= 0; i--) {
            const activeInstanceData = gameContext.activePowerUps[i];
            const powerUpBlueprint = createPowerUpInstance(activeInstanceData.type); // Get the class methods

            if (powerUpBlueprint && typeof powerUpBlueprint.onTurnStart === 'function') {
                // Pass the specific instance data from activePowerUps
                powerUpBlueprint.onTurnStart(gameContext, activeInstanceData);
                // onTurnStart might modify activePowerUps (e.g., by calling deactivate)
                // or change game state requiring a re-render.
                // If a power-up deactivates, its deactivate method should handle removal
                // from gameContext.activePowerUps and potentially trigger a render.
            }
        }
        // If any power-up modified the board state directly or expired, a re-render might be needed.
        // The individual power-up's deactivate method should call renderBoard if necessary.
        // For simplicity, we can ensure a render if activePowerUps changed.
        // However, it's better if individual deactivations handle their own rendering needs.
    }
}

/**
 * Handles clicks on the chessboard cells.
 * Manages piece selection, movement, and power-up targeting/activation.
 * @param {number} r - The row clicked.
 * @param {number} c - The column clicked.
 * @param {object} gameContext - The current game context.
 */
export function handleClick(r, c, gameContext) {
    let { board, currentColor, selected, messageElement, awaitingPowerUpTarget, powerUpsWhite, powerUpsBlack } = gameContext;

    if (gameContext.gameOver) return;

    // 1. Handle Power-Up Targeting and Activation
    if (awaitingPowerUpTarget && awaitingPowerUpTarget.playerColor === currentColor) {
        const powerUp = createPowerUpInstance(awaitingPowerUpTarget.powerUpType);
        if (powerUp) {
            // Pass target data for canActivate if it needs it (e.g. to check if target is valid before activation attempt)
            if (powerUp.canActivate(gameContext, currentColor, { row: r, col: c })) {
                const activationSuccessful = powerUp.activate(gameContext, currentColor, { row: r, col: c });
                if (activationSuccessful) {
                    const inventory = currentColor === 'w' ? powerUpsWhite : powerUpsBlack;
                    const index = inventory.indexOf(awaitingPowerUpTarget.powerUpType);
                    if (index > -1) {
                        inventory.splice(index, 1);
                    }
                    // renderPowerUpInventories is called by renderBoard in board.js
                }
            }
            // canActivate or activate should set messageElement if there's an issue
            gameContext.awaitingPowerUpTarget = null;
            gameContext.renderBoard(); // Re-render for any visual changes from power-up
            return; // End handleClick after power-up attempt
        } else {
            console.error("Failed to create power-up instance for targeting:", awaitingPowerUpTarget.powerUpType);
            gameContext.awaitingPowerUpTarget = null; // Clear invalid state
        }
    }

    // 2. Handle Piece Selection / Deselection
    if (!selected) {
        const piece = board[r][c];
        if (gameContext.fencedTiles && gameContext.fencedTiles.find(tile => tile.row === r && tile.col === c)) {
            messageElement.textContent = "No se puede seleccionar una casilla con valla.";
            return;
        }
        if (piece && piece.color === currentColor) {
            gameContext.selected = [r, c];
            gameContext.renderBoard();
        } else if (piece) {
            messageElement.textContent = `Es el turno de ${currentColor === 'w' ? 'Blancas' : 'Negras'}!`;
        }
        return;
    }

    // 3. Handle Piece Movement
    const [fr, fc] = selected;
    console.log(`Attempting move from ${fr},${fc} to ${r},${c}`);

    if (gameContext.fencedTiles && gameContext.fencedTiles.find(tile => tile.row === r && tile.col === c)) {
        messageElement.textContent = "No se puede mover a una casilla con valla.";
        gameContext.selected = null;
        gameContext.renderBoard();
        return;
    }

    const kingCurrentlyInCheck = gameContext.isKingInCheck(gameContext.board, currentColor);

    if (gameContext.isLegalMove(fr, fc, r, c)) { // isLegalMove considers self-check
        console.log(`Move from ${fr},${fc} to ${r},${c} IS LEGAL`);
        // --- Actual Move Execution ---
        const pieceToMove = board[fr][fc];
        const capturedPiece = board[r][c]; // Store captured piece before overwriting

        if (capturedPiece) {
            updateScoreWithPowerups(currentColor, gameContext, capturedPiece);
        }

        board[r][c] = pieceToMove;
        board[r][c].hasMoved = true;
        board[fr][fc] = null;

        // Handle Castling: Move the rook
        const isCastlingMove = pieceToMove.type === 'k' && Math.abs(c - fc) === 2;
        if (isCastlingMove) {
            const rookStartCol = c > fc ? 7 : 0; // Rook's original column
            const rookEndCol = c > fc ? c - 1 : c + 1; // Rook's new column
            board[r][rookEndCol] = board[r][rookStartCol];
            if (board[r][rookEndCol]) { // Ensure rook exists before setting hasMoved
                 board[r][rookEndCol].hasMoved = true;
            }
            board[r][rookStartCol] = null;
        }

        // Handle Pawn Promotion
        if (pieceToMove.type === 'p') {
            if ((pieceToMove.color === 'w' && r === 0) || (pieceToMove.color === 'b' && r === 7)) {
                board[r][c] = { type: 'q', color: pieceToMove.color, hasMoved: true }; // Auto-promote to Queen
                messageElement.textContent = `¡Peón promovido a Reina!`;
            }
        }

        // --- End of Turn Logic ---
        const opponentColor = currentColor === 'w' ? 'b' : 'w';
        gameContext.currentColor = opponentColor;
        gameContext.selected = null;

        // Process duration-based power-ups for the new current player (whose turn it now is)
        processTurnStartPowerUps(gameContext); // This updates durations, deactivates if needed

        // NUEVA IMPLEMENTACIÓN: Usar funciones mejoradas de pieces.js
        let turnMessage = "";
        
        // Verificar jaque mate usando la nueva función
        if (gameContext.isCheckmate(opponentColor)) {
            // El jugador que acaba de mover (currentColor antes del cambio) gana
            const winnerColor = currentColor === 'w' ? 'b' : 'w'; // currentColor ya cambió
            gameContext.declareWinner(winnerColor);
            turnMessage = `¡Jaque Mate! ${winnerColor === 'w' ? 'Blancas' : 'Negras'} ganan la ronda.`;
        } 
        // Verificar ahogado usando la nueva función
        else if (gameContext.isStalemate && gameContext.isStalemate(opponentColor)) {
            messageElement.textContent = "¡Tablas por Ahogado!";
            gameContext.gameOver = true;
        } 
        // Verificar jaque simple
        else if (gameContext.isKingInCheck(gameContext.board, opponentColor)) {
            turnMessage = `¡Jaque! Turno de ${opponentColor === 'w' ? 'Blancas' : 'Negras'}.`;
        } 
        // Juego continúa normalmente
        else {
            turnMessage = `Turno de ${opponentColor === 'w' ? 'Blancas' : 'Negras'}.`;
        }
        
        // Only update message if game is not over by checkmate (declareWinner sets its own message)
        if (!gameContext.gameOver || (gameContext.gameOver && messageElement.textContent.includes("Ahogado"))) {
             if (messageElement.textContent.includes("Reina!") && turnMessage.startsWith("Turno de")) {
                // Append to promotion message
                messageElement.textContent += " " + turnMessage;
            } else if (messageElement.textContent.includes("Reina!") && turnMessage.startsWith("¡Jaque!")) {
                messageElement.textContent += " " + turnMessage;
            }
            else if (!messageElement.textContent.includes("gana la ronda")) { // Avoid overwriting win message
                 messageElement.textContent = turnMessage;
            }
        }

    } else { // Move was not legal (e.g., put self in check, or basic rules)
        messageElement.textContent = "Movimiento inválido.";
        gameContext.selected = null; // Deselect
    }
    gameContext.renderBoard(); // Render at the end of any action
}

/**
 * Selects a random power-up type from the available ones.
 * @returns {string|null} The type name of the power-up, or null if none are available.
 */
function getRandomPowerUp() {
    const availableTypes = getAvailablePowerUpTypes();
    if (availableTypes.length === 0) {
        console.warn("No power-up types available to grant.");
        return null;
    }
    const randomIndex = Math.floor(Math.random() * availableTypes.length);
    return availableTypes[randomIndex];
}

/**
 * Updates player scores and grants power-ups based on captures.
 * @param {string} playerColor - The color of the player who made the capture ('w' or 'b').
 * @param {object} gameContext - The current game context.
 * @param {object} capturedPiece - The piece that was captured.
 */
function updateScoreWithPowerups(playerColor, gameContext, capturedPiece) {
    if (!capturedPiece) return;

    let points = 0;
    switch (capturedPiece.type) {
        case 'p': points = 2; break;
        case 'n': case 'b': points = 4; break;
        case 'r': points = 6; break;
        case 'q': points = 9; break;
        // Capturing a king is not standard for points, but you can add if needed for a variant
        default: points = 0;
    }

    if (points > 0) {
        const playerDisplayColor = playerColor === 'w' ? 'Blancas' : 'Negras';
        // gameContext.messageElement.textContent = `${playerDisplayColor} capturan ${capturedPiece.type} y ganan ${points} puntos.`;
        // This message might be overwritten by check/checkmate/turn message, consider appending or a separate log area.
    }

    if (playerColor === 'w') {
        gameContext.score1 += points;
        document.getElementById('score1').textContent = gameContext.score1;
        if (gameContext.score1 >= gameContext.nextThresholdWhite) {
            const newPowerUp = getRandomPowerUp();
            if (newPowerUp) gameContext.grantPowerUp('w', newPowerUp);
            gameContext.nextThresholdWhite += 5;
        }
    } else { // 'b'
        gameContext.score2 += points;
        document.getElementById('score2').textContent = gameContext.score2;
        if (gameContext.score2 >= gameContext.nextThresholdBlack) {
            const newPowerUp = getRandomPowerUp();
            if (newPowerUp) gameContext.grantPowerUp('b', newPowerUp);
            gameContext.nextThresholdBlack += 5;
        }
    }
}

// This function seems redundant if updateScoreWithPowerups handles all scoring.
// If it's for other types of score updates, keep it. Otherwise, it can be removed.
// For now, assuming it might be used elsewhere or was part of an older system.
export function updateScore(player, gameContext) {
    // This function is currently not called by handleClick if captures handle points.
    // If it's for round wins or other non-capture points, its logic would differ.
    // For now, let's assume it's for a generic point increment if needed.
    if (player === 'white') { // Assuming 'white'/'black' string
        gameContext.score1++;
        document.getElementById('score1').textContent = gameContext.score1;
    } else {
        gameContext.score2++;
        document.getElementById('score2').textContent = gameContext.score2;
    }
}