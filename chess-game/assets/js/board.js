export function initialBoard() {
  const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  const newBoard = [];

  newBoard.push(backRank.map(type => ({ type, color: 'b' })));
  newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })));
  for (let i = 0; i < 4; i++) newBoard.push(Array(8).fill(null));
  newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })));
  newBoard.push(backRank.map(type => ({ type, color: 'w' })));

  return newBoard;
}

export function renderBoard(gameContext) {
  const { board, boardElement, selected, getPossibleMoves, getSymbol } = gameContext;
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
        
        boardElement.appendChild(cell);
    }
  }
}