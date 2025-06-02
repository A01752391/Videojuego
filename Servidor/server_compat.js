"use strict"

const express = require("express");
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

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
    fs.readFile(path.join(process.cwd(), '../chess-game/assets/html/index.html'), 'utf8', (err, html) => {
        if (err) {
            console.log('err: ', err)
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
                console.error('Error al cerrar conexión', closeError);
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
            total: games.length,
            estadisticas: {
                partidasFinalizadas: games.filter(g => g.ganador !== null).length,
                partidasEnProgreso: games.filter(g => g.ganador === null).length,
                fechaMasReciente: games.length > 0 ? games[0].fechaInicio : null,
                fechaMasAntigua: games.length > 0 ? games[games.length - 1].fechaInicio : null
            }
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

// ENPOINTS PARA VISTA_POWERUPS_POPULARES
// Obtener powerups más populares
app.get("/api/powerups", async (req, res) => {
    let connection = null;

    try {
        connection = await connectToDB();

        const nombre_powerup = req.query.nombre_powerup;
        
        let query = 'SELECT * FROM vista_powerups_populares';
        let params = [];

        if (nombre_powerup) {
            query += ' WHERE nombre LIKE ?';
            params.push(`%${nombre_powerup}%`);
        }

        // Ordenar por popularidad (más usados primero)
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

app.listen(port, () => {
    console.log(`🚀 Servidor PAWNED ejecutándose en http://localhost:${port}`);
    console.log(`📊 API Endpoints disponibles:`);
    console.log(`   GET /api/playerstats - Estadísticas de jugadores`);
    console.log(`   GET /api/games - Resumen de partidas`);
    console.log(`   GET /api/powerups - Powerups populares`);
    console.log(`💡 Leaderboard: http://localhost:${port}/assets/html/leaderboard.html`);
});
