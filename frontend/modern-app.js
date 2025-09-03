// Modern App - Sompo Seguros Monitoring System
class SompoApp {
  constructor() {
    this.currentUser = null;
    this.currentSection = 'dashboard';
    this.isDarkMode = false;
    this.charts = {};
    this.maps = {};
    this.demoData = { shipments: [], alerts: [], vehicles: [] };
    this.mapMarkers = {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupThemeToggle();
    this.simulateLoading();
    this.setupNavigation();
  }

  setupEventListeners() {
    // Helper function to close all open nav items
    const closeAllNavItems = () => {
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
    };

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Botão de login (defensivo caso o onsubmit não dispare)
    const loginButton = document.querySelector('.btn-login');
    if (loginButton) {
      loginButton.addEventListener('click', e => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Theme toggles
    const themeToggles = document.querySelectorAll('[id*="theme-toggle"]');
    themeToggles.forEach(toggle => {
      toggle.addEventListener('click', () => this.toggleTheme());
    });

    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigateToSection(section);
        closeAllNavItems();
      });
    });

    // Dropdown toggles
    document.querySelectorAll('.nav-item.has-dropdown > .nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const item = link.parentElement;
        const alreadyOpen = item.classList.contains('open');
        closeAllNavItems();
        if (!alreadyOpen) {
          item.classList.add('open');
        }
      });
    });

    // Dropdown actions
    document.querySelectorAll('.nav-dd-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action') || '';
        if (action.startsWith('goto:')) {
          const target = action.split(':')[1];
          this.navigateToSection(target);
        } else if (action.startsWith('notify:')) {
          const msg = action.substring('notify:'.length);
          this.showNotification(msg.trim(), 'info');
        }
        closeAllNavItems();
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', e => {
      const isInside = e.target.closest && e.target.closest('.nav-item.has-dropdown');
      if (!isInside) {
        closeAllNavItems();
      }
    });

    // Dashboard stat cards quick navigation
    const statCards = document.querySelectorAll('.stat-card[data-target-section]');
    statCards.forEach(card => {
      card.addEventListener('click', () => {
        const target = card.getAttribute('data-target-section');
        if (target) {
          this.navigateToSection(target);
        }
      });
    });
  }

  setupThemeToggle() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('sompo-theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  setupNavigation() {
    // Initialize navigation state
    this.updateNavigationState();
  }

  simulateLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loading-progress');

    if (!loadingScreen || !progressBar) {
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) {
        progress = 100;
      }

      progressBar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loadingScreen.style.opacity = '0';
          setTimeout(() => {
            loadingScreen.style.display = 'none';
            this.showLoginScreen();
          }, 500);
        }, 500);
      }
    }, 100);
  }

  showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    if (loginScreen) {
      loginScreen.classList.add('active');
      this.animateHeroElements();
    }
  }

  animateHeroElements() {
    // Animate hero elements with staggered delays
    const heroElements = document.querySelectorAll(
      '.hero-title .title-line, .hero-subtitle, .hero-features'
    );
    heroElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateX(-50px)';

      setTimeout(() => {
        element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
      }, index * 200);
    });
  }

  async handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
      this.showNotification('Por favor, preencha todos os campos', 'warning');
      return;
    }

    try {
      // Simulate API call
      const response = await this.authenticateUser(username, password);

      if (response.success) {
        this.currentUser = response.data.user;
        this.showNotification('Login realizado com sucesso!', 'success');
        setTimeout(() => {
          this.showDashboard();
        }, 300);
      } else {
        this.showNotification('Credenciais inválidas', 'error');
      }
    } catch (error) {
      this.showNotification('Erro ao fazer login', 'error');
    }
  }

  async authenticateUser(username, password) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock authentication
    const validCredentials = {
      'admin.sompo': 'password123',
      'joao.silva': 'password123',
      'cliente.techcom': 'password123',
    };

    if (validCredentials[username] && validCredentials[username] === password) {
      return {
        success: true,
        data: {
          token: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          user: {
            id: username === 'admin.sompo' ? 1 : username === 'joao.silva' ? 2 : 3,
            username: username,
            role:
              username === 'admin.sompo'
                ? 'admin'
                : username === 'joao.silva'
                  ? 'operator'
                  : 'client',
            full_name:
              username === 'admin.sompo'
                ? 'Administrador Sompo'
                : username === 'joao.silva'
                  ? 'João Silva'
                  : 'Cliente TechCom',
          },
        },
      };
    } else {
      return {
        success: false,
        message: 'Credenciais inválidas',
      };
    }
  }

  showDashboard() {
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');

    if (loginScreen && dashboardScreen) {
      loginScreen.classList.remove('active');
      dashboardScreen.classList.add('active');

      // Update user info
      this.updateUserInfo();

      // Initialize dashboard
      this.initializeDashboard();
    }
  }

  updateUserInfo() {
    if (this.currentUser) {
      const userNameElement = document.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = this.currentUser.full_name;
      }
    }
  }

  initializeDashboard() {
    // Animate stats cards
    this.animateStatsCards();

    // Setup real-time updates
    this.setupRealTimeUpdates();

    // Prepare dataset, charts and mini map
    this.generateDemoDataset();
    this.initializeCharts();
    this.initMiniMap();
  }

  animateStatsCards() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';

      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }

  setupRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
      this.updateRandomStats();
      this.updateChartsWithCurrentStats();
    }, 4000);
  }

  updateRandomStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const currentValue = parseInt(stat.textContent.replace(/[^\d]/g, ''));
      const scale = currentValue > 100000 ? 5000 : currentValue > 1000 ? 50 : 5;
      const variation = Math.floor(Math.random() * scale - scale / 2);
      const newValue = Math.max(0, currentValue + variation);

      if (stat.textContent.includes('%')) {
        stat.textContent = (newValue / 10).toFixed(1) + '%';
      } else if (/\d{1,3}(,\d{3})+/.test(stat.textContent) || currentValue > 999) {
        stat.textContent = newValue.toLocaleString('en-US');
      } else {
        stat.textContent = newValue;
      }
    });
  }

  updateChartsWithCurrentStats() {
    const activeShipments = this.getStatNumber('[data-target-section="shipments"] .stat-number');
    // const criticalAlerts = this.getStatNumber('[data-target-section="alerts"] .stat-number');
    if (this.charts.status) {
      const baseLoading = Math.floor(activeShipments * 0.12);
      const baseStopped = Math.floor(activeShipments * 0.06);
      const inTransit = Math.max(0, activeShipments - baseLoading - baseStopped);
      this.charts.status.data.datasets[0].data = [inTransit, baseLoading, baseStopped];
      this.charts.status.update('none');
    }
    if (this.charts.alerts) {
      const regions = this.charts.alerts.data.labels || ['SP', 'RJ', 'MG'];
      const regData = regions.map(
        (_, i) => Math.floor(3 / regions.length) + (i < 3 % regions.length ? 1 : 0)
      );
      this.charts.alerts.data.datasets[0].data = regData;
      this.charts.alerts.update('none');
    }
  }

  initializeCharts() {
    const chartsAvailable = typeof Chart !== 'undefined';

    // Read coherent numbers from stat cards
    const activeShipments =
      this.getStatNumber('[data-target-section="shipments"] .stat-number') || 24;
    // const criticalAlerts = this.getStatNumber('[data-target-section="alerts"] .stat-number') || 3;

    // Build status distribution that sums to activeShipments
    const baseLoading = Math.floor(activeShipments * 0.12); // 12%
    const baseStopped = Math.floor(activeShipments * 0.06); // 6%
    let inTransit = activeShipments - (baseLoading + baseStopped);
    if (inTransit < 0) {
      inTransit = 0;
    }

    // Status doughnut chart
    const statusCtx = document.getElementById('chart-status');
    if (statusCtx) {
      if (chartsAvailable) {
        if (this.charts.status) {
          this.charts.status.destroy();
        }
        this.charts.status = new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: ['Em trânsito', 'Carregando', 'Parado'],
            datasets: [
              {
                data: [inTransit, baseLoading, baseStopped],
                backgroundColor: ['#3b82f6', '#f59e0b', '#94a3b8'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                },
              },
            },
            cutout: '60%',
          },
        });
      } else {
        // Fallback donut
        const wrapper = document.createElement('div');
        wrapper.className = 'donut-wrap';
        const chart = document.createElement('div');
        chart.className = 'donut-chart';
        const total = Math.max(1, inTransit + baseLoading + baseStopped);
        const deg1 = Math.round((inTransit / total) * 360);
        const deg2 = Math.round((baseLoading / total) * 360);
        // const deg3 = 360 - deg1 - deg2;
        chart.style.background = `conic-gradient(#3b82f6 0 ${deg1}deg, #f59e0b ${deg1}deg ${
          deg1 + deg2
        }deg, #94a3b8 ${deg1 + deg2}deg 360deg)`;
        const legend = document.createElement('div');
        legend.className = 'donut-legend';
        legend.innerHTML = `
                    <div class="item">
                      <span class="swatch" style="background:#3b82f6"></span>
                      Em trânsito (${inTransit})
                    </div>
                    <div class="item">
                      <span class="swatch" style="background:#f59e0b"></span>
                      Carregando (${baseLoading})
                    </div>
                    <div class="item">
                      <span class="swatch" style="background:#94a3b8"></span>
                      Parado (${baseStopped})
                    </div>
                `;
        wrapper.appendChild(chart);
        statusCtx.replaceWith(wrapper);
        const parent = wrapper.parentElement;
        if (parent) {
          parent.appendChild(legend);
        }
      }
    }

    // Alerts bar chart - counts by region based on demo dataset
    const regions = ['SP', 'RJ', 'MG'];
    const regData = this.countAlertsByRegion(regions);
    const alertsCtx = document.getElementById('chart-alerts');
    if (alertsCtx) {
      if (chartsAvailable) {
        if (this.charts.alerts) {
          this.charts.alerts.destroy();
        }
        this.charts.alerts = new Chart(alertsCtx, {
          type: 'bar',
          data: {
            labels: regions,
            datasets: [
              {
                label: 'Críticos',
                data: regData, // now exact dataset counts
                backgroundColor: '#ef4444',
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                ticks: {
                  color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                },
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                },
                grid: { color: 'rgba(148,163,184,0.2)' },
              },
            },
            onClick: (evt, els) => {
              if (!els.length) {
                return;
              }
              const idx = els[0].index;
              const region = regions[idx];
              this.highlightRegionOnMap(region);
              this.renderAlertsDetails(region);
            },
          },
        });
      } else {
        // Fallback bars
        const wrap = document.createElement('div');
        wrap.className = 'bars-chart';
        const max = Math.max(1, ...regData);
        regData.forEach((v, i) => {
          const bar = document.createElement('div');
          bar.className = 'bar';
          bar.style.height = `${Math.round((v / max) * 100)}%`;
          bar.style.background = i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#3b82f6';
          bar.setAttribute('data-label', regions[i]);
          wrap.appendChild(bar);
        });
        alertsCtx.replaceWith(wrap);
      }
    }
    // Click handler for status chart
    if (this.charts.status) {
      this.charts.status.options.onClick = (evt, els) => {
        if (!els.length) {
          return;
        }
        const idx = els[0].index; // 0=inTransit,1=loading,2=stopped
        const key = idx === 0 ? 'in_transit' : idx === 1 ? 'loading' : 'stopped';
        this.highlightShipmentsOnMap(key);
        this.renderStatusDetails(key);
      };
    }
  }

  getStatNumber(selector) {
    const el = document.querySelector(selector);
    if (!el) {
      return 0;
    }
    const text = (el.textContent || '').replace(/[^0-9]/g, '');
    return parseInt(text || '0', 10);
  }

  initMiniMap() {
    if (this.maps.mini) {
      return;
    } // already created

    const container = document.getElementById('map-mini');
    if (!container) {
      return;
    }
    if (typeof L === 'undefined') {
      // Fallback: fake map area with markers
      const fake = document.createElement('div');
      fake.className = 'fake-map';
      container.appendChild(fake);
      this.placeFakeMarkers(fake);
      return;
    }
    this.maps.mini = this.createMap('map-mini', { zoom: 5 });
    this.addDemoMarkers(this.maps.mini, true);
  }

  initFullMap() {
    if (this.maps.full) {
      return;
    } // already created
    const container = document.getElementById('map-full');
    if (!container) {
      return;
    }
    if (typeof L === 'undefined') {
      const fake = document.createElement('div');
      fake.className = 'fake-map';
      container.appendChild(fake);
      this.placeFakeMarkers(fake);
      return;
    }
    this.maps.full = this.createMap('map-full', { zoom: 4 });
    this.drawFullMapLayers();
    // Limpar seleção ao clicar no mapa
    this.maps.full.on('click', () => this.clearRouteAndUnfilter());
    // Heatmap de risco (SP)
    this.addRiskHeatLayer();
    // Zonas de risco (polígonos GeoJSON)
    this.addRiskAreasLayer();
  }

  async addRiskHeatLayer() {
    if (!this.maps.full || typeof L === 'undefined' || typeof L.heatLayer === 'undefined') {
      return;
    }
    try {
      const resp = await fetch('data/sp_risk_points.json');
      const json = await resp.json();
      const points = (json.points || []).map(p => [p.lat, p.lng, p.intensity || 0.6]);
      // fallback amostra
      const fallback = [
        [-23.5614, -46.6554, 0.6], // Av. Paulista
        [-23.5716, -46.6916, 0.7], // Faria Lima
        [-23.516, -46.624, 0.5], // Marginal Tietê
      ];
      const heat = L.heatLayer(points.length ? points : fallback, {
        radius: 18,
        blur: 20,
        maxZoom: 17,
        minOpacity: 0.35,
      });
      heat.addTo(this.maps.full);
      // Guardar referência para controle futuro
      this.mapLayers = this.mapLayers || {};
      this.mapLayers.riskHeat = heat;
      // Adicionar controle simples de toggle
      this.addHeatmapToggleControl();
      this.addRiskLegendControl();
    } catch (_) {
      // ignore
    }
  }

  async addRiskAreasLayer() {
    if (!this.maps.full || typeof L === 'undefined') {
      return;
    }
    try {
      const resp = await fetch('data/sp_risk_areas.geojson');
      const geojson = await resp.json();
      const style = feature => {
        const level = (feature.properties && feature.properties.level) || 'medium';
        const color = level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981';
        return { color, weight: 2, fillColor: color, fillOpacity: 0.18 };
      };
      const layer = L.geoJSON(geojson, {
        style,
        onEachFeature: (f, l) => {
          const name =
            (f.properties && (f.properties.name || f.properties.level)) || 'Zona de risco';
          l.bindPopup(`<b>${name}</b>`);
        },
      });
      layer.addTo(this.maps.full);
      this.mapLayers = this.mapLayers || {};
      this.mapLayers.riskAreas = layer;
      this.addRiskAreasToggleControl();
      this.addRiskLegendControl();
    } catch (_) {
      // ignore
    }
  }

  addHeatmapToggleControl() {
    if (!this.maps.full) {
      return;
    }
    const control = L.control({ position: 'topright' });
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar');
      const a = L.DomUtil.create('a', '', div);
      a.href = '#';
      a.title = 'Alternar mapa de risco (SP)';
      a.innerHTML = 'R';
      L.DomEvent.on(a, 'click', e => {
        L.DomEvent.stop(e);
        const heat = this.mapLayers && this.mapLayers.riskHeat;
        if (!heat) {
          return;
        }
        if (this.maps.full.hasLayer(heat)) {
          this.maps.full.removeLayer(heat);
        } else {
          heat.addTo(this.maps.full);
        }
      });
      return div;
    };
    control.addTo(this.maps.full);
  }

  addRiskAreasToggleControl() {
    if (!this.maps.full) {
      return;
    }
    const control = L.control({ position: 'topright' });
    control.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar');
      const a = L.DomUtil.create('a', '', div);
      a.href = '#';
      a.title = 'Alternar zonas de risco (polígonos)';
      a.innerHTML = 'Z';
      L.DomEvent.on(a, 'click', e => {
        L.DomEvent.stop(e);
        const areas = this.mapLayers && this.mapLayers.riskAreas;
        if (!areas) {
          return;
        }
        if (this.maps.full.hasLayer(areas)) {
          this.maps.full.removeLayer(areas);
        } else {
          areas.addTo(this.maps.full);
        }
      });
      return div;
    };
    control.addTo(this.maps.full);
  }

  addRiskLegendControl() {
    if (this._riskLegendAdded || !this.maps.full) {
      return;
    }
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'glass-card');
      div.style.padding = '8px 10px';
      div.style.fontSize = '12px';
      const spanStyle = 'display:inline-block;width:12px;height:12px;border-radius:2px';
      div.innerHTML = `
                <div style="font-weight:600;margin-bottom:6px">Zonas de risco</div>
                <div style="display:flex;gap:8px;align-items:center">
                  <span style="${spanStyle};background:#ef4444;opacity:.7"></span> 
                  Alto
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <span style="${spanStyle};background:#f59e0b;opacity:.7"></span> 
                  Médio
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                  <span style="${spanStyle};background:#10b981;opacity:.7"></span> 
                  Baixo
                </div>
            `;
      return div;
    };
    legend.addTo(this.maps.full);
    this._riskLegendAdded = true;
  }

  createMap(elementId, { zoom = 4 } = {}) {
    const center = (window.CONFIG && window.CONFIG.MAP && window.CONFIG.MAP.DEFAULT_CENTER) || [
      -14.235, -51.9253,
    ];
    const map = L.map(elementId, { zoomControl: true }).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map);
    return map;
  }

  addDemoMarkers(map, fitBounds) {
    const mapId = map._container && map._container.id ? map._container.id : 'unknown';
    const markers = this.demoData.shipments.map(s => {
      const color =
        s.status === 'stopped' ? '#ef4444' : s.status === 'loading' ? '#f59e0b' : '#3b82f6';
      const m = L.circleMarker([s.lat, s.lng], {
        radius: 3,
        color,
        fillColor: color,
        fillOpacity: 0.85,
      }).addTo(map);
      m.meta = { status: s.status, region: s.region, address: s.address, city: s.cityUF };
      m.bindPopup(`<b>${s.shipmentNumber}</b><br/>${s.address}<br/><small>${s.status}</small>`);
      return m;
    });
    this.mapMarkers[mapId] = markers;
    if (fitBounds && markers.length) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  // Demo dataset with detailed addresses
  generateDemoDataset() {
    const cities = [
      {
        cityUF: 'São Paulo, SP',
        region: 'SP',
        base: [-23.5505, -46.6333],
        anchors: [
          { name: 'Av. Paulista', lat: -23.5614, lng: -46.6554 },
          { name: 'Av. Faria Lima', lat: -23.5716, lng: -46.6916 },
          { name: 'Rua Oscar Freire', lat: -23.561, lng: -46.667 },
          { name: 'Av. Rebouças', lat: -23.567, lng: -46.678 },
          { name: 'Marginal Tietê', lat: -23.516, lng: -46.624 },
        ],
      },
      {
        cityUF: 'Rio de Janeiro, RJ',
        region: 'RJ',
        base: [-22.9068, -43.1729],
        anchors: [
          { name: 'Rua Barata Ribeiro', lat: -22.9694, lng: -43.1869 },
          { name: 'Av. Brasil', lat: -22.8746, lng: -43.2465 },
          { name: 'Rua Visconde de Pirajá', lat: -22.984, lng: -43.205 },
          { name: 'Av. das Américas', lat: -23.0006, lng: -43.365 },
          { name: 'Centro (Av. Rio Branco)', lat: -22.9035, lng: -43.1769 },
        ],
      },
      {
        cityUF: 'Belo Horizonte, MG',
        region: 'MG',
        base: [-19.9167, -43.9345],
        anchors: [
          { name: 'Av. Afonso Pena', lat: -19.9256, lng: -43.9378 },
          { name: 'Av. Amazonas', lat: -19.919, lng: -43.956 },
          { name: 'Rua da Bahia', lat: -19.9251, lng: -43.9362 },
          { name: 'Av. Cristiano Machado', lat: -19.8678, lng: -43.9276 },
          { name: 'Av. do Contorno', lat: -19.934, lng: -43.933 },
        ],
      },
    ];

    const shipments = [];
    const alerts = [];
    const vehicles = [];
    let shipmentId = 1;
    // Generate a realistic fleet with regional distribution
    // SP: maior centro logístico (mais cargas/veículos)
    // RJ/MG: centros menores (menos cargas/veículos)
    const fleetDistribution = {
      SP: { vehicles: 35, shipments: 80 }, // São Paulo: 35 veículos, 80 cargas
      RJ: { vehicles: 25, shipments: 45 }, // Rio: 25 veículos, 45 cargas
      MG: { vehicles: 20, shipments: 35 }, // BH: 20 veículos, 35 cargas
    };
    // Total: 80 veículos, 160 cargas (mais realista)

    cities.forEach((c, _cIdx) => {
      const fleet = fleetDistribution[c.region];

      // Jitter por região (RJ menor para evitar mar)
      const jitter = c.region === 'RJ' ? { lat: 0.0012, lng: 0.0012 } : { lat: 0.002, lng: 0.0024 };

      // Vehicles for this city (ancorados em vias reais)
      for (let v = 0; v < fleet.vehicles; v++) {
        const plate = `SOM-${c.region}-${String(v + 1).padStart(3, '0')}`;
        const anchor = c.anchors[Math.floor(Math.random() * c.anchors.length)];
        const lat = anchor.lat + (Math.random() - 0.5) * 2 * jitter.lat;
        const lng = anchor.lng + (Math.random() - 0.5) * 2 * jitter.lng;
        vehicles.push({ plate, cityUF: c.cityUF, region: c.region, lat, lng });
      }

      for (let i = 0; i < fleet.shipments; i++) {
        const status = i % 10 === 0 ? 'stopped' : i % 6 === 0 ? 'loading' : 'in_transit';
        const anchor = c.anchors[Math.floor(Math.random() * c.anchors.length)];
        const num = 100 + (i % 300);
        const lat = anchor.lat + (Math.random() - 0.5) * 2 * jitter.lat;
        const lng = anchor.lng + (Math.random() - 0.5) * 2 * jitter.lng;

        // Define origem e destino simulados (também em terra firme)
        const originAnchor = c.anchors[Math.floor(Math.random() * c.anchors.length)];
        const destCity = cities[(Math.floor(Math.random() * cities.length) + 1) % cities.length];
        const destAnchor = destCity.anchors[Math.floor(Math.random() * destCity.anchors.length)];
        const originLat = originAnchor.lat + (Math.random() - 0.5) * jitter.lat;
        const originLng = originAnchor.lng + (Math.random() - 0.5) * jitter.lng;
        const destLat =
          destAnchor.lat + (Math.random() - 0.5) * (destCity.region === 'RJ' ? 0.0012 : 0.002);
        const destLng =
          destAnchor.lng + (Math.random() - 0.5) * (destCity.region === 'RJ' ? 0.0012 : 0.0024);
        const route = this.generateRoute(originLat, originLng, destLat, destLng, 14);
        shipments.push({
          id: shipmentId,
          shipmentNumber: `${c.region}-${String(shipmentId).padStart(5, '0')}`,
          cityUF: c.cityUF,
          region: c.region,
          status,
          address: `${anchor.name}, ${num} - ${c.cityUF}`,
          lat,
          lng,
          originLat,
          originLng,
          destLat,
          destLng,
          route,
        });
        // Alertas coerentes: parte das cargas gera alerta
        if (Math.random() < 0.12) {
          const types = ['Roubo', 'Acidente', 'Desvio de rota'];
          alerts.push({
            id: shipmentId * 100 + i,
            region: c.region,
            type: types[i % types.length],
            address: `${anchor.name}, ${num} - ${c.cityUF}`,
            lat,
            lng,
          });
        }
        shipmentId++;
      }
    });
    this.demoData.shipments = shipments;
    this.demoData.alerts = alerts;
    this.demoData.vehicles = vehicles;
  }

  generateRoute(lat1, lng1, lat2, lng2, points = 12) {
    const route = [];
    for (let i = 0; i <= points; i++) {
      const t = i / points;
      const lat = lat1 + (lat2 - lat1) * t + (Math.random() - 0.5) * 0.01; // leve ruído
      const lng = lng1 + (lng2 - lng1) * t + (Math.random() - 0.5) * 0.01;
      route.push([lat, lng]);
    }
    return route;
  }

  drawFullMapLayers() {
    if (!this.maps.full || typeof L === 'undefined') {
      return;
    }
    // Clear previous group
    if (!this.mapLayers) {
      this.mapLayers = {};
    }
    if (this.mapLayers.fullGroup) {
      this.mapLayers.fullGroup.clearLayers();
    } else {
      this.mapLayers.fullGroup = L.layerGroup().addTo(this.maps.full);
    }

    const group = this.mapLayers.fullGroup;
    const colorForStatus = s =>
      s === 'in_transit' ? '#3b82f6' : s === 'loading' ? '#f59e0b' : '#94a3b8';

    // Draw ONLY shipment markers (routes serão exibidas ao clicar)
    const markers = [];
    this.demoData.shipments.forEach(s => {
      const marker = L.circleMarker([s.lat, s.lng], {
        radius: 4,
        color: colorForStatus(s.status),
        fillColor: colorForStatus(s.status),
        fillOpacity: 0.9,
      }).addTo(group);
      marker.bindPopup(
        `<b>${s.shipmentNumber}</b><br/>${s.address}<br/><small>${s.status}</small>`
      );
      marker.shipment = s;
      marker.on('click', e => {
        L.DomEvent.stopPropagation(e);
        this.showShipmentRoute(s, marker);
      });
      markers.push(marker);
    });
    this.mapMarkers['map-full'] = markers;

    // Draw alerts
    this.demoData.alerts.forEach(a => {
      L.circleMarker([a.lat, a.lng], {
        radius: 5,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.9,
      })
        .bindPopup(`<b>${a.type}</b><br/>${a.address}`)
        .addTo(group);
    });

    // Fit bounds to markers
    try {
      const bounds = group.getBounds();
      if (bounds && bounds.isValid()) {
        this.maps.full.fitBounds(bounds.pad(0.2));
      }
    } catch (_) {
      // ignore
    }
  }

  async getRoadRoute(origin, dest, via) {
    // origin/dest: [lat, lng]; via (optional): [lat, lng]
    const coords = [origin, ...(via ? [via] : []), dest]
      .map(p => `${p[1]},${p[0]}`) // lon,lat
      .join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false&exclude=ferry`;
    try {
      const res = await fetch(url, { mode: 'cors' });
      const data = await res.json();
      const route =
        (data &&
          data.routes &&
          data.routes[0] &&
          data.routes[0].geometry &&
          data.routes[0].geometry.coordinates) ||
        [];
      // Convert [lng,lat] -> [lat,lng]
      return route.map(([lng, lat]) => [lat, lng]);
    } catch (_) {
      return [];
    }
  }

  getRiskPolygons() {
    // Returns array of polygons ([[[lng,lat],...]] in GeoJSON order)
    if (!this._riskPolygons && this.mapLayers && this.mapLayers.riskAreas) {
      const polys = [];
      try {
        this.mapLayers.riskAreas.eachLayer(layer => {
          if (
            layer.feature &&
            layer.feature.geometry &&
            layer.feature.geometry.type === 'Polygon'
          ) {
            polys.push(layer.feature.geometry.coordinates[0]);
          }
        });
      } catch (_) {
        // ignore
      }
      this._riskPolygons = polys;
    }
    return this._riskPolygons || [];
  }

  pointInPolygon(lat, lng, polygon) {
    // polygon: array of [lng,lat]
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0],
        yi = polygon[i][1];
      const xj = polygon[j][0],
        yj = polygon[j][1];
      const intersect =
        yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  splitRouteByRisk(route) {
    const polys = this.getRiskPolygons();
    if (!polys.length) {
      return { safe: [route], risky: [] };
    }
    const safeSegments = [];
    const riskySegments = [];
    let current = [];
    let currentRisky = false;
    const flush = () => {
      if (current.length < 2) {
        current = [];
        return;
      }
      (currentRisky ? riskySegments : safeSegments).push(current);
      current = [];
    };
    for (let i = 0; i < route.length; i++) {
      const [lat, lng] = route[i];
      const inRisk = polys.some(poly => this.pointInPolygon(lat, lng, poly));
      if (i === 0) {
        currentRisky = inRisk;
        current.push(route[i]);
      } else {
        if (inRisk === currentRisky) {
          current.push(route[i]);
        } else {
          flush();
          currentRisky = inRisk;
          current.push(route[i]);
        }
      }
    }
    flush();
    return { safe: safeSegments, risky: riskySegments };
  }

  async buildRiskAwareRoute(origin, dest) {
    // 1) get road route
    let route = await this.getRoadRoute(origin, dest);
    if (!route.length) {
      // fallback to straight line
      route = [origin, dest];
    }
    // 2) split by risk for coloring (and optionally try a simple detour)
    const split = this.splitRouteByRisk(route);
    if (split.risky.length) {
      // naive detour attempt around first risky polygon bbox corner
      const polys = this.getRiskPolygons();
      if (polys.length) {
        const poly = polys[0];
        let minLng = Infinity,
          minLat = Infinity,
          maxLng = -Infinity,
          maxLat = -Infinity;
        poly.forEach(([lng, lat]) => {
          minLng = Math.min(minLng, lng);
          minLat = Math.min(minLat, lat);
          maxLng = Math.max(maxLng, lng);
          maxLat = Math.max(maxLat, lat);
        });
        const waypoint = [minLat - 0.01, minLng - 0.01];
        const detour = await this.getRoadRoute(origin, dest, waypoint);
        if (detour.length) {
          const splitDetour = this.splitRouteByRisk(detour);
          if (splitDetour.risky.length < split.risky.length) {
            return { route: detour, split: splitDetour };
          }
        }
      }
    }
    return { route, split };
  }

  drawRouteWithRiskSplit(split, statusColor) {
    // Remove previous group
    if (this.mapLayers && this.mapLayers.activeRouteGroup) {
      try {
        this.maps.full.removeLayer(this.mapLayers.activeRouteGroup);
      } catch (_) {
        // ignore
      }
      this.mapLayers.activeRouteGroup = null;
    }
    const group = L.layerGroup().addTo(this.maps.full);
    // safe segments
    split.safe.forEach(seg => {
      L.polyline(seg, { color: statusColor, weight: 3.5, opacity: 0.95, dashArray: '8 8' }).addTo(
        group
      );
    });
    // risky segments
    split.risky.forEach(seg => {
      L.polyline(seg, { color: '#ef4444', weight: 4, opacity: 0.9, dashArray: '4 6' }).addTo(group);
    });
    this.mapLayers.activeRouteGroup = group;
    return group;
  }

  async showShipmentRoute(shipment, markerRef) {
    if (!this.maps.full || typeof L === 'undefined' || !shipment) {
      return;
    }
    this.stopAnimatedMarker();
    if (!this.mapLayers) {
      this.mapLayers = {};
    }
    if (this.mapLayers.activeRoute) {
      try {
        this.maps.full.removeLayer(this.mapLayers.activeRoute);
      } catch (_) {
        // ignore
      }
      this.mapLayers.activeRoute = null;
    }
    if (this.mapLayers.activeRouteGroup) {
      try {
        this.maps.full.removeLayer(this.mapLayers.activeRouteGroup);
      } catch (_) {
        // ignore
      }
      this.mapLayers.activeRouteGroup = null;
    }
    this.applyMarkerFilter(markerRef);
    const colorForStatus = s =>
      s === 'in_transit' ? '#3b82f6' : s === 'loading' ? '#f59e0b' : '#94a3b8';
    const origin = [shipment.originLat, shipment.originLng];
    const dest = [shipment.destLat, shipment.destLng];
    const { route, split } = await this.buildRiskAwareRoute(origin, dest);
    const group = this.drawRouteWithRiskSplit(split, colorForStatus(shipment.status));
    try {
      const b = group.getBounds();
      if (b && b.isValid()) {
        const current = this.maps.full.getBounds();
        if (!current.contains(b.pad(-0.2))) {
          this.maps.full.fitBounds(b.pad(0.15));
        }
      }
    } catch (_) {
      // ignore
    }
    if (markerRef) {
      try {
        markerRef.openPopup();
      } catch (_) {
        // ignore
      }
    }
    const speedKmH = this.pickRealisticSpeed({ route });
    this.startAnimatedMarker(route, speedKmH, colorForStatus(shipment.status));
  }

  applyMarkerFilter(selectedMarker) {
    const list = this.mapMarkers && this.mapMarkers['map-full'] ? this.mapMarkers['map-full'] : [];
    list.forEach(m => {
      if (selectedMarker && m === selectedMarker) {
        m.setStyle({ opacity: 1, fillOpacity: 1, radius: 6 });
        try {
          m.bringToFront && m.bringToFront();
        } catch (_) {
          // ignore
        }
      } else {
        m.setStyle({ opacity: 0.2, fillOpacity: 0.2, radius: 3 });
      }
    });
    this._selectedMarker = selectedMarker || null;
  }

  clearRouteAndUnfilter() {
    // remove rota e animação
    this.stopAnimatedMarker();
    if (this.mapLayers && this.mapLayers.activeRoute) {
      try {
        this.maps.full.removeLayer(this.mapLayers.activeRoute);
      } catch (_) {
        // ignore
      }
      this.mapLayers.activeRoute = null;
    }
    if (this.mapLayers && this.mapLayers.activeRouteGroup) {
      try {
        this.maps.full.removeLayer(this.mapLayers.activeRouteGroup);
      } catch (_) {
        // ignore
      }
      this.mapLayers.activeRouteGroup = null;
    }
    // restaurar marcadores
    const list = this.mapMarkers && this.mapMarkers['map-full'] ? this.mapMarkers['map-full'] : [];
    list.forEach(m => {
      m.setStyle({ opacity: 1, fillOpacity: 0.9, radius: 4 });
    });
    this._selectedMarker = null;
    this.updateMapShipmentsPanel();
  }

  // Painel de cargas na viewport do mapa
  updateMapShipmentsPanel() {
    const panel = document.getElementById('map-shipments-panel');
    if (!panel || !this.maps.full) {
      return;
    }
    const bounds = this.maps.full.getBounds();
    const items = this.demoData.shipments.filter(s => bounds.contains(L.latLng(s.lat, s.lng)));
    const top = items.slice(0, 12);
    const selectedId =
      this._selectedMarker && this._selectedMarker.shipment
        ? this._selectedMarker.shipment.id
        : null;
    panel.innerHTML = top
      .map(
        s => `
            <div class="data-item" style="padding:.5rem .75rem;${
              selectedId === s.id ? 'outline:2px solid var(--primary-color);' : ''
            }">
                <div>
                    <div class="title">
                      ${s.shipmentNumber} 
                      <span class="badge-status ${s.status}">${s.status.replace('_', ' ')}</span>
                    </div>
                    <div class="meta">${s.cityUF} — ${s.address}</div>
                </div>
                <div style="display:flex;gap:.5rem;align-items:center">
                    <button class="btn-icon" data-focus="${s.id}" title="Focar">
                      <i class="fas fa-crosshairs"></i>
                    </button>
                    <button class="btn-icon" data-route="${s.id}" title="Exibir rota">
                      <i class="fas fa-route"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join('');
    // Actions
    panel.querySelectorAll('[data-focus]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-focus'));
        const s = this.demoData.shipments.find(x => x.id === id);
        if (!s) {
          return;
        }
        this.maps.full.setView([s.lat, s.lng], Math.max(12, this.maps.full.getZoom()));
      });
    });
    panel.querySelectorAll('[data-route]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.preventDefault();
        const id = parseInt(btn.getAttribute('data-route'));
        const s = this.demoData.shipments.find(x => x.id === id);
        if (!s) {
          this.showNotification('Carga não encontrada', 'warning');
          return;
        }
        const marker = (this.mapMarkers['map-full'] || []).find(
          m => m.shipment && m.shipment.id === s.id
        );
        try {
          await this.showShipmentRoute(s, marker);
        } catch (err) {
          this.showNotification('Falha ao traçar rota. Verifique sua conexão.', 'error');
        }
      });
    });
  }

  pickRealisticSpeed(shipment) {
    // Escolha simples: rotas intermunicipais mais longas => mais rápidas
    const km = this.computeRouteLengthKm(shipment && shipment.route ? shipment.route : []);
    if (km > 200) {
      return 80;
    } // rodovia
    if (km > 50) {
      return 60;
    } // mista
    return 35; // urbana
  }

  computeRouteLengthKm(route) {
    if (!route || route.length < 2 || typeof L === 'undefined') {
      return 0;
    }
    let m = 0;
    for (let i = 1; i < route.length; i++) {
      const a = L.latLng(route[i - 1][0], route[i - 1][1]);
      const b = L.latLng(route[i][0], route[i][1]);
      m += a.distanceTo(b);
    }
    return m / 1000;
  }

  startAnimatedMarker(route, speedKmH, color = '#3b82f6') {
    if (!this.maps.full || typeof L === 'undefined' || !route || route.length < 2) {
      return;
    }
    const speedMs = (speedKmH * 1000) / 3600;
    // Precompute segment lengths and cumulative
    const pts = route.map(p => L.latLng(p[0], p[1]));
    const segLen = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = pts[i - 1].distanceTo(pts[i]);
      segLen.push(d);
      total += d;
    }
    const cum = [0];
    for (let i = 0; i < segLen.length; i++) {
      cum.push(cum[i] + segLen[i]);
    }
    // const duration = total / speedMs; // seconds

    // Create moving marker
    const moving = L.circleMarker(pts[0], {
      radius: 6,
      color,
      fillColor: color,
      fillOpacity: 1,
    }).addTo(this.maps.full);
    this.mapLayers.movingMarker = moving;

    const start = performance.now();
    const animate = now => {
      const t = (now - start) / 1000; // seconds
      const dist = Math.min(total, t * speedMs);
      // find segment index
      let idx = 0;
      while (idx < cum.length - 1 && dist > cum[idx + 1]) {
        idx++;
      }
      const segStart = cum[idx];
      const segEnd = cum[idx + 1];
      const segFrac = segEnd > segStart ? (dist - segStart) / (segEnd - segStart) : 1;
      const a = pts[idx];
      const b = pts[idx + 1] || pts[idx];
      const lat = a.lat + (b.lat - a.lat) * segFrac;
      const lng = a.lng + (b.lng - a.lng) * segFrac;
      moving.setLatLng([lat, lng]);
      if (dist < total) {
        this._animFrame = requestAnimationFrame(animate);
      }
    };
    this._animFrame = requestAnimationFrame(animate);
  }

  stopAnimatedMarker() {
    if (this._animFrame) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
    if (this.mapLayers && this.mapLayers.movingMarker) {
      try {
        this.maps.full.removeLayer(this.mapLayers.movingMarker);
      } catch (_) {
        // ignore
      }
      this.mapLayers.movingMarker = null;
    }
  }

  countAlertsByRegion(regions) {
    return regions.map(r => this.demoData.alerts.filter(a => a.region === r).length || 0);
  }

  highlightRegionOnMap(region) {
    const map = this.maps.mini;
    const markers = this.mapMarkers['map-mini'] || [];
    const selected = markers.filter(m => m.meta && m.meta.region === region);
    const others = markers.filter(m => !m.meta || m.meta.region !== region);
    selected.forEach(m => m.setStyle({ radius: 6, opacity: 1, fillOpacity: 1 }));
    others.forEach(m => m.setStyle({ radius: 2, opacity: 0.3, fillOpacity: 0.3 }));
    if (selected.length) {
      const group = new L.featureGroup(selected);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  highlightShipmentsOnMap(statusKey) {
    const map = this.maps.mini;
    const markers = this.mapMarkers['map-mini'] || [];
    const selected = markers.filter(m => m.meta && m.meta.status === statusKey);
    const others = markers.filter(m => !m.meta || m.meta.status !== statusKey);
    selected.forEach(m => m.setStyle({ radius: 6, opacity: 1, fillOpacity: 1 }));
    others.forEach(m => m.setStyle({ radius: 2, opacity: 0.3, fillOpacity: 0.3 }));
    if (selected.length) {
      const group = new L.featureGroup(selected);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }

  renderAlertsDetails(region) {
    const el = document.getElementById('alerts-details');
    if (!el) {
      return;
    }
    const items = this.demoData.alerts.filter(a => a.region === region);
    const countsByType = items.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});
    const badges = Object.entries(countsByType)
      .map(([t, n]) => `<span class="badge">${t}: ${n}</span>`)
      .join('');
    const list = items
      .slice(0, 12)
      .map(a => `<div>• ${a.type} — ${a.address}</div>`)
      .join('');
    el.innerHTML = `<div style="margin-bottom:.5rem">${badges}</div>${list || '<em>Nenhum alerta encontrado</em>'}`;
  }

  renderStatusDetails(statusKey) {
    const el = document.getElementById('status-details');
    if (!el) {
      return;
    }
    const mapStatus = { in_transit: 'Em trânsito', loading: 'Carregando', stopped: 'Parado' };
    const items = this.demoData.shipments.filter(s => s.status === statusKey).slice(0, 6);
    const list = items.map(s => `<div>• ${s.shipmentNumber} — ${s.address}</div>`).join('');
    el.innerHTML = `<div class="badge">${mapStatus[statusKey] || statusKey}</div>${list || '<em>Sem itens</em>'}`;
  }

  placeFakeMarkers(container) {
    // Many fake markers for fallback
    for (let i = 0; i < 120; i++) {
      const m = document.createElement('div');
      m.className = 'marker';
      const x = 10 + Math.random() * 80; // 10%-90%
      const y = 10 + Math.random() * 70; // 10%-80%
      m.style.left = `calc(${x}% - 5px)`;
      m.style.top = `calc(${y}% - 5px)`;
      container.appendChild(m);
    }
  }

  navigateToSection(section) {
    if (section === this.currentSection) {
      return;
    }

    // Update navigation state
    this.currentSection = section;
    this.updateNavigationState();

    // Show section content
    this.showSection(section);

    // Scroll to top for clarity
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  }

  updateNavigationState() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === this.currentSection) {
        link.classList.add('active');
      }
    });
  }

  showSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));

    // Show target section
    const targetSection = document.getElementById(section + '-section');
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update section content based on section
    this.updateSectionContent(section);
  }

  updateSectionContent(section) {
    switch (section) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'shipments':
        this.loadShipmentsData();
        break;
      case 'vehicles':
        this.loadVehiclesData();
        break;
      case 'alerts':
        this.loadAlertsData();
        break;
      case 'map':
        this.loadMapData();
        break;
    }
  }

  loadDashboardData() {
    // Dashboard data is already loaded
    // Dashboard data loaded
  }

  loadShipmentsData() {
    const list = document.getElementById('shipments-list');
    if (!list) {
      return;
    }
    const items = this.demoData.shipments.slice(0, 30);
    list.innerHTML = items
      .map(
        s => `
            <div class="data-item">
                <div>
                    <div class="title">
                      ${s.shipmentNumber} 
                      <span class="badge-status ${s.status}">${s.status.replace('_', ' ')}</span>
                    </div>
                    <div class="subtitle">${s.address}</div>
                    <div class="meta">${s.cityUF}</div>
                </div>
                <div>
                    <button class="btn-icon" data-focus-lat="${s.lat}" data-focus-lng="${s.lng}">
                      <i class="fas fa-location-arrow"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join('');
    list.querySelectorAll('[data-focus-lat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.getAttribute('data-focus-lat'));
        const lng = parseFloat(btn.getAttribute('data-focus-lng'));
        if (this.maps.mini) {
          this.maps.mini.setView([lat, lng], 13);
        }
      });
    });
  }

  loadVehiclesData() {
    const list = document.getElementById('vehicles-list');
    if (!list) {
      return;
    }
    const vehicles = {};
    // base vehicles from dataset
    this.demoData.vehicles.forEach(v => {
      vehicles[v.plate] = { plate: v.plate, lastCity: v.cityUF, status: 'in_transit', count: 0 };
    });
    // attach shipments to vehicles deterministically
    this.demoData.shipments.forEach(s => {
      const vIdx = s.id % Math.max(1, this.demoData.vehicles.length);
      const plate = this.demoData.vehicles[vIdx].plate;
      if (!vehicles[plate]) {
        vehicles[plate] = { plate, lastCity: s.cityUF, status: s.status, count: 0 };
      }
      vehicles[plate].count += 1;
      vehicles[plate].status = s.status;
      vehicles[plate].lastCity = s.cityUF;
    });
    const arr = Object.values(vehicles).slice(0, 60);
    list.innerHTML = arr
      .map(
        v => `
            <div class="data-item">
                <div>
                    <div class="title">
                      Placa ${v.plate} 
                      <span class="badge-status ${v.status}">${v.status.replace('_', ' ')}</span>
                    </div>
                    <div class="subtitle">${v.lastCity}</div>
                    <div class="meta">Cargas vinculadas: ${v.count}</div>
                </div>
            </div>
        `
      )
      .join('');
  }

  loadAlertsData() {
    const list = document.getElementById('alerts-list');
    if (!list) {
      return;
    }
    const items = this.demoData.alerts.slice(0, 30);
    list.innerHTML = items
      .map(
        a => `
            <div class="data-item">
                <div>
                    <div class="title"><span class="badge">${a.type}</span> ${a.address}</div>
                    <div class="meta">Região ${a.region}</div>
                </div>
                <div>
                    <button class="btn-icon" data-focus-lat="${a.lat}" data-focus-lng="${a.lng}">
                      <i class="fas fa-location-arrow"></i>
                    </button>
                </div>
            </div>
        `
      )
      .join('');
    list.querySelectorAll('[data-focus-lat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const lat = parseFloat(btn.getAttribute('data-focus-lat'));
        const lng = parseFloat(btn.getAttribute('data-focus-lng'));
        if (this.maps.mini) {
          this.maps.mini.setView([lat, lng], 14);
        }
      });
    });
  }

  // Após montar camadas do mapa completo, atualizar painel quando mover/zoom
  loadMapData() {
    // Initialize full map on Map tab
    this.initFullMap();
    if (this.maps.full) {
      this.maps.full.on('moveend zoomend', () => this.updateMapShipmentsPanel());
      // primeira renderização
      setTimeout(() => this.updateMapShipmentsPanel(), 0);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();

    // Save preference
    localStorage.setItem('sompo-theme', this.isDarkMode ? 'dark' : 'light');
  }

  applyTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-toggle-btn i');

    if (this.isDarkMode) {
      body.setAttribute('data-theme', 'dark');
      if (themeIcon) {
        themeIcon.className = 'fas fa-sun';
      }
    } else {
      body.removeAttribute('data-theme');
      if (themeIcon) {
        themeIcon.className = 'fas fa-moon';
      }
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);

    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.hideNotification(notification);
    });
  }

  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle',
    };
    return icons[type] || 'info-circle';
  }

  // Utility methods
}

// Notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-background);
        backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        padding: 1rem 1.5rem;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        transform: translateX(400px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--text-primary);
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .notification-success .notification-content i { color: var(--success-color); }
    .notification-error .notification-content i { color: var(--danger-color); }
    .notification-warning .notification-content i { color: var(--warning-color); }
    .notification-info .notification-content i { color: var(--primary-color); }
    
    .notification-close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: var(--transition);
    }
    
    .notification-close:hover {
        background: rgba(0, 0, 0, 0.05);
        color: var(--text-primary);
    }
`;

// Add notification styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // SompoApp initialized
  const app = new SompoApp();
  window.sompoApp = app;
  // Compatibilidade com o onclick="if(window.authManager) ..."
  window.authManager = {
    handleLogin: () => app.handleLogin(),
  };
  // Preencher inputs ao clicar nas credenciais demo
  document.querySelectorAll('.demo-cred').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const u = el.getAttribute('data-username');
      const p = el.getAttribute('data-password');
      const userInput = document.getElementById('username');
      const passInput = document.getElementById('password');
      if (userInput && passInput && u && p) {
        userInput.value = u;
        passInput.value = p;
      }
    });
  });
});

// Export for global access
window.SompoApp = SompoApp;
