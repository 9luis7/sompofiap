// Modern App - Sompo Seguros Monitoring System
class SompoApp {
  constructor() {
    this.currentUser = null;
    this.currentSection = 'dashboard';
    this.isDarkMode = false;
    this.charts = {};
    this.maps = {};
    this.mapMarkers = {};
    this.liveAlerts = null; // Will be initialized when HistoricalDataModule loads
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupThemeToggle();
    this.simulateLoading();
    this.setupNavigation();
    this.checkMLStatus(); // Check ML API status
  }

  setupEventListeners() {
    // Helper function to close all open nav items
    const closeAllNavItems = () => {
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
    };

    // Simulator controls
    this.setupSimulatorControls();

    // Risk Checker (ML Prediction)
    this.setupRiskChecker();

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

    // Prepare charts and mini map
    this.initializeCharts();
    this.initMiniMap();

    // Load dashboard data from API
    this.loadDashboardData();

    // Initialize live alerts module (apenas uma vez)
    if (typeof LiveAlertsModule !== 'undefined' && !this.liveAlerts) {
      this.liveAlerts = new LiveAlertsModule(this);
      this.liveAlerts.initialize();
    }
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
    // Atualizar os novos gráficos com dados reais
    this.updateRiskDistributionChart();
    this.updateDangerousHighwaysChart();
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

    // 1. Distribuição de Risco (substitui Status das Cargas)
    const statusCtx = document.getElementById('chart-status');
    if (statusCtx) {
      if (chartsAvailable) {
        if (this.charts.riskDistribution) {
          this.charts.riskDistribution.destroy();
        }
        this.charts.riskDistribution = new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: ['Baixo Risco', 'Moderado', 'Alto Risco', 'Crítico'],
            datasets: [{
              data: [0, 0, 0, 0], // Será atualizado via API
              backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#dc2626'],
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { 
                  padding: 20, 
                  usePointStyle: true,
                  color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: ${value} cargas (${percentage}%)`;
                  }
                }
              }
            },
            cutout: '60%',
          }
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

    // 2. Top Rodovias Perigosas (substitui Alertas por Região)
    const alertsCtx = document.getElementById('chart-alerts');
    if (alertsCtx) {
      if (chartsAvailable) {
        if (this.charts.dangerousHighways) {
          this.charts.dangerousHighways.destroy();
        }
        this.charts.dangerousHighways = new Chart(alertsCtx, {
          type: 'bar',
          data: {
            labels: [], // Será preenchido via API
            datasets: [{
              label: 'Score de Risco',
              data: [],
              backgroundColor: function(context) {
                if (!context.parsed || context.parsed.y === undefined) {
                  return '#6b7280'; // Cor padrão quando não há dados
                }
                const value = context.parsed.y;
                if (value >= 80) return '#dc2626'; // Crítico
                if (value >= 60) return '#f97316'; // Alto
                if (value >= 40) return '#f59e0b'; // Moderado
                return '#10b981'; // Baixo
              },
              borderWidth: 0,
              borderRadius: 4
            }]
          },
          options: {
            indexAxis: 'y', // Barras horizontais
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Score de Risco (0-100)',
                  color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                },
                ticks: {
                  color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                },
                grid: {
                  color: getComputedStyle(document.body).getPropertyValue('--border-color'),
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Rodovia',
                  color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                },
                ticks: {
                  color: getComputedStyle(document.body).getPropertyValue('--text-secondary'),
                },
                grid: {
                  display: false,
                },
              }
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: function(context) {
                    return context[0].label;
                  },
                  label: function(context) {
                    return `Score: ${context.parsed.x.toFixed(1)}`;
                  }
                }
              }
            },
            onClick: (evt, els) => {
              if (!els.length) {
                return;
              }
              const highway = els[0].label;
              this.showNotification(`Detalhes da rodovia: ${highway}`, 'info');
              // TODO: Implementar modal com detalhes da rodovia
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
    // Click handlers para os novos gráficos
    if (this.charts.riskDistribution) {
      this.charts.riskDistribution.options.onClick = (evt, els) => {
        if (els.length > 0) {
          const riskLevel = ['baixo', 'moderado', 'alto', 'critico'][els[0].index];
          this.showNotification(`Filtrando alertas por: ${riskLevel.toUpperCase()}`, 'info');
          this.navigateToSection('alerts');
          // TODO: Implementar filtro de alertas por nível de risco
        }
      };
    }

    if (this.charts.dangerousHighways) {
      this.charts.dangerousHighways.options.onClick = (evt, els) => {
        if (els.length > 0) {
          const highway = els[0].label;
          this.showNotification(`Detalhes da rodovia: ${highway}`, 'info');
          // TODO: Implementar modal com detalhes da rodovia
        }
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
      console.warn('Leaflet.heat plugin não está disponível');
      return;
    }
    
    try {
      // Buscar dados reais de acidentes do backend
      const resp = await fetch(`${window.API_BASE_URL}/accidents/heatmap?years=3&limit=5000`);
      const json = await resp.json();

      if (json.success && json.data && json.data.points && json.data.points.length > 0) {
        const points = json.data.points.map(p => [p.lat, p.lng, p.intensity || 0.5]);

             // Criar heatmap com configurações otimizadas
             const heat = L.heatLayer(points, {
               radius: 25,        // Raio maior para melhor visualização
               blur: 15,          // Blur moderado para suavizar
               maxZoom: 17,       // Zoom máximo
               minOpacity: 0.4,   // Opacidade mínima
               gradient: {         // Gradiente customizado
                 0.4: 'blue',      // Baixo risco - azul
                 0.6: 'cyan',      // Risco moderado - ciano
                 0.7: 'lime',      // Risco médio - verde limão
                 0.8: 'yellow',    // Risco alto - amarelo
                 0.9: 'orange',    // Risco muito alto - laranja
                 1.0: 'red'        // Risco crítico - vermelho
               }
             });

             // Otimizar canvas para leitura frequente
             if (heat._canvas) {
               heat._canvas.willReadFrequently = true;
             }

        // Adicionar ao mapa
        heat.addTo(this.maps.full);

        // Guardar referência para controle futuro
        this.mapLayers = this.mapLayers || {};
        this.mapLayers.riskHeat = heat;

        // Adicionar controles
        this.addHeatmapControls();
        this.addRiskLegendControl();

        console.log(`✅ Heatmap carregado com ${points.length} pontos de acidentes reais`);
        
        // Mostrar notificação de sucesso
        this.showNotification(`Heatmap carregado: ${points.length} pontos de risco`, 'success');
      } else {
        console.warn('Nenhum ponto de risco disponível no backend, usando dados demo');
        // Fallback para dados demo se backend não tiver dados
        this.addDemoHeatmapData();
      }
    } catch (error) {
      console.error('Erro ao carregar heatmap de acidentes:', error);
      // Fallback para dados demo em caso de erro
      this.addDemoHeatmapData();
    }
  }

  /**
   * Adiciona dados demo de heatmap quando backend não está disponível
   */
  async addDemoHeatmapData() {
    if (!this.maps.full || typeof L === 'undefined' || typeof L.heatLayer === 'undefined') {
      return;
    }

    try {
      // Tentar carregar dados do arquivo JSON
      const response = await fetch('data/heatmap_data.json');
      let demoPoints;
      
      if (response.ok) {
        const data = await response.json();
        demoPoints = data.heatmap_points.map(point => [
          point.lat, 
          point.lng, 
          point.intensity
        ]);
        console.log(`✅ Carregados ${demoPoints.length} pontos do arquivo demo`);
      } else {
        // Fallback para dados hardcoded
        demoPoints = [
          // Região Metropolitana de SP - pontos de alto risco
          [-23.5505, -46.6333, 0.9],  // Centro SP
          [-23.5489, -46.6388, 0.8],  // Sé
          [-23.5431, -46.6291, 0.7],  // República
          [-23.5613, -46.6565, 0.8],  // Bela Vista
          [-23.5476, -46.6358, 0.6],  // Liberdade
          
          // Rodovias principais - alto risco
          [-23.4700, -46.5500, 0.9],  // Marginal Tietê
          [-23.5300, -46.6200, 0.8],  // Marginal Pinheiros
          [-23.5800, -46.6400, 0.7],  // Av. Paulista
          [-23.5000, -46.5800, 0.8],  // Rodovia dos Bandeirantes
          [-23.5200, -46.6000, 0.7],  // Rodovia Anhanguera
          
          // Zonas industriais
          [-23.5200, -46.4800, 0.6],  // Zona Oeste
          [-23.4800, -46.5800, 0.7],  // Zona Sul
          [-23.6000, -46.5200, 0.6],  // Zona Leste
          
          // Entornos de aeroportos
          [-23.4356, -46.4731, 0.8],  // Aeroporto de Cumbica
          [-23.6267, -46.6553, 0.7],  // Aeroporto de Congonhas
          
          // Portos e terminais
          [-23.9500, -46.3300, 0.9],  // Porto de Santos
          [-23.9000, -46.3800, 0.8],  // Cubatão
          
          // Outros pontos de risco conhecidos
          [-23.5000, -46.6200, 0.6],  // Região ABC
          [-23.5800, -46.5800, 0.5],  // Zona Norte
          [-23.4200, -46.5300, 0.7],  // Zona Oeste (expansão)
        ];
        console.log('⚠️ Usando dados hardcoded como fallback');
      }

           const heat = L.heatLayer(demoPoints, {
             radius: 30,
             blur: 20,
             maxZoom: 17,
             minOpacity: 0.4,
             gradient: {
               0.4: '#0066cc',    // Azul - baixo risco
               0.5: '#00cccc',    // Ciano - risco moderado
               0.6: '#66ff66',    // Verde - risco médio
               0.7: '#ffff00',    // Amarelo - risco alto
               0.8: '#ff9900',    // Laranja - risco muito alto
               0.9: '#ff3300',    // Vermelho - risco crítico
               1.0: '#cc0000'     // Vermelho escuro - máximo risco
             }
           });

           // Otimizar canvas para leitura frequente
           if (heat._canvas) {
             heat._canvas.willReadFrequently = true;
           }

           heat.addTo(this.maps.full);

      // Guardar referência
      this.mapLayers = this.mapLayers || {};
      this.mapLayers.riskHeat = heat;

      // Adicionar controles
      this.addHeatmapControls();
      this.addRiskLegendControl();

      console.log(`✅ Heatmap demo carregado com ${demoPoints.length} pontos de São Paulo`);
      this.showNotification(`Heatmap demo: ${demoPoints.length} pontos de risco carregados`, 'success');
      
    } catch (error) {
      console.error('Erro ao carregar dados demo do heatmap:', error);
      this.showNotification('Erro ao carregar dados demo do heatmap', 'error');
    }
  }

  async addRiskAreasLayer() {
    if (!this.maps.full || typeof L === 'undefined') {
      return;
    }
    try {
      // Tentar carregar zonas de risco do backend
      const resp = await fetch(`${window.API_BASE_URL}/risk/zones?limit=100`);
      const json = await resp.json();

      if (json.success && json.data && json.data.zones && json.data.zones.length > 0) {
        // Criar features GeoJSON a partir dos dados do backend
        const features = json.data.zones
          .filter(z => z.boundary && z.boundary.coordinates)
          .map(z => ({
            type: 'Feature',
            properties: {
              name: z.zone_name,
              level: z.zone_type,
              riskScore: z.risk_score,
              incidentCount: z.incident_count,
            },
            geometry: z.boundary,
          }));

        if (features.length > 0) {
          const geojson = { type: 'FeatureCollection', features };

          const style = feature => {
            const level = (feature.properties && feature.properties.level) || 'green';
            const color = level === 'red' ? '#ef4444' : level === 'yellow' ? '#f59e0b' : '#10b981';
            return { color, weight: 2, fillColor: color, fillOpacity: 0.18 };
          };

          const layer = L.geoJSON(geojson, {
            style,
            onEachFeature: (f, l) => {
              const props = f.properties;
              const name = props.name || 'Zona de risco';
              const popup = `
                <b>${name}</b><br/>
                Risco: ${props.riskScore || 'N/A'}<br/>
                Incidentes: ${props.incidentCount || 0}
              `;
              l.bindPopup(popup);
            },
          });

          layer.addTo(this.maps.full);
          this.mapLayers = this.mapLayers || {};
          this.mapLayers.riskAreas = layer;
          this.addRiskAreasToggleControl();
          this.addRiskLegendControl();

          console.log(`Zonas de risco carregadas: ${features.length} zonas`);
        }
      } else {
        // Fallback para arquivo estático se backend não tiver dados
        const resp2 = await fetch('data/sp_risk_areas.geojson');
        if (resp2.ok) {
          const geojson = await resp2.json();
          this.renderStaticRiskAreas(geojson);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar zonas de risco:', error);
      // Tentar fallback para arquivo estático
      try {
        const resp = await fetch('data/sp_risk_areas.geojson');
        if (resp.ok) {
          const geojson = await resp.json();
          this.renderStaticRiskAreas(geojson);
        }
      } catch (_) {
        // ignore
      }
    }
  }

  renderStaticRiskAreas(geojson) {
    const style = feature => {
      const level = (feature.properties && feature.properties.level) || 'medium';
      const color = level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#10b981';
      return { color, weight: 2, fillColor: color, fillOpacity: 0.18 };
    };
    const layer = L.geoJSON(geojson, {
      style,
      onEachFeature: (f, l) => {
        const name = (f.properties && (f.properties.name || f.properties.level)) || 'Zona de risco';
        l.bindPopup(`<b>${name}</b>`);
      },
    });
    layer.addTo(this.maps.full);
    this.mapLayers = this.mapLayers || {};
    this.mapLayers.riskAreas = layer;
    this.addRiskAreasToggleControl();
    this.addRiskLegendControl();
  }

  addHeatmapControls() {
    if (!this.maps.full) {
      return;
    }

    // Controle principal de toggle do heatmap - posicionado no topo direito
    const toggleControl = L.control({ position: 'topright' });
    toggleControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar heatmap-controls');
      div.style.cssText = `
        background: white;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        border: 1px solid rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin-bottom: 10px;
      `;

      // Botão principal de toggle
      const toggleBtn = L.DomUtil.create('a', 'heatmap-toggle', div);
      toggleBtn.href = '#';
      toggleBtn.title = 'Alternar Heatmap de Risco';
      toggleBtn.innerHTML = '🔥';
      toggleBtn.style.cssText = `
        display: block;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        text-decoration: none;
        color: #333;
        border-bottom: 2px solid #e9ecef;
        font-size: 18px;
        transition: all 0.2s ease;
        background: transparent;
        position: relative;
      `;

      // Botão de intensidade
      const intensityBtn = L.DomUtil.create('a', 'heatmap-intensity', div);
      intensityBtn.href = '#';
      intensityBtn.title = 'Ajustar Intensidade do Heatmap';
      intensityBtn.innerHTML = '⚙️';
      intensityBtn.style.cssText = `
        display: block;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        text-decoration: none;
        color: #333;
        font-size: 16px;
        transition: all 0.2s ease;
        background: transparent;
        position: relative;
      `;

      // Event handlers
      L.DomEvent.on(toggleBtn, 'click', e => {
        L.DomEvent.stop(e);
        this.toggleHeatmap();
      });

      L.DomEvent.on(intensityBtn, 'click', e => {
        L.DomEvent.stop(e);
        this.showHeatmapIntensityControl();
      });

      // Prevenir propagação de eventos do mapa
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };
    toggleControl.addTo(this.maps.full);

    // Guardar referência para controle futuro
    this.mapLayers = this.mapLayers || {};
    this.mapLayers.heatmapControls = toggleControl;
  }

  /**
   * Alterna a visibilidade do heatmap
   */
  toggleHeatmap() {
    const heat = this.mapLayers && this.mapLayers.riskHeat;
    if (!heat) {
      this.showNotification('Heatmap não está carregado', 'warning');
      return;
    }

    const isVisible = this.maps.full.hasLayer(heat);
    
    if (isVisible) {
      this.maps.full.removeLayer(heat);
      this.showNotification('Heatmap ocultado', 'info');
    } else {
      heat.addTo(this.maps.full);
      this.showNotification('Heatmap exibido', 'success');
    }

    // Atualizar estado do botão
    this.updateHeatmapToggleButton(!isVisible);
  }

  /**
   * Atualiza o estado visual do botão de toggle
   */
  updateHeatmapToggleButton(isVisible) {
    const toggleBtn = document.querySelector('.heatmap-toggle');
    if (toggleBtn) {
      toggleBtn.style.opacity = isVisible ? '1' : '0.5';
      toggleBtn.style.backgroundColor = isVisible ? '#e8f5e8' : 'transparent';
    }
  }

  /**
   * Mostra controle de intensidade do heatmap
   */
  showHeatmapIntensityControl() {
    const heat = this.mapLayers && this.mapLayers.riskHeat;
    if (!heat) {
      this.showNotification('Heatmap não está carregado', 'warning');
      return;
    }

    // Criar modal de controle de intensidade
    const modal = document.createElement('div');
    modal.className = 'heatmap-intensity-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      min-width: 300px;
    `;

    modal.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #333;">Ajustar Heatmap</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Raio:</label>
        <input type="range" id="heatmap-radius" min="10" max="50" value="25" 
               style="width: 100%; margin-bottom: 10px;">
        <span id="radius-value">25</span>px
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Blur:</label>
        <input type="range" id="heatmap-blur" min="5" max="30" value="15" 
               style="width: 100%; margin-bottom: 10px;">
        <span id="blur-value">15</span>px
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Opacidade:</label>
        <input type="range" id="heatmap-opacity" min="0.1" max="1" step="0.1" value="0.4" 
               style="width: 100%; margin-bottom: 10px;">
        <span id="opacity-value">0.4</span>
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="apply-heatmap-settings" style="
          background: #007cba; color: white; border: none; padding: 8px 16px; 
          border-radius: 4px; cursor: pointer;">Aplicar</button>
        <button id="close-heatmap-modal" style="
          background: #666; color: white; border: none; padding: 8px 16px; 
          border-radius: 4px; cursor: pointer;">Fechar</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const radiusSlider = modal.querySelector('#heatmap-radius');
    const blurSlider = modal.querySelector('#heatmap-blur');
    const opacitySlider = modal.querySelector('#heatmap-opacity');
    const applyBtn = modal.querySelector('#apply-heatmap-settings');
    const closeBtn = modal.querySelector('#close-heatmap-modal');

    // Atualizar valores em tempo real
    radiusSlider.addEventListener('input', (e) => {
      modal.querySelector('#radius-value').textContent = e.target.value;
    });

    blurSlider.addEventListener('input', (e) => {
      modal.querySelector('#blur-value').textContent = e.target.value;
    });

    opacitySlider.addEventListener('input', (e) => {
      modal.querySelector('#opacity-value').textContent = e.target.value;
    });

    // Aplicar configurações
    applyBtn.addEventListener('click', () => {
      const newRadius = parseInt(radiusSlider.value);
      const newBlur = parseInt(blurSlider.value);
      const newOpacity = parseFloat(opacitySlider.value);

      heat.setOptions({
        radius: newRadius,
        blur: newBlur,
        minOpacity: newOpacity
      });

      this.showNotification('Configurações do heatmap aplicadas', 'success');
      modal.remove();
    });

    // Fechar modal
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
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
    
    // Posicionar legenda no canto inferior esquerdo para não conflitar com controles
    const legend = L.control({ position: 'bottomleft' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'glass-card map-legend');
      div.style.cssText = `
        padding: 12px 14px;
        font-size: 12px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        max-width: 200px;
        margin-right: 10px;
      `;
      
      const spanStyle = 'display:inline-block;width:12px;height:12px;border-radius:2px;margin-right:6px';
      
      div.innerHTML = `
        <div style="font-weight:700;margin-bottom:8px;color:#333;font-size:12px">
          🗺️ Legenda do Mapa
        </div>
        
        <div style="margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #eee;">
          <div style="font-weight:600;margin-bottom:4px;color:#666;font-size:11px;">Heatmap de Risco</div>
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
            <span style="${spanStyle};background:#0066cc;opacity:.8"></span> 
            <span style="font-size:10px;">Baixo Risco</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
            <span style="${spanStyle};background:#00cccc;opacity:.8"></span> 
            <span style="font-size:10px;">Moderado</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
            <span style="${spanStyle};background:#66ff66;opacity:.8"></span> 
            <span style="font-size:10px;">Médio</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
            <span style="${spanStyle};background:#ffff00;opacity:.8"></span> 
            <span style="font-size:10px;">Alto</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
            <span style="${spanStyle};background:#ff9900;opacity:.8"></span> 
            <span style="font-size:10px;">Muito Alto</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center">
            <span style="${spanStyle};background:#ff3300;opacity:.8"></span> 
            <span style="font-size:10px;">Crítico</span>
          </div>
        </div>
        
        <div style="margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #eee;">
          <div style="font-weight:600;margin-bottom:4px;color:#666;font-size:11px;">Zonas de Risco</div>
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
            <span style="${spanStyle};background:#ef4444;opacity:.7"></span> 
            <span style="font-size:10px;">Alto</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center;margin-bottom:2px">
            <span style="${spanStyle};background:#f59e0b;opacity:.7"></span> 
            <span style="font-size:10px;">Médio</span>
          </div>
          <div style="display:flex;gap:4px;align-items:center">
            <span style="${spanStyle};background:#10b981;opacity:.7"></span> 
            <span style="font-size:10px;">Baixo</span>
          </div>
        </div>
        
        <div style="font-size:9px;color:#888;text-align:center;margin-top:4px;">
          💡 Use 🔥⚙️ para ajustar
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

  addDemoMarkers(_map, _fitBounds) {
    // Dados devem vir do backend via API real
    return [];
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

  async drawFullMapLayers() {
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

    try {
      // Load simulated shipments
      const response = await fetch(`${window.API_BASE_URL}/shipments?limit=100`);
      const data = await response.json();

      if (data.success && data.data.shipments) {
        const shipments = data.data.shipments;
        const markers = [];

        shipments.forEach(shipment => {
          if (
            shipment.currentPosition &&
            shipment.currentPosition.lat &&
            shipment.currentPosition.lng
          ) {
            const colorForRisk = score => {
              if (score >= 80) {
                return '#dc2626';
              } // Critical
              if (score >= 60) {
                return '#ea580c';
              } // High
              if (score >= 40) {
                return '#f59e0b';
              } // Medium
              return '#3b82f6'; // Low
            };

            const marker = L.circleMarker(
              [shipment.currentPosition.lat, shipment.currentPosition.lng],
              {
                radius: 6,
                color: colorForRisk(shipment.riskScore),
                fillColor: colorForRisk(shipment.riskScore),
                fillOpacity: 0.9,
                weight: 2,
              }
            ).addTo(group);

            marker.bindPopup(`
              <div class="shipment-popup">
                <h3>${shipment.shipmentNumber}</h3>
                ${shipment.is_simulated ? '<span class="badge-simulated">SIMULADO</span>' : ''}
                <div class="popup-content">
                  <div><strong>Status:</strong> ${shipment.status}</div>
                  <div><strong>Origem:</strong> ${shipment.origin}</div>
                  <div><strong>Destino:</strong> ${shipment.destination}</div>
                  <div><strong>Progresso:</strong> ${shipment.progress.toFixed(1)}%</div>
                  <div><strong>Risco:</strong> <span class="risk-badge risk-${this.getRiskLevel(shipment.riskScore)}">${shipment.riskScore.toFixed(0)}</span></div>
                </div>
              </div>
            `);

            marker.shipmentData = shipment;
            markers.push(marker);
          }
        });

        this.mapMarkers['map-full'] = markers;

        // Fit bounds to markers if there are any
        if (markers.length > 0) {
          const group = new L.featureGroup(markers);
          const bounds = group.getBounds();
          if (bounds && bounds.isValid()) {
            this.maps.full.fitBounds(bounds.pad(0.2));
          }
        }

        console.log(`Loaded ${markers.length} shipments on map`);
      }
    } catch (error) {
      console.error('Error loading shipments on map:', error);
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
    // Buscar cargas reais do backend
    const items = [];
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
    // Actions - buscar dados do backend quando implementado
    panel.querySelectorAll('[data-focus]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        this.showNotification(
          'Funcionalidade não implementada - aguardando dados do backend',
          'info'
        );
      });
    });
    panel.querySelectorAll('[data-route]').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.preventDefault();
        this.showNotification(
          'Funcionalidade não implementada - aguardando dados do backend',
          'info'
        );
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
    // Buscar alertas reais do backend por região
    return regions.map(() => 0);
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

  renderAlertsDetails(_region) {
    const el = document.getElementById('alerts-details');
    if (!el) {
      return;
    }
    // Buscar alertas reais do backend por região
    const items = [];
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
    // Buscar cargas reais do backend por status
    const items = [];
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
      case 'simulator':
        this.loadSimulatorData();
        break;
      case 'alerts':
        this.loadAlertsData();
        break;
      case 'map':
        this.loadMapData();
        break;
    }
  }

  async loadDashboardData() {
    // Load dashboard data from API
    try {
      const response = await fetch(`${window.API_BASE_URL}/monitoring/dashboard`);
      const data = await response.json();

      if (data.success) {
        this.updateDashboardWithData(data.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  updateDashboardWithData(data) {
    // Update stat cards
    if (data.summary) {
      this.updateStatCard('active-shipments', data.summary.activeShipments);
      this.updateStatCard('total-alerts', data.summary.totalAlerts);
      this.updateStatCard('high-risk-zones', data.summary.highRiskZones);
      this.updateStatCard('fleet-utilization', `${data.summary.fleetUtilization.toFixed(1)}%`);
    }

    // Update charts if they exist
    if (this.charts.status && data.riskDistribution) {
      const { critical, high, medium, low } = data.riskDistribution;
      this.charts.status.data.datasets[0].data = [medium + low, high, critical];
      this.charts.status.update('none');
    }
  }

  updateStatCard(id, value) {
    const element = document.querySelector(`[data-stat="${id}"] .stat-number`);
    if (element) {
      element.textContent = value;
    }
  }

  async loadShipmentsData() {
    const list = document.getElementById('shipments-list');
    if (!list) {
      return;
    }

    try {
      // Primeiro verificar se há simulação ativa
      const simResponse = await fetch(`${window.API_BASE_URL}/simulator/status`);
      const simData = await simResponse.json();
      
      let items = [];
      
      if (simData.success && simData.data.is_running && simData.data.shipments) {
        // Se há simulação ativa, usar dados da simulação
        items = simData.data.shipments.map(shipment => ({
          id: shipment.id || shipment.shipment_id,
          shipmentNumber: shipment.shipment_number || shipment.shipmentNumber || `SIM-${shipment.id}`,
          origin: shipment.origin || 'Origem não definida',
          destination: shipment.destination || 'Destino não definido',
          status: shipment.status || 'in_transit',
          cargoType: shipment.cargo_type || shipment.cargoType || 'Carga geral',
          cargoValue: shipment.cargo_value || shipment.cargoValue || 50000,
          progress: shipment.progress_percent || shipment.progress || 0,
          riskScore: shipment.current_risk_score || shipment.risk_score || 45,
          is_simulated: true,
          currentPosition: shipment.current_position || shipment.currentPosition
        }));
      } else {
        // Se não há simulação ativa, buscar cargas reais (não simuladas)
        const response = await fetch(`${window.API_BASE_URL}/shipments?limit=50&exclude_simulated=true`);
        const data = await response.json();

        if (data.success) {
          items = data.data.shipments || [];
        }
      }

      if (items.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <div style="text-align: center; padding: 2rem;">
              <i class="fas fa-truck" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
              <h3>Nenhuma carga ativa</h3>
              <p>Inicie o simulador para gerar cargas de teste ou cadastre cargas reais.</p>
              <button class="btn btn-primary" onclick="window.sompoApp.navigateToSection('simulator')" style="margin-top: 1rem;">
                <i class="fas fa-play"></i> Iniciar Simulador
              </button>
            </div>
          </div>
        `;
        return;
      }

      list.innerHTML = items
        .map(
          s => `
              <div class="data-item shipment-item" data-shipment-id="${s.id}">
                  <div class="shipment-main">
                      <div class="title">
                        ${s.shipmentNumber}
                        ${s.is_simulated ? '<span class="badge-simulated">SIMULADO</span>' : ''}
                        <span class="badge-status ${s.status}">${s.status.replace('_', ' ')}</span>
                      </div>
                      <div class="subtitle">${s.origin} → ${s.destination}</div>
                      <div class="meta">
                        <span>${s.cargoType}</span>
                        <span>R$ ${s.cargoValue.toLocaleString('pt-BR')}</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${s.progress || 0}%"></div>
                        <span class="progress-text">${(s.progress || 0).toFixed(1)}%</span>
                      </div>
                      <div class="risk-indicator">
                        <span class="risk-label">Risco:</span>
                        <span class="risk-badge risk-${this.getRiskLevel(s.riskScore)}">
                          ${(s.riskScore || 0).toFixed(0)}
                        </span>
                      </div>
                  </div>
                  <div class="shipment-actions">
                      <button class="btn-icon" data-view-details="${s.id}" title="Ver Detalhes">
                        <i class="fas fa-info-circle"></i>
                      </button>
                      <button class="btn-icon" data-view-map="${s.id}" title="Ver no Mapa">
                        <i class="fas fa-map-marked-alt"></i>
                      </button>
                  </div>
              </div>
          `
        )
        .join('');

      // Add event listeners
      list.querySelectorAll('[data-view-details]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-view-details');
          await this.showShipmentDetails(id);
        });
      });

      list.querySelectorAll('[data-view-map]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-view-map');
          const shipment = items.find(s => s.id == id);
          if (shipment) {
            this.navigateToSection('map');
            setTimeout(() => {
              if (this.maps.full && shipment.currentPosition) {
                this.maps.full.setView(
                  [shipment.currentPosition.lat, shipment.currentPosition.lng],
                  12
                );
              }
            }, 300);
          }
        });
      });
    } catch (error) {
      console.error('Error loading shipments:', error);
      list.innerHTML = `
        <div class="empty-state">
          <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
            <h3>Erro ao carregar cargas</h3>
            <p>Verifique a conexão com o servidor e tente novamente.</p>
            <button class="btn btn-secondary" onclick="window.sompoApp.loadShipmentsData()" style="margin-top: 1rem;">
              <i class="fas fa-sync-alt"></i> Tentar Novamente
            </button>
          </div>
        </div>
      `;
    }
  }

  getRiskLevel(score) {
    if (score >= 80) {
      return 'critical';
    }
    if (score >= 60) {
      return 'high';
    }
    if (score >= 40) {
      return 'medium';
    }
    return 'low';
  }

  async showShipmentDetails(shipmentId) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/shipments/${shipmentId}`);
      const data = await response.json();

      if (!data.success) {
        this.showNotification('Erro ao carregar detalhes da carga', 'error');
        return;
      }

      const shipment = data.data.shipment;

      // Create detailed view modal
      const modal = document.createElement('div');
      modal.className = 'shipment-modal-overlay';
      modal.innerHTML = `
        <div class="shipment-modal glass-card">
          <div class="modal-header">
            <h2>${shipment.shipmentNumber}</h2>
            <button class="modal-close"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="shipment-detail-grid">
              <div class="detail-section">
                <h3>Informações da Carga</h3>
                <div class="detail-item">
                  <span>Status:</span>
                  <span class="badge-status ${shipment.status}">${shipment.status}</span>
                </div>
                <div class="detail-item">
                  <span>Tipo de Carga:</span>
                  <span>${shipment.cargoType}</span>
                </div>
                <div class="detail-item">
                  <span>Valor:</span>
                  <span>R$ ${shipment.cargoValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="detail-item">
                  <span>Progresso:</span>
                  <span>${shipment.progress.toFixed(1)}%</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h3>Rota</h3>
                <div class="detail-item">
                  <span>Origem:</span>
                  <span>${shipment.origin}</span>
                </div>
                <div class="detail-item">
                  <span>Destino:</span>
                  <span>${shipment.destination}</span>
                </div>
                <div class="detail-item">
                  <span>Distância Percorrida:</span>
                  <span>${shipment.distanceTraveled.toFixed(1)} km</span>
                </div>
                <div class="detail-item">
                  <span>Distância Restante:</span>
                  <span>${shipment.distanceRemaining.toFixed(1)} km</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h3>Risco</h3>
                <div class="detail-item">
                  <span>Score Geral:</span>
                  <span class="risk-badge risk-${this.getRiskLevel(shipment.riskScore)}">
                    ${shipment.riskScore.toFixed(0)}
                  </span>
                </div>
                <div class="detail-item">
                  <span>Previsão de Chegada:</span>
                  <span>${new Date(shipment.estimatedArrival).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
            
            <div id="shipment-alerts-feed" class="shipment-alerts-section"></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary modal-close-btn">Fechar</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Load alerts for this shipment
      if (this.liveAlerts) {
        await this.liveAlerts.renderShipmentAlertFeed(
          shipment.shipmentNumber,
          'shipment-alerts-feed'
        );
      }

      // Add close handlers
      modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.remove();
        });
      });

      modal.addEventListener('click', e => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    } catch (error) {
      console.error('Error showing shipment details:', error);
      this.showNotification('Erro ao carregar detalhes', 'error');
    }
  }

  loadVehiclesData() {
    const list = document.getElementById('vehicles-list');
    if (!list) {
      return;
    }
    // Buscar veículos reais do backend
    const vehicles = {};
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

  async loadAlertsData() {
    const list = document.getElementById('alerts-list');
    if (!list) {
      return;
    }

    try {
      // Buscar alertas reais do backend
      const response = await fetch(`${window.API_BASE_URL}/alerts/active`);
      const data = await response.json();

      if (!data.success) {
        list.innerHTML = '<div class="empty-state">Erro ao carregar alertas</div>';
        return;
      }

      const items = data.data.alerts || [];

      if (items.length === 0) {
        list.innerHTML = '<div class="empty-state">✅ Nenhum alerta ativo</div>';
        return;
      }

      list.innerHTML = items
        .map(
          a => `
              <div class="data-item alert-item alert-${a.severity}">
                  <div class="alert-main-info">
                      <div class="title">
                        ${this.getAlertIcon(a.severity)} ${a.title}
                      </div>
                      <div class="subtitle">${a.shipment_number}</div>
                      <div class="meta">
                        BR-${a.br} (${a.uf}) - KM ${a.km.toFixed(1)}
                      </div>
                      <div class="risk-indicator">
                        <span class="risk-label">Score:</span>
                        <span class="risk-badge risk-${a.severity}">${a.risk_score.toFixed(0)}</span>
                      </div>
                  </div>
                  <div class="alert-actions">
                      <button class="btn-icon" data-alert-location="${a.location.lat},${a.location.lng}" title="Ver no Mapa">
                        <i class="fas fa-map-marker-alt"></i>
                      </button>
                  </div>
              </div>
          `
        )
        .join('');

      list.querySelectorAll('[data-alert-location]').forEach(btn => {
        btn.addEventListener('click', () => {
          const coords = btn.getAttribute('data-alert-location').split(',');
          const lat = parseFloat(coords[0]);
          const lng = parseFloat(coords[1]);

          this.navigateToSection('map');
          setTimeout(() => {
            if (this.maps.full) {
              this.maps.full.setView([lat, lng], 14);
            }
          }, 300);
        });
      });
    } catch (error) {
      console.error('Error loading alerts:', error);
      list.innerHTML = '<div class="empty-state">Erro ao carregar alertas</div>';
    }
  }

  getAlertIcon(severity) {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
    };
    return icons[severity] || '📌';
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

  // Simulator methods
  setupSimulatorControls() {
    // Will be set up when DOM is ready
    setTimeout(() => {
      const startBtn = document.getElementById('btn-start-sim');
      const pauseBtn = document.getElementById('btn-pause-sim');
      const stopBtn = document.getElementById('btn-stop-sim');
      const countInput = document.getElementById('sim-count');

      if (startBtn) {
        startBtn.addEventListener('click', async () => {
          const count = parseInt(countInput.value);
          await this.startSimulation(count);
        });
      }

      if (pauseBtn) {
        pauseBtn.addEventListener('click', async () => {
          await this.pauseSimulation();
        });
      }

      if (stopBtn) {
        stopBtn.addEventListener('click', async () => {
          await this.stopSimulation();
        });
      }
    }, 1000);
  }

  async startSimulation(count) {
    try {
      const response = await fetch(`${window.API_BASE_URL}/simulator/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification(`Simulação iniciada com ${count} cargas!`, 'success');
        this.updateSimulatorButtons(true);
        await this.loadSimulatorStats();

        // Refresh shipments and alerts
        if (this.currentSection === 'shipments') {
          await this.loadShipmentsData();
        }

        // Start auto-refresh
        this.startSimulatorRefresh();
      } else {
        this.showNotification(data.error || 'Erro ao iniciar simulação', 'error');
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      this.showNotification('Erro ao iniciar simulação', 'error');
    }
  }

  async pauseSimulation() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/simulator/pause`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification('Simulação pausada', 'info');
        this.stopSimulatorRefresh();
      }
    } catch (error) {
      console.error('Error pausing simulation:', error);
      this.showNotification('Erro ao pausar simulação', 'error');
    }
  }

  async stopSimulation() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/simulator/stop`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        this.showNotification('Simulação parada', 'success');
        this.updateSimulatorButtons(false);
        this.stopSimulatorRefresh();
        await this.loadSimulatorStats();
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
      this.showNotification('Erro ao parar simulação', 'error');
    }
  }

  updateSimulatorButtons(running) {
    const startBtn = document.getElementById('btn-start-sim');
    const pauseBtn = document.getElementById('btn-pause-sim');
    const stopBtn = document.getElementById('btn-stop-sim');

    if (startBtn) {
      startBtn.disabled = running;
    }
    if (pauseBtn) {
      pauseBtn.disabled = !running;
    }
    if (stopBtn) {
      stopBtn.disabled = !running;
    }
  }

  startSimulatorRefresh() {
    if (this.simulatorRefreshInterval) {
      clearInterval(this.simulatorRefreshInterval);
    }

    this.simulatorRefreshInterval = setInterval(async () => {
      await this.loadSimulatorStats();

      // Refresh current section data
      if (this.currentSection === 'shipments') {
        await this.loadShipmentsData();
      } else if (this.currentSection === 'alerts') {
        await this.loadAlertsData();
      } else if (this.currentSection === 'dashboard') {
        await this.loadDashboardData();
      }
    }, 30000); // 30 seconds
  }

  stopSimulatorRefresh() {
    if (this.simulatorRefreshInterval) {
      clearInterval(this.simulatorRefreshInterval);
      this.simulatorRefreshInterval = null;
    }
  }

  async loadSimulatorData() {
    await this.loadSimulatorStats();

    // Initialize live alerts feed if module is available
    if (this.liveAlerts) {
      await this.liveAlerts.loadAlerts();
    }
  }

  async loadSimulatorStats() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/simulator/status`);
      const data = await response.json();

      if (data.success) {
        this.displaySimulatorStats(data.data);
      }
    } catch (error) {
      console.error('Error loading simulator stats:', error);
    }
  }

  displaySimulatorStats(stats) {
    const container = document.getElementById('simulator-stats');
    const statusContainer = document.getElementById('simulator-status');

    if (!container) {
      return;
    }

    // Update status message
    if (statusContainer) {
      if (stats.is_running) {
        statusContainer.innerHTML = `
          <div class="status-message status-running">
            🟢 Simulação Ativa - ${stats.active_shipments} cargas monitoradas
          </div>
        `;
        this.updateSimulatorButtons(true);
      } else {
        statusContainer.innerHTML = `
          <div class="status-message status-stopped">
            ⚫ Simulação Parada - Inicie para começar
          </div>
        `;
        this.updateSimulatorButtons(false);
      }
    }

    // Display shipments stats
    if (stats.shipments && stats.shipments.length > 0) {
      const statusCounts = {
        in_transit: 0,
        completed: 0,
        paused: 0,
      };

      stats.shipments.forEach(s => {
        statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
      });

      const avgRisk =
        stats.shipments.reduce((sum, s) => sum + (s.current_risk_score || 0), 0) /
        stats.shipments.length;

      container.innerHTML = `
        <div class="stats-summary-grid">
          <div class="stat-summary-item">
            <div class="stat-summary-icon">
              <i class="fas fa-truck"></i>
            </div>
            <div class="stat-summary-content">
              <div class="stat-summary-value">${stats.active_shipments}</div>
              <div class="stat-summary-label">Cargas Ativas</div>
            </div>
          </div>
          <div class="stat-summary-item">
            <div class="stat-summary-icon">
              <i class="fas fa-road"></i>
            </div>
            <div class="stat-summary-content">
              <div class="stat-summary-value">${statusCounts.in_transit}</div>
              <div class="stat-summary-label">Em Trânsito</div>
            </div>
          </div>
          <div class="stat-summary-item">
            <div class="stat-summary-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-summary-content">
              <div class="stat-summary-value">${statusCounts.completed}</div>
              <div class="stat-summary-label">Completadas</div>
            </div>
          </div>
          <div class="stat-summary-item">
            <div class="stat-summary-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-summary-content">
              <div class="stat-summary-value">${avgRisk.toFixed(0)}</div>
              <div class="stat-summary-label">Risco Médio</div>
            </div>
          </div>
        </div>

        <div class="shipments-table">
          <table class="simulator-table">
            <thead>
              <tr>
                <th>Carga</th>
                <th>Status</th>
                <th>Progresso</th>
                <th>Risco</th>
              </tr>
            </thead>
            <tbody>
              ${stats.shipments
                .slice(0, 10)
                .map(
                  s => `
                  <tr>
                    <td>${s.shipment_number || s.shipmentNumber || 'N/A'}</td>
                    <td><span class="badge-status ${s.status}">${s.status}</span></td>
                    <td>
                      <div class="mini-progress-bar">
                        <div class="mini-progress-fill" style="width: ${(s.progress_percent || s.progress || 0)}%"></div>
                        <span class="mini-progress-text">${(s.progress_percent || s.progress || 0).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <span class="risk-badge risk-${this.getRiskLevel(s.current_risk_score || s.risk_score || 0)}">
                        ${(s.current_risk_score || s.risk_score || 0).toFixed(0)}
                      </span>
                    </td>
                  </tr>
                `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.innerHTML =
        '<div class="empty-state">Nenhuma carga ativa. Inicie a simulação.</div>';
    }
  }

  // Utility methods

  // =========================================================================
  // ML RISK PREDICTION - NEW FEATURE
  // =========================================================================

  /**
   * Check ML API status on initialization
   */
  async checkMLStatus() {
    try {
      const response = await fetch(`${window.API_BASE_URL}/risk/status`);
      const data = await response.json();

      if (data.success) {
        const mlAvailable = data.data.ml_realtime?.available || false;
        const mlBadge = document.getElementById('ml-status-badge');
        
        if (mlBadge) {
          if (mlAvailable) {
            mlBadge.innerHTML = '<i class="fas fa-check-circle"></i> ML Ativo';
            mlBadge.className = 'badge badge-success';
            mlBadge.style.display = 'inline-block';
          } else {
            mlBadge.innerHTML = '<i class="fas fa-info-circle"></i> Apenas Cache';
            mlBadge.className = 'badge badge-info';
            mlBadge.style.display = 'inline-block';
          }
        }
      }
    } catch (error) {
      console.warn('Erro ao verificar status ML:', error);
    }
  }

  /**
   * Setup Risk Checker event listeners
   */
  setupRiskChecker() {
    const form = document.getElementById('risk-checker-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.checkRisk();
    });

    // Setup UF change listener for dynamic highway loading
    const ufSelect = document.getElementById('risk-uf');
    const brSelect = document.getElementById('risk-br');
    const kmInput = document.getElementById('risk-km');
    
    if (ufSelect) {
      ufSelect.addEventListener('change', async (e) => {
        await this.loadHighwaysForUF(e.target.value);
      });
    }

    // Setup BR change listener for KM validation
    if (brSelect) {
      brSelect.addEventListener('change', (e) => {
        this.updateKMValidation(e.target.value);
      });
    }

    // Setup KM input listener for real-time validation
    if (kmInput) {
      kmInput.addEventListener('input', (e) => {
        this.validateKMInput(e.target.value);
      });
    }

    // Update badge when checkbox changes
    const mlCheckbox = document.getElementById('use-ml-model');
    if (mlCheckbox) {
      mlCheckbox.addEventListener('change', (e) => {
        const modeBadge = document.getElementById('ml-mode-badge');
        if (e.target.checked) {
          modeBadge.innerHTML = '<i class="fas fa-brain"></i> Modo: ML Tempo Real';
          modeBadge.className = 'badge badge-ml active';
        } else {
          modeBadge.innerHTML = '<i class="fas fa-database"></i> Modo: Cache';
          modeBadge.className = 'badge badge-ml';
        }
      });
    }
  }

  /**
   * Load highways for a specific UF
   */
  async loadHighwaysForUF(uf) {
    const brSelect = document.getElementById('risk-br');
    const kmInput = document.getElementById('risk-km');
    const highwayInfo = document.getElementById('highway-info');
    
    if (!uf) {
      brSelect.disabled = true;
      brSelect.innerHTML = '<option value="">Selecione primeiro o Estado</option>';
      kmInput.disabled = true;
      highwayInfo.style.display = 'none';
      return;
    }

    // Show loading state
    brSelect.disabled = true;
    brSelect.innerHTML = '<option value="">Carregando rodovias...</option>';
    kmInput.disabled = true;

    try {
      const response = await fetch(`${window.API_BASE_URL}/highways/dropdown/${uf}`);
      const data = await response.json();

      if (data.success) {
        brSelect.innerHTML = '<option value="">Selecione uma rodovia</option>';
        
        data.data.options.forEach(option => {
          const opt = document.createElement('option');
          opt.value = option.value;
          opt.textContent = option.label;
          opt.dataset.minKm = option.min_km;
          opt.dataset.maxKm = option.max_km;
          opt.dataset.accidents = option.accidents;
          brSelect.appendChild(opt);
        });

        brSelect.disabled = false;
      } else {
        brSelect.innerHTML = '<option value="">Erro ao carregar rodovias</option>';
      }
    } catch (error) {
      console.error('Erro ao carregar rodovias:', error);
      brSelect.innerHTML = '<option value="">Erro ao carregar rodovias</option>';
    }
  }

  /**
   * Update KM validation when BR changes
   */
  updateKMValidation(br) {
    const brSelect = document.getElementById('risk-br');
    const kmInput = document.getElementById('risk-km');
    const kmRangeInfo = document.getElementById('km-range-info');
    const kmValidationError = document.getElementById('km-validation-error');
    
    if (!br) {
      kmInput.disabled = true;
      kmRangeInfo.style.display = 'none';
      kmValidationError.style.display = 'none';
      return;
    }

    const selectedOption = brSelect.options[brSelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.minKm) {
      const minKm = parseFloat(selectedOption.dataset.minKm);
      const maxKm = parseFloat(selectedOption.dataset.maxKm);
      
      kmInput.disabled = false;
      kmInput.min = minKm;
      kmInput.max = maxKm;
      kmInput.placeholder = `Ex: ${(minKm + (maxKm - minKm) / 2).toFixed(1)}`;
      
      kmRangeInfo.textContent = `KM válido: ${minKm} - ${maxKm}`;
      kmRangeInfo.style.display = 'block';
      
      // Clear any previous validation errors
      kmValidationError.style.display = 'none';
    }
  }

  /**
   * Validate KM input in real-time
   */
  async validateKMInput(kmValue) {
    const uf = document.getElementById('risk-uf').value;
    const br = document.getElementById('risk-br').value;
    const kmValidationError = document.getElementById('km-validation-error');
    
    if (!uf || !br || !kmValue) {
      kmValidationError.style.display = 'none';
      return;
    }

    const km = parseFloat(kmValue);
    if (isNaN(km)) {
      return;
    }

    try {
      const response = await fetch(`${window.API_BASE_URL}/highways/validate?uf=${uf}&br=${br}&km=${km}`);
      const data = await response.json();

      if (data.success) {
        if (data.data.valid) {
          kmValidationError.style.display = 'none';
        } else {
          kmValidationError.textContent = data.data.message;
          kmValidationError.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Erro na validação de KM:', error);
    }
  }

  /**
   * Check risk for a specific segment
   */
  async checkRisk() {
    const uf = document.getElementById('risk-uf').value;
    const brSelect = document.getElementById('risk-br');
    const selectedOption = brSelect.options[brSelect.selectedIndex];
    const br = selectedOption ? selectedOption.value : '';
    const km = parseFloat(document.getElementById('risk-km').value);
    const hour = document.getElementById('risk-hour').value;
    const weather = document.getElementById('risk-weather').value;
    const useML = document.getElementById('use-ml-model').checked;

    // Validate required fields
    if (!uf || !br || !km) {
      this.showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    const btn = document.getElementById('check-risk-btn');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando...';

    const startTime = Date.now();

    try {
      const requestBody = {
        uf,
        br,
        km,
        hour: hour ? parseInt(hour) : new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        weatherCondition: weather || undefined,
        useRealTimeML: useML
      };

      const response = await fetch(`${window.API_BASE_URL}/risk/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      const elapsed = Date.now() - startTime;

      if (data.success) {
        this.displayRiskResult(data.data, elapsed);
        this.showNotification('✅ Análise de risco concluída!', 'success');
      } else {
        this.showNotification('Erro ao consultar risco: ' + (data.error || 'Erro desconhecido'), 'error');
      }
    } catch (error) {
      console.error('Erro ao consultar risco:', error);
      this.showNotification('Erro de conexão com o servidor', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }

  /**
   * Display risk prediction results
   */
  displayRiskResult(data, elapsed) {
    const resultDiv = document.getElementById('risk-result');
    resultDiv.style.display = 'block';

    // Animate score update
    const scoreValue = document.getElementById('risk-score-value');
    this.animateNumber(scoreValue, 0, data.risk_score, 800);

    // Update circle color
    const scoreCircle = document.getElementById('risk-score-circle');
    scoreCircle.className = `score-circle risk-${data.risk_level}`;

    // Update risk level badge
    const badges = {
      baixo: { icon: '✅', text: 'Risco Baixo', class: 'success' },
      moderado: { icon: '⚡', text: 'Risco Moderado', class: 'warning' },
      alto: { icon: '⚠️', text: 'Risco Alto', class: 'danger' },
      critico: { icon: '🚨', text: 'Risco Crítico', class: 'critical' }
    };

    const badge = badges[data.risk_level] || badges.moderado;
    const badgeEl = document.getElementById('risk-level-badge');
    badgeEl.className = `risk-level-badge badge-${badge.class}`;
    badgeEl.innerHTML = `${badge.icon} ${badge.text}`;

    // Update meta information
    const sourceIcon = data.prediction_source === 'ml_realtime' ? 
      '<i class="fas fa-brain"></i>' : 
      '<i class="fas fa-database"></i>';
    const sourceText = data.prediction_source === 'ml_realtime' ? 
      'Modelo ML' : 
      'Cache Pré-calculado';
    
    document.getElementById('prediction-source').innerHTML = 
      `${sourceIcon} ${sourceText}`;
    document.getElementById('prediction-time').innerHTML = 
      `<i class="fas fa-clock"></i> ${elapsed}ms`;
    document.getElementById('segment-key').innerHTML = 
      `<i class="fas fa-map-marker-alt"></i> ${data.segment_key || 'N/A'}`;

    // Mostrar fonte da condição climática
    const weatherStatus = document.getElementById('weather-status');
    if (data.weather_source === 'real_time_api') {
      weatherStatus.innerHTML = `✅ Clima atual detectado: ${data.weather_used}`;
      weatherStatus.style.color = 'var(--success-color)';
    } else if (data.weather_source === 'fallback') {
      weatherStatus.innerHTML = `⚠️ Clima padrão (API indisponível)`;
      weatherStatus.style.color = 'var(--warning-color)';
    } else {
      weatherStatus.innerHTML = `📝 Condição climática selecionada`;
      weatherStatus.style.color = 'var(--text-secondary)';
    }

    // Update recommendations
    const recsEl = document.getElementById('risk-recommendations');
    if (data.recommendations && data.recommendations.length > 0) {
      recsEl.innerHTML = `
        <h4><i class="fas fa-lightbulb"></i> Recomendações:</h4>
        <ul>
          ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      `;
    } else {
      recsEl.innerHTML = '<p>Sem recomendações específicas.</p>';
    }

    // Update ML probabilities (if available)
    const probDiv = document.getElementById('ml-probabilities');
    if (data.class_probabilities) {
      probDiv.style.display = 'block';
      
      const probs = data.class_probabilities;
      this.updateProbabilityBar('sem-vitimas', probs.sem_vitimas);
      this.updateProbabilityBar('com-feridos', probs.com_feridos);
      this.updateProbabilityBar('com-mortos', probs.com_mortos);
    } else {
      probDiv.style.display = 'none';
    }

    // Smooth scroll to result
    setTimeout(() => {
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  /**
   * Update probability bar animation
   */
  updateProbabilityBar(type, value) {
    const fill = document.getElementById(`prob-${type}`);
    const val = document.getElementById(`prob-${type}-val`);
    
    if (fill && val) {
      setTimeout(() => {
        fill.style.width = `${value}%`;
      }, 50);
      val.textContent = `${value.toFixed(1)}%`;
    }
  }

  /**
   * Animate number from start to end
   */
  animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = current.toFixed(1);
    }, 16);
  }

  // ============================================================================
  // NOVAS FUNÇÕES PARA ATUALIZAÇÃO DE GRÁFICOS
  // ============================================================================

  /**
   * Atualiza o gráfico de distribuição de risco com dados reais
   */
  async updateRiskDistributionChart() {
    try {
      // 1. Buscar cargas ativas
      const shipmentsResponse = await fetch(`${window.API_BASE_URL}/simulator/active`);
      const shipmentsData = await shipmentsResponse.json();
      
      if (!shipmentsData.success) return;
      
      // 2. Calcular distribuição de risco
      const riskCounts = { baixo: 0, moderado: 0, alto: 0, critico: 0 };
      
      for (const shipment of shipmentsData.data.shipments) {
        const score = shipment.risk_score || 0;
        
        if (score >= 80) riskCounts.critico++;
        else if (score >= 60) riskCounts.alto++;
        else if (score >= 40) riskCounts.moderado++;
        else riskCounts.baixo++;
      }
      
      // 3. Atualizar gráfico
      if (this.charts.riskDistribution) {
        this.charts.riskDistribution.data.datasets[0].data = [
          riskCounts.baixo,
          riskCounts.moderado,
          riskCounts.alto,
          riskCounts.critico
        ];
        this.charts.riskDistribution.update('none');
      }
      
      // 4. Atualizar badge de status
      this.updateRiskStatusBadge(riskCounts);
      
    } catch (error) {
      console.error('Error updating risk distribution:', error);
    }
  }

  /**
   * Atualiza o gráfico de rodovias perigosas com dados do ML
   */
  async updateDangerousHighwaysChart() {
    try {
      // Buscar segmentos de alto risco
      const response = await fetch(`${window.API_BASE_URL}/risk/high-risk-segments?limit=5`);
      const data = await response.json();
      
      if (!data.success) return;
      
      // Preparar dados para o gráfico
      const labels = [];
      const scores = [];
      
      data.data.segments.slice(0, 5).forEach(segment => {
        labels.push(`${segment.uf}-BR${segment.br} KM ${segment.km}`);
        scores.push(segment.avg_risk_score);
      });
      
      // Atualizar gráfico
      if (this.charts.dangerousHighways) {
        this.charts.dangerousHighways.data.labels = labels;
        this.charts.dangerousHighways.data.datasets[0].data = scores;
        this.charts.dangerousHighways.update('none');
      }
      
      // Atualizar badge de status
      this.updateHighwaysStatusBadge(data.data.segments.length);
      
    } catch (error) {
      console.error('Error updating dangerous highways chart:', error);
    }
  }

  /**
   * Atualiza o badge de status do gráfico de risco
   */
  updateRiskStatusBadge(riskCounts) {
    const badge = document.getElementById('risk-status-badge');
    if (!badge) return;
    
    const total = riskCounts.baixo + riskCounts.moderado + riskCounts.alto + riskCounts.critico;
    const criticalPercentage = total > 0 ? (riskCounts.critico / total) * 100 : 0;
    
    const icon = badge.querySelector('i');
    const text = badge.querySelector('span');
    
    if (criticalPercentage > 20) {
      icon.style.color = '#dc2626'; // Vermelho para muitos críticos
      text.textContent = 'Alerta';
    } else if (criticalPercentage > 10) {
      icon.style.color = '#f97316'; // Laranja para alguns críticos
      text.textContent = 'Atenção';
    } else {
      icon.style.color = '#10b981'; // Verde para baixo risco
      text.textContent = 'Normal';
    }
  }

  /**
   * Atualiza o badge de status do gráfico de rodovias
   */
  updateHighwaysStatusBadge(segmentCount) {
    const badge = document.getElementById('highways-status-badge');
    if (!badge) return;
    
    const icon = badge.querySelector('i');
    const text = badge.querySelector('span');
    
    if (segmentCount >= 5) {
      icon.style.color = '#dc2626'; // Vermelho para muitos segmentos críticos
      text.textContent = 'Crítico';
    } else if (segmentCount >= 3) {
      icon.style.color = '#f97316'; // Laranja para alguns segmentos críticos
      text.textContent = 'Alto';
    } else {
      icon.style.color = '#10b981'; // Verde para poucos segmentos críticos
      text.textContent = 'Baixo';
    }
  }

  /**
   * Função global para atualizar gráficos de risco (chamada pelos botões)
   */
  async updateRiskCharts() {
    const btn = document.querySelector('.refresh-btn');
    if (btn) {
      btn.classList.add('rotating');
    }
    
    try {
      await Promise.all([
        this.updateRiskDistributionChart(),
        this.updateDangerousHighwaysChart()
      ]);
      
      this.showNotification('Gráficos atualizados com sucesso!', 'success');
    } catch (error) {
      this.showNotification('Erro ao atualizar gráficos', 'error');
    } finally {
      if (btn) {
        setTimeout(() => btn.classList.remove('rotating'), 1000);
      }
    }
  }

  /**
   * Função global para atualizar apenas gráfico de rodovias
   */
  async updateHighwaysChart() {
    const btn = document.querySelector('[onclick="updateHighwaysChart()"]');
    if (btn) {
      btn.classList.add('rotating');
    }
    
    try {
      await this.updateDangerousHighwaysChart();
      this.showNotification('Gráfico de rodovias atualizado!', 'success');
    } catch (error) {
      this.showNotification('Erro ao atualizar gráfico de rodovias', 'error');
    } finally {
      if (btn) {
        setTimeout(() => btn.classList.remove('rotating'), 1000);
      }
    }
  }
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

// Funções globais para os botões HTML
window.updateRiskCharts = function() {
  if (window.sompoApp) {
    window.sompoApp.updateRiskCharts();
  }
};

window.updateHighwaysChart = function() {
  if (window.sompoApp) {
    window.sompoApp.updateHighwaysChart();
  }
};

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
