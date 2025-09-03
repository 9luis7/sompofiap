import { Router } from 'express';
import { catchAsync } from '../middleware/error.middleware';
import { monitoringController } from '../controllers/monitoring.controller';

const router = Router();

// Rotas públicas (serão protegidas por middleware futuramente)
// router.use(authMiddleware); // TODO: Adicionar middleware de autenticação

// Monitoramento em tempo real
router.get('/real-time', catchAsync(monitoringController.getRealTimeData));
router.get('/gps/:shipmentId', catchAsync(monitoringController.getGPSData));
router.get('/sensors/:shipmentId', catchAsync(monitoringController.getSensorData));

// Estatísticas e relatórios
router.get('/statistics', catchAsync(monitoringController.getStatistics));
router.get('/dashboard', catchAsync(monitoringController.getDashboardData));

// Dados históricos
router.get('/history/:shipmentId', catchAsync(monitoringController.getShipmentHistory));

export default router;
