/**
 * Cliente para API de Classificação de Acidentes
 * 
 * Comunica-se com a API Python Flask (classification_api.py)
 * para obter classificações de acidentes usando modeloClassificacao.joblib
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface ClassificationRequest {
  uf: string;
  br: string;
  km: number;
  hour: number;
  weatherCondition?: string;
  dayOfWeek?: number;
  month?: number;
}

export interface ClassificationResponse {
  classification: 'Sem Vítimas' | 'Com Vítimas Feridas' | 'Com Vítimas Fatais';
  confidence: number;
  probabilities: {
    'Sem Vítimas': number;
    'Com Vítimas Feridas': number;
    'Com Vítimas Fatais': number;
  };
  severity_index: number; // 0, 1, ou 2
  input_summary: {
    location: string;
    time: string;
    weather: string;
  };
  timestamp: string;
}

export interface BatchClassificationRequest {
  predictions: ClassificationRequest[];
}

export interface BatchClassificationResponse {
  total: number;
  successful: number;
  failed: number;
  results: (ClassificationResponse | { error: string; input: any })[];
}

export interface ClassificationModelInfo {
  model_type: string;
  classes: string[];
  n_classes: number;
  encoders: string[];
  loaded_at: string;
  model_path: string;
  features: string[];
}

export class ClassificationApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isAvailable: boolean = false;
  private lastHealthCheck: Date | null = null;

  constructor(baseURL: string = 'http://localhost:5001') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Verifica se a API está disponível
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      this.isAvailable = response.data.status === 'healthy' && response.data.model_loaded;
      this.lastHealthCheck = new Date();
      
      if (this.isAvailable) {
        logger.info('✅ API de Classificação está disponível e pronta');
      } else {
        logger.warn('⚠️  API de Classificação respondeu mas modelo não está carregado');
      }
      
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      logger.warn('⚠️  API de Classificação não disponível:', error instanceof Error ? error.message : 'erro desconhecido');
      return false;
    }
  }

  /**
   * Obtém informações sobre o modelo carregado
   */
  async getModelInfo(): Promise<ClassificationModelInfo | null> {
    try {
      const response = await this.client.get<ClassificationModelInfo>('/model-info');
      return response.data;
    } catch (error) {
      logger.error('Erro ao obter informações do modelo de classificação:', error);
      return null;
    }
  }

  /**
   * Classifica um acidente
   */
  async classify(request: ClassificationRequest): Promise<ClassificationResponse | null> {
    try {
      if (!this.isAvailable) {
        const healthOk = await this.checkHealth();
        if (!healthOk) {
          logger.warn('API de Classificação não disponível. Retornando null.');
          return null;
        }
      }

      const response = await this.client.post<ClassificationResponse>('/classify', request);
      
      logger.info(
        `Classificação: ${response.data.classification} ` +
        `(confiança: ${(response.data.confidence * 100).toFixed(1)}%) - ` +
        `${request.uf}-BR${request.br} KM ${request.km}`
      );
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          logger.warn('API de Classificação não está rodando');
          this.isAvailable = false;
        } else if (error.response?.status === 503) {
          logger.warn('API de Classificação: modelo não carregado');
          this.isAvailable = false;
        } else {
          logger.error('Erro na classificação:', error.message);
        }
      } else {
        logger.error('Erro inesperado na classificação:', error);
      }
      return null;
    }
  }

  /**
   * Classifica múltiplos acidentes em lote
   */
  async batchClassify(requests: ClassificationRequest[]): Promise<BatchClassificationResponse | null> {
    try {
      if (!this.isAvailable) {
        const healthOk = await this.checkHealth();
        if (!healthOk) {
          return null;
        }
      }

      const response = await this.client.post<BatchClassificationResponse>('/batch-classify', {
        predictions: requests,
      });

      logger.info(
        `Classificação em lote: ${response.data.successful}/${response.data.total} com sucesso`
      );

      return response.data;
    } catch (error) {
      logger.error('Erro na classificação em lote:', error);
      return null;
    }
  }

  /**
   * Retorna se a API está disponível (sem fazer nova requisição)
   */
  isApiAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Retorna a última vez que o health check foi feito
   */
  getLastHealthCheck(): Date | null {
    return this.lastHealthCheck;
  }

  /**
   * Retorna a URL base da API
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Exporta instância singleton
export const classificationApiClient = new ClassificationApiClient();

