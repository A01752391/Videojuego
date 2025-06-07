/**
 * Test script para verificar las probabilidades de rareza de PowerUps
 * Simula 10,000 otorgamientos para verificar las distribuciones
 */

// Simular la función getAvailablePowerUpTypes()
function getAvailablePowerUpTypes() {
    return ['Fence', 'Shield', 'Pawn Range', 'Evolution', 'Cage', 'Blast', 
            'Horizontal Portal', 'Extra Move', 'Crazy King', 'Reducer', 'Swap'];
}

// Copiar la función getRandomPowerUp() del juego
function getRandomPowerUp() {
    // Define PowerUp rarities with their probabilities
    const powerUpRarities = {
        // COMUNES (75% total) - 18.75% cada uno
        'Fence': 18.75,
        'Shield': 18.75,
        'Pawn Range': 18.75,
        'Evolution': 18.75,
        
        // RAROS (20% total) - 6.67% cada uno
        'Cage': 6.67,
        'Blast': 6.67,
        'Horizontal Portal': 6.66,
        
        // LEGENDARIOS (5% total) - 1.25% cada uno
        'Extra Move': 1.25,
        'Crazy King': 1.25,
        'Reducer': 1.25,
        'Swap': 1.25
    };
    
    // Get available power-up types
    const availableTypes = getAvailablePowerUpTypes();
    if (availableTypes.length === 0) {
        console.warn("No power-up types available to grant.");
        return null;
    }
    
    // Filter rarities to only include available types
    const availableRarities = {};
    let totalWeight = 0;
    
    availableTypes.forEach(type => {
        if (powerUpRarities[type]) {
            availableRarities[type] = powerUpRarities[type];
            totalWeight += powerUpRarities[type];
        }
    });
    
    if (totalWeight === 0) {
        // Fallback to equal probability if no rarities defined
        const randomIndex = Math.floor(Math.random() * availableTypes.length);
        return availableTypes[randomIndex];
    }
    
    // Generate random number and select based on weighted probability
    const random = Math.random() * totalWeight;
    let currentWeight = 0;
    
    for (const [type, weight] of Object.entries(availableRarities)) {
        currentWeight += weight;
        if (random <= currentWeight) {
            return type;
        }
    }
    
    // Fallback (shouldn't reach here)
    return availableTypes[0];
}

// Test function
function testPowerUpProbabilities() {
    const iterations = 10000;
    const results = {};
    
    // Initialize counters
    const allTypes = getAvailablePowerUpTypes();
    allTypes.forEach(type => {
        results[type] = 0;
    });
    
    // Run test
    console.log(`🧪 Ejecutando ${iterations} simulaciones de otorgamiento de PowerUps...`);
    
    for (let i = 0; i < iterations; i++) {
        const powerUp = getRandomPowerUp();
        if (powerUp) {
            results[powerUp]++;
        }
    }
    
    // Calculate and display results
    console.log('\n📊 RESULTADOS DE PROBABILIDAD:');
    console.log('================================');
    
    // Group by rarity
    const common = ['Fence', 'Shield', 'Pawn Range', 'Evolution'];
    const rare = ['Cage', 'Blast', 'Horizontal Portal'];
    const legendary = ['Extra Move', 'Crazy King', 'Reducer', 'Swap'];
    
    let commonTotal = 0, rareTotal = 0, legendaryTotal = 0;
    
    console.log('\n⚪ COMUNES (Target: ~18.75% cada uno, 75% total):');
    common.forEach(type => {
        const percentage = ((results[type] / iterations) * 100).toFixed(2);
        console.log(`  ${type}: ${results[type]} (${percentage}%)`);
        commonTotal += results[type];
    });
    
    console.log('\n🔵 RAROS (Target: ~6.67% cada uno, 20% total):');
    rare.forEach(type => {
        const percentage = ((results[type] / iterations) * 100).toFixed(2);
        console.log(`  ${type}: ${results[type]} (${percentage}%)`);
        rareTotal += results[type];
    });
    
    console.log('\n🟡 LEGENDARIOS (Target: ~1.25% cada uno, 5% total):');
    legendary.forEach(type => {
        const percentage = ((results[type] / iterations) * 100).toFixed(2);
        console.log(`  ${type}: ${results[type]} (${percentage}%)`);
        legendaryTotal += results[type];
    });
    
    console.log('\n📈 RESUMEN POR RAREZA:');
    console.log('=======================');
    console.log(`⚪ Comunes: ${commonTotal} (${((commonTotal/iterations)*100).toFixed(1)}%) - Target: 75%`);
    console.log(`🔵 Raros: ${rareTotal} (${((rareTotal/iterations)*100).toFixed(1)}%) - Target: 20%`);
    console.log(`🟡 Legendarios: ${legendaryTotal} (${((legendaryTotal/iterations)*100).toFixed(1)}%) - Target: 5%`);
    
    const total = commonTotal + rareTotal + legendaryTotal;
    console.log(`\n✅ Total verificado: ${total}/${iterations} (${((total/iterations)*100).toFixed(1)}%)`);
}

// Ejecutar el test
testPowerUpProbabilities();
