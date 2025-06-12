/**
 * PowerUp Combo System
 * Manages combinations of PowerUps that create unique effects
 */

export class PowerUpComboSystem {
  constructor() {
    this.combos = this.initializeCombos();
    this.activeCombos = new Map(); // Track active combos per player
  }

  /**
   * Initialize all available PowerUp combinations
   */
  initializeCombos() {
    return {
      // Lightning Storm: Shield + Blast = All enemy pieces lose protection and take damage
      'Lightning Storm': {
        powerUps: ['Shield', 'Blast'],
        name: 'Lightning Storm',
        description: 'Remueve todos los escudos enemigos y destruye una pieza enemiga aleatoria',
        icon: '⚡',
        rarity: 'legendary',
        execute: this.executeLightningStorm.bind(this)
      },

      // Portal Fortress: Fence + Horizontal Portal = Create protected teleport zones
      'Portal Fortress': {
        powerUps: ['Fence', 'Horizontal Portal'],
        name: 'Portal Fortress',
        description: 'Crea 2 vallas conectadas por portal - las piezas pueden teletransportarse entre ellas',
        icon: '🏰',
        rarity: 'epic',
        execute: this.executePortalFortress.bind(this)
      },

      // King\'s Gambit: Crazy King + Extra Move = King gets 3 consecutive moves with queen power
      'King\'s Gambit': {
        powerUps: ['Crazy King', 'Extra Move'],
        name: 'King\'s Gambit',
        description: 'Tu rey obtiene poder de reina y puede moverse 3 veces consecutivas',
        icon: '👑',
        rarity: 'legendary',
        execute: this.executeKingsGambit.bind(this)
      },

      // Evolution Storm: Evolution + Pawn Range = All pawns advance and can evolve
      'Evolution Storm': {
        powerUps: ['Evolution', 'Pawn Range'],
        name: 'Evolution Storm',
        description: 'Todos tus peones avanzan 2 casillas y pueden evolucionar inmediatamente',
        icon: '🌪️',
        rarity: 'epic',
        execute: this.executeEvolutionStorm.bind(this)
      },

      // Swap Cage: Swap + Cage = Swap positions with enemy piece and cage it
      'Swap Cage': {
        powerUps: ['Swap', 'Cage'],
        name: 'Swap Cage',
        description: 'Intercambia posición con una pieza enemiga y la enjáula inmediatamente',
        icon: '🔄',
        rarity: 'rare',
        execute: this.executeSwapCage.bind(this)
      },

      // Reducer Blast: Reducer + Blast = Reduce enemy piece range then blast it
      'Reducer Blast': {
        powerUps: ['Reducer', 'Blast'],
        name: 'Reducer Blast',
        description: 'Reduce el rango de una pieza enemiga y luego la destruye',
        icon: '💥',
        rarity: 'rare',
        execute: this.executeReducerBlast.bind(this)
      },

      // Shield Wall: Shield + Fence = Create an impenetrable barrier
      'Shield Wall': {
        powerUps: ['Shield', 'Fence'],
        name: 'Shield Wall',
        description: 'Crea una barrera de 3 casillas protegidas e impenetrables',
        icon: '🛡️',
        rarity: 'epic',
        execute: this.executeShieldWall.bind(this)
      }
    };
  }

  /**
   * Check if player can perform any combos with their current PowerUps
   */
  checkAvailableCombos(gameContext, playerColor) {
    const playerPowerUps = playerColor === 'w' ? gameContext.powerUpsWhite : gameContext.powerUpsBlack;
    const availableCombos = [];

    Object.entries(this.combos).forEach(([comboName, combo]) => {
      if (this.canExecuteCombo(playerPowerUps, combo.powerUps)) {
        availableCombos.push({
          name: comboName,
          ...combo
        });
      }
    });

    return availableCombos;
  }

  /**
   * Check if player has required PowerUps for a combo
   */
  canExecuteCombo(playerPowerUps, requiredPowerUps) {
    const powerUpCounts = {};
    playerPowerUps.forEach(powerUp => {
      powerUpCounts[powerUp] = (powerUpCounts[powerUp] || 0) + 1;
    });

    return requiredPowerUps.every(required => {
      const requiredCount = requiredPowerUps.filter(p => p === required).length;
      return (powerUpCounts[required] || 0) >= requiredCount;
    });
  }

  /**
   * Execute a PowerUp combo
   */
  executeCombo(gameContext, playerColor, comboName, targetData = null) {
    const combo = this.combos[comboName];
    if (!combo) {
      console.error(`Combo ${comboName} not found`);
      return false;
    }

    const playerPowerUps = playerColor === 'w' ? gameContext.powerUpsWhite : gameContext.powerUpsBlack;
    
    if (!this.canExecuteCombo(playerPowerUps, combo.powerUps)) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = `No tienes los PowerUps necesarios para ${combo.name}`;
      }
      return false;
    }

    // Remove required PowerUps from player inventory
    combo.powerUps.forEach(powerUpType => {
      const index = playerPowerUps.indexOf(powerUpType);
      if (index > -1) {
        playerPowerUps.splice(index, 1);
      }
    });

    // Execute the combo effect
    const success = combo.execute(gameContext, playerColor, targetData);

    if (success) {
      // Show combo activation message
      this.showComboActivation(gameContext, playerColor, combo);
      
      // Track combo usage
      this.trackComboUsage(gameContext, playerColor, comboName);
      
      // Update UI
      gameContext.renderBoard();
    }

    return success;
  }

  // =========================
  // COMBO IMPLEMENTATIONS
  // =========================

  /**
   * Lightning Storm: Remove all enemy shields and destroy random enemy piece
   */
  executeLightningStorm(gameContext, playerColor, targetData) {
    const { board, activePowerUps } = gameContext;
    const enemyColor = playerColor === 'w' ? 'b' : 'w';

    // Remove all enemy shields
    if (activePowerUps) {
      const shieldsRemoved = activePowerUps.filter(powerUp => 
        powerUp.type === 'Shield' && powerUp.placedBy === enemyColor
      );
      
      shieldsRemoved.forEach(shield => {
        // Remove shield visual
        const { boardElement } = gameContext;
        if (boardElement) {
          const cell = boardElement.querySelector(`[data-row="${shield.targetRow}"][data-col="${shield.targetCol}"]`);
          if (cell) {
            const shieldElement = cell.querySelector('.shield-effect');
            if (shieldElement) {
              shieldElement.remove();
            }
          }
        }
      });

      // Remove shields from activePowerUps
      gameContext.activePowerUps = activePowerUps.filter(powerUp => 
        !(powerUp.type === 'Shield' && powerUp.placedBy === enemyColor)
      );
    }

    // Find destructible enemy pieces (p, n, b)
    const destructiblePieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === enemyColor && ['p', 'n', 'b'].includes(piece.type)) {
          destructiblePieces.push({ row: r, col: c, piece });
        }
      }
    }

    // Destroy random destructible piece
    if (destructiblePieces.length > 0) {
      const randomPiece = destructiblePieces[Math.floor(Math.random() * destructiblePieces.length)];
      board[randomPiece.row][randomPiece.col] = null;
      
      // Create lightning effect
      this.createLightningEffect(gameContext, randomPiece.row, randomPiece.col);
    }

    return true;
  }

  /**
   * Portal Fortress: Create connected fence portals
   */
  executePortalFortress(gameContext, playerColor, targetData) {
    // This combo requires 2 target selections
    if (!targetData || !targetData.positions || targetData.positions.length < 2) {
      // Start multi-target selection
      gameContext.awaitingPowerUpTarget = {
        powerUpType: 'Portal Fortress',
        combo: true,
        requiredTargets: 2,
        selectedTargets: targetData?.positions || [],
        step: 'selectFirst'
      };

      if (gameContext.messageElement) {
        const step = (targetData?.positions?.length || 0) + 1;
        gameContext.messageElement.textContent = `Selecciona la posición ${step} para Portal Fortress (${step}/2)`;
      }

      return false; // Not complete yet
    }

    const [pos1, pos2] = targetData.positions;
    const { board, fencedTiles } = gameContext;

    // Verify both positions are valid for fences
    if (board[pos1.row][pos1.col] || board[pos2.row][pos2.col]) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Las posiciones deben estar vacías para Portal Fortress";
      }
      return false;
    }

    // Create portal fences
    const portalId = `portal-${Date.now()}`;
    
    const fence1 = {
      id: `${portalId}-1`,
      row: pos1.row,
      col: pos1.col,
      remainingDuration: 5, // Longer duration for combo
      portalId: portalId,
      connectedTo: { row: pos2.row, col: pos2.col }
    };

    const fence2 = {
      id: `${portalId}-2`, 
      row: pos2.row,
      col: pos2.col,
      remainingDuration: 5,
      portalId: portalId,
      connectedTo: { row: pos1.row, col: pos1.col }
    };

    if (!gameContext.fencedTiles) {
      gameContext.fencedTiles = [];
    }
    gameContext.fencedTiles.push(fence1, fence2);

    // Create portal visual effects
    this.createPortalEffect(gameContext, pos1.row, pos1.col);
    this.createPortalEffect(gameContext, pos2.row, pos2.col);

    return true;
  }

  /**
   * King's Gambit: Enhanced king with multiple moves
   */
  executeKingsGambit(gameContext, playerColor, targetData) {
    // Set king to crazy mode with extended benefits
    if (!gameContext.crazyKingActive) {
      gameContext.crazyKingActive = {};
    }
    gameContext.crazyKingActive[playerColor] = true;

    // Set special gambit mode
    gameContext.kingsGambitActive = {
      player: playerColor,
      movesRemaining: 3,
      turnsRemaining: 3
    };

    // Create royal effect around king
    const { board } = gameContext;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === playerColor && piece.type === 'k') {
          this.createRoyalEffect(gameContext, r, c);
          break;
        }
      }
    }

    return true;
  }

  /**
   * Evolution Storm: Advance and evolve all pawns
   */
  executeEvolutionStorm(gameContext, playerColor, targetData) {
    const { board } = gameContext;
    const direction = playerColor === 'w' ? -1 : 1;
    const pawnsToEvolve = [];

    // Find and advance all pawns
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === playerColor && piece.type === 'p') {
          const newRow = r + (direction * 2);
          
          // Advance pawn if possible
          if (newRow >= 0 && newRow < 8 && !board[newRow][c]) {
            board[newRow][c] = piece;
            board[r][c] = null;
            
            // Check if pawn can evolve (reached end or near end)
            if ((playerColor === 'w' && newRow <= 1) || (playerColor === 'b' && newRow >= 6)) {
              pawnsToEvolve.push({ row: newRow, col: c });
            }
            
            // Create advance effect
            this.createAdvanceEffect(gameContext, r, c, newRow, c);
          }
        }
      }
    }

    // Auto-evolve advanced pawns to queens
    pawnsToEvolve.forEach(({ row, col }) => {
      board[row][col] = { type: 'q', color: playerColor };
      this.createEvolutionEffect(gameContext, row, col);
    });

    return true;
  }

  /**
   * Swap Cage: Swap with enemy and cage them
   */
  executeSwapCage(gameContext, playerColor, targetData) {
    if (!targetData || typeof targetData.row === 'undefined') {
      // Start target selection for enemy piece
      gameContext.awaitingPowerUpTarget = {
        powerUpType: 'Swap Cage',
        combo: true,
        step: 'selectEnemy'
      };

      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Selecciona una pieza enemiga para Swap Cage";
      }

      return false;
    }

    const { board } = gameContext;
    const enemyColor = playerColor === 'w' ? 'b' : 'w';
    const enemyPiece = board[targetData.row][targetData.col];

    if (!enemyPiece || enemyPiece.color !== enemyColor) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Debes seleccionar una pieza enemiga";
      }
      return false;
    }

    // Find player's king for swap
    let kingPos = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === playerColor && piece.type === 'k') {
          kingPos = { row: r, col: c };
          break;
        }
      }
    }

    if (!kingPos) return false;

    // Execute swap
    const playerKing = board[kingPos.row][kingPos.col];
    board[targetData.row][targetData.col] = playerKing;
    board[kingPos.row][kingPos.col] = enemyPiece;

    // Cage the swapped enemy piece (now at king's old position)
    const cageInstanceData = {
      id: `combo-cage-${Date.now()}`,
      type: 'Cage',
      placedBy: playerColor,
      remainingDuration: 3,
      targetRow: kingPos.row,
      targetCol: kingPos.col,
      cagedPiece: { ...enemyPiece }
    };

    if (!gameContext.activePowerUps) {
      gameContext.activePowerUps = [];
    }
    gameContext.activePowerUps.push(cageInstanceData);

    // Create swap effect
    this.createSwapEffect(gameContext, kingPos.row, kingPos.col, targetData.row, targetData.col);

    return true;
  }

  /**
   * Reducer Blast: Reduce then destroy
   */
  executeReducerBlast(gameContext, playerColor, targetData) {
    if (!targetData || typeof targetData.row === 'undefined') {
      gameContext.awaitingPowerUpTarget = {
        powerUpType: 'Reducer Blast',
        combo: true,
        step: 'selectTarget'
      };

      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Selecciona una pieza enemiga para Reducer Blast";
      }

      return false;
    }

    const { board } = gameContext;
    const enemyColor = playerColor === 'w' ? 'b' : 'w';
    const targetPiece = board[targetData.row][targetData.col];

    if (!targetPiece || targetPiece.color !== enemyColor) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Debes seleccionar una pieza enemiga";
      }
      return false;
    }

    // Check if piece can be blasted (pawn, knight, bishop)
    if (!['p', 'n', 'b'].includes(targetPiece.type)) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "Solo puedes destruir peones, caballos o alfiles";
      }
      return false;
    }

    // Destroy the piece immediately (combo bypasses reducer step)
    board[targetData.row][targetData.col] = null;

    // Create combined effect
    this.createReducerBlastEffect(gameContext, targetData.row, targetData.col);

    return true;
  }

  /**
   * Shield Wall: Create impenetrable barrier
   */
  executeShieldWall(gameContext, playerColor, targetData) {
    if (!targetData || !targetData.positions || targetData.positions.length < 3) {
      gameContext.awaitingPowerUpTarget = {
        powerUpType: 'Shield Wall',
        combo: true,
        requiredTargets: 3,
        selectedTargets: targetData?.positions || [],
        step: 'selectWall'
      };

      if (gameContext.messageElement) {
        const step = (targetData?.positions?.length || 0) + 1;
        gameContext.messageElement.textContent = `Selecciona posición ${step} para Shield Wall (${step}/3)`;
      }

      return false;
    }

    const { board } = gameContext;
    const positions = targetData.positions;

    // Verify all positions are valid
    for (const pos of positions) {
      if (board[pos.row][pos.col]) {
        if (gameContext.messageElement) {
          gameContext.messageElement.textContent = "Todas las posiciones deben estar vacías";
        }
        return false;
      }
    }

    // Create shield wall fences with special properties
    positions.forEach((pos, index) => {
      const wallPiece = {
        id: `shield-wall-${Date.now()}-${index}`,
        row: pos.row,
        col: pos.col,
        remainingDuration: 4, // Longer duration
        isShieldWall: true // Special property
      };

      if (!gameContext.fencedTiles) {
        gameContext.fencedTiles = [];
      }
      gameContext.fencedTiles.push(wallPiece);

      // Create shield wall visual
      this.createShieldWallEffect(gameContext, pos.row, pos.col);
    });

    return true;
  }

  // =========================
  // VISUAL EFFECTS
  // =========================

  createLightningEffect(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    const lightning = document.createElement('div');
    lightning.className = 'lightning-effect';
    lightning.innerHTML = '⚡';
    lightning.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2em;
      color: #ffeb3b;
      text-shadow: 0 0 10px #ffeb3b;
      animation: lightningStrike 1s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    cell.appendChild(lightning);

    setTimeout(() => {
      if (lightning.parentNode) {
        lightning.parentNode.removeChild(lightning);
      }
    }, 1000);

    this.addComboAnimationStyles();
  }

  createPortalEffect(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    const portal = document.createElement('div');
    portal.className = 'portal-effect';
    portal.innerHTML = '🌀';
    portal.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5em;
      animation: portalSpin 2s linear infinite;
      pointer-events: none;
      z-index: 999;
    `;

    cell.appendChild(portal);
  }

  createRoyalEffect(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    cell.classList.add('kings-gambit-effect');
  }

  createAdvanceEffect(gameContext, fromRow, fromCol, toRow, toCol) {
    // Visual trail effect for advancing pawns
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const fromCell = boardElement.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toCell = boardElement.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
    
    if (fromCell) fromCell.classList.add('pawn-advance-from');
    if (toCell) toCell.classList.add('pawn-advance-to');

    setTimeout(() => {
      if (fromCell) fromCell.classList.remove('pawn-advance-from');
      if (toCell) toCell.classList.remove('pawn-advance-to');
    }, 1000);
  }

  createEvolutionEffect(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    const evolution = document.createElement('div');
    evolution.className = 'evolution-burst';
    evolution.innerHTML = '✨';
    evolution.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2em;
      animation: evolutionBurst 1.5s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    cell.appendChild(evolution);

    setTimeout(() => {
      if (evolution.parentNode) {
        evolution.parentNode.removeChild(evolution);
      }
    }, 1500);
  }

  createSwapEffect(gameContext, row1, col1, row2, col2) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell1 = boardElement.querySelector(`[data-row="${row1}"][data-col="${col1}"]`);
    const cell2 = boardElement.querySelector(`[data-row="${row2}"][data-col="${col2}"]`);
    
    if (cell1) cell1.classList.add('swap-effect');
    if (cell2) cell2.classList.add('swap-effect');

    setTimeout(() => {
      if (cell1) cell1.classList.remove('swap-effect');
      if (cell2) cell2.classList.remove('swap-effect');
    }, 1000);
  }

  createReducerBlastEffect(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    const effect = document.createElement('div');
    effect.className = 'reducer-blast-effect';
    effect.innerHTML = '💥🔄';
    effect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.5em;
      animation: reducerBlast 1.2s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    cell.appendChild(effect);

    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    }, 1200);
  }

  createShieldWallEffect(gameContext, row, col) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const cell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;

    cell.classList.add('shield-wall-effect');
  }

  showComboActivation(gameContext, playerColor, combo) {
    const playerName = playerColor === 'w' ? 'Blancas' : 'Negras';
    
    if (gameContext.messageElement) {
      gameContext.messageElement.textContent = 
        `¡${playerName} activaron ${combo.icon} ${combo.name}! ${combo.description}`;
    }

    // Create screen-wide combo announcement
    this.createComboAnnouncement(combo, playerName);
  }

  createComboAnnouncement(combo, playerName) {
    const announcement = document.createElement('div');
    announcement.className = 'combo-announcement';
    announcement.innerHTML = `
      <div class="combo-icon">${combo.icon}</div>
      <div class="combo-name">${combo.name}</div>
      <div class="combo-player">${playerName}</div>
    `;
    
    announcement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      color: white;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      font-family: 'Fredoka', sans-serif;
      font-weight: bold;
      font-size: 1.2rem;
      z-index: 10000;
      box-shadow: 0 0 30px rgba(0,0,0,0.5);
      animation: comboAnnounce 3s ease-out forwards;
      pointer-events: none;
    `;

    document.body.appendChild(announcement);

    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 3000);
  }

  trackComboUsage(gameContext, playerColor, comboName) {
    // Track combo usage in game statistics
    if (gameContext.gameStats) {
      const playerStats = playerColor === 'w' ? gameContext.gameStats.white : gameContext.gameStats.black;
      
      if (!playerStats.combosUsed) {
        playerStats.combosUsed = {};
      }
      
      playerStats.combosUsed[comboName] = (playerStats.combosUsed[comboName] || 0) + 1;
    }
  }

  addComboAnimationStyles() {
    if (!document.querySelector('#combo-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'combo-animation-styles';
      style.textContent = `
        @keyframes lightningStrike {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes portalSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes comboAnnounce {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        @keyframes evolutionBurst {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes reducerBlast {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.3); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2); }
        }
        .kings-gambit-effect {
          background: linear-gradient(45deg, #ffd700, #ffed4e) !important;
          box-shadow: 0 0 20px gold !important;
          animation: royalGlow 2s ease-in-out infinite;
        }
        @keyframes royalGlow {
          0%, 100% { box-shadow: 0 0 20px gold; }
          50% { box-shadow: 0 0 30px gold, 0 0 40px gold; }
        }
        .swap-effect {
          animation: swapPulse 1s ease-in-out;
        }
        @keyframes swapPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .pawn-advance-from {
          background: linear-gradient(45deg, rgba(76, 175, 80, 0.3), rgba(129, 199, 132, 0.3)) !important;
        }
        .pawn-advance-to {
          background: linear-gradient(45deg, rgba(76, 175, 80, 0.6), rgba(129, 199, 132, 0.6)) !important;
          animation: advanceGlow 1s ease-out;
        }
        @keyframes advanceGlow {
          0% { box-shadow: none; }
          50% { box-shadow: 0 0 15px #4caf50; }
          100% { box-shadow: none; }
        }
        .shield-wall-effect {
          background: linear-gradient(45deg, #2196f3, #64b5f6) !important;
          border: 3px solid #1976d2 !important;
          box-shadow: 0 0 15px rgba(33, 150, 243, 0.7) !important;
        }
        .combo-announcement .combo-icon {
          font-size: 3rem;
          margin-bottom: 10px;
        }
        .combo-announcement .combo-name {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .combo-announcement .combo-player {
          font-size: 1rem;
          opacity: 0.9;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Create global instance
export const powerUpComboSystem = new PowerUpComboSystem();
