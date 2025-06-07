/**
 * Test script para validar la prevención de duplicados y selección de PowerUps alternativos
 */

// Simulación de las funciones necesarias
const powerUpRarities = {
    'Fence': 18.75,
    'Shield': 18.75,
    'Pawn Range': 18.75,
    'Evolution': 18.75,
    'Cage': 6.67,
    'Blast': 6.67,
    'Horizontal Portal': 6.66,
    'Extra Move': 1.25,
    'Crazy King': 1.25,
    'Reducer': 1.25,
    'Swap': 1.25
};

function getAvailablePowerUpTypes() {
    return Object.keys(powerUpRarities);
}

function getRandomPowerUp() {
    const availableTypes = getAvailablePowerUpTypes();
    const availableRarities = {};
    let totalWeight = 0;
    
    availableTypes.forEach(type => {
        if (powerUpRarities[type]) {
            availableRarities[type] = powerUpRarities[type];
            totalWeight += powerUpRarities[type];
        }
    });
    
    const random = Math.random() * totalWeight;
    let currentWeight = 0;
    
    for (const [type, weight] of Object.entries(availableRarities)) {
        currentWeight += weight;
        if (random <= currentWeight) {
            return type;
        }
    }
    
    return availableTypes[0];
}

function getPowerUpInfo(powerUpType) {
    return { name: powerUpType };
}

function getPowerUpRarity(powerUpType) {
    const commonPowerUps = ['Fence', 'Shield', 'Pawn Range', 'Evolution'];
    const rarePowerUps = ['Cage', 'Blast', 'Horizontal Portal'];
    const legendaryPowerUps = ['Extra Move', 'Crazy King', 'Reducer', 'Swap'];
    
    if (commonPowerUps.includes(powerUpType)) return 'Común';
    if (rarePowerUps.includes(powerUpType)) return 'Raro';
    if (legendaryPowerUps.includes(powerUpType)) return 'Legendario';
    return 'Común';
}

// Simulación del gameContext con la nueva función grantPowerUp
const gameContext = {
    powerUpsWhite: [],
    powerUpsBlack: [],
    messageElement: { textContent: '' },
    renderBoard: function() { /* simulación */ },
    
    grantPowerUp: function(color, powerUpType) {
        if (!powerUpType) return;
        
        const inventory = color === 'w' ? this.powerUpsWhite : this.powerUpsBlack;
        const maxPowerUps = 5;
        
        if (inventory.length >= maxPowerUps) {
            if (this.messageElement) {
                this.messageElement.textContent = `${color === 'w' ? 'Blancas' : 'Negras'} tienen el máximo de power-ups (${maxPowerUps}).`;
            }
            return;
        }
        
        let selectedPowerUp = powerUpType;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (inventory.includes(selectedPowerUp) && attempts < maxAttempts) {
            if (attempts === 0 && this.messageElement) {
                const powerUpInfo = getPowerUpInfo(powerUpType);
                const powerUpName = powerUpInfo ? powerUpInfo.name : powerUpType;
                this.messageElement.textContent = 
                    `${color === 'w' ? 'Blancas' : 'Negras'} ya tienen ${powerUpName}. Buscando alternativa...`;
            }
            
            selectedPowerUp = getRandomPowerUp();
            attempts++;
            
            console.log(`Intento ${attempts}: PowerUp duplicado detectado (${powerUpType}), probando ${selectedPowerUp}`);
        }
        
        if (inventory.includes(selectedPowerUp)) {
            if (this.messageElement) {
                this.messageElement.textContent = 
                    `${color === 'w' ? 'Blancas' : 'Negras'} tienen todos los PowerUps disponibles. No se otorga nada.`;
            }
            console.warn(`No se pudo encontrar PowerUp alternativo después de ${maxAttempts} intentos`);
            return;
        }
        
        inventory.push(selectedPowerUp);
        if (this.messageElement) {
            const powerUpInfo = getPowerUpInfo(selectedPowerUp);
            const powerUpName = powerUpInfo ? powerUpInfo.name : selectedPowerUp;
            const rarity = getPowerUpRarity(selectedPowerUp);
            
            const rarityEmoji = {
                'Común': '⚪',
                'Raro': '🔵', 
                'Legendario': '🟡'
            };
            
            const isAlternative = selectedPowerUp !== powerUpType;
            const messagePrefix = isAlternative ? 
                `¡${color === 'w' ? 'Blancas' : 'Negras'} obtienen (alternativo) ` : 
                `¡${color === 'w' ? 'Blancas' : 'Negras'} obtienen `;
            
            this.messageElement.textContent = 
                `${messagePrefix}${rarityEmoji[rarity]} ${powerUpName} (${rarity})!`;
                
            if (isAlternative) {
                console.log(`PowerUp alternativo otorgado: ${selectedPowerUp} en lugar de ${powerUpType}`);
            }
        }
        
        this.renderBoard();
    }
};

// Tests
console.log('🧪 Iniciando pruebas de prevención de duplicados...\n');

// Test 1: Otorgar PowerUps únicos inicialmente
console.log('Test 1: Otorgando PowerUps únicos');
console.log('='.repeat(40));

gameContext.grantPowerUp('w', 'Fence');
console.log(`Blancas: [${gameContext.powerUpsWhite.join(', ')}]`);
console.log(`Mensaje: ${gameContext.messageElement.textContent}\n`);

gameContext.grantPowerUp('w', 'Shield');
console.log(`Blancas: [${gameContext.powerUpsWhite.join(', ')}]`);
console.log(`Mensaje: ${gameContext.messageElement.textContent}\n`);

// Test 2: Intentar otorgar PowerUp duplicado
console.log('Test 2: Intentando otorgar PowerUp duplicado');
console.log('='.repeat(40));

console.log('Intentando otorgar Fence (duplicado)...');
gameContext.grantPowerUp('w', 'Fence');
console.log(`Blancas: [${gameContext.powerUpsWhite.join(', ')}]`);
console.log(`Mensaje: ${gameContext.messageElement.textContent}\n`);

// Test 3: Llenar inventario gradualmente
console.log('Test 3: Llenando inventario gradualmente');
console.log('='.repeat(40));

const powerUpsToTry = ['Cage', 'Blast', 'Extra Move', 'Crazy King'];
powerUpsToTry.forEach(powerUp => {
    console.log(`Otorgando ${powerUp}...`);
    gameContext.grantPowerUp('w', powerUp);
    console.log(`Blancas: [${gameContext.powerUpsWhite.join(', ')}]`);
    console.log(`Mensaje: ${gameContext.messageElement.textContent}\n`);
});

// Test 4: Intentar otorgar cuando inventario está lleno
console.log('Test 4: Inventario lleno - intentando otorgar más PowerUps');
console.log('='.repeat(40));

console.log('Intentando otorgar Horizontal Portal cuando hay 5 PowerUps...');
gameContext.grantPowerUp('w', 'Horizontal Portal');
console.log(`Blancas: [${gameContext.powerUpsWhite.join(', ')}]`);
console.log(`Mensaje: ${gameContext.messageElement.textContent}\n`);

// Test 5: Caso extremo - todos los PowerUps en inventario
console.log('Test 5: Caso extremo - inventario con todos los PowerUps disponibles');
console.log('='.repeat(40));

// Simular inventario completo (solo para test)
const testContext = {
    powerUpsWhite: getAvailablePowerUpTypes(),
    powerUpsBlack: [],
    messageElement: { textContent: '' },
    renderBoard: gameContext.renderBoard,
    grantPowerUp: gameContext.grantPowerUp
};

console.log(`PowerUps disponibles: ${getAvailablePowerUpTypes().length}`);
console.log(`Inventario simulado: [${testContext.powerUpsWhite.join(', ')}]`);
console.log('Intentando otorgar cualquier PowerUp...');
testContext.grantPowerUp.call(testContext, 'w', 'Fence');
console.log(`Mensaje: ${testContext.messageElement.textContent}\n`);

// Test 6: Estadísticas de alternativas
console.log('Test 6: Estadísticas de PowerUps alternativos');
console.log('='.repeat(40));

const freshContext = {
    powerUpsWhite: ['Fence', 'Shield'], // Ya tiene 2 PowerUps
    powerUpsBlack: [],
    messageElement: { textContent: '' },
    renderBoard: gameContext.renderBoard,
    grantPowerUp: gameContext.grantPowerUp
};

let alternativeCount = 0;
let totalAttempts = 0;

for (let i = 0; i < 20; i++) {
    const initialLength = freshContext.powerUpsWhite.length;
    const randomPowerUp = getRandomPowerUp();
    
    console.log(`Intento ${i + 1}: Otorgando ${randomPowerUp}...`);
    freshContext.grantPowerUp.call(freshContext, 'w', randomPowerUp);
    
    totalAttempts++;
    if (freshContext.powerUpsWhite.length > initialLength) {
        const addedPowerUp = freshContext.powerUpsWhite[freshContext.powerUpsWhite.length - 1];
        if (addedPowerUp !== randomPowerUp) {
            alternativeCount++;
            console.log(`  ➜ Alternativo otorgado: ${addedPowerUp} (solicitado: ${randomPowerUp})`);
        } else {
            console.log(`  ➜ PowerUp original otorgado: ${addedPowerUp}`);
        }
    } else {
        console.log(`  ➜ No se otorgó PowerUp (duplicado o inventario lleno)`);
    }
    
    console.log(`  Inventario actual: [${freshContext.powerUpsWhite.join(', ')}]`);
    console.log(`  Mensaje: ${freshContext.messageElement.textContent}\n`);
    
    // Parar cuando el inventario esté lleno
    if (freshContext.powerUpsWhite.length >= 5) {
        console.log('Inventario lleno alcanzado.');
        break;
    }
}

console.log('📊 Resumen de estadísticas:');
console.log(`- Total de intentos: ${totalAttempts}`);
console.log(`- PowerUps alternativos otorgados: ${alternativeCount}`);
console.log(`- Porcentaje de alternativas: ${((alternativeCount / totalAttempts) * 100).toFixed(1)}%`);
console.log(`- Inventario final: [${freshContext.powerUpsWhite.join(', ')}]`);

console.log('\n✅ Pruebas de prevención de duplicados completadas!');
