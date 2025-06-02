// Leaderboard JavaScript
class LeaderboardManager {
    constructor() {
        this.playersData = [];
        this.currentSort = { field: 'puntajeTotal', direction: 'desc' };
        this.initializeElements();
        this.setupEventListeners();
        this.loadData();
    }

    initializeElements() {
        // Estados
        this.loadingState = document.getElementById('loadingState');
        this.errorState = document.getElementById('errorState');
        this.emptyState = document.getElementById('emptyState');
        this.leaderboardTable = document.getElementById('leaderboardTable');
        this.statsOverview = document.getElementById('statsOverview');

        // Controles
        this.refreshBtn = document.getElementById('refreshBtn');
        this.refreshIcon = document.getElementById('refreshIcon');
        this.retryBtn = document.getElementById('retryBtn');
        this.backBtn = document.getElementById('backBtn');
        this.sortSelect = document.getElementById('sortBy');
        this.lastUpdated = document.getElementById('lastUpdated');

        // Elementos de la tabla
        this.leaderboardBody = document.getElementById('leaderboardBody');

        // Elementos de estadísticas
        this.totalPlayers = document.getElementById('totalPlayers');
        this.totalGames = document.getElementById('totalGames');
        this.totalPowerups = document.getElementById('totalPowerups');
        this.totalCaptures = document.getElementById('totalCaptures');

        // Mensaje de error
        this.errorMessage = document.getElementById('errorMessage');
    }

    setupEventListeners() {
        // Botón de actualizar
        this.refreshBtn.addEventListener('click', () => {
            this.loadData();
        });

        // Botón de reintentar
        this.retryBtn.addEventListener('click', () => {
            this.loadData();
        });

        // Botón de volver
        this.backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Selector de ordenamiento
        this.sortSelect.addEventListener('change', (e) => {
            this.sortData(e.target.value, 'desc');
        });

        // Headers clickeables para ordenar
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sortable')) {
                const field = e.target.dataset.sort;
                const currentDirection = this.currentSort.field === field && this.currentSort.direction === 'desc' ? 'asc' : 'desc';
                this.sortData(field, currentDirection);
                this.updateSortIndicators(e.target, currentDirection);
            }
        });
    }

    showState(state) {
        // Ocultar todos los estados
        this.loadingState.style.display = 'none';
        this.errorState.style.display = 'none';
        this.emptyState.style.display = 'none';
        this.leaderboardTable.style.display = 'none';
        this.statsOverview.style.display = 'none';

        // Mostrar el estado solicitado
        switch (state) {
            case 'loading':
                this.loadingState.style.display = 'block';
                break;
            case 'error':
                this.errorState.style.display = 'block';
                break;
            case 'empty':
                this.emptyState.style.display = 'block';
                break;
            case 'data':
                this.leaderboardTable.style.display = 'block';
                this.statsOverview.style.display = 'grid';
                break;
        }
    }

    async loadData() {
        this.showState('loading');
        this.refreshIcon.classList.add('refresh-spinning');

        try {
            // Cargar estadísticas de jugadores
            const playersResponse = await fetch('/api/playerstats');
            
            if (!playersResponse.ok) {
                throw new Error(`Error ${playersResponse.status}: ${playersResponse.statusText}`);
            }

            const playersResult = await playersResponse.json();
            
            if (!playersResult.success) {
                throw new Error(playersResult.message || 'Error al cargar estadísticas');
            }

            this.playersData = playersResult.data || [];

            // Cargar estadísticas adicionales si es necesario
            await this.loadAdditionalStats();

            if (this.playersData.length === 0) {
                this.showState('empty');
            } else {
                this.renderData();
                this.showState('data');
            }

            this.updateLastUpdatedTime();

        } catch (error) {
            console.error('Error loading leaderboard data:', error);
            this.errorMessage.textContent = error.message;
            this.showState('error');
        } finally {
            this.refreshIcon.classList.remove('refresh-spinning');
        }
    }

    async loadAdditionalStats() {
        try {
            // Cargar estadísticas de partidas y powerups para el resumen
            const [gamesResponse, powerupsResponse] = await Promise.all([
                fetch('/api/games'),
                fetch('/api/powerups')
            ]);

            if (gamesResponse.ok) {
                const gamesResult = await gamesResponse.json();
                this.gamesData = gamesResult.data || [];
            }

            if (powerupsResponse.ok) {
                const powerupsResult = await powerupsResponse.json();
                this.powerupsData = powerupsResult.data || [];
            }
        } catch (error) {
            console.warn('Could not load additional stats:', error);
        }
    }

    sortData(field, direction = 'desc') {
        this.currentSort = { field, direction };
        
        this.playersData.sort((a, b) => {
            let aVal = a[field] || 0;
            let bVal = b[field] || 0;
            
            // Convertir a números si es necesario
            if (typeof aVal === 'string' && !isNaN(aVal)) aVal = Number(aVal);
            if (typeof bVal === 'string' && !isNaN(bVal)) bVal = Number(bVal);
            
            if (direction === 'desc') {
                return bVal - aVal;
            } else {
                return aVal - bVal;
            }
        });

        this.renderLeaderboardTable();
        this.sortSelect.value = field;
    }

    updateSortIndicators(clickedHeader, direction) {
        // Remover indicadores activos
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('active');
            header.querySelector('.sort-arrow').textContent = '↕️';
        });

        // Agregar indicador al header clickeado
        clickedHeader.classList.add('active');
        clickedHeader.querySelector('.sort-arrow').textContent = direction === 'desc' ? '↓' : '↑';
    }

    calculateWinRate(victorias, partidasJugadas) {
        if (!partidasJugadas || partidasJugadas === 0) return 0;
        return Math.round((victorias / partidasJugadas) * 100);
    }

    getWinRateClass(winRate) {
        if (winRate >= 75) return 'win-rate-excellent';
        if (winRate >= 60) return 'win-rate-good';
        if (winRate >= 40) return 'win-rate-average';
        return 'win-rate-poor';
    }

    getRankClass(rank) {
        switch (rank) {
            case 1: return 'rank-1';
            case 2: return 'rank-2';
            case 3: return 'rank-3';
            default: return '';
        }
    }

    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString();
    }

    renderData() {
        this.renderStatsOverview();
        this.renderLeaderboardTable();
    }

    renderStatsOverview() {
        const totalPlayers = this.playersData.length;
        const totalGamesPlayed = this.playersData.reduce((sum, player) => sum + (player.partidasJugadas || 0), 0);
        const totalPowerupsUsed = this.playersData.reduce((sum, player) => sum + (player.powerupsUsados || 0), 0);
        const totalCapturesCount = this.playersData.reduce((sum, player) => sum + (player.piezasCapturadas || 0), 0);

        this.totalPlayers.textContent = this.formatNumber(totalPlayers);
        this.totalGames.textContent = this.formatNumber(totalGamesPlayed);
        this.totalPowerups.textContent = this.formatNumber(totalPowerupsUsed);
        this.totalCaptures.textContent = this.formatNumber(totalCapturesCount);
    }

    renderLeaderboardTable() {
        this.leaderboardBody.innerHTML = '';

        this.playersData.forEach((player, index) => {
            const rank = index + 1;
            const winRate = this.calculateWinRate(player.victorias, player.partidasJugadas);
            const avgPointsPerGame = player.partidasJugadas > 0 ? 
                Math.round(player.puntajeTotal / player.partidasJugadas) : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="rank-col">
                    <span class="${this.getRankClass(rank)}">${rank}</span>
                </td>
                <td class="player-col">
                    <strong>${this.escapeHtml(player.email)}</strong>
                </td>
                <td class="stat-col">
                    <strong>${this.formatNumber(player.puntajeTotal || 0)}</strong>
                </td>
                <td class="stat-col">
                    ${this.formatNumber(player.victorias || 0)}
                </td>
                <td class="stat-col">
                    ${this.formatNumber(player.partidasJugadas || 0)}
                </td>
                <td class="stat-col">
                    <span class="${this.getWinRateClass(winRate)}">${winRate}%</span>
                </td>
                <td class="stat-col">
                    ${this.formatNumber(player.piezasCapturadas || 0)}
                </td>
                <td class="stat-col">
                    ${this.formatNumber(player.powerupsUsados || 0)}
                </td>
                <td class="stat-col">
                    ${this.formatNumber(avgPointsPerGame)}
                </td>
            `;

            this.leaderboardBody.appendChild(row);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.lastUpdated.textContent = `Última actualización: ${timeString}`;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.leaderboardManager = new LeaderboardManager();
});

// Auto-refresh cada 30 segundos (opcional)
setInterval(() => {
    if (document.visibilityState === 'visible') {
        const manager = window.leaderboardManager;
        if (manager && !manager.refreshIcon.classList.contains('refresh-spinning')) {
            manager.loadData();
        }
    }
}, 30000);
