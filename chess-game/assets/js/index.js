import { getSymbol, coordsToAlgebraic } from './utils.js';

const EMPTY = null;

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

        // NUEVO: sistema de power-ups
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
          }
        };

        renderBoard(gameContext);

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
          resetButton.addEventListener('click', () => {
            gameContext.board = initialBoard();
            gameContext.currentColor = 'w';
            gameContext.selected = null;
            gameContext.score1 = 0;
            gameContext.score2 = 0;
            gameContext.gameOver = false;
            gameContext.powerUpsWhite = [];
            gameContext.powerUpsBlack = [];
            gameContext.nextThresholdWhite = 5;
            gameContext.nextThresholdBlack = 5;
            document.getElementById('score1').textContent = '0';
            document.getElementById('score2').textContent = '0';
            messageElement.textContent = "Juego reiniciado. Turno de las Blancas.";
            renderBoard(gameContext);
          });
        }

        messageElement.textContent = `${currentColor === 'w' ? 'Blancas' : 'Negras'} comienzan`;
      });
    });
  });
});