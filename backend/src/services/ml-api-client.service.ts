/**
 * ML API Client Service - Sompo
 * ==============================
 *
 * Cliente para comunicação com a API Python de ML.
 * Permite usar o modelo treinado em tempo real via HTTP.
 *
 * Fallback: Se a API Python não estiver disponível, usa risk-lookup.service.ts
 *
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import axios, { AxiosInstance } from 'axios';

interface MLPredictionInput {
  uf: string;
  br: number | string;
  km: number;
  hour?: number;
  dayOfWeek?: number;
  month?: number;
  weatherCondition?: string;
  dayPhase?: string;
  roadType?: string;
}

interface MLPredictionResponse {
  success: boolean;
  data: {
    risk_score: number;
    risk_level: 'baixo' | 'moderado' | 'alto' | 'critico';
    predicted_class: number;
    class_probabilities: {
      sem_vitimas: number;
      com_feridos: number;
      com_mortos: number;
    };
    recommendations: string[];
    input: any;
  };
}

interface MLHealthResponse {
  status: string;
  service: string;
  model_loaded: boolean;
  version: string;
}

class MLApiClientService {
  private client: AxiosInstance;
  private isAvailable: boolean = false;
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.ML_API_URL || 'http://localhost:5000';

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Verifica se a API Python está disponível
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await this.client.get<MLHealthResponse>('/health');
      this.isAvailable = response.data.model_loaded === true;

      if (this.isAvailable) {
        console.log('✅ API Python de ML disponível e operacional');
      } else {
        console.log('⚠️  API Python respondendo mas modelo não carregado');
      }

      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      console.log('⚠️  API Python de ML não disponível. Usando fallback (scores pré-calculados)');
      return false;
    }
  }

  /**
   * Faz predição usando a API Python
   */
  async predict(input: MLPredictionInput): Promise<MLPredictionResponse['data'] | null> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const response = await this.client.post<MLPredictionResponse>('/predict', input);

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Erro ao fazer predição via API Python:', error.message);
      return null;
    }
  }

  /**
   * Predição em lote
   */
  async predictBatch(
    inputs: MLPredictionInput[]
  ): Promise<Array<MLPredictionResponse['data'] | null>> {
    if (!this.isAvailable) {
      return inputs.map(() => null);
    }

    try {
      const response = await this.client.post('/predict-batch', {
        predictions: inputs,
      });

      if (response.data.success) {
        return response.data.data.predictions.map((p: any) => (p.success ? p.data : null));
      }

      return inputs.map(() => null);
    } catch (error: any) {
      console.error('Erro ao fazer predição em lote:', error.message);
      return inputs.map(() => null);
    }
  }

  /**
   * Obtém informações sobre o modelo
   */
  async getModelInfo(): Promise<any> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const response = await this.client.get('/model-info');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verifica se a API está disponível
   */
  available(): boolean {
    return this.isAvailable;
  }
}

// Export singleton
export default new MLApiClientService();
