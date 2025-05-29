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




app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
})
