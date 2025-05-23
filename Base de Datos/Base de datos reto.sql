CREATE DATABASE pawned;
USE pawned;

CREATE TABLE Jugador (
    id_jugador INT PRIMARY KEY,
    email VARCHAR(50),
    password_player VARCHAR(100),
    victorias INT,
    fecha_creacion DATETIME
);

CREATE TABLE Partida (
    id_partida INT PRIMARY KEY,
    id_jugador1 INT,
    id_jugador2 INT,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    ganador_id INT,
    duracion TIME,
    FOREIGN KEY (id_jugador1) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (id_jugador2) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (ganador_id) REFERENCES Jugador(id_jugador)
);

CREATE TABLE Pieza (
    id_pieza INT PRIMARY KEY,
    id_partida INT,
    id_usuario INT,
    tipo VARCHAR(10),
    capturada BOOLEAN,
    protegida BOOLEAN,
    posicion_inicial VARCHAR(2),
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
    FOREIGN KEY (id_usuario) REFERENCES Jugador(id_jugador)
);

CREATE TABLE Turno (
    id_movimiento INT PRIMARY KEY,
    id_partida INT,
    id_pieza INT,
    turno_numero VARCHAR(10),
    posicion_origen VARCHAR(2),
    posicion_destino VARCHAR(2),
    fue_captura DATETIME,
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
    FOREIGN KEY (id_pieza) REFERENCES Pieza(id_pieza)
);

CREATE TABLE Ronda (
    id_ronda INT PRIMARY KEY,
    id_partida INT,
    ganador_id INT,
    ventaja_aplicada BOOLEAN,
    numero_ronda SMALLINT,
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
    FOREIGN KEY (ganador_id) REFERENCES Jugador(id_jugador)
);

CREATE TABLE Powerup (
    id_powerup INT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT
);

CREATE TABLE Powerup_usado (
    id_uso INT PRIMARY KEY,
    id_jugador INT,
    id_powerup INT,
    id_partida INT,
    id_ronda INT,
    fecha_uso DATETIME,
    FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (id_powerup) REFERENCES Powerup(id_powerup),
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
    FOREIGN KEY (id_ronda) REFERENCES Ronda(id_ronda)
);

CREATE TABLE Jugador_Partida (
    id_jugador INT,
    id_partida INT,
    color VARCHAR(10),
    puntaje INT,
    turnos_jugados INT,
    PRIMARY KEY (id_jugador, id_partida),
    FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida)
);

CREATE TABLE Estadistica_partida (
    id_estadisticapartida INT PRIMARY KEY,
    id_partida INT,
    id_usuario INT,
    piezas_capturadas SMALLINT,
    muertes SMALLINT,
    powerups_usados SMALLINT,
    piezas_movidas SMALLINT,
    FOREIGN KEY (id_partida) REFERENCES Partida(id_partida),
    FOREIGN KEY (id_usuario) REFERENCES Jugador(id_jugador)
);

CREATE TABLE Estadistica_ronda (
    id_estadisticaronda INT PRIMARY KEY,
    id_ronda INT,
    id_usuario INT,
    piezas_capturadas SMALLINT,
    piezas_perdidas SMALLINT,
    powerups_usados SMALLINT,
    turnos_tomados SMALLINT,
    FOREIGN KEY (id_ronda) REFERENCES Ronda(id_ronda),
    FOREIGN KEY (id_usuario) REFERENCES Jugador(id_jugador)
);