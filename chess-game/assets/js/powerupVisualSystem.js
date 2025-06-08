/**
 * Sistema visual de powerups - maneja iconos y animaciones
 */

/**
 * Configuración de los powerups visuales
 */
const POWERUP_VISUAL_CONFIG = {
    // Iconos que se muestran como overlay sobre piezas
    icons: {        'Fence': {
            image: '/images/powerupfenceicon.png',
            size: '25px',
            position: 'top-right',
            showOnPiece: false, // Se muestra en la casilla, no en la pieza
            showOnCell: true
        },        'Cage': {
            image: '/images/powerupcageicon.png',
            size: '30px',
            position: 'center',
            showOnPiece: true,
            showOnCell: false
        },        'Shield': {
            image: '/images/powerupshieldicon.png',
            size: '80%',
            position: 'center',
            showOnPiece: true,
            showOnCell: false
        },
        'Horizontal Portal': {
            image: '/images/poweruphorizontalportalicon.png',
            size: '25px',
            position: 'bottom-right',
            showOnPiece: true,
            showOnCell: false
        }
    },
    
    // Animaciones que se ejecutan al usar powerups
    animations: {        'Blast': {
            image: '/images/powerupblastanimation.png',
            duration: 1500,
            size: '60px',
            effect: 'explosion'
        },
        'Crazy King': {
            image: '/images/powerupcrazykinganimation.png',
            duration: 2000,
            size: '50px',
            effect: 'glow'
        },
        'Evolution': {
            image: '/images/powerupevolutionanimation.png',
            duration: 2500,
            size: '55px',
            effect: 'transform'
        },
        'Extra Move': {
            image: '/images/powerupextramoveanimation.png',
            duration: 1800,
            size: '45px',
            effect: 'speed'
        },
        'Pawn Range': {
            image: '/images/poweruppawnrangeanimation.png',
            duration: 2000,
            size: '40px',
            effect: 'range'
        },
        'Swap': {
            image: '/images/powerupswapanimation.png',
            duration: 2200,
            size: '50px',
            effect: 'swap'
        }
    }
};

/**
 * Clase principal del sistema visual de powerups
 */
export class PowerupVisualSystem {
    constructor() {
        this.activeIcons = new Map(); // Mapeo de posición a icono activo
        this.animationQueue = []; // Cola de animaciones pendientes
        this.setupStyles();
    }

    /**
     * Configura los estilos CSS necesarios para el sistema visual
     */
    setupStyles() {
        if (document.getElementById('powerup-visual-styles')) return;

        const style = document.createElement('style');
        style.id = 'powerup-visual-styles';
        style.textContent = `
            /* Estilos para iconos de powerup */
            .powerup-icon {
                position: absolute;
                pointer-events: none;
                z-index: 10;
                border-radius: 50%;
                box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
                transition: all 0.3s ease;
            }

            .powerup-icon.top-left {
                top: 2px;
                left: 2px;
            }

            .powerup-icon.top-right {
                top: 2px;
                right: 2px;
            }

            .powerup-icon.bottom-left {
                bottom: 2px;
                left: 2px;
            }

            .powerup-icon.bottom-right {
                bottom: 2px;
                right: 2px;
            }

            .powerup-icon.center {
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            /* Estilos para animaciones de powerup */
            .powerup-animation {
                position: absolute;
                pointer-events: none;
                z-index: 15;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            /* Efectos específicos de animación */
            .powerup-animation.explosion {
                animation: powerup-explosion 1.5s ease-out forwards;
            }

            .powerup-animation.glow {
                animation: powerup-glow 2s ease-in-out forwards;
            }

            .powerup-animation.transform {
                animation: powerup-transform 2.5s ease-in-out forwards;
            }

            .powerup-animation.speed {
                animation: powerup-speed 1.8s ease-out forwards;
            }

            .powerup-animation.range {
                animation: powerup-range 2s ease-in-out forwards;
            }

            .powerup-animation.swap {
                animation: powerup-swap 2.2s ease-in-out forwards;
            }

            /* Keyframes para las animaciones */
            @keyframes powerup-explosion {
                0% { transform: translate(-50%, -50%) scale(0.1) rotate(0deg); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.2) rotate(180deg); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(2) rotate(360deg); opacity: 0; }
            }

            @keyframes powerup-glow {
                0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.7; filter: brightness(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; filter: brightness(1.5) hue-rotate(45deg); }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; filter: brightness(1); }
            }

            @keyframes powerup-transform {
                0% { transform: translate(-50%, -50%) scale(0.5) rotateY(0deg); opacity: 0.8; }
                33% { transform: translate(-50%, -50%) scale(1.3) rotateY(120deg); opacity: 1; }
                66% { transform: translate(-50%, -50%) scale(0.9) rotateY(240deg); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.1) rotateY(360deg); opacity: 0; }
            }

            @keyframes powerup-speed {
                0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.9; filter: blur(0px); }
                25% { transform: translate(-50%, -50%) scale(1) translateX(-10px); opacity: 1; filter: blur(1px); }
                50% { transform: translate(-50%, -50%) scale(1.1) translateX(10px); opacity: 1; filter: blur(2px); }
                75% { transform: translate(-50%, -50%) scale(1) translateX(-5px); opacity: 0.7; filter: blur(1px); }
                100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; filter: blur(0px); }
            }

            @keyframes powerup-range {
                0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0.8; }
                20% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                40% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.9; }
                60% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0; }
            }

            @keyframes powerup-swap {
                0% { transform: translate(-50%, -50%) scale(0.8) rotateZ(0deg); opacity: 0.9; }
                25% { transform: translate(-50%, -50%) scale(1.1) rotateZ(90deg); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(0.9) rotateZ(180deg); opacity: 1; }
                75% { transform: translate(-50%, -50%) scale(1.2) rotateZ(270deg); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(1) rotateZ(360deg); opacity: 0; }
            }

            /* Efectos de hover para iconos */
            .cell:hover .powerup-icon {
                transform: scale(1.1);
                filter: brightness(1.2);
            }

            /* Pulsación para iconos persistentes */
            .powerup-icon.persistent {
                animation: powerup-icon-pulse 3s ease-in-out infinite;
            }

            @keyframes powerup-icon-pulse {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.05); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Añade un icono de powerup a una casilla específica
     * @param {number} row - Fila de la casilla
     * @param {number} col - Columna de la casilla
     * @param {string} powerupType - Tipo de powerup
     * @param {HTMLElement} cellElement - Elemento de la casilla
     * @param {boolean} persistent - Si el icono debe tener animación persistente
     */
    addPowerupIcon(row, col, powerupType, cellElement, persistent = true) {
        const config = POWERUP_VISUAL_CONFIG.icons[powerupType];
        if (!config) {
            console.warn(`No icon configuration found for powerup: ${powerupType}`);
            return;
        }

        // Remover icono existente si hay uno
        this.removePowerupIcon(row, col, cellElement);

        const icon = document.createElement('img');
        icon.src = config.image;
        icon.className = `powerup-icon ${config.position}`;
        if (persistent) {
            icon.classList.add('persistent');
        }
        
        icon.style.width = config.size;
        icon.style.height = config.size;
        icon.dataset.powerupType = powerupType;
        icon.dataset.row = row;
        icon.dataset.col = col;

        cellElement.appendChild(icon);
        
        // Registrar el icono activo
        const key = `${row}-${col}`;
        if (!this.activeIcons.has(key)) {
            this.activeIcons.set(key, []);
        }
        this.activeIcons.get(key).push({
            element: icon,
            type: powerupType,
            persistent
        });

        // Añadir efecto de aparición
        icon.style.transform = `scale(0) ${config.position === 'center' ? 'translate(-50%, -50%)' : ''}`;
        icon.style.opacity = '0';
        
        setTimeout(() => {
            icon.style.transition = 'all 0.3s ease';
            icon.style.transform = `scale(1) ${config.position === 'center' ? 'translate(-50%, -50%)' : ''}`;
            icon.style.opacity = '1';
        }, 50);
    }

    /**
     * Remueve un icono de powerup de una casilla específica
     * @param {number} row - Fila de la casilla
     * @param {number} col - Columna de la casilla
     * @param {HTMLElement} cellElement - Elemento de la casilla
     * @param {string} powerupType - Tipo específico de powerup a remover (opcional)
     */
    removePowerupIcon(row, col, cellElement, powerupType = null) {
        const key = `${row}-${col}`;
        const activeIconsAtPosition = this.activeIcons.get(key);
        
        if (!activeIconsAtPosition) return;

        // Filtrar los iconos a remover
        const iconsToRemove = powerupType 
            ? activeIconsAtPosition.filter(icon => icon.type === powerupType)
            : [...activeIconsAtPosition];

        iconsToRemove.forEach(iconData => {
            const icon = iconData.element;
            
            // Animación de desaparición
            icon.style.transition = 'all 0.3s ease';
            icon.style.transform = 'scale(0)';
            icon.style.opacity = '0';
            
            setTimeout(() => {
                if (icon.parentNode) {
                    icon.parentNode.removeChild(icon);
                }
            }, 300);
        });

        // Actualizar el registro de iconos activos
        if (powerupType) {
            const remaining = activeIconsAtPosition.filter(icon => icon.type !== powerupType);
            if (remaining.length === 0) {
                this.activeIcons.delete(key);
            } else {
                this.activeIcons.set(key, remaining);
            }
        } else {
            this.activeIcons.delete(key);
        }
    }

    /**
     * Ejecuta una animación de powerup en una casilla específica
     * @param {number} row - Fila de la casilla
     * @param {number} col - Columna de la casilla
     * @param {string} powerupType - Tipo de powerup
     * @param {HTMLElement} cellElement - Elemento de la casilla
     * @param {Function} onComplete - Callback al completar la animación
     */
    playPowerupAnimation(row, col, powerupType, cellElement, onComplete = null) {
        const config = POWERUP_VISUAL_CONFIG.animations[powerupType];
        if (!config) {
            console.warn(`No animation configuration found for powerup: ${powerupType}`);
            if (onComplete) onComplete();
            return;
        }

        const animation = document.createElement('img');
        animation.src = config.image;
        animation.className = `powerup-animation ${config.effect}`;
        animation.style.width = config.size;
        animation.style.height = config.size;
        animation.dataset.powerupType = powerupType;

        cellElement.appendChild(animation);

        // Remover la animación después de que termine
        setTimeout(() => {
            if (animation.parentNode) {
                animation.parentNode.removeChild(animation);
            }
            if (onComplete) onComplete();
        }, config.duration);
    }

    /**
     * Actualiza los iconos de powerup basado en el estado actual del juego
     * @param {object} gameContext - Contexto del juego
     * @param {HTMLElement} boardElement - Elemento del tablero
     */
    updatePowerupIcons(gameContext, boardElement) {
        // Limpiar iconos existentes
        this.clearAllIcons(boardElement);

        if (!gameContext.activePowerUps) return;

        // Añadir iconos para powerups activos
        gameContext.activePowerUps.forEach(powerup => {
            const config = POWERUP_VISUAL_CONFIG.icons[powerup.type];
            if (!config) return;

            if (powerup.type === 'Fence') {
                // Para las vallas, mostrar en las casillas valladas
                if (gameContext.fencedTiles) {
                    gameContext.fencedTiles.forEach(fence => {
                        const cell = boardElement.querySelector(`[data-row="${fence.row}"][data-col="${fence.col}"]`);
                        if (cell) {
                            this.addPowerupIcon(fence.row, fence.col, 'Fence', cell);
                        }
                    });
                }
            } else if (powerup.targetRow !== undefined && powerup.targetCol !== undefined) {
                // Para powerups que afectan piezas específicas
                const cell = boardElement.querySelector(`[data-row="${powerup.targetRow}"][data-col="${powerup.targetCol}"]`);
                if (cell) {
                    this.addPowerupIcon(powerup.targetRow, powerup.targetCol, powerup.type, cell);
                }
            } else if (powerup.type === 'Horizontal Portal' || powerup.type === 'Crazy King') {
                // Para powerups que afectan todas las piezas del jugador
                const playerColor = powerup.placedBy;
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        const piece = gameContext.board[r][c];
                        if (piece && piece.color === playerColor) {
                            // Solo mostrar en torres y reinas para Horizontal Portal
                            if (powerup.type === 'Horizontal Portal' && (piece.type === 'r' || piece.type === 'q')) {
                                const cell = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                                if (cell) {
                                    this.addPowerupIcon(r, c, powerup.type, cell);
                                }
                            }
                            // Solo mostrar en reyes para Crazy King
                            else if (powerup.type === 'Crazy King' && piece.type === 'k') {
                                const cell = boardElement.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                                if (cell) {
                                    this.addPowerupIcon(r, c, powerup.type, cell);
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Limpia todos los iconos de powerup del tablero
     * @param {HTMLElement} boardElement - Elemento del tablero
     */
    clearAllIcons(boardElement) {
        const existingIcons = boardElement.querySelectorAll('.powerup-icon');
        existingIcons.forEach(icon => {
            icon.style.transition = 'all 0.2s ease';
            icon.style.transform = 'scale(0)';
            icon.style.opacity = '0';
            setTimeout(() => {
                if (icon.parentNode) {
                    icon.parentNode.removeChild(icon);
                }
            }, 200);
        });
        this.activeIcons.clear();
    }

    /**
     * Ejecuta una animación de powerup cuando se activa
     * @param {string} powerupType - Tipo de powerup
     * @param {number} row - Fila objetivo
     * @param {number} col - Columna objetivo  
     * @param {HTMLElement} boardElement - Elemento del tablero
     */
    triggerPowerupActivation(powerupType, row, col, boardElement) {
        const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell && POWERUP_VISUAL_CONFIG.animations[powerupType]) {
            this.playPowerupAnimation(row, col, powerupType, cell);
        }
    }
}

// Instancia global del sistema visual
export const powerupVisualSystem = new PowerupVisualSystem();
