// Función para verificar si el camino está libre de piezas
export function isPathClear(fr, fc, tr, tc, gameContext) {
  const { board } = gameContext;
  const dr = tr - fr;
  const dc = tc - fc;
  
  // Determinar la dirección del movimiento
  const stepRow = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const stepCol = dc === 0 ? 0 : dc > 0 ? 1 : -1;
  
  let r = fr + stepRow;
  let c = fc + stepCol;
  
  // Revisar cada casilla en el camino (excepto la casilla destino)
  while (r !== tr || c !== tc) {
    if (board[r][c] !== null) return false;
    r += stepRow;
    c += stepCol;
  }
  
  return true;
}

// Verifica si un movimiento es legal según las reglas de movimiento de cada pieza
// NO verifica si causa jaque al propio rey
export function isBasicLegalMove(fr, fc, tr, tc, gameContext) {
  const { board } = gameContext;
  const piece = board[fr][fc];
  
  // Si no hay pieza, el movimiento no es válido
  if (!piece) return false;
  
  const dr = tr - fr;
  const dc = tc - fc;
  const target = board[tr][tc];

  // No se puede mover a una casilla ocupada por una pieza del mismo color
  if (target && target.color === piece.color) return false;

  // Lógica específica para cada tipo de pieza
  switch (piece.type) {
    case 'p': { // Peón
      const dir = piece.color === 'w' ? -1 : 1;
      const startRow = piece.color === 'w' ? 6 : 1;

      // Movimiento vertical (1 casilla)
      if (dc === 0 && dr === dir && !target) return true;
      
      // Movimiento vertical (2 casillas desde posición inicial)
      if (dc === 0 && fr === startRow && dr === 2 * dir && !target && !board[fr + dir][fc]) return true;
      
      // Captura diagonal
      if (Math.abs(dc) === 1 && dr === dir && target) return true;
      
      return false;
    }
    
    case 'n': // Caballo
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
      // Movimiento normal del rey (1 casilla en cualquier dirección)
      if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;
      
      // Enroque (el rey se mueve 2 casillas horizontalmente)
      if (!piece.hasMoved && dr === 0 && Math.abs(dc) === 2) {
        // Determinar columna de la torre
        const rookCol = dc > 0 ? 7 : 0;
        const rook = board[fr][rookCol];
        
        // Verificar que la torre existe, es del mismo color y no se ha movido
        if (!rook || rook.type !== 'r' || rook.color !== piece.color || rook.hasMoved) {
          return false;
        }
        
        // Verificar que el camino está despejado
        return isPathClear(fr, fc, fr, rookCol, gameContext);
      }
      return false;
  }
  
  return false;
}

// Verifica si una posición está bajo ataque por el color especificado
export function isSquareAttacked(r, c, attackingColor, gameContext) {
  const { board } = gameContext;
  
  for (let fr = 0; fr < 8; fr++) {
    for (let fc = 0; fc < 8; fc++) {
      const piece = board[fr][fc];
      if (piece && piece.color === attackingColor) {
        // Para piezas que no sean peón, usar isBasicLegalMove
        if (piece.type !== 'p' && isBasicLegalMove(fr, fc, r, c, gameContext)) {
          return true;
        }
        
        // Caso especial para peones (solo capturan en diagonal)
        if (piece.type === 'p') {
          const dir = piece.color === 'w' ? -1 : 1;
          if (Math.abs(fc - c) === 1 && fr + dir === r) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

// Encuentra la posición del rey de un color específico
export function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null; // No debería ocurrir en un juego normal
}

// Verifica si un rey está en jaque
export function isKingInCheck(board, kingColor) {
  const kingPos = findKing(board, kingColor);
  if (!kingPos) return false;
  
  const [kr, kc] = kingPos;
  const opponentColor = kingColor === 'w' ? 'b' : 'w';
  
  // Crear un contexto temporal para la verificación
  const tempContext = {
    board: board,
    isPathClear: (fr, fc, tr, tc) => isPathClear(fr, fc, tr, tc, { board })
  };
  
  return isSquareAttacked(kr, kc, opponentColor, tempContext);
}

// Verifica si un movimiento es legal (incluye verificación de jaque)
export function isLegalMove(fr, fc, tr, tc, gameContext) {
  const { board, currentColor, checkingCheckmate } = gameContext;
  const piece = board[fr][fc];
  
  // Si no hay pieza, no es un movimiento válido
  if (!piece) return false;
  
  // En el juego normal, solo permitir mover piezas del color actual
  if (!checkingCheckmate && piece.color !== currentColor) return false;
  
  // Verificar si el movimiento es válido según las reglas básicas
  if (!isBasicLegalMove(fr, fc, tr, tc, gameContext)) return false;
  
  // Crear una copia temporal del tablero para simular el movimiento
  const tempBoard = board.map(row => [...row]);
  
  // Guardar piezas originales
  const movingPiece = tempBoard[fr][fc];
  const targetPiece = tempBoard[tr][tc];
  
  // Simular el movimiento
  tempBoard[tr][tc] = movingPiece;
  tempBoard[fr][fc] = null;
  
  // Verificar si el rey queda en jaque después del movimiento
  const inCheck = isKingInCheck(tempBoard, piece.color);
  
  // No permitir movimientos que dejen al rey en jaque
  return !inCheck;
}

// Calcular todos los movimientos posibles para una pieza
export function getPossibleMoves(r, c, gameContext) {
  const { board } = gameContext;
  const possibleMoves = [];
  const piece = board[r][c];
  
  if (!piece) return possibleMoves;
  
  // Verificar cada casilla del tablero
  for (let tr = 0; tr < 8; tr++) {
    for (let tc = 0; tc < 8; tc++) {
      if (isLegalMove(r, c, tr, tc, gameContext)) {
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

// Verificar si hay jaque mate
export function isCheckmate(color, gameContext) {
  const { board } = gameContext;
  
  // Primero verificar si el rey está en jaque
  if (!isKingInCheck(board, color)) return false;
  
  // Verificar si hay algún movimiento legal para cualquier pieza
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        // Comprobar cada posible destino
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            if (isLegalMove(r, c, tr, tc, { ...gameContext, checkingCheckmate: true })) {
              // Si hay algún movimiento legal, no es jaque mate
              return false;
            }
          }
        }
      }
    }
  }
  
  // Si no hay movimientos legales y el rey está en jaque, es jaque mate
  return true;
}