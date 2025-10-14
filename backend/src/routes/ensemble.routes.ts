/**
 * Rotas para Ensemble Prediction - Sompo
 * =======================================
 * 
 * Rotas para predições usando ensemble de modelos ML
 * 
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import { Router } from 'express';
import { ensemblePredictionController } from '../controllers/ensemble-prediction.controller';

const router = Router();

/**
 * POST /api/v1/ensemble/predict
 * Predição usando ensemble de modelos
 * 
 * Body:
 * {
 *   "uf": "SP",
 *   "br": "116",
 *   "km": 523,
 *   "hour": 22,
 *   "weatherCondition": "chuvoso",
 *   "dayOfWeek": 5,
 *   "month": 10
 * }
 */
router.post('/predict', (req, res) => ensemblePredictionController.predict(req, res));

/**
 * POST /api/v1/ensemble/batch
 * Predições em lote usando ensemble
 * 
 * Body:
 * {
 *   "predictions": [
 *     { "uf": "SP", "br": "116", "km": 523, "hour": 22, "weatherCondition": "chuvoso" },
 *     { "uf": "RJ", "br": "101", "km": 85, "hour": 14, "weatherCondition": "claro" }
 *   ]
 * }
 */
router.post('/batch', (req, res) => ensemblePredictionController.batchPredict(req, res));

/**
 * GET /api/v1/ensemble/status
 * Status de disponibilidade dos modelos
 */
router.get('/status', (req, res) => ensemblePredictionController.getStatus(req, res));

/**
 * GET /api/v1/ensemble/info
 * Informações sobre o sistema de ensemble
 */
router.get('/info', (req, res) => ensemblePredictionController.getInfo(req, res));

/**
 * GET /api/v1/ensemble/health
 * Health check do sistema de ensemble
 */
router.get('/health', (req, res) => ensemblePredictionController.healthCheck(req, res));

export default router;

