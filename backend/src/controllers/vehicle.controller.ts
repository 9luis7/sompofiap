import { Request, Response, NextFunction } from 'express';

// TODO: Substituir por dados reais do banco de dados
const mockVehicles: any[] = [];

export const vehicleController = {
  getAllVehicles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = '1', limit = '10', status, isActive } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      let filteredVehicles = mockVehicles;

      // Aplicar filtros
      if (status) {
        filteredVehicles = filteredVehicles.filter(v => v.status === status);
      }

      if (isActive !== undefined) {
        const activeFilter = isActive === 'true';
        filteredVehicles = filteredVehicles.filter(v => v.is_active === activeFilter);
      }

      // Paginação
      const paginatedVehicles = filteredVehicles.slice(offset, offset + limitNum);

      res.json({
        success: true,
        data: {
          vehicles: paginatedVehicles,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filteredVehicles.length,
            pages: Math.ceil(filteredVehicles.length / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  getVehicleById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id, 10);

      const vehicle = mockVehicles.find(v => v.id === vehicleId);

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: 'Veículo não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: { vehicle }
      });
    } catch (error) {
      next(error);
    }
  },

  createVehicle: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // TODO: Salvar no banco de dados
      const newVehicle = {
        id: Date.now(),
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      res.status(201).json({
        success: true,
        message: 'Veículo criado com sucesso',
        data: { vehicle: newVehicle }
      });
    } catch (error) {
      next(error);
    }
  },

  updateVehicle: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const vehicleId = parseInt(id, 10);

      const vehicle = mockVehicles.find(v => v.id === vehicleId);

      if (!vehicle) {
        res.status(404).json({
          success: false,
          error: 'Veículo não encontrado'
        });
        return;
      }

      // TODO: Atualizar no banco de dados
      const updatedVehicle = {
        ...vehicle,
        ...req.body,
        updated_at: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Veículo atualizado com sucesso',
        data: { vehicle: updatedVehicle }
      });
    } catch (error) {
      next(error);
    }
  }
};
