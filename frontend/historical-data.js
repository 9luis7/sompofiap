// Historical Data and Heatmap Module for Sompo System
class HistoricalDataModule {
  constructor(app) {
    this.app = app;
    this.heatmapLayer = null;
    this.accidentMarkers = [];
    this.currentFilters = {
      years: 3,
      severity: null,
      uf: null,
      br: null,
    };
  }

  /**
   * Initialize historical data features
   */
  async initialize() {
    console.log('Initializing Historical Data Module...');
    // Setup will be called when map section is loaded
  }

  /**
   * Load and display heatmap on the map
   */
  async loadHeatmap(mapInstance) {
    try {
      const response = await this.fetchHeatmapData();

      if (!response.success || !response.data.points) {
        console.error('Failed to load heatmap data');
        return;
      }

      const points = response.data.points;

      // Remove existing heatmap layer
      if (this.heatmapLayer) {
        mapInstance.removeLayer(this.heatmapLayer);
      }

      // Format data for Leaflet.heat: [lat, lng, intensity]
      const heatData = points
        .filter(p => p.lat && p.lng)
        .map(p => [p.lat, p.lng, p.intensity || 0.5]);

      if (heatData.length === 0) {
        console.warn('No heatmap data to display');
        return;
      }

      // Create heatmap layer
      this.heatmapLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 35,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#00ff00',
          0.3: '#ffff00',
          0.5: '#ffa500',
          0.7: '#ff6600',
          1.0: '#ff0000',
        },
      });

      this.heatmapLayer.addTo(mapInstance);

      console.log(`Heatmap loaded with ${heatData.length} points`);

      return true;
    } catch (error) {
      console.error('Error loading heatmap:', error);
      this.app.showNotification('Erro ao carregar mapa de calor', 'error');
      return false;
    }
  }

  /**
   * Toggle heatmap visibility
   */
  toggleHeatmap(mapInstance, show) {
    if (!this.heatmapLayer) {
      if (show) {
        this.loadHeatmap(mapInstance);
      }
      return;
    }

    if (show) {
      this.heatmapLayer.addTo(mapInstance);
    } else {
      mapInstance.removeLayer(this.heatmapLayer);
    }
  }

  /**
   * Fetch heatmap data from API
   */
  async fetchHeatmapData() {
    const params = new URLSearchParams({
      years: this.currentFilters.years,
      limit: 5000,
    });

    if (this.currentFilters.severity) {
      params.append('severity', this.currentFilters.severity);
    }
    if (this.currentFilters.uf) {
      params.append('uf', this.currentFilters.uf);
    }
    if (this.currentFilters.br) {
      params.append('br', this.currentFilters.br);
    }

    try {
      const response = await fetch(`${window.API_BASE_URL}/accidents/heatmap?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      return { success: false, data: { points: [] } };
    }
  }

  /**
   * Load general statistics
   */
  async loadStatistics() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/accidents/statistics?years=3`);
      const data = await response.json();

      if (data.success) {
        this.displayStatistics(data.data);
      }

      return data;
    } catch (error) {
      console.error('Error loading statistics:', error);
      return null;
    }
  }

  /**
   * Display statistics in the UI
   */
  displayStatistics(stats) {
    // Update dashboard with real statistics
    if (stats.statistics) {
      const {
        total_accidents,
        total_deaths,
        total_serious_injuries,
        avg_risk_score,
        fatal_accidents,
        injury_accidents,
      } = stats.statistics;

      // Update stat cards if they exist
      this.updateStatCard('total-accidents', total_accidents?.toLocaleString() || '0');
      this.updateStatCard('fatal-accidents', fatal_accidents?.toLocaleString() || '0');
      this.updateStatCard('total-deaths', total_deaths?.toLocaleString() || '0');
      this.updateStatCard('avg-risk', avg_risk_score?.toFixed(2) || '0.00');
    }

    // Display top dangerous roads
    if (stats.topDangerousRoads) {
      this.displayDangerousRoads(stats.topDangerousRoads);
    }
  }

  /**
   * Update a stat card by ID
   */
  updateStatCard(id, value) {
    const element = document.querySelector(`[data-stat="${id}"] .stat-number`);
    if (element) {
      element.textContent = value;
    }
  }

  /**
   * Display dangerous roads list
   */
  displayDangerousRoads(roads) {
    const container = document.getElementById('dangerous-roads-list');
    if (!container) return;

    container.innerHTML = roads
      .slice(0, 10)
      .map(
        (road, index) => `
      <div class="dangerous-road-item" data-uf="${road.uf}" data-br="${road.br}">
        <div class="road-rank">${index + 1}</div>
        <div class="road-info">
          <div class="road-name">${road.roadName}</div>
          <div class="road-stats">
            <span><i class="fas fa-car-crash"></i> ${road.totalAccidents} acidentes</span>
            <span><i class="fas fa-skull-crossbones"></i> ${road.totalDeaths} mortes</span>
            <span class="risk-badge risk-${road.avgRiskScore >= 7 ? 'critical' : road.avgRiskScore >= 4 ? 'high' : 'medium'}">
              Risco: ${road.avgRiskScore.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    `
      )
      .join('');

    // Add click handlers to zoom to road on map
    container.querySelectorAll('.dangerous-road-item').forEach(item => {
      item.addEventListener('click', () => {
        const uf = item.dataset.uf;
        const br = item.dataset.br;
        this.zoomToRoad(uf, br);
      });
    });
  }

  /**
   * Zoom map to a specific road
   */
  async zoomToRoad(uf, br) {
    try {
      // Get accidents for this road
      const response = await fetch(
        `${window.API_BASE_URL}/accidents/by-route?uf=${uf}&br=${br}&years=3`
      );
      const data = await response.json();

      if (data.success && data.data.accidents.length > 0) {
        const accidents = data.data.accidents;

        // Calculate bounds
        const lats = accidents.filter(a => a.latitude).map(a => a.latitude);
        const lngs = accidents.filter(a => a.longitude).map(a => a.longitude);

        if (lats.length > 0 && lngs.length > 0) {
          const bounds = [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)],
          ];

          // Get map instance from app
          const mapInstance = this.app.maps.mainMap;
          if (mapInstance) {
            mapInstance.fitBounds(bounds, { padding: [50, 50] });
            this.app.showNotification(`Exibindo BR-${br} (${uf})`, 'info');
          }
        }
      }
    } catch (error) {
      console.error('Error zooming to road:', error);
    }
  }

  /**
   * Load accident hotspots
   */
  async loadHotspots(mapInstance) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/accidents/hotspots?years=3&limit=50`);
      const data = await response.json();

      if (!data.success || !data.data.hotspots) {
        return;
      }

      // Clear existing markers
      this.clearAccidentMarkers(mapInstance);

      // Add markers for hotspots
      data.data.hotspots.forEach(hotspot => {
        const { location, statistics } = hotspot;

        if (!location.lat || !location.lng) return;

        const marker = L.circleMarker([location.lat, location.lng], {
          radius: Math.min(statistics.accidentCount / 2, 20),
          fillColor: this.getRiskColor(statistics.avgRiskScore),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.6,
        });

        const popupContent = `
          <div class="accident-popup">
            <h3>${location.municipality} - BR-${location.br}</h3>
            <div class="popup-stats">
              <div><strong>Total de acidentes:</strong> ${statistics.accidentCount}</div>
              <div><strong>Mortes:</strong> ${statistics.totalDeaths}</div>
              <div><strong>Feridos:</strong> ${statistics.totalInjuries}</div>
              <div><strong>Risco médio:</strong> ${statistics.avgRiskScore.toFixed(2)}</div>
              <div><strong>KM:</strong> ${location.kmRange}</div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(mapInstance);
        this.accidentMarkers.push(marker);
      });

      console.log(`Loaded ${this.accidentMarkers.length} hotspot markers`);
    } catch (error) {
      console.error('Error loading hotspots:', error);
    }
  }

  /**
   * Clear accident markers from map
   */
  clearAccidentMarkers(mapInstance) {
    this.accidentMarkers.forEach(marker => {
      mapInstance.removeLayer(marker);
    });
    this.accidentMarkers = [];
  }

  /**
   * Get color based on risk score
   */
  getRiskColor(riskScore) {
    if (riskScore >= 8) return '#dc2626'; // Critical - red
    if (riskScore >= 7) return '#ea580c'; // High - orange-red
    if (riskScore >= 4) return '#f59e0b'; // Medium - orange
    if (riskScore >= 2) return '#eab308'; // Low-medium - yellow
    return '#22c55e'; // Low - green
  }

  /**
   * Load trends data
   */
  async loadTrends() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/accidents/trends?years=3&groupBy=month`);
      const data = await response.json();

      if (data.success && data.data.trends) {
        this.displayTrends(data.data.trends);
      }

      return data;
    } catch (error) {
      console.error('Error loading trends:', error);
      return null;
    }
  }

  /**
   * Display trends chart
   */
  displayTrends(trends) {
    // This would integrate with Chart.js to display trends
    console.log('Trends data:', trends);
    // TODO: Implement chart visualization
  }

  /**
   * Update filters and reload data
   */
  async updateFilters(filters) {
    this.currentFilters = { ...this.currentFilters, ...filters };

    // Reload heatmap with new filters
    const mapInstance = this.app.maps.mainMap;
    if (mapInstance && this.heatmapLayer) {
      await this.loadHeatmap(mapInstance);
    }
  }

  /**
   * Calculate risk for a custom route
   */
  async calculateRouteRisk(coordinates) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/accidents/calculate-route-risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates }),
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      }

      return null;
    } catch (error) {
      console.error('Error calculating route risk:', error);
      return null;
    }
  }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HistoricalDataModule;
}
