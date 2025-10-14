import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Controller para dados reais do Excel - DATATRAN
 * Lê o arquivo Excel diretamente, sem banco de dados
 */

interface CacheData {
  data: any[];
  lastModified: number;
}

const cache: CacheData = {
  data: [],
  lastModified: 0,
};

function getExcelPath(): string {
  return path.join(process.cwd(), '..', 'DadosReais', 'dados_acidentes.xlsx');
}

function loadExcelData(): any[] {
  const excelPath = getExcelPath();

  try {
    // Verificar se precisa recarregar (cache inteligente)
    const stats = fs.statSync(excelPath);
    if (cache.data.length > 0 && stats.mtimeMs <= cache.lastModified) {
      return cache.data;
    }

    console.log('📖 Carregando dados do Excel:', excelPath);
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    cache.data = data;
    cache.lastModified = stats.mtimeMs;
    console.log(`✅ ${data.length} registros carregados do Excel`);

    return data;
  } catch (error: any) {
    console.error('❌ Erro ao ler Excel:', error.message);
    return [];
  }
}

export const realDataController = {
  /**
   * GET /api/v1/real-data/heatmap
   * Retorna pontos para mapa de calor
   */
  getHeatmap: (req: Request, res: Response) => {
    try {
      const data = loadExcelData();
      const { limit = 2000, year, uf, br } = req.query;

      let filtered = data.filter((row: any) => row.latitude && row.longitude);

      // Filtros opcionais
      if (year) {
        filtered = filtered.filter((row: any) => {
          const rowYear = new Date(row.data_inversa || row.data).getFullYear();
          return rowYear.toString() === year;
        });
      }

      if (uf) {
        filtered = filtered.filter((row: any) => row.uf === uf);
      }

      if (br) {
        filtered = filtered.filter((row: any) => row.br === br);
      }

      // Limitar quantidade para performance
      const maxPoints = parseInt(limit as string);
      const points = filtered.slice(0, maxPoints).map((row: any) => ({
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude),
        intensity: row.mortos > 0 ? 1.0 : row.feridos_graves > 0 ? 0.7 : 0.4,
      }));

      res.json({
        success: true,
        data: {
          points,
          total_records: data.length,
          filtered_records: filtered.length,
          showing: points.length,
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
   * GET /api/v1/real-data/summary
   * Retorna resumo estatístico geral
   */
  getSummary: (req: Request, res: Response) => {
    try {
      const data = loadExcelData();

      const totalAcidentes = data.length;
      const comVitimas = data.filter(
        (row: any) =>
          (row.mortos || 0) > 0 || (row.feridos_leves || 0) > 0 || (row.feridos_graves || 0) > 0
      ).length;

      const totalMortos = data.reduce(
        (sum: number, row: any) => sum + (parseInt(row.mortos) || 0),
        0
      );
      const totalFeridosGraves = data.reduce(
        (sum: number, row: any) => sum + (parseInt(row.feridos_graves) || 0),
        0
      );
      const totalFeridosLeves = data.reduce(
        (sum: number, row: any) => sum + (parseInt(row.feridos_leves) || 0),
        0
      );

      // UFs mais perigosas
      const ufStats: any = {};
      data.forEach((row: any) => {
        const uf = row.uf || 'Desconhecido';
        if (!ufStats[uf]) {
          ufStats[uf] = { acidentes: 0, mortos: 0, feridos: 0 };
        }
        ufStats[uf].acidentes++;
        ufStats[uf].mortos += parseInt(row.mortos) || 0;
        ufStats[uf].feridos +=
          (parseInt(row.feridos_leves) || 0) + (parseInt(row.feridos_graves) || 0);
      });

      const topUFs = Object.entries(ufStats)
        .sort((a: any, b: any) => b[1].acidentes - a[1].acidentes)
        .slice(0, 5)
        .map(([uf, stats]: any) => ({
          uf,
          ...stats,
        }));

      res.json({
        success: true,
        data: {
          total_acidentes: totalAcidentes,
          com_vitimas: comVitimas,
          sem_vitimas: totalAcidentes - comVitimas,
          total_mortos: totalMortos,
          total_feridos_graves: totalFeridosGraves,
          total_feridos_leves: totalFeridosLeves,
          total_feridos: totalFeridosGraves + totalFeridosLeves,
          periodo: '2007-2025',
          top_ufs: topUFs,
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
   * GET /api/v1/real-data/by-highway?br=116
   * Retorna estatísticas por rodovia
   */
  getByHighway: (req: Request, res: Response) => {
    try {
      const data = loadExcelData();
      const { br, uf } = req.query;

      let filtered = data;
      if (uf) {
        filtered = filtered.filter((row: any) => row.uf === uf);
      }

      // Estatísticas por BR
      const brStats: any = {};
      filtered.forEach((row: any) => {
        const highway = row.br || 'Desconhecida';
        if (!brStats[highway]) {
          brStats[highway] = {
            acidentes: 0,
            mortos: 0,
            feridos_graves: 0,
            feridos_leves: 0,
            ufs: new Set(),
          };
        }
        brStats[highway].acidentes++;
        brStats[highway].mortos += parseInt(row.mortos) || 0;
        brStats[highway].feridos_graves += parseInt(row.feridos_graves) || 0;
        brStats[highway].feridos_leves += parseInt(row.feridos_leves) || 0;
        if (row.uf) brStats[highway].ufs.add(row.uf);
      });

      const rankings = Object.entries(brStats)
        .map(([br, stats]: any) => ({
          br,
          acidentes: stats.acidentes,
          mortos: stats.mortos,
          feridos_graves: stats.feridos_graves,
          feridos_leves: stats.feridos_leves,
          total_vitimas: stats.mortos + stats.feridos_graves + stats.feridos_leves,
          ufs: Array.from(stats.ufs),
          taxa_mortalidade: ((stats.mortos / stats.acidentes) * 100).toFixed(2),
        }))
        .sort((a: any, b: any) => b.acidentes - a.acidentes)
        .slice(0, 20);

      // Se BR específica foi solicitada
      if (br) {
        const specificBR = rankings.find((r: any) => r.br === br);
        res.json({
          success: true,
          data: {
            br_info: specificBR || null,
            all_rankings: rankings,
          },
        });
      } else {
        res.json({
          success: true,
          data: {
            rankings,
            total_highways: Object.keys(brStats).length,
          },
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * GET /api/v1/real-data/by-region?uf=SP
   * Retorna estatísticas por região/UF
   */
  getByRegion: (req: Request, res: Response) => {
    try {
      const data = loadExcelData();
      const { uf } = req.query;

      // Estatísticas por UF
      const ufStats: any = {};
      data.forEach((row: any) => {
        const estado = row.uf || 'Desconhecido';
        if (!ufStats[estado]) {
          ufStats[estado] = {
            acidentes: 0,
            mortos: 0,
            feridos: 0,
            municipios: new Set(),
            brs: new Set(),
          };
        }
        ufStats[estado].acidentes++;
        ufStats[estado].mortos += parseInt(row.mortos) || 0;
        ufStats[estado].feridos +=
          (parseInt(row.feridos_leves) || 0) + (parseInt(row.feridos_graves) || 0);
        if (row.municipio) ufStats[estado].municipios.add(row.municipio);
        if (row.br) ufStats[estado].brs.add(row.br);
      });

      const rankings = Object.entries(ufStats)
        .map(([uf, stats]: any) => ({
          uf,
          acidentes: stats.acidentes,
          mortos: stats.mortos,
          feridos: stats.feridos,
          municipios_afetados: stats.municipios.size,
          rodovias_afetadas: stats.brs.size,
          taxa_mortalidade: ((stats.mortos / stats.acidentes) * 100).toFixed(2),
        }))
        .sort((a: any, b: any) => b.acidentes - a.acidentes);

      if (uf) {
        const specificUF = rankings.find((r: any) => r.uf === uf);

        // Detalhes dos municípios dentro da UF
        const municipiosData = data
          .filter((row: any) => row.uf === uf)
          .reduce((acc: any, row: any) => {
            const mun = row.municipio || 'Desconhecido';
            if (!acc[mun]) acc[mun] = { acidentes: 0, mortos: 0 };
            acc[mun].acidentes++;
            acc[mun].mortos += parseInt(row.mortos) || 0;
            return acc;
          }, {});

        const topMunicipios = Object.entries(municipiosData)
          .map(([municipio, stats]: any) => ({ municipio, ...stats }))
          .sort((a: any, b: any) => b.acidentes - a.acidentes)
          .slice(0, 10);

        res.json({
          success: true,
          data: {
            uf_info: specificUF || null,
            top_municipios: topMunicipios,
            all_rankings: rankings,
          },
        });
      } else {
        res.json({
          success: true,
          data: {
            rankings,
            total_ufs: Object.keys(ufStats).length,
          },
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  /**
   * GET /api/v1/real-data/timeline?year=2024&month=3
   * Retorna análise temporal
   */
  getTimeline: (req: Request, res: Response) => {
    try {
      const data = loadExcelData();
      const { year, month, groupBy = 'month' } = req.query;

      let filtered = data;

      if (year) {
        filtered = filtered.filter((row: any) => {
          const rowYear = new Date(row.data_inversa || row.data).getFullYear();
          return rowYear.toString() === year;
        });
      }

      if (month) {
        filtered = filtered.filter((row: any) => {
          const rowMonth = new Date(row.data_inversa || row.data).getMonth() + 1;
          return rowMonth.toString() === month;
        });
      }

      // Agrupar por período
      const timelineData: any = {};
      filtered.forEach((row: any) => {
        const date = new Date(row.data_inversa || row.data);
        let key: string;

        if (groupBy === 'year') {
          key = date.getFullYear().toString();
        } else if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (groupBy === 'day') {
          key = date.toISOString().split('T')[0];
        } else {
          key = date.getFullYear().toString();
        }

        if (!timelineData[key]) {
          timelineData[key] = { acidentes: 0, mortos: 0, feridos: 0 };
        }

        timelineData[key].acidentes++;
        timelineData[key].mortos += parseInt(row.mortos) || 0;
        timelineData[key].feridos +=
          (parseInt(row.feridos_leves) || 0) + (parseInt(row.feridos_graves) || 0);
      });

      const timeline = Object.entries(timelineData)
        .map(([periodo, stats]: [string, any]) => ({ periodo, ...stats }))
        .sort((a, b) => a.periodo.localeCompare(b.periodo));

      res.json({
        success: true,
        data: {
          timeline,
          total_periods: timeline.length,
          group_by: groupBy,
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
   * GET /api/v1/real-data/top-risks
   * Retorna os trechos mais perigosos (BR + KM)
   */
  getTopRisks: (req: Request, res: Response) => {
    try {
      const data = loadExcelData();
      const { limit = 20, uf } = req.query;

      let filtered = data.filter((row: any) => row.br && row.km);

      if (uf) {
        filtered = filtered.filter((row: any) => row.uf === uf);
      }

      // Agrupar por BR + KM (segmento de 10km)
      const segmentStats: any = {};
      filtered.forEach((row: any) => {
        const br = row.br;
        const kmBase = Math.floor(parseFloat(row.km) / 10) * 10; // Agrupar em segmentos de 10km
        const ufRow = row.uf;
        const key = `${ufRow}-BR${br}-KM${kmBase}`;

        if (!segmentStats[key]) {
          segmentStats[key] = {
            uf: ufRow,
            br,
            km_inicio: kmBase,
            km_fim: kmBase + 10,
            acidentes: 0,
            mortos: 0,
            feridos: 0,
            municipios: new Set(),
          };
        }

        segmentStats[key].acidentes++;
        segmentStats[key].mortos += parseInt(row.mortos) || 0;
        segmentStats[key].feridos +=
          (parseInt(row.feridos_leves) || 0) + (parseInt(row.feridos_graves) || 0);
        if (row.municipio) segmentStats[key].municipios.add(row.municipio);
      });

      const topRisks = Object.values(segmentStats)
        .map((seg: any) => ({
          ...seg,
          municipios: Array.from(seg.municipios),
          total_vitimas: seg.mortos + seg.feridos,
          score_risco: seg.mortos * 10 + seg.feridos * 2 + seg.acidentes,
        }))
        .sort((a: any, b: any) => b.score_risco - a.score_risco)
        .slice(0, parseInt(limit as string));

      res.json({
        success: true,
        data: {
          top_risks: topRisks,
          total_segments: Object.keys(segmentStats).length,
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
   * GET /api/v1/real-data/dashboard
   * Retorna dados para dashboard (versão simplificada do summary)
   */
  getDashboard: (req: Request, res: Response) => {
    try {
      const data = loadExcelData();

      const totalAcidentes = data.length;
      const totalMortos = data.reduce(
        (sum: number, row: any) => sum + (parseInt(row.mortos) || 0),
        0
      );
      const totalFeridos = data.reduce(
        (sum: number, row: any) =>
          sum + (parseInt(row.feridos_leves) || 0) + (parseInt(row.feridos_graves) || 0),
        0
      );

      // Rodovia mais perigosa
      const brStats: any = {};
      data.forEach((row: any) => {
        const br = row.br || 'Desconhecida';
        if (!brStats[br]) brStats[br] = 0;
        brStats[br]++;
      });

      const rodoviasMaisPeriogosas = Object.entries(brStats)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 1);

      const piorrBR = rodoviasMaisPeriogosas[0]
        ? { br: rodoviasMaisPeriogosas[0][0], acidentes: rodoviasMaisPeriogosas[0][1] }
        : null;

      res.json({
        success: true,
        data: {
          total_acidentes: totalAcidentes,
          total_mortos: totalMortos,
          total_feridos: totalFeridos,
          rodovia_mais_perigosa: piorrBR,
          periodo: '2007-2025',
          fonte: 'DATATRAN',
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
   * GET /api/v1/real-data/reload
   * Força recarregar dados do Excel
   */
  reload: (req: Request, res: Response) => {
    cache.data = [];
    cache.lastModified = 0;
    const data = loadExcelData();

    res.json({
      success: true,
      message: 'Dados recarregados com sucesso',
      records: data.length,
    });
  },
};
