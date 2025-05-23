import { FencePowerUp } from './powerups/FencePowerUp.js';
import { PawnRangePowerUp } from './powerups/PawnRangePowerUp.js';

// Import other power-up classes here as you create them
// import { ExtraMovePowerUp } from './powerups/ExtraMovePowerUp.js';

const powerUpBlueprints = {
  Fence: FencePowerUp,
  'Pawn Range': PawnRangePowerUp,
  // ExtraMove: ExtraMovePowerUp,
  // Add other power-up classes here
};

/**
 * Creates a new instance of a power-up.
 * This is important if power-ups have instance-specific state (like unique IDs or timers).
 * @param {string} powerUpType - The type/name of the power-up (e.g., "Fence").
 * @returns {PowerUpBase|null} A new instance of the power-up class, or null if type not found.
 */
export function createPowerUpInstance(powerUpType) {
  const PowerUpClass = powerUpBlueprints[powerUpType];
  if (PowerUpClass) {
    return new PowerUpClass();
  }
  console.error(`PowerUp type "${powerUpType}" not found.`);
  return null;
}

/**
 * Gets a list of all available power-up types (names).
 * Useful for randomly granting power-ups.
 * @returns {string[]}
 */
export function getAvailablePowerUpTypes() {
  return Object.keys(powerUpBlueprints);
}