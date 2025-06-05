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
   * Triggers a radial illumination effect when the power-up is activated
   * @param {object} gameContext - The current game context
   * @param {number} row - Target row (optional)
   * @param {number} col - Target column (optional)
   * @param {string} effectType - Type of effect for different colors
   */
triggerRadialIllumination(gameContext, row = null, col = null, effectType = 'default') {
  console.log('triggerRadialIllumination called:', { row, col, effectType });
  
  const { boardElement } = gameContext;
  if (!boardElement) {
    console.warn('No boardElement found');
    return;
  }

  let targetCell = null;
  
  if (row !== null && col !== null) {
    // Target-specific illumination
    targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    console.log('Target cell found:', !!targetCell);
  } else {
    // Board-wide illumination effect
    const allCells = boardElement.querySelectorAll('[data-row][data-col]');
    console.log('Applying to all cells:', allCells.length);
    allCells.forEach(cell => {
      this.applyCellIllumination(cell, effectType);
    });
    return;
  }

  if (targetCell) {
    console.log('Applying illumination to target cell');
    this.applyCellIllumination(targetCell, effectType);
  } else {
    console.warn('Target cell not found for row:', row, 'col:', col);
  }
}

  /**
   * Applies illumination effect to a specific cell
   */
  applyCellIllumination(cell, effectType) {
  console.log('applyCellIllumination:', effectType, cell);
  
  // Remove any existing illumination
  cell.classList.remove('powerup-radial-effect', 'blast', 'shield', 'cage', 'default');
  
  // Add the new illumination effect
  cell.classList.add('powerup-radial-effect', effectType);
  console.log('Classes added:', cell.className);
  
  // Remove the effect after animation completes
  setTimeout(() => {
    cell.classList.remove('powerup-radial-effect', effectType);
    console.log('Animation classes removed');
  }, 1500);
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
    
    // Track powerup usage in game statistics
    if (gameContext.gameStats) {
        if (playerColor === 'w') {
            gameContext.gameStats.white.powerupsUsed++;
        } else if (playerColor === 'b') {
            gameContext.gameStats.black.powerupsUsed++;
        }
    }
    
    if (this.duration > 0) {
        // Add to a list of active power-ups in gameContext for turn-based effects
        if (!gameContext.activePowerUps) {
            gameContext.activePowerUps = [];
        }
        gameContext.activePowerUps.push(activeInstanceData);
    }
  }
}