// Script para inicializar powerups en la base de datos
const server = 'http://localhost:3000';

const powerupsToCreate = [
    { id: 1, name: 'Fence', description: 'Coloca una valla que bloquea el movimiento' },
    { id: 2, name: 'Pawn Range', description: 'Extiende el rango de movimiento de los peones' },
    { id: 3, name: 'Crazy King', description: 'El rey puede moverse como una reina por un turno' },
    { id: 4, name: 'Horizontal Portal', description: 'Crea un portal horizontal en el tablero' },
    { id: 5, name: 'Blast', description: 'Destruye piezas en un área' },
    { id: 6, name: 'Shield', description: 'Protege una pieza de ser capturada' },
    { id: 7, name: 'Cage', description: 'Enjaulada una pieza enemiga' },
    { id: 8, name: 'Extra Move', description: 'Permite un movimiento adicional' },
    { id: 9, name: 'Evolution', description: 'Evoluciona un peón a una pieza superior' },
    { id: 10, name: 'Reducer', description: 'Reduce las capacidades de una pieza enemiga' },
    { id: 11, name: 'Swap', description: 'Intercambia las posiciones de dos piezas' }
];

async function initializePowerups() {
    console.log('🚀 Inicializando powerups en la base de datos...');
    
    for (const powerup of powerupsToCreate) {
        try {
            const response = await fetch(`${server}/api/powerups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: powerup.name,
                    descripcion: powerup.description
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log(`✅ Powerup creado: ${powerup.name}`);
            } else {
                const error = await response.json();
                if (error.error === 'POWERUP_ALREADY_EXISTS') {
                    console.log(`ℹ️ Powerup ya existe: ${powerup.name}`);
                } else {
                    console.error(`❌ Error creando ${powerup.name}:`, error.message);
                }
            }
        } catch (error) {
            console.error(`❌ Error de red para ${powerup.name}:`, error);
        }
    }
    
    console.log('✅ Inicialización de powerups completada');
}

// Exportar para uso manual solamente
window.initializePowerups = initializePowerups;

// REMOVIDO: Auto-ejecución ya que los powerups ya existen
console.log('💡 Para inicializar powerups manualmente, ejecuta: window.initializePowerups()'); 