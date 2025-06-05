// Leaderboard JavaScript
class LeaderboardManager {
    constructor() {
        this.playersData = [];
        this.filteredData = [];
        this.currentSort = { field: 'puntajeTotal', direction: 'desc' };
        this.currentSearchTerm = '';
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
        this.statsOverview = document.getElementById('statsOverview');        // Controles
        this.refreshBtn = document.getElementById('refreshBtn');
        this.refreshIcon = document.getElementById('refreshIcon');
        this.retryBtn = document.getElementById('retryBtn');
        this.backBtn = document.getElementById('backBtn');
        this.sortSelect = document.getElementById('sortBy');
        this.lastUpdated = document.getElementById('lastUpdated');        // Elementos de búsqueda
        this.playerSearch = document.getElementById('playerSearch');
        this.searchBtn = document.getElementById('searchBtn');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.searchResults = document.getElementById('searchResults');

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

    setupEventListeners() {        // Botón de actualizar
        this.refreshBtn.addEventListener('click', () => {
            this.loadData();
        });

        // Botón de reintentar
        this.retryBtn.addEventListener('click', () => {
            this.loadData();
        });

        // Botón de main menu
        const mainMenuBtn = document.getElementById('leaderboardMainMenuBtn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Botón de volver
        this.backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });        // Selector de ordenamiento
        this.sortSelect.addEventListener('change', (e) => {
            this.sortData(e.target.value, 'desc');
        });        // Búsqueda de jugadores
        this.playerSearch.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });        // Búsqueda con Enter
        this.playerSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSpecificSearch(e.target.value);
            }
        });// Botón de búsqueda con lupa
        this.searchBtn.addEventListener('click', () => {
            this.handleSpecificSearch(this.playerSearch.value);
        });

        // Limpiar búsqueda
        this.clearSearchBtn.addEventListener('click', () => {
            this.clearSearch();
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
            }            this.playersData = playersResult.data || [];
            console.log('Loaded playersData:', this.playersData);
            console.log('Sample player data:', this.playersData[0]);

            // Inicializar datos filtrados
            this.filteredData = [...this.playersData];

            // Cargar estadísticas adicionales si es necesario
            await this.loadAdditionalStats();

            if (this.playersData.length === 0) {
                this.showState('empty');
            } else {
                this.renderData();
                this.showState('data');
            }

            this.updateLastUpdatedTime();        } catch (error) {
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
    }    sortData(field, direction = 'desc') {
        this.currentSort = { field, direction };
        this.sortFilteredData();
        this.renderLeaderboardTable();
        this.sortSelect.value = field;
    }    updateSortIndicators(clickedHeader, direction) {
        // Remover indicadores activos
        document.querySelectorAll('.sortable').forEach(header => {
            header.classList.remove('active');
            header.querySelector('.sort-arrow').textContent = '';
        });

        // Agregar indicador al header clickeado
        clickedHeader.classList.add('active');
        clickedHeader.querySelector('.sort-arrow').textContent = direction === 'desc' ? '↓' : '↑';
    }    handleSearch(searchTerm) {
        console.log('🔍 handleSearch called with:', searchTerm);
        
        this.currentSearchTerm = searchTerm.toLowerCase().trim();
        console.log('📝 Current search term set to:', this.currentSearchTerm);
        console.log('📊 Total players data:', this.playersData.length);
        
        // Filtrar los datos por email
        if (!this.currentSearchTerm) {
            console.log('⭕ No search term, showing all data');
            this.filteredData = [...this.playersData];
        } else {
            console.log('🔍 Filtering by email...');
            this.filteredData = this.playersData.filter(player => {
                const playerEmail = (player.email || '').toLowerCase();
                const matches = playerEmail.includes(this.currentSearchTerm);
                console.log(`✉️ Checking: "${playerEmail}" contains "${this.currentSearchTerm}" = ${matches}`);
                return matches;
            });
        }
        
        console.log('✅ Filtered data length:', this.filteredData.length);
        
        // Aplicar ordenamiento y renderizar
        this.sortFilteredData();
        this.renderStatsOverview();
        this.renderLeaderboardTable();
        this.updateSearchResultsCount();
        
        // Mostrar/ocultar botón de limpiar búsqueda
        this.clearSearchBtn.style.display = this.currentSearchTerm ? 'flex' : 'none';
        
        console.log('🎯 Search completed');
    }clearSearch() {
        this.currentSearchTerm = '';
        this.playerSearch.value = '';
        this.clearSearchBtn.style.display = 'none';
        this.searchResults.textContent = '';
        
        // Restaurar estilos normales del contador de resultados
        this.searchResults.style.color = '#ffd54f';
        this.searchResults.style.fontWeight = '500';
        
        // Restaurar todos los datos
        this.filteredData = [...this.playersData];
        this.sortFilteredData();
        this.renderStatsOverview();
        this.renderLeaderboardTable();
    }handleSpecificSearch(searchTerm) {
        // Agregar efecto visual al botón de búsqueda
        this.searchBtn.style.transform = 'translateY(-50%) scale(0.9)';
        setTimeout(() => {
            this.searchBtn.style.transform = 'translateY(-50%) scale(1)';
        }, 150);
        
        // Usar la misma lógica que handleSearch
        this.handleSearch(searchTerm);
    }showNoResultsMessage(searchTerm) {
        this.filteredData = [];
        this.leaderboardBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-results-message">
                    <div class="no-results-content">
                        <span class="no-results-icon"></span>
                        <h3>No se encontraron jugadores</h3>
                        <p>No hay jugadores que coincidan con "<strong>${this.escapeHtml(searchTerm)}</strong>"</p>
                        <button class="btn-secondary" onclick="window.leaderboardManager.clearSearch()">
                            Ver todos los jugadores
                        </button>
                    </div>
                </td>
            </tr>
        `;
        this.searchResults.textContent = '0 jugadores encontrados';
        this.searchResults.style.color = '#ff6b6b';
        this.searchResults.style.fontWeight = '500';
        this.clearSearchBtn.style.display = 'flex';
    }    showNoDataWarning() {
        this.searchResults.textContent = 'No hay datos de jugadores disponibles';
        this.searchResults.style.color = '#ff6b6b';
        this.searchResults.style.fontWeight = '500';
        this.clearSearchBtn.style.display = 'none';
        
        // También mostrar un mensaje en la tabla
        this.leaderboardBody.innerHTML = `
            <tr>
                <td colspan="9" class="no-results-message">
                    <div class="no-results-content">
                        <span class="no-results-icon">⚠️</span>
                        <h3>No hay datos disponibles</h3>
                        <p>Necesitas cargar datos de jugadores antes de poder buscar</p>
                        <button class="btn-primary" onclick="window.leaderboardManager.loadData()">
                            Cargar datos
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }updateSpecificSearchResults(count, searchTerm) {
        if (count === 1) {
            this.searchResults.textContent = `Jugador encontrado: "${searchTerm}"`;
            this.searchResults.style.color = '#4caf50';
            this.searchResults.style.fontWeight = '600';
        } else if (count > 1) {
            this.searchResults.textContent = `${count} jugadores encontrados para "${searchTerm}"`;
            this.searchResults.style.color = '#ffd54f';
            this.searchResults.style.fontWeight = '500';
        } else {
            this.searchResults.textContent = '0 jugadores encontrados';
            this.searchResults.style.color = '#ff6b6b';
            this.searchResults.style.fontWeight = '500';
        }
    }    updateSearchResultsCount() {
        if (!this.currentSearchTerm) {
            this.searchResults.textContent = '';
        } else {
            const count = this.filteredData.length;
            const total = this.playersData.length;
            this.searchResults.textContent = `${count} de ${total} jugadores`;
        }
    }

    sortFilteredData() {
        const { field, direction } = this.currentSort;
        
        this.filteredData.sort((a, b) => {
            let aVal = this.safeParseNumber(a[field]);
            let bVal = this.safeParseNumber(b[field]);
            
            if (direction === 'desc') {
                return bVal - aVal;
            } else {
                return aVal - bVal;
            }
        });
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
    }    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString();
    }

    safeParseNumber(value) {
        if (value === null || value === undefined) return 0;
        
        // Si es un array, sumar todos los elementos
        if (Array.isArray(value)) {
            return value.reduce((sum, item) => {
                const parsed = parseFloat(item);
                return sum + (isNaN(parsed) ? 0 : parsed);
            }, 0);
        }
        
        // Si es una cadena que contiene comas (lista), tratarla como array
        if (typeof value === 'string' && value.includes(',')) {
            const items = value.split(',').map(item => item.trim());
            return items.reduce((sum, item) => {
                const parsed = parseFloat(item);
                return sum + (isNaN(parsed) ? 0 : parsed);
            }, 0);
        }
        
        // Convertir a número
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }    renderData() {
        this.filteredData = [...this.playersData];
        this.sortFilteredData();
        this.renderStatsOverview();
        this.renderLeaderboardTable();
    }renderStatsOverview() {
        // Usar datos filtrados cuando hay una búsqueda activa
        const dataToUse = this.filteredData.length >= 0 && this.currentSearchTerm ? this.filteredData : this.playersData;
        
        const totalPlayers = dataToUse.length;
        const totalGamesPlayed = dataToUse.reduce((sum, player) => sum + this.safeParseNumber(player.partidasJugadas), 0);
        const totalPowerupsUsed = dataToUse.reduce((sum, player) => sum + this.safeParseNumber(player.powerupsUsados), 0);
        const totalCapturesCount = dataToUse.reduce((sum, player) => sum + this.safeParseNumber(player.piezasCapturadas), 0);

        this.totalPlayers.textContent = this.formatNumber(totalPlayers);
        this.totalGames.textContent = this.formatNumber(totalGamesPlayed);
        this.totalPowerups.textContent = this.formatNumber(totalPowerupsUsed);
        this.totalCaptures.textContent = this.formatNumber(totalCapturesCount);
    }renderLeaderboardTable() {
        this.leaderboardBody.innerHTML = '';        this.filteredData.forEach((player, index) => {
            const rank = index + 1;
            const victorias = this.safeParseNumber(player.victorias);
            const partidasJugadas = this.safeParseNumber(player.partidasJugadas);
            const puntajeTotal = this.safeParseNumber(player.puntajeTotal);
            const piezasCapturadas = this.safeParseNumber(player.piezasCapturadas);
            const powerupsUsados = this.safeParseNumber(player.powerupsUsados);
            
            const winRate = this.calculateWinRate(victorias, partidasJugadas);
            const avgPointsPerGame = partidasJugadas > 0 ? 
                Math.round(puntajeTotal / partidasJugadas) : 0;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="rank-col">
                    <span class="${this.getRankClass(rank)}">${rank}</span>
                </td>
                <td class="player-col">
                    <strong>${this.escapeHtml(player.email)}</strong>
                </td>                <td class="stat-col">
                    <strong>${this.formatNumber(puntajeTotal)}</strong>
                </td>
                <td class="stat-col">
                    ${this.formatNumber(victorias)}
                </td>
                <td class="stat-col">
                    ${this.formatNumber(partidasJugadas)}
                </td>
                <td class="stat-col">
                    <span class="${this.getWinRateClass(winRate)}">${winRate}%</span>
                </td>                <td class="stat-col">
                    ${this.formatNumber(this.safeParseNumber(player.piezasCapturadas))}
                </td>
                <td class="stat-col">
                    ${this.formatNumber(this.safeParseNumber(player.powerupsUsados))}
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
        });        this.lastUpdated.textContent = `Última actualización: ${timeString}`;
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
