import { PowerUpBase } from './PowerUpBase.js';

export class ShieldPowerUp extends PowerUpBase {
  constructor() {
    super(
      'Shield',
      'Protege una pieza propia de capturas durante 1 turno. El escudo desaparece al final del turno.',
      true, // requiresTarget
      2, // CORRECCIÓN: 2 turnos para funcionar correctamente
      '🛡️' // uiIcon
    );
  }

  canActivate(gameContext, playerColor) {
    const { board } = gameContext;
    let hasFriendlyPieces = false;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === playerColor) {
                const hasShield = this.checkIfPieceHasShield(gameContext, row, col);
                if (!hasShield) {
                    hasFriendlyPieces = true;
                    break;
                }
            }
        }
        if (hasFriendlyPieces) break;
    }
    
    if (!hasFriendlyPieces) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No hay piezas propias disponibles para proteger.";
        }
        return false;
    }
    
    return true;
  }

  canActivateOnTarget(gameContext, playerColor, targetData) {
    if (!targetData || typeof targetData.row !== 'number' || typeof targetData.col !== 'number') {
        return false;
    }

    const { row, col } = targetData;
    const { board } = gameContext;

    if (row < 0 || row > 7 || col < 0 || col > 7) return false;

    const targetPiece = board[row][col];

    if (!targetPiece) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No hay pieza en esa casilla.";
        }
        return false;
    }

    if (targetPiece.color !== playerColor) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Solo puedes proteger tus propias piezas.";
        }
        return false;
    }

    const hasShield = this.checkIfPieceHasShield(gameContext, row, col);
    if (hasShield) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Esta pieza ya tiene un escudo.";
        }
        return false;
    }

    return true;
  }

  checkIfPieceHasShield(gameContext, row, col) {
    if (!gameContext.activePowerUps) return false;
    
    return gameContext.activePowerUps.some(powerUp => 
        powerUp.type === 'Shield' && 
        powerUp.targetRow === row && 
        powerUp.targetCol === col &&
        powerUp.remainingDuration > 0
    );
  }

  activate(gameContext, playerColor, targetData = null) {
    if (!this.canActivateOnTarget(gameContext, playerColor, targetData)) {
        return false;
    }

    const { row, col } = targetData;
    const { board } = gameContext;
    const targetPiece = board[row][col];

    const pieceNames = {
      'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
      'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
    };
    
    const pieceName = pieceNames[targetPiece.type];
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';

    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = `¡${playerColorName} protegen su ${pieceName} con Shield por 1 turno!`;
    }

    this.triggerShieldAnimation(gameContext, row, col);

    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: this.duration, // 2 turnos
      targetRow: row,
      targetCol: col,
      protectedPiece: { ...targetPiece }
    };

    this.onActivationComplete(gameContext, playerColor, activeInstanceData);
    return true;
  }

  /**
   * CORRECCIÓN CRÍTICA: Decrementar cuando es turno del OPONENTE
   */
  onTurnStart(gameContext, activeInstanceData) {
    const currentPlayer = gameContext.currentColor;
    const shieldOwner = activeInstanceData.placedBy;
    
    // LÓGICA CORREGIDA: Decrementar cuando NO es el turno del dueño
    if (currentPlayer !== shieldOwner && activeInstanceData.remainingDuration > 0) {
        activeInstanceData.remainingDuration--;
        
        if (activeInstanceData.remainingDuration <= 0) {
            this.removeShieldVisual(gameContext, activeInstanceData.targetRow, activeInstanceData.targetCol);
            
            if (gameContext.messageElement) {
                const pieceNames = {
                    'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
                    'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
                };
                const pieceName = pieceNames[activeInstanceData.protectedPiece.type];
                const playerColorName = activeInstanceData.placedBy === 'w' ? 'Blancas' : 'Negras';
                gameContext.messageElement.textContent = `El escudo del ${pieceName} de ${playerColorName} ha expirado.`;
            }
            
            const index = gameContext.activePowerUps.findIndex(pu => 
                pu.id === activeInstanceData.id && 
                pu.targetRow === activeInstanceData.targetRow && 
                pu.targetCol === activeInstanceData.targetCol
            );
            
            if (index !== -1) {
                gameContext.activePowerUps.splice(index, 1);
            }
            
            if (gameContext.renderBoard) {
                gameContext.renderBoard();
            }
        }
    }
  }

  static isMovementBlockedByShield(gameContext, fromRow, fromCol, toRow, toCol) {
    if (!gameContext.activePowerUps) return false;

    const { board } = gameContext;
    const movingPiece = board[fromRow][fromCol];
    const targetPiece = board[toRow][toCol];

    // Solo bloquear si es una captura
    if (!targetPiece || !movingPiece || targetPiece.color === movingPiece.color) {
        return false;
    }

    // Buscar Shield específico
    const shields = gameContext.activePowerUps.filter(powerUp => 
        powerUp.type === 'Shield' && 
        powerUp.targetRow === toRow && 
        powerUp.targetCol === toCol &&
        powerUp.remainingDuration > 0
    );

    if (shields.length > 0) {
        const shield = shields[0];
        
        if (gameContext.messageElement) {
            const pieceNames = {
                'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
                'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
            };
            const pieceName = pieceNames[shield.protectedPiece.type];
            const playerColorName = shield.placedBy === 'w' ? 'Blancas' : 'Negras';
            gameContext.messageElement.textContent = `¡El escudo protege al ${pieceName} de ${playerColorName}!`;
        }

        ShieldPowerUp.triggerBlockAnimation(gameContext, toRow, toCol);
        return true; // BLOQUEAR
    }

    return false;
  }

  /**
   * MEJORADO: Remueve el shield visual buscando en todo el tablero
   */
  removeShieldVisual(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;
    
    // Buscar en TODA la tablero por si la pieza se movió
    const allCells = boardElement.querySelectorAll('[data-row][data-col]');
    
    allCells.forEach(cell => {
      const shieldElement = cell.querySelector('.shield-effect');
      if (shieldElement) {
        shieldElement.remove();
      }
    });
  }

  /**
   * NUEVO: Actualiza la posición visual del shield cuando la pieza protegida se mueve
   */
  static updateShieldPosition(gameContext, oldRow, oldCol, newRow, newCol) {
    const { boardElement } = gameContext;
    if (!boardElement) return;
    
    // Buscar shield en la posición anterior
    const oldCell = boardElement.querySelector(`[data-row="${oldRow}"][data-col="${oldCol}"]`);
    if (!oldCell) return;
    
    const shieldElement = oldCell.querySelector('.shield-effect');
    if (!shieldElement) return;
    
    // Remover shield de la posición anterior
    shieldElement.remove();
    
    // Agregar shield a la nueva posición
    const newCell = boardElement.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
    if (!newCell) return;
    
    // Crear nuevo elemento shield en la nueva posición
    const newShieldEffect = document.createElement('div');
    newShieldEffect.className = 'shield-effect';
    newShieldEffect.textContent = '🛡️';
    newShieldEffect.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 1.2em;
      color: #4CAF50;
      text-shadow: 0 0 3px rgba(76, 175, 80, 0.8);
      pointer-events: none;
      z-index: 999;
      animation: shieldPulse 2s infinite;
    `;
    
    newCell.style.position = 'relative';
    newCell.appendChild(newShieldEffect);
  }

  static triggerBlockAnimation(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;
    
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;
    
    const blockEffect = document.createElement('div');
    blockEffect.className = 'shield-block-animation';
    blockEffect.textContent = '🛡️💥';
    blockEffect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5em;
      color: #4CAF50;
      animation: shieldBlock 1s ease-out;
      pointer-events: none;
      z-index: 1001;
    `;
    
    targetCell.appendChild(blockEffect);
    
    setTimeout(() => {
        if (blockEffect.parentNode) {
            blockEffect.parentNode.removeChild(blockEffect);
        }
    }, 1000);
  }

  triggerShieldAnimation(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;

    const shieldEffect = document.createElement('div');
    shieldEffect.className = 'shield-effect';
    shieldEffect.textContent = '🛡️';
    shieldEffect.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 1.2em;
      color: #4CAF50;
      text-shadow: 0 0 3px rgba(76, 175, 80, 0.8);
      pointer-events: none;
      z-index: 999;
      animation: shieldPulse 2s infinite;
    `;

    if (!document.querySelector('#shield-animation-style')) {
      const style = document.createElement('style');
      style.id = 'shield-animation-style';
      style.textContent = `
        @keyframes shieldPulse {
          0% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.1);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shieldBlock {
          0% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    targetCell.style.position = 'relative';
    targetCell.appendChild(shieldEffect);
  }
}