/**
 * Ensemble Prediction Controller - Sompo
 * =======================================
 * 
 * Controller para predições usando ensemble de modelos ML
 * 
 * Endpoints:
 * - POST /api/v1/ensemble/predict - Predição com ensemble
 * - POST /api/v1/ensemble/batch - Predições em lote
 * - GET /api/v1/ensemble/status - Status dos modelos
 * - GET /api/v1/ensemble/info - Informações sobre o ensemble
 * 
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import { Request, Response } from 'express';
import { ensemblePredictionService } from '../services/ensemble-prediction.service';
import { logger } from '../utils/logger';

export class EnsemblePredictionController {
  /**
   * POST /api/v1/ensemble/predict
   * Predição usando ensemble de modelos
   */
  async predict(req: Request, res: Response): Promise<void> {
    try {
      const { uf, br, km, hour, weatherCondition, dayOfWeek, month } = req.body;

      // Validação de campos obrigatórios
      if (!uf || !br || km === undefined) {
        res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: uf, br, km',
          required_fields: {
            uf: 'string (ex: "SP")',
            br: 'string ou number (ex: "116" ou 116)',
            km: 'number (ex: 523)',
          },
          optional_fields: {
            hour: 'number (0-23, padrão: hora atual)',
            weatherCondition: 'string (ex: "claro", "chuvoso", "nublado")',
            dayOfWeek: 'number (0-6, padrão: dia atual)',
            month: 'number (1-12, padrão: mês atual)',
          },
        });
        return;
      }

      logger.info(`📊 Predição ensemble solicitada: ${uf}-BR${br} KM ${km}`);

      // Fazer predição
      const result = await ensemblePredictionService.predict({
        uf,
        br,
        km,
        hour,
        weatherCondition,
        dayOfWeek,
        month,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Erro na predição ensemble:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar predição ensemble',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * POST /api/v1/ensemble/batch
   * Predições em lote usando ensemble
   */
  async batchPredict(req: Request, res: Response): Promise<void> {
    try {
      const { predictions } = req.body;

      if (!predictions || !Array.isArray(predictions) || predictions.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Campo "predictions" deve ser um array não vazio',
          example: {
            predictions: [
              { uf: 'SP', br: '116', km: 523, hour: 22, weatherCondition: 'chuvoso' },
              { uf: 'RJ', br: '101', km: 85, hour: 14, weatherCondition: 'claro' },
            ],
          },
        });
        return;
      }

      logger.info(`📊 Predição ensemble em lote: ${predictions.length} itens`);

      // Processar predições em paralelo
      const results = await Promise.all(
        predictions.map((pred) =>
          ensemblePredictionService.predict(pred).catch((error) => ({
            error: error.message,
            input: pred,
          }))
        )
      );

      const successful = results.filter((r: any) => !r.error).length;
      const failed = results.filter((r: any) => r.error).length;

      res.json({
        success: true,
        data: {
          total: predictions.length,
          successful,
          failed,
          results,
        },
      });
    } catch (error) {
      logger.error('Erro na predição ensemble em lote:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar predições em lote',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * GET /api/v1/ensemble/status
   * Status de disponibilidade dos modelos
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      // Recarregar status dos modelos
      await ensemblePredictionService.checkModelsAvailability();

      res.json({
        success: true,
        data: {
          service: 'ensemble-prediction',
          status: 'operational',
          timestamp: new Date().toISOString(),
          note: 'Verificação de modelos concluída',
        },
      });
    } catch (error) {
      logger.error('Erro ao obter status:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter status dos modelos',
      });
    }
  }

  /**
   * GET /api/v1/ensemble/info
   * Informações sobre o sistema de ensemble
   */
  async getInfo(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          name: 'Sompo Ensemble Prediction System',
          version: '1.0.0',
          description: 'Sistema de predição usando ensemble de modelos de Machine Learning',
          models: {
            risk_model: {
              name: 'risk_model.joblib',
              type: 'LightGBM Classifier',
              purpose: 'Predição de gravidade de acidentes',
              classes: ['Sem vítimas', 'Com feridos', 'Com mortos'],
              accuracy: '77.18%',
              sources: ['ML API (real-time)', 'Lookup (pre-computed)'],
            },
            classification_model: {
              name: 'modeloClassificacao.joblib',
              type: 'Classification Model',
              purpose: 'Classificação detalhada de acidentes',
              classes: ['Sem Vítimas', 'Com Vítimas Feridas', 'Com Vítimas Fatais'],
              source: 'Classification API',
            },
          },
          ensemble_strategy: {
            method: 'Weighted voting with cross-validation',
            features: [
              'Validação cruzada entre modelos',
              'Agregação de confiança',
              'Detecção de inconsistências',
              'Ponderação adaptativa baseada em concordância',
            ],
            weights: {
              default: { risk_model: 0.6, classification_model: 0.4 },
              high_agreement: { risk_model: 0.5, classification_model: 0.5 },
              low_agreement: { risk_model: 0.75, classification_model: 0.25 },
            },
          },
          benefits: [
            'Maior confiabilidade nas predições',
            'Redução de falsos positivos/negativos',
            'Detecção automática de inconsistências',
            'Recomendações contextualizadas',
            'Fallback automático em caso de falha',
          ],
          endpoints: [
            'POST /api/v1/ensemble/predict - Predição individual',
            'POST /api/v1/ensemble/batch - Predições em lote',
            'GET /api/v1/ensemble/status - Status dos modelos',
            'GET /api/v1/ensemble/info - Informações do sistema',
          ],
        },
      });
    } catch (error) {
      logger.error('Erro ao obter informações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter informações do ensemble',
      });
    }
  }

  /**
   * GET /api/v1/ensemble/health
   * Health check do sistema de ensemble
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        status: 'healthy',
        service: 'ensemble-prediction',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}

export const ensemblePredictionController = new EnsemblePredictionController();

