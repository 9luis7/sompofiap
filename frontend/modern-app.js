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
    this.setupAnimations();
    
    // Setup user dropdown after a delay to ensure DOM is ready
    setTimeout(() => {
      this.setupUserDropdown();
    }, 1000);
  }

  setupEventListeners() {
    // Helper function to close all open nav items
    const closeAllNavItems = () => {
      document.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
    };

    // Map shipments compact toggle
    const mapShipmentsToggle = document.getElementById('map-shipments-toggle');
    if (mapShipmentsToggle) {
      mapShipmentsToggle.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const panel = document.getElementById('map-shipments-panel');
        const isOpen = panel.style.display !== 'none';

        if (isOpen) {
          panel.style.display = 'none';
          mapShipmentsToggle.classList.remove('active');
        } else {
          panel.style.display = 'block';
          mapShipmentsToggle.classList.add('active');
        }
      });
    }

    // Close panel when clicking outside
    document.addEventListener('click', e => {
      const compactPanel = document.querySelector('.map-shipments-compact');
      const toggle = document.getElementById('map-shipments-toggle');
      const panel = document.getElementById('map-shipments-panel');

      if (compactPanel && !compactPanel.contains(e.target) && panel.style.display !== 'none') {
        panel.style.display = 'none';
        toggle.classList.remove('active');
      }
    });

    // Roadmap functionality
    const roadmapTrigger = document.getElementById('roadmap-trigger');
    const roadmapSection = document.getElementById('roadmap-section');
    const roadmapClose = document.getElementById('roadmap-close');

    if (roadmapTrigger && roadmapSection) {
      roadmapTrigger.addEventListener('click', e => {
        e.preventDefault();
        roadmapSection.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    }

    if (roadmapClose && roadmapSection) {
      roadmapClose.addEventListener('click', e => {
        e.preventDefault();
        roadmapSection.style.display = 'none';
        document.body.style.overflow = '';
      });
    }

    // Close roadmap when clicking outside
    if (roadmapSection) {
      roadmapSection.addEventListener('click', e => {
        if (e.target === roadmapSection) {
          roadmapSection.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Close roadmap with Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && roadmapSection && roadmapSection.style.display === 'flex') {
        roadmapSection.style.display = 'none';
        document.body.style.overflow = '';
      }
    });

    // FAQ functionality
    const faqTrigger = document.getElementById('faq-trigger');
    const faqSection = document.getElementById('faq-section');
    const faqClose = document.getElementById('faq-close');

    if (faqTrigger && faqSection) {
      faqTrigger.addEventListener('click', e => {
        e.preventDefault();
        faqSection.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    }

    if (faqClose && faqSection) {
      faqClose.addEventListener('click', e => {
        e.preventDefault();
        faqSection.style.display = 'none';
        document.body.style.overflow = '';
      });
    }

    // Close FAQ when clicking outside
    if (faqSection) {
      faqSection.addEventListener('click', e => {
        if (e.target === faqSection) {
          faqSection.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }

    // Close FAQ with Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && faqSection && faqSection.style.display === 'flex') {
        faqSection.style.display = 'none';
        document.body.style.overflow = '';
      }
    });

    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Botão de login - removido event listener duplicado (já tem onclick no HTML)

    // Theme toggle button
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

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
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    }
  }

  setupNavigation() {
    // Initialize navigation state
    this.updateNavigationState();
  }

  setupAnimations() {
    // Add enhanced hover effects to existing cards
    setTimeout(() => {
      // Add glassmorphism to existing cards
      document.querySelectorAll('.card, .metric-card, .chart-card').forEach(card => {
        card.classList.add('glass-card');
      });

      // Add hover effects to buttons
      document.querySelectorAll('button, .btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px)';
          btn.style.transition = 'all 0.3s ease';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
        });
      });

      // Add floating animation to some elements
      document.querySelectorAll('.logo, .icon').forEach(el => {
        el.classList.add('float-animation');
      });

          // Add glow effect to primary elements
    document.querySelectorAll('.primary, .btn-primary').forEach(el => {
      el.classList.add('glow-animation');
    });

    // Setup logout button (removed - handled in setupUserDropdown)
  }, 1000);
}

handleLogout() {
  // Show confirmation dialog
  if (confirm('Tem certeza que deseja sair do sistema?')) {
    // Clear user data
    this.currentUser = null;
    localStorage.removeItem('sompo-auth-token');
    localStorage.removeItem('sompo-user-data');
    
    // Show logout notification
    this.showNotification('Logout realizado com sucesso!', 'success');
    
    // Redirect to login after a short delay
    setTimeout(() => {
      this.showScreen('login');
    }, 1500);
  }
}

showScreen(screenName) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(`${screenName}-screen`);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

setupUserDropdown() {
  const userMenu = document.getElementById('user-menu');
  const dropdown = document.getElementById('user-dropdown');
  const logoutItem = document.getElementById('logout-item');
  
  // Setup user dropdown when elements exist
  
  if (!userMenu || !dropdown || !logoutItem) {
    // Elements not found; dropdown won't be initialized on this view
    return;
  }
  
  // Toggle dropdown
  userMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    // Toggle dropdown visibility
    userMenu.classList.toggle('active');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!userMenu.contains(e.target)) {
      userMenu.classList.remove('active');
    }
  });
  
  // Handle logout
  logoutItem.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Logout action from dropdown
    userMenu.classList.remove('active');
    this.handleLogout();
  });
  
  // Handle other dropdown items
  const profileItem = document.getElementById('profile-item');
  const settingsItem = document.getElementById('settings-item');
  
  if (profileItem) {
    profileItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      userMenu.classList.remove('active');
      this.showNotification('Funcionalidade de perfil em desenvolvimento', 'info');
    });
  }
  
  if (settingsItem) {
    settingsItem.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      userMenu.classList.remove('active');
      this.showNotification('Funcionalidade de configurações em desenvolvimento', 'info');
    });
  }
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
    try {
      // TODO: Conectar com API real de autenticação
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return {
          success: false,
          message: 'Credenciais inválidas',
        };
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
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
      // Autostart do tour após login, apenas na primeira vez
      const cfg = (window.CONFIG && window.CONFIG.TOUR) || {};
      const seen = sessionStorage.getItem('sompo-tour-seen');
      if (cfg.ENABLED && cfg.AUTOSTART && !seen) {
        setTimeout(() => this.startTour(), 600);
        sessionStorage.setItem('sompo-tour-seen', '1');
      }
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

    // Load real data from backend API
    this.loadRealDataFromBackend();
    this.initializeCharts();
    this.initMiniMap();

    // Guided Tour
    this.setupGuidedTour();
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
    // Initialize metric state from current UI
    this.initializeMetricsFromUI();

    // Demo Mode controls
    this._demoPaused = !(window.CONFIG && window.CONFIG.DEMO && window.CONFIG.DEMO.AUTOPLAY);
    document.addEventListener('keydown', e => {
      if ((e.key === 'p' || e.key === 'P') && (e.ctrlKey || e.metaKey)) {
        this._demoPaused = !this._demoPaused;
        const state = this._demoPaused ? 'pausado' : 'retomado';
        this.showNotification(`Modo demo ${state} (Ctrl+P)`, 'info');
      }
    });

    // Start independent, staggered update loops for each metric (natural, não simultâneo)
    setTimeout(() => this.startShipmentsLoop(), this.getStaggerDelay('shipments'));
    setTimeout(() => this.startAlertsLoop(), this.getStaggerDelay('alerts'));
    setTimeout(() => this.startSecurityLoop(), this.getStaggerDelay('security'));
    setTimeout(() => this.startKmLoop(), this.getStaggerDelay('km'));
  }

  getStaggerDelay(name) {
    const cfg = (window.CONFIG && window.CONFIG.DEMO) || {};
    const min = cfg.STAGGER_MIN_MS || 300;
    const max = cfg.STAGGER_MAX_MS || 1800;
    const base = min + Math.random() * Math.max(0, max - min);
    const multipliers = { shipments: 1.0, alerts: 1.2, security: 1.5, km: 0.8 };
    return Math.round(base * (multipliers[name] || 1));
  }

  initializeMetricsFromUI() {
    const getNumber = sel => {
      const el = document.querySelector(sel);
      if (!el) {
        return 0;
      }
      const t = (el.textContent || '').replace(/[^0-9.]/g, '');
      return parseFloat(t || '0');
    };

    this.metrics = {
      shipments: getNumber('[data-metric="shipments"]') || 0,
      alerts: getNumber('[data-metric="alerts"]') || 0,
      km: getNumber('[data-metric="km"]') || 0,
      security: getNumber('[data-metric="security"]') || 99.5,
    };

    // Baseline distribution
    this.metricsDist = this.computeStatusDistribution(this.metrics.shipments);
  }

  // Compute load status buckets from a total count
  computeStatusDistribution(totalShipments) {
    const loading = Math.floor(totalShipments * 0.12);
    const stopped = Math.floor(totalShipments * 0.06);
    const inTransit = Math.max(0, totalShipments - loading - stopped);
    return { inTransit, loading, stopped };
  }

  // Count shipment statuses from current dataset
  countStatusFromDataset() {
    const counts = { inTransit: 0, loading: 0, stopped: 0 };
    if (this.demoData && Array.isArray(this.demoData.shipments)) {
      this.demoData.shipments.forEach(s => {
        if (s.status === 'in_transit') counts.inTransit += 1;
        else if (s.status === 'loading') counts.loading += 1;
        else counts.stopped += 1;
      });
    }
    return counts;
  }

  // Active shipments are those not stopped
  getActiveShipments() {
    return (this.demoData.shipments || []).filter(s => s.status !== 'stopped');
  }

  // Align dashboard metrics to dataset values (keeps numbers coherent with lists)
  syncMetricsToDataset() {
    const activeCount = this.getActiveShipments().length;
    const alertsCount = (this.demoData.alerts || []).length;
    const status = this.countStatusFromDataset();

    this.metrics.shipments = activeCount;
    this.animateMetricTo('shipments', activeCount);

    this.metrics.alerts = alertsCount;
    this.animateMetricTo('alerts', alertsCount);

    // Derive security from current alerts/shipments ratio
    const ratio = activeCount > 0 ? alertsCount / activeCount : 0;
    const security = Math.max(96.5, Math.min(99.9, 100 - ratio * 120));
    this.metrics.security = security;
    this.animateMetricTo('security', security);

    // Update internal distribution for charts and km
    this.metricsDist = { inTransit: status.inTransit, loading: status.loading, stopped: status.stopped };

    // Refresh charts to reflect exact dataset
    this.updateChartsWithCurrentStats();
  }

  // Animates metric number changes with formatting per-metric
  animateMetricTo(metricName, newValue) {
    const el = document.querySelector(`[data-metric="${metricName}"]`);
    if (!el) {
      return;
    }

    const currentText = el.textContent || '';
    const parse = txt => parseFloat((txt || '').replace(/[^0-9.]/g, '') || '0');
    const from = parse(currentText);
    const to = newValue;
    const start = performance.now();
    const duration = 650;

    const format = (name, val) => {
      if (name === 'security') {
        return `${val.toFixed(1)}%`;
      }
      const intVal = Math.round(val);
      return intVal.toLocaleString('en-US');
    };

    const step = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
      const val = from + (to - from) * eased;
      el.textContent = format(metricName, metricName === 'security' ? val : Math.max(0, val));
      if (t < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  startShipmentsLoop() {
    const tick = () => {
      if (this._demoPaused) {
        this._shipmentsTimer = setTimeout(tick, 1000);
        return;
      }
      const base = this.getActiveShipments().length;
      const jitter = Math.round((Math.random() - 0.5) * 6); // small +-3 jitter
      const target = Math.max(0, base + jitter);
      this.metrics.shipments = target;
      const status = this.countStatusFromDataset();
      this.metricsDist = { inTransit: status.inTransit, loading: status.loading, stopped: status.stopped };
      this.animateMetricTo('shipments', this.metrics.shipments);
      this.updateChartsWithCurrentStats();
      const cfg = (window.CONFIG && window.CONFIG.DEMO) || {};
      const min = cfg.SHIPMENTS_MIN_MS || 3000;
      const max = cfg.SHIPMENTS_MAX_MS || 7000;
      const next = min + Math.random() * Math.max(0, max - min);
      this._shipmentsTimer = setTimeout(tick, next);
    };
    tick();
  }

  startAlertsLoop() {
    const tick = () => {
      if (this._demoPaused) {
        this._alertsTimer = setTimeout(tick, 1000);
        return;
      }
      const base = (this.demoData.alerts || []).length;
      const jitter = Math.round((Math.random() - 0.5) * 4); // small +-2 jitter
      const target = Math.max(0, base + jitter);
      this.metrics.alerts = target;
      this.animateMetricTo('alerts', this.metrics.alerts);
      // keep chart bars subtly refreshed
      this.updateChartsWithCurrentStats();
      const cfg = (window.CONFIG && window.CONFIG.DEMO) || {};
      const min = cfg.ALERTS_MIN_MS || 4500;
      const max = cfg.ALERTS_MAX_MS || 8000;
      const next = min + Math.random() * Math.max(0, max - min);
      this._alertsTimer = setTimeout(tick, next);
    };
    tick();
  }

  startSecurityLoop() {
    const tick = () => {
      if (this._demoPaused) {
        this._securityTimer = setTimeout(tick, 1000);
        return;
      }
      const ratio = this.metrics.shipments > 0 ? this.metrics.alerts / this.metrics.shipments : 0;
      let target = 100 - ratio * 120; // more alerts => lower security
      target += (Math.random() - 0.5) * 0.4; // jitter +-0.2
      target = Math.max(96.5, Math.min(99.9, target));
      this.metrics.security = target;
      this.animateMetricTo('security', this.metrics.security);
      const cfg = (window.CONFIG && window.CONFIG.DEMO) || {};
      const min = cfg.SECURITY_MIN_MS || 5500;
      const max = cfg.SECURITY_MAX_MS || 10000;
      const next = min + Math.random() * Math.max(0, max - min);
      this._securityTimer = setTimeout(tick, next);
    };
    tick();
  }

  startKmLoop() {
    // Incremental per-second accumulation correlated with shipments in transit
    const tick = () => {
      if (this._demoPaused) {
        this._kmTimer = setTimeout(tick, 1000);
        return;
      }
      const inTransit = this.metricsDist.inTransit || this.countStatusFromDataset().inTransit;
      const perShipmentPerSec = 0.0008; // km per shipment per second (synthetic)
      const jitter = 0.6 + Math.random() * 0.8; // 0.6..1.4x
      const delta = inTransit * perShipmentPerSec * jitter;
      this.metrics.km = Math.max(0, this.metrics.km + delta);
      this.animateMetricTo('km', this.metrics.km);
      const cfg = (window.CONFIG && window.CONFIG.DEMO) || {};
      const interval = cfg.KM_INTERVAL_MS || 1000;
      this._kmTimer = setTimeout(tick, interval);
    };
    tick();
  }

  updateChartsWithCurrentStats() {
    // Use precise counts from dataset
    const status = this.countStatusFromDataset();
    const inTransit = status.inTransit;
    const baseLoading = status.loading;
    const baseStopped = status.stopped;
    if (this.charts.status) {
      this.charts.status.data.datasets[0].data = [inTransit, baseLoading, baseStopped];
      this.charts.status.update('none');
    }
    if (this.charts.alerts) {
      const regions = this.charts.alerts.data.labels || ['SP', 'RJ', 'MG'];
      const totalAlerts = this.metrics && this.metrics.alerts ? this.metrics.alerts : 0;
      // Prefer proportional scaling from demo dataset when available
      let baseCounts = [];
      if (this.demoData && Array.isArray(this.demoData.alerts) && this.demoData.alerts.length) {
        baseCounts = this.countAlertsByRegion(regions);
      }
      const sumBase = baseCounts.reduce((a, b) => a + b, 0);
      let regData;
      if (sumBase > 0 && totalAlerts > 0) {
        // Scale base distribution to match totalAlerts
        const scale = totalAlerts / sumBase;
        const floats = baseCounts.map(v => v * scale);
        // Round while preserving sum
        regData = floats.map(v => Math.floor(v));
        let remaining = totalAlerts - regData.reduce((a, b) => a + b, 0);
        for (let i = 0; i < regData.length && remaining > 0; i++) {
          regData[i] += 1;
          remaining--;
        }
      } else {
        // Even split fallback
        const base = Math.floor(totalAlerts / regions.length);
        regData = regions.map((_, i) => base + (i < totalAlerts % regions.length ? 1 : 0));
      }
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
            labels: ['Em trânsito', 'Preparação', 'Parado'],
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
            onClick: (evt, els) => {
              if (!els.length) {
                return;
              }
              const idx = els[0].index; // 0=inTransit,1=loading,2=stopped
              const key = idx === 0 ? 'in_transit' : idx === 1 ? 'loading' : 'stopped';
              this.highlightShipmentsOnMap(key);
              this.renderStatusDetails(key);
            },
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
                      Preparação (${baseLoading})
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
    // Click handler já configurado diretamente no Chart acima
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

  // Carrega dados reais do backend
  async loadRealDataFromBackend() {
    try {
      // Carregar dados de diferentes endpoints em paralelo
      const [shipmentsResponse, alertsResponse, vehiclesResponse, dashboardResponse] = await Promise.all([
        fetch('/api/v1/shipments').catch(() => ({ json: () => Promise.resolve({ data: { shipments: [] } }) })),
        fetch('/api/v1/alerts').catch(() => ({ json: () => Promise.resolve({ data: { alerts: [] } }) })),
        fetch('/api/v1/vehicles').catch(() => ({ json: () => Promise.resolve({ data: { vehicles: [] } }) })),
        fetch('/api/v1/monitoring/dashboard').catch(() => ({ json: () => Promise.resolve({ data: { summary: {} } }) }))
      ]);

      // Processar respostas
      const shipmentsData = await shipmentsResponse.json();
      const alertsData = await alertsResponse.json();
      const vehiclesData = await vehiclesResponse.json();
      const dashboardData = await dashboardResponse.json();

      // Atualizar dados locais
      this.demoData.shipments = shipmentsData.data?.shipments || [];
      this.demoData.alerts = alertsData.data?.alerts || [];
      this.demoData.vehicles = vehiclesData.data?.vehicles || [];
      this.dashboardData = dashboardData.data || {};

      // Sincronizar métricas com dados reais
      this.syncMetricsToDataset();

      console.log('Dados carregados do backend:', {
        shipments: this.demoData.shipments.length,
        alerts: this.demoData.alerts.length,
        vehicles: this.demoData.vehicles.length
      });

    } catch (error) {
      console.error('Erro ao carregar dados do backend:', error);
      // Manter arrays vazios em caso de erro
      this.demoData.shipments = [];
      this.demoData.alerts = [];
      this.demoData.vehicles = [];
    }
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

    // Update count display
    const countDisplay = document.getElementById('shipments-count');
    if (countDisplay) {
      const count = top.length;
      countDisplay.textContent = `${count} carga${count !== 1 ? 's' : ''}`;
    }

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
    const mapStatus = { in_transit: 'Em trânsito', loading: 'Preparação', stopped: 'Parado' };
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
    this.updateSectionContent(section).catch(error => {
      console.error('Erro ao carregar conteúdo da seção:', error);
    });
  }

  async updateSectionContent(section) {
    switch (section) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'shipments':
        await this.loadShipmentsData();
        break;
      case 'vehicles':
        await this.loadVehiclesData();
        break;
      case 'alerts':
        await this.loadAlertsData();
        break;
      case 'map':
        this.loadMapData();
        break;
    }
  }

  loadDashboardData() {
    // Dashboard data loaded from backend in loadRealDataFromBackend()
    // Refresh data periodically
    setTimeout(() => this.loadRealDataFromBackend(), 30000); // Refresh every 30 seconds
  }

  async loadShipmentsData() {
    const list = document.getElementById('shipments-list');
    if (!list) {
      return;
    }
    
    // Recarregar dados do backend
    await this.loadRealDataFromBackend();
    
    // Mostrar somente cargas ativas (exclui paradas) e atualizar contagem
    const items = this.getActiveShipments().slice(0, 60);
    this.metrics.shipments = this.getActiveShipments().length;
    this.animateMetricTo('shipments', this.metrics.shipments);
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

  async loadVehiclesData() {
    const list = document.getElementById('vehicles-list');
    if (!list) {
      return;
    }
    
    // Recarregar dados do backend
    await this.loadRealDataFromBackend();
    
    const vehicles = {};
    // base vehicles from dataset
    this.demoData.vehicles.forEach(v => {
      vehicles[v.plate || v.license_plate] = { 
        plate: v.plate || v.license_plate, 
        lastCity: v.cityUF || v.current_location, 
        status: v.status || 'available', 
        count: 0 
      };
    });
    
    // attach shipments to vehicles deterministically
    this.demoData.shipments.forEach(s => {
      const vIdx = s.id % Math.max(1, this.demoData.vehicles.length);
      const vehicle = this.demoData.vehicles[vIdx];
      const plate = vehicle?.plate || vehicle?.license_plate;
      if (!vehicles[plate]) {
        vehicles[plate] = { 
          plate, 
          lastCity: s.originAddress, 
          status: s.status, 
          count: 0 
        };
      }
      vehicles[plate].count += 1;
      vehicles[plate].status = s.status;
      vehicles[plate].lastCity = s.originAddress;
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

  async loadAlertsData() {
    const list = document.getElementById('alerts-list');
    if (!list) {
      return;
    }
    
    // Recarregar dados do backend
    await this.loadRealDataFromBackend();
    
    // Lista dinâmica: todos os alertas atuais e sincroniza contagem do dashboard
    const items = (this.demoData.alerts || []).slice(0, 100);
    this.metrics.alerts = (this.demoData.alerts || []).length;
    this.animateMetricTo('alerts', this.metrics.alerts);
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

  setTheme(theme) {
    this.isDarkMode = theme === 'dark';
    this.applyTheme();
    localStorage.setItem('sompo-theme', theme);
  }

  applyTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#theme-toggle-btn i');

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

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', this.isDarkMode ? '#0f172a' : '#3b82f6');
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
        `;

    // Add to page
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-hide after 3 seconds (reduced from 5)
    const autoHideTimer = setTimeout(() => {
      this.hideNotification(notification);
    }, 3000);

    // Click anywhere on notification to close immediately
    notification.addEventListener('click', () => {
      clearTimeout(autoHideTimer);
      this.hideNotification(notification);
    });

    // Add hover effect to indicate it's clickable
    notification.style.cursor = 'pointer';
    notification.title = 'Clique para fechar';
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
  setupGuidedTour() {
    const cfg = (window.CONFIG && window.CONFIG.TOUR) || {};
    if (!cfg.ENABLED) {
      return;
    }

    // Autostart only once per session
    const hasSeen = sessionStorage.getItem('sompo-tour-seen');
    if (cfg.AUTOSTART && !hasSeen) {
      setTimeout(() => this.startTour(), 600);
      sessionStorage.setItem('sompo-tour-seen', '1');
    }
    // Inject button in navbar actions if exists
    try {
      const actions = document.querySelector('.nav-actions');
      if (actions && !actions.querySelector('.tour-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn-icon tour-btn';
        btn.title = 'Reiniciar tour (Ctrl+T)';
        btn.innerHTML = '<i class="fas fa-route"></i>';
        btn.addEventListener('click', () => this.startTour());
        actions.insertBefore(btn, actions.firstChild);
      }
    } catch (_) {
      void 0;
    }
    // Reiniciar tour via atalho
    document.addEventListener('keydown', e => {
      if ((e.key === 't' || e.key === 'T') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        this.startTour();
      }
    });
  }

  startTour() {
    const cfg = (window.CONFIG && window.CONFIG.TOUR) || {};
    const steps = Array.isArray(cfg.STEPS) ? cfg.STEPS : [];
    if (!steps.length) {
      return;
    }

    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'tour-overlay';
    overlay.innerHTML = `
      <div class="tour-backdrop"></div>
      <div class="tour-popover">
        <div class="tour-header">
          <div class="tour-title"></div>
          <button class="tour-close"><i class="fas fa-times"></i></button>
        </div>
        <div class="tour-body"></div>
        <div class="tour-footer">
          <button class="tour-prev">Voltar</button>
          <div class="tour-steps"></div>
          <button class="tour-next">Próximo</button>
        </div>
      </div>`;
    // Lock scrolling and interactions outside
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);

    const state = { idx: 0 };
    const q = sel => overlay.querySelector(sel);
    const titleEl = q('.tour-title');
    const bodyEl = q('.tour-body');
    const stepsEl = q('.tour-steps');
    const pop = q('.tour-popover');

    const highlight = document.createElement('div');
    highlight.className = 'tour-highlight';
    overlay.appendChild(highlight);

    const renderDots = () => {
      stepsEl.innerHTML = steps
        .map((_, i) => `<span class="dot ${i === state.idx ? 'active' : ''}"></span>`)
        .join('');
    };

    const placePopover = target => {
      const rect = target.getBoundingClientRect();
      // Highlight box
      highlight.style.left = rect.left + 'px';
      highlight.style.top = rect.top + 'px';
      highlight.style.width = rect.width + 'px';
      highlight.style.height = rect.height + 'px';
      // Popover positioning - better placement
      const prefersAbove = rect.bottom + 220 > window.innerHeight;
      const prefersRight = rect.left + 400 < window.innerWidth;
      
      if (prefersRight && rect.right + 320 < window.innerWidth) {
        // Position to the right
        pop.style.left = (rect.right + 20) + 'px';
        pop.style.top = Math.max(20, rect.top - 50) + 'px';
      } else if (rect.left - 320 > 0) {
        // Position to the left
        pop.style.left = (rect.left - 320) + 'px';
        pop.style.top = Math.max(20, rect.top - 50) + 'px';
      } else {
        // Default positioning (above or below)
        pop.style.left = Math.max(20, Math.min(rect.left, window.innerWidth - 400)) + 'px';
        pop.style.top = (prefersAbove ? rect.top - 180 : rect.bottom + 20) + 'px';
      }
    };

    const ensureVisible = target => {
      if (!target) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const fullyVisible = rect.top >= 64 && rect.bottom <= window.innerHeight - 24;
      if (!fullyVisible) {
        const absoluteY = rect.top + window.scrollY;
        const center = absoluteY - (window.innerHeight / 2 - Math.min(180, rect.height / 2));
        try {
          window.scrollTo({ top: Math.max(0, center), behavior: 'smooth' });
        } catch (_) {
          window.scrollTo(0, Math.max(0, center));
        }
      }
    };

    const showStep = idx => {
      state.idx = Math.max(0, Math.min(steps.length - 1, idx));
      const step = steps[state.idx];
      if (step && step.navigateTo) {
        try {
          this.navigateToSection(step.navigateTo);
        } catch (_) {
          void 0;
        }
      }
      const target = document.querySelector(step.selector);
      titleEl.textContent = step.title || '';
      bodyEl.textContent = step.body || '';
      renderDots();
      if (target) {
        ensureVisible(target);
        // Place after potential scroll
        setTimeout(() => placePopover(target), 120);
      }

      // If step requires user action, arm the listener and disable next button
      const nextBtn = q('.tour-next');
      const prevBtn = q('.tour-prev');
      nextBtn.disabled = false;
      prevBtn.disabled = state.idx === 0;
      // Clean any previous guards
      overlay.querySelectorAll('[data-tour-guard]').forEach(el => el.remove());
      if (step.requireAction && step.requireAction === 'click' && target) {
        nextBtn.disabled = false; // Sempre habilitado para avanço manual
        // Visual hint overlay over the target to indicate click
        const hint = document.createElement('div');
        hint.setAttribute('data-tour-guard', '');
        hint.className = 'tour-hint';
        overlay.appendChild(hint);
        const rect = target.getBoundingClientRect();
        hint.style.left = rect.left + rect.width / 2 - 16 + 'px';
        hint.style.top = rect.top + rect.height / 2 - 16 + 'px';
        // Botão Próximo sempre habilitado para avanço manual
      }
    };

    const goNext = () => {
      if (state.idx < steps.length - 1) {
        showStep(state.idx + 1);
      } else {
        cleanup();
      }
    };
    const goPrev = () => showStep(state.idx - 1);
    q('.tour-next').addEventListener('click', goNext);
    q('.tour-prev').addEventListener('click', goPrev);
    const hardLock = !!(window.CONFIG && window.CONFIG.TOUR && window.CONFIG.TOUR.HARD_LOCK);
    const closeBtn = q('.tour-close');
    if (closeBtn) {
      if (hardLock) {
        closeBtn.style.display = 'none';
      } else {
        closeBtn.addEventListener('click', () => cleanup());
      }
    }
    // Não fechar ao clicar fora; pode travar a navegação se HARD_LOCK estiver ativo

    const onResize = () => showStep(state.idx);
    // Navegação por teclado e scroll do mouse
    const onKey = ev => {
      if (ev.key === 'ArrowRight' || ev.key === 'PageDown') {
        ev.preventDefault();
        goNext();
      } else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') {
        ev.preventDefault();
        goPrev();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        cleanup();
      }
    };
    const onWheel = ev => {
      if (Math.abs(ev.deltaY) < 8) return;
      if (ev.deltaY > 0) {
        goNext();
      } else {
        goPrev();
      }
      ev.preventDefault();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey, { capture: true });
    window.addEventListener('wheel', onWheel, { passive: false, capture: true });

    let cleanup = () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey, { capture: true });
      window.removeEventListener('wheel', onWheel, { capture: true });
      try {
        document.body.removeChild(overlay);
      } catch (_) {
        void 0;
      }
      document.body.style.overflow = prevOverflow || '';
    };

    // Se hard lock estiver ativo, bloquear interações fora do overlay
    if (hardLock) {
      const blockOutside = ev => {
        // Permitir cliques em elementos do tour e no gráfico ativo
        const isTourElement =
          overlay.contains(ev.target) ||
          ev.target.hasAttribute('data-tour-guard') ||
          ev.target.closest('[data-tour-guard]');

        // Permitir cliques no gráfico Chart.js (canvas) durante o tour
        const isChartElement =
          ev.target.tagName === 'CANVAS' &&
          (ev.target.closest('#chart-status') || ev.target.closest('#chart-alerts'));

        if (!isTourElement && !isChartElement) {
          ev.stopPropagation();
          ev.preventDefault();
        }
      };
      const blockKeys = ev => {
        const allowed = ['Enter', ' ', 'ArrowLeft', 'ArrowRight'];
        if (!allowed.includes(ev.key)) {
          ev.stopPropagation();
          ev.preventDefault();
        }
      };
      document.addEventListener('click', blockOutside, true);
      document.addEventListener('keydown', blockKeys, true);
      const prevCleanup = cleanup;
      // garantir remoção dos bloqueios
      cleanup = () => {
        document.removeEventListener('click', blockOutside, true);
        document.removeEventListener('keydown', blockKeys, true);
        prevCleanup();
      };
    }

    showStep(0);
  }
}

// Notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: var(--card-background);
        backdrop-filter: var(--glass-blur);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        padding: 0.75rem 1rem;
        box-shadow: var(--shadow-lg);
        z-index: 10001;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 350px;
        min-width: 250px;
        text-align: center;
        cursor: pointer;
        user-select: none;
    }
    
    .notification.show {
        transform: translateX(-50%) translateY(0);
    }
    
    .notification:hover {
        transform: translateX(-50%) translateY(-2px);
        box-shadow: 0 8px 25px rgb(0 0 0 / 15%);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: var(--text-primary);
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .notification-content i {
        font-size: 1rem;
    }
    
    .notification-success {
        border-left: 4px solid var(--success-color);
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, var(--card-background) 100%);
    }
    .notification-error {
        border-left: 4px solid var(--danger-color);
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, var(--card-background) 100%);
    }
    .notification-warning {
        border-left: 4px solid var(--warning-color);
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--card-background) 100%);
    }
    .notification-info {
        border-left: 4px solid var(--primary-color);
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, var(--card-background) 100%);
    }
    
    .notification-success .notification-content i { color: var(--success-color); }
    .notification-error .notification-content i { color: var(--danger-color); }
    .notification-warning .notification-content i { color: var(--warning-color); }
    .notification-info .notification-content i { color: var(--primary-color); }
    
    @keyframes slideInDown {
        from {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }

    /* Tour styles */
    .tour-overlay{position:fixed;inset:0;z-index:9998;pointer-events:auto}
    .tour-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.45)}
    .tour-highlight{position:absolute;border:2px solid var(--primary-color);border-radius:12px;box-shadow:0 0 0 20000px rgba(0,0,0,.45);transition:all .25s ease;pointer-events:none}
    .tour-popover{position:absolute;z-index:9999;background:var(--card-background);backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:16px;box-shadow:var(--glass-shadow);padding:20px;min-width:300px;max-width:400px}
    .tour-header{display:flex;justify-content:space-between;align-items:center;font-weight:600;color:var(--text-primary);margin-bottom:6px}
    .tour-body{color:var(--text-secondary);font-size:14px;margin-bottom:10px}
    .tour-footer{display:flex;justify-content:space-between;align-items:center}
    .tour-prev,.tour-next{background:var(--primary-color);color:#fff;border:none;border-radius:8px;padding:6px 10px;cursor:pointer}
    .tour-prev{background:#64748b}
    .tour-steps{display:flex;gap:6px}
    .tour-steps .dot{width:8px;height:8px;border-radius:50%;background:#94a3b8;display:inline-block}
    .tour-steps .dot.active{background:var(--primary-color)}
    .tour-hint{position:absolute;width:32px;height:32px;border-radius:50%;border:2px solid var(--primary-color);box-shadow:0 0 0 8px rgba(59,130,246,.25);animation:pulse 1.4s ease-in-out infinite}
    @keyframes pulse{0%{transform:scale(.9);opacity:.85}50%{transform:scale(1);opacity:1}100%{transform:scale(.9);opacity:.85}}
    .tour-hole{position:absolute;border-radius:12px;cursor:pointer;z-index:10000}
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
  window.app = app; // For React integration
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
