const server = 'http://localhost:3000';

// Variable para almacenar los IDs de los jugadores de la partida actual
let currentGamePlayers = {
    white: null,
    black: null
};

// Función para establecer el jugador actual
function setCurrentPlayer(color, playerId) {
    currentGamePlayers[color] = playerId;
}

// Función para obtener el ID del jugador por color
function getCurrentPlayerId(color) {
    return currentGamePlayers[color];
}

// Función para crear una nueva ronda
export async function createNewRound(gameId, roundNumber) {
    try {
        const response = await fetch(`${server}/api/rounds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_partida: gameId,
                numero_ronda: roundNumber,
                ventaja_aplicada: roundNumber === 2 // La ventaja se aplica en la ronda 2
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error creando nueva ronda');
        }

        const data = await response.json();
        if (data.success && data.data && data.data.rondaId) {
            return data.data.rondaId;
        }
        throw new Error('ID de ronda no encontrado en la respuesta');
    } catch (error) {
        console.error('Error creando nueva ronda:', error);
        throw error;
    }
}

async function NewUser(){
    const userData = {
        email: document.getElementById('newEmail').value,
        password: document.getElementById('newPassword').value,
    };

    if (!userData.email || !userData.password) {
        console.log('Todos los campos son requeridos');
        return;
    }
    try {
        const response = await fetch(server + '/api/playerstats', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear usuario');
        }

        const result = await response.json();
        console.log(result.message || 'Usuario creado exitosamente');

    } catch (error) {
        console.error('Error añadiendo usuario:', error);
    }
}

export async function trackPowerupUsage(powerupData) {
    // Si no se proporciona el ID del jugador, intentar obtenerlo del estado actual
    if (!powerupData.id_jugador && powerupData.color) {
        powerupData.id_jugador = getCurrentPlayerId(powerupData.color);
    }

    // Validación de datos requeridos
    if (!powerupData.id_powerup || !powerupData.id_jugador || !powerupData.id_partida || !powerupData.id_ronda) {
        console.error('Datos incompletos para registrar powerup:', {
            requiredFields: ['id_powerup', 'id_jugador', 'id_partida', 'id_ronda'],
            receivedData: powerupData
        });
        return;
    }

    try {
        const response = await fetch(server + '/api/powerups/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(powerupData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar uso de powerup');
        }

        const result = await response.json();
        console.log('Powerup registrado exitosamente:', result);
        return result;

    } catch (error) {
        console.error('Error registrando uso de powerup:', error);
        throw error;
    }
}

// Función para obtener el ID de un jugador por su email
export async function getPlayerId(email) {
    try {
        console.log(`Buscando ID para jugador con email: ${email}`);
        const response = await fetch(`${server}/api/playerstats?jugador_email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error obteniendo ID del jugador');
        }
        
        const data = await response.json();
        console.log('Respuesta del servidor para getPlayerId:', data);
        
        if (data.success && data.data && data.data.length > 0) {
            const playerId = data.data[0].jugadorId;
            console.log(`ID encontrado para ${email}: ${playerId}`);
            return playerId;
        }
        throw new Error(`Jugador no encontrado con email: ${email}`);
    } catch (error) {
        console.error(`Error obteniendo ID para jugador ${email}:`, error);
        throw error;
    }
}

// Función para obtener el ID de la partida actual
export async function getCurrentGameId() {
    try {
        const response = await fetch(`${server}/api/games?estado_partida=en_progreso`);
        if (!response.ok) {
            throw new Error('Error obteniendo ID de la partida');
        }
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].partidaId;
        }
        throw new Error('Partida actual no encontrada');
    } catch (error) {
        console.error('Error obteniendo ID de la partida:', error);
        throw error;
    }
}

// Función para obtener el ID de la ronda actual
export async function getCurrentRoundId(gameId) {
    try {
        const response = await fetch(`${server}/api/rounds/stats?id_partida=${gameId}`);
        if (!response.ok) {
            throw new Error('Error obteniendo ID de la ronda');
        }
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            // Asumimos que la última ronda es la actual
            return data.data[data.data.length - 1].rondaId;
        }
        throw new Error('Ronda actual no encontrada');
    } catch (error) {
        console.error('Error obteniendo ID de la ronda:', error);
        throw error;
    }
}

// Función para crear una nueva partida
export async function createNewGame(whitePlayerId, blackPlayerId) {
    try {
        const response = await fetch(`${server}/api/games`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_jugador1: whitePlayerId,
                id_jugador2: blackPlayerId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error creando nueva partida');
        }

        const data = await response.json();
        if (data.success && data.data && data.data.partidaId) {
            return data.data.partidaId;
        }
        throw new Error('ID de partida no encontrado en la respuesta');
    } catch (error) {
        console.error('Error creando nueva partida:', error);
        throw error;
    }
}

// Función para inicializar los IDs en el contexto del juego
export async function initializeGameIds(gameContext, whitePlayerEmail, blackPlayerEmail) {
    try {
        console.log('Inicializando IDs para:', { whitePlayerEmail, blackPlayerEmail });
        
        if (whitePlayerEmail === blackPlayerEmail) {
            throw new Error('Los jugadores deben tener emails diferentes');
        }

        // Obtener IDs de los jugadores
        const whitePlayerId = await getPlayerId(whitePlayerEmail);
        const blackPlayerId = await getPlayerId(blackPlayerEmail);

        console.log('IDs obtenidos:', { whitePlayerId, blackPlayerId });

        if (!whitePlayerId || !blackPlayerId) {
            throw new Error('No se pudieron obtener los IDs de los jugadores');
        }

        if (whitePlayerId === blackPlayerId) {
            throw new Error('Los jugadores deben ser diferentes');
        }

        // Asignar IDs de jugadores
        gameContext.playerIds = {
            'w': whitePlayerId,
            'b': blackPlayerId
        };

        // Crear una nueva partida
        const gameId = await createNewGame(whitePlayerId, blackPlayerId);
        console.log('Nueva partida creada con ID:', gameId);
        gameContext.currentGameId = gameId;

        // Crear una nueva ronda
        const roundId = await createNewRound(gameId, 1);
        console.log('Nueva ronda creada con ID:', roundId);
        gameContext.currentRoundId = roundId;

        return gameContext;
    } catch (error) {
        console.error('Error en initializeGameIds:', error);
        throw error;
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch(`${server}/api/playerstats?jugador_email=${email}`);
        if (!response.ok) {
            throw new Error('Error en el login');
        }
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            const player = data.data[0];
            // Verificar la contraseña (esto debería hacerse en el servidor en producción)
            if (player.password === password) {
                return player.jugadorId;
            }
        }
        throw new Error('Credenciales inválidas');
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

async function main() {
    // For USERS
    // Sign-up
    const buttonNewUser = document.getElementById("NewUser");
    if (buttonNewUser) {
        buttonNewUser.addEventListener('click', NewUser);
    }

    // Login
    const buttonLogin = document.getElementById("LoginUser");
    if (buttonLogin) {
        buttonLogin.addEventListener('click', async () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!email || !password) {
                alert('Por favor ingresa email y contraseña');
                return;
            }

            try {
                const playerId = await loginUser(email, password);
                if (playerId) {
                    // Almacenar el ID del jugador en sessionStorage
                    sessionStorage.setItem('currentPlayerId', playerId);
                    sessionStorage.setItem('currentPlayerEmail', email);
                    alert('Login exitoso!');
                    window.location.href = '/assets/html/game.html';
                }
            } catch (error) {
                alert('Error en el login: ' + error.message);
            }
        });
    }
}

// Exportar las funciones necesarias
export {
    NewUser,
    loginUser,
    setCurrentPlayer,
    getCurrentPlayerId,
    currentGamePlayers
};

main();