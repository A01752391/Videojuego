-- Team members:
-- Miranda Urban Solano A01752391
-- Luis Leonardo Rodriguez Galvez A01029331
-- Santino Matias Im A01029622

--
-- Script for creating the tables por the database
--

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
  KEY idx_email (email)
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
  KEY idx_jugadores (id_jugador1, id_jugador2),
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
  KEY idx_partida_jugador (id_partida, id_jugador),
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
  KEY idx_partida_pieza (id_partida, id_pieza),
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
  PRIMARY KEY (id_powerup)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 'Powerup_usado' table
CREATE TABLE Powerup_usado (
  id_uso MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_jugador SMALLINT UNSIGNED NOT NULL,
  id_powerup TINYINT UNSIGNED NOT NULL,
  id_partida MEDIUMINT UNSIGNED NOT NULL,
  id_ronda MEDIUMINT UNSIGNED NOT NULL,
  fecha_uso DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_uso),
  KEY idx_usos (id_jugador, id_powerup, id_partida),
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
  KEY idx_partida_jugador (id_partida, id_jugador),
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
  KEY idx_ronda_jugador (id_ronda, id_jugador),
  FOREIGN KEY (id_ronda) REFERENCES Ronda(id_ronda),
  FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;