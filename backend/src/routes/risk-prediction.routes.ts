/**
 * Risk Prediction Routes - Sompo
 * ==============================
 *
 * Rotas para predição de risco usando modelo LightGBM
 *
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import { Router } from 'express';
import { riskPredictionController } from '../controllers/risk-prediction.controller';

const router = Router();

// POST /api/v1/risk/predict - Prediz risco para um segmento
router.post('/predict', riskPredictionController.predict);

// POST /api/v1/risk/predict-route - Prediz risco para uma rota completa
router.post('/predict-route', riskPredictionController.predictRoute);

// GET /api/v1/risk/high-risk-segments - Retorna segmentos de maior risco
router.get('/high-risk-segments', riskPredictionController.getHighRiskSegments);

// GET /api/v1/risk/statistics - Estatísticas do modelo
router.get('/statistics', riskPredictionController.getStatistics);

// GET /api/v1/risk/status - Status do serviço
router.get('/status', riskPredictionController.getStatus);

// GET /api/v1/risk/zones - Zonas de risco (compatibilidade com frontend)
router.get('/zones', (req, res) => {
  res.json({
    success: true,
    data: {
      zones: [],
      total: 0,
      message: 'Zonas de risco não implementadas ainda'
    }
  });
});

export default router;
