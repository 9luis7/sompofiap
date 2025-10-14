import * as fs from 'fs';
import * as path from 'path';

interface HighwayInfo {
  br: string;
  name: string;
  min_km: number;
  max_km: number;
  accidents: number;
  length_km: number;
}

interface HighwaysByUF {
  [uf: string]: HighwayInfo[];
}

/**
 * Serviço para lookup de rodovias por UF com nomes conhecidos e limites de quilometragem
 * Baseado em dados reais do DATATRAN
 */
export class HighwayLookupService {
  private highwaysData: HighwaysByUF = {};
  private lastLoadTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.loadHighwaysData();
  }

  /**
   * Carrega dados de rodovias do arquivo JSON
   */
  private loadHighwaysData(): void {
    try {
      const dataPath = path.join(process.cwd(), 'data', 'highways_by_uf.json');
      const data = fs.readFileSync(dataPath, 'utf-8');
      this.highwaysData = JSON.parse(data);
      this.lastLoadTime = Date.now();
      console.log(`✅ Dados de rodovias carregados: ${Object.keys(this.highwaysData).length} UFs`);
    } catch (error) {
      console.error('❌ Erro ao carregar dados de rodovias:', error);
      this.highwaysData = {};
    }
  }

  /**
   * Verifica se os dados precisam ser recarregados
   */
  private shouldReload(): boolean {
    return Date.now() - this.lastLoadTime > this.CACHE_DURATION;
  }

  /**
   * Recarrega dados se necessário
   */
  private ensureDataLoaded(): void {
    if (this.shouldReload()) {
      this.loadHighwaysData();
    }
  }

  /**
   * Retorna todas as rodovias de uma UF específica
   */
  getHighwaysByUF(uf: string): HighwayInfo[] {
    this.ensureDataLoaded();
    
    const normalizedUF = uf.toUpperCase();
    return this.highwaysData[normalizedUF] || [];
  }

  /**
   * Retorna informações de uma rodovia específica
   */
  getHighwayInfo(uf: string, br: string): HighwayInfo | null {
    const highways = this.getHighwaysByUF(uf);
    return highways.find(hw => hw.br === br) || null;
  }

  /**
   * Valida se um quilômetro está dentro dos limites de uma rodovia
   */
  validateKilometer(uf: string, br: string, km: number): {
    valid: boolean;
    highway?: HighwayInfo;
    message?: string;
  } {
    const highway = this.getHighwayInfo(uf, br);
    
    if (!highway) {
      return {
        valid: false,
        message: `Rodovia BR-${br} não encontrada no estado ${uf}`
      };
    }

    if (km < highway.min_km || km > highway.max_km) {
      return {
        valid: false,
        highway,
        message: `KM ${km} está fora dos limites da ${highway.name} (KM ${highway.min_km}-${highway.max_km})`
      };
    }

    return {
      valid: true,
      highway
    };
  }

  /**
   * Retorna todas as UFs disponíveis
   */
  getAvailableUFs(): string[] {
    this.ensureDataLoaded();
    return Object.keys(this.highwaysData).sort();
  }

  /**
   * Retorna estatísticas gerais
   */
  getStatistics(): {
    total_ufs: number;
    total_highways: number;
    most_dangerous_highways: Array<HighwayInfo & { uf: string }>;
  } {
    this.ensureDataLoaded();
    
    const total_ufs = Object.keys(this.highwaysData).length;
    const total_highways = Object.values(this.highwaysData).reduce((sum, highways) => sum + highways.length, 0);
    
    // Encontrar as 10 rodovias mais perigosas
    const allHighways: Array<HighwayInfo & { uf: string }> = [];
    Object.entries(this.highwaysData).forEach(([uf, highways]) => {
      highways.forEach(hw => {
        allHighways.push({ ...hw, uf });
      });
    });
    
    const most_dangerous_highways = allHighways
      .sort((a, b) => b.accidents - a.accidents)
      .slice(0, 10);

    return {
      total_ufs,
      total_highways,
      most_dangerous_highways
    };
  }

  /**
   * Busca rodovias por nome (busca parcial)
   */
  searchHighways(query: string, uf?: string): Array<HighwayInfo & { uf: string }> {
    this.ensureDataLoaded();
    
    const results: Array<HighwayInfo & { uf: string }> = [];
    const searchTerm = query.toLowerCase();
    
    Object.entries(this.highwaysData).forEach(([stateUF, highways]) => {
      if (uf && stateUF !== uf.toUpperCase()) return;
      
      highways.forEach(hw => {
        if (hw.name.toLowerCase().includes(searchTerm) || 
            hw.br.includes(searchTerm)) {
          results.push({ ...hw, uf: stateUF });
        }
      });
    });
    
    return results.sort((a, b) => b.accidents - a.accidents);
  }

  /**
   * Retorna sugestões para dropdown baseado em UF
   */
  getDropdownOptions(uf: string): Array<{
    value: string;
    label: string;
    br: string;
    min_km: number;
    max_km: number;
    accidents: number;
  }> {
    const highways = this.getHighwaysByUF(uf);
    
    return highways.map(hw => ({
      value: hw.br,
      label: `${hw.name} (KM ${hw.min_km}-${hw.max_km})`,
      br: hw.br,
      min_km: hw.min_km,
      max_km: hw.max_km,
      accidents: hw.accidents
    }));
  }
}

// Instância singleton
export const highwayLookupService = new HighwayLookupService();
