import { PowerUpBase } from './PowerUpBase.js';

export class PawnRangePowerUp extends PowerUpBase {
  constructor() {
    // Name, Description, Requires Target, Duration (0 = all)
    super("Pawn Range", "Tus peones avanzan 2 casillas en lugar de 1 durante toda la ronda.", false, 0);
  }

  // Activate the power-up: set a flag in gameContext
  activate(gameContext, playerColor) {
    if (!gameContext.pawnRangeActive) {
        gameContext.pawnRangeActive = {};
    }
    gameContext.pawnRangeActive[playerColor] = true; // Active for the current player

    gameContext.messageElement.textContent = 
        `¡${playerColor === 'w' ? 'Blancas' : 'Negras'} activaron Pawn Range! Sus peones avanzarán 2 casillas.`;
    
    // Trigger board-wide animation to highlight pawn enhancement
    this.triggerPawnRangeAnimation(gameContext);
    
    super.onActivationComplete(gameContext, playerColor, { id: this.id });
    gameContext.renderBoard();
    return true;
    }

  // Deactivate the power-up at the end of the round with resetGame
  deactivate(gameContext, activePowerUpInstance) {
    super.deactivate(gameContext, activePowerUpInstance);
  }

  /**
   * Triggers a board-wide animation when pawn range is activated
   */  triggerPawnRangeAnimation(gameContext) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Crear efecto de transformación
    const transformEffect = document.createElement('div');
    transformEffect.className = 'pawn-range-transform';    transformEffect.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-image: url('/images/poweruppawnrangeanimation.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;      animation: pawnRangeTransform 1.2s ease-out;
      pointer-events: none;
      z-index: 9999;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#pawn-range-animation-style')) {
      const style = document.createElement('style');
      style.id = 'pawn-range-animation-style';
      style.textContent = `        @keyframes pawnRangeTransform {
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
        
        @keyframes pawnGlow {
          0% { 
            box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.7);
          }
          100% { 
            box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          }
        }
      `;
      document.head.appendChild(style);
    }    // Agregar efecto de resplandor al tablero
    boardElement.style.animation = 'pawnGlow 3s ease-out';
    boardElement.style.position = 'relative';
    
    // Agregar la animación al body o un contenedor superior para evitar z-index issues
    const gameContainer = boardElement.parentElement || document.body;
    gameContainer.appendChild(transformEffect);

    // Remover efectos después de la animación
    setTimeout(() => {
      if (transformEffect.parentNode) {
        transformEffect.parentNode.removeChild(transformEffect);
      }      boardElement.style.animation = '';
    }, 1200);
  }
}