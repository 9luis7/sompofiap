// Configurações da aplicação frontend
const CONFIG = {
  // URL base da API (backend separado na porta 3001)
  API_BASE_URL: 'http://localhost:3001',
  API_VERSION: 'v1',

  // Endpoints da API
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/v1/auth/login',
      REGISTER: '/api/v1/auth/register',
      LOGOUT: '/api/v1/auth/logout',
      REFRESH_TOKEN: '/api/v1/auth/refresh-token',
      PROFILE: '/api/v1/auth/profile',
    },
    DASHBOARD: {
      DATA: '/api/v1/monitoring/dashboard',
      STATISTICS: '/api/v1/monitoring/statistics',
    },
    SHIPMENTS: {
      LIST: '/api/v1/shipments',
      DETAIL: id => `/api/v1/shipments/${id}`,
      CREATE: '/api/v1/shipments',
      UPDATE: id => `/api/v1/shipments/${id}`,
      DELETE: id => `/api/v1/shipments/${id}`,
      ROUTE: id => `/api/v1/shipments/${id}/route`,
      START: id => `/api/v1/shipments/${id}/start`,
      COMPLETE: id => `/api/v1/shipments/${id}/complete`,
      EMERGENCY: id => `/api/v1/shipments/${id}/emergency`,
    },
    MONITORING: {
      REAL_TIME: '/api/v1/monitoring/real-time',
      GPS: shipmentId => `/api/v1/monitoring/gps/${shipmentId}`,
      SENSORS: shipmentId => `/api/v1/monitoring/sensors/${shipmentId}`,
    },
    ALERTS: {
      LIST: '/api/v1/alerts',
      DETAIL: id => `/api/v1/alerts/${id}`,
      ACKNOWLEDGE: id => `/api/v1/alerts/${id}/acknowledge`,
    },
    RISK_ZONES: {
      LIST: '/api/v1/risks/zones',
      DETAIL: id => `/api/v1/risks/zones/${id}`,
      CREATE: '/api/v1/risks/zones',
    },
    USERS: {
      LIST: '/api/v1/users',
      DETAIL: id => `/api/v1/users/${id}`,
      CREATE: '/api/v1/users',
      UPDATE: id => `/api/v1/users/${id}`,
    },
    VEHICLES: {
      LIST: '/api/v1/vehicles',
      DETAIL: id => `/api/v1/vehicles/${id}`,
      CREATE: '/api/v1/vehicles',
      UPDATE: id => `/api/v1/vehicles/${id}`,
    },
  },

  // Configurações de mapa
  MAP: {
    DEFAULT_CENTER: [-15.7801, -47.9292], // Centro do Brasil (Brasília)
    DEFAULT_ZOOM: 5, // Zoom mais próximo para focar no Brasil
    RISK_ZONE_COLORS: {
      green: '#10b981',
      yellow: '#f59e0b',
      red: '#ef4444',
    },
    VEHICLE_ICONS: {
      moving: '🚛',
      stopped: '🚛',
      loading: '📦',
      emergency: '🚨',
    },
  },

  // Configurações de atualização em tempo real
  REAL_TIME: {
    UPDATE_INTERVAL: 30000, // 30 segundos
    ALERT_POLL_INTERVAL: 10000, // 10 segundos
    GPS_UPDATE_INTERVAL: 15000, // 15 segundos
  },

  // Modo de demonstração (controle de cadência e autoplay)
  DEMO: {
    ENABLED: true,
    STAGGER_MIN_MS: 250,
    STAGGER_MAX_MS: 2000,
    SHIPMENTS_MIN_MS: 2500,
    SHIPMENTS_MAX_MS: 5000,
    ALERTS_MIN_MS: 3500,
    ALERTS_MAX_MS: 6500,
    SECURITY_MIN_MS: 4500,
    SECURITY_MAX_MS: 8000,
    KM_INTERVAL_MS: 1000,
    AUTOPLAY: true,
  },

  // Guided Tour (roteiro de apresentação)
  TOUR: {
    ENABLED: true,
    AUTOSTART: true, // primeira sessão
    HARD_LOCK: true,
    STEPS: [
      {
        selector: '.stats-grid',
        title: 'Visão Geral em Tempo Real',
        body: 'Métricas vivas e correlacionadas: cargas, alertas, km e taxa de segurança se atualizam de forma independente.',
      },
      {
        selector: '#chart-status',
        title: 'Status das Cargas',
        body: 'Distribuição entre em trânsito, preparação e paradas. Clique em um setor para filtrar e abrir detalhes.',
        requireAction: 'click',
        doneWhenSelector: '#status-details',
      },
      {
        selector: '#chart-alerts',
        title: 'Alertas por Região',
        body: 'Barra por estado/região com contagem dinâmica de alertas críticos. Clique em uma barra para ver detalhes.',
        requireAction: 'click',
        doneWhenSelector: '#alerts-details',
      },
      {
        selector: '#map-mini',
        title: 'Mapa Rápido',
        body: 'Visualização instantânea para localizar anomalias e focar áreas de interesse com um clique.',
      },
      {
        selector: '.nav-menu',
        title: 'Navegação Intuitiva',
        body: 'Acesse cargas, veículos, alertas e o mapa completo. A experiência é fluida para operação 24/7.',
      },
      {
        selector: '#shipments-section .section-header',
        title: 'Cargas — Listagem',
        body: 'Visualize cargas, status e endereços. Clique em um item para focar no mapa.',
        navigateTo: 'shipments',
      },
      {
        selector: '#vehicles-section .section-header',
        title: 'Veículos — Frota',
        body: 'Acompanhe a frota, última cidade e cargas vinculadas por veículo.',
        navigateTo: 'vehicles',
      },
      {
        selector: '#alerts-section .section-header',
        title: 'Alertas — Eventos',
        body: 'Eventos críticos recentes com tipo e local. Use o ícone para focar no mapa.',
        navigateTo: 'alerts',
      },
      {
        selector: '#map-full',
        title: 'Mapa Completo',
        body: 'Mapa focado no Brasil com camadas de risco, marcadores e rotas. Use o painel compacto no canto superior direito.',
        navigateTo: 'map',
      },
      {
        selector: '.map-shipments-compact',
        title: 'Painel de Cargas',
        body: 'Painel compacto no canto superior direito. Clique no ícone de lista para ver as cargas na área atual.',
        navigateTo: 'map',
      },
      {
        selector: '.nav-actions',
        title: 'Tema e Tour',
        body: 'Alterne tema claro/escuro e reinicie este tour quando quiser (Ctrl+T).',
        navigateTo: 'dashboard',
      },
    ],
  },

  // Configurações de paginação
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Níveis de severidade
  SEVERITY_LEVELS: {
    critical: { color: '#dc2626', icon: 'fas fa-skull-crossbones', label: 'Crítico' },
    high: { color: '#ef4444', icon: 'fas fa-exclamation-triangle', label: 'Alto' },
    medium: { color: '#f59e0b', icon: 'fas fa-exclamation-circle', label: 'Médio' },
    low: { color: '#6b7280', icon: 'fas fa-info-circle', label: 'Baixo' },
  },

  // Status dos shipments
  SHIPMENT_STATUS: {
    planned: { color: '#fef3c7', textColor: '#d97706', label: 'Planejado' },
    in_transit: { color: '#dbeafe', textColor: '#2563eb', label: 'Em Trânsito' },
    completed: { color: '#d1fae5', textColor: '#065f46', label: 'Concluído' },
    cancelled: { color: '#fee2e2', textColor: '#dc2626', label: 'Cancelado' },
    emergency: { color: '#fee2e2', textColor: '#dc2626', label: 'Emergência' },
    low: { color: '#d1fae5', textColor: '#065f46', label: 'Baixo Risco' },
    high: { color: '#fed7aa', textColor: '#ea580c', label: 'Alto Risco' },
    critical: { color: '#fee2e2', textColor: '#dc2626', label: 'Risco Crítico' },
  },

  // Configurações de autenticação
  AUTH: {
    TOKEN_STORAGE_KEY: 'sompo_auth_token',
    REFRESH_TOKEN_STORAGE_KEY: 'sompo_refresh_token',
    USER_STORAGE_KEY: 'sompo_user_data',
  },
};

// Função para construir URLs completas da API
CONFIG.buildUrl = function (endpoint) {
  return `${this.API_BASE_URL}${endpoint}`;
};

// Função para obter headers de autenticação
CONFIG.getAuthHeaders = function () {
  const token = localStorage.getItem(this.AUTH.TOKEN_STORAGE_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Exportar configuração
window.CONFIG = CONFIG;
