import { Request, Response, NextFunction } from 'express';

// Dados mockados realistas de veículos brasileiros
const mockVehicles = [
  {
    id: 1,
    license_plate: 'ABC-1234',
    vehicle_type: 'Bitrem',
    capacity_kg: 45000,
    owner_company: 'Transportadora São Paulo Ltda',
    iot_device_id: 'IOT-SP-001',
    is_active: true,
    current_location: { lat: -23.5505, lng: -46.6333 }, // São Paulo
    status: 'in_transit',
    driver: 'João Silva',
    last_update: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    license_plate: 'DEF-5678',
    vehicle_type: 'Cavalo Mecânico + Prancha',
    capacity_kg: 28000,
    owner_company: 'Logística Nordeste S.A.',
    iot_device_id: 'IOT-BA-002',
    is_active: true,
    current_location: { lat: -12.9714, lng: -38.5014 }, // Salvador
    status: 'loading',
    driver: 'Maria Santos',
    last_update: new Date(Date.now() - 300000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    license_plate: 'GHI-9012',
    vehicle_type: 'Truck 3/4',
    capacity_kg: 12000,
    owner_company: 'Distribuidora Rio Ltda',
    iot_device_id: 'IOT-RJ-003',
    is_active: true,
    current_location: { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
    status: 'stopped',
    driver: 'Carlos Oliveira',
    last_update: new Date(Date.now() - 600000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    license_plate: 'JKL-3456',
    vehicle_type: 'Bitrem',
    capacity_kg: 48000,
    owner_company: 'Transportes Belo Horizonte',
    iot_device_id: 'IOT-MG-004',
    is_active: true,
    current_location: { lat: -19.9191, lng: -43.9386 }, // Belo Horizonte
    status: 'in_transit',
    driver: 'Ana Pereira',
    last_update: new Date(Date.now() - 120000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 5,
    license_plate: 'MNO-7890',
    vehicle_type: 'Cavalo Mecânico + Prancha',
    capacity_kg: 32000,
    owner_company: 'Logística Sul Brasil',
    iot_device_id: 'IOT-RS-005',
    is_active: false,
    current_location: { lat: -30.0346, lng: -51.2177 }, // Porto Alegre
    status: 'maintenance',
    driver: 'Roberto Costa',
    last_update: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
      // Em um sistema real, isso seria salvo no banco
      const newVehicle = {
        id: mockVehicles.length + 1,
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

      // Em um sistema real, isso seria atualizado no banco
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
