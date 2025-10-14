/**
 * Risk Prediction Controller - Sompo
 * ===================================
 *
 * Controller para predição de risco em tempo real usando
 * o modelo LightGBM pré-treinado e scores pré-calculados.
 *
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import { Request, Response, NextFunction } from 'express';
import riskLookupService from '../services/risk-lookup.service';
import mlApiClient from '../services/ml-api-client.service';
import weatherApiService from '../services/weather-api.service';

export const riskPredictionController = {
  /**
   * POST /api/v1/risk/predict
   * Prediz o risco para um segmento e condições específicas
   *
   * Body:
   * {
   *   "uf": "SP",
   *   "br": "116",
   *   "km": 523,
   *   "hour": 14,              // opcional
   *   "dayOfWeek": 2,          // opcional (0=domingo, 6=sábado)
   *   "weatherCondition": "chuva" // opcional
   * }
   */
  predict: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        uf,
        br,
        km,
        hour,
        dayOfWeek,
        weatherCondition,
        month,
        dayPhase,
        roadType,
        useRealTimeML,
      } = req.body;

      // Validação
      if (!uf || !br || km === undefined) {
        res.status(400).json({
          success: false,
          error: 'Parâmetros obrigatórios: uf, br, km',
        });
        return;
      }

      // Se weatherCondition não especificado ou vazio, buscar clima atual
      let finalWeatherCondition = weatherCondition;
      let weatherSource = 'user_input';
      let weatherUsed = weatherCondition;
      
      if (!weatherCondition || weatherCondition === '' || weatherCondition === 'padrão') {
        const currentWeather = await weatherApiService.getWeatherByLocation(uf, br, km);
        if (currentWeather) {
          finalWeatherCondition = currentWeather.condition;
          weatherSource = currentWeather.source === 'api' ? 'real_time_api' : 'fallback';
          weatherUsed = currentWeather.condition;
        } else {
          finalWeatherCondition = 'claro'; // fallback
          weatherSource = 'fallback';
          weatherUsed = 'claro';
        }
      }

      let prediction;
      let source = 'precalculated'; // 'precalculated' ou 'ml_realtime'

      // Tentar usar ML em tempo real se solicitado E disponível
      if (useRealTimeML && mlApiClient.available()) {
        const mlPrediction = await mlApiClient.predict({
          uf,
          br: parseInt(br as string),
          km,
          hour,
          dayOfWeek,
          month,
          weatherCondition: finalWeatherCondition,
          dayPhase,
          roadType,
        });

        if (mlPrediction) {
          prediction = mlPrediction;
          source = 'ml_realtime';
        }
      }

      // Fallback para scores pré-calculados
      if (!prediction) {
        prediction = await riskLookupService.predict({
          uf,
          br,
          km,
          hour,
          dayOfWeek,
          weatherCondition: finalWeatherCondition,
        }, {
          source: weatherSource,
          condition: weatherUsed
        });
      }

      res.json({
        success: true,
        data: {
          ...prediction,
          prediction_source: source,
        },
      });
    } catch (error: any) {
      console.error('Erro ao prever risco:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * GET /api/v1/risk/high-risk-segments
   * Retorna os segmentos de maior risco
   *
   * Query params:
   * - limit: número de segmentos (default: 50)
   */
  getHighRiskSegments: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;

      const segments = riskLookupService.getHighRiskSegments(limit);

      res.json({
        success: true,
        data: {
          segments,
          total: segments.length,
        },
      });
    } catch (error: any) {
      console.error('Erro ao buscar segmentos de alto risco:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * GET /api/v1/risk/statistics
   * Retorna estatísticas gerais do modelo de risco
   */
  getStatistics: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = riskLookupService.getStatistics();

      if (!stats) {
        res.status(503).json({
          success: false,
          error: 'Serviço de risco não inicializado. Execute train_risk_model.py',
        });
        return;
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * GET /api/v1/risk/status
   * Verifica o status do serviço de predição
   */
  getStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isReady = riskLookupService.isReady();
      const mlApiAvailable = mlApiClient.available();
      const mlModelInfo = mlApiAvailable ? await mlApiClient.getModelInfo() : null;

      res.json({
        success: true,
        data: {
          service: 'Risk Prediction Service',
          status: isReady ? 'ready' : 'not_ready',
          precalculated_scores: {
            available: isReady,
            message: isReady
              ? 'Scores pré-calculados carregados'
              : 'Arquivo risk_scores.json não encontrado',
          },
          ml_realtime: {
            available: mlApiAvailable,
            message: mlApiAvailable
              ? 'API Python de ML disponível'
              : 'API Python não disponível (usando fallback)',
            model_info: mlModelInfo,
          },
          recommendation: mlApiAvailable
            ? 'Use useRealTimeML: true para predições em tempo real via modelo'
            : 'Apenas scores pré-calculados disponíveis',
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * POST /api/v1/risk/predict-route
   * Prediz o risco para uma rota completa (múltiplos segmentos)
   *
   * Body:
   * {
   *   "route": [
   *     { "uf": "SP", "br": "116", "km": 100 },
   *     { "uf": "SP", "br": "116", "km": 150 },
   *     ...
   *   ],
   *   "hour": 14,
   *   "dayOfWeek": 2,
   *   "weatherCondition": "claro"
   * }
   */
  predictRoute: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { route, hour, dayOfWeek, weatherCondition } = req.body;

      if (!route || !Array.isArray(route) || route.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Parâmetro obrigatório: route (array de segmentos)',
        });
        return;
      }

      // Predizer risco para cada segmento
      const predictions = [];
      let totalRiskScore = 0;
      let maxRiskScore = 0;
      let criticalSegments = 0;
      let highRiskSegments = 0;

      for (const segment of route) {
        const prediction = await riskLookupService.predict({
          uf: segment.uf,
          br: segment.br,
          km: segment.km,
          hour,
          dayOfWeek,
          weatherCondition,
        });

        predictions.push(prediction);
        totalRiskScore += prediction.risk_score;
        maxRiskScore = Math.max(maxRiskScore, prediction.risk_score);

        if (prediction.risk_level === 'critico') criticalSegments++;
        if (prediction.risk_level === 'alto') highRiskSegments++;
      }

      const averageRiskScore = totalRiskScore / predictions.length;

      // Classificar risco geral da rota
      let overallRiskLevel: string;
      if (criticalSegments > 0 || averageRiskScore >= 80) {
        overallRiskLevel = 'critico';
      } else if (highRiskSegments > 0 || averageRiskScore >= 60) {
        overallRiskLevel = 'alto';
      } else if (averageRiskScore >= 40) {
        overallRiskLevel = 'moderado';
      } else {
        overallRiskLevel = 'baixo';
      }

      res.json({
        success: true,
        data: {
          route_summary: {
            total_segments: route.length,
            average_risk_score: Math.round(averageRiskScore * 100) / 100,
            max_risk_score: Math.round(maxRiskScore * 100) / 100,
            overall_risk_level: overallRiskLevel,
            critical_segments: criticalSegments,
            high_risk_segments: highRiskSegments,
          },
          segments: predictions,
          recommendations:
            overallRiskLevel === 'critico'
              ? [
                  '🚨 Rota com risco CRÍTICO detectado',
                  'Considere fortemente uma rota alternativa',
                  'Se seguir, mantenha atenção máxima',
                ]
              : overallRiskLevel === 'alto'
              ? [
                  '⚠️ Rota com alto risco',
                  'Reforce medidas de segurança',
                  'Considere evitar horários de pico',
                ]
              : ['✅ Rota com risco aceitável', 'Mantenha direção defensiva'],
        },
      });
    } catch (error: any) {
      console.error('Erro ao prever risco da rota:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};
