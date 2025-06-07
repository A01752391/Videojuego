import { getSymbol, getPieceImageClass } from './utils.js';
import { createPowerUpInstance } from './powerUpManager.js';
import { getPowerUpInfo } from './powerUpManager.js';

/**
 * Creates the initial chess board setup.
 * @returns {Array<Array<object|null>>} The initial 8x8 board array.
 */
export function initialBoard() {
    const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    const newBoard = [];

    newBoard.push(backRank.map(type => ({ type, color: 'b', hasMoved: false })));
    newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'b', hasMoved: false })));
    for (let i = 0; i < 4; i++) newBoard.push(Array(8).fill(null));
    newBoard.push(Array(8).fill(null).map(() => ({ type: 'p', color: 'w', hasMoved: false })));
    newBoard.push(backRank.map(type => ({ type, color: 'w', hasMoved: false })));

    return newBoard;
}

/**
 * Renders the current state of the game board and power-up inventories in the UI.
 * @param {object} gameContext - The current game context.
 */
export function renderBoard(gameContext) {
    const { board, boardElement, selected, fencedTiles, powerUpsWhite, powerUpsBlack, currentColor } = gameContext;
    
    if (!boardElement) {
        console.error("Board element not found in gameContext for renderBoard.");
        return;
    }
    
    if (!board) {
        console.error("Board is null in gameContext for renderBoard.");
        return;
    }
    
    boardElement.innerHTML = '';

    // Check if king is in check - safely handle function existence
    let kingIsCurrentlyInCheck = false;
    if (gameContext.isKingInCheck && typeof gameContext.isKingInCheck === 'function') {
        kingIsCurrentlyInCheck = gameContext.isKingInCheck(board, currentColor, gameContext);
    }

    let possibleMovesList = [];
    if (selected && gameContext.getPossibleMoves && typeof gameContext.getPossibleMoves === 'function') {
        possibleMovesList = gameContext.getPossibleMoves(selected[0], selected[1]);
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add((r + c) % 2 === 0 ? "white-cell" : "black-cell");
            cell.dataset.row = r;
            cell.dataset.col = c;

            const piece = board[r][c];
            const fence = fencedTiles ? fencedTiles.find(tile => tile.row === r && tile.col === c) : null;

            if (fence) {
                cell.classList.add("fenced-tile");
                const fenceMarker = document.createElement("div");
                fenceMarker.classList.add("fence-marker");
                fenceMarker.title = `Valla (${fence.remainingDuration} turnos restantes)`;
                cell.appendChild(fenceMarker);
            }

            if (piece) {
                const imageClass = getPieceImageClass(piece);
                cell.classList.add(imageClass);
                cell.classList.add("piece");
                cell.classList.add(piece.color === 'w' ? 'player1-piece' : 'player2-piece');

                if (piece.type === 'k' && piece.color === currentColor && kingIsCurrentlyInCheck) {
                    cell.classList.add("king-in-check");
                }
            }

            if (selected && selected[0] === r && selected[1] === c) {
                cell.classList.add("selected-piece");
            }

            const isPossibleMove = possibleMovesList.find(move => move.row === r && move.col === c);
            if (isPossibleMove) {
                cell.classList.add(isPossibleMove.capture ? "possible-capture" : "possible-move");
            }

            // Swap selection highlighting
            if (gameContext.swapSelection && gameContext.swapSelection.pieces && gameContext.swapSelection.pieces.length > 0) {
                gameContext.swapSelection.pieces.forEach((piece, index) => {
                    if (piece.row === r && piece.col === c) {
                        if (index === 0) {
                            cell.style.background = 'linear-gradient(45deg, #4CAF50, #81C784)';
                            cell.style.border = '3px solid #2E7D32';
                            cell.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.7)';
                        } else {
                            cell.style.background = 'linear-gradient(45deg, #FF9800, #FFB74D)';
                            cell.style.border = '3px solid #F57C00';
                            cell.style.boxShadow = '0 0 10px rgba(255, 152, 0, 0.7)';
                        }
                    }
                });
            }

            boardElement.appendChild(cell);
        }
    }

    // Render power-up inventories
    renderPowerUpInventories(gameContext);
}

/**
 * Renders the power-up inventories for both players.
 * @param {object} gameContext - The current game context.
 */
function renderPowerUpInventories(gameContext) {
    renderPowerUpInventory(gameContext.powerUpsWhite || [], 'white');
    renderPowerUpInventory(gameContext.powerUpsBlack || [], 'black');
}

/**
 * Renders the power-up inventory for a given color.
 * @param {Array} powerUps - The list of power-ups for the player.
 * @param {string} color - The color of the player ('white' or 'black').
 */
function renderPowerUpInventory(powerUps, color) {
    const containerId = color === 'white' ? 'white-powerups' : 'black-powerups';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.warn(`Power-up container for ${color} not found.`);
        return;
    }

    // Get current power-ups
    const currentPowerUps = powerUps || [];
    const existingButtons = Array.from(container.querySelectorAll('.powerup-button'));

    // Find buttons that should disappear
    existingButtons.forEach(btn => {
        const powerUpType = btn.getAttribute('data-powerup-type');
        if (powerUpType && !currentPowerUps.includes(powerUpType)) {
            btn.classList.add('powerup-disappearing');
            setTimeout(() => {
                if (btn.parentNode) {
                    btn.parentNode.removeChild(btn);
                }
            }, 400);
        }
    });

    // Add new power-ups
    currentPowerUps.forEach(powerUpType => {
        const existingButton = container.querySelector(`[data-powerup-type="${powerUpType}"]`);
        if (!existingButton) {
            const powerUpButton = createPowerUpButton(powerUpType, color);
            if (powerUpButton) {
                powerUpButton.classList.add('powerup-appearing');
                container.appendChild(powerUpButton);
                setTimeout(() => {
                    powerUpButton.classList.remove('powerup-appearing');
                }, 400);
            }
        }
    });
}

/**
 * Creates a power-up button for the inventory.
 * @param {string} powerUpType - The type of power-up.
 * @param {string} color - The color of the player.
 * @returns {HTMLElement} The created button element.
 */
function createPowerUpButton(powerUpType, color) {
    const button = document.createElement('button');
    button.classList.add('powerup-button');
    button.setAttribute('data-powerup-type', powerUpType);
    
    const powerUpInfo = getPowerUpInfo(powerUpType);
    if (powerUpInfo) {
        button.textContent = powerUpInfo.name;
        button.title = powerUpInfo.description;
        
        button.addEventListener('click', () => {
            const powerUpInstance = createPowerUpInstance(powerUpType);
            if (powerUpInstance && powerUpInstance.activate) {
                powerUpInstance.activate();
            }
        });
    } else {
        button.textContent = powerUpType;
    }
    
    return button;
}
