// Import the utility functions and add exports to utils.js
import { getSymbol, coordsToAlgebraic } from './utils.js';

// Define constants that are shared across modules
const EMPTY = null;

// Initialize the DOM elements and board state
document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const messageElement = document.getElementById('message');
  
  // Import the board initialization functions
  import('./board.js').then(boardModule => {
    const { initialBoard, renderBoard } = boardModule;
    
    // Import the piece movement functions
    import('./pieces.js').then(piecesModule => {
      const { isLegalMove, getPossibleMoves, isPathClear } = piecesModule;
      
      // Import the game management functions
      import('./game.js').then(gameModule => {
        // Initialize the game state
        let board = initialBoard();
        let currentColor = 'w';
        let selected = null;
        let score1 = 0;
        let score2 = 0;
        
        // Create a game context object to share state between modules
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
          
          // Functions
          getSymbol,
          coordsToAlgebraic,
          isLegalMove: (fr, fc, tr, tc) => isLegalMove(fr, fc, tr, tc, gameContext),
          getPossibleMoves: (r, c) => getPossibleMoves(r, c, gameContext),
          isPathClear: (fr, fc, tr, tc) => isPathClear(fr, fc, tr, tc, gameContext),
          findKing: (color) => findKing(color, gameContext),
          isInCheck: (color) => isInCheck(color, gameContext),
          moveCausesCheck: (fr, fc, tr, tc, playerColor) => 
          moveCausesCheck(fr, fc, tr, tc, playerColor, gameContext),
          isCheckmate: (color) => isCheckmate(color, gameContext),
          updateScore: (player) => updateScore(player, gameContext),
          handleClick: (r, c) => handleClick(r, c, gameContext),
          renderBoard: () => renderBoard(gameContext),
          checkDetection: false,
          checkingCheckmate: false
        };
        
        // Extract game functions
        const { findKing, isInCheck, moveCausesCheck, isCheckmate, updateScore, handleClick } = gameModule;
        
        // Initialize the board UI
        renderBoard(gameContext);
        
        // Add click event listeners to the board
        boardElement.addEventListener('click', (event) => {
          const cell = event.target.closest('.cell');
          if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            handleClick(row, col, gameContext);
          }
        });
        
        // Add event listener for reset button if exists
        const resetButton = document.getElementById('reset');
        if (resetButton) {
          resetButton.addEventListener('click', () => {
            // Reset the game state
            gameContext.board = initialBoard();
            gameContext.currentColor = 'w';
            gameContext.selected = null;
            gameContext.score1 = 0;
            gameContext.score2 = 0;
            gameContext.gameOver = false;
            
            // Update UI
            document.getElementById('score1').textContent = '0';
            document.getElementById('score2').textContent = '0';
            messageElement.textContent = "Game reset. White's turn.";
            renderBoard(gameContext);
          });
        }
        
        // Initial message
        messageElement.textContent = `${currentColor === 'w' ? 'White' : 'Black'}'s turn`;
      });
    });
  });
});