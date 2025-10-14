/**
 * Risk Lookup Service - Sompo
 * ============================
 *
 * Serviço para consulta rápida de scores de risco pré-calculados.
 * Carrega o arquivo risk_scores.json gerado pelo modelo ML em memória
 * e fornece lookups instantâneos de risco por segmento e contexto.
 *
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import * as fs from 'fs';
import * as path from 'path';

interface RiskScoreMetadata {
  generated_at: string;
  total_segments: number;
  total_accidents_analyzed: number;
  model_type: string;
  accuracy: string;
  contexts: string[];
  score_range: string;
}

interface SegmentScores {
  [context: string]: number;
}

interface RiskScoresData {
  metadata: RiskScoreMetadata;
  scores: {
    [segmentKey: string]: SegmentScores;
  };
}

interface RiskPredictionInput {
  uf: string;
  br: string | number;
  km: number;
  hour?: number;
  dayOfWeek?: number;
  weatherCondition?: string;
}

interface RiskPredictionResult {
  segment_key: string;
  risk_score: number;
  risk_level: 'baixo' | 'moderado' | 'alto' | 'critico';
  context_used: string;
  recommendations: string[];
  weather_source?: 'user_input' | 'real_time_api' | 'fallback';
  weather_used?: string;
  nearby_segments?: Array<{
    segment_key: string;
    risk_score: number;
    distance_km: number;
  }>;
}

class RiskLookupService {
  private riskData: RiskScoresData | null = null;
  private isLoaded: boolean = false;
  private riskScoresPath: string;

  constructor() {
    this.riskScoresPath = path.join(__dirname, '..', '..', 'risk_scores.json');
  }

  /**
   * Inicializa o serviço carregando os scores em memória
   */
  async initialize(): Promise<void> {
    try {
      console.log('📊 Carregando scores de risco pré-calculados...');
      console.log(`   Arquivo: ${this.riskScoresPath}`);

      if (!fs.existsSync(this.riskScoresPath)) {
        console.warn('⚠️  Arquivo risk_scores.json não encontrado.');
        console.warn('   Execute: python train_risk_model.py');
        this.isLoaded = false;
        return;
      }

      const rawData = fs.readFileSync(this.riskScoresPath, 'utf-8');
      this.riskData = JSON.parse(rawData);

      if (this.riskData && this.riskData.scores) {
        this.isLoaded = true;
        console.log('✅ Scores de risco carregados com sucesso!');
        console.log(`   📍 ${this.riskData.metadata.total_segments} segmentos`);
        console.log(`   🎯 Modelo: ${this.riskData.metadata.model_type}`);
        console.log(`   📊 Acurácia: ${this.riskData.metadata.accuracy}`);
      } else {
        console.error('❌ Formato inválido do arquivo risk_scores.json');
        this.isLoaded = false;
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar risk_scores.json:', error.message);
      this.isLoaded = false;
    }
  }

  /**
   * Prediz o risco para um segmento e contexto específico
   */
  async predict(input: RiskPredictionInput, weatherInfo?: { source: string; condition: string }): Promise<RiskPredictionResult> {
    if (!this.isLoaded || !this.riskData) {
      // Fallback se o arquivo não estiver carregado
      return this.getFallbackPrediction(input);
    }

    // Normalizar entrada
    const uf = input.uf.toUpperCase();
    const br = String(input.br).padStart(3, '0');
    const km_segment = Math.floor(input.km / 10) * 10;

    // Determinar contexto baseado em condições
    const context = this.determineContext(input);

    // Criar chave do segmento
    const segment_key = `${uf}_${br}_${km_segment}`;

    // Buscar score
    const segmentScores = this.riskData.scores[segment_key];

    let risk_score: number;
    let found = false;

    if (segmentScores && segmentScores[context]) {
      risk_score = segmentScores[context];
      found = true;
    } else {
      // Tentar contexto default
      const defaultContext = 'dia_claro';
      if (segmentScores && segmentScores[defaultContext]) {
        risk_score = segmentScores[defaultContext];
        found = true;
      } else {
        // Buscar segmentos próximos
        const nearbyScore = this.findNearbySegmentScore(uf, br, km_segment, context);
        risk_score = nearbyScore.score;
        found = nearbyScore.found;
      }
    }

    // Se não encontrou nada, usar score base baixo
    if (!found) {
      risk_score = 30; // Score moderado-baixo para áreas sem dados
    }

    // Classificar nível de risco
    const risk_level = this.classifyRiskLevel(risk_score);

    // Gerar recomendações
    const recommendations = this.generateRecommendations(risk_score, input);

    // Buscar segmentos próximos para contexto adicional
    const nearby_segments = this.findNearbySegments(uf, br, km_segment, context, 3);

    return {
      segment_key,
      risk_score: Math.round(risk_score * 100) / 100,
      risk_level,
      context_used: context,
      recommendations,
      weather_source: weatherInfo?.source as any,
      weather_used: weatherInfo?.condition,
      nearby_segments,
    };
  }

  /**
   * Determina o contexto baseado nas condições de entrada
   */
  private determineContext(input: RiskPredictionInput): string {
    const hour = input.hour ?? 12;
    const dayOfWeek = input.dayOfWeek ?? 2;
    const weather = (input.weatherCondition || '').toLowerCase();

    // Determinar fase do dia (simplificado para dia/noite)
    let phase: string;
    if (hour >= 18 || hour < 6) {
      phase = 'noite';
    } else {
      phase = 'dia';
    }

    // Determinar condição climática
    let clima: string;
    if (weather.includes('chuva') || weather.includes('garoa')) {
      clima = 'chuvoso';
    } else if (weather.includes('nublado')) {
      clima = 'nublado';
    } else if (weather.includes('neblina') || weather.includes('nevoeiro')) {
      clima = 'chuvoso'; // Mapear neblina para chuvoso
    } else {
      clima = 'claro';
    }

    // Remover caso especial de FDS - usar contextos normais
    return `${phase}_${clima}`;
  }

  /**
   * Busca score de segmentos próximos (±20km)
   */
  private findNearbySegmentScore(
    uf: string,
    br: string,
    km: number,
    context: string
  ): { score: number; found: boolean } {
    if (!this.riskData) return { score: 30, found: false };

    const searchRange = 20; // Buscar em ±20km

    for (let offset = 10; offset <= searchRange; offset += 10) {
      // Tentar km anterior
      const prev_km = km - offset;
      const prev_key = `${uf}_${br}_${prev_km}`;
      if (this.riskData.scores[prev_key] && this.riskData.scores[prev_key][context] !== undefined) {
        return { score: this.riskData.scores[prev_key][context], found: true };
      }

      // Tentar km posterior
      const next_km = km + offset;
      const next_key = `${uf}_${br}_${next_km}`;
      if (this.riskData.scores[next_key] && this.riskData.scores[next_key][context] !== undefined) {
        return { score: this.riskData.scores[next_key][context], found: true };
      }
    }

    return { score: 30, found: false };
  }

  /**
   * Busca segmentos próximos para contexto adicional
   */
  private findNearbySegments(
    uf: string,
    br: string,
    km: number,
    context: string,
    limit: number = 5
  ): Array<{ segment_key: string; risk_score: number; distance_km: number }> {
    if (!this.riskData) return [];

    const nearby: Array<{ segment_key: string; risk_score: number; distance_km: number }> = [];

    // Buscar em ±50km
    for (let offset = 10; offset <= 50; offset += 10) {
      if (nearby.length >= limit) break;

      // Anterior
      const prev_km = km - offset;
      const prev_key = `${uf}_${br}_${prev_km}`;
      if (this.riskData.scores[prev_key] && this.riskData.scores[prev_key][context] !== undefined) {
        nearby.push({
          segment_key: prev_key,
          risk_score: this.riskData.scores[prev_key][context],
          distance_km: offset,
        });
      }

      if (nearby.length >= limit) break;

      // Posterior
      const next_km = km + offset;
      const next_key = `${uf}_${br}_${next_km}`;
      if (this.riskData.scores[next_key] && this.riskData.scores[next_key][context] !== undefined) {
        nearby.push({
          segment_key: next_key,
          risk_score: this.riskData.scores[next_key][context],
          distance_km: offset,
        });
      }
    }

    return nearby.sort((a, b) => a.distance_km - b.distance_km).slice(0, limit);
  }

  /**
   * Classifica o nível de risco
   */
  private classifyRiskLevel(score: number): 'baixo' | 'moderado' | 'alto' | 'critico' {
    if (score >= 80) return 'critico';
    if (score >= 60) return 'alto';
    if (score >= 40) return 'moderado';
    return 'baixo';
  }

  /**
   * Gera recomendações baseadas no score de risco
   */
  private generateRecommendations(score: number, input: RiskPredictionInput): string[] {
    const recommendations: string[] = [];

    if (score >= 80) {
      recommendations.push('🚨 RISCO CRÍTICO: Considere rota alternativa urgentemente');
      recommendations.push('Reduza velocidade em pelo menos 30%');
      recommendations.push('Aumente distância de segurança significativamente');
      recommendations.push('Evite ultrapassagens');
      recommendations.push('Mantenha atenção máxima');
    } else if (score >= 60) {
      recommendations.push('⚠️ ALTO RISCO: Atenção redobrada necessária');
      recommendations.push('Reduza velocidade em 20%');
      recommendations.push('Mantenha distância de segurança aumentada');
      recommendations.push('Evite dirigir cansado');
    } else if (score >= 40) {
      recommendations.push('⚡ RISCO MODERADO: Mantenha atenção');
      recommendations.push('Siga velocidade recomendada');
      recommendations.push('Mantenha distância de segurança');
    } else {
      recommendations.push('✅ Risco relativamente baixo');
      recommendations.push('Mantenha direção defensiva padrão');
    }

    // Recomendações contextuais
    const hour = input.hour ?? 12;
    const weather = (input.weatherCondition || '').toLowerCase();

    if (hour >= 18 || hour < 6) {
      recommendations.push('🌙 Período noturno: use farol alto quando apropriado');
    }

    if (weather.includes('chuva')) {
      recommendations.push('🌧️ Chuva: reduza velocidade e aumente distância');
    }

    if (weather.includes('neblina') || weather.includes('nevoeiro')) {
      recommendations.push('🌫️ Neblina: velocidade reduzida e farol baixo');
    }

    return recommendations;
  }

  /**
   * Predição fallback quando o arquivo não está carregado
   */
  private getFallbackPrediction(input: RiskPredictionInput): RiskPredictionResult {
    const segment_key = `${input.uf}_${input.br}_${Math.floor(input.km / 10) * 10}`;

    return {
      segment_key,
      risk_score: 35,
      risk_level: 'moderado',
      context_used: 'fallback',
      recommendations: [
        '⚠️ Sistema operando em modo fallback',
        'Dados de risco não disponíveis',
        'Mantenha atenção padrão',
      ],
    };
  }

  /**
   * Obtém todos os segmentos de alto risco (score >= 70)
   */
  getHighRiskSegments(limit: number = 50): Array<{
    segment_key: string;
    uf: string;
    br: string;
    km: number;
    avg_risk_score: number;
    max_risk_score: number;
  }> {
    if (!this.isLoaded || !this.riskData) return [];

    const segments: Array<{
      segment_key: string;
      uf: string;
      br: string;
      km: number;
      avg_risk_score: number;
      max_risk_score: number;
    }> = [];

    for (const [segment_key, scores] of Object.entries(this.riskData.scores)) {
      const scoreValues = Object.values(scores);
      const avg_risk_score = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
      const max_risk_score = Math.max(...scoreValues);

      if (avg_risk_score >= 70) {
        const [uf, br, km_str] = segment_key.split('_');
        segments.push({
          segment_key,
          uf,
          br,
          km: parseInt(km_str),
          avg_risk_score: Math.round(avg_risk_score * 100) / 100,
          max_risk_score: Math.round(max_risk_score * 100) / 100,
        });
      }
    }

    return segments.sort((a, b) => b.avg_risk_score - a.avg_risk_score).slice(0, limit);
  }

  /**
   * Obtém estatísticas gerais dos scores
   */
  getStatistics(): {
    total_segments: number;
    model_info: RiskScoreMetadata;
    risk_distribution: {
      baixo: number;
      moderado: number;
      alto: number;
      critico: number;
    };
  } | null {
    if (!this.isLoaded || !this.riskData) return null;

    const distribution = { baixo: 0, moderado: 0, alto: 0, critico: 0 };

    for (const scores of Object.values(this.riskData.scores)) {
      const scoreValues = Object.values(scores);
      const avg = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

      if (avg >= 80) distribution.critico++;
      else if (avg >= 60) distribution.alto++;
      else if (avg >= 40) distribution.moderado++;
      else distribution.baixo++;
    }

    return {
      total_segments: this.riskData.metadata.total_segments,
      model_info: this.riskData.metadata,
      risk_distribution: distribution,
    };
  }

  /**
   * Verifica se o serviço está carregado
   */
  isReady(): boolean {
    return this.isLoaded;
  }
}

// Export singleton
export default new RiskLookupService();
