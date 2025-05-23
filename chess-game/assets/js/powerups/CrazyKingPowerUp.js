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
}