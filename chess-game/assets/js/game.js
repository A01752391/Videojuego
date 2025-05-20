export function handleClick(r, c, gameContext) {
  const { board, currentColor, selected, messageElement } = gameContext;

  if (gameContext.gameOver) return;

  // If check mate - no more moves
  if (gameContext.gameOver) {
    return;
  }

  if (!selected) {
    // Seleccionar origen
    const piece = board[r][c];
    if (piece && piece.color === currentColor) {
      // Verificar si hay movimientos posibles para esta pieza
      const possibleMoves = gameContext.getPossibleMoves(r, c);
      
      if (possibleMoves.length === 0) {
        messageElement.textContent = `Esta pieza no tiene movimientos legales.`;
        return;
      }
      
      gameContext.selected = [r, c];
      gameContext.renderBoard();
    }
    else if (piece) {
      messageElement.textContent = `Es el turno de ${currentColor === 'w' ? 'Blancas' : 'Negras'}!`;
    }
  } else {
    // Realizar un movimiento
    const [fr, fc] = selected;
    
    // Verificar si el movimiento es legal
    if (gameContext.isLegalMove(fr, fc, r, c)) {
      const piece = board[fr][fc];
      
      // Verificar si es un enroque
      const isRookCastling = piece.type === 'k' && Math.abs(c - fc) === 2;
      
      // Guardar referencia a la pieza capturada (si hay)
      const capturedPiece = board[r][c];
      if (capturedPiece) {
        gameContext.updateScore(currentColor === 'w' ? 'white' : 'black');
      }
      
      // Mover la pieza
      board[r][c] = board[fr][fc];
      board[fr][fc].hasMoved = true;
      board[fr][fc] = null;
      
      // Si es enroque, mover también la torre
      if (isRookCastling) {
        const rookCol = c > fc ? 7 : 0;
        const newRookCol = c > fc ? c - 1 : c + 1;
        
        // Mover la torre
        board[r][newRookCol] = board[r][rookCol];
        board[r][newRookCol].hasMoved = true;
        board[r][rookCol] = null;
      }
      
      // Verificar promoción de peón
      const movedPiece = board[r][c];
      if (movedPiece.type === 'p') {
        if ((movedPiece.color === 'w' && r === 0) || (movedPiece.color === 'b' && r === 7)) {
          // Promover a reina
          board[r][c] = { type: 'q', color: movedPiece.color, hasMoved: true };
          messageElement.textContent = `¡Peón promovido a Reina!`;
        }
      }
      
      // Comprobar jaque o jaque mate primero
      const opponentColor = currentColor === 'w' ? 'b' : 'w';
      let messageShown = false;
      
      // Cambiar turno
      gameContext.currentColor = opponentColor;
      
      // Verificar si el oponente está en jaque
      if (gameContext.isKingInCheck(board, opponentColor)) {
        if (gameContext.isCheckmate(opponentColor, gameContext)) {
          messageElement.textContent = `¡Jaque mate! ${currentColor === 'w' ? 'Blancas' : 'Negras'} ganan!`;
          messageShown = true;
          gameContext.gameOver = true;
        } else {
          messageElement.textContent = `¡Jaque! Turno de ${opponentColor === 'w' ? 'Blancas' : 'Negras'}.`;
          messageShown = true;
        }
      }
      
      // Actualizar mensaje si no se mostró otro
      if (!messageShown) {
        if (isRookCastling) {
          messageElement.textContent = `¡Enroque realizado! Turno de ${opponentColor === 'w' ? 'Blancas' : 'Negras'}.`;
        } else {
          messageElement.textContent = `Turno de ${opponentColor === 'w' ? 'Blancas' : 'Negras'}.`;
        }
      }
    } else {
      messageElement.textContent = `Movimiento no válido. Intenta otro movimiento.`;
    }
    
    // Resetear selección
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