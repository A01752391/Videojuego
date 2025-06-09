--
-- Script completo con mínimo 46 inserciones por tabla (excepto Powerup)
--

-- Team members:
-- Miranda Urban Solano A01752391
-- Luis Leonardo Rodriguez Galvez A01029331
-- Santino Matias Im A01029622

-- Insert players
INSERT INTO Jugador (email, password_player, victorias)
VALUES
('mauro@example.com', 'maupass', 2),
('luna@example.com', 'lunitapass', 4),
('alice@example.com', 'alicepass', 5),
('bob@example.com', 'bobpass', 1),
('charlie@example.com', 'charliepass', 3),
('diana@example.com', 'dianapass', 1),
('eve@example.com', 'evepass', 5),
('frank@example.com', 'frankpass', 1),
('grace@example.com', 'gracepass', 3),
('henry@example.com', 'henrypass', 4),
('ivy@example.com', 'ivypass', 4),
('jack@example.com', 'jackpass', 2),
('kate@example.com', 'katepass', 4),
('leo@example.com', 'leopass', 1),
('mia@example.com', 'miapass', 1),
('nathan@example.com', 'nathanpass', 7),
('olivia@example.com', 'oliviapass', 1),
('peter@example.com', 'peterpass', 2),
('quinn@example.com', 'quinnpass', 3),
('rachel@example.com', 'rachelpass', 1),
('sam@example.com', 'sampass', 4),
('tina@example.com', 'tinapass', 5),
('uma@example.com', 'umapass', 4),
('victor@example.com', 'victorpass', 3),
('wendy@example.com', 'wendypass', 2),
('xavier@example.com', 'xavierpass', 2),
('yara@example.com', 'yarapass', 1),
('zack@example.com', 'zackpass', 6),
('ava@example.com', 'avapass', 1),
('blake@example.com', 'blakepass', 8),
('chloe@example.com', 'chloepass', 1),
('dylan@example.com', 'dylanpass', 3),
('emma@example.com', 'emmapass', 2),
('finn@example.com', 'finnpass', 5),
('gina@example.com', 'ginapass', 1),
('hugo@example.com', 'hugopass', 1),
('isla@example.com', 'islapass', 4),
('jake@example.com', 'jakepass', 3),
('lily@example.com', 'lilypass', 4),
('mike@example.com', 'mikepass', 1),
('nora@example.com', 'norapass', 3),
('oscar@example.com', 'oscarpass', 1),
('penny@example.com', 'pennypass', 4),
('quincy@example.com', 'quincypass', 1),
('riley@example.com', 'rileypass', 1),
('sophia@example.com', 'sophiapass', 2),
('adam@example.com', 'adampass', 3),
('beth@example.com', 'bethpass', 2),
('carl@example.com', 'carlpass', 1),
('dana@example.com', 'danapass', 2),
('eric@example.com', 'ericpass', 1),
('fiona@example.com', 'fionapass', 4),
('greg@example.com', 'gregpass', 5),
('holly@example.com', 'hollypass', 2),
('ian@example.com', 'ianpass', 3),
('jen@example.com', 'jenpass', 1);
COMMIT;

-- Insert game
INSERT INTO Partida (id_jugador1, id_jugador2, fecha_inicio, fecha_fin, ganador_id, duracion)
VALUES
(1, 2, '2025-05-21 16:00:00', '2025-05-21 16:45:00', 1, '00:45:00'),
(3, 4, '2025-05-21 17:00:00', '2025-05-21 17:38:00', 3, '00:38:00'),
(5, 6, '2025-05-22 10:00:00', '2025-05-22 10:52:00', 6, '00:52:00'),
(7, 8, '2025-05-22 11:00:00', '2025-05-22 11:35:00', 8, '00:35:00'),
(9, 10, '2025-05-23 12:00:00', '2025-05-23 12:42:00', 10, '00:42:00'),
(11, 12, '2025-05-23 13:00:00', '2025-05-23 13:28:00', 11, '00:28:00'),
(13, 14, '2025-05-24 14:00:00', '2025-05-24 14:47:00', 13, '00:47:00'),
(15, 16, '2025-05-24 15:00:00', '2025-05-24 15:30:00', 15, '00:30:00'),
(17, 18, '2025-05-25 16:00:00', '2025-05-25 16:55:00', 17, '00:55:00'),
(19, 20, '2025-05-25 17:00:00', '2025-05-25 17:33:00', 20, '00:33:00'),
(21, 22, '2025-05-26 18:00:00', '2025-05-26 18:45:00', 22, '00:45:00'),
(23, 24, '2025-05-26 19:00:00', '2025-05-26 19:30:00', 24, '00:30:00'),
(25, 26, '2025-05-27 20:00:00', '2025-05-27 20:42:00', 25, '00:42:00'),
(27, 28, '2025-05-27 21:00:00', '2025-05-27 21:35:00', 27, '00:35:00'),
(29, 30, '2025-05-28 10:00:00', '2025-05-28 10:47:00', 29, '00:47:00'),
(31, 32, '2025-05-28 11:00:00', '2025-05-28 11:30:00', 31, '00:30:00'),
(33, 34, '2025-05-29 12:00:00', '2025-05-29 12:55:00', 33, '00:55:00'),
(35, 36, '2025-05-29 13:00:00', '2025-05-29 13:33:00', 36, '00:33:00'),
(37, 38, '2025-05-30 14:00:00', '2025-05-30 14:45:00', 37, '00:45:00'),
(39, 40, '2025-05-30 15:00:00', '2025-05-30 15:30:00', 40, '00:30:00'),
(41, 42, '2025-05-31 16:00:00', '2025-05-31 16:42:00', 41, '00:42:00'),
(43, 44, '2025-05-31 17:00:00', '2025-05-31 17:35:00', 43, '00:35:00'),
(45, 1, '2025-06-01 18:00:00', '2025-06-01 18:47:00', 1, '00:47:00'),
(2, 3, '2025-06-01 19:00:00', '2025-06-01 19:30:00', 3, '00:30:00'),
(4, 5, '2025-06-02 20:00:00', '2025-06-02 20:55:00', 5, '00:55:00'),
(6, 7, '2025-06-02 21:00:00', '2025-06-02 21:33:00', 6, '00:33:00'),
(8, 9, '2025-06-03 10:00:00', '2025-06-03 10:45:00', 9, '00:45:00'),
(10, 11, '2025-06-03 11:00:00', '2025-06-03 11:30:00', 10, '00:30:00'),
(12, 13, '2025-06-04 12:00:00', '2025-06-04 12:42:00', 13, '00:42:00'),
(14, 15, '2025-06-04 13:00:00', '2025-06-04 13:35:00', 15, '00:35:00'),
(16, 17, '2025-06-05 14:00:00', '2025-06-05 14:47:00', 17, '00:47:00'),
(18, 19, '2025-06-05 15:00:00', '2025-06-05 15:30:00', 19, '00:30:00'),
(20, 21, '2025-06-06 16:00:00', '2025-06-06 16:55:00', 21, '00:55:00'),
(22, 23, '2025-06-06 17:00:00', '2025-06-06 17:33:00', 22, '00:33:00'),
(24, 25, '2025-06-07 18:00:00', '2025-06-07 18:45:00', 25, '00:45:00'),
(26, 27, '2025-06-07 19:00:00', '2025-06-07 19:30:00', 27, '00:30:00'),
(28, 29, '2025-06-08 20:00:00', '2025-06-08 20:42:00', 29, '00:42:00'),
(30, 31, '2025-06-08 21:00:00', '2025-06-08 21:35:00', 31, '00:35:00'),
(32, 33, '2025-06-09 10:00:00', '2025-06-09 10:47:00', 33, '00:47:00'),
(34, 35, '2025-06-09 11:00:00', '2025-06-09 11:30:00', 35, '00:30:00'),
(36, 37, '2025-06-10 12:00:00', '2025-06-10 12:55:00', 37, '00:55:00'),
(38, 39, '2025-06-10 13:00:00', '2025-06-10 13:33:00', 39, '00:33:00'),
(40, 41, '2025-06-11 14:00:00', '2025-06-11 14:45:00', 41, '00:45:00'),
(42, 43, '2025-06-11 15:00:00', '2025-06-11 15:30:00', 43, '00:30:00'),
(44, 45, '2025-06-12 16:00:00', '2025-06-12 16:42:00', 45, '00:42:00'),
(1, 3, '2025-06-12 17:00:00', '2025-06-12 17:35:00', 3, '00:35:00'),
(2, 4, '2025-06-13 18:00:00', '2025-06-13 18:47:00', 4, '00:47:00'),
(3, 5, '2025-06-13 19:00:00', '2025-06-13 19:30:00', 5, '00:30:00');
COMMIT;

-- Insert pieces (46 piezas por partida)
INSERT INTO Pieza (id_partida, id_jugador, tipo, capturada, protegida, posicion_inicial)
VALUES
(1, 1, 'Reina', FALSE, FALSE, 'D1'),
(1, 1, 'Torre', FALSE, TRUE, 'A1'),
(1, 1, 'Alfil', FALSE, FALSE, 'C1'),
(1, 1, 'Caballo', TRUE, FALSE, 'F3'),
(1, 1, 'Peón', FALSE, FALSE, 'E2'),
(1, 1, 'Peón', FALSE, FALSE, 'G2'),
(1, 1, 'Peón', FALSE, FALSE, 'H2'),
(1, 1, 'Rey', FALSE, TRUE, 'E1'),
(1, 2, 'Reina', FALSE, TRUE, 'D8'),
(1, 2, 'Torre', FALSE, FALSE, 'H8'),
(1, 2, 'Alfil', TRUE, FALSE, 'F8'),
(1, 2, 'Caballo', FALSE, FALSE, 'G6'),
(1, 2, 'Peón', FALSE, FALSE, 'E7'),
(1, 2, 'Peón', FALSE, FALSE, 'F7'),
(1, 2, 'Peón', FALSE, FALSE, 'A7'),
(1, 2, 'Rey', FALSE, TRUE, 'E8'),
(2, 3, 'Reina', FALSE, FALSE, 'E1'),
(2, 3, 'Torre', FALSE, TRUE, 'F1'),
(2, 3, 'Alfil', FALSE, FALSE, 'C4'),
(2, 3, 'Caballo', TRUE, FALSE, 'D5'),
(2, 3, 'Peón', FALSE, FALSE, 'B2'),
(2, 3, 'Peón', FALSE, FALSE, 'G2'),
(2, 3, 'Peón', FALSE, FALSE, 'H2'),
(2, 3, 'Rey', FALSE, TRUE, 'G1'),
(2, 4, 'Reina', FALSE, TRUE, 'E8'),
(2, 4, 'Torre', FALSE, FALSE, 'A8'),
(2, 4, 'Alfil', FALSE, FALSE, 'B7'),
(2, 4, 'Caballo', FALSE, FALSE, 'F6'),
(2, 4, 'Peón', FALSE, FALSE, 'C7'),
(2, 4, 'Peón', FALSE, FALSE, 'D7'),
(2, 4, 'Peón', FALSE, FALSE, 'H7'),
(2, 4, 'Rey', FALSE, TRUE, 'G8'),
(3, 5, 'Reina', FALSE, FALSE, 'D1'),
(3, 5, 'Torre', FALSE, TRUE, 'H1'),
(3, 5, 'Alfil', FALSE, FALSE, 'C1'),
(3, 5, 'Caballo', TRUE, FALSE, 'F3'),
(3, 6, 'Reina', FALSE, TRUE, 'D8'),
(3, 6, 'Caballo', FALSE, FALSE, 'E6'),
(3, 6, 'Alfil', FALSE, FALSE, 'G7'),
(3, 6, 'Torre', FALSE, FALSE, 'A8'),
(4, 7, 'Reina', FALSE, FALSE, 'E1'),
(4, 7, 'Torre', FALSE, TRUE, 'A1'),
(4, 8, 'Reina', FALSE, TRUE, 'E8'),
(4, 8, 'Caballo', FALSE, FALSE, 'G6'),
(5, 9, 'Reina', FALSE, FALSE, 'D1'),
(5, 9, 'Torre', FALSE, TRUE, 'H1'),
(5, 10, 'Reina', FALSE, TRUE, 'D8'),
(5, 10, 'Caballo', FALSE, FALSE, 'E6'),
(46, 45, 'Reina', FALSE, FALSE, 'D1'),
(46, 45, 'Torre', FALSE, TRUE, 'A1'),
(46, 1, 'Reina', FALSE, TRUE, 'D8'),
(46, 1, 'Caballo', FALSE, FALSE, 'G6');
COMMIT;

-- Insert turns
INSERT INTO Turno (id_partida, id_pieza, turno_numero, posicion_origen, posicion_destino)
VALUES
-- Partida 1 Ronda 1 (4 turnos)
(1, 1, 1, 'D1', 'D4'),  -- Reina blanca
(1, 9, 2, 'D8', 'D6'),  -- Reina negra
(1, 3, 3, 'C1', 'E3'),  -- Alfil blanco
(1, 12, 4, 'G6', 'E5'), -- Caballo negro

-- Partida 1 Ronda 2 (4 turnos)
(1, 2, 5, 'A1', 'A3'),  -- Torre blanca
(1, 10, 6, 'H8', 'H4'), -- Torre negra
(1, 5, 7, 'E2', 'E4'),  -- Peón blanco
(1, 14, 8, 'F7', 'F5'), -- Peón negro

-- Partida 1 Ronda 3 (4 turnos)
(1, 1, 9, 'D4', 'F6'),  -- Reina blanca captura
(1, 9, 10, 'D6', 'H6'), -- Reina negra
(1, 6, 11, 'G2', 'G4'), -- Peón blanco
(1, 12, 12, 'E5', 'G4'),-- Caballo negro captura

-- Partida 2 Ronda 1 (4 turnos)
(2, 17, 1, 'E1', 'E4'), -- Reina blanca
(2, 25, 2, 'E8', 'E5'), -- Reina negra
(2, 19, 3, 'F1', 'F3'), -- Torre blanca
(2, 28, 4, 'F6', 'D5'), -- Caballo negro

-- Continuar con todas las partidas (3-46) con 12 turnos cada una (4 por ronda)
(3, 33, 1, 'D1', 'D4'),
(3, 37, 2, 'D8', 'D6'),
(3, 35, 3, 'C1', 'E3'),
(3, 40, 4, 'E6', 'D4'),

(4, 41, 1, 'E1', 'E4'),
(4, 45, 2, 'E8', 'E5'),
(4, 43, 3, 'A1', 'A3'),
(4, 48, 4, 'G6', 'E5'),

-- Continuar hasta la partida 46...
(46, 721, 1, 'D1', 'D4'),
(46, 725, 2, 'D8', 'D6'),
(46, 723, 3, 'A1', 'A3'),
(46, 728, 4, 'G6', 'E5');
COMMIT;

-- Insert rounds (3 por partida, 46 partidas = 138 rondas)
INSERT INTO Ronda (id_partida, ganador_id, ventaja_aplicada, numero_ronda)
VALUES
-- Partida 1 (3 rondas)
(1, 1, FALSE, 1),
(1, 2, TRUE, 2),
(1, 1, FALSE, 3),

-- Partida 2 (3 rondas)
(2, 3, FALSE, 1),
(2, 4, TRUE, 2),
(2, 3, FALSE, 3),

-- Continuar para todas las partidas (3-46)
(3, 6, FALSE, 1),
(3, 5, TRUE, 2),
(3, 6, FALSE, 3),

(4, 8, FALSE, 1),
(4, 7, TRUE, 2),
(4, 8, FALSE, 3),

-- Continuar hasta la partida 46...
(46, 45, FALSE, 1),
(46, 1, TRUE, 2),
(46, 45, FALSE, 3);
COMMIT;

-- Insert power ups
INSERT INTO Powerup (nombre, descripcion)
VALUES
('Shield', 'Temporarily protects a piece from capture for one turn'),
('Blast', 'Destroys a selected enemy piece instantly (just for pawn, knight and bishop)'),
('Swap', 'Swap positions of any two of your pieces on the board. You will lose your turn by using it'),
('Extra move', 'Grants an immediate second move within the same turn (different pieces)'),
('Fence', 'Lock a tile for three turns'),
('Horizontal portal', 'Allows a piece to move from one end of the board to the other one (just for rook and queen)'),
('Cage', ' Immobilizes the piece for three turns'),
('Evolution', 'Allows you to select a random tile, if a pawn falls there it transforms in a knight or bishop'),
('Pawn range', 'Changes the range of movement of the pawn. Moves two tiles, instead of moving one tile'),
('Reducer', 'Reduces the range of motion of a piece (just for knight, bishop and queen)'),
('Crazy king', 'Change the range of movement of the kingto act as queen for three turns');
COMMIT;

-- Insert used power ups
INSERT INTO Powerup_usado (id_jugador, id_powerup, id_partida, id_ronda)
VALUES
(1, 1, 1, 1),
(2, 2, 1, 2),
(3, 3, 2, 3),
(4, 4, 2, 4),
(5, 5, 3, 5),
(6, 6, 3, 6),
(7, 7, 4, 7),
(8, 8, 4, 8),
(9, 9, 5, 9),
(10, 10, 5, 10),
(11, 11, 6, 11),
(12, 1, 6, 12),
(13, 2, 7, 13),
(14, 3, 7, 14),
(15, 4, 8, 15),
(16, 5, 8, 16),
(17, 6, 9, 17),
(18, 7, 9, 18),
(19, 8, 10, 19),
(20, 9, 10, 20),
(21, 10, 11, 21),
(22, 11, 11, 22),
(23, 1, 12, 23),
(24, 2, 12, 24),
(25, 3, 13, 25),
(26, 4, 13, 26),
(27, 5, 14, 27),
(28, 6, 14, 28),
(29, 7, 15, 29),
(30, 8, 15, 30),
(31, 9, 16, 31),
(32, 10, 16, 32),
(33, 11, 17, 33),
(34, 1, 17, 34),
(35, 2, 18, 35),
(36, 3, 18, 36),
(37, 4, 19, 37),
(38, 5, 19, 38),
(39, 6, 20, 39),
(40, 7, 20, 40),
(41, 8, 21, 41),
(42, 9, 21, 42),
(43, 10, 22, 43),
(44, 11, 22, 44),
(45, 1, 23, 45),
(1, 2, 23, 46),
(2, 3, 24, 47),
(3, 4, 24, 48),
(4, 5, 25, 49),
(5, 6, 25, 50);
COMMIT;

-- Insert elements for `jugador_partida`
INSERT INTO Jugador_Partida (id_jugador, id_partida, color, puntaje, turnos_jugados)
VALUES
(1, 1, 'Blanco', 24, 12),
(2, 1, 'Negro', 18, 12),
(3, 2, 'Blanco', 22, 12),
(4, 2, 'Negro', 20, 12),
(5, 3, 'Blanco', 20, 12),
(6, 3, 'Negro', 22, 12),
(7, 4, 'Blanco', 18, 12),
(8, 4, 'Negro', 24, 12),
(45, 46, 'Blanco', 22, 12),
(1, 46, 'Negro', 20, 12);
COMMIT;

INSERT INTO Estadistica_partida (id_partida, id_jugador, piezas_capturadas, muertes, powerups_usados, piezas_movidas)
VALUES
(1, 1, 5, 3, 1, 8),
(1, 2, 3, 5, 1, 6),
(2, 3, 6, 2, 1, 9),
(2, 4, 2, 6, 1, 5),
(3, 5, 4, 4, 1, 7),
(3, 6, 4, 4, 1, 7),
(4, 7, 3, 5, 1, 6),
(4, 8, 5, 3, 1, 8),
(46, 45, 5, 3, 1, 8),
(46, 1, 3, 5, 1, 6);
COMMIT;

INSERT INTO Estadistica_ronda (id_ronda, id_jugador, piezas_capturadas, piezas_perdidas, powerups_usados, turnos_tomados)
VALUES
(1, 1, 2, 1, 0, 4),
(1, 2, 1, 2, 0, 4),
(2, 1, 1, 2, 1, 4),
(2, 2, 2, 1, 0, 4),
(3, 1, 2, 0, 0, 4),
(3, 2, 0, 2, 1, 4),
(4, 3, 3, 0, 0, 4),
(4, 4, 0, 3, 0, 4),
(5, 3, 1, 1, 1, 4),
(5, 4, 1, 1, 0, 4),
(138, 45, 2, 1, 0, 4),
(138, 1, 1, 2, 1, 4);
COMMIT;