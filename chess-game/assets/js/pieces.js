import { ShieldPowerUp } from './powerups/ShieldPowerUp.js';
import { CagePowerUp } from './powerups/CagePowerUp.js'; // NUEVA LÍNEA

/**
 * Checks if the path between two squares is clear of other pieces and fences.
 * Does not check the destination square itself, only the path.
 * @param {number} fr - From row.
 * @param {number} fc - From column.
 * @param {number} tr - To row.
 * @param {number} tc - To column.
 * @param {object} gameContext - The current game context.
 * @returns {boolean} True if the path is clear, false otherwise.
 */
export function isPathClear(fr, fc, tr, tc, gameContext) {
    const { board, fencedTiles } = gameContext;
    const dr = Math.sign(tr - fr); // Direction of row change (-1, 0, or 1)
    const dc = Math.sign(tc - fc); // Direction of col change (-1, 0, or 1)

    let r = fr + dr;
    let c = fc + dc;

    while (r !== tr || c !== tc) {
        if (r < 0 || r >= 8 || c < 0 || c >= 8) return false; // Should not happen with valid tr, tc
        if (board[r][c] !== null) return false; // Path blocked by a piece
        if (fencedTiles && fencedTiles.find(tile => tile.row === r && tile.col === c)) return false; // Path blocked by a fence
        r += dr;
        c += dc;
    }
    return true;
}

/**
 * Checks if a move is legal based on basic piece movement rules.
 * Does NOT check for self-check (leaving the king in check).
 * @param {number} fr - From row.
 * @param {number} fc - From column.
 * @param {number} tr - To row.
 * @param {number} tc - To column.
 * @param {object} gameContext - The current game context.
 * @returns {boolean} True if the basic move is legal, false otherwise.
 */
export function isBasicLegalMove(fr, fc, tr, tc, gameContext) {
    const { board, fencedTiles } = gameContext;
    const piece = board[fr][fc];

    if (!piece) return false; // No piece to move

    const dr = tr - fr;
    const dc = tc - fc;
    const targetPiece = board[tr][tc];

    // Cannot move to a square occupied by a piece of the same color
    if (targetPiece && targetPiece.color === piece.color) return false;

    // Cannot move to or from a fenced tile (destination checked in isLegalMove, origin here as safeguard)
    if (fencedTiles && fencedTiles.find(tile => tile.row === tr && tile.col === tc)) return false;
    if (fencedTiles && fencedTiles.find(tile => tile.row === fr && tile.col === fc)) return false;

    switch (piece.type) {
        case 'p': // Pawn
            const dir = piece.color === 'w' ? -1 : 1;
            const startRow = piece.color === 'w' ? 6 : 1;

            // 2-square move if Pawn Range is active or if it is the first move
            if (dc === 0 && !targetPiece) {
                const isPawnRangeActive = gameContext.pawnRangeActive?.[piece.color];
                const isInitialPosition = (piece.color === 'w' && fr === 6) || (piece.color === 'b' && fr === 1);

                if ((isPawnRangeActive || isInitialPosition) && dr === 2 * dir) {
                const intermediateRow = fr + dir;
                if (
                    board[intermediateRow][fc] === null &&
                    !(fencedTiles?.some(tile => tile.row === intermediateRow && tile.col === fc))
                ) {
                    return true;
                }
                }
            }

            // Standard 1-square move
            if (dc === 0 && dr === dir && !targetPiece) return true;
            // Initial 2-square move
            if (dc === 0 && fr === startRow && dr === 2 * dir && !targetPiece && !board[fr + dir][fc] &&
                !(fencedTiles && fencedTiles.find(tile => tile.row === (fr + dir) && tile.col === fc))) { // Check intermediate square for piece AND fence
                return true;
            }
            // Diagonal capture
            if (Math.abs(dc) === 1 && dr === dir && targetPiece) return true;
            // En passant (to be implemented if desired)
            return false;

        case 'n': // Knight
            return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);

        case 'b': // Bishop
            if (Math.abs(dr) !== Math.abs(dc)) return false;
            return isPathClear(fr, fc, tr, tc, gameContext);

        case 'r': // Rook
            if (gameContext.activePowerUps?.some(p => p.type === "Horizontal Portal" && p.placedBy === piece.color)) {
                // Movement with horizontal portal
                if (dr === 0) return true;
            }
            // Normal movement
            if (dr !== 0 && dc !== 0) return false;
            return isPathClear(fr, fc, tr, tc, gameContext);

        case 'q': // Queen
            if (gameContext.activePowerUps?.some(p => p.type === "Horizontal Portal" && p.placedBy === piece.color)) {
                // Con portal activo: movimiento horizontal completo sin verificar camino
                if (dr === 0) return true;
            }
            // Movimiento normal (diagonal/horizontal/vertical)
            if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return false;
            return isPathClear(fr, fc, tr, tc, gameContext);

        case 'k': // King
            // If Crazy King is active, the king moves like a queen
            const isCrazyKingActive = gameContext.activePowerUps?.some(
                powerUp => powerUp.type === "Crazy King" && powerUp.placedBy === piece.color
            );

            if (isCrazyKingActive) {
                // Horizontal/vertical/diagonal movent as queen
                if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return false;
                if (targetPiece?.color === piece.color) return false; // No targeting same color pieces
                return isPathClear(fr, fc, tr, tc, gameContext); // Verify path to avoid check and other issues
            } else {
                // Normal 1-square move
                if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;

                // Castling
                if (!piece.hasMoved && dr === 0 && Math.abs(dc) === 2) {
                    if (isKingInCheck(board, piece.color, gameContext)) return false; // Cannot castle while in check

                    const rookCol = dc > 0 ? 7 : 0; // King moves right (kingside) or left (queenside)
                    const rook = board[fr][rookCol];

                    if (rook && rook.type === 'r' && !rook.hasMoved) {
                        // Check path between king and rook is clear (of pieces and fences)
                        if (!isPathClear(fr, fc, fr, rookCol, gameContext)) return false;

                        // Check squares king moves over are not attacked and not fenced
                        const step = dc > 0 ? 1 : -1;
                        if (isSquareAttacked(fr, fc + step, piece.color === 'w' ? 'b' : 'w', gameContext) ||
                            (fencedTiles && fencedTiles.find(tile => tile.row === fr && tile.col === fc + step))) return false;
                        if (isSquareAttacked(fr, fc + 2 * step, piece.color === 'w' ? 'b' : 'w', gameContext) ||
                            (fencedTiles && fencedTiles.find(tile => tile.row === fr && tile.col === fc + 2 * step))) return false;
                        
                        return true;
                    }
                }
            return false;
        }
    }
    return false;
}

/**
 * Checks if a given square is under attack by the specified attacking color.
 * @param {number} r - Row of the square to check.
 * @param {number} c - Column of the square to check.
 * @param {string} attackingColor - The color of the pieces that might be attacking ('w' or 'b').
 * @param {object} gameContext - The current game context.
 * @returns {boolean} True if the square is attacked, false otherwise.
 */
export function isSquareAttacked(r, c, attackingColor, gameContext) {
    const { board } = gameContext; // isBasicLegalMove will use gameContext for fencedTiles via isPathClear
    for (let R = 0; R < 8; R++) {
        for (let C = 0; C < 8; C++) {
            const piece = board[R][C];
            if (piece && piece.color === attackingColor) {
                // For pawns, the "capture" move is different from normal move.
                // isBasicLegalMove checks for valid captures.
                // We are checking if piece at R,C can "basically" move to r,c
                // For pawns, this means a diagonal capture.
                if (piece.type === 'p') {
                    const dir = piece.color === 'w' ? -1 : 1;
                    if (Math.abs(c - C) === 1 && (r - R) === dir) { // Potential pawn capture
                        // No need to check if target is occupied, just if the square is attacked
                        return true;
                    }
                } else if (isBasicLegalMove(R, C, r, c, { ...gameContext, currentColor: attackingColor })) {
                    // Temporarily set currentColor for isBasicLegalMove context if it relies on it
                    // However, isBasicLegalMove should ideally not depend on gameContext.currentColor
                    // For non-pawn pieces, isBasicLegalMove checks if they can move to the target square.
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Finds the position of the king for a given color.
 * @param {Array<Array<object|null>>} board - The game board.
 * @param {string} color - The color of the king to find ('w' or 'b').
 * @returns {Array<number>|null} [row, col] of the king, or null if not found.
 */
export function findKing(board, color) {
    if (!board) {
          console.error("findKing fue llamado con un tablero undefined o null");
          return null;
      }
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r] && typeof board[r][c] !== 'undefined') {
                const piece = board[r][c];
                // Solo proceder si la pieza no es null
                if (piece !== null && piece.type === 'k' && piece.color === color) {
                    return [r, c];
                }
            } else {
                console.warn(`findKing: Fila ${r} o celda ${c} es undefined en el tablero.`);
            }
        }
    }
    console.warn(`findKing: Rey de color ${color} no encontrado.`); // Descomentar para depurar si el rey no se encuentra
    return null;
}

/**
 * Checks if the king of a given color is currently in check.
 * @param {Array<Array<object|null>>} board - The game board state to check.
 * @param {string} kingColor - The color of the king to check ('w' or 'b').
 * @param {object} gameContext - The *full* game context, needed for isSquareAttacked.
 * @returns {boolean} True if the king is in check, false otherwise.
 */
export function isKingInCheck(board, kingColor, gameContext) { // Pass full gameContext
    const kingPos = findKing(board, kingColor);
    if (!kingPos) return false; // No king, no check (shouldn't happen)
    const opponentColor = kingColor === 'w' ? 'b' : 'w';
    // Create a temporary context for isSquareAttacked if it needs a board different from gameContext.board
    const tempContext = { ...gameContext, board: board };
    return isSquareAttacked(kingPos[0], kingPos[1], opponentColor, tempContext);
}

/**
 * Simula un movimiento y verifica si deja al rey en jaque
 * @param {number} fr - Fila origen
 * @param {number} fc - Columna origen
 * @param {number} tr - Fila destino
 * @param {number} tc - Columna destino
 * @param {string} playerColor - Color del jugador que mueve
 * @param {object} gameContext - Contexto del juego
 * @returns {boolean} True si el movimiento deja al rey en jaque
 */
function wouldMoveLeaveKingInCheck(fr, fc, tr, tc, playerColor, gameContext) {
    const { board } = gameContext;
    
    // Crear copia profunda del tablero
    const tempBoard = board.map(row => row.map(piece => piece ? { ...piece } : null));
    
    // Simular el movimiento
    const movingPiece = tempBoard[fr][fc];
    if (!movingPiece) return true; // No hay pieza para mover
    
    tempBoard[tr][tc] = movingPiece;
    tempBoard[fr][fc] = null;
    
    // Crear contexto temporal
    const tempGameContext = {
        ...gameContext,
        board: tempBoard
    };
    
    // Verificar si el rey estaría en jaque
    return isKingInCheck(tempBoard, playerColor, tempGameContext);
}

/**
 * Checks if a move is fully legal, including whether it leaves the player's own king in check.
 * @param {number} fr - From row.
 * @param {number} fc - From column.
 * @param {number} tr - To row.
 * @param {number} tc - To column.
 * @param {object} gameContext - The current game context.
 * @returns {boolean} True if the move is fully legal, false otherwise.
 */
export function isLegalMove(fr, fc, tr, tc, gameContext) {
    const { board, currentColor, fencedTiles } = gameContext;
    const piece = board[fr][fc];

    if (!piece || piece.color !== currentColor) return false; // Can only move own pieces

    // Prevent moving to a fenced tile (destination check)
    if (fencedTiles && fencedTiles.find(tile => tile.row === tr && tile.col === tc)) {
        return false;
    }

    if (!isBasicLegalMove(fr, fc, tr, tc, gameContext)) {
        return false;
    }

    // VERIFICACIÓN DE SHIELD - Protección contra capturas
    if (ShieldPowerUp.isMovementBlockedByShield(gameContext, fr, fc, tr, tc)) {
        return false;
    }

    // VERIFICACIÓN DE CAGE - Inmovilización de piezas
    if (CagePowerUp.isMovementBlockedByCage(gameContext, fr, fc)) {
        return false;
    }

    // Verificar si el movimiento deja al rey en jaque usando la nueva función
    if (wouldMoveLeaveKingInCheck(fr, fc, tr, tc, piece.color, gameContext)) {
        console.log(`isLegalMove: Move would leave king in check`);
        return false;
    }

    console.log(`isLegalMove: Move is fully legal.`);
    return true;
}

// Logic for using the power up Horizontal Portal
function getHorizontalPortalMoves(r, c, gameContext, piece) {
    const moves = [];
    if (piece.type === 'r' || piece.type === 'q') {
        // Movimientos horizontales completos (para torre y reina)
        for (let tc = 0; tc < 8; tc++) {
            if (tc !== c) {
                moves.push({row: r, col: tc});
            }
        }
    }
    return moves;
}

/**
 * Obtiene todos los movimientos posibles para una pieza (solo básicos, sin filtrar por jaque)
 * @param {number} r - Fila de la pieza
 * @param {number} c - Columna de la pieza
 * @param {Array} board - Tablero del juego
 * @param {string} color - Color de la pieza
 * @param {object} gameContext - Contexto del juego
 * @returns {Array} Array de movimientos posibles {r, c}
 */
export function getPossibleMovesForPiece(r, c, board, color, gameContext) {
    const possibleMoves = [];
    const piece = board[r][c];

    if (!piece || piece.color !== color) return possibleMoves;

    // Crear contexto temporal para verificar movimientos
    const tempContext = { ...gameContext, board: board, currentColor: color };

    for (let tr = 0; tr < 8; tr++) {
        for (let tc = 0; tc < 8; tc++) {
            if (isBasicLegalMove(r, c, tr, tc, tempContext)) {
                possibleMoves.push({ r: tr, c: tc });
            }
        }
    }

    // Si horizontal portal está activo, agregar movimientos especiales
    const isPortalActive = gameContext.activePowerUps?.some(
        p => p.type === "Horizontal Portal" && p.placedBy === piece.color
    );

    if (isPortalActive && (piece.type === 'r' || piece.type === 'q')) {
        const portalMoves = getHorizontalPortalMoves(r, c, gameContext, piece);
        portalMoves.forEach(move => {
            if (!possibleMoves.some(m => m.r === move.row && m.c === move.col)) {
                const targetPiece = board[move.row][move.col];
                if (!targetPiece || targetPiece.color !== piece.color) {
                    if (!gameContext.fencedTiles?.some(t => t.row === move.row && t.col === move.col)) {
                        possibleMoves.push({ r: move.row, c: move.col });
                    }
                }
            }
        });
    }

    return possibleMoves;
}

/**
 * Calculates all possible legal moves for a piece at a given position.
 * @param {number} r - Row of the piece.
 * @param {number} c - Column of the piece.
 * @param {object} gameContext - The current game context.
 * @returns {Array<object>} An array of possible move objects { row, col, capture }.
 */
export function getPossibleMoves(r, c, gameContext) {
    const { board } = gameContext;
    const possibleMoves = [];
    const piece = board[r][c];

    if (!piece || piece.color !== gameContext.currentColor) return possibleMoves; // Only for current player's pieces

    for (let tr = 0; tr < 8; tr++) {
        for (let tc = 0; tc < 8; tc++) {
            if (isLegalMove(r, c, tr, tc, gameContext)) {
                possibleMoves.push({
                    row: tr,
                    col: tc,
                    capture: board[tr][tc] !== null && board[tr][tc].color !== piece.color
                });
            }
        }
    }

    return possibleMoves;
}

/**
 * Verifica si un jugador tiene movimientos legales disponibles
 * @param {string} playerColor - Color del jugador ('w' o 'b')
 * @param {object} gameContext - Contexto del juego
 * @returns {boolean} True si tiene movimientos legales
 */
function hasLegalMoves(playerColor, gameContext) {
    const { board } = gameContext;
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color === playerColor) {
                // Obtener movimientos básicos usando getPossibleMovesForPiece
                const basicMoves = getPossibleMovesForPiece(r, c, board, playerColor, gameContext);
                
                // Verificar si algún movimiento básico es legal (no deja rey en jaque)
                for (const move of basicMoves) {
                    if (!wouldMoveLeaveKingInCheck(r, c, move.r, move.c, playerColor, gameContext)) {
                        return true; // Encontró al menos un movimiento legal
                    }
                }
            }
        }
    }
    return false;
}

/**
 * Checks if the current player is in checkmate.
 * @param {string} playerColor - The color of the player to check for checkmate.
 * @param {object} gameContext - The current game context.
 * @returns {boolean} True if the player is in checkmate, false otherwise.
 */
export function isCheckmate(playerColor, gameContext) {
    // Primero verificar si el rey está en jaque
    if (!isKingInCheck(gameContext.board, playerColor, gameContext)) {
        return false; // No está en jaque, no puede ser jaque mate
    }

    // Verificar si hay movimientos legales disponibles
    return !hasLegalMoves(playerColor, gameContext);
}

/**
 * Verifica si un jugador está en ahogado (stalemate)
 * @param {string} playerColor - Color del jugador ('w' o 'b')
 * @param {object} gameContext - Contexto del juego
 * @returns {boolean} True si está en ahogado
 */
export function isStalemate(playerColor, gameContext) {
    // Verificar que el rey NO esté en jaque
    if (isKingInCheck(gameContext.board, playerColor, gameContext)) {
        return false; // No puede ser ahogado si está en jaque
    }

    // Verificar si no hay movimientos legales disponibles
    return !hasLegalMoves(playerColor, gameContext);
}