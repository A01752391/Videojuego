import { PowerUpBase } from './PowerUpBase.js';

export class ExtraMovePowerUp extends PowerUpBase {
  constructor() {
    super(
      'Extra Move',
      'Permite realizar 2 movimientos en el mismo turno.',
      false, // No requiere target
      0, // Efecto instantáneo
      '🚀' // uiIcon
    );
  }

  /**
   * Verifica si el power-up puede ser activado.
   */
  canActivate(gameContext, playerColor) {
    // Verificar que no esté ya usando extra move
    if (gameContext.extraMoveActive) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Ya tienes Extra Move activo.";
      }
      return false;
    }

    return true;
  }

  /**
   * Activa el power-up Extra Move.
   */
  activate(gameContext, playerColor, targetData = null) {
    if (!this.canActivate(gameContext, playerColor)) {
      return false;
    }

    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';

    // Mostrar mensaje de activación
    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = `¡${playerColorName} activan Extra Move! Puedes hacer 2 movimientos.`;
    }

    // Configurar el estado de extra move
    gameContext.extraMoveActive = true;
    gameContext.extraMovesRemaining = 2;
    gameContext.extraMovePlayer = playerColor;    // Activar animación visual
    this.triggerExtraMoveAnimation(gameContext);

    // Track usage statistics
    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: 0 // Instant effect
    };
    
    this.onActivationComplete(gameContext, playerColor, activeInstanceData);

    return true;
  }

  /**
   * Procesa un movimiento durante Extra Move
   */
  static processExtraMove(gameContext) {
    if (!gameContext.extraMoveActive) return false;

    gameContext.extraMovesRemaining--;

    if (gameContext.extraMovesRemaining <= 0) {
      // Terminar Extra Move
      gameContext.extraMoveActive = false;
      gameContext.extraMovePlayer = null;
      
      // Cambiar turno al oponente
      const opponentColor = gameContext.currentColor === 'w' ? 'b' : 'w';
      gameContext.currentColor = opponentColor;
      
      if (gameContext.messageElement) {
        const opponentColorName = opponentColor === 'w' ? 'Blancas' : 'Negras';
        gameContext.messageElement.textContent = `Extra Move terminado. Turno de ${opponentColorName}.`;
      }
      
      return true; // Cambió de turno
    } else {
      // Continuar con el mismo jugador
      if (gameContext.messageElement) {
        const currentColorName = gameContext.currentColor === 'w' ? 'Blancas' : 'Negras';
        gameContext.messageElement.textContent = `${currentColorName}: te queda 1 movimiento más.`;
      }
      
      return false; // No cambió de turno
    }
  }

  /**
   * Activa una animación visual para el efecto de Extra Move.
   */  triggerExtraMoveAnimation(gameContext) {
    const { boardElement } = gameContext;
    if (!boardElement) return;    // Crear efecto de animación
    const extraMoveEffect = document.createElement('div');
    extraMoveEffect.className = 'extra-move-animation';
    extraMoveEffect.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-image: url('/images/powerupextramoveanimation.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      animation: extraMoveEffect 1.2s ease-out;
      pointer-events: none;
      z-index: 9999;
    `;

    // Agregar CSS de animación
    if (!document.querySelector('#extra-move-animation-style')) {
      const style = document.createElement('style');
      style.id = 'extra-move-animation-style';
      style.textContent = `        @keyframes extraMoveEffect {
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
    }

    // Agregar la animación al contenedor principal para evitar z-index issues
    const gameContainer = boardElement.parentElement || document.body;
    gameContainer.appendChild(extraMoveEffect);

    // Remover la animación
    setTimeout(() => {
      if (extraMoveEffect.parentNode) {
        extraMoveEffect.parentNode.removeChild(extraMoveEffect);
      }
    }, 1200);
  }
}