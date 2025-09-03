const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Sistema de Monitoramento Sompo - Backend funcionando!',
  });
});

// API básica
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API Sompo Monitoring - Sistema de Monitoramento de Cargas',
    version: '1.0.0',
    status: 'Funcionando com dados mockados',
    endpoints: {
      auth: '/api/v1/auth',
      shipments: '/api/v1/shipments',
      vehicles: '/api/v1/vehicles',
      monitoring: '/api/v1/monitoring',
      alerts: '/api/v1/alerts',
      risks: '/api/v1/risks',
      users: '/api/v1/users',
    },
  });
});

// Rotas mockadas para demonstração
app.get('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login simulado',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: 'admin.sompo',
      role: 'admin',
    },
  });
});

// Endpoint POST para login (que o frontend está chamando)
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Simular validação de credenciais
  const validCredentials = {
    'admin.sompo': 'password123',
    'joao.silva': 'password123',
    'cliente.techcom': 'password123',
  };

  if (validCredentials[username] && validCredentials[username] === password) {
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
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
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciais inválidas',
    });
  }
});

app.get('/api/v1/shipments', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        code: 'SHP-2024-001',
        status: 'em_transito',
        origin: 'São Paulo, SP',
        destination: 'Rio de Janeiro, RJ',
        value: 125000,
        vehicle_id: 1,
      },
      {
        id: 2,
        code: 'SHP-2024-002',
        status: 'em_transito',
        origin: 'Belo Horizonte, MG',
        destination: 'Brasília, DF',
        value: 89000,
        vehicle_id: 2,
      },
    ],
  });
});

app.get('/api/v1/monitoring/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: {
        activeShipments: 3,
        totalAlerts: 5,
        highRiskZones: 2,
        fleetUtilization: 80,
      },
      recentAlerts: [
        {
          id: 1,
          severity: 'critical',
          message: 'Veículo parado em zona crítica - BR-040',
          shipment_number: 'SHP-2024-005',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          severity: 'high',
          message: 'Entrada em zona de risco - BR-116',
          shipment_number: 'SHP-2024-002',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: 3,
          severity: 'medium',
          message: 'Desvio de rota detectado',
          shipment_number: 'SHP-2024-001',
          timestamp: new Date(Date.now() - 600000).toISOString(),
        },
      ],
      activeShipments: [
        {
          id: 1,
          shipment_number: 'SHP-2024-001',
          cargo_type: 'Eletrônicos',
          cargo_value: 125000,
          origin: 'São Paulo, SP',
          destination: 'Rio de Janeiro, RJ',
          current_risk: 'low',
          progress: 65,
          driver: 'Carlos Santos',
          estimated_arrival: new Date(Date.now() + 3600000).toISOString(),
        },
        {
          id: 2,
          shipment_number: 'SHP-2024-002',
          cargo_type: 'Medicamentos',
          cargo_value: 89000,
          origin: 'Belo Horizonte, MG',
          destination: 'Brasília, DF',
          current_risk: 'high',
          progress: 45,
          driver: 'Maria Oliveira',
          estimated_arrival: new Date(Date.now() + 7200000).toISOString(),
        },
        {
          id: 3,
          shipment_number: 'SHP-2024-004',
          cargo_type: 'Roupas',
          cargo_value: 78000,
          origin: 'Curitiba, PR',
          destination: 'Porto Alegre, RS',
          current_risk: 'low',
          progress: 85,
          driver: 'Pedro Costa',
          estimated_arrival: new Date(Date.now() + 1800000).toISOString(),
        },
      ],
    },
  });
});

// Endpoint para alertas
app.get('/api/v1/alerts', (req, res) => {
  res.json({
    success: true,
    data: {
      alerts: [
        {
          id: 1,
          severity: 'critical',
          message: 'Veículo parado em zona crítica - BR-040',
          shipment_number: 'SHP-2024-005',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        },
        {
          id: 2,
          severity: 'high',
          message: 'Entrada em zona de risco - BR-116',
          shipment_number: 'SHP-2024-002',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          acknowledged: true,
        },
        {
          id: 3,
          severity: 'medium',
          message: 'Desvio de rota detectado',
          shipment_number: 'SHP-2024-001',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          acknowledged: false,
        },
        {
          id: 4,
          severity: 'low',
          message: 'Manutenção preventiva necessária',
          shipment_number: 'SHP-2024-003',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          acknowledged: true,
        },
      ],
    },
  });
});

// Endpoint para zonas de risco
app.get('/api/v1/risks/zones', (req, res) => {
  res.json({
    success: true,
    data: {
      zones: [
        {
          id: 1,
          zone_name: 'BR-040 - Zona Crítica',
          zone_type: 'red',
          risk_score: 9.1,
          incident_count: 15,
          description: 'Alta incidência de roubos de carga',
          boundary: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-43.2, -22.9],
                  [-43.1, -22.9],
                  [-43.1, -22.8],
                  [-43.2, -22.8],
                  [-43.2, -22.9],
                ],
              ],
            },
          },
        },
        {
          id: 2,
          zone_name: 'BR-116 - Zona Perigosa',
          zone_type: 'red',
          risk_score: 8.5,
          incident_count: 12,
          description: 'Zona com histórico de assaltos',
          boundary: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-46.6, -23.5],
                  [-46.5, -23.5],
                  [-46.5, -23.4],
                  [-46.6, -23.4],
                  [-46.6, -23.5],
                ],
              ],
            },
          },
        },
        {
          id: 3,
          zone_name: 'BR-101 - Zona de Atenção',
          zone_type: 'yellow',
          risk_score: 4.2,
          incident_count: 5,
          description: 'Monitoramento intensivo necessário',
          boundary: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-34.9, -8.0],
                  [-34.8, -8.0],
                  [-34.8, -7.9],
                  [-34.9, -7.9],
                  [-34.9, -8.0],
                ],
              ],
            },
          },
        },
      ],
    },
  });
});

// Endpoint para usuários
app.get('/api/v1/users', (req, res) => {
  res.json({
    success: true,
    data: {
      users: [
        {
          id: 1,
          username: 'admin.sompo',
          full_name: 'Administrador Sompo',
          role: 'admin',
          email: 'admin@sompo.com.br',
          status: 'active',
        },
        {
          id: 2,
          username: 'joao.silva',
          full_name: 'João Silva',
          role: 'operator',
          email: 'joao.silva@sompo.com.br',
          status: 'active',
        },
        {
          id: 3,
          username: 'cliente.techcom',
          full_name: 'Cliente TechCom',
          role: 'client',
          email: 'contato@techcom.com.br',
          status: 'active',
        },
      ],
    },
  });
});

// Endpoint para veículos
app.get('/api/v1/vehicles', (req, res) => {
  res.json({
    success: true,
    data: {
      vehicles: [
        {
          id: 1,
          plate: 'ABC-1234',
          model: 'Mercedes-Benz Actros',
          driver_name: 'Carlos Santos',
          status: 'active',
          is_active: true,
          current_location: [-23.5505, -46.6333],
        },
        {
          id: 2,
          plate: 'DEF-5678',
          model: 'Volvo FH',
          driver_name: 'Maria Oliveira',
          status: 'active',
          is_active: true,
          current_location: [-19.9167, -43.9345],
        },
        {
          id: 3,
          plate: 'GHI-9012',
          model: 'Scania R',
          driver_name: 'Pedro Costa',
          status: 'maintenance',
          is_active: false,
          current_location: [-25.4289, -49.2671],
        },
      ],
    },
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, fechando servidor...');
  process.exit(0);
});
