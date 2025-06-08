import { PowerUpBase } from './PowerUpBase.js';

export class FencePowerUp extends PowerUpBase {
  constructor() {
    // Name, Description, Requires Target, Duration (in turns)
    super("Fence", "Blocks one tile of the board, making it inaccessible for 3 turns.", true, 3);
  }

  canActivate(gameContext, playerColor, targetData) {
    if (!targetData || targetData.row === undefined || targetData.col === undefined) {
        // This check might be better suited for the UI or pre-activation logic
        // but can be a safeguard here.
        return true; // Allows targeting phase
    }
    const r = targetData.row;
    const c = targetData.col;

    // Cannot place a fence on an occupied square
    if (gameContext.board[r][c] !== null) {
      gameContext.messageElement.textContent = "No se puede colocar una valla en una casilla ocupada.";
      return false;
    }
    // Cannot place a fence on an already fenced square
    if (gameContext.fencedTiles && gameContext.fencedTiles.find(tile => tile.row === r && tile.col === c)) {
        gameContext.messageElement.textContent = "Esta casilla ya tiene una valla.";
        return false;
    }
    return super.canActivate(gameContext, playerColor);
  }

  activate(gameContext, playerColor, targetData) {
    if (!targetData || targetData.row === undefined || targetData.col === undefined) {
      gameContext.messageElement.textContent = "Error: Se requiere un objetivo para la Valla.";
      return false;
    }

    const r = targetData.row;
    const c = targetData.col;

    // Double check conditions here, though canActivate should have caught them
    if (gameContext.board[r][c] !== null) {
      gameContext.messageElement.textContent = "No se puede colocar una valla en una casilla ocupada.";
      return false;
    }
    if (gameContext.fencedTiles && gameContext.fencedTiles.find(tile => tile.row === r && tile.col === c)) {
        gameContext.messageElement.textContent = "Esta casilla ya tiene una valla.";
        return false;
    }

    const fenceInstanceData = {
        id: this.id, // Unique ID for this specific fence
        type: this.name,
        row: r,
        col: c,
        placedBy: playerColor,
        remainingDuration: this.duration 
    };

    if (!gameContext.fencedTiles) {
      gameContext.fencedTiles = [];
    }
    gameContext.fencedTiles.push(fenceInstanceData);

    gameContext.messageElement.textContent = `¡Valla colocada en ${r},${c} por ${playerColor === 'w' ? 'Blancas' : 'Negras'}! Durará ${this.duration} turnos.`;
    
    // Trigger radial illumination effect
    this.triggerRadialIllumination(gameContext, r, c, 'fence');
      // Trigger fence placement animation
    this.triggerFencePlacementAnimation(gameContext, r, c);
    
    super.onActivationComplete(gameContext, playerColor, fenceInstanceData);
    
    // Delay board render to allow animation to play
    setTimeout(() => {
      gameContext.renderBoard(); // Re-render to show the fence
    }, 100); // Small delay to allow animation to start
    
    return true; // Activation successful
  }

  /**
   * Triggers a placement animation when a fence is placed
   */
  triggerFencePlacementAnimation(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    // Find the target cell
    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;

    // Create placement animation element
    const placementEffect = document.createElement('div');
    placementEffect.className = 'fence-placement-animation';
    placementEffect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      width: 80%;
      height: 80%;
      background-image: url('/images/powerupfenceicon.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0;
      pointer-events: none;
      z-index: 1000;
      animation: fencePlacement 0.8s ease-out forwards;
    `;

    // Add CSS animation if it doesn't exist
    if (!document.querySelector('#fence-placement-style')) {
      const style = document.createElement('style');
      style.id = 'fence-placement-style';
      style.textContent = `
        @keyframes fencePlacement {
          0% { 
            transform: translate(-50%, -50%) scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2) rotate(-90deg);
            opacity: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Add the animation element to the cell
    targetCell.style.position = 'relative';
    targetCell.appendChild(placementEffect);

    // Remove the animation after it completes
    setTimeout(() => {
      if (placementEffect.parentNode) {
        placementEffect.remove();
      }
    }, 800);
  }

  // Override deactivate to remove the specific fence from the board
  deactivate(gameContext, activePowerUpInstance) {
    gameContext.fencedTiles = gameContext.fencedTiles.filter(tile => tile.id !== activePowerUpInstance.id);
    gameContext.messageElement.textContent = `La valla en ${activePowerUpInstance.row},${activePowerUpInstance.col} ha desaparecido.`;
    super.deactivate(gameContext, activePowerUpInstance); // Calls renderBoard
  }
}