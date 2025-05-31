"use strict"

import express from "express";
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

async function connectToDB() {
    return await mysql.createConnection({
        host: "localhost",
        user: "pawneddb",
        password: 'Pawned123',
        database: 'pawned',
    });
}

app.use('/css', express.static(path.join(process.cwd(), '../chess-game/assets/css')));
app.use('/js', express.static(path.join(process.cwd(), '../chess-game/assets/js')));
app.use('/images', express.static(path.join(process.cwd(), '../Imagenes')));

app.use(express.static(path.join(process.cwd(), '../chess-game')));

//Ruta principal a la página web

app.get('/', (req, res) => {
    const indexPath = path.join(process.cwd(), '../chess-game/assets/html/index.html');
    fs.readFile(indexPath, 'utf8', 
        (err, html) => {
            if(err) {
                console.error('Error reading index.html', err);
                res.status(500).send('There was an error: ' + err)
                return
            }
            console.log('Sending page...')
            res.send(html);
            console.log('Page sent!')
        })
});

// ENDPOINTS PARA VISTA_ESTADISTICAS_JUGADOR

// Leer información de usuarios

app.get("/api/playerstats", async (req, res) => {
    let connection = null;

    try {
        connection = await connectToDB();

        const id_jugador = req.query.id_jugador ? parseInt(req.query.id_jugador) : null;
        
        let query = 'SELECT * FROM vista_estadisticas_jugador';
        let params = [];

        if (id_jugador && !isNaN(id_jugador)) {
            query += ' WHERE id_jugador = ?';
            params.push(id_jugador);
        }

        // Orden de aparicion de usuarios
        query += ' ORDER BY puntaje_total DESC, victorias DESC, partidas_jugadas DESC';

        // Ejecutar consulta
        console.log('Query:', query); 
        const [rows] = await connection.execute(query, params);

        const stats = rows.map(row => ({
            jugadorId: row.id_jugador,
            email: row.email,
            victorias: row.victorias,
            partidasJugadas: row.partidas_jugadas,
            puntajeTotal: row.puntaje_total,
            turnosTotales: row.turnos_totales,
            piezasCapturadas: row.piezas_capturadas_total,
            muertes: row.muertes_total,
            powerupsUsados: row.powerups_usados_total
        }));

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            data: stats,
            total: stats.length,
        });
    } catch (error) {
        
        console.error('Error al obtener estadísticas de jugadores: ', error);

        // Errores específicos
        if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La vista vista_estadisticas_jugador no existe', 
                error: 'TABLE_NOT_FOUND' 
            });
        }
        else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                success: false,
                message: 'No se pudo conectar a la base de datos',
                error: 'DATABASE_CONNECTION_ERROR'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    } finally {

        // Cerrar conexión
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            }
            catch (closeError) {
                console.error('Error al cerrar conexión', closeError);
            }
        }
    }
});

// Registro de usuarios (sign-up)

app.post("/api/playerstats", async (req, res) => {
    let connection = null;

    try {
        const { email, password } = req.body;

        // Validaciones básicas
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'El email y contraseña son requeridos',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validación de longitud de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres',
                error: 'PASSWORD_TOO_SHORT'
            });
        }

        connection = await connectToDB();

        // Verificar si el usuario ya existe
        const checkEmailQuery = 'SELECT id_jugador FROM jugador WHERE email = ?';
        const [existingEmail] = await connection.execute(checkEmailQuery, [email]);

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Este email ya esta ligado a un usuario',
                error: 'EMAIL_ALREADY_EXISTS'
            });
        }

        const insertQuery = 'INSERT INTO jugador (email, password_player) VALUES (?, ?)';

        const [result] = await connection.execute(insertQuery, [email, password]);

        // Obtener estadisticas y datos del nuevo usuario
        const newPlayerQuery = 'SELECT * FROM vista_estadisticas_jugador WHERE id_jugador = ?';
        const [newPlayerData] = await connection.execute(newPlayerQuery, [result.insertId]);

        const newPlayer = newPlayerData[0];
        const playerStats = {
            jugadorId: newPlayer.id_jugador,
            email: newPlayer.email,
            victorias: newPlayer.victorias,
            partidasJugadas: newPlayer.partidas_jugadas,
            puntajeTotal: newPlayer.puntaje_total || 0,
            turnosTotales: newPlayer.turnos_totales || 0,
            piezasCapturadas: newPlayer.piezas_capturadas_total || 0,
            muertes: newPlayer.muertes_total || 0,
            powerupsUsados: newPlayer.powerups_usados_total || 0
        };

        res.status(201).json({
            success: true,
            message: 'Jugador registrado exitosamente',
            data: playerStats
        });
    } catch (error) {
        console.error('Error al registrar jugador: ', error);

        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                success: false,
                message: 'Ya existe un jugador con esas credenciales',
                error: 'DUPLICATE_ENTRY'
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión', closeError);
            }
        }
    }
});

// Entrada de usuarios (login)

app.post("/api/playerstats/login", async (req, res) => {
    let connection = null;

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos',
                error: 'MISSING_CREDENTIALS'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                 success: false,
                 message: 'Formato de email inválido',
                 error: 'INVALID_EMAIL_FORMAT'
            });
        }

        connection = await connectToDB();

        // Buscar usuario por email

        const userQuery = 'SELECT id_jugador, email, password_player FROM jugador WHERE email = ?';
        const [users] = await connection.execute(userQuery, [email]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
                error: 'INVALID_CREDENTIALS'
            });
        }

        const user = users[0];

        // Verificación de la contraseña
        if (user.password_jugador !== password) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas',
                error: 'INVALID_CREDENTIALS'
            });
        }

        // En caso de login exitoso - obtener estadisticas del usuario
        const statsQuery = 'SELECT * FROM vista_estadisticas_jugador WHERE id_jugador = ?';
        const [statsData] = await connection.execute(statsQuery, [user.id_jugador]);

        const userStats = statsData[0];
        const responseData = {
            jugadorId: userStats.id_jugador,
            email: userStats.email,
            victorias: userStats.victorias,
            partidasJugadas: userStats.partidas_jugadas,
            puntajeTotal: userStats.puntaje_total || 0,
            turnosTotales: userStats.turnos_totales || 0,
            piezasCapturadas: userStats.piezas_capturadas_total || 0,
            muertes: userStats.muertes_total || 0,
            powerupsUsados: userStats.powerups_usados_total || 0
        };

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: responseData
        });
    } catch (error) {
        console.error('Error en login', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión', closeError);
            }
        }
    }
});

// Update usuarios

app.patch("/api/playerstats/:id", async (req, res) => {

        let connection = null;

    try {
        // 1. Extraer y validar el ID del parámetro
        const jugadorId = parseInt(req.params.id);
        
        if (isNaN(jugadorId) || jugadorId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El ID del jugador debe ser un número válido',
                error: 'INVALID_PLAYER_ID'
            });
        }

        // 2. Extraer campos del body
        const { email, password, nombre_usuario } = req.body;

        // 3. Validar que al menos un campo esté presente
        if (!email && !password && !nombre_usuario) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
                error: 'NO_FIELDS_TO_UPDATE'
            });
        }

        // 4. Validaciones específicas de cada campo
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido',
                    error: 'INVALID_EMAIL_FORMAT'
                });
            }
        }

        if (password && password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres',
                error: 'PASSWORD_TOO_SHORT'
            });
        }

        if (nombre_usuario && (nombre_usuario.length < 3 || nombre_usuario.length > 50)) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario debe tener entre 3 y 50 caracteres',
                error: 'INVALID_USERNAME_LENGTH'
            });
        }

        // 5. Conectar a la base de datos
        connection = await connectToDB();

        // 6. Verificar que el jugador existe
        const checkPlayerQuery = 'SELECT id_jugador FROM jugador WHERE id_jugador = ?';
        const [existingPlayer] = await connection.execute(checkPlayerQuery, [jugadorId]);

        if (existingPlayer.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Jugador no encontrado',
                error: 'PLAYER_NOT_FOUND'
            });
        }

        // 7. Verificar duplicados si se está actualizando email
        if (email) {
            const checkEmailQuery = 'SELECT id_jugador FROM jugador WHERE email = ? AND id_jugador != ?';
            const [existingEmail] = await connection.execute(checkEmailQuery, [email, jugadorId]);

            if (existingEmail.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro jugador con ese email',
                    error: 'EMAIL_ALREADY_EXISTS'
                });
            }
        }

        // 8. Verificar duplicados si se está actualizando nombre_usuario
        if (nombre_usuario) {
            const checkUsernameQuery = 'SELECT id_jugador FROM jugador WHERE nombre_usuario = ? AND id_jugador != ?';
            const [existingUsername] = await connection.execute(checkUsernameQuery, [nombre_usuario, jugadorId]);

            if (existingUsername.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro jugador con ese nombre de usuario',
                    error: 'USERNAME_ALREADY_EXISTS'
                });
            }
        }

        // 9. Construir query UPDATE dinámicamente
        let updateFields = [];
        let values = [];

        if (email) {
            updateFields.push('email = ?');
            values.push(email);
        }

        if (password) {
            updateFields.push('password_player = ?'); // Usando el mismo nombre que en el POST
            values.push(password);
        }

        if (nombre_usuario) {
            updateFields.push('nombre_usuario = ?');
            values.push(nombre_usuario);
        }

        // Agregar el ID al final para el WHERE
        values.push(jugadorId);

        // 10. Ejecutar UPDATE en la tabla jugador (NO en la vista)
        const updateQuery = `UPDATE jugador SET ${updateFields.join(', ')} WHERE id_jugador = ?`;
        
        console.log('Update Query:', updateQuery);
        console.log('Update Values:', values);
        
        const [updateResult] = await connection.execute(updateQuery, values);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo actualizar el jugador',
                error: 'UPDATE_FAILED'
            });
        }

        // 11. Obtener datos actualizados desde la vista
        const statsQuery = 'SELECT * FROM vista_estadisticas_jugador WHERE id_jugador = ?';
        const [statsData] = await connection.execute(statsQuery, [jugadorId]);

        const updatedPlayer = statsData[0];
        const playerStats = {
            jugadorId: updatedPlayer.id_jugador,
            email: updatedPlayer.email,
            victorias: updatedPlayer.victorias,
            partidasJugadas: updatedPlayer.partidas_jugadas,
            puntajeTotal: updatedPlayer.puntaje_total || 0,
            turnosTotales: updatedPlayer.turnos_totales || 0,
            piezasCapturadas: updatedPlayer.piezas_capturadas_total || 0,
            muertes: updatedPlayer.muertes_total || 0,
            powerupsUsados: updatedPlayer.powerups_usados_total || 0
        };

        // 12. Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Jugador actualizado exitosamente',
            data: playerStats
        });

    } catch (error) {
        console.error('Error al actualizar jugador:', error);

        // Manejo de errores específicos
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                success: false,
                message: 'Ya existe un jugador con esos datos',
                error: 'DUPLICATE_ENTRY'
            });
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La tabla jugador no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            res.status(400).json({
                success: false,
                message: 'Campos de base de datos inválidos',
                error: 'INVALID_FIELDS'
            });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                success: false,
                message: 'No se pudo conectar a la base de datos',
                error: 'DATABASE_CONNECTION_ERROR'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        // Cerrar conexión
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// ENDPOINTS PARA VISTA_RESUMEN_PARTIDA

// Obtener resumen de partida

app.get("/api/games", async (req, res) => {
    let connection = null;

    try {
        connection = await connectToDB();

        const id_partida = req.query.id_partida ? parseInt(req.query.id_partida) : null;
        const jugador_email = req.query.jugador_email;
        
        let query = 'SELECT * FROM vista_resumen_partida';
        let params = [];
        let whereConditions = [];

        // Filtro por ID de partida
        if (id_partida && !isNaN(id_partida)) {
            whereConditions.push('id_partida = ?');
            params.push(id_partida);
        }

        // Filtro por email de jugador (en cualquier posición)
        if (jugador_email) {
            whereConditions.push('(jugador1 = ? OR jugador2 = ?)');
            params.push(jugador_email, jugador_email);
        }

        // Agregar WHERE si hay condiciones
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Ordenar por fecha más reciente
        query += ' ORDER BY fecha_inicio DESC';

        console.log('Query:', query);
        console.log('Params:', params);
        
        const [rows] = await connection.execute(query, params);

        const games = rows.map(row => ({
            partidaId: row.id_partida,
            fechaInicio: row.fecha_inicio,
            fechaFin: row.fecha_fin,
            duracion: row.duracion,
            jugador1: row.jugador1,
            jugador2: row.jugador2,
            ganador: row.ganador,
            piezasCapturadas: row.piezas_capturadas_total || 0,
            powerupsUsados: row.powerups_usados_total || 0
        }));

        res.status(200).json({
            success: true,
            data: games,
            total: games.length
        });

    } catch (error) {
        console.error('Error al obtener resumen de partidas:', error);

        if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La vista vista_resumen_partida no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                success: false,
                message: 'No se pudo conectar a la base de datos',
                error: 'DATABASE_CONNECTION_ERROR'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Crear nueva partida

app.post("/api/games", async (req, res) => {
    let connection = null;

    try {
        const { id_jugador1, id_jugador2, ganador_id, duracion } = req.body;

        // Validaciones básicas
        if (!id_jugador1 || !id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'Los IDs de ambos jugadores son requeridos',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (id_jugador1 === id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'Los jugadores deben ser diferentes',
                error: 'SAME_PLAYERS'
            });
        }

        // Validar que ganador_id sea uno de los dos jugadores
        if (ganador_id && ganador_id !== id_jugador1 && ganador_id !== id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'El ganador debe ser uno de los jugadores de la partida',
                error: 'INVALID_WINNER'
            });
        }

        connection = await connectToDB();

        // Verificar que ambos jugadores existen
        const checkPlayersQuery = 'SELECT id_jugador FROM jugador WHERE id_jugador IN (?, ?)';
        const [existingPlayers] = await connection.execute(checkPlayersQuery, [id_jugador1, id_jugador2]);

        if (existingPlayers.length !== 2) {
            return res.status(404).json({
                success: false,
                message: 'Uno o ambos jugadores no existen',
                error: 'PLAYERS_NOT_FOUND'
            });
        }

        // Insertar nueva partida en tabla Partida
        const insertQuery = `
            INSERT INTO Partida (id_jugador1, id_jugador2, ganador_id, duracion, fecha_inicio, fecha_fin) 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        `;
        
        const fechaFin = ganador_id ? 'CURRENT_TIMESTAMP' : null;
        const [result] = await connection.execute(insertQuery, [
            id_jugador1, 
            id_jugador2, 
            ganador_id || null, 
            duracion || null,
            ganador_id ? new Date() : null
        ]);

        // Obtener la partida recién creada desde la vista
        const newGameQuery = 'SELECT * FROM vista_resumen_partida WHERE id_partida = ?';
        const [newGameData] = await connection.execute(newGameQuery, [result.insertId]);

        const newGame = newGameData[0];
        const gameData = {
            partidaId: newGame.id_partida,
            fechaInicio: newGame.fecha_inicio,
            fechaFin: newGame.fecha_fin,
            duracion: newGame.duracion,
            jugador1: newGame.jugador1,
            jugador2: newGame.jugador2,
            ganador: newGame.ganador,
            piezasCapturadas: newGame.piezas_capturadas_total || 0,
            powerupsUsados: newGame.powerups_usados_total || 0
        };

        res.status(201).json({
            success: true,
            message: 'Partida creada exitosamente',
            data: gameData
        });

    } catch (error) {
        console.error('Error al crear partida:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(404).json({
                success: false,
                message: 'Uno o más jugadores no existen',
                error: 'FOREIGN_KEY_ERROR'
            });
        } else if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                success: false,
                message: 'Error de duplicado en la partida',
                error: 'DUPLICATE_ENTRY'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Update partida

app.patch("/api/games/:id", async (req, res) => {
    let connection = null;

    try {
        const partidaId = parseInt(req.params.id);
        
        if (isNaN(partidaId) || partidaId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la partida debe ser un número válido',
                error: 'INVALID_GAME_ID'
            });
        }

        const { ganador_id, duracion, fecha_fin } = req.body;

        // Validar que al menos un campo esté presente
        if (ganador_id === undefined && !duracion && !fecha_fin) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
                error: 'NO_FIELDS_TO_UPDATE'
            });
        }

        connection = await connectToDB();

        // Verificar que la partida existe y obtener datos actuales
        const checkGameQuery = 'SELECT id_jugador1, id_jugador2 FROM Partida WHERE id_partida = ?';
        const [existingGame] = await connection.execute(checkGameQuery, [partidaId]);

        if (existingGame.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Partida no encontrada',
                error: 'GAME_NOT_FOUND'
            });
        }

        const game = existingGame[0];

        // Validar ganador si se proporciona
        if (ganador_id && ganador_id !== game.id_jugador1 && ganador_id !== game.id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'El ganador debe ser uno de los jugadores de la partida',
                error: 'INVALID_WINNER'
            });
        }

        // Construir query UPDATE dinámicamente
        let updateFields = [];
        let values = [];

        if (ganador_id !== undefined) {
            updateFields.push('ganador_id = ?');
            values.push(ganador_id);
        }

        if (duracion) {
            updateFields.push('duracion = ?');
            values.push(duracion);
        }

        if (fecha_fin !== undefined) {
            updateFields.push('fecha_fin = ?');
            values.push(fecha_fin ? new Date(fecha_fin) : null);
        }

        values.push(partidaId);

        // Ejecutar UPDATE en tabla Partida
        const updateQuery = `UPDATE Partida SET ${updateFields.join(', ')} WHERE id_partida = ?`;
        
        console.log('Update Query:', updateQuery);
        console.log('Update Values:', values);
        
        const [updateResult] = await connection.execute(updateQuery, values);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo actualizar la partida',
                error: 'UPDATE_FAILED'
            });
        }

        // Obtener datos actualizados desde la vista
        const statsQuery = 'SELECT * FROM vista_resumen_partida WHERE id_partida = ?';
        const [statsData] = await connection.execute(statsQuery, [partidaId]);

        const updatedGame = statsData[0];
        const gameData = {
            partidaId: updatedGame.id_partida,
            fechaInicio: updatedGame.fecha_inicio,
            fechaFin: updatedGame.fecha_fin,
            duracion: updatedGame.duracion,
            jugador1: updatedGame.jugador1,
            jugador2: updatedGame.jugador2,
            ganador: updatedGame.ganador,
            piezasCapturadas: updatedGame.piezas_capturadas_total || 0,
            powerupsUsados: updatedGame.powerups_usados_total || 0
        };

        res.status(200).json({
            success: true,
            message: 'Partida actualizada exitosamente',
            data: gameData
        });

    } catch (error) {
        console.error('Error al actualizar partida:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(404).json({
                success: false,
                message: 'El ganador especificado no existe',
                error: 'FOREIGN_KEY_ERROR'
            });
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La tabla Partida no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// ENPOINTS PARA VISTA_POWERUPS_POPULARES

// Obtener powerups más populares

app.get("/api/powerups", async (req, res) => {
    let connection = null;

    try {
        connection = await connectToDB();

        const nombre_powerup = req.query.nombre_powerup;
        const min_usos = req.query.min_usos ? parseInt(req.query.min_usos) : null;
        
        let query = 'SELECT * FROM vista_powerups_populares';
        let params = [];
        let whereConditions = [];

        // Filtro por nombre de powerup
        if (nombre_powerup) {
            whereConditions.push('nombre LIKE ?');
            params.push(`%${nombre_powerup}%`);
        }

        // Filtro por mínimo de usos
        if (min_usos && !isNaN(min_usos)) {
            whereConditions.push('veces_usado >= ?');
            params.push(min_usos);
        }

        // Agregar WHERE si hay condiciones
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // La vista ya viene ordenada por veces_usado DESC, pero podemos mantenerlo
        query += ' ORDER BY veces_usado DESC';

        console.log('Query:', query);
        console.log('Params:', params);
        
        const [rows] = await connection.execute(query, params);

        const powerups = rows.map(row => ({
            nombre: row.nombre,
            vecesUsado: row.veces_usado,
            popularidad: row.veces_usado > 10 ? 'Alta' : 
                        row.veces_usado > 5 ? 'Media' : 'Baja'
        }));

        res.status(200).json({
            success: true,
            data: powerups,
            total: powerups.length,
            estadisticas: {
                totalUsos: powerups.reduce((sum, p) => sum + p.vecesUsado, 0),
                powerupMasPopular: powerups.length > 0 ? powerups[0].nombre : null,
                powerupMenosPopular: powerups.length > 0 ? powerups[powerups.length - 1].nombre : null
            }
        });

    } catch (error) {
        console.error('Error al obtener powerups populares:', error);

        if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La vista vista_powerups_populares no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                success: false,
                message: 'No se pudo conectar a la base de datos',
                error: 'DATABASE_CONNECTION_ERROR'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Crear nuevo powerup 

app.post("/api/powerups", async (req, res) => {
    let connection = null;

    try {
        const { nombre, descripcion } = req.body;

        // Validaciones básicas
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del powerup es requerido',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (nombre.length < 3 || nombre.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe tener entre 3 y 100 caracteres',
                error: 'INVALID_NAME_LENGTH'
            });
        }

        connection = await connectToDB();

        // Verificar que el powerup no existe
        const checkPowerupQuery = 'SELECT id_powerup FROM Powerup WHERE nombre = ?';
        const [existingPowerup] = await connection.execute(checkPowerupQuery, [nombre]);

        if (existingPowerup.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un powerup con ese nombre',
                error: 'POWERUP_ALREADY_EXISTS'
            });
        }

        // Insertar nuevo powerup en tabla Powerup
        const insertQuery = `
            INSERT INTO Powerup (nombre, descripcion) 
            VALUES (?, ?)
        `;
        
        const [result] = await connection.execute(insertQuery, [
            nombre, 
            descripcion || null
        ]);

        // Como es un powerup nuevo, no aparecerá en la vista hasta que se use
        // Pero podemos retornar los datos básicos
        const powerupData = {
            id_powerup: result.insertId,
            nombre: nombre,
            descripcion: descripcion || null,
            vecesUsado: 0,
            popularidad: 'Nueva'
        };

        res.status(201).json({
            success: true,
            message: 'Powerup creado exitosamente',
            data: powerupData,
            nota: 'El powerup aparecerá en las estadísticas cuando sea usado por primera vez'
        });

    } catch (error) {
        console.error('Error al crear powerup:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                success: false,
                message: 'Ya existe un powerup con ese nombre',
                error: 'DUPLICATE_ENTRY'
            });
        } else if (error.code === 'ER_DATA_TOO_LONG') {
            res.status(400).json({
                success: false,
                message: 'Los datos proporcionados son demasiado largos',
                error: 'DATA_TOO_LONG'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Update powerup

app.patch("/api/powerups/:id", async (req, res) => {
    let connection = null;

    try {
        const powerupId = parseInt(req.params.id);
        
        if (isNaN(powerupId) || powerupId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El ID del powerup debe ser un número válido',
                error: 'INVALID_POWERUP_ID'
            });
        }

        const { nombre, descripcion } = req.body;

        // Validar que al menos un campo esté presente
        if (!nombre && descripcion === undefined) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
                error: 'NO_FIELDS_TO_UPDATE'
            });
        }

        // Validaciones de campos
        if (nombre && (nombre.length < 3 || nombre.length > 100)) {
            return res.status(400).json({
                success: false,
                message: 'El nombre debe tener entre 3 y 100 caracteres',
                error: 'INVALID_NAME_LENGTH'
            });
        }

        connection = await connectToDB();

        // Verificar que el powerup existe
        const checkPowerupQuery = 'SELECT id_powerup, nombre FROM Powerup WHERE id_powerup = ?';
        const [existingPowerup] = await connection.execute(checkPowerupQuery, [powerupId]);

        if (existingPowerup.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Powerup no encontrado',
                error: 'POWERUP_NOT_FOUND'
            });
        }

        // Verificar duplicados si se está actualizando nombre
        if (nombre && nombre !== existingPowerup[0].nombre) {
            const checkNameQuery = 'SELECT id_powerup FROM Powerup WHERE nombre = ? AND id_powerup != ?';
            const [existingName] = await connection.execute(checkNameQuery, [nombre, powerupId]);

            if (existingName.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe otro powerup con ese nombre',
                    error: 'NAME_ALREADY_EXISTS'
                });
            }
        }

        // Construir query UPDATE dinámicamente
        let updateFields = [];
        let values = [];

        if (nombre) {
            updateFields.push('nombre = ?');
            values.push(nombre);
        }

        if (descripcion !== undefined) {
            updateFields.push('descripcion = ?');
            values.push(descripcion);
        }

        values.push(powerupId);

        // Ejecutar UPDATE en tabla Powerup
        const updateQuery = `UPDATE Powerup SET ${updateFields.join(', ')} WHERE id_powerup = ?`;
        
        console.log('Update Query:', updateQuery);
        console.log('Update Values:', values);
        
        const [updateResult] = await connection.execute(updateQuery, values);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo actualizar el powerup',
                error: 'UPDATE_FAILED'
            });
        }

        // Obtener datos actualizados desde la vista (si existe en estadísticas)
        const statsQuery = 'SELECT * FROM vista_powerups_populares WHERE nombre = ?';
        const finalName = nombre || existingPowerup[0].nombre;
        const [statsData] = await connection.execute(statsQuery, [finalName]);

        let powerupData;
        if (statsData.length > 0) {
            // El powerup está en las estadísticas
            const updated = statsData[0];
            powerupData = {
                nombre: updated.nombre,
                vecesUsado: updated.veces_usado,
                popularidad: updated.veces_usado > 10 ? 'Alta' : 
                            updated.veces_usado > 5 ? 'Media' : 'Baja'
            };
        } else {
            // El powerup existe pero no ha sido usado
            const powerupQuery = 'SELECT * FROM Powerup WHERE id_powerup = ?';
            const [powerupInfo] = await connection.execute(powerupQuery, [powerupId]);
            const powerup = powerupInfo[0];
            
            powerupData = {
                id_powerup: powerup.id_powerup,
                nombre: powerup.nombre,
                descripcion: powerup.descripcion,
                vecesUsado: 0,
                popularidad: 'Sin usar'
            };
        }

        res.status(200).json({
            success: true,
            message: 'Powerup actualizado exitosamente',
            data: powerupData
        });

    } catch (error) {
        console.error('Error al actualizar powerup:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                success: false,
                message: 'Ya existe un powerup con ese nombre',
                error: 'DUPLICATE_ENTRY'
            });
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La tabla Powerup no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Endpoint para registrar uso de powerup

app.post("/api/powerups/use", async (req, res) => {
    let connection = null;

    try {
        const { id_jugador, id_powerup, id_partida, id_ronda } = req.body;

        // Validaciones básicas
        if (!id_jugador || !id_powerup || !id_partida || !id_ronda) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos (id_jugador, id_powerup, id_partida, id_ronda)',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        connection = await connectToDB();

        // Verificar que el jugador existe
        const checkPlayerQuery = 'SELECT id_jugador FROM Jugador WHERE id_jugador = ?';
        const [existingPlayer] = await connection.execute(checkPlayerQuery, [id_jugador]);

        if (existingPlayer.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Jugador no encontrado',
                error: 'PLAYER_NOT_FOUND'
            });
        }

        // Verificar que el powerup existe
        const checkPowerupQuery = 'SELECT id_powerup, nombre FROM Powerup WHERE id_powerup = ?';
        const [existingPowerup] = await connection.execute(checkPowerupQuery, [id_powerup]);

        if (existingPowerup.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Powerup no encontrado',
                error: 'POWERUP_NOT_FOUND'
            });
        }

        // Verificar que la partida existe
        const checkGameQuery = 'SELECT id_partida FROM Partida WHERE id_partida = ?';
        const [existingGame] = await connection.execute(checkGameQuery, [id_partida]);

        if (existingGame.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Partida no encontrada',
                error: 'GAME_NOT_FOUND'
            });
        }

        // Registrar uso del powerup en tabla Powerup_usado
        const insertQuery = `
            INSERT INTO Powerup_usado (id_jugador, id_powerup, id_partida, id_ronda, fecha_uso) 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        const [result] = await connection.execute(insertQuery, [
            id_jugador, 
            id_powerup, 
            id_partida, 
            id_ronda
        ]);

        // Obtener estadísticas actualizadas del powerup
        const statsQuery = 'SELECT * FROM vista_powerups_populares WHERE nombre = ?';
        const [statsData] = await connection.execute(statsQuery, [existingPowerup[0].nombre]);

        const powerupStats = statsData[0];
        const usageData = {
            id_uso: result.insertId,
            powerup: powerupStats.nombre,
            vecesUsado: powerupStats.veces_usado,
            popularidad: powerupStats.veces_usado > 10 ? 'Alta' : 
                        powerupStats.veces_usado > 5 ? 'Media' : 'Baja',
            fechaUso: new Date()
        };

        res.status(201).json({
            success: true,
            message: 'Uso de powerup registrado exitosamente',
            data: usageData
        });

    } catch (error) {
        console.error('Error al registrar uso de powerup:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(404).json({
                success: false,
                message: 'Una o más referencias no existen (jugador, powerup, partida, ronda)',
                error: 'FOREIGN_KEY_ERROR'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// ENDPOINTS PARA VISTA_ESTADISTICAS_RONDA

// Obtener estadísticas de la ronda

app.get("/api/rounds/stats", async (req, res) => {
    let connection = null;

    try {
        connection = await connectToDB();

        const id_jugador = req.query.id_jugador ? parseInt(req.query.id_jugador) : null;
        const email_jugador = req.query.email_jugador;
        const min_rondas = req.query.min_rondas ? parseInt(req.query.min_rondas) : null;
        
        let query = 'SELECT * FROM vista_estadisticas_ronda';
        let params = [];
        let whereConditions = [];

        // Filtro por ID de jugador
        if (id_jugador && !isNaN(id_jugador)) {
            whereConditions.push('id_jugador = ?');
            params.push(id_jugador);
        }

        // Filtro por email de jugador
        if (email_jugador) {
            whereConditions.push('email = ?');
            params.push(email_jugador);
        }

        // Filtro por mínimo de rondas jugadas
        if (min_rondas && !isNaN(min_rondas)) {
            whereConditions.push('rondas_jugadas >= ?');
            params.push(min_rondas);
        }

        // Agregar WHERE si hay condiciones
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Ordenar por mejor rendimiento (más piezas capturadas y menos perdidas)
        query += ' ORDER BY piezas_capturadas DESC, piezas_perdidas ASC, rondas_jugadas DESC';

        console.log('Query:', query);
        console.log('Params:', params);
        
        const [rows] = await connection.execute(query, params);

        const roundStats = rows.map(row => ({
            jugadorId: row.id_jugador,
            email: row.email,
            rondasJugadas: row.rondas_jugadas,
            piezasCapturadas: row.piezas_capturadas,
            piezasPerdidas: row.piezas_perdidas,
            powerupsUsados: row.powerups_usados,
            turnosTomados: row.turnos_tomados,
            // Agregar métricas calculadas
            eficiencia: row.piezas_perdidas > 0 ? 
                       (row.piezas_capturadas / row.piezas_perdidas).toFixed(2) : 
                       row.piezas_capturadas > 0 ? 'Perfecta' : '0',
            promedioTurnosPorRonda: row.rondas_jugadas > 0 ? 
                                   (row.turnos_tomados / row.rondas_jugadas).toFixed(1) : '0',
            promedioPowerupsPorRonda: row.rondas_jugadas > 0 ? 
                                     (row.powerups_usados / row.rondas_jugadas).toFixed(1) : '0'
        }));

        res.status(200).json({
            success: true,
            data: roundStats,
            total: roundStats.length,
            estadisticas: {
                totalRondasJugadas: roundStats.reduce((sum, p) => sum + p.rondasJugadas, 0),
                totalPiezasCapturadas: roundStats.reduce((sum, p) => sum + p.piezasCapturadas, 0),
                totalPiezasPerdidas: roundStats.reduce((sum, p) => sum + p.piezasPerdidas, 0),
                jugadorMasActivo: roundStats.length > 0 ? roundStats[0].email : null
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de rondas:', error);

        if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La vista vista_estadisticas_ronda no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                success: false,
                message: 'No se pudo conectar a la base de datos',
                error: 'DATABASE_CONNECTION_ERROR'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Crear una nueva ronda y registras estadísticas

app.post("/api/rounds", async (req, res) => {
    let connection = null;

    try {
        const { id_partida, ganador_id, numero_ronda, ventaja_aplicada } = req.body;

        // Validaciones básicas
        if (!id_partida || !numero_ronda) {
            return res.status(400).json({
                success: false,
                message: 'ID de partida y número de ronda son requeridos',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (numero_ronda < 1 || numero_ronda > 255) {
            return res.status(400).json({
                success: false,
                message: 'El número de ronda debe estar entre 1 y 255',
                error: 'INVALID_ROUND_NUMBER'
            });
        }

        connection = await connectToDB();

        // Verificar que la partida existe
        const checkGameQuery = 'SELECT id_jugador1, id_jugador2 FROM Partida WHERE id_partida = ?';
        const [existingGame] = await connection.execute(checkGameQuery, [id_partida]);

        if (existingGame.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Partida no encontrada',
                error: 'GAME_NOT_FOUND'
            });
        }

        const game = existingGame[0];

        // Validar ganador si se proporciona
        if (ganador_id && ganador_id !== game.id_jugador1 && ganador_id !== game.id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'El ganador debe ser uno de los jugadores de la partida',
                error: 'INVALID_WINNER'
            });
        }

        // Verificar que no existe ya una ronda con ese número en la partida
        const checkRoundQuery = 'SELECT id_ronda FROM Ronda WHERE id_partida = ? AND numero_ronda = ?';
        const [existingRound] = await connection.execute(checkRoundQuery, [id_partida, numero_ronda]);

        if (existingRound.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una ronda con ese número en esta partida',
                error: 'ROUND_ALREADY_EXISTS'
            });
        }

        // Insertar nueva ronda en tabla Ronda
        const insertRoundQuery = `
            INSERT INTO Ronda (id_partida, ganador_id, ventaja_aplicada, numero_ronda) 
            VALUES (?, ?, ?, ?)
        `;
        
        const [result] = await connection.execute(insertRoundQuery, [
            id_partida, 
            ganador_id || null, 
            ventaja_aplicada || false, 
            numero_ronda
        ]);

        // Crear estadísticas iniciales para ambos jugadores
        const insertStatsQuery = `
            INSERT INTO Estadistica_ronda (id_ronda, id_jugador, piezas_capturadas, piezas_perdidas, powerups_usados, turnos_tomados) 
            VALUES (?, ?, 0, 0, 0, 0), (?, ?, 0, 0, 0, 0)
        `;
        
        await connection.execute(insertStatsQuery, [
            result.insertId, game.id_jugador1,
            result.insertId, game.id_jugador2
        ]);

        // Obtener datos de la ronda recién creada
        const newRoundQuery = `
            SELECT r.*, p.fecha_inicio as fecha_partida, 
                   j1.email as jugador1_email, j2.email as jugador2_email,
                   jg.email as ganador_email
            FROM Ronda r
            JOIN Partida p ON r.id_partida = p.id_partida
            JOIN Jugador j1 ON p.id_jugador1 = j1.id_jugador
            JOIN Jugador j2 ON p.id_jugador2 = j2.id_jugador
            LEFT JOIN Jugador jg ON r.ganador_id = jg.id_jugador
            WHERE r.id_ronda = ?
        `;
        const [newRoundData] = await connection.execute(newRoundQuery, [result.insertId]);

        const newRound = newRoundData[0];
        const roundData = {
            rondaId: newRound.id_ronda,
            partidaId: newRound.id_partida,
            numeroRonda: newRound.numero_ronda,
            ganador: newRound.ganador_email,
            ventajaAplicada: newRound.ventaja_aplicada,
            jugador1: newRound.jugador1_email,
            jugador2: newRound.jugador2_email,
            fechaPartida: newRound.fecha_partida
        };

        res.status(201).json({
            success: true,
            message: 'Ronda creada exitosamente',
            data: roundData
        });

    } catch (error) {
        console.error('Error al crear ronda:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(404).json({
                success: false,
                message: 'La partida o ganador especificado no existe',
                error: 'FOREIGN_KEY_ERROR'
            });
        } else if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                success: false,
                message: 'Ya existe una ronda con esos datos',
                error: 'DUPLICATE_ENTRY'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Update estadísticas de ronda

app.patch("/api/rounds/stats/:id_jugador/:id_ronda", async (req, res) => {
    let connection = null;

    try {
        const jugadorId = parseInt(req.params.id_jugador);
        const rondaId = parseInt(req.params.id_ronda);
        
        if (isNaN(jugadorId) || jugadorId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El ID del jugador debe ser un número válido',
                error: 'INVALID_PLAYER_ID'
            });
        }

        if (isNaN(rondaId) || rondaId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la ronda debe ser un número válido',
                error: 'INVALID_ROUND_ID'
            });
        }

        const { piezas_capturadas, piezas_perdidas, powerups_usados, turnos_tomados } = req.body;

        // Validar que al menos un campo esté presente
        if (piezas_capturadas === undefined && piezas_perdidas === undefined && 
            powerups_usados === undefined && turnos_tomados === undefined) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
                error: 'NO_FIELDS_TO_UPDATE'
            });
        }

        // Validar valores no negativos
        const fields = { piezas_capturadas, piezas_perdidas, powerups_usados, turnos_tomados };
        for (const [field, value] of Object.entries(fields)) {
            if (value !== undefined && (value < 0 || value > 255)) {
                return res.status(400).json({
                    success: false,
                    message: `${field} debe estar entre 0 y 255`,
                    error: 'INVALID_FIELD_VALUE'
                });
            }
        }

        connection = await connectToDB();

        // Verificar que la estadística de ronda existe
        const checkStatsQuery = 'SELECT id_estadisticaronda FROM Estadistica_ronda WHERE id_jugador = ? AND id_ronda = ?';
        const [existingStats] = await connection.execute(checkStatsQuery, [jugadorId, rondaId]);

        if (existingStats.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Estadística de ronda no encontrada para este jugador',
                error: 'ROUND_STATS_NOT_FOUND'
            });
        }

        // Construir query UPDATE dinámicamente
        let updateFields = [];
        let values = [];

        if (piezas_capturadas !== undefined) {
            updateFields.push('piezas_capturadas = ?');
            values.push(piezas_capturadas);
        }

        if (piezas_perdidas !== undefined) {
            updateFields.push('piezas_perdidas = ?');
            values.push(piezas_perdidas);
        }

        if (powerups_usados !== undefined) {
            updateFields.push('powerups_usados = ?');
            values.push(powerups_usados);
        }

        if (turnos_tomados !== undefined) {
            updateFields.push('turnos_tomados = ?');
            values.push(turnos_tomados);
        }

        values.push(jugadorId, rondaId);

        // Ejecutar UPDATE en tabla Estadistica_ronda
        const updateQuery = `UPDATE Estadistica_ronda SET ${updateFields.join(', ')} WHERE id_jugador = ? AND id_ronda = ?`;
        
        console.log('Update Query:', updateQuery);
        console.log('Update Values:', values);
        
        const [updateResult] = await connection.execute(updateQuery, values);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo actualizar las estadísticas de la ronda',
                error: 'UPDATE_FAILED'
            });
        }

        // Obtener estadísticas actualizadas desde la vista
        const statsQuery = 'SELECT * FROM vista_estadisticas_ronda WHERE id_jugador = ?';
        const [statsData] = await connection.execute(statsQuery, [jugadorId]);

        const updatedStats = statsData[0];
        const roundStatsData = {
            jugadorId: updatedStats.id_jugador,
            email: updatedStats.email,
            rondasJugadas: updatedStats.rondas_jugadas,
            piezasCapturadas: updatedStats.piezas_capturadas,
            piezasPerdidas: updatedStats.piezas_perdidas,
            powerupsUsados: updatedStats.powerups_usados,
            turnosTomados: updatedStats.turnos_tomados,
            eficiencia: updatedStats.piezas_perdidas > 0 ? 
                       (updatedStats.piezas_capturadas / updatedStats.piezas_perdidas).toFixed(2) : 
                       updatedStats.piezas_capturadas > 0 ? 'Perfecta' : '0',
            promedioTurnosPorRonda: updatedStats.rondas_jugadas > 0 ? 
                                   (updatedStats.turnos_tomados / updatedStats.rondas_jugadas).toFixed(1) : '0'
        };

        res.status(200).json({
            success: true,
            message: 'Estadísticas de ronda actualizadas exitosamente',
            data: roundStatsData
        });

    } catch (error) {
        console.error('Error al actualizar estadísticas de ronda:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(404).json({
                success: false,
                message: 'El jugador o ronda especificado no existe',
                error: 'FOREIGN_KEY_ERROR'
            });
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La tabla Estadistica_ronda no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// ENDPOINTS PARA VISTA_PARTIDAS_COMPLETA

// Obtener partidas completas 

app.get("/api/games/complete", async (req, res) => {
    let connection = null;

    try {
        connection = await connectToDB();

        const id_partida = req.query.id_partida ? parseInt(req.query.id_partida) : null;
        const jugador_email = req.query.jugador_email;
        const estado_partida = req.query.estado_partida; // 'finalizada', 'en_progreso', 'todas'
        const fecha_desde = req.query.fecha_desde;
        const fecha_hasta = req.query.fecha_hasta;
        
        let query = 'SELECT * FROM vista_partidas_completa';
        let params = [];
        let whereConditions = [];

        // Filtro por ID de partida
        if (id_partida && !isNaN(id_partida)) {
            whereConditions.push('id_partida = ?');
            params.push(id_partida);
        }

        // Filtro por email de jugador (en cualquier posición)
        if (jugador_email) {
            whereConditions.push('(jugador1_email = ? OR jugador2_email = ?)');
            params.push(jugador_email, jugador_email);
        }

        // Filtro por estado de partida
        if (estado_partida) {
            if (estado_partida === 'finalizada') {
                whereConditions.push('ganador_id IS NOT NULL');
            } else if (estado_partida === 'en_progreso') {
                whereConditions.push('ganador_id IS NULL');
            }
            // Si es 'todas', no agregamos filtro
        }

        // Filtro por fecha desde
        if (fecha_desde) {
            whereConditions.push('DATE(fecha_inicio) >= ?');
            params.push(fecha_desde);
        }

        // Filtro por fecha hasta
        if (fecha_hasta) {
            whereConditions.push('DATE(fecha_inicio) <= ?');
            params.push(fecha_hasta);
        }

        // Agregar WHERE si hay condiciones
        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        // Ordenar por fecha más reciente
        query += ' ORDER BY fecha_inicio DESC';

        console.log('Query:', query);
        console.log('Params:', params);
        
        const [rows] = await connection.execute(query, params);

        const completeGames = rows.map(row => ({
            partidaId: row.id_partida,
            fechaInicio: row.fecha_inicio,
            fechaFin: row.fecha_fin,
            duracion: row.duracion,
            jugador1Id: row.id_jugador1,
            jugador2Id: row.id_jugador2,
            ganadorId: row.ganador_id,
            jugador1Email: row.jugador1_email,
            jugador2Email: row.jugador2_email,
            ganadorEmail: row.ganador_email,
            // Información adicional calculada
            estado: row.ganador_id ? 'Finalizada' : 'En progreso',
            duracionFormateada: row.duracion || 'No disponible'
        }));

        res.status(200).json({
            success: true,
            data: completeGames,
            total: completeGames.length,
            estadisticas: {
                partidasFinalizadas: completeGames.filter(g => g.estado === 'Finalizada').length,
                partidasEnProgreso: completeGames.filter(g => g.estado === 'En progreso').length,
                fechaMasReciente: completeGames.length > 0 ? completeGames[0].fechaInicio : null,
                fechaMasAntigua: completeGames.length > 0 ? completeGames[completeGames.length - 1].fechaInicio : null
            }
        });

    } catch (error) {
        console.error('Error al obtener partidas completas:', error);

        if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La vista vista_partidas_completa no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({
                success: false,
                message: 'No se pudo conectar a la base de datos',
                error: 'DATABASE_CONNECTION_ERROR'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Crear partida completa

app.post("/api/games/complete", async (req, res) => {
    let connection = null;

    try {
        const { id_jugador1, id_jugador2, duracion_estimada } = req.body;

        // Validaciones básicas
        if (!id_jugador1 || !id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'Los IDs de ambos jugadores son requeridos',
                error: 'MISSING_REQUIRED_FIELDS'
            });
        }

        if (id_jugador1 === id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'Los jugadores deben ser diferentes',
                error: 'SAME_PLAYERS'
            });
        }

        connection = await connectToDB();

        // Verificar que ambos jugadores existen
        const checkPlayersQuery = 'SELECT id_jugador, email FROM Jugador WHERE id_jugador IN (?, ?)';
        const [existingPlayers] = await connection.execute(checkPlayersQuery, [id_jugador1, id_jugador2]);

        if (existingPlayers.length !== 2) {
            return res.status(404).json({
                success: false,
                message: 'Uno o ambos jugadores no existen',
                error: 'PLAYERS_NOT_FOUND'
            });
        }

        // Insertar nueva partida en tabla Partida
        const insertPartidaQuery = `
            INSERT INTO Partida (id_jugador1, id_jugador2, fecha_inicio, duracion) 
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
        `;
        
        const [partidaResult] = await connection.execute(insertPartidaQuery, [
            id_jugador1, 
            id_jugador2, 
            duracion_estimada || null
        ]);

        const partidaId = partidaResult.insertId;

        // Obtener la partida completa recién creada desde la vista
        const newGameQuery = 'SELECT * FROM vista_partidas_completa WHERE id_partida = ?';
        const [newGameData] = await connection.execute(newGameQuery, [partidaId]);

        const newGame = newGameData[0];
        const completeGameData = {
            partidaId: newGame.id_partida,
            fechaInicio: newGame.fecha_inicio,
            fechaFin: newGame.fecha_fin,
            duracion: newGame.duracion,
            jugador1Id: newGame.id_jugador1,
            jugador2Id: newGame.id_jugador2,
            ganadorId: newGame.ganador_id,
            jugador1Email: newGame.jugador1_email,
            jugador2Email: newGame.jugador2_email,
            ganadorEmail: newGame.ganador_email,
            estado: 'En progreso'
        };

        res.status(201).json({
            success: true,
            message: 'Partida completa creada exitosamente',
            data: completeGameData
        });

    } catch (error) {
        console.error('Error al crear partida completa:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(404).json({
                success: false,
                message: 'Uno o más jugadores no existen',
                error: 'FOREIGN_KEY_ERROR'
            });
        } else if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({
                success: false,
                message: 'Error de duplicado en la partida',
                error: 'DUPLICATE_ENTRY'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});

// Update partida completa

app.patch("/api/games/complete/:id", async (req, res) => {
    let connection = null;

    try {
        const partidaId = parseInt(req.params.id);
        
        if (isNaN(partidaId) || partidaId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El ID de la partida debe ser un número válido',
                error: 'INVALID_GAME_ID'
            });
        }

        const { ganador_id, duracion_final, fecha_fin } = req.body;

        // Validar que al menos un campo esté presente
        if (ganador_id === undefined && !duracion_final && fecha_fin === undefined) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionaron campos para actualizar',
                error: 'NO_FIELDS_TO_UPDATE'
            });
        }

        connection = await connectToDB();

        // Verificar que la partida existe y obtener datos actuales
        const checkGameQuery = 'SELECT id_jugador1, id_jugador2, ganador_id FROM Partida WHERE id_partida = ?';
        const [existingGame] = await connection.execute(checkGameQuery, [partidaId]);

        if (existingGame.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Partida no encontrada',
                error: 'GAME_NOT_FOUND'
            });
        }

        const game = existingGame[0];

        // Validar ganador si se proporciona
        if (ganador_id && ganador_id !== game.id_jugador1 && ganador_id !== game.id_jugador2) {
            return res.status(400).json({
                success: false,
                message: 'El ganador debe ser uno de los jugadores de la partida',
                error: 'INVALID_WINNER'
            });
        }

        // Construir query UPDATE dinámicamente
        let updateFields = [];
        let values = [];

        if (ganador_id !== undefined) {
            updateFields.push('ganador_id = ?');
            values.push(ganador_id);
            
            // Si se establece un ganador y no se especifica fecha_fin, usar timestamp actual
            if (fecha_fin === undefined) {
                updateFields.push('fecha_fin = CURRENT_TIMESTAMP');
            }
        }

        if (duracion_final) {
            updateFields.push('duracion = ?');
            values.push(duracion_final);
        }

        if (fecha_fin !== undefined) {
            updateFields.push('fecha_fin = ?');
            values.push(fecha_fin ? new Date(fecha_fin) : null);
        }

        values.push(partidaId);

        // Ejecutar UPDATE en tabla Partida
        const updatePartidaQuery = `UPDATE Partida SET ${updateFields.join(', ')} WHERE id_partida = ?`;
        
        console.log('Update Partida Query:', updatePartidaQuery);
        console.log('Update Partida Values:', values);
        
        const [updateResult] = await connection.execute(updatePartidaQuery, values);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo actualizar la partida',
                error: 'UPDATE_FAILED'
            });
        }

        // Obtener datos actualizados desde la vista
        const statsQuery = 'SELECT * FROM vista_partidas_completa WHERE id_partida = ?';
        const [statsData] = await connection.execute(statsQuery, [partidaId]);

        const updatedGame = statsData[0];
        const completeGameData = {
            partidaId: updatedGame.id_partida,
            fechaInicio: updatedGame.fecha_inicio,
            fechaFin: updatedGame.fecha_fin,
            duracion: updatedGame.duracion,
            jugador1Id: updatedGame.id_jugador1,
            jugador2Id: updatedGame.id_jugador2,
            ganadorId: updatedGame.ganador_id,
            jugador1Email: updatedGame.jugador1_email,
            jugador2Email: updatedGame.jugador2_email,
            ganadorEmail: updatedGame.ganador_email,
            estado: updatedGame.ganador_id ? 'Finalizada' : 'En progreso'
        };

        res.status(200).json({
            success: true,
            message: 'Partida completa actualizada exitosamente',
            data: completeGameData
        });

    } catch (error) {
        console.error('Error al actualizar partida completa:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(404).json({
                success: false,
                message: 'El ganador especificado no existe',
                error: 'FOREIGN_KEY_ERROR'
            });
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(404).json({
                success: false,
                message: 'La tabla Partida no existe',
                error: 'TABLE_NOT_FOUND'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }

    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('Conexión a DB cerrada correctamente');
            } catch (closeError) {
                console.error('Error al cerrar conexión:', closeError);
            }
        }
    }
});



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
})
