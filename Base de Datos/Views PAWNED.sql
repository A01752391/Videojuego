-- Team members:
-- Miranda Urban Solano A01752391
-- Luis Leonardo Rodriguez Galvez A01029331
-- Santino Matias Im A01029622

--
-- Script for views
--

-- View: General statistics
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
LEFT JOIN Jugador_Partida jp ON j.id_jugador = jp.id_jugador
LEFT JOIN Estadistica_partida ep ON ep.id_jugador = j.id_jugador AND ep.id_partida = jp.id_partida
GROUP BY j.id_jugador;

-- View: Game statistics
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
JOIN Jugador j1 ON p.id_jugador1 = j1.id_jugador
JOIN Jugador j2 ON p.id_jugador2 = j2.id_jugador
LEFT JOIN Jugador jg ON p.ganador_id = jg.id_jugador
LEFT JOIN Estadistica_partida ep ON p.id_partida = ep.id_partida
GROUP BY 
  p.id_partida, p.fecha_inicio, p.fecha_fin, p.duracion,
  j1.email, j2.email, jg.email;

-- View: Most used powerups
CREATE OR REPLACE VIEW vista_powerups_populares AS
SELECT 
  p.nombre,
  COUNT(*) AS veces_usado
FROM Powerup_usado pu
JOIN Powerup p ON pu.id_powerup = p.id_powerup
GROUP BY p.nombre
ORDER BY veces_usado DESC;

-- View: Statistics per round
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
JOIN Jugador j ON er.id_jugador = j.id_jugador
GROUP BY er.id_jugador;

-- View: Game statistics
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

-- View: Turn statistics 
CREATE OR REPLACE VIEW vista_turnos_completa AS
SELECT 
  t.*,
  pz.tipo AS tipo_pieza,
  pz.posicion_inicial,
  pz.capturada,
  pz.protegida
FROM Turno t
LEFT JOIN Pieza pz ON t.id_pieza = pz.id_pieza;

-- View: Pieces information
CREATE OR REPLACE VIEW vista_piezas_completa AS
SELECT 
  p.*,
  j.email AS jugador_email,
  pa.fecha_inicio,
  pa.fecha_fin
FROM Pieza p
LEFT JOIN Jugador j ON p.id_jugador = j.id_jugador
LEFT JOIN Partida pa ON p.id_partida = pa.id_partida;
