import { getSymbol, coordsToAlgebraic } from './utils.js';
import { midgameBoards } from './boards/midgameBoards.js'; // Added import

const EMPTY = null;

// Control de rondas
let round = 1;
let winsWhite = 0;
let winsBlack = 0;

// Helper function to get a random board and deep copy it
function getRandomBoard(boardArray) {
  if (!boardArray || boardArray.length === 0) {
    console.error("Board array is empty or undefined. Cannot select a random board.");
    return null; // Or handle error appropriately, e.g., return a default board
  }
  const randomIndex = Math.floor(Math.random() * boardArray.length);
  // Deep copy the board to prevent modifications to the original template in midgameBoards
  return JSON.parse(JSON.stringify(boardArray[randomIndex]));
}

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
  let newBoard;

  if (fullReset) {
    round = 1;
    winsWhite = 0;
    winsBlack = 0;
    newBoard = getRandomBoard(midgameBoards.neutral);
  } else {
    // This is for starting a new round (round has already been incremented by createNextRoundButton)
    if (round === 1) { 
      newBoard = getRandomBoard(midgameBoards.neutral);
    } else if (round === 2) {
      if (winsWhite === 1 && winsBlack === 0) { // White won round 1
        newBoard = getRandomBoard(midgameBoards.favorBlack);
        console.log("Loading board favorable to Black for Round 2.");
      } else if (winsBlack === 1 && winsWhite === 0) { // Black won round 1
        newBoard = getRandomBoard(midgameBoards.favorWhite);
        console.log("Loading board favorable to White for Round 2.");
      } else {
        console.warn("Round 2: Previous round outcome unclear or a draw. Defaulting to neutral board.");
        newBoard = getRandomBoard(midgameBoards.neutral);
      }
    } else if (round === 3) { // Game is 1-1
      newBoard = getRandomBoard(midgameBoards.neutral);
      console.log("Loading neutral board for Round 3.");
    } else {
      console.warn(`Unexpected round number ${round} for mid-game board loading. Defaulting to neutral.`);
      newBoard = getRandomBoard(midgameBoards.neutral);
    }
  }

  if (!newBoard) {
    console.error("Failed to load midgame board. Falling back to standard initial board.");
    newBoard = gameContext.standardInitialBoard(); 
  }
  gameContext.board = newBoard;
  
  // Reset scores for the new round
  gameContext.score1 = 0;
  gameContext.score2 = 0;
  if (document.getElementById('score1')) document.getElementById('score1').textContent = '0';
  if (document.getElementById('score2')) document.getElementById('score2').textContent = '0';

  gameContext.currentColor = 'w';
  gameContext.selected = null;
  gameContext.gameOver = false; // Round is starting
  gameContext.powerUpsWhite = [];
  gameContext.powerUpsBlack = [];
  gameContext.nextThresholdWhite = 5;
  gameContext.nextThresholdBlack = 5;
  
  updateRoundWinsDisplay();
  gameContext.messageElement.textContent = `Ronda ${round}. Turno de las Blancas.`;
  gameContext.renderBoard();
}

document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const messageElement = document.getElementById('message');

  import('./board.js').then(boardModule => {
    const { initialBoard: standardInitialBoardFunc, renderBoard: renderBoardFunc } = boardModule;

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
        const { updateScore: updateScoreFunc, handleClick: handleClickFunc } = gameModule;

        round = 1; // Initialize for the very first game load
        winsWhite = 0;
        winsBlack = 0;

        let board = getRandomBoard(midgameBoards.neutral);
        if (!board) {
            console.error("Failed to load initial midgame board for DOMContentLoaded. Falling back to standard board.");
            board = standardInitialBoardFunc();
        }
        
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
          updateScore: (player, capturedPiece) => updateScoreFunc(player, capturedPiece, gameContext),
          handleClick: (r, c) => handleClickFunc(r, c, gameContext),
          renderBoard: () => renderBoardFunc(gameContext),
          checkingCheckmate: false,
          standardInitialBoard: standardInitialBoardFunc, // Store for fallback

          powerUpsWhite,
          powerUpsBlack,
          nextThresholdWhite,
          nextThresholdBlack,
          grantPowerUp: (color, type) => {
            const inventory = color === 'w' ? gameContext.powerUpsWhite : gameContext.powerUpsBlack;
            if (inventory.length < 5) inventory.push(type);
          },
          declareWinner: (winnerColor) => {
            if (gameContext.gameOver) return; // Prevent multiple declarations

            if (winnerColor === 'w') winsWhite++;
            else if (winnerColor === 'b') winsBlack++;
            updateRoundWinsDisplay();

            const winnerName = winnerColor === 'w' ? 'Blancas' : 'Negras';
            gameContext.messageElement.textContent = `Jugador ${winnerName} gana la Ronda ${round}!`;
            gameContext.gameOver = true; // Current round is over

            // Remove existing next round button if any, before adding a new one or final one
            const existingNextRoundBtn = document.querySelector('button.reset-button:not(#reset)');
            if(existingNextRoundBtn) existingNextRoundBtn.remove();

            if (winsWhite === 2 || winsBlack === 2 || round === 3) {
              let gameWinnerName = "";
              if (winsWhite > winsBlack) gameWinnerName = "Blancas";
              else if (winsBlack > winsWhite) gameWinnerName = "Negras";
              else gameWinnerName = "Nadie (Empate en rondas)"; 

              gameContext.messageElement.textContent += `\n\nJugador ${gameWinnerName} gana la partida!`;
              
              const finalBtn = document.createElement('button');
              finalBtn.textContent = 'Reiniciar Partida Completa';
              finalBtn.className = 'reset-button';
              finalBtn.addEventListener('click', () => {
                finalBtn.remove();
                resetGame(gameContext, true);
              });
              document.body.appendChild(finalBtn);
            } else {
              createNextRoundButton(gameContext);
            }
          }
        };

        // Initial setup for Round 1
        updateRoundWinsDisplay();
        gameContext.messageElement.textContent = `Ronda ${round}. Turno de las Blancas.`;
        gameContext.renderBoard();

        boardElement.addEventListener('click', (event) => {
          const cell = event.target.closest('.cell');
          if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            gameContext.handleClick(row, col); // Pass only gameContext if handleClick is defined as (r,c,gameContext)
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
