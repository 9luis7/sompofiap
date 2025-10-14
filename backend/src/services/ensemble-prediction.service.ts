/**
 * Ensemble Prediction Service - Sompo
 * ====================================
 * 
 * Combina predições de múltiplos modelos de ML para maior confiabilidade:
 * 1. risk_model.joblib - Predição de gravidade (LightGBM)
 * 2. modeloClassificacao.joblib - Classificação de acidentes
 * 
 * Estratégias de ensemble:
 * - Validação cruzada entre modelos
 * - Agregação de confiança
 * - Detecção de inconsistências
 * - Recomendações contextualizadas
 * 
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import { logger } from '../utils/logger';
import mlApiClient from './ml-api-client.service';
import { classificationApiClient, ClassificationResponse } from './classification-api-client.service';
import riskLookupService from './risk-lookup.service';

export interface EnsemblePredictionInput {
  uf: string;
  br: string | number;
  km: number;
  hour?: number;
  weatherCondition?: string;
  dayOfWeek?: number;
  month?: number;
  dayPhase?: string;
  roadType?: string;
}

export interface EnsemblePredictionResult {
  // Scores agregados
  risk_score: number;
  risk_level: 'baixo' | 'moderado' | 'alto' | 'critico';
  
  // Classificação
  accident_classification: string;
  classification_confidence: number;
  
  // Detalhes dos modelos
  models: {
    risk_model?: {
      score: number;
      predicted_class: number;
      probabilities: {
        sem_vitimas: number;
        com_feridos: number;
        com_mortos: number;
      };
      source: 'ml_api' | 'lookup';
    };
    classification_model?: {
      classification: string;
      confidence: number;
      severity_index: number;
      probabilities: Record<string, number>;
    };
  };
  
  // Análise de ensemble
  ensemble: {
    models_agree: boolean;
    agreement_score: number; // 0-100
    confidence_level: 'baixa' | 'média' | 'alta' | 'muito_alta';
    weighted_score: number;
    inconsistencies: string[];
  };
  
  // Recomendações
  recommendations: string[];
  
  // Metadados
  metadata: {
    location: string;
    timestamp: string;
    models_used: string[];
    fallback_used: boolean;
  };
}

export class EnsemblePredictionService {
  private riskApiAvailable: boolean = false;
  private classificationApiAvailable: boolean = false;

  constructor() {
    this.checkModelsAvailability();
  }

  /**
   * Verifica disponibilidade de todos os modelos
   */
  async checkModelsAvailability(): Promise<void> {
    try {
      // Verificar API de risco
      this.riskApiAvailable = await mlApiClient.checkAvailability();
      
      // Verificar API de classificação
      this.classificationApiAvailable = await classificationApiClient.checkHealth();
      
      logger.info('📊 Status dos Modelos:');
      logger.info(`   - API de Risco: ${this.riskApiAvailable ? '✅' : '❌'}`);
      logger.info(`   - API de Classificação: ${this.classificationApiAvailable ? '✅' : '❌'}`);
      
    } catch (error) {
      logger.error('Erro ao verificar disponibilidade dos modelos:', error);
    }
  }

  /**
   * Realiza predição usando ensemble de modelos
   */
  async predict(input: EnsemblePredictionInput): Promise<EnsemblePredictionResult> {
    const startTime = Date.now();
    
    logger.info(`🎯 Iniciando predição ensemble para ${input.uf}-BR${input.br} KM ${input.km}`);

    // Preparar input padrão
    const standardInput = this.standardizeInput(input);

    // Executar predições em paralelo
    const [riskPrediction, classificationPrediction] = await Promise.all([
      this.getRiskPrediction(standardInput),
      this.getClassificationPrediction(standardInput),
    ]);

    // Combinar resultados
    const result = this.combineResults(
      standardInput,
      riskPrediction,
      classificationPrediction
    );

    const elapsed = Date.now() - startTime;
    logger.info(`✅ Predição ensemble concluída em ${elapsed}ms`);

    return result;
  }

  /**
   * Padroniza o input para todos os modelos
   */
  private standardizeInput(input: EnsemblePredictionInput): any {
    const now = new Date();
    
    return {
      uf: String(input.uf).toUpperCase(),
      br: String(input.br),
      km: Number(input.km),
      hour: input.hour ?? now.getHours(),
      dayOfWeek: input.dayOfWeek ?? now.getDay(),
      month: input.month ?? now.getMonth() + 1,
      weatherCondition: input.weatherCondition ?? 'claro',
      dayPhase: input.dayPhase,
      roadType: input.roadType,
    };
  }

  /**
   * Obtém predição de risco (modelo 1)
   */
  private async getRiskPrediction(input: any): Promise<any> {
    try {
      // Tentar API ML primeiro
      if (this.riskApiAvailable) {
        const mlResult = await mlApiClient.predict(input);
        if (mlResult) {
          return {
            score: mlResult.risk_score,
            predicted_class: mlResult.predicted_class,
            probabilities: mlResult.class_probabilities,
            source: 'ml_api',
          };
        }
      }

      // Fallback: scores pré-calculados
      const lookupResult = await riskLookupService.predict({
        uf: input.uf,
        br: input.br,
        km: input.km,
        hour: input.hour,
        weatherCondition: input.weatherCondition,
      });

      if (lookupResult) {
        return {
          score: lookupResult.risk_score,
          predicted_class: this.scoreToClass(lookupResult.risk_score),
          probabilities: this.estimateProbabilities(lookupResult.risk_score),
          source: 'lookup',
        };
      }

      return null;
    } catch (error) {
      logger.error('Erro ao obter predição de risco:', error);
      return null;
    }
  }

  /**
   * Obtém predição de classificação (modelo 2)
   */
  private async getClassificationPrediction(input: any): Promise<ClassificationResponse | null> {
    try {
      if (!this.classificationApiAvailable) {
        return null;
      }

      return await classificationApiClient.classify({
        uf: input.uf,
        br: input.br,
        km: input.km,
        hour: input.hour,
        weatherCondition: input.weatherCondition,
        dayOfWeek: input.dayOfWeek,
        month: input.month,
      });
    } catch (error) {
      logger.error('Erro ao obter predição de classificação:', error);
      return null;
    }
  }

  /**
   * Combina resultados dos modelos
   */
  private combineResults(
    input: any,
    riskPrediction: any,
    classificationPrediction: ClassificationResponse | null
  ): EnsemblePredictionResult {
    // Se não temos nenhuma predição, retornar resultado padrão
    if (!riskPrediction && !classificationPrediction) {
      return this.getDefaultResult(input);
    }

    // Extrair informações
    const riskScore = riskPrediction?.score ?? 50;
    const riskClass = riskPrediction?.predicted_class ?? 1;
    const classification = classificationPrediction?.classification ?? 'Desconhecido';
    const classificationConfidence = classificationPrediction?.confidence ?? 0;
    const classificationIndex = classificationPrediction?.severity_index ?? 1;

    // Verificar concordância entre modelos
    const modelsAgree = this.checkAgreement(riskClass, classificationIndex);
    const agreementScore = this.calculateAgreementScore(
      riskPrediction,
      classificationPrediction
    );

    // Calcular score ponderado
    const weightedScore = this.calculateWeightedScore(
      riskScore,
      classificationConfidence,
      agreementScore
    );

    // Determinar nível de risco
    const riskLevel = this.getRiskLevel(weightedScore);

    // Detectar inconsistências
    const inconsistencies = this.detectInconsistencies(
      riskPrediction,
      classificationPrediction
    );

    // Gerar recomendações
    const recommendations = this.generateRecommendations(
      weightedScore,
      riskLevel,
      classification,
      modelsAgree,
      input
    );

    // Calcular nível de confiança
    const confidenceLevel = this.getConfidenceLevel(agreementScore, classificationConfidence);

    // Montar resultado
    const result: EnsemblePredictionResult = {
      risk_score: Math.round(weightedScore * 100) / 100,
      risk_level: riskLevel,
      accident_classification: classification,
      classification_confidence: Math.round(classificationConfidence * 100) / 100,
      
      models: {
        risk_model: riskPrediction ? {
          score: riskPrediction.score,
          predicted_class: riskPrediction.predicted_class,
          probabilities: riskPrediction.probabilities,
          source: riskPrediction.source,
        } : undefined,
        classification_model: classificationPrediction ? {
          classification: classificationPrediction.classification,
          confidence: classificationPrediction.confidence,
          severity_index: classificationPrediction.severity_index,
          probabilities: classificationPrediction.probabilities,
        } : undefined,
      },
      
      ensemble: {
        models_agree: modelsAgree,
        agreement_score: Math.round(agreementScore * 100) / 100,
        confidence_level: confidenceLevel,
        weighted_score: Math.round(weightedScore * 100) / 100,
        inconsistencies,
      },
      
      recommendations,
      
      metadata: {
        location: `${input.uf}-BR${input.br} KM ${input.km}`,
        timestamp: new Date().toISOString(),
        models_used: [
          riskPrediction ? `risk_model (${riskPrediction.source})` : null,
          classificationPrediction ? 'classification_model' : null,
        ].filter(Boolean) as string[],
        fallback_used: riskPrediction?.source === 'lookup',
      },
    };

    return result;
  }

  /**
   * Verifica se os modelos concordam
   */
  private checkAgreement(riskClass: number, classificationIndex: number): boolean {
    return riskClass === classificationIndex;
  }

  /**
   * Calcula score de concordância (0-100)
   */
  private calculateAgreementScore(
    riskPrediction: any,
    classificationPrediction: ClassificationResponse | null
  ): number {
    if (!riskPrediction || !classificationPrediction) {
      return 50; // Concordância neutra se faltar modelo
    }

    const riskClass = riskPrediction.predicted_class;
    const classIndex = classificationPrediction.severity_index;

    // Concordância perfeita
    if (riskClass === classIndex) {
      return 100;
    }

    // Concordância parcial (diferença de 1 classe)
    if (Math.abs(riskClass - classIndex) === 1) {
      return 65;
    }

    // Discordância total
    return 30;
  }

  /**
   * Calcula score ponderado considerando ambos os modelos
   */
  private calculateWeightedScore(
    riskScore: number,
    classificationConfidence: number,
    agreementScore: number
  ): number {
    // Pesos baseados em concordância
    let riskWeight = 0.6;
    let classWeight = 0.4;

    // Se os modelos concordam fortemente, dar mais peso ao ensemble
    if (agreementScore > 80) {
      riskWeight = 0.5;
      classWeight = 0.5;
    }

    // Se discordam, dar mais peso ao modelo de risco (mais conservador)
    if (agreementScore < 50) {
      riskWeight = 0.75;
      classWeight = 0.25;
    }

    // Score derivado da confiança da classificação
    const classificationScore = classificationConfidence * 100;

    // Média ponderada
    const weightedScore = (riskScore * riskWeight) + (classificationScore * classWeight);

    return Math.min(Math.max(weightedScore, 0), 100);
  }

  /**
   * Detecta inconsistências entre os modelos
   */
  private detectInconsistencies(
    riskPrediction: any,
    classificationPrediction: ClassificationResponse | null
  ): string[] {
    const inconsistencies: string[] = [];

    if (!riskPrediction || !classificationPrediction) {
      return inconsistencies;
    }

    const riskClass = riskPrediction.predicted_class;
    const classIndex = classificationPrediction.severity_index;

    // Inconsistência de classe
    if (riskClass !== classIndex) {
      inconsistencies.push(
        `Modelos divergem na severidade: modelo de risco prevê classe ${riskClass}, ` +
        `classificação prevê classe ${classIndex}`
      );
    }

    // Risco alto mas classificação leve
    if (riskPrediction.score > 70 && classIndex === 0) {
      inconsistencies.push(
        'Alto score de risco mas classificação indica "Sem Vítimas" - revisar contexto'
      );
    }

    // Risco baixo mas classificação grave
    if (riskPrediction.score < 40 && classIndex === 2) {
      inconsistencies.push(
        'Baixo score de risco mas classificação indica "Com Vítimas Fatais" - revisar dados'
      );
    }

    return inconsistencies;
  }

  /**
   * Gera recomendações contextualizadas
   */
  private generateRecommendations(
    score: number,
    level: string,
    classification: string,
    modelsAgree: boolean,
    input: any
  ): string[] {
    const recommendations: string[] = [];

    // Recomendações por nível de risco
    if (level === 'critico') {
      recommendations.push('🚨 RISCO CRÍTICO: Considere rota alternativa urgentemente');
      recommendations.push('Reduza velocidade em pelo menos 30%');
      recommendations.push('Ative monitoramento intensivo');
    } else if (level === 'alto') {
      recommendations.push('⚠️ Alto risco: Atenção redobrada necessária');
      recommendations.push('Reduza velocidade em 20%');
    } else if (level === 'moderado') {
      recommendations.push('⚡ Risco moderado: Mantenha atenção');
    } else {
      recommendations.push('✅ Risco relativamente baixo');
    }

    // Recomendações por classificação
    if (classification === 'Com Vítimas Fatais') {
      recommendations.push('🚨 Alta probabilidade de fatalidade neste trecho');
      recommendations.push('Mantenha kit de emergência e primeiros socorros');
    } else if (classification === 'Com Vítimas Feridas') {
      recommendations.push('⚠️ Risco de ferimentos graves');
      recommendations.push('Verifique equipamentos de segurança');
    }

    // Recomendações por contexto
    if (input.weatherCondition?.toLowerCase().includes('chuv')) {
      recommendations.push('🌧️ Chuva: aumente distância de segurança');
    }

    if (input.hour >= 20 || input.hour <= 6) {
      recommendations.push('🌙 Período noturno: use farol alto quando apropriado');
    }

    if (input.dayOfWeek === 0 || input.dayOfWeek === 6) {
      recommendations.push('📅 Fim de semana: tráfego e comportamento diferentes');
    }

    // Validação cruzada
    if (modelsAgree) {
      recommendations.push('✅ Ambos os modelos concordam - alta confiabilidade');
    } else {
      recommendations.push('⚠️ Modelos divergem - considere análise adicional');
    }

    return recommendations;
  }

  /**
   * Converte score para classe (0, 1, 2)
   */
  private scoreToClass(score: number): number {
    if (score < 40) return 0;
    if (score < 70) return 1;
    return 2;
  }

  /**
   * Estima probabilidades baseado no score
   */
  private estimateProbabilities(score: number): any {
    if (score < 40) {
      return { sem_vitimas: 0.7, com_feridos: 0.25, com_mortos: 0.05 };
    } else if (score < 70) {
      return { sem_vitimas: 0.3, com_feridos: 0.5, com_mortos: 0.2 };
    } else {
      return { sem_vitimas: 0.1, com_feridos: 0.4, com_mortos: 0.5 };
    }
  }

  /**
   * Determina nível de risco baseado no score
   */
  private getRiskLevel(score: number): 'baixo' | 'moderado' | 'alto' | 'critico' {
    if (score >= 80) return 'critico';
    if (score >= 60) return 'alto';
    if (score >= 40) return 'moderado';
    return 'baixo';
  }

  /**
   * Determina nível de confiança do ensemble
   */
  private getConfidenceLevel(
    agreementScore: number,
    classificationConfidence: number
  ): 'baixa' | 'média' | 'alta' | 'muito_alta' {
    const avgConfidence = (agreementScore + classificationConfidence * 100) / 2;

    if (avgConfidence >= 85) return 'muito_alta';
    if (avgConfidence >= 70) return 'alta';
    if (avgConfidence >= 50) return 'média';
    return 'baixa';
  }

  /**
   * Retorna resultado padrão quando nenhum modelo está disponível
   */
  private getDefaultResult(input: any): EnsemblePredictionResult {
    return {
      risk_score: 50,
      risk_level: 'moderado',
      accident_classification: 'Desconhecido',
      classification_confidence: 0,
      models: {},
      ensemble: {
        models_agree: false,
        agreement_score: 0,
        confidence_level: 'baixa',
        weighted_score: 50,
        inconsistencies: ['Nenhum modelo disponível para predição'],
      },
      recommendations: [
        '⚠️ Modelos de ML não disponíveis',
        'Use análise manual para avaliar risco',
      ],
      metadata: {
        location: `${input.uf}-BR${input.br} KM ${input.km}`,
        timestamp: new Date().toISOString(),
        models_used: [],
        fallback_used: true,
      },
    };
  }
}

// Export singleton
export const ensemblePredictionService = new EnsemblePredictionService();

