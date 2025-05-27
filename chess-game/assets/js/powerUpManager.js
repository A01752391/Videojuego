import { FencePowerUp } from './powerups/FencePowerUp.js';
import { PawnRangePowerUp } from './powerups/PawnRangePowerUp.js';
import { CrazyKingPowerUp } from './powerups/CrazyKingPowerUp.js';
import { HorizontalPortalPowerUp } from './powerups/HorizontalPortalPowerUp.js';
import { BlastPowerUp } from './powerups/BlastPowerUp.js';
import { ShieldPowerUp } from './powerups/ShieldPowerUp.js';
import { CagePowerUp } from './powerups/CagePowerUp.js';
import { ExtraMovePowerUp } from './powerups/ExtraMovePowerUp.js';
import { EvolutionPowerUp } from './powerups/EvolutionPowerUp.js'; 
import { ReducerPowerUp } from './powerups/ReducerPowerUp.js';

const powerUpBlueprints = {
  'Fence': FencePowerUp,
  'Pawn Range': PawnRangePowerUp,
  'Crazy King': CrazyKingPowerUp,
  'Horizontal Portal': HorizontalPortalPowerUp,
  'Blast': BlastPowerUp,
  'Shield': ShieldPowerUp,
  'Cage': CagePowerUp,
  'Extra Move': ExtraMovePowerUp,
  'Evolution': EvolutionPowerUp, 
  'Reducer': ReducerPowerUp,
  
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
 * Gets a random power-up type.
 * @returns {string} - Random power-up type name.
 */
export function getRandomPowerUpType() {
  const types = getAvailablePowerUpTypes();
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
}

/**
 * Validates if a power-up type exists.
 * @param {string} type - The power-up type to validate.
 * @returns {boolean} - True if the type exists, false otherwise.
 */
export function isValidPowerUpType(type) {
  return powerUpBlueprints.hasOwnProperty(type);
}

/**
 * Gets power-up information without creating an instance.
 * @param {string} type - The power-up type.
 * @returns {object|null} - Power-up info object or null if invalid.
 */
export function getPowerUpInfo(type) {
  const PowerUpClass = powerUpBlueprints[type];
  if (PowerUpClass) {
    // Create a temporary instance to get the info
    const tempInstance = new PowerUpClass();
    return {
      name: tempInstance.name,
      description: tempInstance.description,
      requiresTarget: tempInstance.requiresTarget,
      duration: tempInstance.duration,
      uiIcon: tempInstance.uiIcon
    };
  }
  return null;
}

/**
 * Gets all power-up information for UI display.
 * @returns {object} - Object with all power-up types and their info.
 */
export function getAllPowerUpInfo() {
  const allInfo = {};
  const types = getAvailablePowerUpTypes();
  
  types.forEach(type => {
    allInfo[type] = getPowerUpInfo(type);
  });
  
  return allInfo;
}