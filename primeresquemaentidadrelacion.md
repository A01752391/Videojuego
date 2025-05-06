![WhatsApp Image 2025-05-05 at 22 12 12_c6c909f7](https://github.com/user-attachments/assets/f1d95392-c55a-4514-9aec-83d248a7a9f8)


## Jugador

La tabla jugador almacena los datos básicos de cada usuario, incluyendo su identificador, nombre de usuario, correo electrónico, y estadísticas de participación como partidas jugadas y victorias. Esta entidad es fundamental para identificar a los participantes y hacer seguimiento a su rendimiento. Se relaciona con la tabla jugador_partida, que registra su intervención en partidas específicas, y con powerup_usado, que permite saber qué objetos especiales ha activado durante el juego.

## Partida

La tabla partida representa cada sesión del juego, registrando información como la fecha, duración, si se activó el modo súbito (sudden death), y quién fue el jugador ganador. Esta entidad es clave para vincular eventos jugables con los participantes y movimientos realizados. Se relaciona con jugador_partida para conocer qué jugadores participaron en ella, con movimiento para almacenar los desplazamientos hechos en la partida, y con powerup_usado para registrar los poderes especiales que se utilizaron durante esa sesión.

## Jugador_partida

Jugador_partida es una tabla intermedia que vincula a los jugadores con las partidas que han disputado, permitiendo registrar detalles particulares como el color con el que jugaron (blanco o negro), su puntaje y la cantidad de turnos realizados. Esta relación de muchos a muchos entre jugador y partida permite gestionar múltiples participaciones y resultados de forma precisa, siendo esencial para la lógica competitiva del juego.

## Pieza

La tabla pieza define cada una de las fichas de ajedrez presentes en una partida, identificando su tipo (como peón, torre, alfil), su color y la posición desde la cual inicia. Esta entidad permite realizar un seguimiento individualizado de cada pieza, lo cual es necesario para registrar movimientos específicos. Se relaciona directamente con la tabla movimiento, donde cada acción está ligada a una pieza concreta.

## Movimiento

Movimiento almacena cada jugada realizada durante una partida, indicando qué pieza se movió, desde qué casilla hasta cuál, en qué turno y si se trató de una captura. Esta tabla es esencial para reconstruir el desarrollo completo de una partida y generar análisis de jugadas. Está conectada tanto con partida, para saber a qué sesión pertenece el movimiento, como con pieza, para identificar la ficha que ejecutó la acción.

## PowerUp

La tabla powerup registra todos los tipos de habilidades especiales disponibles en el juego, incluyendo su nombre y una breve descripción de su efecto. Esta entidad sirve como catálogo base para que los jugadores puedan utilizar estas ventajas estratégicas dentro de las partidas. Se relaciona con la tabla powerup_usado, que lleva el registro de cada vez que un jugador activa uno de estos poderes.

## Powerup_usado

Powerup_usado documenta cada activación de un poder especial por parte de un jugador durante una partida. Almacena la identidad del jugador, la partida en la que ocurrió, el tipo de power-up utilizado y el turno exacto de activación. Es una tabla de relación múltiple entre jugador, partida y powerup, y permite analizar el uso táctico de estas herramientas en el desarrollo del juego.
