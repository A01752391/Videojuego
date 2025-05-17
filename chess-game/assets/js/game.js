export function handleClick(r, c, gameContext) {
  let { board, currentColor, selected, messageElement } = gameContext;

  if (!selected) {
    // Select origin - this part is fine
    const piece = board[r][c];
    if (piece && piece.color === currentColor) {
      gameContext.selected = [r, c];
      gameContext.renderBoard();
    }
    else if (piece) {
      messageElement.textContent = `It's ${currentColor === 'w' ? 'White' : 'Black'}'s turn!`;
    }
  } else {
    // Make a move
    const [fr, fc] = selected;
    const kingInCheck = gameContext.isInCheck(currentColor);
    
    // First check if the move is legal according to piece movement rules
    if (gameContext.isLegalMove(fr, fc, r, c)) {
      
      // Temporarily make the move to see if it affects check status
      const sourcePiece = board[fr][fc]; // Save the source piece
      const targetPiece = board[r][c];   // Save the target piece

      board[r][c] = sourcePiece;         // Move the source piece to target
      board[fr][fc] = null;              // Clear the source square

      // Check king's status after this move
      const stillInCheck = gameContext.isInCheck(currentColor);

      // Restore board - CORRECTED
      board[fr][fc] = sourcePiece;       // Put the source piece back
      board[r][c] = targetPiece;         // Restore the target square
      
      // If king is in check and would remain in check, reject move
      if (kingInCheck && stillInCheck) {
        messageElement.textContent = `Your king is in check! You must address the check.`;
        gameContext.selected = null;
        gameContext.renderBoard();
        return;
      }
      
      // If the move would put/leave the king in check, reject move
      if (!kingInCheck && stillInCheck) {
        messageElement.textContent = `That move would put your king in check!`;
        gameContext.selected = null;
        gameContext.renderBoard();
        return;
      }
      
      // MOVE IS VALID - Proceed with the actual move
      const capturedPiece = board[r][c];
      if (capturedPiece) {
        gameContext.updateScore(currentColor === 'w' ? 'white' : 'black');
      }
      
      // Move the piece
      board[r][c] = board[fr][fc];
      board[fr][fc].hasMoved = true;
      board[fr][fc] = null;
      
      const movedPiece = board[r][c];
        if (movedPiece.type === 'p') {
        if ((movedPiece.color === 'w' && r === 0) || (movedPiece.color === 'b' && r === 7)) {
            // Promote to queen
            board[r][c] = { type: 'q', color: movedPiece.color, hasMoved: true };
            messageElement.textContent = `Pawn promoted to Queen!`;
        }
        }

      // Check for checkmate or check first
      const opponentColor = currentColor === 'w' ? 'b' : 'w';
      let messageShown = false;
      
      if (gameContext.isInCheck(opponentColor)) {
        if (gameContext.isCheckmate(opponentColor)) {
          messageElement.textContent = `Checkmate! ${currentColor === 'w' ? 'White' : 'Black'} wins!`;
          messageShown = true;
        } else {
          messageElement.textContent = `Check! ${opponentColor === 'w' ? 'White' : 'Black'} to move.`;
          messageShown = true;
        }
      }
      
      // Switch turn - only update message if no check/checkmate message shown
      gameContext.currentColor = opponentColor;
      if (!messageShown) {
        messageElement.textContent = `${opponentColor === 'w' ? 'White' : 'Black'}'s turn`;
      }
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
  const originalValue = gameContext.checkDetection;
  gameContext.checkDetection = true;
  const { board } = gameContext;
  const kingPos = findKing(color, gameContext);
  if (!kingPos) {
    gameContext.checkDetection = originalValue;
    return false;
  }
  
  const [kr, kc] = kingPos;
  const opponentColor = color === 'w' ? 'b' : 'w';

  let inCheck = false;
  
  // Check if any opponent piece can capture the king
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        if (gameContext.isLegalMove(r, c, kr, kc)) {
          inCheck = true;
          gameContext.checkDetection = originalValue;
          return true;
        }
      }
    }
    if (inCheck) break;
  }
  gameContext.checkDetection = originalValue;
  return inCheck;
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
  const inCheck = gameContext.isInCheck(playerColor);
  
  // Restore state
  board[fr][fc] = movingPiece;
  board[tr][tc] = savedPiece;
  
  return inCheck;
}

// Check for checkmate
export function isCheckmate(color, gameContext) {
  if (!gameContext.isInCheck(color)) return false;
  
  // Set flag to bypass turn restriction
  const savedFlag = gameContext.checkingCheckmate;
  gameContext.checkingCheckmate = true;
  
  // Look for any legal move that gets the king out of check
  let hasEscape = false;
  for (let r1 = 0; r1 < 8; r1++) {
    for (let c1 = 0; c1 < 8; c1++) {
      const piece = gameContext.board[r1][c1];
      if (piece && piece.color === color) {
        // Check all possible moves
        for (let r2 = 0; r2 < 8; r2++) {
          for (let c2 = 0; c2 < 8; c2++) {
            if (gameContext.isLegalMove(r1, c1, r2, c2) && 
                !gameContext.moveCausesCheck(r1, c1, r2, c2, color)) {
              hasEscape = true;
              break;
            }
          }
          if (hasEscape) break;
        }
      }
      if (hasEscape) break;
    }
    if (hasEscape) break;
  }
  
  // Restore original flag
  gameContext.checkingCheckmate = savedFlag;
  
  return !hasEscape;
}