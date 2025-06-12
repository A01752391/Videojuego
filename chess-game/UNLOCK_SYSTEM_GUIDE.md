# 🔓 Sistema de Desbloqueo de PowerUps - PAWNED

## 📋 Descripción General

El sistema de desbloqueo permite que los jugadores desbloqueen PowerUps permanentemente según su puntuación acumulada. Una vez desbloqueado, el PowerUp está disponible para ambos jugadores en futuras partidas.

## 🎯 Umbrales de Desbloqueo

| PowerUp | Puntos Requeridos | Descripción |
|---------|-------------------|-------------|
| **Shield** | 100 puntos | Protege temporalmente una pieza de captura |
| **Cage** | 200 puntos | Inmoviliza una pieza enemiga por 3 turnos |
| **Swap** | 400 puntos | Intercambia posiciones de dos piezas propias |
| **Reducer** | 800 puntos | Reduce el rango de movimiento de una pieza enemiga |

## 🏗️ Arquitectura del Sistema

### Base de Datos
- **Tabla**: `Jugador_Powerup_Desbloqueo`
- **Campos**: 
  - `id_jugador` - ID del jugador
  - `shield_desbloqueado` - Boolean
  - `cage_desbloqueado` - Boolean  
  - `swap_desbloqueado` - Boolean
  - `reducer_desbloqueado` - Boolean
  - `fecha_actualizacion` - Timestamp

### Endpoints API

#### 🔍 Obtener Desbloqueos
```
GET /api/players/{id_jugador}/unlocks
```
**Respuesta**:
```json
{
  "success": true,
  "data": {
    "playerId": 1,
    "playerEmail": "jugador@email.com",
    "shieldUnlocked": true,
    "cageUnlocked": false,
    "swapUnlocked": false,
    "reducerUnlocked": false,
    "lastUpdate": "2024-01-01T12:00:00Z"
  }
}
```

#### 🔓 Desbloquear PowerUp
```
POST /api/players/{id_jugador}/unlock/{powerup_name}
```
**PowerUps válidos**: `shield`, `cage`, `swap`, `reducer`

#### 📊 Resumen General
```
GET /api/unlocks/summary
```

## 🎮 Flujo en el Juego

### 1. Inicialización
- Al iniciar una partida, se cargan los desbloqueos de ambos jugadores
- Los desbloqueos se combinan: si cualquier jugador desbloqueó algo, está disponible para ambos

### 2. Durante el Juego
- Los puntos se acumulan entre ambos jugadores
- Al alcanzar un umbral, se desbloquea automáticamente para ambos jugadores
- Se muestra un modal de notificación
- El PowerUp se persiste en la base de datos

### 3. Disponibilidad
- PowerUps desbloqueados aparecen en el pool de generación aleatoria
- Solo se pueden generar PowerUps que han sido desbloqueados

## 🧪 Cómo Probar el Sistema

### Método 1: Desde Consola del Navegador

1. **Abrir el juego** en el navegador
2. **Abrir DevTools** (F12)
3. **Usar las funciones de prueba**:

```javascript
// Obtener desbloqueos de un jugador
await UnlockTestUtils.testGetPlayerUnlocks(1);

// Desbloquear un powerup específico
await UnlockTestUtils.testUnlockPowerup(1, 'shield');

// Probar todo el sistema
await UnlockTestUtils.runFullUnlockTest(1);

// Simular desbloqueos durante el juego
await UnlockTestUtils.simulateGameUnlocks(1, 2);

// Ver resumen de todos los desbloqueos
await UnlockTestUtils.testUnlockSummary();
```

### Método 2: Jugando Partidas Reales

1. **Iniciar una partida** con dos jugadores registrados
2. **Acumular puntos** capturando piezas
3. **Observar las notificaciones** cuando se alcancen los umbrales
4. **Verificar en siguientes partidas** que los PowerUps están disponibles

### Método 3: Base de Datos Directa

```sql
-- Ver estado de desbloqueos
SELECT j.email, jpd.* 
FROM Jugador j 
LEFT JOIN Jugador_Powerup_Desbloqueo jpd ON j.id_jugador = jpd.id_jugador;

-- Desbloquear manualmente (para pruebas)
INSERT INTO Jugador_Powerup_Desbloqueo (id_jugador, shield_desbloqueado)
VALUES (1, TRUE)
ON DUPLICATE KEY UPDATE shield_desbloqueado = TRUE;
```

## 🐛 Resolución de Problemas

### PowerUps no se desbloquean
1. **Verificar puntuación**: Confirmar que se alcanzó el umbral
2. **Revisar logs del servidor**: Buscar errores en la consola
3. **Verificar conexión a BD**: Confirmar que los endpoints responden

### Modal no aparece
1. **Verificar elementos del DOM**: Confirmar que `powerup-unlock-modal` existe
2. **Revisar CSS**: Confirmar que `powerup-unlock-modal.css` está cargado
3. **Verificar funciones**: Confirmar que `createUnlockParticles` está definida

### PowerUps no aparecen en futuras partidas
1. **Verificar carga inicial**: Revisar logs de carga de desbloqueos
2. **Confirmar base de datos**: Verificar que los desbloqueos se guardaron
3. **Revisar filtros**: Confirmar que `getRandomPowerUp` filtra correctamente

## 📝 Logs Importantes

### Cliente (Navegador)
```
✅ Desbloqueos combinados cargados: {Shield: true, Cage: false, ...}
🔓 PowerUp desbloqueado por Blancas: Shield (Puntos totales: 105 >= 100)
💾 Shield persistido en BD para ambos jugadores
🎉 Modal mostrado: Shield desbloqueado por w
```

### Servidor
```
🔓 Desbloqueando shield para jugador 1
✅ shield desbloqueado exitosamente para jugador 1
✅ Desbloqueos obtenidos para jugador 1: {...}
```

## 🔧 Configuración Avanzada

### Cambiar Umbrales
Editar en `chess-game/assets/js/game.js`:
```javascript
const unlockThresholds = {
    'Shield': 100,    // Cambiar aquí
    'Cage': 200,      // Cambiar aquí
    'Swap': 400,      // Cambiar aquí
    'Reducer': 800    // Cambiar aquí
};
```

### Agregar Nuevos PowerUps
1. **Agregar columna en BD**:
```sql
ALTER TABLE Jugador_Powerup_Desbloqueo 
ADD COLUMN nuevo_powerup_desbloqueado BOOLEAN DEFAULT FALSE;
```

2. **Actualizar endpoints del servidor**
3. **Actualizar código del juego**
4. **Actualizar vista de estadísticas**

## 📊 Estadísticas y Métricas

El sistema incluye un endpoint de resumen que proporciona:
- Total de jugadores registrados
- Jugadores con al menos un desbloqueo
- Cantidad de jugadores por cada PowerUp desbloqueado

Use `GET /api/unlocks/summary` para obtener estas métricas.

---

## 🚀 Estado del Sistema

✅ **Completado**:
- Tabla de base de datos
- Endpoints API completos
- Lógica de desbloqueo automático
- Modal de notificación
- Persistencia en BD
- Sistema de pruebas
- Carga al iniciar partidas

🔄 **En progreso**:
- Integración con leaderboard
- Métricas avanzadas

📋 **Por hacer**:
- PowerUps adicionales
- Sistema de logros
- Interfaz de administración 