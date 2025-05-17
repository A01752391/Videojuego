// Calcular todos los movimientos posibles para una pieza
export function getPossibleMoves(r, c, gameContext) {
  const { board, moveCausesCheck } = gameContext;
  const possibleMoves = [];
  const piece = board[r][c];
  
  if (!piece) return possibleMoves;
  
  // Verificar cada casilla del tablero
  for (let tr = 0; tr < 8; tr++) {
    for (let tc = 0; tc < 8; tc++) {
      if (isLegalMove(r, c, tr, tc, gameContext) && 
          !gameContext.moveCausesCheck(r, c, tr, tc, piece.color)) {
        possibleMoves.push({
          row: tr,
          col: tc,
          capture: board[tr][tc] !== null
        });
      }
    }
  }
  
  return possibleMoves;
}

// Función para verificar si el camino está libre de piezas
export function isPathClear(fr, fc, tr, tc, gameContext) {
  const { board} = gameContext;
  const dr = tr - fr;
  const dc = tc - fc;
  
  // Determinar la dirección del movimiento
  const stepRow = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const stepCol = dc === 0 ? 0 : dc > 0 ? 1 : -1;
  
  let r = fr + stepRow;
  let c = fc + stepCol;
  
  // Revisar cada casilla en el camino
  while (r !== tr || c !== tc) {
    if (board[r][c] !== null) return false;
    r += stepRow;
    c += stepCol;
  }
  
  return true;
}

export function isLegalMove(fr, fc, tr, tc, gameContext) {
  const { board, currentColor} = gameContext;
  const piece = board[fr][fc];
  // Don't check for current color during checkmate detection
  if (!piece) return false;
  
  // In normal gameplay, enforce current color
  if (!gameContext.checkingCheckmate && piece.color !== currentColor) return false;

  const dr = tr - fr;
  const dc = tc - fc;
  const target = board[tr][tc];

  // No se puede capturar piezas del mismo color
  if (target && target.color === piece.color) return false;

  if (target && target.type === 'k') {
  // Allow theoretical king captures only during check detection
  if (!gameContext.checkDetection) {
    return false;
  }
}

  switch (piece.type) {
    case 'p': {
      const dir = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;

      if (dc === 0 && !target) {
        if (dr === dir) return true;
        if (fr === startRow && dr === 2 * dir && !board[fr + dir][fc]) return true;
      }
      if (Math.abs(dc) === 1 && dr === dir && target && target.color !== piece.color) {
        return true;
      }
      return false;
    }
    case 'n':
      return (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
             (Math.abs(dr) === 1 && Math.abs(dc) === 2);
    case 'b': // Alfil - movimiento diagonal
      if (Math.abs(dr) !== Math.abs(dc)) return false;
      return isPathClear(fr, fc, tr, tc, gameContext);
    case 'r': // Torre - movimiento horizontal o vertical
      if (dr !== 0 && dc !== 0) return false;
      return isPathClear(fr, fc, tr, tc, gameContext);
    case 'q': // Reina - combinación de alfil y torre
      if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return false;
      return isPathClear(fr, fc, tr, tc, gameContext);
    case 'k': // Rey - un cuadro en cualquier dirección
      // Regular king movement
  if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;
  
  // Castling logic (king moves 2 squares horizontally)
  if (!piece.hasMoved && dr === 0 && Math.abs(dc) === 2) {
    // Implement castling check here
  }
  return false;
  }
}