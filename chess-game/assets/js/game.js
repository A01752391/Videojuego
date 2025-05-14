export function handleClick(r, c, gameContext) {
  let { board, currentColor, selected, messageElement } = gameContext;

  if (!selected) {
    // Select origin
    const piece = board[r][c];
    if (piece && piece.color === currentColor) {
      gameContext.selected = [r, c];
      gameContext.renderBoard();
    }
  } else {
    // Make a move
    const [fr, fc] = selected;
    
    if (gameContext.isLegalMove(fr, fc, r, c) && 
        !gameContext.moveCausesCheck(fr, fc, r, c, currentColor)) {
      // Capture or move
      const capturedPiece = board[r][c];
      if (capturedPiece) {
        gameContext.updateScore(currentColor === 'w' ? 'white' : 'black');
      }
      
      // Move the piece
      board[r][c] = board[fr][fc];
      board[fr][fc] = null;
      
      // Check for checkmate
      const opponentColor = currentColor === 'w' ? 'b' : 'w';
      if (gameContext.isInCheck(opponentColor)) {
        if (gameContext.isCheckmate(opponentColor)) {
          messageElement.textContent = `Checkmate! ${currentColor === 'w' ? 'White' : 'Black'} wins!`;
        } else {
          messageElement.textContent = `Check! ${opponentColor === 'w' ? 'White' : 'Black'} to move.`;
        }
      }
      
      // Switch turn
      gameContext.currentColor = opponentColor;
      messageElement.textContent = `${opponentColor === 'w' ? 'White' : 'Black'}'s turn`;
    }
    
    // Reset selection
    gameContext.selected = null;
    gameContext.renderBoard();
  }
}

export function updateScore(player, gameContext) {
  if (player === 'white') {
    gameContext.score1++;
    document.getElementById('score1').textContent = gameContext.score1;
  } else {
    gameContext.score2++;
    document.getElementById('score2').textContent = gameContext.score2;
  }
}

// Find the king's position
export function findKing(color, gameContext) {
  const { board } = gameContext;
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

// Check if a king is in check
export function isInCheck(color, gameContext) {
  const { board } = gameContext;
  const kingPos = findKing(color, gameContext);
  if (!kingPos) return false;
  
  const [kr, kc] = kingPos;
  const opponentColor = color === 'w' ? 'b' : 'w';
  
  // Check if any opponent piece can capture the king
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        if (gameContext.isLegalMove(r, c, kr, kc)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Check if a move causes check
export function moveCausesCheck(fr, fc, tr, tc, playerColor, gameContext) {
  const { board } = gameContext;
  // Save current state
  const savedPiece = board[tr][tc];
  const movingPiece = board[fr][fc];
  
  // Make temporary move
  board[tr][tc] = movingPiece;
  board[fr][fc] = null;
  
  // Check if the king is in check
  const inCheck = isInCheck(playerColor, gameContext);
  
  // Restore state
  board[fr][fc] = movingPiece;
  board[tr][tc] = savedPiece;
  
  return inCheck;
}

// Check for checkmate
export function isCheckmate(color, gameContext) {
  if (!isInCheck(color, gameContext)) return false;
  
  // Look for any legal move that gets the king out of check
  for (let r1 = 0; r1 < 8; r1++) {
    for (let c1 = 0; c1 < 8; c1++) {
      const piece = gameContext.board[r1][c1];
      if (piece && piece.color === color) {
        // Check all possible moves
        for (let r2 = 0; r2 < 8; r2++) {
          for (let c2 = 0; c2 < 8; c2++) {
            if (gameContext.isLegalMove(r1, c1, r2, c2) && 
                !gameContext.moveCausesCheck(r1, c1, r2, c2, color)) {
              return false;
            }
          }
        }
      }
    }
  }
  
  return true;
}