export class PowerUpBase {
  constructor(name, description, requiresTarget = false, duration = 0, uiIcon = null) {
    if (this.constructor === PowerUpBase) {
      throw new Error("Cannot instantiate abstract class PowerUpBase directly.");
    }
    this.name = name;
    this.description = description;
    this.requiresTarget = requiresTarget;
    this.duration = duration; // Number of turns the power-up lasts, 0 for instant
    this.uiIcon = uiIcon;
    this.id = `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID for tracking active instances
  }

  /**
   * Checks if the power-up can be activated.
   * @param {object} gameContext - The current game context.
   * @param {string} playerColor - 'w' for white, 'b' for black.
   * @returns {boolean}
   */
  canActivate(gameContext, playerColor) {
    return true; // Default: can always be activated
  }

  /**
   * Activates the power-up's effect.
   * @param {object} gameContext - The current game context.
   * @param {string} playerColor - 'w' for white, 'b' for black.
   * @param {object} [targetData=null] - Optional data about the target (e.g., { row, col }).
   * @returns {boolean} - True if activation was successful, false otherwise
   */
  activate(gameContext, playerColor, targetData = null) {
    throw new Error(`Method 'activate()' must be implemented in subclass ${this.constructor.name}.`);
  }

  /**
   * Called at the beginning of each turn for active, duration-based power-ups.
   * @param {object} gameContext - The current game context.
   * @param {object} activePowerUpInstance - The specific instance of this power-up that is active.
   */
  onTurnStart(gameContext, activePowerUpInstance) {
    if (activePowerUpInstance.remainingDuration > 0) {
      activePowerUpInstance.remainingDuration--;
      if (activePowerUpInstance.remainingDuration === 0) {
        this.deactivate(gameContext, activePowerUpInstance);
      }
    }
  }

  /**
   * Deactivates the power-up's effect (e.g., when duration expires).
   * @param {object} gameContext - The current game context.
   * @param {object} activePowerUpInstance - The specific instance of this power-up that is active.
   */
  deactivate(gameContext, activePowerUpInstance) {
    console.log(`${this.name} (ID: ${activePowerUpInstance.id}) has expired.`);
    // Remove from active power-ups list in gameContext
    gameContext.activePowerUps = gameContext.activePowerUps.filter(p => p.id !== activePowerUpInstance.id);
    gameContext.renderBoard(); // Re-render to remove any visual effects
  }


  onActivationComplete(gameContext, playerColor, activeInstanceData) {
    console.log(`${this.name} (ID: ${activeInstanceData.id}) used by ${playerColor}.`);
    if (this.duration > 0) {
        // Add to a list of active power-ups in gameContext for turn-based effects
        if (!gameContext.activePowerUps) {
            gameContext.activePowerUps = [];
        }
        gameContext.activePowerUps.push(activeInstanceData);
    }
  }
}