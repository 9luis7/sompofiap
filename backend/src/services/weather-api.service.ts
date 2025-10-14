/**
 * Weather API Service - Sompo
 * ============================
 *
 * Serviço para buscar condições climáticas atuais via API externa.
 * Integra com OpenWeatherMap para obter clima em tempo real por localização.
 *
 * Autor: Sistema Sompo
 * Data: 2025-10-14
 */

import axios, { AxiosInstance } from 'axios';

interface WeatherResponse {
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    humidity: number;
  };
  name: string;
}

interface WeatherCacheEntry {
  condition: string;
  timestamp: number;
  location: string;
}

interface WeatherResult {
  condition: 'claro' | 'nublado' | 'chuvoso';
  temperature?: number;
  humidity?: number;
  location?: string;
  source: 'api' | 'cache' | 'fallback';
}

class WeatherApiService {
  private client: AxiosInstance;
  private cache: Map<string, WeatherCacheEntry> = new Map();
  private isEnabled: boolean;
  private apiKey: string;
  private cacheDuration: number;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.isEnabled = process.env.WEATHER_API_ENABLED === 'true' && !!this.apiKey;
    this.cacheDuration = parseInt(process.env.WEATHER_CACHE_DURATION || '1800000'); // 30 min default

    this.client = axios.create({
      baseURL: 'https://api.openweathermap.org/data/2.5',
      timeout: 10000,
      params: {
        appid: this.apiKey,
        units: 'metric',
        lang: 'pt_br'
      }
    });

    console.log(`🌤️  Weather API Service: ${this.isEnabled ? 'ENABLED' : 'DISABLED'}`);
    if (this.isEnabled) {
      console.log(`   📡 Cache duration: ${this.cacheDuration / 60000} minutes`);
    }
  }

  /**
   * Busca clima atual por coordenadas
   */
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherResult | null> {
    if (!this.isEnabled) {
      return this.getFallbackWeather();
    }

    const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;
    
    // Verificar cache primeiro
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        condition: cached.condition as any,
        source: 'cache',
        location: cached.location
      };
    }

    try {
      console.log(`🌤️  Buscando clima atual para ${lat}, ${lng}`);
      
      const response = await this.client.get<WeatherResponse>('/weather', {
        params: { lat, lon: lng }
      });

      const weather = response.data;
      const condition = this.mapWeatherCondition(weather.weather[0].main);
      
      // Salvar no cache
      this.saveToCache(cacheKey, {
        condition,
        timestamp: Date.now(),
        location: weather.name
      });

      return {
        condition,
        temperature: weather.main.temp,
        humidity: weather.main.humidity,
        location: weather.name,
        source: 'api'
      };

    } catch (error: any) {
      console.warn('⚠️  Erro ao buscar clima via API:', error.message);
      return this.getFallbackWeather();
    }
  }

  /**
   * Busca clima por localização de segmento rodoviário
   */
  async getWeatherByLocation(uf: string, br: string, km: number): Promise<WeatherResult | null> {
    try {
      // Converter segmento em coordenadas aproximadas
      const coordinates = this.getCoordinatesForSegment(uf, br, km);
      
      if (!coordinates) {
        console.warn(`⚠️  Coordenadas não encontradas para ${uf}-BR${br} KM ${km}`);
        return this.getFallbackWeather();
      }

      return await this.getCurrentWeather(coordinates.lat, coordinates.lng);

    } catch (error: any) {
      console.error('❌ Erro ao buscar clima por localização:', error.message);
      return this.getFallbackWeather();
    }
  }

  /**
   * Mapeia condição da API para categorias do sistema
   */
  private mapWeatherCondition(apiCondition: string): 'claro' | 'nublado' | 'chuvoso' {
    const condition = apiCondition.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
      return 'chuvoso';
    } else if (condition.includes('clouds') || condition.includes('mist') || condition.includes('fog')) {
      return 'nublado';
    } else {
      return 'claro';
    }
  }

  /**
   * Obtém coordenadas aproximadas para segmento rodoviário
   * Mapeamento básico para principais rodovias brasileiras
   */
  private getCoordinatesForSegment(uf: string, br: string, km: number): { lat: number; lng: number } | null {
    // Mapeamento simplificado para principais rodovias
    const highwayCoordinates: Record<string, { lat: number; lng: number }> = {
      'SP': { lat: -23.5505, lng: -46.6333 }, // São Paulo capital
      'RJ': { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
      'MG': { lat: -19.9167, lng: -43.9345 }, // Belo Horizonte
      'RS': { lat: -30.0346, lng: -51.2177 }, // Porto Alegre
      'PR': { lat: -25.4284, lng: -49.2733 }, // Curitiba
      'SC': { lat: -27.5954, lng: -48.5480 }, // Florianópolis
      'BA': { lat: -12.9777, lng: -38.5016 }, // Salvador
      'PE': { lat: -8.0476, lng: -34.8770 },  // Recife
      'CE': { lat: -3.7319, lng: -38.5267 },  // Fortaleza
      'DF': { lat: -15.7801, lng: -47.9292 }, // Brasília
      'GO': { lat: -16.6869, lng: -49.2648 }, // Goiânia
    };

    // Coordenadas base por UF
    const baseCoord = highwayCoordinates[uf.toUpperCase()];
    if (!baseCoord) {
      return null;
    }

    // Ajustar coordenadas baseado no KM (simulação simples)
    const kmOffset = km / 1000; // 1km = ~0.01 grau
    const latOffset = (Math.random() - 0.5) * kmOffset * 0.1;
    const lngOffset = (Math.random() - 0.5) * kmOffset * 0.1;

    return {
      lat: baseCoord.lat + latOffset,
      lng: baseCoord.lng + lngOffset
    };
  }

  /**
   * Gerencia cache de clima
   */
  private getFromCache(key: string): WeatherCacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.cacheDuration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  private saveToCache(key: string, entry: WeatherCacheEntry): void {
    this.cache.set(key, entry);
    
    // Limitar tamanho do cache (manter últimos 100 entradas)
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  /**
   * Retorna clima padrão quando API falha
   */
  private getFallbackWeather(): WeatherResult {
    return {
      condition: 'claro',
      source: 'fallback'
    };
  }

  /**
   * Verifica se o serviço está disponível
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * Limpa cache (útil para testes)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): { size: number; duration: number } {
    return {
      size: this.cache.size,
      duration: this.cacheDuration
    };
  }
}

// Export singleton
export default new WeatherApiService();
