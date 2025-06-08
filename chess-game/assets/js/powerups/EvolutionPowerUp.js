import { PowerUpBase } from './PowerUpBase.js';

export class EvolutionPowerUp extends PowerUpBase {
  constructor() {
    super(
      'Evolution',
      'Transforma un peón aleatorio tuyo en caballo o alfil.',
      false, // No requiere target (selección aleatoria)
      0, // Efecto instantáneo
      '🧬' // uiIcon
    );
  }

  /**
   * Verifica si el power-up puede ser activado.
   */
  canActivate(gameContext, playerColor) {
    // Verificar que el jugador tenga al menos un peón
    const playerPawns = this.getPlayerPawns(gameContext, playerColor);
    
    if (playerPawns.length === 0) {
      if (gameContext.messageElement) {
        gameContext.messageElement.textContent = "No tienes peones para evolucionar.";
      }
      return false;
    }

    return true;
  }

  /**
   * Activa el power-up Evolution.
   */
  activate(gameContext, playerColor, targetData = null) {
    if (!this.canActivate(gameContext, playerColor)) {
      return false;
    }

    // Obtener todos los peones del jugador
    const playerPawns = this.getPlayerPawns(gameContext, playerColor);
    
    if (playerPawns.length === 0) {
      return false;
    }

    // Seleccionar un peón al azar
    const randomIndex = Math.floor(Math.random() * playerPawns.length);
    const selectedPawn = playerPawns[randomIndex];

    // Elegir evolución aleatoria (caballo o alfil)
    const evolutionChoice = this.getRandomEvolution();
    const newPieceType = evolutionChoice === 'knight' ? 'n' : 'b';

    const playerColorName = playerColor === 'w' ? 'Blancas' : 'Negras';
    const pieceNames = { 'n': 'Caballo', 'b': 'Alfil' };
    const newPieceName = pieceNames[newPieceType];

    // Mostrar mensaje de activación
    if (gameContext.messageElement) {
      const position = `${selectedPawn.row + 1}${String.fromCharCode(65 + selectedPawn.col)}`;
      gameContext.messageElement.textContent = `¡${playerColorName} evolucionan su peón en ${position} a ${newPieceName}!`;
    }

    // Ejecutar la transformación
    gameContext.board[selectedPawn.row][selectedPawn.col] = {
      type: newPieceType,
      color: playerColor,
      hasMoved: true
    };    // Activar animación de evolución
    this.triggerEvolutionAnimation(gameContext, selectedPawn.row, selectedPawn.col, newPieceType);

    // Track usage statistics
    const activeInstanceData = {
      id: this.id,
      type: this.name,
      placedBy: playerColor,
      remainingDuration: 0 // Instant effect
    };
    
    this.onActivationComplete(gameContext, playerColor, activeInstanceData);

    return true;
  }

  /**
   * Obtiene todos los peones del jugador.
   */
  getPlayerPawns(gameContext, playerColor) {
    const pawns = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameContext.board[row][col];
        if (piece && piece.type === 'p' && piece.color === playerColor) {
          pawns.push({ row, col, piece });
        }
      }
    }
    
    return pawns;
  }

  /**
   * Selecciona evolución aleatoria.
   */
  getRandomEvolution() {
    const evolutions = ['knight', 'bishop'];
    const randomIndex = Math.floor(Math.random() * evolutions.length);
    return evolutions[randomIndex];
  }

  /**
   * Activa animación de evolución cuando un peón evoluciona.
   */
  triggerEvolutionAnimation(gameContext, row, col, newPieceType) {
    const { boardElement } = gameContext;
    if (!boardElement) return;

    const targetCell = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!targetCell) return;    // Crear efecto de transformación
    const transformEffect = document.createElement('div');
    transformEffect.className = 'evolution-transform';
    transformEffect.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80px;
      height: 80px;
      background-image: url('/images/powerupevolutionanimation.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      animation: evolutionTransform 1.2s ease-out;
      pointer-events: none;
      z-index: 9999;
    `;

    // Agregar CSS de animación si no existe
    if (!document.querySelector('#evolution-animation-style')) {
      const style = document.createElement('style');
      style.id = 'evolution-animation-style';
      style.textContent = `        @keyframes evolutionTransform {
          0% { 
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 1;
            color: #ffd700;
          }
          50% { 
            transform: translate(-50%, -50%) scale(15);
            opacity: 0.8;
            color: #4ecdc4;
          }
          100% { 
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
            color: #96ceb4;
          }
        }
        
        @keyframes evolutionGlow {
          0% { 
            box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.7);
          }
          100% { 
            box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          }
        }
      `;
      document.head.appendChild(style);
    }    // Agregar efecto de resplandor a la casilla
    targetCell.style.animation = 'evolutionGlow 1.2s ease-out';
    targetCell.style.position = 'relative';
    
    // Agregar la animación al contenedor principal para evitar z-index issues
    const gameContainer = boardElement.parentElement || document.body;
    gameContainer.appendChild(transformEffect);

    // Remover efectos después de la animación
    setTimeout(() => {
      if (transformEffect.parentNode) {
        transformEffect.parentNode.removeChild(transformEffect);
      }      targetCell.style.animation = '';
    }, 1200);
  }
}

//hola