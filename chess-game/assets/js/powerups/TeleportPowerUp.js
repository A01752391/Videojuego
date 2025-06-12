import { PowerUpBase } from './PowerUpBase.js';

export class TeleportPowerUp extends PowerUpBase {
  constructor() {
    super(
      'Teleport',
      'Teletransporta instantáneamente una de tus piezas a cualquier casilla libre del tablero',
      true, // requiresTarget
      0, // duration (instant effect)
      '🌟' // uiIcon
    );
    this.sourceSelection = null;
    this.targetSelection = null;
    this.step = 'selectSource'; // 'selectSource' or 'selectTarget'
  }

  /**
   * Checks if the power-up can be activated.
   */
  canActivate(gameContext, playerColor) {
    const { board } = gameContext;
    
    // Check if player has any pieces that can be teleported
    let hasMovablePieces = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === playerColor) {
          hasMovablePieces = true;
          break;
        }
      }
      if (hasMovablePieces) break;
    }

    if (!hasMovablePieces) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "No tienes piezas para teletransportar.";
      }
      return false;
    }

    // Check if there are free spaces
    let hasFreeSpaces = false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (!board[r][c]) {
          hasFreeSpaces = true;
          break;
        }
      }
      if (hasFreeSpaces) break;
    }

    if (!hasFreeSpaces) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "No hay espacios libres para teletransporte.";
      }
      return false;
    }

    return true;
  }

  /**
   * Checks if we can activate on a specific target during selection
   */
  canActivateOnTarget(gameContext, playerColor, targetData) {
    if (!targetData) return false;
    
    const { row, col } = targetData;
    const { board } = gameContext;

    if (this.step === 'selectSource') {
      // First step: selecting the piece to teleport
      const piece = board[row][col];
      return piece && piece.color === playerColor;
    } else if (this.step === 'selectTarget') {
      // Second step: selecting destination
      const targetCell = board[row][col];
      // Must be empty and not fenced
      const isFenced = gameContext.fencedTiles && gameContext.fencedTiles.some(
        fence => fence.row === row && fence.col === col
      );
      return !targetCell && !isFenced;
    }

    return false;
  }

  /**
   * Activates the teleport power-up
   */
  activate(gameContext, playerColor, targetData = null) {
    if (!this.canActivate(gameContext, playerColor)) {
      return false;
    }

    if (this.step === 'selectSource') {
      // First activation: start teleport selection
      this.sourceSelection = null;
      this.targetSelection = null;
      this.step = 'selectSource';
      
      gameContext.awaitingPowerUpTarget = {
        powerUpType: 'Teleport',
        powerUpInstance: this,
        step: 'selectSource'
      };

      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Selecciona la pieza que deseas teletransportar.";
      }

      // Add visual indicators for selectable pieces
      this.highlightSelectablePieces(gameContext, playerColor);
      
      return true;
    }

    return false;
  }

  /**
   * Handle target selection for teleport
   */
  handleTargetSelection(gameContext, playerColor, targetData) {
    const { row, col } = targetData;
    
    if (this.step === 'selectSource') {
      // Store source selection and move to target selection
      this.sourceSelection = { row, col };
      this.step = 'selectTarget';
      
      gameContext.awaitingPowerUpTarget.step = 'selectTarget';
      
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Ahora selecciona el destino del teletransporte.";
      }

      // Update visual indicators
      this.clearPieceHighlights(gameContext);
      this.highlightSourcePiece(gameContext, row, col);
      this.highlightValidTargets(gameContext);
      
      return true;
    } else if (this.step === 'selectTarget') {
      // Complete the teleport
      this.targetSelection = { row, col };
      return this.executeTeleport(gameContext, playerColor);
    }

    return false;
  }

  /**
   * Execute the actual teleport
   */
  executeTeleport(gameContext, playerColor) {
    if (!this.sourceSelection || !this.targetSelection) {
      return false;
    }

    const { board } = gameContext;
    const sourceRow = this.sourceSelection.row;
    const sourceCol = this.sourceSelection.col;
    const targetRow = this.targetSelection.row;
    const targetCol = this.targetSelection.col;

    // Verify the move is still valid
    const piece = board[sourceRow][sourceCol];
    if (!piece || piece.color !== playerColor) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "La pieza seleccionada ya no es válida.";
      }
      this.cancelTeleport(gameContext);
      return false;
    }

    if (board[targetRow][targetCol]) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "El destino ya no está libre.";
      }
      this.cancelTeleport(gameContext);
      return false;
    }

    // Execute the teleport
    board[targetRow][targetCol] = piece;
    board[sourceRow][sourceCol] = null;

    // Trigger teleport animation
    this.triggerTeleportAnimation(gameContext, sourceRow, sourceCol, targetRow, targetCol);

    // Clear visual indicators
    this.clearAllHighlights(gameContext);

    // Update message
    const pieceNames = {
      'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
      'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
    };
    const pieceName = pieceNames[piece.type];
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';

    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = 
        `¡${playerColorName} teletransportaron su ${pieceName} de ${String.fromCharCode(97 + sourceCol)}${8 - sourceRow} a ${String.fromCharCode(97 + targetCol)}${8 - targetRow}!`;
    }

    // Track usage statistics
    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: 0, // Instant effect
      sourcePos: `${String.fromCharCode(97 + sourceCol)}${8 - sourceRow}`,
      targetPos: `${String.fromCharCode(97 + targetCol)}${8 - targetRow}`,
      pieceType: piece.type
    };

    this.onActivationComplete(gameContext, playerColor, activeInstanceData);

    // Reset teleport state
    this.resetTeleportState(gameContext);

    return true;
  }

  /**
   * Cancel teleport selection
   */
  cancelTeleport(gameContext) {
    this.clearAllHighlights(gameContext);
    this.resetTeleportState(gameContext);
    
    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = "Teletransporte cancelado.";
    }
  }

  /**
   * Reset teleport state
   */
  resetTeleportState(gameContext) {
    this.sourceSelection = null;
    this.targetSelection = null;
    this.step = 'selectSource';
    gameContext.awaitingPowerUpTarget = null;
  }

  /**
   * Highlight pieces that can be teleported
   */
  highlightSelectablePieces(gameContext, playerColor) {
    const { board, boardElement } = gameContext;
    if (!boardElement) return;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === playerColor) {
          const cell = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
          if (cell) {
            cell.classList.add('teleport-source-selectable');
          }
        }
      }
    }
  }

  /**
   * Highlight the selected source piece
   */
  highlightSourcePiece(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.classList.add('teleport-source-selected');
    }
  }

  /**
   * Highlight valid teleport targets
   */
  highlightValidTargets(gameContext) {
    const { board, boardElement, fencedTiles } = gameContext;
    if (!boardElement) return;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (!board[r][c]) {
          // Check if cell is fenced
          const isFenced = fencedTiles && fencedTiles.some(
            fence => fence.row === r && fence.col === c
          );
          
          if (!isFenced) {
            const cell = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            if (cell) {
              cell.classList.add('teleport-target-selectable');
            }
          }
        }
      }
    }
  }

  /**
   * Clear piece selection highlights
   */
  clearPieceHighlights(gameContext) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const selectableCells = boardElement.querySelectorAll('.teleport-source-selectable');
    selectableCells.forEach(cell => {
      cell.classList.remove('teleport-source-selectable');
    });
  }

  /**
   * Clear all teleport highlights
   */
  clearAllHighlights(gameContext) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const highlightClasses = [
      'teleport-source-selectable',
      'teleport-source-selected', 
      'teleport-target-selectable'
    ];

    highlightClasses.forEach(className => {
      const cells = boardElement.querySelectorAll(`.${className}`);
      cells.forEach(cell => {
        cell.classList.remove(className);
      });
    });
  }

  /**
   * Trigger teleport animation
   */
  triggerTeleportAnimation(gameContext, sourceRow, sourceCol, targetRow, targetCol) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Add glow effect to source
    const sourceCell = boardElement.querySelector(`[data-row="${sourceRow}"][data-col="${sourceCol}"]`);
    if (sourceCell) {
      sourceCell.classList.add('teleport-source-glow');
      setTimeout(() => {
        sourceCell.classList.remove('teleport-source-glow');
      }, 1000);
    }

    // Add arrival effect to target
    const targetCell = boardElement.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
    if (targetCell) {
      targetCell.classList.add('teleport-target-glow');
      setTimeout(() => {
        targetCell.classList.remove('teleport-target-glow');
      }, 1000);
    }

    // Create teleport particles effect
    this.createTeleportParticles(gameContext, sourceRow, sourceCol, targetRow, targetCol);

    // Trigger radial illumination effect
    this.triggerRadialIllumination(gameContext, targetRow, targetCol, 'teleport');
  }

  /**
   * Create particle effects for teleport
   */
  createTeleportParticles(gameContext, sourceRow, sourceCol, targetRow, targetCol) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Create particles at source
    this.createParticlesAt(boardElement, sourceRow, sourceCol, 'source');
    
    // Create particles at target with delay
    setTimeout(() => {
      this.createParticlesAt(boardElement, targetRow, targetCol, 'target');
    }, 200);
  }

  /**
   * Create particles at specific position
   */
  createParticlesAt(boardElement, row, col, type) {
    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = `teleport-particle ${type}`;
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: ${type === 'source' ? '#ff6b6b' : '#4ecdc4'};
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 1000;
        animation: teleportParticle${type === 'source' ? 'Out' : 'In'} 0.8s ease-out forwards;
        animation-delay: ${i * 0.1}s;
      `;

      cell.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000 + (i * 100));
    }

    // Add CSS animations if they don't exist
    if (!document.querySelector('#teleport-animation-style')) {
      const style = document.createElement('style');
      style.id = 'teleport-animation-style';
      style.textContent = `
        @keyframes teleportParticleOut {
          0% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) translateY(-20px);
          }
        }
        @keyframes teleportParticleIn {
          0% { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0) translateY(20px);
          }
          100% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .teleport-source-glow {
          box-shadow: 0 0 20px #ff6b6b !important;
          animation: teleportGlow 1s ease-in-out;
        }
        .teleport-target-glow {
          box-shadow: 0 0 20px #4ecdc4 !important;
          animation: teleportGlow 1s ease-in-out;
        }
        @keyframes teleportGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .teleport-source-selectable {
          background: linear-gradient(45deg, rgba(255, 107, 107, 0.3), rgba(255, 107, 107, 0.5)) !important;
          border: 2px solid #ff6b6b !important;
          cursor: pointer;
        }
        .teleport-source-selected {
          background: linear-gradient(45deg, #ff6b6b, #ff8a80) !important;
          border: 3px solid #d32f2f !important;
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.7);
        }
        .teleport-target-selectable {
          background: linear-gradient(45deg, rgba(78, 205, 196, 0.3), rgba(78, 205, 196, 0.5)) !important;
          border: 2px solid #4ecdc4 !important;
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
    }
  }
}
