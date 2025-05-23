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
    
    super.onActivationComplete(gameContext, playerColor, { id: this.id });
    gameContext.renderBoard();
    return true;
    }

  // Deactivate the power-up at the end of the round with resetGame
  deactivate(gameContext, activePowerUpInstance) {
    super.deactivate(gameContext, activePowerUpInstance);
  }
}