import { getAvailablePowerUpTypes, createPowerUpInstance, getPowerUpInfo } from './powerUpManager.js';
import { ShieldPowerUp } from './powerups/ShieldPowerUp.js';
import { ExtraMovePowerUp } from './powerups/ExtraMovePowerUp.js';
import { EvolutionPowerUp } from './powerups/EvolutionPowerUp.js';
import { CagePowerUp } from './powerups/CagePowerUp.js';
import { ReducerPowerUp } from './powerups/ReducerPowerUp.js';
import { SwapPowerUp } from './powerups/SwapPowerUp.js'; // NUEVO IMPORT
import { initializeGameIds, createNewRound, trackPowerupUsage } from './pruebasAPI.js';
import { midgameBoards } from './boards/midgameBoards.js';

// Sound effects
const moveSound = new Audio('../Sonidos/moving-piece.mp3');

/**
 * Maps powerup names to their database IDs
 * @param {string} powerupName - The name of the powerup
 * @returns {number} The database ID of the powerup
 */
function getPowerUpIdByName(powerupName) {
    // Mapping de nombres de powerups a sus IDs en la base de datos
    const powerupIdMap = {
        'Fence': 1,
        'Pawn Range': 2,
        'Crazy King': 3,
        'Horizontal Portal': 4,
        'Blast': 5,
        'Shield': 6,
        'Cage': 7,
        'Extra Move': 8,
        'Evolution': 9,
        'Reducer': 10,
        'Swap': 11
    };
    
    return powerupIdMap[powerupName] || 1; // Default a 1 si no se encuentra
}

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

// Chess pieces
function playSound(soundFile) {
    moveSound.currentTime = 0;
    moveSound.volume = 0.3;
    moveSound.play().catch(e => console.log("Error de audio:", e));
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
            // NUEVA LÓGICA ESPECIAL PARA SWAP - necesita 2 piezas
            if (awaitingPowerUpTarget.powerUpType === 'Swap') {
                // Inicializar selección de piezas para swap si no existe
                if (!gameContext.swapSelection) {
                    gameContext.swapSelection = { pieces: [], count: 0 };
                }

                // Verificar si hay una pieza en la casilla clickeada
                const clickedPiece = board[r][c];
                if (!clickedPiece) {
                    if (gameContext.messageElement) {
                        gameContext.messageElement.textContent = "Debes seleccionar una casilla con pieza para intercambiar.";
                    }
                    return;
                }

                // Agregar pieza a la selección
                const pieceData = { row: r, col: c };
                
                // Verificar si ya seleccionó esta pieza
                const alreadySelected = gameContext.swapSelection.pieces.some(p => 
                    p.row === r && p.col === c);
                
                if (alreadySelected) {
                    if (gameContext.messageElement) {
                        gameContext.messageElement.textContent = "Ya seleccionaste esta pieza. Elige otra diferente.";
                    }
                    return;
                }

                gameContext.swapSelection.pieces.push(pieceData);
                gameContext.swapSelection.count++;

                if (gameContext.swapSelection.count === 1) {
                    // Primera pieza seleccionada
                    if (gameContext.messageElement) {
                        const pieceName = {
                            'p': 'Peón', 'n': 'Caballo', 'b': 'Alfil', 
                            'r': 'Torre', 'q': 'Reina', 'k': 'Rey'
                        }[clickedPiece.type];
                        const pieceColor = clickedPiece.color === 'w' ? 'Blancas' : 'Negras';
                        gameContext.messageElement.textContent = 
                            `Swap: ${pieceName} de ${pieceColor} seleccionado. Ahora selecciona la segunda pieza para intercambiar.`;
                    }
                    gameContext.renderBoard(); // Mostrar selección
                    return;
                } else if (gameContext.swapSelection.count === 2) {
                    // Segunda pieza seleccionada - activar swap
                    const targetData = {
                        piece1: gameContext.swapSelection.pieces[0],
                        piece2: gameContext.swapSelection.pieces[1]
                    };

                    if (powerUp.canActivate(gameContext, currentColor, targetData)) {
                        const activationSuccessful = powerUp.activate(gameContext, currentColor, targetData);
                        if (activationSuccessful) {
                            const inventory = currentColor === 'w' ? powerUpsWhite : powerUpsBlack;
                            const index = inventory.indexOf(awaitingPowerUpTarget.powerUpType);
                            if (index > -1) {
                                inventory.splice(index, 1);
                            }
                            
                            // NUEVO: Registrar uso del powerup en la base de datos
                            if (gameContext.currentGameId && gameContext.currentRoundId && gameContext.playerIds) {
                                const powerupData = {
                                    id_powerup: getPowerUpIdByName(awaitingPowerUpTarget.powerUpType),
                                    id_jugador: gameContext.playerIds[currentColor],
                                    id_partida: gameContext.currentGameId,
                                    id_ronda: gameContext.currentRoundId,
                                    color: currentColor
                                };
                                
                                console.log('🎯 Registrando uso de powerup:', {
                                    powerupName: awaitingPowerUpTarget.powerUpType,
                                    playerColor: currentColor,
                                    powerupData,
                                    mappedId: getPowerUpIdByName(awaitingPowerUpTarget.powerUpType)
                                });
                                
                                trackPowerupUsage(powerupData)
                                    .then(result => {
                                        console.log('✅ Powerup registrado exitosamente:', result);
                                    })
                                    .catch(error => {
                                        console.error('❌ Error registrando uso de powerup:', error);
                                    });
                            } else {
                                console.warn('⚠️ No se puede registrar powerup - falta información de contexto:', {
                                    hasGameId: !!gameContext.currentGameId,
                                    hasRoundId: !!gameContext.currentRoundId,
                                    hasPlayerIds: !!gameContext.playerIds,
                                    playerIds: gameContext.playerIds
                                });
                            }
                        }
                    }
                    
                    // Limpiar selección de swap
                    gameContext.swapSelection = null;
                    gameContext.awaitingPowerUpTarget = null;
                    gameContext.renderBoard();
                    return;
                }
            } else {
                // Lógica normal para otros power-ups (SIN CAMBIOS)
                if (powerUp.canActivate(gameContext, currentColor, { row: r, col: c })) {
                    const activationSuccessful = powerUp.activate(gameContext, currentColor, { row: r, col: c });
                    if (activationSuccessful) {
                        const inventory = currentColor === 'w' ? powerUpsWhite : powerUpsBlack;
                        const index = inventory.indexOf(awaitingPowerUpTarget.powerUpType);
                        if (index > -1) {
                            inventory.splice(index, 1);
                        }
                        // renderPowerUpInventories is called by renderBoard in board.js
                        
                        // NUEVO: Registrar uso del powerup en la base de datos
                        if (gameContext.currentGameId && gameContext.currentRoundId && gameContext.playerIds) {
                            const powerupData = {
                                id_powerup: getPowerUpIdByName(awaitingPowerUpTarget.powerUpType),
                                id_jugador: gameContext.playerIds[currentColor],
                                id_partida: gameContext.currentGameId,
                                id_ronda: gameContext.currentRoundId,
                                color: currentColor
                            };
                            
                            console.log('🎯 Registrando uso de powerup:', {
                                powerupName: awaitingPowerUpTarget.powerUpType,
                                playerColor: currentColor,
                                powerupData,
                                mappedId: getPowerUpIdByName(awaitingPowerUpTarget.powerUpType)
                            });
                            
                            trackPowerupUsage(powerupData)
                                .then(result => {
                                    console.log('✅ Powerup registrado exitosamente:', result);
                                })
                                .catch(error => {
                                    console.error('❌ Error registrando uso de powerup:', error);
                                });
                        } else {
                            console.warn('⚠️ No se puede registrar powerup - falta información de contexto:', {
                                hasGameId: !!gameContext.currentGameId,
                                hasRoundId: !!gameContext.currentRoundId,
                                hasPlayerIds: !!gameContext.playerIds,
                                playerIds: gameContext.playerIds
                            });
                        }
                    }
                }
                // canActivate or activate should set messageElement if there's an issue
                gameContext.awaitingPowerUpTarget = null;
                gameContext.renderBoard(); // Re-render for any visual changes from power-up
                return; // End handleClick after power-up attempt
            }
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

        playSound(moveSound);

        // --- Actual Move Execution ---
        const pieceToMove = board[fr][fc];
        const capturedPiece = board[r][c]; // Store captured piece before overwriting

        // NUEVO: Incrementar contador de turnos para el jugador actual
        if (gameContext.gameStats) {
            const playerStats = currentColor === 'w' ? gameContext.gameStats.white : gameContext.gameStats.black;
            playerStats.turns++;
        }

        if (capturedPiece) {
            updateScoreWithPowerups(currentColor, gameContext, capturedPiece);
            
            // NUEVO: Incrementar contador de capturas para el jugador actual
            if (gameContext.gameStats) {
                const playerStats = currentColor === 'w' ? gameContext.gameStats.white : gameContext.gameStats.black;
                playerStats.captured++;
            }
        }

        board[r][c] = pieceToMove;
        board[r][c].hasMoved = true;
        board[fr][fc] = null;

        // NUEVA VERIFICACIÓN: Detectar captura del rey como jaque mate automático
        if (capturedPiece && capturedPiece.type === 'k') {
            // El rey ha sido capturado - jaque mate automático
            const winnerColor = currentColor; // El jugador que capturó gana
            const capturedKingColor = capturedPiece.color;
            const winnerColorName = winnerColor === 'w' ? 'Blancas' : 'Negras';
            const capturedKingColorName = capturedKingColor === 'w' ? 'Blancas' : 'Negras';
            
            if (gameContext.messageElement) {
                gameContext.messageElement.textContent = `¡Rey de ${capturedKingColorName} capturado! ${winnerColorName} ganan la ronda.`;
            }
            
            // Declarar ganador inmediatamente
            if (gameContext.declareWinner) {
                gameContext.declareWinner(winnerColor);
            } else if (gameContext.handleRoundEnd) {
                gameContext.handleRoundEnd(winnerColor, gameContext);
            }
            gameContext.renderBoard();
            return; // Terminar la función inmediatamente
        }

        // NUEVA VERIFICACIÓN: Limpiar cage si la pieza enjaulada fue capturada
        if (capturedPiece) {
            CagePowerUp.removeCageIfPieceCaptured(gameContext, r, c, capturedPiece);
        }

        // NUEVA VERIFICACIÓN: Limpiar reducer si la pieza reducida fue capturada
        if (capturedPiece) {
            ReducerPowerUp.removeReducerIfPieceCaptured(gameContext, r, c, capturedPiece);
        }

        // Evolution ahora es instantáneo al activarse, no requiere verificación de movimientos
        // (las líneas problemáticas de checkPawnEvolution fueron removidas)

        // NUEVA INTEGRACIÓN: Actualizar Shield cuando se mueve una pieza
        if (gameContext.activePowerUps) {
            gameContext.activePowerUps.forEach(powerUp => {
                // Actualizar Shield
                if (powerUp.type === 'Shield' && 
                    powerUp.targetRow === fr && 
                    powerUp.targetCol === fc &&
                    powerUp.remainingDuration > 0) {
                    
                    powerUp.targetRow = r;
                    powerUp.targetCol = c;
                    ShieldPowerUp.updateShieldPosition(gameContext, fr, fc, r, c);
                }
            });
        }

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
        // LÓGICA SÚPER SIMPLE: Extra Move
        if (gameContext.extraMoveActive) {
            const turnChanged = ExtraMovePowerUp.processExtraMove(gameContext);
            
            if (!turnChanged) {
                gameContext.selected = null;
                // Continuar con el mismo jugador - NO cambiar turno
            } else {
                gameContext.selected = null;
                processTurnStartPowerUps(gameContext);
            }
        } else {
            // Lógica normal de cambio de turno
            const opponentColor = currentColor === 'w' ? 'b' : 'w';
            gameContext.currentColor = opponentColor;
            gameContext.selected = null;
            processTurnStartPowerUps(gameContext);
        }

        // NUEVA IMPLEMENTACIÓN: Usar funciones mejoradas de pieces.js
        let turnMessage = "";
        
        // Verificar jaque mate usando la nueva función
        if (gameContext.isCheckmate(gameContext.currentColor)) {
            // El jugador que acaba de mover gana
            const winnerColor = currentColor;
            if (gameContext.declareWinner) {
                gameContext.declareWinner(winnerColor);
            } else if (gameContext.handleRoundEnd) {
                gameContext.handleRoundEnd(winnerColor, gameContext);
            }
            turnMessage = `¡Jaque Mate! ${winnerColor === 'w' ? 'Blancas' : 'Negras'} ganan la ronda.`;
        } 
        // Verificar ahogado usando la nueva función
        else if (gameContext.isStalemate && gameContext.isStalemate(gameContext.currentColor)) {
            if (gameContext.declareStalemate) {
                gameContext.declareStalemate();
                turnMessage = "¡Tablas por Ahogado! Ambos jugadores reciben 1 punto.";
            } else {
                messageElement.textContent = "¡Tablas por Ahogado!";
                gameContext.gameOver = true;
            }
        } 
        // Verificar jaque simple
        else if (gameContext.isKingInCheck(gameContext.board, gameContext.currentColor)) {
            const currentColorName = gameContext.currentColor === 'w' ? 'Blancas' : 'Negras';
            turnMessage = `¡Jaque! Turno de ${currentColorName}.`;
        } 
        // Juego continúa normalmente
        else {
            const currentColorName = gameContext.currentColor === 'w' ? 'Blancas' : 'Negras';
            if (gameContext.extraMoveActive) {
                // El mensaje ya se maneja en processExtraMove
                turnMessage = "";
            } else {
                turnMessage = `Turno de ${currentColorName}.`;
            }
        }
        
        // Only update message if game is not over by checkmate (declareWinner sets its own message)
        if (!gameContext.gameOver || (gameContext.gameOver && messageElement.textContent.includes("Ahogado"))) {
             if (messageElement.textContent.includes("Reina!") && turnMessage.startsWith("Turno")) {
                // Append to promotion message
                messageElement.textContent += " " + turnMessage;
            } else if (messageElement.textContent.includes("Reina!") && turnMessage.startsWith("¡Jaque!")) {
                messageElement.textContent += " " + turnMessage;
            }
            else if (!messageElement.textContent.includes("gana la ronda") && turnMessage !== "") { // Avoid overwriting win message
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

/**
 *  Configurar funciones auxiliares para gameContext
 */
export function setupGameContext(gameContext) {
    // Asegurar que gameContext.switchTurn esté definido para SwapPowerUp
    if (!gameContext.switchTurn) {
        gameContext.switchTurn = function() {
            const opponentColor = gameContext.currentColor === 'w' ? 'b' : 'w';
            gameContext.currentColor = opponentColor;
            
            // Procesar power-ups al inicio del turno
            processTurnStartPowerUps(gameContext);
            
            const currentColorName = gameContext.currentColor === 'w' ? 'Blancas' : 'Negras';
            if (gameContext.messageElement && !gameContext.messageElement.textContent.includes("intercambian")) {
                gameContext.messageElement.textContent = `Turno de ${currentColorName}.`;
            }
            
            gameContext.renderBoard();
        };
    }
}

/**
 *  Cancelar selección de Swap
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

export async function initGame(whitePlayerEmail, blackPlayerEmail) {
    const randomIndex = Math.floor(Math.random() * midgameBoards.neutral.length);
    const initialBoard = JSON.parse(JSON.stringify(midgameBoards.neutral[randomIndex]));

    const gameContext = {
        board: initialBoard,
        currentColor: 'w',
        selected: null,
        gameOver: false,
        boardElement: document.getElementById('board'),
        messageElement: document.getElementById('message'),
        powerUpsWhite: [],
        powerUpsBlack: [],
        activePowerUps: [],
        currentGameId: null,
        currentRoundId: null,
        // Inicializar contadores de puntos
        score1: 0,
        score2: 0,
        // Inicializar umbrales de powerups
        nextThresholdWhite: 5,
        nextThresholdBlack: 5,
        playerIds: {
            'w': null,
            'b': null
        },
        getCurrentPlayerId: function(color) {
            return this.playerIds[color];
        },
        // Agregar función grantPowerUp
        grantPowerUp: function(color, powerUpType) {
            if (!powerUpType) return;
            
            const inventory = color === 'w' ? this.powerUpsWhite : this.powerUpsBlack;
            const maxPowerUps = 5; // Límite de 5 powerups por jugador
            
            if (inventory.length >= maxPowerUps) {
                if (this.messageElement) {
                    this.messageElement.textContent = `${color === 'w' ? 'Blancas' : 'Negras'} tienen el máximo de power-ups (${maxPowerUps}).`;
                }
                return;
            }
            
            inventory.push(powerUpType);
            if (this.messageElement) {
                const powerUpInfo = getPowerUpInfo(powerUpType);
                const powerUpName = powerUpInfo ? powerUpInfo.name : powerUpType;
                this.messageElement.textContent = 
                    `¡${color === 'w' ? 'Blancas' : 'Negras'} obtienen power-up: ${powerUpName}!`;
            }
            this.renderBoard(); // Para actualizar la UI de powerups
        }
    };

    try {
        // Inicializar IDs desde la base de datos
        await initializeGameIds(gameContext, whitePlayerEmail, blackPlayerEmail);
        
        console.log('✅ Game IDs initialized successfully:');
        console.log('- Game ID:', gameContext.currentGameId);
        console.log('- Round ID:', gameContext.currentRoundId);
        console.log('- White Player ID:', gameContext.playerIds['w']);
        console.log('- Black Player ID:', gameContext.playerIds['b']);
        
        // Resto de la inicialización del juego...
        setupGameContext(gameContext);
        
        // Inicializar displays de puntuación
        document.getElementById('score1').textContent = '0';
        document.getElementById('score2').textContent = '0';
        
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = 'Partida inicializada correctamente. Turno de las Blancas.';
        }
        
        return gameContext;
    } catch (error) {
        console.error('Error inicializando el juego:', error);
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = 'Error inicializando el juego. Por favor, intenta de nuevo.';
        }
        throw error;
    }
}

/**
 * Helper function to get a random board (used by resetGame)
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
 * Resets the game state for a new round or a full game restart.
 * @param {object} gameContext - The current game context.
 * @param {boolean} [fullReset=false] - True to reset all rounds and scores, false for next round.
 */
export async function resetGame(gameContext, fullReset = false) {
    let newBoard;

    if (fullReset) {
        // For full reset, use neutral boards
        newBoard = getRandomBoard(midgameBoards.neutral);
    } else { 
        // For round resets, the board selection logic would be handled by index.js
        // based on the round number and wins, so we default to neutral here
        newBoard = getRandomBoard(midgameBoards.neutral);

        // Crear nueva ronda en la base de datos si no es reset completo
        try {
            if (gameContext.currentGameId) {
                const roundNumber = gameContext.currentRound || 1;
                const roundId = await createNewRound(gameContext.currentGameId, roundNumber);
                gameContext.currentRoundId = roundId;
            }
        } catch (error) {
            console.error('Error creando nueva ronda:', error);
            if(gameContext.messageElement) {
                gameContext.messageElement.textContent = 'Error al crear nueva ronda. Algunas funciones pueden no estar disponibles.';
            }
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

    // Update message if messageElement exists
    if(gameContext.messageElement) {
        gameContext.messageElement.textContent = "Juego reiniciado. Turno de las Blancas.";
    }
    
    // Render board if render function exists
    if (gameContext.renderBoard) {
        gameContext.renderBoard();
    }
}