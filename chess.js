const EMPTY = null;
const boardElement = document.getElementById("board");
const message = document.getElementById("message");
let board = initialBoard();
let currentColor = 'w';
let selected = null;

let score1 = 0;
let score2 = 0;

// Inicializar el tablero
function initialBoard() {
  const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  const newBoard = [];

  // Elementos del tablero
  newBoard.push(backRank.map((type, i) => {
    return { type, color: 'b', hasMoved: false };}));
  newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })));
  for (let i = 0; i < 4; i++) newBoard.push(Array(8).fill(null));
  newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })));
  newBoard.push(backRank.map((type, i) => {
    return { type, color: 'w', hasMoved: false };}));

  return newBoard;
}

function renderBoard() {
  boardElement.innerHTML = '';

  // Calcular movimientos posibles para la pieza seleccionada
  let possibleMoves = [];
  if (selected) {
    possibleMoves = getPossibleMoves(selected[0], selected[1]);
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add((r + c) % 2 === 0 ? "white" : "black");
        cell.dataset.row = r;
        cell.dataset.col = c;
        
        const piece = board[r][c];

        if (piece) {
            const symbol = getSymbol(piece);
            cell.textContent = symbol;
            cell.classList.add("piece");
            cell.classList.add(piece.color === 'w' ? 'player1-piece' : 'player2-piece');
        }

        // Resaltar pieza seleccionada
        if (selected && selected[0] === r && selected[1] === c) {
            cell.classList.add("selected-piece");
        }

        // Resaltar movimientos posibles
        const possibleMove = possibleMoves.find(move => move.row === r && move.col === c);
        if (possibleMove) {
            if (possibleMove.isCapture) {
                cell.classList.add("possible-capture");
            } else {
                cell.classList.add("possible-move");
            }
        }
        
        cell.addEventListener("click", () => handleClick(r, c));
        boardElement.appendChild(cell);
    }
  }
}

// Calcular todos los movimientos posibles para una pieza
function getPossibleMoves(r, c) {
  const possibleMoves = [];
  const piece = board[r][c];
  
  if (!piece) return possibleMoves;
  
  // Verificar cada casilla del tablero
  for (let tr = 0; tr < 8; tr++) {
    for (let tc = 0; tc < 8; tc++) {
      // Guardar estado actual del color para no afectar la verificación
      const savedColor = currentColor;
      currentColor = piece.color;
      
      // Verificar si el movimiento es legal y no causa jaque propio
      if (isLegalMove(r, c, tr, tc) && !moveCausesCheck(r, c, tr, tc, piece.color)) {
        possibleMoves.push({ row: tr, col: tc, isCapture: board[tr][tc] !== EMPTY });
      }
      
      // Restaurar color
      currentColor = savedColor;
    }
  }
  
  return possibleMoves;
}

function getSymbol(piece) {
  const symbols = {
    p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
  };
  return piece.color === 'w'
    ? symbols[piece.type].toUpperCase()
    : symbols[piece.type];
}

function coordsToAlgebraic(r, c) {
  return String.fromCharCode(97 + c) + (8 - r);
}

function isLegalMove(fr, fc, tr, tc) {
  const piece = board[fr][fc];
  if (!piece || piece.color !== currentColor) return false;

  const dr = tr - fr;
  const dc = tc - fc;
  const target = board[tr][tc];

  // No se puede capturar piezas del mismo color
  if (target && target.color === piece.color) return false;

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
      return isPathClear(fr, fc, tr, tc);
    case 'r': // Torre - movimiento horizontal o vertical
      if (dr !== 0 && dc !== 0) return false;
      return isPathClear(fr, fc, tr, tc);
    case 'q': // Reina - combinación de alfil y torre
      if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) return false;
      return isPathClear(fr, fc, tr, tc);
    case 'k': // Rey - un cuadro en cualquier dirección
      // Movimiento normal
      if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;

      // Enroque
      if (!piece.hasMoved && dr === 0 && Math.abs(dc) === 2) {
        const rookCol = dc === 2 ? 7 : 0;
        const rook = board[fr][rookCol];
        if (
          rook && rook.type === 'r' && rook.color === piece.color && !rook.hasMoved &&
          isPathClear(fr, fc, fr, rookCol)
        ) {
          // Verificamos que no pase por jaque
          const step = dc > 0 ? 1 : -1;
          for (let i = 0; i <= 2; i++) {
            const col = fc + i * step;
            if (moveCausesCheck(fr, fc, fr, col, piece.color)) return false;
          }
          return true;
        }
      }
      return false;
    default:
      return false;
  }
}

// Función para verificar si el camino está libre de piezas
function isPathClear(fr, fc, tr, tc) {
  const dr = tr - fr;
  const dc = tc - fc;
  
  // Determinar la dirección del movimiento
  const stepRow = dr === 0 ? 0 : dr > 0 ? 1 : -1;
  const stepCol = dc === 0 ? 0 : dc > 0 ? 1 : -1;
  
  let r = fr + stepRow;
  let c = fc + stepCol;
  
  // Revisar cada casilla en el camino
  while (r !== tr || c !== tc) {
    if (board[r][c] !== EMPTY) return false;
    r += stepRow;
    c += stepCol;
  }
  
  return true;
}

function updateScore(player) {
  if (player === 'white') {
    score1 += 1;
    document.getElementById('score1').textContent = score1;
  } else {
    score2 += 1;
    document.getElementById('score2').textContent = score2;
  }
}

function handleClick(r, c) {
  if (!selected) {
    // Seleccionar origen
    const piece = board[r][c];
    if (piece && piece.color === currentColor) {
      selected = [r, c];
      message.textContent = `Selected ${coordsToAlgebraic(r, c)}`;
      renderBoard();
    }
  } else {
    // Mover a destino
    const [fr, fc] = selected;
    if (fr === r && fc === c) {
      selected = null;
      renderBoard();
      board[r][c].hasMoved = true;
      return;
    }

    if (isLegalMove(fr, fc, r, c)) {
          // Verificar si el movimiento pone al rey propio en jaque
      if (moveCausesCheck(fr, fc, r, c, currentColor)) {
        message.textContent = "¡Movimiento inválido! Tu rey quedaría en jaque";
        selected = null;
        renderBoard();
        return;
      }
    const captured = board[r][c];
    board[r][c] = board[fr][fc];

    // Cambio de peón a reina
    if (board[r][c].type === 'p' && (r === 0 || r === 7)) {
      board[r][c].type = 'q';
      message.textContent += ' (Promocionado a Reina)';
    }


    board[fr][fc] = EMPTY;

    // Enroque: mover torre también
    if (board[r][c].type === 'k' && Math.abs(fc - c) === 2) {
      const rookCol = c === 6 ? 7 : 0;
      const newRookCol = c === 6 ? 5 : 3;
      board[r][newRookCol] = board[r][rookCol];
      board[r][rookCol] = EMPTY;
      board[r][newRookCol].hasMoved = true;
    }


    if (captured && captured.color !== currentColor) {
        updateScore(currentColor === 'w' ? 'white' : 'black');
    }

    currentColor = currentColor === 'w' ? 'b' : 'w';
    if (isInCheck(currentColor)) {
        if (isCheckmate(currentColor)) {
          message.textContent = `¡JAQUE MATE! ${currentColor === 'w' ? 'Negras' : 'Blancas'} ganan`;
          // Desactivar eventos de clic en el tablero
          document.querySelectorAll('.cell').forEach(cell => {
            cell.removeEventListener('click', handleClick);
          });
        } else {
          message.textContent = `¡JAQUE al rey ${currentColor === 'w' ? 'blanco' : 'negro'}!`;
        }
      } else {
        message.textContent = `Moved to ${coordsToAlgebraic(r, c)}`;
      }
    }

    selected = null;
    renderBoard();
  }
}

// Función para encontrar la posición del rey
function findKing(color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

// Verificar si un rey está en jaque
function isInCheck(color) {
  const kingPos = findKing(color);
  if (!kingPos) return false;
  
  const [kr, kc] = kingPos;
  const opponentColor = color === 'w' ? 'b' : 'w';
  
  // Revisar si alguna pieza contraria puede capturar al rey
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        // Guardamos el color actual para no afectar isLegalMove
        const savedColor = currentColor;
        currentColor = opponentColor;
        const canCapture = isLegalMove(r, c, kr, kc);
        currentColor = savedColor;
        
        if (canCapture) return true;
      }
    }
  }
  
  return false;
}

// Verificar si un movimiento pone al jugador en jaque
function moveCausesCheck(fr, fc, tr, tc, playerColor) {
  // Guardar estado actual
  const savedPiece = board[tr][tc];
  const movingPiece = board[fr][fc];
  
  // Hacer movimiento temporal
  board[tr][tc] = movingPiece;
  board[fr][fc] = EMPTY;
  
  // Verificar si el rey queda en jaque
  const inCheck = isInCheck(playerColor);
  
  // Restaurar estado
  board[fr][fc] = movingPiece;
  board[tr][tc] = savedPiece;
  
  return inCheck;
}

// Verificar si hay jaque mate
function isCheckmate(color) {
  if (!isInCheck(color)) return false;
  
  // Buscar cualquier movimiento legal que saque al rey del jaque
  for (let r1 = 0; r1 < 8; r1++) {
    for (let c1 = 0; c1 < 8; c1++) {
      const piece = board[r1][c1];
      if (piece && piece.color === color) {
        for (let r2 = 0; r2 < 8; r2++) {
          for (let c2 = 0; c2 < 8; c2++) {
            // Guardar color actual
            const savedColor = currentColor;
            currentColor = color;
            
            // Verificar si es un movimiento legal
            if (isLegalMove(r1, c1, r2, c2)) {
              // Verificar si este movimiento evita el jaque
              if (!moveCausesCheck(r1, c1, r2, c2, color)) {
                currentColor = savedColor;
                return false; // Encontramos una escapatoria
              }
            }
            currentColor = savedColor;
          }
        }
      }
    }
  }
  
  return true; // No hay escapatoria, es jaque mate
}

// Inicializar
renderBoard();