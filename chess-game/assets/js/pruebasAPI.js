const server = 'http://localhost:3000';

// Función para verificar si el servidor está funcionando
export async function checkServerStatus() {
    try {
        console.log('🔍 Verificando estado del servidor...');
        const response = await fetch(`${server}/api/health`, { 
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            console.log('✅ Servidor respondiendo correctamente');
            return true;
        } else {
            console.log('⚠️ Servidor responde pero con error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Servidor no responde:', error.message);
        return false;
    }
}

// Variable para almacenar los IDs de los jugadores de la partida actual
let currentGamePlayers = {
    white: null,
    black: null,
    w: null,
    b: null
};

// Función para establecer el jugador actual
function setCurrentPlayer(color, playerId) {
    // Mapear colores cortos a largos y viceversa
    if (color === 'w' || color === 'white') {
        currentGamePlayers.white = playerId;
        currentGamePlayers.w = playerId;
    } else if (color === 'b' || color === 'black') {
        currentGamePlayers.black = playerId;
        currentGamePlayers.b = playerId;
    }
}

// Función para obtener el ID del jugador por color
function getCurrentPlayerId(color) {
    console.log('🔍 getCurrentPlayerId llamada con color:', color);
    console.log('🔍 currentGamePlayers estado:', currentGamePlayers);
    
    let playerId = null;
    
    // Mapear colores cortos a largos si es necesario
    if (color === 'w' || color === 'white') {
        playerId = currentGamePlayers.white || currentGamePlayers.w;
    } else if (color === 'b' || color === 'black') {
        playerId = currentGamePlayers.black || currentGamePlayers.b;
    } else {
        playerId = currentGamePlayers[color];
    }
    
    console.log('🔍 getCurrentPlayerId resultado:', playerId);
    return playerId;
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
    console.log('🔍 trackPowerupUsage - Datos recibidos:', powerupData);
    
    // Si no se proporciona el ID del jugador, intentar obtenerlo del estado actual
    if (!powerupData.id_jugador && powerupData.color) {
        console.log('🔍 Intentando obtener ID del jugador para color:', powerupData.color);
        powerupData.id_jugador = getCurrentPlayerId(powerupData.color);
        console.log('🔍 ID obtenido del color:', powerupData.id_jugador);
    }

    // Validación detallada de datos requeridos
    const missingFields = [];
    if (!powerupData.id_powerup) missingFields.push('id_powerup');
    if (!powerupData.id_jugador) missingFields.push('id_jugador');
    if (!powerupData.id_partida) missingFields.push('id_partida');
    if (!powerupData.id_ronda) missingFields.push('id_ronda');

    if (missingFields.length > 0) {
        console.error('❌ Datos incompletos para registrar powerup:', {
            missingFields,
            requiredFields: ['id_powerup', 'id_jugador', 'id_partida', 'id_ronda'],
            receivedData: powerupData,
            currentGamePlayers: currentGamePlayers
        });
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }

    console.log('✅ Datos validados, enviando request al servidor...');

    try {
        const requestData = {
            id_powerup: powerupData.id_powerup,
            id_jugador: powerupData.id_jugador,
            id_partida: powerupData.id_partida,
            id_ronda: powerupData.id_ronda
        };

        console.log('📤 Request data:', requestData);
        console.log('📤 Request URL:', `${server}/api/powerups/use`);

        const response = await fetch(server + '/api/powerups/use', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);

        if (!response.ok) {
            let errorData = {};
            let rawText = '';
            try {
                // Primero obtener el texto crudo
                rawText = await response.text();
                console.error('❌ Raw error response text:', rawText);
                
                // Intentar parsear como JSON
                if (rawText) {
                    errorData = JSON.parse(rawText);
                    console.error('❌ Parsed error response data:', errorData);
                }
            } catch (e) {
                console.error('❌ No se pudo parsear error como JSON:', e);
                errorData = { 
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    raw: rawText || 'No response text available'
                };
                console.error('❌ Error data object:', errorData);
            }
            
            // Logs adicionales para debugging
            console.error('❌ Response details:');
            console.error('   Status:', response.status);
            console.error('   StatusText:', response.statusText);
            console.error('   Headers:', Object.fromEntries(response.headers.entries()));
            console.error('   URL:', response.url);
            
            throw new Error(errorData.message || `HTTP ${response.status}: Error del servidor`);
        }

        const result = await response.json();
        console.log('✅ Powerup registrado exitosamente:', result);
        return result;

    } catch (error) {
        console.error('❌ Error registrando uso de powerup:', error);
        
        // Verificar si es un error de red
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('❌ Posible error de conexión con el servidor');
            throw new Error('No se pudo conectar con el servidor. Verifica que esté ejecutándose en ' + server);
        }
        
        throw error;
    }
}

// Función para obtener el ID de un jugador por su email
export async function getPlayerId(email) {
    try {
        console.log(`Buscando ID para jugador con email: ${email}`);
        const response = await fetch(`${server}/api/playerstats?email_jugador=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error obteniendo ID del jugador');
        }
        
        const data = await response.json();
        console.log('Respuesta del servidor para getPlayerId:', data);
        
        if (data.success && data.data && data.data.length > 0) {
            console.log(`Jugadores encontrados para email ${email}:`, data.data);
            const player = data.data.find(p => p.email === email);
            if (player) {
                console.log(`ID específico encontrado para ${email}: ${player.jugadorId}`);
                return player.jugadorId;
            } else {
                console.log(`No se encontró coincidencia exacta de email para: ${email}`);
                console.log('Emails en respuesta:', data.data.map(p => p.email));
                throw new Error(`No se encontró coincidencia exacta de email para: ${email}`);
            }
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

        // NUEVO: También almacenar en currentGamePlayers para trackPowerupUsage
        setCurrentPlayer('w', whitePlayerId);
        setCurrentPlayer('b', blackPlayerId);

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
        const response = await fetch(`${server}/api/playerstats/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error en el login');
        }

        const data = await response.json();
        if (data.success && data.data) {
            return data.data.jugadorId;
        }
        throw new Error('Credenciales inválidas');
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
}

// Registrar turno completo en la base de datos (rellena vista_partidas_completa y piezas)
async function registerTurnComplete(turnData) {
    console.log('🔄 registerTurnComplete PASO A: Iniciando con datos:', turnData);
    
    try {
        console.log('🔄 registerTurnComplete PASO B: Preparando request...');
        console.log('   URL:', server + '/api/turns/complete');
        console.log('   Method: POST');
        
        const response = await fetch(server + '/api/turns/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(turnData)
        });
        
        console.log('🔄 registerTurnComplete PASO C: Response recibida');
        console.log('   Status:', response.status);
        console.log('   OK:', response.ok);
        
        if (!response.ok) {
            console.log('🔄 registerTurnComplete PASO D: Response no OK, obteniendo error...');
            
            let errorData = {};
            let rawText = '';
            try {
                // Primero obtener el texto crudo para no consumir el stream
                rawText = await response.text();
                console.error('❌ Raw server response:', rawText);
                
                // Intentar parsear como JSON
                if (rawText) {
                    errorData = JSON.parse(rawText);
                    console.error('❌ Parsed error data:', errorData);
                } else {
                    errorData = { message: 'Respuesta vacía del servidor' };
                }
            } catch (e) {
                console.error('❌ No se pudo parsear respuesta como JSON:', e);
                errorData = { 
                    message: rawText || `HTTP ${response.status}: ${response.statusText}`,
                    raw: rawText,
                    parseError: e.message
                };
            }
            
            // Logs adicionales para debugging
            console.error('❌ Server Response Details:');
            console.error('   Status:', response.status);
            console.error('   StatusText:', response.statusText);
            console.error('   URL:', response.url);
            
            throw new Error(errorData.message || `Server Error ${response.status}: ${response.statusText}`);
        }
        
        console.log('🔄 registerTurnComplete PASO E: Parseando resultado...');
        const result = await response.json();
        console.log('✅ registerTurnComplete PASO F: Turno registrado exitosamente:', result);
        return result;
    } catch (error) {
        console.error('❌ registerTurnComplete ERROR en:', error.message);
        console.error('❌ Error tipo:', error.name);
        console.error('❌ Stack completo:', error.stack);
        
        // Verificar si es un error de red
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('❌ Posible error de conexión con el servidor');
        }
        
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

// Función de diagnóstico para testear el registro de powerups
export async function testPowerupUsage() {
    console.log('🧪 Iniciando test de registro de powerups...');
    
    // Verificar servidor
    const serverOk = await checkServerStatus();
    if (!serverOk) {
        console.error('❌ Test fallido: Servidor no disponible');
        return false;
    }
    
    // Datos de prueba con IDs que sabemos que existen en la DB
    const testData = {
        id_powerup: 1, // Shield (ID 1 existe en la DB)
        id_jugador: 1, // Jugador 1 existe en la DB (mauro@example.com)
        id_partida: 1, // Partida 1 existe en la DB
        id_ronda: 1    // Ronda 1 existe en la DB
    };
    
    try {
        console.log('🧪 Enviando datos de prueba:', testData);
        const result = await trackPowerupUsage(testData);
        console.log('✅ Test exitoso:', result);
        return true;
    } catch (error) {
        console.error('❌ Test fallido:', error);
        return false;
    }
}

// Función para verificar los datos del contexto del juego actual
export function debugGameContext(gameContext) {
    console.log('🔍 DEBUG - Estado del gameContext:');
    console.log('📊 currentGameId:', gameContext?.currentGameId);
    console.log('📊 currentRoundId:', gameContext?.currentRoundId);
    console.log('📊 playerIds:', gameContext?.playerIds);
    console.log('📊 currentGamePlayers:', currentGamePlayers);
    
    // NUEVO: Verificar inventarios de powerups
    console.log('📊 powerUpsWhite:', gameContext?.powerUpsWhite);
    console.log('📊 powerUpsBlack:', gameContext?.powerUpsBlack);
    console.log('📊 powerUpsWhite es array:', Array.isArray(gameContext?.powerUpsWhite));
    console.log('📊 powerUpsBlack es array:', Array.isArray(gameContext?.powerUpsBlack));
    
    // Verificar si todos los datos necesarios están presentes
    const hasGameId = !!gameContext?.currentGameId;
    const hasRoundId = !!gameContext?.currentRoundId;
    const hasPlayerIds = !!gameContext?.playerIds;
    const hasValidInventories = Array.isArray(gameContext?.powerUpsWhite) && Array.isArray(gameContext?.powerUpsBlack);
    
    console.log('✅ Datos completos para registrar powerup:', 
        hasGameId && hasRoundId && hasPlayerIds);
    console.log('✅ Inventarios válidos:', hasValidInventories);
    
    if (!hasGameId) console.error('❌ Falta currentGameId');
    if (!hasRoundId) console.error('❌ Falta currentRoundId');
    if (!hasPlayerIds) console.error('❌ Falta playerIds');
    if (!hasValidInventories) console.error('❌ Inventarios de powerups no son arrays válidos');
    
    return { hasGameId, hasRoundId, hasPlayerIds, hasValidInventories };
}

// Función para verificar directamente en la base de datos si se registró
export async function checkPowerupRegistration(id_uso) {
    try {
        console.log('🔍 Verificando registro en DB para id_uso:', id_uso);
        const response = await fetch(`${server}/api/powerups/usage/${id_uso}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Powerup encontrado en DB:', data);
            return data;
        } else {
            console.log('❌ Powerup no encontrado en DB');
            return null;
        }
    } catch (error) {
        console.error('❌ Error verificando registro:', error);
        return null;
    }
}

// Función para obtener todos los powerups registrados (para debug)
export async function getAllPowerupUsage() {
    try {
        console.log('📊 Obteniendo todos los powerups registrados...');
        const response = await fetch(`${server}/api/powerups/usage`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Powerups registrados:', data);
            return data;
        } else {
            console.error('❌ Error obteniendo powerups:', response.status);
            return null;
        }
    } catch (error) {
        console.error('❌ Error en la petición:', error);
        return null;
    }
}

// Función completa de diagnóstico
export async function fullPowerupDiagnostic() {
    console.log('🔬 === DIAGNÓSTICO COMPLETO DE POWERUPS ===');
    
    // 1. Verificar servidor
    console.log('1️⃣ Verificando servidor...');
    const serverOk = await checkServerStatus();
    console.log(`   Servidor: ${serverOk ? '✅ OK' : '❌ ERROR'}`);
    
    // 2. Ver estado actual
    console.log('2️⃣ Estado actual de currentGamePlayers:');
    console.log('   ', currentGamePlayers);
    
    // 3. Testear con datos conocidos
    console.log('3️⃣ Test con datos de prueba...');
    const testResult = await testPowerupUsage();
    console.log(`   Test: ${testResult ? '✅ EXITOSO' : '❌ FALLÓ'}`);
    
    // 4. Ver registros existentes
    console.log('4️⃣ Powerups registrados actualmente en DB:');
    const allUsage = await getAllPowerupUsage();
    if (allUsage && allUsage.data) {
        console.log(`   📊 Total registrados: ${allUsage.total}`);
        allUsage.data.slice(0, 5).forEach((usage, i) => {
            console.log(`   ${i+1}. ${usage.powerup_nombre} por ${usage.jugador_email} - ${usage.fecha_uso}`);
        });
    }
    
    console.log('🔬 === FIN DEL DIAGNÓSTICO ===');
}

// NUEVO: Función para actualizar el ganador de una ronda
export async function updateRoundWinner(roundId, winnerId) {
    try {
        console.log('🏆 Actualizando ganador de ronda:', { roundId, winnerId });
        
        const response = await fetch(`${server}/api/rounds/${roundId}/winner`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ganador_id: winnerId
            })
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { 
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    raw: await response.text() 
                };
            }
            console.error('❌ Server error response:', errorData);
            throw new Error(errorData.message || `Error actualizando ganador de ronda (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Ganador de ronda actualizado exitosamente:', data);
        return data;

    } catch (error) {
        console.error('❌ Error actualizando ganador de ronda:', error);
        
        // Verificar si es un error de red
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('❌ Posible error de conexión con el servidor');
            throw new Error('No se pudo conectar con el servidor. Verifica que esté ejecutándose en ' + server);
        }
        
        throw error;
    }
}

// Función para finalizar una partida actualizando ganador, fecha fin y duración
export async function finalizeGame(gameId, winnerId, durationMs) {
    try {
        console.log('🏆 Finalizando partida:', { gameId, winnerId, durationMs });
        
        const durationSeconds = Math.round(durationMs / 1000);
        
        const response = await fetch(`${server}/api/games/${gameId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ganador_id: winnerId,
                fecha_fin: new Date().toISOString(),
                duracion: durationSeconds
            })
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { 
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    raw: await response.text() 
                };
            }
            console.error('❌ Server error response:', errorData);
            throw new Error(errorData.message || `Error finalizando partida (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Partida finalizada exitosamente:', data);
        return data;

    } catch (error) {
        console.error('❌ Error finalizando partida:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('❌ Posible error de conexión con el servidor');
            throw new Error('No se pudo conectar con el servidor. Verifica que esté ejecutándose en ' + server);
        }
        
        throw error;
    }
}

// Función para crear estadísticas de partida (suma de estadísticas de todas las rondas)
export async function createGameStats(gameId) {
    try {
        console.log('📊 Creando estadísticas de partida:', { gameId });
        
        const response = await fetch(`${server}/api/games/${gameId}/stats`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { 
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    raw: await response.text() 
                };
            }
            console.error('❌ Server error response:', errorData);
            throw new Error(errorData.message || `Error creando estadísticas de partida (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Estadísticas de partida creadas exitosamente:', data);
        return data;

    } catch (error) {
        console.error('❌ Error creando estadísticas de partida:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('❌ Posible error de conexión con el servidor');
            throw new Error('No se pudo conectar con el servidor. Verifica que esté ejecutándose en ' + server);
        }
        
        throw error;
    }
}

// Función auxiliar para convertir coordenadas a notación algebraica
function coordinateToAlgebraicAPI(row, col) {
    const file = String.fromCharCode(97 + col); // a-h
    const rank = 8 - row; // 8-1
    return file + rank;
}

// Función auxiliar para obtener ID de pieza por tipo y color
function getPieceIdAPI(pieceType, pieceColor) {
    // Nuevo mapeo basado en tipo + color
    const pieceMap = {
        'p_w': 1,  // Peón blanco
        'r_w': 2,  // Torre blanca
        'n_w': 3,  // Caballo blanco
        'b_w': 4,  // Alfil blanco
        'q_w': 5,  // Reina blanca
        'k_w': 6,  // Rey blanco
        'p_b': 7,  // Peón negro
        'r_b': 8,  // Torre negra
        'n_b': 9,  // Caballo negro
        'b_b': 10, // Alfil negro
        'q_b': 11, // Reina negra
        'k_b': 12  // Rey negro
    };
    
    const key = `${pieceType}_${pieceColor}`;
    return pieceMap[key] || 1; // Default a peón blanco si no se encuentra
}

// NUEVO: Función para diagnosticar el estado del gameContext antes de registrar turnos
export function debugTurnRegistration(gameContext, currentColor, pieceToMove, fr, fc, r, c, capturedPiece) {
    console.log('🔍 === DIAGNÓSTICO DE REGISTRO DE TURNO ===');
    
    // 1. Verificar datos básicos del contexto
    console.log('📊 Estado del gameContext:');
    console.log('   currentGameId:', gameContext?.currentGameId);
    console.log('   currentRoundId:', gameContext?.currentRoundId);
    console.log('   playerIds:', gameContext?.playerIds);
    console.log('   turnCounter:', gameContext?.turnCounter);
    
    // 2. Verificar datos del movimiento
    console.log('📊 Datos del movimiento:');
    console.log('   currentColor:', currentColor);
    console.log('   pieceToMove:', pieceToMove);
    console.log('   from [row, col]:', [fr, fc]);
    console.log('   to [row, col]:', [r, c]);
    console.log('   capturedPiece:', capturedPiece);
    
    // 3. Verificar funciones auxiliares
    console.log('📊 Verificando funciones auxiliares:');
    try {
        const algFrom = coordinateToAlgebraicAPI(fr, fc);
        const algTo = coordinateToAlgebraicAPI(r, c);
        const pieceId = getPieceIdAPI(pieceToMove.type, pieceToMove.color);
        
        console.log('   coordinateToAlgebraic funciona:');
        console.log('     desde:', algFrom);
        console.log('     hasta:', algTo);
        console.log('   getPieceId funciona:', pieceId);
    } catch (error) {
        console.error('❌ Error en funciones auxiliares:', error);
    }
    
    // 4. Simular datos que se enviarían
    console.log('📊 Datos que se enviarían al servidor:');
    try {
        const simulatedTurnData = {
            id_ronda: gameContext?.currentRoundId,
            id_jugador: gameContext?.playerIds?.[currentColor],
            id_pieza: getPieceIdAPI(pieceToMove.type, pieceToMove.color),
            numero_turno: (gameContext?.turnCounter || 0) + 1,
            posicion_desde: coordinateToAlgebraicAPI(fr, fc),
            posicion_hasta: coordinateToAlgebraicAPI(r, c),
            fue_captura: !!capturedPiece,
            tiempo_duracion: null
        };
        console.log('   simulatedTurnData:', simulatedTurnData);
    } catch (error) {
        console.error('❌ Error simulando datos:', error);
    }
    
    // 5. Verificar si todos los datos necesarios están presentes
    const missingData = [];
    if (!gameContext?.currentGameId) missingData.push('currentGameId');
    if (!gameContext?.currentRoundId) missingData.push('currentRoundId');
    if (!gameContext?.playerIds) missingData.push('playerIds');
    if (!gameContext?.playerIds?.[currentColor]) missingData.push(`playerIds[${currentColor}]`);
    
    if (missingData.length > 0) {
        console.error('❌ Datos faltantes:', missingData);
        return false;
    } else {
        console.log('✅ Todos los datos necesarios están presentes');
        return true;
    }
}

// NUEVO: Función para testear manualmente el registro de turnos
export async function testTurnRegistration() {
    console.log('🧪 Iniciando test manual de registro de turnos...');
    
    // Verificar servidor
    const serverOk = await checkServerStatus();
    if (!serverOk) {
        console.error('❌ Test fallido: Servidor no disponible');
        return false;
    }
    
    // Primero probar con datos mínimos válidos
    const testTurnData = {
        id_ronda: 1,        // Ronda 1 existe en la DB
        id_jugador: 1,      // Jugador 1 existe en la DB (mauro@example.com)
        id_pieza: 1,        // Pieza 1 existe en la DB (Peón blanco)
        numero_turno: 999,  // Número alto para evitar conflictos
        posicion_desde: 'e2',
        posicion_hasta: 'e4',
        fue_captura: false,
        tiempo_duracion: null
    };
    
    try {
        console.log('🧪 Enviando datos de prueba para turno:', testTurnData);
        const result = await registerTurnComplete(testTurnData);
        console.log('✅ Test de turno exitoso:', result);
        return true;
    } catch (error) {
        console.error('❌ Test de turno fallido:', error);
        return false;
    }
}

// NUEVO: Función para verificar si existen los datos referenciales necesarios
export async function checkTurnReferences(gameContext, currentColor, pieceType) {
    console.log('🔍 Verificando referencias para turno...');
    
    try {
        // Verificar ronda
        const roundResponse = await fetch(`${server}/api/rounds/stats?id_partida=${gameContext.currentGameId}`);
        if (roundResponse.ok) {
            const roundData = await roundResponse.json();
            console.log('✅ Rondas disponibles:', roundData.data?.map(r => r.rondaId));
        }
        
        // Verificar jugador
        const playerId = gameContext.playerIds?.[currentColor];
        if (playerId) {
            const playerResponse = await fetch(`${server}/api/playerstats?id_jugador=${playerId}`);
            if (playerResponse.ok) {
                const playerData = await playerResponse.json();
                console.log('✅ Jugador existe:', playerData.data?.[0]);
            }
        }
        
        // Verificar piezas disponibles
        const piecesResponse = await fetch(`${server}/api/pieces/complete`);
        if (piecesResponse.ok) {
            const piecesData = await piecesResponse.json();
            console.log('✅ Piezas disponibles:', piecesData.data?.slice(0, 5));
        }
        
    } catch (error) {
        console.error('❌ Error verificando referencias:', error);
    }
}

// NUEVO: Funciones para manejo de desbloqueos de powerups

// Obtener desbloqueos de un jugador
export async function getPlayerUnlocks(playerId) {
    try {
        console.log(`🔍 Obteniendo desbloqueos para jugador ID: ${playerId}`);
        const response = await fetch(`${server}/api/players/${playerId}/unlocks`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error obteniendo desbloqueos del jugador');
        }
        
        const data = await response.json();
        console.log('✅ Desbloqueos obtenidos:', data.data);
        return data.data;
    } catch (error) {
        console.error(`❌ Error obteniendo desbloqueos para jugador ${playerId}:`, error);
        throw error;
    }
}

// Desbloquear un powerup específico para un jugador
export async function unlockPowerupForPlayer(playerId, powerupName) {
    try {
        console.log(`🔓 Desbloqueando ${powerupName} para jugador ID: ${playerId}`);
        const response = await fetch(`${server}/api/players/${playerId}/unlock/${powerupName.toLowerCase()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error desbloqueando powerup');
        }
        
        const data = await response.json();
        console.log('✅ Powerup desbloqueado exitosamente:', data);
        return data.data;
    } catch (error) {
        console.error(`❌ Error desbloqueando ${powerupName} para jugador ${playerId}:`, error);
        throw error;
    }
}

// Obtener estadísticas completas de un jugador (incluyendo desbloqueos)
export async function getPlayerStats(playerId) {
    try {
        console.log(`📊 Obteniendo estadísticas completas para jugador ID: ${playerId}`);
        const response = await fetch(`${server}/api/players/${playerId}/stats`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error obteniendo estadísticas del jugador');
        }
        
        const data = await response.json();
        console.log('✅ Estadísticas obtenidas:', data.data);
        return data.data;
    } catch (error) {
        console.error(`❌ Error obteniendo estadísticas para jugador ${playerId}:`, error);
        throw error;
    }
}

// Función eliminada - se usa la del sistema existente en game.js

// Cargar desbloqueos de un jugador al iniciar el juego
export async function loadPlayerUnlocksIntoGame(playerId, gameContext) {
    try {
        const unlocks = await getPlayerUnlocks(playerId);
        console.log(`✅ Desbloqueos obtenidos para jugador ${playerId}:`, unlocks);
        return unlocks;
    } catch (error) {
        console.error(`❌ Error cargando desbloqueos para jugador ${playerId}:`, error);
        return null;
    }
}

// Exportar las funciones necesarias
export {
    NewUser,
    loginUser,
    setCurrentPlayer,
    getCurrentPlayerId,
    currentGamePlayers,
    registerTurnComplete
};

main();