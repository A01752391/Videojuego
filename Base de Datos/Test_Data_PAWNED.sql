-- Script para insertar datos de prueba para el leaderboard
-- Ejecutar después de crear las tablas principales

USE pawned;

-- Insertar jugadores de prueba
INSERT INTO Jugador (email, password_player, victorias) VALUES 
('admin@pawned.com', 'admin123', 15),
('player1@chess.com', 'password1', 12),
('master@game.com', 'secure123', 20),
('rookie@beginner.com', 'start123', 3),
('pro@expert.com', 'expert456', 18),
('casual@player.com', 'casual789', 7),
('champion@winner.com', 'champ101', 25),
('student@learn.com', 'study123', 5),
('veteran@old.com', 'old456', 22),
('newcomer@fresh.com', 'new789', 1);

-- Insertar powerups
INSERT INTO Powerup (nombre, descripcion) VALUES 
('Shield', 'Protege una pieza de ser capturada'),
('Pawn Range', 'Permite que un peón se mueva como una reina'),
('Fence', 'Bloquea una casilla del tablero'),
('Extra Move', 'Otorga un movimiento adicional'),
('Evolution', 'Convierte un peón en reina'),
('Crazy King', 'El rey puede moverse como una reina por un turno'),
('Blast', 'Elimina piezas en un área'),
('Cage', 'Encierra una pieza enemiga'),
('Horizontal Portal', 'Permite teletransporte horizontal'),
('Reducer', 'Reduce las opciones de movimiento del oponente'),
('Swap', 'Intercambia posiciones de dos piezas');

-- Insertar partidas de prueba
INSERT INTO Partida (id_jugador1, id_jugador2, fecha_inicio, fecha_fin, ganador_id, duracion) VALUES 
(1, 2, '2024-01-15 10:00:00', '2024-01-15 10:30:00', 1, '00:30:00'),
(3, 4, '2024-01-15 11:00:00', '2024-01-15 11:45:00', 3, '00:45:00'),
(5, 6, '2024-01-15 12:00:00', '2024-01-15 12:25:00', 5, '00:25:00'),
(7, 8, '2024-01-15 13:00:00', '2024-01-15 13:50:00', 7, '00:50:00'),
(9, 10, '2024-01-15 14:00:00', '2024-01-15 14:35:00', 9, '00:35:00'),
(1, 3, '2024-01-16 10:00:00', '2024-01-16 10:40:00', 3, '00:40:00'),
(2, 4, '2024-01-16 11:00:00', '2024-01-16 11:30:00', 2, '00:30:00'),
(5, 7, '2024-01-16 12:00:00', '2024-01-16 12:55:00', 7, '00:55:00'),
(6, 8, '2024-01-16 13:00:00', '2024-01-16 13:20:00', 6, '00:20:00'),
(9, 1, '2024-01-16 14:00:00', '2024-01-16 14:45:00', 1, '00:45:00'),
(10, 2, '2024-01-17 10:00:00', '2024-01-17 10:30:00', 10, '00:30:00'),
(3, 5, '2024-01-17 11:00:00', '2024-01-17 11:35:00', 5, '00:35:00'),
(4, 6, '2024-01-17 12:00:00', '2024-01-17 12:40:00', 6, '00:40:00'),
(7, 9, '2024-01-17 13:00:00', '2024-01-17 13:25:00', 7, '00:25:00'),
(8, 10, '2024-01-17 14:00:00', '2024-01-17 14:50:00', 8, '00:50:00');

-- Insertar datos de Jugador_Partida (relación muchos a muchos)
INSERT INTO Jugador_Partida (id_jugador, id_partida, color, puntaje, turnos_jugados) VALUES 
-- Partida 1: Jugador 1 (blancas) vs Jugador 2 (negras) - Gana Jugador 1
(1, 1, 'blancas', 45, 25),
(2, 1, 'negras', 38, 24),
-- Partida 2: Jugador 3 (blancas) vs Jugador 4 (negras) - Gana Jugador 3
(3, 2, 'blancas', 52, 30),
(4, 2, 'negras', 41, 29),
-- Partida 3: Jugador 5 (blancas) vs Jugador 6 (negras) - Gana Jugador 5
(5, 3, 'blancas', 48, 22),
(6, 3, 'negras', 35, 21),
-- Partida 4: Jugador 7 (blancas) vs Jugador 8 (negras) - Gana Jugador 7
(7, 4, 'blancas', 58, 35),
(8, 4, 'negras', 42, 34),
-- Partida 5: Jugador 9 (blancas) vs Jugador 10 (negras) - Gana Jugador 9
(9, 5, 'blancas', 43, 28),
(10, 5, 'negras', 39, 27),
-- Partida 6: Jugador 1 (negras) vs Jugador 3 (blancas) - Gana Jugador 3
(1, 6, 'negras', 40, 26),
(3, 6, 'blancas', 47, 27),
-- Partida 7: Jugador 2 (blancas) vs Jugador 4 (negras) - Gana Jugador 2
(2, 7, 'blancas', 44, 23),
(4, 7, 'negras', 37, 22),
-- Partida 8: Jugador 5 (negras) vs Jugador 7 (blancas) - Gana Jugador 7
(5, 8, 'negras', 41, 32),
(7, 8, 'blancas', 55, 33),
-- Partida 9: Jugador 6 (blancas) vs Jugador 8 (negras) - Gana Jugador 6
(6, 9, 'blancas', 39, 18),
(8, 9, 'negras', 33, 17),
-- Partida 10: Jugador 9 (negras) vs Jugador 1 (blancas) - Gana Jugador 1
(9, 10, 'negras', 36, 29),
(1, 10, 'blancas', 49, 30),
-- Partida 11: Jugador 10 (blancas) vs Jugador 2 (negras) - Gana Jugador 10
(10, 11, 'blancas', 42, 24),
(2, 11, 'negras', 38, 23),
-- Partida 12: Jugador 3 (negras) vs Jugador 5 (blancas) - Gana Jugador 5
(3, 12, 'negras', 43, 26),
(5, 12, 'blancas', 50, 27),
-- Partida 13: Jugador 4 (blancas) vs Jugador 6 (negras) - Gana Jugador 6
(4, 13, 'blancas', 40, 28),
(6, 13, 'negras', 46, 29),
-- Partida 14: Jugador 7 (negras) vs Jugador 9 (blancas) - Gana Jugador 7
(7, 14, 'negras', 51, 21),
(9, 14, 'blancas', 37, 20),
-- Partida 15: Jugador 8 (blancas) vs Jugador 10 (negras) - Gana Jugador 8
(8, 15, 'blancas', 47, 33),
(10, 15, 'negras', 41, 32);

-- Insertar estadísticas de partida
INSERT INTO Estadistica_partida (id_partida, id_jugador, piezas_capturadas, muertes, powerups_usados, piezas_movidas) VALUES 
-- Estadísticas para cada jugador en cada partida
(1, 1, 8, 6, 3, 25), (1, 2, 6, 8, 2, 24),
(2, 3, 9, 5, 4, 30), (2, 4, 5, 9, 3, 29),
(3, 5, 7, 4, 2, 22), (3, 6, 4, 7, 1, 21),
(4, 7, 10, 6, 5, 35), (4, 8, 6, 10, 3, 34),
(5, 9, 6, 7, 2, 28), (5, 10, 7, 6, 2, 27),
(6, 1, 7, 8, 3, 26), (6, 3, 8, 7, 4, 27),
(7, 2, 6, 5, 2, 23), (7, 4, 5, 6, 1, 22),
(8, 5, 6, 9, 3, 32), (8, 7, 9, 6, 4, 33),
(9, 6, 5, 4, 1, 18), (9, 8, 4, 5, 1, 17),
(10, 9, 5, 8, 2, 29), (10, 1, 8, 5, 3, 30),
(11, 10, 6, 6, 2, 24), (11, 2, 6, 6, 2, 23),
(12, 3, 7, 8, 3, 26), (12, 5, 8, 7, 4, 27),
(13, 4, 6, 7, 2, 28), (13, 6, 7, 6, 3, 29),
(14, 7, 8, 5, 3, 21), (14, 9, 5, 8, 1, 20),
(15, 8, 7, 6, 3, 33), (15, 10, 6, 7, 2, 32);

-- Insertar rondas de prueba (asumiendo 1 ronda por partida para simplicidad)
INSERT INTO Ronda (id_partida, ganador_id, ventaja_aplicada, numero_ronda) VALUES 
(1, 1, FALSE, 1), (2, 3, FALSE, 1), (3, 5, FALSE, 1), (4, 7, FALSE, 1), (5, 9, FALSE, 1),
(6, 3, FALSE, 1), (7, 2, FALSE, 1), (8, 7, FALSE, 1), (9, 6, FALSE, 1), (10, 1, FALSE, 1),
(11, 10, FALSE, 1), (12, 5, FALSE, 1), (13, 6, FALSE, 1), (14, 7, FALSE, 1), (15, 8, FALSE, 1);

-- Insertar estadísticas de ronda
INSERT INTO Estadistica_ronda (id_ronda, id_jugador, piezas_capturadas, piezas_perdidas, powerups_usados, turnos_tomados) VALUES 
-- Estadísticas de ronda para cada jugador
(1, 1, 8, 6, 3, 25), (1, 2, 6, 8, 2, 24),
(2, 3, 9, 5, 4, 30), (2, 4, 5, 9, 3, 29),
(3, 5, 7, 4, 2, 22), (3, 6, 4, 7, 1, 21),
(4, 7, 10, 6, 5, 35), (4, 8, 6, 10, 3, 34),
(5, 9, 6, 7, 2, 28), (5, 10, 7, 6, 2, 27),
(6, 1, 7, 8, 3, 26), (6, 3, 8, 7, 4, 27),
(7, 2, 6, 5, 2, 23), (7, 4, 5, 6, 1, 22),
(8, 5, 6, 9, 3, 32), (8, 7, 9, 6, 4, 33),
(9, 6, 5, 4, 1, 18), (9, 8, 4, 5, 1, 17),
(10, 9, 5, 8, 2, 29), (10, 1, 8, 5, 3, 30),
(11, 10, 6, 6, 2, 24), (11, 2, 6, 6, 2, 23),
(12, 3, 7, 8, 3, 26), (12, 5, 8, 7, 4, 27),
(13, 4, 6, 7, 2, 28), (13, 6, 7, 6, 3, 29),
(14, 7, 8, 5, 3, 21), (14, 9, 5, 8, 1, 20),
(15, 8, 7, 6, 3, 33), (15, 10, 6, 7, 2, 32);

-- Insertar algunos usos de powerups
INSERT INTO Powerup_usado (id_jugador, id_powerup, id_partida, id_ronda, fecha_uso) VALUES 
(1, 1, 1, 1, '2024-01-15 10:15:00'), -- Shield
(1, 4, 1, 1, '2024-01-15 10:20:00'), -- Extra Move
(2, 2, 1, 1, '2024-01-15 10:25:00'), -- Pawn Range
(3, 3, 2, 2, '2024-01-15 11:15:00'), -- Fence
(3, 5, 2, 2, '2024-01-15 11:30:00'), -- Evolution
(4, 1, 2, 2, '2024-01-15 11:35:00'), -- Shield
(5, 6, 3, 3, '2024-01-15 12:10:00'), -- Crazy King
(7, 7, 4, 4, '2024-01-15 13:15:00'), -- Blast
(7, 8, 4, 4, '2024-01-15 13:30:00'), -- Cage
(9, 9, 5, 5, '2024-01-15 14:20:00'), -- Horizontal Portal
(1, 10, 6, 6, '2024-01-16 10:20:00'), -- Reducer
(3, 11, 6, 6, '2024-01-16 10:30:00'), -- Swap
(2, 4, 7, 7, '2024-01-16 11:15:00'), -- Extra Move
(5, 1, 8, 8, '2024-01-16 12:30:00'), -- Shield
(7, 5, 8, 8, '2024-01-16 12:45:00'); -- Evolution

-- Verificar que las vistas funcionan correctamente
SELECT 'Verificando vista_estadisticas_jugador:' as mensaje;
SELECT * FROM vista_estadisticas_jugador ORDER BY puntaje_total DESC LIMIT 5;

SELECT 'Verificando vista_resumen_partida:' as mensaje;
SELECT * FROM vista_resumen_partida ORDER BY fecha_inicio DESC LIMIT 5;

SELECT 'Verificando vista_powerups_populares:' as mensaje;
SELECT * FROM vista_powerups_populares LIMIT 5;
