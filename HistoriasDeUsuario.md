# Historias de Usuario

## Videojuego

### 1. Movimiento clásico de piezas

**Como** jugador  
**Quiero** mover piezas según reglas del ajedrez  
**Para** poder jugar con lógica conocida.

**Validación:**

- Movimiento válido según tipo de pieza.
- Turno alternado.

**Valor:** 300  
**Prioridad:** 1  
**Estimación:** 6h

---

### 2. Captura de piezas

**Como** jugador  
**Quiero** capturar piezas del oponente  
**Para** poder ganar puntos.

**Validación:**

- Piezas eliminadas correctamente.
- Puntaje incrementado.

**Valor:** 250  
**Prioridad:** 1  
**Estimación:** 5h

---

### 3. Power-up ExtraMove

**Como** jugador  
**Quiero** usar un power-up para tomar un segundo turno  
**Para** poder atacar dos veces seguidas.

**Validación:**

- Segundo turno otorgado.
- Power-up se consume.

**Valor:** 250  
**Prioridad:** 2  
**Estimación:** 5h

---

### 4. Power-up Shield

**Como** jugador  
**Quiero** proteger una pieza  
**Para** poder evitar su captura.

**Validación:**

- Ícono visible.
- Captura bloqueada una vez.

**Valor:** 220  
**Prioridad:** 2  
**Estimación:** 4h

---

### 5. Power-up Swap

**Como** jugador  
**Quiero** intercambiar dos piezas en el tablero  
**Para** poder cambiar el flujo del juego.

**Validación:**

- Intercambio inmediato.
- Solo una vez por uso.

**Valor:** 220  
**Prioridad:** 2  
**Estimación:** 4h

---

### 6. Power-up Teleport

**Como** jugador  
**Quiero** mover una pieza a cualquier casilla  
**Para** poder reposicionarme.

**Validación:**

- Casilla vacía.
- Movimiento válido.

**Valor:** 250  
**Prioridad:** 2  
**Estimación:** 5h

---

### 7. Power-up Blast

**Como** jugador  
**Quiero** eliminar cualquier pieza enemiga  
**Para** poder ganar ventaja táctica.

**Validación:**

- Eliminación instantánea.
- Aplicación solo a oponente.

**Valor:** 300  
**Prioridad:** 2  
**Estimación:** 6h

---

### 8. Generación de tablero mid-game

**Como** desarrollador  
**Quiero** que el juego empiece desde un tablero desarrollado  
**Para** poder acelerar la acción.

**Validación:**

- Piezas en posiciones avanzadas.
- Diferente cada partida.

**Valor:** 250  
**Prioridad:** 1  
**Estimación:** 4h

---

### 9. Muerte súbita

**Como** jugador  
**Quiero** jugar una ronda rápida si hay empate  
**Para** poder definir el ganador.

**Validación:**

- Gana el primer jugador que capture.
- Solo se activa si hay empate.

**Valor:** 200  
**Prioridad:** 2  
**Estimación:** 4h

---

### 10. Ventaja para jugador rezagado

**Como** jugador  
**Quiero** obtener ventaja si voy perdiendo  
**Para** poder equilibrar la partida.

**Validación:**

- 2 peones avanzados.
- 1 pieza menor adicional.
- 1 power-up gratis.

**Valor:** 250  
**Prioridad:** 2  
**Estimación:** 6h

---

### 11. Sistema de turnos

**Como** jugador  
**Quiero** que los turnos se alternen correctamente  
**Para** poder jugar de manera justa.

**Validación:**

- No se permiten movimientos fuera de turno.
- Se indica visualmente de quién es el turno.

**Valor:** 180  
**Prioridad:** 1  
**Estimación:** 3h

---

### 12. Condición de victoria

**Como** jugador  
**Quiero** saber cuándo he ganado  
**Para** poder terminar la partida con claridad.

**Validación:**

- Dos rondas ganadas = victoria.
- O captura súbita en empate.

**Valor:** 200  
**Prioridad:** 1  
**Estimación:** 3h

---

### 13. Resaltado de casillas válidas

**Como** jugador  
**Quiero** ver qué movimientos son válidos  
**Para** poder planear mi estrategia.

**Validación:**

- Casillas marcadas al seleccionar pieza.
- Solo muestra opciones legales.

**Valor:** 200  
**Prioridad:** 1  
**Estimación:** 4h

---

### 14. Alternancia de rondas

**Como** jugador  
**Quiero** que el juego reinicie con nuevo tablero  
**Para** poder jugar la segunda ronda.

**Validación:**

- Tablero generado con lógica de ventaja si aplica.
- Puntaje reseteado.

**Valor:** 180  
**Prioridad:** 2  
**Estimación:** 4h

---

### 15. Activación manual de power-ups

**Como** jugador  
**Quiero** decidir cuándo usar mis power-ups  
**Para** poder optimizar mi jugada.

**Validación:**

- Solo durante mi turno.
- Confirmación de uso.

**Valor:** 220  
**Prioridad:** 1  
**Estimación:** 4h

---

## Base de Datos

### 16. Guardar puntaje total

**Como** jugador  
**Quiero** que mi puntaje final se guarde  
**Para** poder revisar mi progreso.

**Validación:**

- Puntaje se almacena correctamente.
- Se puede consultar después del juego.

**Valor:** 100  
**Prioridad:** 2  
**Estimación:** 2h

---

### 17. Registro de power-ups usados

**Como** desarrollador  
**Quiero** guardar qué power-ups se usan y cuándo  
**Para** poder analizar estadísticas.

**Validación:**

- Uso de power-up registrado en base de datos.
- Asociado a jugador y ronda.

**Valor:** 130  
**Prioridad:** 2  
**Estimación:** 3h

---

### 18. Guardar configuración personalizada

**Como** jugador  
**Quiero** que mis preferencias de volumen y juego se guarden  
**Para** poder mantenerlas al reabrir el juego.

**Validación:**

- Configuración persistente entre sesiones.
- Valores recuperados correctamente.

**Valor:** 120  
**Prioridad:** 3  
**Estimación:** 3h

---

### 19. Guardar rondas ganadas

**Como** jugador  
**Quiero** que el sistema recuerde cuántas rondas gané  
**Para** poder completar el sistema de “mejor de 3”.

**Validación:**

- Contador de rondas ganado.
- Se borra al reiniciar partida.

**Valor:** 100  
**Prioridad:** 1  
**Estimación:** 2h

---

### 20. Guardar estadísticas generales

**Como** jugador  
**Quiero** que se registren mis estadísticas  
**Para** poder ver mis logros en futuras versiones.

**Validación:**

- Datos como piezas capturadas, power-ups usados y victorias.
- Datos almacenados correctamente por usuario.

**Valor:** 150  
**Prioridad:** 2  
**Estimación:** 4h

---

## Web

### 21. Pantalla de inicio

**Como** jugador  
**Quiero** ver una pantalla de inicio con opciones de juego  
**Para** poder comenzar o configurar mi partida.

**Validación:**

- Botones de Jugar, Opciones, y Salir visibles y funcionales.

**Valor:** 150  
**Prioridad:** 1  
**Estimación:** 4h

---

### 22. Pantalla de pausa

**Como** jugador  
**Quiero** pausar el juego en cualquier momento  
**Para** poder acceder a opciones sin perder progreso.

**Validación:**

- Menú de pausa aparece con Esc.
- Botones: continuar, nuevo juego, salir.

**Valor:** 130  
**Prioridad:** 2  
**Estimación:** 3h

---

### 23. Menú de opciones

**Como** jugador  
**Quiero** modificar configuraciones de sonido o música  
**Para** poder personalizar mi experiencia.

**Validación:**

- Controles de volumen funcionales.
- Configuración se guarda.

**Valor:** 100  
**Prioridad:** 3  
**Estimación:** 2h

---

### 24. Pantalla de victoria/derrota

**Como** jugador  
**Quiero** ver quién ganó y el puntaje final  
**Para** poder evaluar mi desempeño.

**Validación:**

- Resultado claro: victoria o derrota.
- Puntuaciones visibles.

**Valor:** 120  
**Prioridad:** 2  
**Estimación:** 3h

---

### 25. Transición de rondas

**Como** jugador  
**Quiero** ver una pantalla de resumen entre rondas  
**Para** poder saber mis puntos y prepararme.

**Validación:**

- Resumen claro con botón de continuar.
- Aplica handicap si corresponde.

**Valor:** 150  
**Prioridad:** 1  
**Estimación:** 3h

---

### 26. Visualización de power-ups

**Como** jugador  
**Quiero** ver los power-ups que tengo  
**Para** poder decidir cuándo usarlos.

**Validación:**

- Inventario visible.
- Íconos claros y diferenciados.

**Valor:** 180  
**Prioridad:** 1  
**Estimación:** 3h

---

### 27. Feedback visual del power-up usado

**Como** jugador  
**Quiero** ver un efecto cuando uso un power-up  
**Para** poder notar su activación.

**Validación:**

- Efecto visual aparece según el power-up.
- Se remueve del inventario.

**Valor:** 160  
**Prioridad:** 2  
**Estimación:** 3h

---

### 28. Animación de aparición de power-up

**Como** jugador  
**Quiero** que aparezca una animación cuando se gane un power-up  
**Para** poder saber que lo obtuve.

**Validación:**

- Efecto visual con partículas o luz.
- Power-up aparece en inventario.

**Valor:** 150  
**Prioridad:** 2  
**Estimación:** 3h

---

### 29. Feedback al capturar pieza

**Como** jugador  
**Quiero** ver una animación o efecto al capturar  
**Para** poder sentir impacto.

**Validación:**

- Animación se reproduce sin errores.
- Efecto de sonido agregado.

**Valor:** 130  
**Prioridad:** 2  
**Estimación:** 2h

---

### 30. Diseño de tablero visual

**Como** jugador  
**Quiero** que el tablero tenga un diseño estético claro  
**Para** poder jugar de forma cómoda y atractiva.

**Validación:**

- Colores correctos y consistentes.
- Resalta casillas válidas.

**Valor:** 180  
**Prioridad:** 2  
**Estimación:** 4h
