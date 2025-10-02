import { Request, Response, NextFunction } from 'express';

// TODO: Substituir por dados reais do banco de dados
const mockRiskZones: any[] = [];

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
      // TODO: Salvar no banco de dados
      const newZone = {
        id: Date.now(),
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
