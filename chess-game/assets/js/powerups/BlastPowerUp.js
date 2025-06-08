import { PowerUpBase } from './PowerUpBase.js';
import { getRandomPowerUpType } from '../powerUpManager.js';

export class BlastPowerUp extends PowerUpBase {
  constructor() {
    super(
      'Blast',
      'Elimina instantáneamente un peón, caballo o alfil enemigo del tablero',
      true, // requiresTarget
      0, // duration (instant effect)
      '💥' // uiIcon
    );
  }

  /**
   * Checks if the power-up can be activated.
   * @param {object} gameContext - The current game context.
   * @param {string} playerColor - 'w' for white, 'b' for black.
   * @returns {boolean}
   */
  canActivate(gameContext, playerColor) {
    console.log('=== BLAST canActivate DEBUG ===');
    console.log('Arguments received:', { gameContext: !!gameContext, playerColor });
    console.log('gameContext.currentColor:', gameContext?.currentColor);
    console.log('Arguments count:', arguments.length);
    
    // Verificar si hay objetivos válidos en el tablero
    console.log('Blast: Initial activation check - looking for valid targets');
    
    const { board } = gameContext;
    const opponentColor = playerColor === 'w' ? 'b' : 'w';
    const validTargets = ['p', 'n', 'b'];
    
    // Buscar si hay al menos una pieza válida para eliminar
    let hasValidTargets = false;
    let foundTargets = [];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && 
                piece.color === opponentColor && 
                validTargets.includes(piece.type)) {
                hasValidTargets = true;
                foundTargets.push(`${piece.type} at (${row}, ${col})`);
                console.log(`Found valid target: ${piece.type} at (${row}, ${col})`);
            }
        }
    }
    
    console.log('All found targets:', foundTargets);
    
    if (!hasValidTargets) {
        console.log('Blast: No valid targets found on board');
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No hay peones, caballos o alfiles enemigos para eliminar.";
        }
        return false;
    }
    
    console.log('Blast: Valid targets found - activation allowed');
    console.log('=== BLAST canActivate END ===');
    return true;
  }

  /**
   * Validates if a specific target is valid for Blast.
   * @param {object} gameContext - The current game context.
   * @param {string} playerColor - 'w' for white, 'b' for black.
   * @param {object} targetData - Target coordinates { row, col }.
   * @returns {boolean}
   */
  canActivateOnTarget(gameContext, playerColor, targetData) {
    console.log('Blast: Target validation check');
    
    if (!targetData || typeof targetData.row !== 'number' || typeof targetData.col !== 'number') {
        console.log('Blast: Invalid target data format');
        return false;
    }

    const { row, col } = targetData;
    const { board } = gameContext;

    console.log(`Checking target at (${row}, ${col})`);
    
    // Verificar que las coordenadas estén en el tablero
    if (row < 0 || row > 7 || col < 0 || col > 7) {
        console.log('Blast: Target out of bounds');
        return false;
    }

    const targetPiece = board[row][col];
    console.log('Blast: Target piece:', targetPiece);

    // Debe haber una pieza en el objetivo
    if (!targetPiece) {
        console.log('Blast: No piece at target');
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "No hay pieza en esa casilla.";
        }
        return false;
    }

    // La pieza debe ser enemiga
    const opponentColor = playerColor === 'w' ? 'b' : 'w';
    console.log(`Player: ${playerColor}, Opponent should be: ${opponentColor}, Piece color: ${targetPiece.color}`);
    
    if (targetPiece.color !== opponentColor) {
        console.log('Blast: Target is not enemy piece');
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Solo puedes eliminar piezas enemigas.";
        }
        return false;
    }

    // Solo se pueden eliminar peones, caballos y alfiles
    const validTargets = ['p', 'n', 'b'];
    console.log(`Piece type: ${targetPiece.type}, Valid targets: ${validTargets}`);
    
    if (!validTargets.includes(targetPiece.type)) {
        console.log('Blast: Invalid piece type');
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Solo puedes eliminar peones, caballos y alfiles.";
        }
        return false;
    }

    console.log('Blast: Target is VALID!');
    return true;
  }

  /**
   * Activates the Blast power-up to eliminate the target piece.
   * @param {object} gameContext - The current game context.
   * @param {string} playerColor - 'w' for white, 'b' for black.
   * @param {object} targetData - Target coordinates { row, col }.
   * @returns {boolean} - True if activation was successful, false otherwise.
   */
  activate(gameContext, playerColor, targetData = null) {
    console.log('Blast activate called with:', { playerColor, targetData });
    
    // Usar canActivateOnTarget para validar el target específico
    if (!this.canActivateOnTarget(gameContext, playerColor, targetData)) {
        if (gameContext.messageElement) {
            gameContext.messageElement.textContent = "Objetivo inválido para Blast. Solo se pueden eliminar peones, caballos o alfiles enemigos.";
        }
        return false;
    }

    const { row, col } = targetData;
    const { board } = gameContext;
    const targetPiece = board[row][col];

    // Guardar información de la pieza eliminada para el mensaje
    const pieceNames = {
      'p': 'Peón',
      'n': 'Caballo', 
      'b': 'Alfil'
    };
    
    const pieceName = pieceNames[targetPiece.type];
    const opponentColorName = targetPiece.color === 'w' ? 'Blancas' : 'Negras';
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';

    // Eliminar la pieza del tablero
    board[row][col] = null;
    console.log(`Blast: Eliminated ${targetPiece.type} at (${row}, ${col})`);

    // Actualizar puntuación como si fuera una captura
    this.updateScoreForBlast(gameContext, playerColor, targetPiece);

    // Mostrar mensaje de éxito
    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = `¡${playerColorName} eliminan el ${pieceName} de ${opponentColorName} con Blast!`;
    }

    // NUEVO: Activar iluminación radial específica para Blast
    this.triggerRadialIllumination(gameContext, row, col, 'blast');
    
    // Activar animación visual si está disponible
    this.triggerBlastAnimation(gameContext, row, col);

    // Registrar la activación
    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: this.duration,
      targetRow: row,
      targetCol: col,
      eliminatedPiece: targetPiece
    };

    this.onActivationComplete(gameContext, playerColor, activeInstanceData);

    console.log(`Blast activated by ${playerColor} at (${row}, ${col}), eliminated ${pieceName}`);
    return true;
  }

  /**
   * Actualiza la puntuación del jugador como si hubiera capturado la pieza.
   * @param {object} gameContext - The current game context.
   * @param {string} playerColor - Color del jugador que usó Blast.
   * @param {object} eliminatedPiece - La pieza que fue eliminada.
   */
  updateScoreForBlast(gameContext, playerColor, eliminatedPiece) {
    let points = 0;
    switch (eliminatedPiece.type) {
      case 'p': points = 2; break;
      case 'n': case 'b': points = 4; break;
      default: points = 0;
    }

    console.log(`Blast: Adding ${points} points for ${eliminatedPiece.type}`);    if (points > 0) {
      if (playerColor === 'w') {
        gameContext.score1 += points;
        const score1El = document.getElementById('score1');
        if (score1El) score1El.textContent = gameContext.score1;
        
        console.log(`Blast: White score now ${gameContext.score1}, threshold ${gameContext.nextThresholdWhite}`);
        
        // CORREGIDO: Usar while loop para otorgar múltiples PowerUps
        let powerUpsGranted = 0;
        while (gameContext.score1 >= gameContext.nextThresholdWhite) {
          this.grantNewPowerUp(gameContext, 'w');
          powerUpsGranted++;
          gameContext.nextThresholdWhite += 5;
        }
        
        if (powerUpsGranted > 0) {
          console.log(`Blast: Granted ${powerUpsGranted} PowerUp(s) to white`);
        }
      } else {
        gameContext.score2 += points;
        const score2El = document.getElementById('score2');
        if (score2El) score2El.textContent = gameContext.score2;
        
        console.log(`Blast: Black score now ${gameContext.score2}, threshold ${gameContext.nextThresholdBlack}`);
        
        // CORREGIDO: Usar while loop para otorgar múltiples PowerUps
        let powerUpsGranted = 0;
        while (gameContext.score2 >= gameContext.nextThresholdBlack) {
          this.grantNewPowerUp(gameContext, 'b');
          powerUpsGranted++;
          gameContext.nextThresholdBlack += 5;
        }
        
        if (powerUpsGranted > 0) {
          console.log(`Blast: Granted ${powerUpsGranted} PowerUp(s) to black`);
        }
      }
    }
  }

  /**
   * Otorga un nuevo power-up al jugador si alcanza el umbral.
   * @param {object} gameContext - The current game context.
   * @param {string} playerColor - Color del jugador.
   */
  grantNewPowerUp(gameContext, playerColor) {
    console.log('Blast: Attempting to grant new power-up to', playerColor);    if (gameContext.grantPowerUp && typeof gameContext.grantPowerUp === 'function') {
      try {
        // Usar el powerUpManager en lugar de array hardcodeado
        const randomType = getRandomPowerUpType();
        console.log('Blast: Selected random power-up:', randomType);
        
        if (randomType) {
          gameContext.grantPowerUp(playerColor, randomType);
          console.log('Blast: Successfully granted power-up');
        } else {
          console.warn('Blast: No random power-up type available');
        }
      } catch (error) {
        console.error('Blast: Error granting power-up:', error);
        // Fallback a método anterior si hay error
        const fallbackTypes = ['Fence', 'Pawn Range', 'Crazy King', 'Horizontal Portal', 'Blast'];
        const randomType = fallbackTypes[Math.floor(Math.random() * fallbackTypes.length)];
        gameContext.grantPowerUp(playerColor, randomType);
      }
    } else {
      console.warn('Blast: grantPowerUp function not available in gameContext');
    }
  }

  /**
   * Activa una animación visual para el efecto de Blast.
   * @param {object} gameContext - The current game context.
   * @param {number} row - Fila del objetivo.
   * @param {number} col - Columna del objetivo.
   */  triggerBlastAnimation(gameContext, row, col) {
    console.log(`Blast: Triggering animation at (${row}, ${col})`);
    
    const { boardElement } = gameContext;
    if (!boardElement) {
      console.warn('Blast: No boardElement available for animation');
      return;
    }

    // Buscar la celda objetivo
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) {
      console.warn(`Blast: Target cell not found at (${row}, ${col})`);
      return;
    }    // Crear elemento de animación
    const blastEffect = document.createElement('div');
    blastEffect.className = 'blast-animation';
    blastEffect.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-image: url('/images/powerupblastanimation.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      animation: blastEffect 1.5s ease-out;
      pointer-events: none;
      z-index: 9999;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#blast-animation-style')) {
      const style = document.createElement('style');
      style.id = 'blast-animation-style';
      style.textContent = `        @keyframes blastEffect {
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
      `;
      document.head.appendChild(style);
      console.log('Blast: Added animation styles');
    }    // Agregar animación al contenedor principal para evitar z-index issues
    const gameContainer = boardElement.parentElement || document.body;
    gameContainer.appendChild(blastEffect);

    // Remover la animación después de completarse
    setTimeout(() => {
      if (blastEffect.parentNode) {
        blastEffect.parentNode.removeChild(blastEffect);
        console.log('Blast: Animation removed');
      }
    }, 1500);

    console.log(`Blast animation triggered at (${row}, ${col})`);
  }
}