-- Team members:
-- Miranda Urban Solano A01752391
-- Luis Leonardo Rodriguez Galvez A01029331
-- Santino Matias Im A01029622

--
-- Script for creating the tables for the database
--

-- For CHARSET, we used utf8mb4 since it supports ALL unicode characters

-- For the engine we use InnoDB since it was used in tables with strong relationships that needed referential integrity.
-- We do not use MyISAM since it does not support foreign keys.

-- For the PRIMARY KEYS we use ids with auto increment and not null to guarantee uniqueness.
-- For manual indexes (KEY ...), they were added in fields that are expected to be widely used in searches.

-- The model complies with 3FN since there are no repeated fields, each table has a primary key, and the data depends only on it.

DROP SCHEMA IF EXISTS pawned;
CREATE SCHEMA pawned;
USE pawned;

-- 'Jugador' table
CREATE TABLE Jugador (
  id_jugador SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(50) NOT NULL,
  password_player VARCHAR(100) NOT NULL,
  victorias SMALLINT UNSIGNED DEFAULT 0,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_jugador),
  UNIQUE KEY uk_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Partida' table
CREATE TABLE Partida (
  id_partida MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_jugador1 SMALLINT UNSIGNED NOT NULL,
  id_jugador2 SMALLINT UNSIGNED NOT NULL,
  fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_fin DATETIME DEFAULT NULL,
  ganador_id SMALLINT UNSIGNED DEFAULT NULL,
  duracion TIME DEFAULT NULL,
  PRIMARY KEY (id_partida),
  KEY idx_fecha_inicio (fecha_inicio),
  FOREIGN KEY (id_jugador1) REFERENCES Jugador(id_jugador),
  FOREIGN KEY (id_jugador2) REFERENCES Jugador(id_jugador),
  FOREIGN KEY (ganador_id) REFERENCES Jugador(id_jugador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Pieza' table
CREATE TABLE Pieza (
  id_pieza MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_partida MEDIUMINT UNSIGNED NOT NULL,
  id_jugador SMALLINT UNSIGNED NOT NULL,
  tipo VARCHAR(10) NOT NULL,
  capturada BOOLEAN DEFAULT FALSE,
  protegida BOOLEAN DEFAULT FALSE,
  posicion_inicial CHAR(2),
  PRIMARY KEY (id_pieza),
  KEY idx_partida (id_partida),
  KEY idx_jugador (id_jugador),
  FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
  FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Turno' table
CREATE TABLE Turno (
  id_movimiento MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_partida MEDIUMINT UNSIGNED NOT NULL,
  id_pieza MEDIUMINT UNSIGNED NOT NULL,
  turno_numero SMALLINT UNSIGNED,
  posicion_origen CHAR(2),
  posicion_destino CHAR(2),
  fue_captura DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_movimiento),
  KEY idx_partida (id_partida),
  KEY idx_pieza (id_pieza),
  FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
  FOREIGN KEY (id_pieza) REFERENCES Pieza(id_pieza)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Ronda' table
CREATE TABLE Ronda (
  id_ronda MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_partida MEDIUMINT UNSIGNED NOT NULL,
  ganador_id SMALLINT UNSIGNED,
  ventaja_aplicada BOOLEAN DEFAULT FALSE,
  numero_ronda TINYINT UNSIGNED,
  PRIMARY KEY (id_ronda),
  KEY idx_partida (id_partida),
  FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
  FOREIGN KEY (ganador_id) REFERENCES Jugador(id_jugador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Powerup' table
CREATE TABLE Powerup (
  id_powerup TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  PRIMARY KEY (id_powerup),
  KEY idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Powerup ADD CONSTRAINT unique_nombre UNIQUE (nombre);

-- 'Powerup_usado' table
CREATE TABLE Powerup_usado (
  id_uso MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_jugador SMALLINT UNSIGNED NOT NULL,
  id_powerup TINYINT UNSIGNED NOT NULL,
  id_partida MEDIUMINT UNSIGNED NOT NULL,
  id_ronda MEDIUMINT UNSIGNED NOT NULL,
  fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_uso),
  KEY idx_jugador (id_jugador),
  KEY idx_fecha (fecha_uso),
  FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador),
  FOREIGN KEY (id_powerup) REFERENCES Powerup(id_powerup),
  FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
  FOREIGN KEY (id_ronda) REFERENCES Ronda(id_ronda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Jugador_Partida' table
CREATE TABLE Jugador_Partida (
  id_jugador SMALLINT UNSIGNED NOT NULL,
  id_partida MEDIUMINT UNSIGNED NOT NULL,
  color CHAR(10) NOT NULL,
  puntaje SMALLINT UNSIGNED DEFAULT 0,
  turnos_jugados SMALLINT UNSIGNED DEFAULT 0,
  PRIMARY KEY (id_jugador, id_partida),
  FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador),
  FOREIGN KEY (id_partida) REFERENCES Partida(id_partida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Estadistica_partida' table
CREATE TABLE Estadistica_partida (
  id_estadisticapartida MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_partida MEDIUMINT UNSIGNED NOT NULL,
  id_jugador SMALLINT UNSIGNED NOT NULL,
  piezas_capturadas TINYINT UNSIGNED DEFAULT 0,
  muertes TINYINT UNSIGNED DEFAULT 0,
  powerups_usados TINYINT UNSIGNED DEFAULT 0,
  piezas_movidas SMALLINT UNSIGNED DEFAULT 0,
  PRIMARY KEY (id_estadisticapartida),
  KEY idx_partida (id_partida),
  KEY idx_jugador (id_jugador),
  FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
  FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Estadistica_ronda' table
CREATE TABLE Estadistica_ronda (
  id_estadisticaronda MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_ronda MEDIUMINT UNSIGNED NOT NULL,
  id_jugador SMALLINT UNSIGNED NOT NULL,
  piezas_capturadas TINYINT UNSIGNED DEFAULT 0,
  piezas_perdidas TINYINT UNSIGNED DEFAULT 0,
  powerups_usados TINYINT UNSIGNED DEFAULT 0,
  turnos_tomados SMALLINT UNSIGNED DEFAULT 0,
  PRIMARY KEY (id_estadisticaronda),
  KEY idx_ronda (id_ronda),
  KEY idx_jugador (id_jugador),
  FOREIGN KEY (id_ronda) REFERENCES Ronda(id_ronda),
  FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



--
-- Script for views
--


--
-- View: General statistics for players
--
CREATE OR REPLACE VIEW vista_estadisticas_jugador AS
SELECT 
  j.id_jugador,
  j.email,
  j.victorias,
  COUNT(DISTINCT jp.id_partida) AS partidas_jugadas,
  SUM(jp.puntaje) AS puntaje_total,
  SUM(jp.turnos_jugados) AS turnos_totales,
  SUM(ep.piezas_capturadas) AS piezas_capturadas_total,
  SUM(ep.muertes) AS muertes_total,
  SUM(ep.powerups_usados) AS powerups_usados_total
FROM Jugador j
LEFT JOIN Jugador_Partida jp USING (id_jugador)
LEFT JOIN Estadistica_partida ep USING (id_jugador, id_partida)
GROUP BY j.id_jugador;
-- We used LEFT JOIN for ensuring that all players appear in the results.
-- Even those who have not participated in any game (jp.* = NULL) or have no recorded statistics (ep.* = NULL)


--
-- View: Game statistics for game
--
CREATE OR REPLACE VIEW vista_resumen_partida AS
SELECT 
  p.id_partida,
  p.fecha_inicio,
  p.fecha_fin,
  p.duracion,
  j1.email AS jugador1,
  j2.email AS jugador2,
  jg.email AS ganador,
  SUM(ep.piezas_capturadas) AS piezas_capturadas_total,
  SUM(ep.powerups_usados) AS powerups_usados_total
FROM Partida p
INNER JOIN Jugador j1 ON p.id_jugador1 = j1.id_jugador
INNER JOIN Jugador j2 ON p.id_jugador2 = j2.id_jugador
LEFT JOIN Jugador jg ON p.ganador_id = jg.id_jugador
LEFT JOIN Estadistica_partida ep USING (id_partida)
GROUP BY 
  p.id_partida, p.fecha_inicio, p.fecha_fin, p.duracion,
  j1.email, j2.email, jg.email;
-- We used INNER JOIN because we wanted to avoid a game without players since it makes no logical sense
-- We used LEFT JOIN because the games that are left in progress have no winner (winner_id = NULL)

--
-- View: Most used powerups
--
CREATE OR REPLACE VIEW vista_powerups_populares AS
SELECT 
  p.nombre,
  COUNT(*) AS veces_usado
FROM Powerup_usado pu
INNER JOIN Powerup p USING (id_powerup)
GROUP BY p.nombre
ORDER BY veces_usado DESC;
-- We used INNER JOIN because we are only interested in the powerups that have actually been used


--
-- View: Statistics per round
--
CREATE OR REPLACE VIEW vista_estadisticas_ronda AS
SELECT 
  er.id_jugador,
  j.email,
  COUNT(*) AS rondas_jugadas,
  SUM(er.piezas_capturadas) AS piezas_capturadas,
  SUM(er.piezas_perdidas) AS piezas_perdidas,
  SUM(er.powerups_usados) AS powerups_usados,
  SUM(er.turnos_tomados) AS turnos_tomados
FROM Estadistica_ronda er
INNER JOIN Jugador j USING (id_jugador)
GROUP BY er.id_jugador;
-- We used INNER JOIN because all round statistics must be associated with a valid player.
-- If there is no correspondence, it indicates a data error.


--
-- View: Game statistics
--
CREATE OR REPLACE VIEW vista_partidas_completa AS
SELECT 
  p.*,
  j1.email AS jugador1_email,
  j2.email AS jugador2_email,
  jg.email AS ganador_email
FROM Partida p
LEFT JOIN Jugador j1 ON p.id_jugador1 = j1.id_jugador
LEFT JOIN Jugador j2 ON p.id_jugador2 = j2.id_jugador
LEFT JOIN Jugador jg ON p.ganador_id = jg.id_jugador;
-- We used LEFT JOIN to keep ALL games even if there are referential inconsistencies (a deleted user, etc.)


--
-- View: Turn statistics 
--
CREATE OR REPLACE VIEW vista_turnos_completa AS
SELECT 
  t.*,
  pz.tipo AS tipo_pieza,
  pz.posicion_inicial,
  pz.capturada,
  pz.protegida
FROM Turno t
LEFT JOIN Pieza pz USING (id_pieza);
-- We used LEFT JOIN so all rows in the left table (Turn) are included in the result.
-- Only the matching rows of the right table (Piece) are included.
-- When there is no match, the Piece columns will have NULL values.


--
-- View: Pieces information
--
CREATE OR REPLACE VIEW vista_piezas_completa AS
SELECT 
  p.*,
  j.email AS jugador_email,
  pa.fecha_inicio,
  pa.fecha_fin
FROM Pieza p
LEFT JOIN Jugador j USING (id_jugador)
LEFT JOIN Partida pa USING (id_partida);
-- We used LEFT JOIN to include all the pieces even if they have no player or associated game (improbable case but still) 