export function handleClick(r, c, gameContext) {
  const { board, currentColor, selected, messageElement } = gameContext;

  if (gameContext.gameOver) return;

  if (!selected) {
    const piece = board[r][c];
    if (piece && piece.color === currentColor) {
      const possibleMoves = gameContext.getPossibleMoves(r, c);
      if (possibleMoves.length === 0) {
        // Verificar si hay alguna pieza que sí pueda moverse
        const hasAnyMove = board.some((row, rowIndex) =>
          row.some((cell, colIndex) => {
            return cell && cell.color === currentColor &&
              gameContext.getPossibleMoves(rowIndex, colIndex).length > 0;
          })
        );

        if (!hasAnyMove) {
          if (gameContext.isKingInCheck(currentColor)) {
            messageElement.textContent = `¡Jaque mate! ${currentColor === 'w' ? 'Negras' : 'Blancas'} ganan!`;
          } else {
            messageElement.textContent = `¡Tablas por ahogo!`;
          }
          gameContext.gameOver = true;
        } else {
          messageElement.textContent = `Esta pieza no tiene movimientos legales.`;
        }
        return;
      }

      gameContext.selected = [r, c];
      gameContext.renderBoard();
    } else if (piece) {
      messageElement.textContent = `Es el turno de ${currentColor === 'w' ? 'Blancas' : 'Negras'}!`;
    }
  } else {
    const [fr, fc] = selected;
    if (gameContext.isLegalMove(fr, fc, r, c)) {
      const piece = board[fr][fc];
      const isRookCastling = piece.type === 'k' && Math.abs(c - fc) === 2;
      const capturedPiece = board[r][c];
      if (capturedPiece) {
        updateScoreWithPowerups(currentColor === 'w' ? 'white' : 'black', gameContext, capturedPiece);
      }
      board[r][c] = board[fr][fc];
      board[fr][fc].hasMoved = true;
      board[fr][fc] = null;

      if (isRookCastling) {
        const rookCol = c > fc ? 7 : 0;
        const newRookCol = c > fc ? c - 1 : c + 1;
        board[r][newRookCol] = board[r][rookCol];
        board[r][newRookCol].hasMoved = true;
        board[r][rookCol] = null;
      }

      const movedPiece = board[r][c];
      if (movedPiece.type === 'p') {
        if ((movedPiece.color === 'w' && r === 0) || (movedPiece.color === 'b' && r === 7)) {
          board[r][c] = { type: 'q', color: movedPiece.color, hasMoved: true };
          messageElement.textContent = `¡Peón promovido a Reina!`;
        }
      }

      const opponentColor = currentColor === 'w' ? 'b' : 'w';
      let messageShown = false;
      gameContext.currentColor = opponentColor;

      const kingInCheck = gameContext.isKingInCheck(opponentColor);
      const anyMoves = board.some((row, ri) =>
        row.some((cell, ci) =>
          cell && cell.color === opponentColor && gameContext.getPossibleMoves(ri, ci).length > 0
        )
      );

      if (kingInCheck && !anyMoves) {
        messageElement.textContent = `¡Jaque mate! ${currentColor === 'w' ? 'Blancas' : 'Negras'} ganan!`;
        messageShown = true;
        gameContext.gameOver = true;
      } else if (!kingInCheck && !anyMoves) {
        messageElement.textContent = `¡Tablas por ahogo!`;
        messageShown = true;
        gameContext.gameOver = true;
      } else if (kingInCheck) {
        messageElement.textContent = `¡Jaque! Turno de ${opponentColor === 'w' ? 'Blancas' : 'Negras'}.`;
        messageShown = true;
      }

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

    gameContext.selected = null;
    gameContext.renderBoard();
  }
}

function getRandomPowerUp() {
  const pool = ['ExtraMove', 'Shield', 'Swap', 'Teleport', 'Blast', 'Reducer'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function updateScoreWithPowerups(playerColor, gameContext, capturedPiece = null) {
  let points = 0;
  if (!capturedPiece) return;

  switch (capturedPiece.type) {
    case 'p': points = 2; break;
    case 'n':
    case 'b': points = 4; break;
    case 'r': points = 6; break;
    case 'q': points = 9; break;
    case 'k': points = 12; break;
  }

  if (playerColor === 'white') {
    gameContext.score1 += points;
    document.getElementById('score1').textContent = gameContext.score1;
    if (gameContext.score1 >= gameContext.nextThresholdWhite) {
      gameContext.grantPowerUp('w', getRandomPowerUp());
      gameContext.nextThresholdWhite += 5;
    }
  } else {
    gameContext.score2 += points;
    document.getElementById('score2').textContent = gameContext.score2;
    if (gameContext.score2 >= gameContext.nextThresholdBlack) {
      gameContext.grantPowerUp('b', getRandomPowerUp());
      gameContext.nextThresholdBlack += 5;
    }
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
