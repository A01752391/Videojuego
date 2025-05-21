import { getSymbol, coordsToAlgebraic } from './utils.js';

const EMPTY = null;

// Control de rondas
let round = 1;
let winsWhite = 0;
let winsBlack = 0;

function updateRoundWinsDisplay() {
  const whiteRounds = document.getElementById('rounds1');
  const blackRounds = document.getElementById('rounds2');
  if (whiteRounds) whiteRounds.textContent = winsWhite;
  if (blackRounds) blackRounds.textContent = winsBlack;
}

function createNextRoundButton(gameContext) {
  const btn = document.createElement('button');
  btn.textContent = `Empezar Ronda ${round + 1}`;
  btn.className = 'reset-button';
  btn.addEventListener('click', () => {
    round++;
    btn.remove();
    resetGame(gameContext);
  });
  document.body.appendChild(btn);
}

function resetGame(gameContext, fullReset = false) {
  gameContext.board = gameContext.initialBoard();
  gameContext.currentColor = 'w';
  gameContext.selected = null;
  gameContext.gameOver = false;
  gameContext.powerUpsWhite = [];
  gameContext.powerUpsBlack = [];
  gameContext.nextThresholdWhite = 5;
  gameContext.nextThresholdBlack = 5;
  if (fullReset) {
    round = 1;
    winsWhite = 0;
    winsBlack = 0;
    gameContext.score1 = 0;
    gameContext.score2 = 0;
    document.getElementById('score1').textContent = '0';
    document.getElementById('score2').textContent = '0';
  }
  updateRoundWinsDisplay();
  gameContext.messageElement.textContent = `Ronda ${round}. Turno de las Blancas.`;
  gameContext.renderBoard();
}

document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const messageElement = document.getElementById('message');

  import('./board.js').then(boardModule => {
    const { initialBoard, renderBoard } = boardModule;

    import('./pieces.js').then(piecesModule => {
      const {
        isLegalMove,
        getPossibleMoves,
        isBasicLegalMove,
        isSquareAttacked,
        findKing,
        isKingInCheck,
        isCheckmate
      } = piecesModule;

      import('./game.js').then(gameModule => {
        const { updateScore, handleClick } = gameModule;

        let board = initialBoard();
        let currentColor = 'w';
        let selected = null;
        let score1 = 0;
        let score2 = 0;
        let powerUpsWhite = [];
        let powerUpsBlack = [];
        let nextThresholdWhite = 5;
        let nextThresholdBlack = 5;

        const gameContext = {
          board,
          currentColor,
          selected,
          score1,
          score2,
          boardElement,
          messageElement,
          EMPTY,
          gameOver: false,

          getSymbol,
          coordsToAlgebraic,
          isLegalMove: (fr, fc, tr, tc) => isLegalMove(fr, fc, tr, tc, gameContext),
          getPossibleMoves: (r, c) => getPossibleMoves(r, c, gameContext),
          isBasicLegalMove: (fr, fc, tr, tc) => isBasicLegalMove(fr, fc, tr, tc, gameContext),
          isSquareAttacked: (r, c, color) => isSquareAttacked(r, c, color, gameContext),
          findKing: (color) => findKing(gameContext.board, color),
          isKingInCheck: (color) => isKingInCheck(gameContext.board, color),
          isCheckmate: (color) => isCheckmate(color, gameContext),
          updateScore: (player) => updateScore(player, gameContext),
          handleClick: (r, c) => handleClick(r, c, gameContext),
          renderBoard: () => renderBoard(gameContext),
          checkingCheckmate: false,

          powerUpsWhite,
          powerUpsBlack,
          nextThresholdWhite,
          nextThresholdBlack,
          grantPowerUp: (color, type) => {
            const inventory = color === 'w' ? powerUpsWhite : powerUpsBlack;
            if (inventory.length < 5) inventory.push(type);
          },
          declareWinner: (winner) => {
            if (winner === 'w') winsWhite++;
            if (winner === 'b') winsBlack++;
            updateRoundWinsDisplay();
            const msg = `Jugador ${winner === 'w' ? 'Blancas' : 'Negras'} gana la Ronda ${round}!`;
            gameContext.messageElement.textContent = msg;
            gameContext.gameOver = true;

            if (winsWhite === 2 || winsBlack === 2 || round === 3) {
              gameContext.messageElement.textContent += `\n\nJugador ${winsWhite > winsBlack ? 'Blancas' : 'Negras'} gana la partida!`;
              const finalBtn = document.createElement('button');
              finalBtn.textContent = 'Reiniciar Partida';
              finalBtn.className = 'reset-button';
              finalBtn.addEventListener('click', () => {
                finalBtn.remove();
                resetGame(gameContext, true);
              });
              document.body.appendChild(finalBtn);
            } else {
              createNextRoundButton(gameContext);
            }
          },
          initialBoard
        };

        renderBoard(gameContext);
        updateRoundWinsDisplay();

        boardElement.addEventListener('click', (event) => {
          const cell = event.target.closest('.cell');
          if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            handleClick(row, col, gameContext);
          }
        });

        const resetButton = document.getElementById('reset');
        if (resetButton) {
          resetButton.addEventListener('click', () => resetGame(gameContext, true));
        }

        messageElement.textContent = `Ronda ${round}. ${currentColor === 'w' ? 'Blancas' : 'Negras'} comienzan`;
      });
    });
  });
});
