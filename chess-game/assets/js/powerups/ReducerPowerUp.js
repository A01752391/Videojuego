import { PowerUpBase } from './PowerUpBase.js';

export class ReducerPowerUp extends PowerUpBase {
  constructor() {
    super(
      'Reducer',
      'Reduce el rango de movimiento de un caballo, alfil o reina enemiga durante 2 turnos del rival. Caballo: solo diagonales de 1 casilla; Alfil/Reina: máximo 1 casilla.',
      true, // requiresTarget
      4, // duration (4 turnos totales = 2 turnos del rival)
      '🔄' // uiIcon
    );
  }

  /**
   * Verifica si el power-up puede ser activado.
   */
  canActivate(gameContext, playerColor) {
    const { board } = gameContext;
    const opponentColor = playerColor === 'w' ? 'b' : 'w';
    
    // Verificar si hay piezas enemigas válidas sin reducer
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === opponentColor) {
                // Solo caballos, alfiles y reinas
                if (['n', 'b', 'q'].includes(piece.type)) {
                    // Verificar si la pieza ya tiene reducer
                    const hasReducer = this.checkIfPieceHasReducer(gameContext, row, col);
                    if (!hasReducer) {
                        return true; // Encontró al menos una pieza válida
                    }
                }
            }
        }
    }
    
    if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "No hay caballos, alfiles o reinas enemigas disponibles para reducir.";
    }
    return false;
  }

  /**
   * Valida si un objetivo específico es válido para Reducer.
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
            gameContext.messageElement.textContent = "Solo puedes reducir piezas enemigas.";
        }
        return false;
    }

    // Solo caballos, alfiles y reinas
    if (!['n', 'b', 'q'].includes(targetPiece.type)) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Solo puedes reducir caballos, alfiles o reinas.";
        }
        return false;
    }

    // Verificar si la pieza ya tiene reducer
    const hasReducer = this.checkIfPieceHasReducer(gameContext, row, col);
    if (hasReducer) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Esta pieza ya tiene su movimiento reducido.";
        }
        return false;
    }

    return true;
  }

  /**
   * Verifica si una pieza ya tiene reducer activo.
   */
  checkIfPieceHasReducer(gameContext, row, col) {
    if (!gameContext.activePowerUps) return false;
    
    return gameContext.activePowerUps.some(powerUp => 
        powerUp.type === 'Reducer' && 
        powerUp.targetRow === row && 
        powerUp.targetCol === col &&
        powerUp.remainingDuration > 0
    );
  }

  /**
   * Activa el Reducer power-up para reducir el movimiento de la pieza objetivo.
   */
  activate(gameContext, playerColor, targetData = null) {
    // Validar target
    if (!this.canActivateOnTarget(gameContext, playerColor, targetData)) {
        return false;
    }

    const { row, col } = targetData;
    const { board } = gameContext;
    const targetPiece = board[row][col];

    // Guardar información de la pieza reducida
    const pieceNames = {
      'n': 'Caballo', 'b': 'Alfil', 'q': 'Reina'
    };
    
    const pieceName = pieceNames[targetPiece.type];
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';
    const opponentColorName = targetPiece.color === 'w' ? 'Blancas' : 'Negras';

    // Mostrar mensaje de éxito
    if (gameContext.messageElement) {
      const reductionDesc = targetPiece.type === 'n' ? 
        'solo diagonales de 1 casilla' : 'máximo 1 casilla';
      gameContext.messageElement.textContent = `¡${playerColorName} reducen el ${pieceName} de ${opponentColorName}! Movimiento: ${reductionDesc} por 2 turnos del rival.`;
    }    // Activar iluminación radial
    this.triggerRadialIllumination(gameContext, row, col, 'reducer');

    // Activar animación visual de activación central
    this.triggerReducerActivationAnimation(gameContext);

    // Activar animación visual permanente en la celda
    this.triggerReducerAnimation(gameContext, row, col);

    // Registrar la activación como power-up activo
    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: this.duration,
      targetRow: row,
      targetCol: col,
      reducedPiece: { ...targetPiece }
    };

    this.onActivationComplete(gameContext, playerColor, activeInstanceData);
    return true;
  }

  /**
   * Procesado al inicio de cada turno - disminuye duración solo en turnos del enemigo.
   */
  onTurnStart(gameContext, activeInstanceData) {
    const currentPlayer = gameContext.currentColor;
    const reducerOwner = activeInstanceData.placedBy;
    
    // Solo decrementar cuando es turno del ENEMIGO (no del dueño del reducer)
    if (currentPlayer !== reducerOwner && activeInstanceData.remainingDuration > 0) {
        // Decrementar duración solo en turnos del enemigo
        activeInstanceData.remainingDuration--;
        
        if (activeInstanceData.remainingDuration <= 0) {
            // Remover visual del reducer
            this.removeReducerVisual(gameContext, activeInstanceData.targetRow, activeInstanceData.targetCol);
            
            // Mostrar mensaje de liberación
            if (gameContext.messageElement) {
                const pieceNames = {
                    'n': 'Caballo', 'b': 'Alfil', 'q': 'Reina'
                };
                const pieceName = pieceNames[activeInstanceData.reducedPiece.type];
                const opponentColorName = activeInstanceData.reducedPiece.color === 'w' ? 'Blancas' : 'Negras';
                gameContext.messageElement.textContent = `El ${pieceName} de ${opponentColorName} recupera su movimiento completo.`;
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
   * MÉTODO PRINCIPAL Verifica si un movimiento debe ser reducido por Reducer.
   */
  static isMovementReducedByReducer(gameContext, fromRow, fromCol, toRow, toCol, pieceType) {
    if (!gameContext.activePowerUps) return false;

    // Buscar si la pieza que se quiere mover tiene reducer
    const reducers = gameContext.activePowerUps.filter(powerUp => 
        powerUp.type === 'Reducer' && 
        powerUp.targetRow === fromRow && 
        powerUp.targetCol === fromCol &&
        powerUp.remainingDuration > 0
    );

    if (reducers.length > 0) {
        // Aplicar limitaciones según el tipo de pieza
        if (pieceType === 'n') {
            // CORREGIDO: Para caballos, isBasicLegalMove ya maneja la restricción
            // Solo retornamos false aquí (no bloqueamos nada adicional)
            return false;
        } else if (pieceType === 'b' || pieceType === 'q') {
            // Alfil/Reina: Máximo 1 casilla
            const rowDistance = Math.abs(toRow - fromRow);
            const colDistance = Math.abs(toCol - fromCol);
            const maxDistance = Math.max(rowDistance, colDistance);
            
            if (maxDistance > 1) {
                // Mostrar mensaje de bloqueo
                if (gameContext.messageElement) {
                    const pieceNames = {
                        'b': 'Alfil', 'q': 'Reina'
                    };
                    const pieceName = pieceNames[pieceType];
                    gameContext.messageElement.textContent = `¡El ${pieceName} tiene movimiento reducido! Máximo 1 casilla.`;
                }

                // Mostrar animación de bloqueo
                ReducerPowerUp.triggerBlockAnimation(gameContext, fromRow, fromCol);
                return true; // BLOQUEAR movimiento
            }
        }
    }

    return false; // No hay reducer o movimiento permitido
  }

  /**
   * FUNCIÓN AUXILIAR: Verifica si una pieza tiene reducer activo.
   */
  static hasReducerActive(gameContext, row, col) {
    if (!gameContext.activePowerUps) return false;
    
    return gameContext.activePowerUps.some(powerUp => 
        powerUp.type === 'Reducer' && 
        powerUp.targetRow === row && 
        powerUp.targetCol === col &&
        powerUp.remainingDuration > 0
    );
  }

  /**
   * Remueve el visual del reducer de una casilla.
   */
  removeReducerVisual(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;
    
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;
    
    const reducerElement = targetCell.querySelector('.reducer-effect');
    if (reducerElement) {
        reducerElement.remove();
    }
  }

  /**
   * Activa animación cuando el reducer bloquea un movimiento.
   */
  static triggerBlockAnimation(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;
    
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;
    
    // Crear efecto de bloqueo
    const blockEffect = document.createElement('div');
    blockEffect.className = 'reducer-block-animation';
    blockEffect.textContent = '🔄⚡';
    blockEffect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5em;
      color: #FF8C00;
      animation: reducerBlock 1s ease-out;
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
   * Activa una animación de activación central para el efecto de Reducer.
   */
  triggerReducerActivationAnimation(gameContext) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Crear efecto de transformación central
    const transformEffect = document.createElement('div');
    transformEffect.className = 'reducer-activation-transform';
    transformEffect.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-image: url('/images/reduceranimation.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      animation: reducerActivationTransform 1.2s ease-out;
      pointer-events: none;
      z-index: 9999;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#reducer-activation-style')) {
      const style = document.createElement('style');
      style.id = 'reducer-activation-style';
      style.textContent = `        @keyframes reducerActivationTransform {
          0% { 
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 1;
          }
          50% { 
            transform: translate(-50%, -50%) scale(15);
            opacity: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
          }
        }
        
        @keyframes reducerActivationGlow {
          0% { 
            box-shadow: 0 0 5px rgba(255, 165, 0, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 165, 0, 1), 0 0 30px rgba(255, 165, 0, 0.7);
          }
          100% { 
            box-shadow: 0 0 5px rgba(255, 165, 0, 0.5);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Agregar efecto de resplandor al tablero
    boardElement.style.animation = 'reducerActivationGlow 1.2s ease-out';
    boardElement.style.position = 'relative';
    
    // Agregar la animación al contenedor principal
    const gameContainer = boardElement.parentElement || document.body;
    gameContainer.appendChild(transformEffect);

    // Remover efectos después de la animación
    setTimeout(() => {
      if (transformEffect.parentNode) {
        transformEffect.parentNode.removeChild(transformEffect);
      }
      boardElement.style.animation = '';
    }, 1200);
  }

  /**
   * Activa una animación visual para el efecto de Reducer.
   */
  triggerReducerAnimation(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Buscar la celda objetivo
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;    // Crear elemento de reducer permanente
    const reducerEffect = document.createElement('div');
    reducerEffect.className = 'reducer-effect';
    reducerEffect.style.cssText = `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      background-image: url('/images/reduceranimation.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      pointer-events: none;
      z-index: 999;
      animation: reducerPulse 2s infinite;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#reducer-animation-style')) {
      const style = document.createElement('style');
      style.id = 'reducer-animation-style';
      style.textContent = `
        @keyframes reducerPulse {
          0% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          25% { 
            transform: scale(1.1) rotate(90deg);
            opacity: 0.8;
          }
          50% { 
            transform: scale(0.9) rotate(180deg);
            opacity: 1;
          }
          75% { 
            transform: scale(1.1) rotate(270deg);
            opacity: 0.9;
          }
          100% { 
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        @keyframes reducerBlock {
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

    // Agregar reducer a la celda (permanente hasta que expire)
    targetCell.style.position = 'relative';
    targetCell.appendChild(reducerEffect);
  }

  /**
   * Remueve el reducer si la pieza reducida fue capturada.
   */
  static removeReducerIfPieceCaptured(gameContext, captureRow, captureCol, capturedPiece) {
    if (!gameContext.activePowerUps || !capturedPiece) return;

    // Buscar si la pieza capturada tenía un reducer
    const reducerIndex = gameContext.activePowerUps.findIndex(powerUp => 
        powerUp.type === 'Reducer' && 
        powerUp.targetRow === captureRow && 
        powerUp.targetCol === captureCol &&
        powerUp.remainingDuration > 0
    );

    if (reducerIndex !== -1) {
        const reducer = gameContext.activePowerUps[reducerIndex];
        
        // Remover visual del reducer
        const { boardElement } = gameContext;
        if (boardElement) {
            const targetCell = boardElement.querySelector(`[data-row="${captureRow}"][data-col="${captureCol}"]`);
            if (targetCell) {
                const reducerElement = targetCell.querySelector('.reducer-effect');
                if (reducerElement) {
                    reducerElement.remove();
                }
            }
        }
        
        // Remover el reducer de activePowerUps
        gameContext.activePowerUps.splice(reducerIndex, 1);
        
        // Mostrar mensaje (solo si no hay mensajes más importantes)
        if (gameContext.messageElement) {
            const pieceNames = {
                'n': 'Caballo', 'b': 'Alfil', 'q': 'Reina'
            };
            const pieceName = pieceNames[capturedPiece.type];
            const capturedColorName = capturedPiece.color === 'w' ? 'Blancas' : 'Negras';
            
            // No sobreescribir mensajes importantes
            if (!gameContext.messageElement.textContent.includes("capturado") && 
                !gameContext.messageElement.textContent.includes("ganan la ronda")) {
                gameContext.messageElement.textContent = `El ${pieceName} de ${capturedColorName} fue capturado. El efecto reducer desaparece.`;
            }
        }
        
        console.log(`Reducer removed: piece at (${captureRow}, ${captureCol}) was captured`);
    }
  }
}