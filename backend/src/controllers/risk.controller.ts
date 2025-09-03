import { Request, Response, NextFunction } from 'express';

// Dados mockados realistas de zonas de risco brasileiras
const mockRiskZones = [
  {
    id: 1,
    zone_name: 'BR-116 Sul - Zona de Alto Risco',
    zone_type: 'red',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-46.6333, -23.5505], // São Paulo
        [-47.8822, -15.7942], // Brasília
        [-43.1729, -22.9068], // Rio de Janeiro
        [-46.6333, -23.5505]  // Volta a São Paulo
      ]]
    },
    risk_score: 8.5,
    incident_count: 45,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    description: 'Rota conhecida por altos índices de roubo de carga',
    recent_incidents: [
      'Roubo de caminhão com eletrônicos - R$ 150.000,00',
      'Assalto a comboio - 3 veículos envolvidos',
      'Furto de medicamentos - R$ 89.000,00'
    ]
  },
  {
    id: 2,
    zone_name: 'BR-101 Norte - Risco Moderado',
    zone_type: 'yellow',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-38.5014, -12.9714], // Salvador
        [-34.8770, -8.0476],  // Recife
        [-35.2087, -5.7945],  // Natal
        [-38.5014, -12.9714]  // Volta a Salvador
      ]]
    },
    risk_score: 4.2,
    incident_count: 23,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    description: 'Zona com ocorrências esporádicas, atenção necessária',
    recent_incidents: [
      'Tentativa de roubo frustrada',
      'Furto de peças do veículo'
    ]
  },
  {
    id: 3,
    zone_name: 'BR-040 - Zona Crítica',
    zone_type: 'red',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-43.9386, -19.9191], // Belo Horizonte
        [-47.8822, -15.7942], // Brasília
        [-43.1729, -22.9068], // Rio de Janeiro
        [-43.9386, -19.9191]  // Volta a BH
      ]]
    },
    risk_score: 9.1,
    incident_count: 67,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    description: 'Uma das rotas mais perigosas do país',
    recent_incidents: [
      'Roubo de equipamentos industriais - R$ 320.000,00',
      'Assalto armado - motorista resgatado',
      'Furto de carga refrigerada - R$ 45.000,00'
    ]
  },
  {
    id: 4,
    zone_name: 'BR-153 - Risco Baixo',
    zone_type: 'green',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-49.2648, -16.6869], // Goiânia
        [-51.2177, -30.0346], // Porto Alegre
        [-47.8822, -15.7942], // Brasília
        [-49.2648, -16.6869]  // Volta a Goiânia
      ]]
    },
    risk_score: 1.8,
    incident_count: 3,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    description: 'Zona considerada segura para transporte',
    recent_incidents: [
      'Incidente isolado - resolvido rapidamente'
    ]
  },
  {
    id: 5,
    zone_name: 'BR-364 Mato Grosso - Risco Alto',
    zone_type: 'red',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-54.6460, -20.4697], // Campo Grande
        [-56.0969, -15.5989], // Cuiabá
        [-47.8822, -15.7942], // Brasília
        [-54.6460, -20.4697]  // Volta a Campo Grande
      ]]
    },
    risk_score: 7.3,
    incident_count: 38,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    description: 'Zona com alta incidência de roubos',
    recent_incidents: [
      'Roubo de soja - R$ 120.000,00',
      'Assalto a carreta - carga recuperada',
      'Furto de defensivos agrícolas'
    ]
  },
  {
    id: 6,
    zone_name: 'Via Dutra - Risco Controlado',
    zone_type: 'yellow',
    boundary: {
      type: 'Polygon',
      coordinates: [[
        [-46.6333, -23.5505], // São Paulo
        [-43.1729, -22.9068], // Rio de Janeiro
        [-44.1048, -22.5299], // Volta Redonda
        [-46.6333, -23.5505]  // Volta a São Paulo
      ]]
    },
    risk_score: 3.7,
    incident_count: 15,
    last_updated: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 35).toISOString(),
    description: 'Zona monitorada com policiamento ostensivo',
    recent_incidents: [
      'Tentativas de roubo frustradas',
      'Incidente com acompanhamento policial'
    ]
  }
];

export const riskController = {
  getRiskZones: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { zone_type } = req.query;

      let filteredZones = mockRiskZones;

      if (zone_type) {
        filteredZones = filteredZones.filter(zone => zone.zone_type === zone_type);
      }

      res.json({
        success: true,
        data: {
          zones: filteredZones,
          summary: {
            total_zones: mockRiskZones.length,
            red_zones: mockRiskZones.filter(z => z.zone_type === 'red').length,
            yellow_zones: mockRiskZones.filter(z => z.zone_type === 'yellow').length,
            green_zones: mockRiskZones.filter(z => z.zone_type === 'green').length,
            average_risk_score: mockRiskZones.reduce((sum, zone) => sum + zone.risk_score, 0) / mockRiskZones.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getRiskZoneById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const zoneId = parseInt(id, 10);

      const zone = mockRiskZones.find(z => z.id === zoneId);

      if (!zone) {
        res.status(404).json({
          success: false,
          error: 'Zona de risco não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: { zone }
      });
    } catch (error) {
      next(error);
    }
  },

  createRiskZone: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Em um sistema real, isso seria salvo no banco
      const newZone = {
        id: mockRiskZones.length + 1,
        ...req.body,
        created_at: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Zona de risco criada com sucesso',
        data: { zone: newZone }
      });
    } catch (error) {
      next(error);
    }
  }
};
