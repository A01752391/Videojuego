import { PowerUpBase } from './PowerUpBase.js';

export class CrazyKingPowerUp extends PowerUpBase {
    constructor() {
        // Name, Description, Requires Target, Duration (3 turns)
        super("Crazy King", "Tu rey se mueve como una reina durante 3 turnos.", false, 3);
    }

    // Activate the power-up
    activate(gameContext, playerColor) {
    const isAlreadyActive = gameContext.activePowerUps?.some(
        powerUp => powerUp.type === "Crazy King" && powerUp.placedBy === playerColor
    );
    if (isAlreadyActive) return false;

    const activeInstanceData = {
        id: this.id,
        type: this.name,
        placedBy: playerColor,
        remainingDuration: this.duration // 3 turns
    };

    gameContext.messageElement.textContent = 
        `¡${playerColor === 'w' ? 'Blancas' : 'Negras'} activaron Crazy King! Su rey se mueve como reina por 3 turnos.`;

    // Find and highlight the king
    this.triggerCrazyKingAnimation(gameContext, playerColor);

    super.onActivationComplete(gameContext, playerColor, activeInstanceData);
    gameContext.renderBoard();
    return true;
    }

    // Deactivate the power-up when remainingDuration is at 0
    deactivate(gameContext, activePowerUpInstance) {
        gameContext.messageElement.textContent = 
        `¡El efecto Crazy King de ${activePowerUpInstance.placedBy === 'w' ? 'Blancas' : 'Negras'} ha terminado!`;
        super.deactivate(gameContext, activePowerUpInstance);
    }

    /**
     * Triggers an animation specifically on the king piece to show its enhanced power
     * @param {object} gameContext - The current game context
     * @param {string} playerColor - The color of the player ('w' or 'b')
     */    triggerCrazyKingAnimation(gameContext, playerColor) {
        const { boardElement, board } = gameContext;
        if (!boardElement || !board) return;

        // Find the king of the activating player
        let kingRow = -1, kingCol = -1;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece && piece.type === 'k' && piece.color === playerColor) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
            if (kingRow !== -1) break;
        }

        if (kingRow === -1) return; // King not found

        const kingCell = boardElement.querySelector(`[data-row="${kingRow}"][data-col="${kingCol}"]`);
        if (!kingCell) return;        // Crear efecto de transformación
        const transformEffect = document.createElement('div');
        transformEffect.className = 'crazy-king-transform';
        transformEffect.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background-image: url('/images/powerupcrazykinganimation.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          animation: crazyKingTransform 1.2s ease-out;
          pointer-events: none;
          z-index: 9999;
        `;

        // Agregar CSS de animación si no existe
        if (!document.querySelector('#crazy-king-animation-style')) {
          const style = document.createElement('style');
          style.id = 'crazy-king-animation-style';
          style.textContent = `            @keyframes crazyKingTransform {
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
            
            @keyframes crazyKingGlow {
              0% { 
                box-shadow: 0 0 5px rgba(138, 43, 226, 0.5);
              }
              50% { 
                box-shadow: 0 0 20px rgba(138, 43, 226, 1), 0 0 30px rgba(138, 43, 226, 0.7);
              }
              100% { 
                box-shadow: 0 0 5px rgba(138, 43, 226, 0.5);
              }
            }
          `;
          document.head.appendChild(style);
        }        // Agregar efecto de resplandor al tablero
        boardElement.style.animation = 'crazyKingGlow 1.2s ease-out';
        boardElement.style.position = 'relative';
        
        // Agregar la animación al contenedor principal para evitar z-index issues
        const gameContainer = boardElement.parentElement || document.body;
        gameContainer.appendChild(transformEffect);

        // Remover efectos después de la animación
        setTimeout(() => {
          if (transformEffect.parentNode) {
            transformEffect.parentNode.removeChild(transformEffect);
          }          boardElement.style.animation = '';
        }, 1200);
    }
}