import { Router } from 'express';
// import authRoutes from './auth.routes';
// import shipmentRoutes from './shipment.routes';
// import vehicleRoutes from './vehicle.routes';
// import monitoringRoutes from './monitoring.routes';
// import alertRoutes from './alert.routes';
// import riskRoutes from './risk.routes';
// import userRoutes from './user.routes';

const router = Router();

// Health check da API
router.get('/', (req, res) => {
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
      users: '/api/v1/users'
    }
  });
});

// Rotas mockadas para demonstração
router.get('/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login simulado',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: 'admin.sompo',
      role: 'admin'
    }
  });
});

router.get('/shipments', (req, res) => {
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
        vehicle_id: 1
      },
      {
        id: 2,
        code: 'SHP-2024-002',
        status: 'em_transito',
        origin: 'Belo Horizonte, MG',
        destination: 'Brasília, DF',
        value: 89000,
        vehicle_id: 2
      }
    ]
  });
});

router.get('/monitoring/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      total_shipments: 4,
      active_shipments: 3,
      total_alerts: 5,
      critical_alerts: 1,
      risk_zones: 6
    }
  });
});

// Registrar rotas (comentadas por enquanto)
// router.use('/auth', authRoutes);
// router.use('/shipments', shipmentRoutes);
// router.use('/vehicles', vehicleRoutes);
// router.use('/monitoring', monitoringRoutes);
// router.use('/alerts', alertRoutes);
// router.use('/risks', riskRoutes);
// router.use('/users', userRoutes);

export const setupRoutes = (): Router => {
  return router;
};
