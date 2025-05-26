import { FencePowerUp } from './powerups/FencePowerUp.js';
import { PawnRangePowerUp } from './powerups/PawnRangePowerUp.js';
import { CrazyKingPowerUp } from './powerups/CrazyKingPowerUp.js';
import { HorizontalPortalPowerUp } from './powerups/HorizontalPortalPowerUp.js';
import { BlastPowerUp } from './powerups/BlastPowerUp.js';

// Import other power-up classes here as you create them
// import { ExtraMovePowerUp } from './powerups/ExtraMovePowerUp.js';

const powerUpBlueprints = {
  'Fence': FencePowerUp,
  'Pawn Range': PawnRangePowerUp,
  'Crazy King': CrazyKingPowerUp,
  'Horizontal Portal': HorizontalPortalPowerUp,
  'Blast': BlastPowerUp,
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

/**
 * Gets information about a specific power-up type without creating an instance.
 * Useful for displaying power-up descriptions in UI.
 * @param {string} powerUpType - The type/name of the power-up.
 * @returns {object|null} Object with power-up info, or null if type not found.
 */
export function getPowerUpInfo(powerUpType) {
  const PowerUpClass = powerUpBlueprints[powerUpType];
  if (PowerUpClass) {
    const tempInstance = new PowerUpClass();
    return {
      name: tempInstance.name,
      description: tempInstance.description,
      requiresTarget: tempInstance.requiresTarget,
      duration: tempInstance.duration,
      uiIcon: tempInstance.uiIcon
    };
  }
  console.error(`PowerUp type "${powerUpType}" not found.`);
  return null;
}

/**
 * Validates if a power-up type exists in the system.
 * @param {string} powerUpType - The type/name of the power-up to validate.
 * @returns {boolean} True if the power-up type exists, false otherwise.
 */
export function isValidPowerUpType(powerUpType) {
  return powerUpBlueprints.hasOwnProperty(powerUpType);
}

/**
 * Gets a random power-up type from the available ones.
 * @param {string[]} [excludeTypes=[]] - Array of power-up types to exclude from selection.
 * @returns {string|null} Random power-up type name, or null if none available.
 */
export function getRandomPowerUpType(excludeTypes = []) {
  const availableTypes = getAvailablePowerUpTypes().filter(type => !excludeTypes.includes(type));
  
  if (availableTypes.length === 0) {
    console.warn("No power-up types available after exclusions.");
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * availableTypes.length);
  return availableTypes[randomIndex];
}

/**
 * Gets all power-up types that require targeting.
 * @returns {string[]} Array of power-up type names that require target selection.
 */
export function getTargetingPowerUpTypes() {
  return getAvailablePowerUpTypes().filter(type => {
    const info = getPowerUpInfo(type);
    return info && info.requiresTarget;
  });
}

/**
 * Gets all power-up types that have duration (are not instant).
 * @returns {string[]} Array of power-up type names that have duration.
 */
export function getDurationPowerUpTypes() {
  return getAvailablePowerUpTypes().filter(type => {
    const info = getPowerUpInfo(type);
    return info && info.duration > 0;
  });
}

/**
 * Gets all power-up types that are instant (no duration).
 * @returns {string[]} Array of power-up type names that are instant.
 */
export function getInstantPowerUpTypes() {
  return getAvailablePowerUpTypes().filter(type => {
    const info = getPowerUpInfo(type);
    return info && info.duration === 0;
  });
}