import { Router } from 'express';
import authRoutes from './auth.routes';
import shipmentRoutes from './shipment.routes';
import vehicleRoutes from './vehicle.routes';
import monitoringRoutes from './monitoring.routes';
import alertRoutes from './alert.routes';
import riskRoutes from './risk.routes';
import userRoutes from './user.routes';
import csvImportRoutes from './csv-import.routes';

const router = Router();

// Health check da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Sompo Monitoring - Sistema de Monitoramento de Cargas',
    version: '1.0.0',
    status: 'Sistema refatorado - Pronto para dados reais via CSV',
    endpoints: {
      auth: '/api/v1/auth',
      shipments: '/api/v1/shipments',
      vehicles: '/api/v1/vehicles',
      monitoring: '/api/v1/monitoring',
      alerts: '/api/v1/alerts',
      risks: '/api/v1/risks',
      users: '/api/v1/users',
      csvImport: '/api/v1/csv-import'
    }
  });
});

// Rotas mockadas removidas - usar rotas reais da API

// Registrar rotas da API
router.use('/auth', authRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/alerts', alertRoutes);
router.use('/risks', riskRoutes);
router.use('/users', userRoutes);
router.use('/csv-import', csvImportRoutes);

export const setupRoutes = (): Router => {
  return router;
};
