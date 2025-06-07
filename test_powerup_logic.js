// Test simple para verificar la lógica de PowerUps múltiples
console.log("=== Test de lógica de PowerUps múltiples ===");

// Simular contexto de juego
const mockGameContext = {
    score1: 4, // Jugador blanco tiene 4 puntos
    score2: 2, // Jugador negro tiene 2 puntos
    nextThresholdWhite: 5, // Próximo umbral para blanco
    nextThresholdBlack: 5, // Próximo umbral para negro
    grantedPowerUps: [], // Para trackear PowerUps otorgados
    grantPowerUp: function(player, powerUp) {
        this.grantedPowerUps.push({player, powerUp});
        console.log(`✓ PowerUp otorgado: ${powerUp} para ${player}`);
    }
};

// Función simplificada para obtener PowerUp aleatorio
function getRandomPowerUp() {
    const powerUps = ['Fence', 'Shield', 'Blast', 'Portal'];
    return powerUps[Math.floor(Math.random() * powerUps.length)];
}

// Simular la lógica corregida
function simulateScoreUpdate(playerColor, points, gameContext) {
    console.log(`\n--- ${playerColor === 'w' ? 'Blanco' : 'Negro'} gana ${points} puntos ---`);
    console.log(`Puntuación antes: ${playerColor === 'w' ? gameContext.score1 : gameContext.score2}`);
    
    if (playerColor === 'w') {
        gameContext.score1 += points;
        console.log(`Puntuación después: ${gameContext.score1}`);
        console.log(`Umbral actual: ${gameContext.nextThresholdWhite}`);
        
        // Calculate how many PowerUps should be granted
        let powerUpsGranted = 0;
        while (gameContext.score1 >= gameContext.nextThresholdWhite) {
            const newPowerUp = getRandomPowerUp();
            if (newPowerUp) {
                gameContext.grantPowerUp('w', newPowerUp);
                powerUpsGranted++;
            }
            gameContext.nextThresholdWhite += 5;
        }
        console.log(`PowerUps otorgados: ${powerUpsGranted}`);
        console.log(`Próximo umbral: ${gameContext.nextThresholdWhite}`);
    } else { // 'b'
        gameContext.score2 += points;
        console.log(`Puntuación después: ${gameContext.score2}`);
        console.log(`Umbral actual: ${gameContext.nextThresholdBlack}`);
        
        // Calculate how many PowerUps should be granted
        let powerUpsGranted = 0;
        while (gameContext.score2 >= gameContext.nextThresholdBlack) {
            const newPowerUp = getRandomPowerUp();
            if (newPowerUp) {
                gameContext.grantPowerUp('b', newPowerUp);
                powerUpsGranted++;
            }
            gameContext.nextThresholdBlack += 5;
        }
        console.log(`PowerUps otorgados: ${powerUpsGranted}`);
        console.log(`Próximo umbral: ${gameContext.nextThresholdBlack}`);
    }
}

// Test 1: Jugador blanco captura reina (9 puntos) - debería obtener 2 PowerUps
console.log("\n🧪 TEST 1: Blanco captura reina (9 puntos)");
console.log("Esperado: 2 PowerUps (4+9=13 puntos, cruza umbrales 5 y 10)");
simulateScoreUpdate('w', 9, mockGameContext);

// Test 2: Jugador negro captura torre (6 puntos) - debería obtener 1 PowerUp
console.log("\n🧪 TEST 2: Negro captura torre (6 puntos)");
console.log("Esperado: 1 PowerUp (2+6=8 puntos, cruza umbral 5)");
simulateScoreUpdate('b', 6, mockGameContext);

// Test 3: Jugador blanco captura peón (2 puntos) - no debería obtener PowerUp
console.log("\n🧪 TEST 3: Blanco captura peón (2 puntos)");
console.log("Esperado: 0 PowerUps (13+2=15 puntos, no cruza umbral 15)");
simulateScoreUpdate('w', 2, mockGameContext);

console.log("\n=== Resumen de PowerUps otorgados ===");
mockGameContext.grantedPowerUps.forEach((grant, index) => {
    console.log(`${index + 1}. ${grant.powerUp} para ${grant.player}`);
});

console.log("\n=== Estado final ===");
console.log(`Blanco: ${mockGameContext.score1} puntos (próximo umbral: ${mockGameContext.nextThresholdWhite})`);
console.log(`Negro: ${mockGameContext.score2} puntos (próximo umbral: ${mockGameContext.nextThresholdBlack})`);
