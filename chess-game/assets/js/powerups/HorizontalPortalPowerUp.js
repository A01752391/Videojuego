import { PowerUpBase } from './PowerUpBase.js';

export class HorizontalPortalPowerUp extends PowerUpBase {
  constructor() {
    super("Horizontal Portal", "Torres y reinas pueden teletransportarse horizontalmente durante 3 turnos.", false, 3);
  }

  /**
   * Verifica si el power-up puede activarse.
   */
  canActivate(gameContext, playerColor) {
    const playerPieces = this.getPlayerRooksAndQueens(gameContext, playerColor);
    
    if (playerPieces.length === 0) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "No tienes torres o reinas para usar el portal.";
      }
      return false;
    }

    return true;
  }

  /**
   * Activa el power-up Horizontal Portal.
   */
  activate(gameContext, playerColor, targetData = null) {
    if (!this.canActivate(gameContext, playerColor)) {
      return false;
    }

    // Activar el portal horizontal en todas las torres y reinas del jugador
    this.activatePortalOnPieces(gameContext, playerColor);

    // Mostrar mensaje de activación
    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';
    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = `¡${playerColorName} activan Portal Horizontal! Torres y reinas pueden moverse horizontalmente por 3 turnos.`;
    }

    // Activar animación visual del portal
    this.triggerPortalAnimation(gameContext);

    // Track usage statistics
    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: 3
    };
    
    this.onActivationComplete(gameContext, playerColor, activeInstanceData);

    return true;
  }

  /**
   * Obtiene todas las torres y reinas del jugador.
   */
  getPlayerRooksAndQueens(gameContext, playerColor) {
    const pieces = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameContext.board[row][col];
        if (piece && (piece.type === 'r' || piece.type === 'q') && piece.color === playerColor) {
          pieces.push({ row, col, piece });
        }
      }
    }
    
    return pieces;
  }

  /**
   * Activa el portal en las piezas del jugador.
   */
  activatePortalOnPieces(gameContext, playerColor) {
    const pieces = this.getPlayerRooksAndQueens(gameContext, playerColor);
    
    pieces.forEach(({ row, col, piece }) => {
      // Marcar la pieza como afectada por el portal
      if (!piece.activeEffects) {
        piece.activeEffects = [];
      }
      piece.activeEffects.push({
        type: 'horizontal_portal',
        duration: 3,
        source: this.id
      });
    });
  }

  /**
   * Activa animación de portal cuando se usa el powerup.
   */  triggerPortalAnimation(gameContext) {
    const { boardElement } = gameContext;
    if (!boardElement) return;    // Crear efecto de transformación
    const transformEffect = document.createElement('div');
    transformEffect.className = 'portal-transform';
    transformEffect.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-image: url('/images/poweruphorizontalportalicon.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;      animation: portalTransform 1.2s ease-out;
      pointer-events: none;
      z-index: 9999;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#portal-animation-style')) {
      const style = document.createElement('style');
      style.id = 'portal-animation-style';
      style.textContent = `        @keyframes portalTransform {
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
        
        @keyframes portalGlow {
          0% { 
            box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(0, 255, 255, 1), 0 0 30px rgba(0, 255, 255, 0.7);
          }
          100% { 
            box-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
          }
        }
      `;
      document.head.appendChild(style);
    }    // Agregar efecto de resplandor al tablero
    boardElement.style.animation = 'portalGlow 1.2s ease-out';
    boardElement.style.position = 'relative';
    
    // Agregar la animación al contenedor principal para evitar z-index issues
    const gameContainer = boardElement.parentElement || document.body;
    gameContainer.appendChild(transformEffect);

    // Remover efectos después de la animación
    setTimeout(() => {
      if (transformEffect.parentNode) {
        transformEffect.parentNode.removeChild(transformEffect);
      }      boardElement.style.animation = '';
    }, 1200);
  }

  /**
   * Desactiva el power-up cuando se agota la duración.
   */
  deactivate(gameContext, activePowerUpInstance) {
    const playerColorName = activePowerUpInstance.placedBy === 'w' ? 'Blancas' : 'Negras';
    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = `¡El efecto Horizontal Portal de ${playerColorName} ha terminado!`;
    }
    super.deactivate(gameContext, activePowerUpInstance);
  }
}