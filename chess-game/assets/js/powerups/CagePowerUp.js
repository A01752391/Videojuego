import { PowerUpBase } from './PowerUpBase.js';

export class CagePowerUp extends PowerUpBase {
  constructor() {
    super(
      'Cage',
      'Inmoviliza una pieza enemiga durante 3 turnos. La pieza no podrá moverse hasta que el efecto termine.',
      true, // requiresTarget
      3, // duration (3 turnos)
      '🔒' // uiIcon
    );
  }

  /**
   * Checks if the power-up can be activated.
   */
  canActivate(gameContext, playerColor) {
    const { board } = gameContext;
    const opponentColor = playerColor === 'w' ? 'b' : 'w';
    
    // Verificar si hay piezas enemigas sin jaula (excluyendo el rey)
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === opponentColor && piece.type !== 'k') { // Excluir rey
                // Verificar si la pieza ya tiene jaula
                const hasCage = this.checkIfPieceHasCage(gameContext, row, col);
                if (!hasCage) {
                    return true; // Encontró al menos una pieza válida
                }
            }
        }
    }
    
    if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "No hay piezas enemigas disponibles para enjaulvar.";
    }
    return false;
  }

  /**
   * Validates if a specific target is valid for Cage.
   */
  canActivateOnTarget(gameContext, playerColor, targetData) {
    if (!targetData || typeof targetData.row !== 'number' || typeof targetData.col !== 'number') {
        return false;
    }

    const { row, col } = targetData;
    const { board } = gameContext;

    // Verificar coordenadas válidas
    if (row < 0 || row > 7 || col < 0 || col > 7) return false;

    const targetPiece = board[row][col];

    // Debe haber una pieza en el objetivo
    if (!targetPiece) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No hay pieza en esa casilla.";
        }
        return false;
    }

    // La pieza debe ser enemiga
    const opponentColor = playerColor === 'w' ? 'b' : 'w';
    if (targetPiece.color !== opponentColor) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Solo puedes enjaulvar piezas enemigas.";
        }
        return false;
    }

    // RESTRICCIÓN: No se puede enjaulvar al rey
    if (targetPiece.type === 'k') {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No puedes enjaulvar al rey enemigo.";
        }
        return false;
    }

    // Verificar si la pieza ya tiene jaula
    const hasCage = this.checkIfPieceHasCage(gameContext, row, col);
    if (hasCage) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Esta pieza ya está enjaulada.";
        }
        return false;
    }

    return true;
  }

  /**
   * Verifica si una pieza ya tiene jaula activa.
   */
  checkIfPieceHasCage(gameContext, row, col) {
    if (!gameContext.activePowerUps) return false;
    
    return gameContext.activePowerUps.some(powerUp => 
        powerUp.type === 'Cage' && 
        powerUp.targetRow === row && 
        powerUp.targetCol === col &&
        powerUp.remainingDuration > 0
    );
  }

  /**
   * Activates the Cage power-up to immobilize the target piece.
   */
  activate(gameContext, playerColor, targetData = null) {
    // Validar target
    if (!this.canActivateOnTarget(gameContext, playerColor, targetData)) {
        return false;
    }

    const { row, col } = targetData;
    const { board } = gameContext;
    const targetPiece = board[row][col];

    // Guardar información de la pieza enjaulada
    const pieceNames = {
      'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
      'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
    };
    
    const pieceName = pieceNames[targetPiece.type];
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';
    const opponentColorName = targetPiece.color === 'w' ? 'Blancas' : 'Negras';

    // Mostrar mensaje de éxito
    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = `¡${playerColorName} enjaulan el ${pieceName} de ${opponentColorName} por 3 turnos!`;
    }

    
    this.triggerRadialIllumination(gameContext, row, col, 'cage');

    // Activar animación visual
    this.triggerCageAnimation(gameContext, row, col);

    // Registrar la activación como power-up activo
    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: this.duration, // 3 turnos
      targetRow: row,
      targetCol: col,
      cagedPiece: { ...targetPiece }
    };

    this.onActivationComplete(gameContext, playerColor, activeInstanceData);
    return true;
  }

  /**
   * CORREGIDO: Procesado al inicio de cada turno - disminuye duración solo en turnos del enemigo.
   */
  onTurnStart(gameContext, activeInstanceData) {
    const currentPlayer = gameContext.currentColor;
    const cageOwner = activeInstanceData.placedBy;
    
    // NUEVA LÓGICA: Solo decrementar cuando es turno del ENEMIGO (no del dueño de la cage)
    if (currentPlayer !== cageOwner && activeInstanceData.remainingDuration > 0) {
        // Decrementar duración solo en turnos del enemigo
        activeInstanceData.remainingDuration--;
        
        if (activeInstanceData.remainingDuration <= 0) {
            // Remover visual de la jaula
            this.removeCageVisual(gameContext, activeInstanceData.targetRow, activeInstanceData.targetCol);
            
            // Mostrar mensaje de liberación
            if (gameContext.messageElement) {
                const pieceNames = {
                    'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
                    'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
                };
                const pieceName = pieceNames[activeInstanceData.cagedPiece.type];
                const opponentColorName = activeInstanceData.cagedPiece.color === 'w' ? 'Blancas' : 'Negras';
                gameContext.messageElement.textContent = `El ${pieceName} de ${opponentColorName} ha sido liberado de la jaula.`;
            }
            
            // Remover de la lista de power-ups activos
            const index = gameContext.activePowerUps.findIndex(pu => 
                pu.id === activeInstanceData.id && 
                pu.targetRow === activeInstanceData.targetRow && 
                pu.targetCol === activeInstanceData.targetCol
            );
            
            if (index !== -1) {
                gameContext.activePowerUps.splice(index, 1);
            }
            
            // Renderizar tablero para mostrar cambios
            if (gameContext.renderBoard) {
                gameContext.renderBoard();
            }
        }
    }
  }

  /**
   * MÉTODO PRINCIPAL: Verifica si un movimiento debe ser bloqueado por Cage.
   * Esta función debe ser llamada desde isLegalMove en pieces.js
   */
  static isMovementBlockedByCage(gameContext, fromRow, fromCol) {
    if (!gameContext.activePowerUps) return false;

    // Buscar si la pieza que se quiere mover está enjaulada
    const cages = gameContext.activePowerUps.filter(powerUp => 
        powerUp.type === 'Cage' && 
        powerUp.targetRow === fromRow && 
        powerUp.targetCol === fromCol &&
        powerUp.remainingDuration > 0
    );

    if (cages.length > 0) {
        const cage = cages[0];
        
        // Mostrar mensaje de bloqueo
        if (gameContext.messageElement) {
            const pieceNames = {
                'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
                'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
            };
            const pieceName = pieceNames[cage.cagedPiece.type];
            gameContext.messageElement.textContent = `¡El ${pieceName} está enjaulado y no puede moverse!`;
        }

        // Mostrar animación de bloqueo
        CagePowerUp.triggerBlockAnimation(gameContext, fromRow, fromCol);
        return true; // BLOQUEAR movimiento
    }

    return false; // No hay jaula, permitir movimiento
  }

  /**
   * Remueve el visual de la jaula de una casilla.
   */
  removeCageVisual(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;
    
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;
    
    const cageElement = targetCell.querySelector('.cage-effect');
    if (cageElement) {
        cageElement.remove();
    }
  }

  /**
   * Activa animación cuando la jaula bloquea un movimiento.
   */
  static triggerBlockAnimation(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;
    
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;
    
    // Crear efecto de bloqueo
    const blockEffect = document.createElement('div');
    blockEffect.className = 'cage-block-animation';
    blockEffect.textContent = '🔒⚡';
    blockEffect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5em;
      color: #FF6B6B;
      animation: cageBlock 1s ease-out;
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

  /**
   * Activa una animación visual para el efecto de Cage.
   */
  triggerCageAnimation(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Buscar la celda objetivo
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;

    // Crear elemento de jaula permanente
    const cageEffect = document.createElement('div');
    cageEffect.className = 'cage-effect';
    cageEffect.textContent = '🔒';
    cageEffect.style.cssText = `
      position: absolute;
      top: 2px;
      left: 2px;
      font-size: 1.3em;
      color: #FF6B6B;
      text-shadow: 0 0 3px rgba(255, 107, 107, 0.8);
      pointer-events: none;
      z-index: 999;
      animation: cageShake 2s infinite;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#cage-animation-style')) {
      const style = document.createElement('style');
      style.id = 'cage-animation-style';
      style.textContent = `
        @keyframes cageShake {
          0% { 
            transform: rotate(0deg);
            opacity: 1;
          }
          25% { 
            transform: rotate(-2deg);
            opacity: 0.8;
          }
          50% { 
            transform: rotate(2deg);
            opacity: 1;
          }
          75% { 
            transform: rotate(-1deg);
            opacity: 0.9;
          }
          100% { 
            transform: rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes cageBlock {
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

    // Agregar jaula a la celda (permanente hasta que expire)
    targetCell.style.position = 'relative';
    targetCell.appendChild(cageEffect);
  }

  /**
   * NUEVO: Remueve la cage si la pieza enjaulada fue capturada.
   */
  static removeCageIfPieceCaptured(gameContext, captureRow, captureCol, capturedPiece) {
    if (!gameContext.activePowerUps || !capturedPiece) return;

    // Buscar si la pieza capturada tenía una jaula
    const cageIndex = gameContext.activePowerUps.findIndex(powerUp => 
        powerUp.type === 'Cage' && 
        powerUp.targetRow === captureRow && 
        powerUp.targetCol === captureCol &&
        powerUp.remainingDuration > 0
    );

    if (cageIndex !== -1) {
        const cage = gameContext.activePowerUps[cageIndex];
        
        // Remover visual de la jaula (aunque ya no esté la pieza)
        const { boardElement } = gameContext;
        if (boardElement) {
            const targetCell = boardElement.querySelector(`[data-row="${captureRow}"][data-col="${captureCol}"]`);
            if (targetCell) {
                const cageElement = targetCell.querySelector('.cage-effect');
                if (cageElement) {
                    cageElement.remove();
                }
            }
        }
        
        // Remover la cage de activePowerUps
        gameContext.activePowerUps.splice(cageIndex, 1);
        
        // Mostrar mensaje (solo si no hay mensajes más importantes)
        if (gameContext.messageElement) {
            const pieceNames = {
                'p': 'Peón', 'r': 'Torre', 'n': 'Caballo', 
                'b': 'Alfil', 'q': 'Reina', 'k': 'Rey'
            };
            const pieceName = pieceNames[capturedPiece.type];
            const capturedColorName = capturedPiece.color === 'w' ? 'Blancas' : 'Negras';
            
            // No sobreescribir mensajes importantes
            if (!gameContext.messageElement.textContent.includes("capturado") && 
                !gameContext.messageElement.textContent.includes("ganan la ronda")) {
                gameContext.messageElement.textContent = `El ${pieceName} de ${capturedColorName} fue capturado. La jaula desaparece.`;
            }
        }
        
        console.log(`Cage removed: piece at (${captureRow}, ${captureCol}) was captured`);
    }
  }
}