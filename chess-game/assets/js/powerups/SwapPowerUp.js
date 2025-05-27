import { PowerUpBase } from './PowerUpBase.js';

export class SwapPowerUp extends PowerUpBase {
  constructor() {
    super(
      'Swap',
      'Intercambia las posiciones de dos piezas (propias o enemigas) en el tablero. ¡ATENCIÓN: Usar este poder termina tu turno inmediatamente!',
      true, // requiresTarget - necesita seleccionar dos piezas
      0, // duration - efecto instantáneo
      '🔄' // uiIcon
    );
  }

  /**
   * Verifica si el power-up puede ser activado.
   */
  canActivate(gameContext, playerColor) {
    const { board } = gameContext;
    let pieceCount = 0;
    
    // Contar todas las piezas en el tablero (mínimo 2 para intercambiar)
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col]) {
                pieceCount++;
                if (pieceCount >= 2) {
                    return true; // Suficientes piezas para intercambiar
                }
            }
        }
    }
    
    if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Necesitas al menos 2 piezas en el tablero para intercambiar.";
    }
    return false;
  }

  /**
   * Valida si un objetivo específico es válido para Swap.
   */
  canActivateOnTarget(gameContext, playerColor, targetData) {
    if (!targetData || !targetData.piece1 || !targetData.piece2) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Debes seleccionar exactamente 2 piezas para intercambiar.";
        }
        return false;
    }

    const { piece1, piece2 } = targetData;
    const { board } = gameContext;

    // Verificar coordenadas válidas para ambas piezas
    if (piece1.row < 0 || piece1.row > 7 || piece1.col < 0 || piece1.col > 7 ||
        piece2.row < 0 || piece2.row > 7 || piece2.col < 0 || piece2.col > 7) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Coordenadas inválidas para las piezas seleccionadas.";
        }
        return false;
    }

    // Verificar que ambas casillas contengan piezas
    const pieceA = board[piece1.row][piece1.col];
    const pieceB = board[piece2.row][piece2.col];

    if (!pieceA || !pieceB) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Ambas casillas deben contener piezas para intercambiar.";
        }
        return false;
    }

    // Verificar que no sean la misma pieza
    if (piece1.row === piece2.row && piece1.col === piece2.col) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No puedes intercambiar una pieza consigo misma.";
        }
        return false;
    }

    // NUEVA RESTRICCIÓN 1: No permitir intercambiar reyes
    if (pieceA.type === 'k' || pieceB.type === 'k') {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No se puede hacer swap con reyes. Los reyes están protegidos de intercambios.";
        }
        return false;
    }

    // No permitir intercambiar si alguna pieza está en una casilla cercada
    if (gameContext.fencedTiles) {
        const piece1Fenced = gameContext.fencedTiles.some(tile => 
            tile.row === piece1.row && tile.col === piece1.col);
        const piece2Fenced = gameContext.fencedTiles.some(tile => 
            tile.row === piece2.row && tile.col === piece2.col);
        
        if (piece1Fenced || piece2Fenced) {
            if (gameContext.messageElement) {
                gameContext.messageElement.textContent = "No puedes intercambiar piezas que están en casillas cercadas.";
            }
            return false;
        }
    }

    // NUEVA RESTRICCIÓN 2: Simular el intercambio y verificar que no cause jaque
    if (!this.validateSwapSafety(gameContext, piece1, piece2)) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Este intercambio pondría al rey en jaque. Swap bloqueado.";
        }
        return false;
    }

    return true;
  }

  /**
   * Activa el Swap power-up intercambiando las posiciones de dos piezas.
   */
  activate(gameContext, playerColor, targetData = null) {
    // Validar selección
    if (!this.canActivateOnTarget(gameContext, playerColor, targetData)) {
        return false;
    }

    const { piece1, piece2 } = targetData;
    const { board } = gameContext;

    // Obtener las piezas
    const pieceA = board[piece1.row][piece1.col];
    const pieceB = board[piece2.row][piece2.col];

    // Guardar información para el mensaje
    const pieceNames = {
        'p': 'Peón', 'n': 'Caballo', 'b': 'Alfil', 
        'r': 'Torre', 'q': 'Reina', 'k': 'Rey'
    };
    
    const pieceAName = pieceNames[pieceA.type];
    const pieceBName = pieceNames[pieceB.type];
    const pieceAColor = pieceA.color === 'w' ? 'Blancas' : 'Negras';
    const pieceBColor = pieceB.color === 'w' ? 'Blancas' : 'Negras';
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';

    // Realizar el intercambio
    board[piece1.row][piece1.col] = pieceB;
    board[piece2.row][piece2.col] = pieceA;

    // Mostrar mensaje de éxito
    if (gameContext.messageElement) {
        gameContext.messageElement.textContent = 
            `¡${playerColorName} intercambian posiciones! ${pieceAName} de ${pieceAColor} ↔ ${pieceBName} de ${pieceBColor}. Turno terminado.`;
    }

    // Activar iluminación radial en ambas posiciones
    this.triggerRadialIllumination(gameContext, piece1.row, piece1.col, 'swap');
    setTimeout(() => {
        this.triggerRadialIllumination(gameContext, piece2.row, piece2.col, 'swap');
    }, 300);

    // Activar animación visual del intercambio
    this.triggerSwapAnimation(gameContext, piece1, piece2);

    // Registrar la activación (efecto instantáneo, sin duración)
    const activeInstanceData = {
        id: this.id,
        type: this.name,
        placedBy: playerColor,
        remainingDuration: 0, // Efecto instantáneo
        piece1: { ...piece1, piece: { ...pieceA } },
        piece2: { ...piece2, piece: { ...pieceB } },
        swapped: true
    };

    // Renderizar tablero para mostrar cambios inmediatamente
    if (gameContext.renderBoard) {
        gameContext.renderBoard();
    }

    // TERMINAR TURNO INMEDIATAMENTE
    this.onActivationComplete(gameContext, playerColor, activeInstanceData);
    
    // Forzar cambio de turno
    if (gameContext.switchTurn) {
        setTimeout(() => {
            gameContext.switchTurn();
        }, 1000); // Dar tiempo para ver la animación
    }

    return true;
  }

  /**
   * NUEVA FUNCIÓN: Verificar si el intercambio es seguro (no pone reyes en jaque).
   */
  validateSwapSafety(gameContext, piece1, piece2) {
    const { board } = gameContext;
    
    // Hacer una copia del tablero para simular el intercambio
    const boardCopy = JSON.parse(JSON.stringify(board));
    
    // Obtener las piezas originales
    const pieceA = boardCopy[piece1.row][piece1.col];
    const pieceB = boardCopy[piece2.row][piece2.col];
    
    // Realizar el intercambio en la copia
    boardCopy[piece1.row][piece1.col] = pieceB;
    boardCopy[piece2.row][piece2.col] = pieceA;
    
    // Crear contexto temporal para la validación
    const tempGameContext = {
        ...gameContext,
        board: boardCopy
    };
    
    // Verificar si algún rey está en jaque después del intercambio
    const whiteKingInCheck = gameContext.isKingInCheck(boardCopy, 'w', tempGameContext);
    const blackKingInCheck = gameContext.isKingInCheck(boardCopy, 'b', tempGameContext);
    
    // Si algún rey está en jaque, el intercambio no es válido
    if (whiteKingInCheck || blackKingInCheck) {
        return false;
    }
    
    return true;
  }

  /**
   * Verificar si después del intercambio algún rey queda en jaque.
   * FUNCIÓN ESTÁTICA PARA COMPATIBILIDAD (ahora redirige a la función de instancia)
   */
  static validateSwapSafety(gameContext, piece1, piece2) {
    const swapInstance = new SwapPowerUp();
    return swapInstance.validateSwapSafety(gameContext, piece1, piece2);
  }

  /**
   * Activar animación visual del intercambio.
   */
  triggerSwapAnimation(gameContext, piece1, piece2) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Buscar las celdas
    const cellA = boardElement.querySelector(`[data-row="${piece1.row}"][data-col="${piece1.col}"]`);
    const cellB = boardElement.querySelector(`[data-row="${piece2.row}"][data-col="${piece2.col}"]`);
    
    if (!cellA || !cellB) return;

    // Crear efectos visuales de intercambio
    const swapEffectA = document.createElement('div');
    swapEffectA.className = 'swap-effect-a';
    swapEffectA.textContent = '🔄';
    swapEffectA.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2em;
      color: #4CAF50;
      animation: swapPulse 2s ease-out;
      pointer-events: none;
      z-index: 1001;
    `;

    const swapEffectB = document.createElement('div');
    swapEffectB.className = 'swap-effect-b';
    swapEffectB.textContent = '🔄';
    swapEffectB.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2em;
      color: #2196F3;
      animation: swapPulse 2s ease-out;
      pointer-events: none;
      z-index: 1001;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#swap-animation-style')) {
      const style = document.createElement('style');
      style.id = 'swap-animation-style';
      style.textContent = `
        @keyframes swapPulse {
          0% { 
            transform: translate(-50%, -50%) scale(0.5) rotate(0deg);
            opacity: 1;
          }
          25% { 
            transform: translate(-50%, -50%) scale(1.2) rotate(90deg);
            opacity: 0.8;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.5) rotate(180deg);
            opacity: 0.6;
          }
          75% { 
            transform: translate(-50%, -50%) scale(1.2) rotate(270deg);
            opacity: 0.4;
          }
          100% { 
            transform: translate(-50%, -50%) scale(2) rotate(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Agregar efectos a las celdas
    cellA.appendChild(swapEffectA);
    cellB.appendChild(swapEffectB);

    // Remover efectos después de la animación
    setTimeout(() => {
        if (swapEffectA.parentNode) swapEffectA.parentNode.removeChild(swapEffectA);
        if (swapEffectB.parentNode) swapEffectB.parentNode.removeChild(swapEffectB);
    }, 2000);
  }

  /**
   * Método auxiliar para UI: Verificar si dos piezas pueden ser intercambiadas.
   */
  static canSwapPieces(gameContext, row1, col1, row2, col2) {
    const swapPowerUp = new SwapPowerUp();
    const targetData = {
        piece1: { row: row1, col: col1 },
        piece2: { row: row2, col: col2 }
    };
    
    return swapPowerUp.canActivateOnTarget(gameContext, gameContext.currentColor, targetData);
  }
}