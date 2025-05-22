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
    
    super.onActivationComplete(gameContext, playerColor, fenceInstanceData);
    gameContext.renderBoard(); // Re-render to show the fence
    return true; // Activation successful
  }

  // Override deactivate to remove the specific fence from the board
  deactivate(gameContext, activePowerUpInstance) {
    gameContext.fencedTiles = gameContext.fencedTiles.filter(tile => tile.id !== activePowerUpInstance.id);
    gameContext.messageElement.textContent = `La valla en ${activePowerUpInstance.row},${activePowerUpInstance.col} ha desaparecido.`;
    super.deactivate(gameContext, activePowerUpInstance); // Calls renderBoard
  }
}