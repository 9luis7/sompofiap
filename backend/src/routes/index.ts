import { Router } from 'express';
import realDataRoutes from './real-data.routes';
import riskPredictionRoutes from './risk-prediction.routes';

const router = Router();

// Health check da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Sompo - Sistema de Visualização de Dados DATATRAN + Predição de Risco ML',
    version: '2.0.0',
    status: 'Operacional',
    endpoints: {
      realData: '/api/v1/real-data',
      riskPrediction: '/api/v1/risk',
    },
  });
});

// Rotas de dados reais (lê Excel diretamente)
router.use('/real-data', realDataRoutes);

// Rotas de predição de risco (modelo LightGBM)
router.use('/risk', riskPredictionRoutes);

export const setupRoutes = (): Router => {
  return router;
};
