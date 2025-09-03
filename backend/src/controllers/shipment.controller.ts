import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logInfo, logError, logDebug } from '../utils/logger';
import { AppError } from '../middleware/error.middleware';

// Interfaces
interface CreateShipmentRequest {
  shipmentNumber: string;
  vehicleId: number;
  originAddress: string;
  destinationAddress: string;
  cargoType: string;
  cargoValue: number;
  plannedDeparture?: string;
  plannedArrival?: string;
}

interface UpdateShipmentRequest {
  status?: 'planned' | 'in_transit' | 'completed' | 'cancelled' | 'emergency';
  cargoType?: string;
  cargoValue?: number;
  actualDeparture?: string;
  actualArrival?: string;
}

// Controller de shipments
export const shipmentController = {
  // Obter todos os shipments
  getAllShipments: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page = '1',
        limit = '10',
        status,
        vehicleId,
        dateFrom,
        dateTo
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;

      // Dados mockados realistas de cargas brasileiras
      const shipments = [
        {
          id: 1,
          shipmentNumber: 'SHP-2024-001',
          vehicleId: 1,
          status: 'in_transit',
          originAddress: 'São Paulo, SP',
          destinationAddress: 'Rio de Janeiro, RJ',
          originCoords: { lat: -23.5505, lng: -46.6333 },
          destinationCoords: { lat: -22.9068, lng: -43.1729 },
          cargoType: 'Eletrônicos Premium',
          cargoValue: 125000.00,
          cargoDescription: 'Smartphones, laptops e acessórios',
          estimatedDeparture: new Date(Date.now() - 3600000).toISOString(),
          actualDeparture: new Date(Date.now() - 3600000).toISOString(),
          estimatedArrival: new Date(Date.now() + 7200000).toISOString(),
          currentRiskLevel: 'medium',
          routeRiskScore: 3.2,
          insuranceValue: 150000.00,
          customerName: 'TechCom Distribuidora Ltda',
          customerContact: '+55 11 99876-5432',
          specialRequirements: 'Temperatura controlada',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          shipmentNumber: 'SHP-2024-002',
          vehicleId: 2,
          status: 'planned',
          originAddress: 'Belo Horizonte, MG',
          destinationAddress: 'Salvador, BA',
          originCoords: { lat: -19.9191, lng: -43.9386 },
          destinationCoords: { lat: -12.9714, lng: -38.5014 },
          cargoType: 'Medicamentos Controlados',
          cargoValue: 89000.00,
          cargoDescription: 'Vacinas e medicamentos especiais',
          estimatedDeparture: new Date(Date.now() + 7200000).toISOString(),
          estimatedArrival: new Date(Date.now() + 21600000).toISOString(),
          currentRiskLevel: 'high',
          routeRiskScore: 4.8,
          insuranceValue: 120000.00,
          customerName: 'FarmaBrasil S.A.',
          customerContact: '+55 31 98765-4321',
          specialRequirements: 'Refrigerado, segurança máxima',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 3,
          shipmentNumber: 'SHP-2024-003',
          vehicleId: 3,
          status: 'completed',
          originAddress: 'Porto Alegre, RS',
          destinationAddress: 'São Paulo, SP',
          originCoords: { lat: -30.0346, lng: -51.2177 },
          destinationCoords: { lat: -23.5505, lng: -46.6333 },
          cargoType: 'Alimentos Não Perecíveis',
          cargoValue: 45000.00,
          cargoDescription: 'Arroz, feijão, óleo e conservas',
          estimatedDeparture: new Date(Date.now() - 86400000 * 2).toISOString(),
          actualDeparture: new Date(Date.now() - 86400000 * 2).toISOString(),
          estimatedArrival: new Date(Date.now() - 86400000).toISOString(),
          actualArrival: new Date(Date.now() - 86400000).toISOString(),
          currentRiskLevel: 'low',
          routeRiskScore: 1.5,
          insuranceValue: 55000.00,
          customerName: 'SuperMercados União Ltda',
          customerContact: '+55 51 97654-3210',
          specialRequirements: 'Carga seca, sem refrigeração',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 4,
          shipmentNumber: 'SHP-2024-004',
          vehicleId: 4,
          status: 'in_transit',
          originAddress: 'Recife, PE',
          destinationAddress: 'Fortaleza, CE',
          originCoords: { lat: -8.0476, lng: -34.8770 },
          destinationCoords: { lat: -3.7319, lng: -38.5267 },
          cargoType: 'Roupas e Acessórios',
          cargoValue: 78000.00,
          cargoDescription: 'Confecções e artigos de vestuário',
          estimatedDeparture: new Date(Date.now() - 1800000).toISOString(),
          actualDeparture: new Date(Date.now() - 1800000).toISOString(),
          estimatedArrival: new Date(Date.now() + 10800000).toISOString(),
          currentRiskLevel: 'high',
          routeRiskScore: 4.2,
          insuranceValue: 95000.00,
          customerName: 'Moda Nordeste Distribuidora',
          customerContact: '+55 81 96543-2109',
          specialRequirements: 'Carga frágil, cuidados especiais',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 5,
          shipmentNumber: 'SHP-2024-005',
          vehicleId: 1,
          status: 'emergency',
          originAddress: 'Goiânia, GO',
          destinationAddress: 'Brasília, DF',
          originCoords: { lat: -16.6869, lng: -49.2648 },
          destinationCoords: { lat: -15.7942, lng: -47.8822 },
          cargoType: 'Equipamentos Industriais',
          cargoValue: 320000.00,
          cargoDescription: 'Máquinas e equipamentos pesados',
          estimatedDeparture: new Date(Date.now() - 7200000).toISOString(),
          actualDeparture: new Date(Date.now() - 7200000).toISOString(),
          estimatedArrival: new Date(Date.now() + 3600000).toISOString(),
          currentRiskLevel: 'critical',
          routeRiskScore: 5.9,
          insuranceValue: 450000.00,
          customerName: 'Indústria Tech Brasil S.A.',
          customerContact: '+55 62 95432-1098',
          specialRequirements: 'Carga especial, escolta obrigatória',
          emergencyReason: 'Veículo parado em zona de alto risco - BR-040',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Aplicar filtros (simulação)
      let filteredShipments = shipments;

      if (status) {
        filteredShipments = filteredShipments.filter(s => s.status === status);
      }

      if (vehicleId) {
        filteredShipments = filteredShipments.filter(s => s.vehicleId === parseInt(vehicleId as string, 10));
      }

      // Paginação
      const paginatedShipments = filteredShipments.slice(offset, offset + limitNum);

      res.json({
        success: true,
        data: {
          shipments: paginatedShipments,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: filteredShipments.length,
            pages: Math.ceil(filteredShipments.length / limitNum)
          }
        }
      });

    } catch (error) {
      logError('Erro ao obter shipments', error as Error);
      next(error);
    }
  },

  // Obter shipment por ID
  getShipmentById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const shipmentId = parseInt(id, 10);

      if (isNaN(shipmentId)) {
        throw new AppError('ID do shipment inválido', 400);
      }

      // TODO: Buscar no banco de dados
      // Simulação
      const shipment = {
        id: shipmentId,
        shipmentNumber: 'SHP001',
        vehicleId: 1,
        status: 'in_transit',
        originAddress: 'São Paulo, SP',
        destinationAddress: 'Rio de Janeiro, RJ',
        cargoType: 'Eletrônicos',
        cargoValue: 50000.00,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!shipment) {
        throw new AppError('Shipment não encontrado', 404);
      }

      res.json({
        success: true,
        data: { shipment }
      });

    } catch (error) {
      logError('Erro ao obter shipment por ID', error as Error);
      next(error);
    }
  },

  // Criar novo shipment
  createShipment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados de entrada inválidos', 400, errors.array());
      }

      const shipmentData: CreateShipmentRequest = req.body;

      // TODO: Salvar no banco de dados
      // Simulação
      const newShipment = {
        id: Date.now(),
        ...shipmentData,
        status: 'planned' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      logInfo('Novo shipment criado', { shipmentId: newShipment.id, shipmentNumber: newShipment.shipmentNumber });

      res.status(201).json({
        success: true,
        message: 'Shipment criado com sucesso',
        data: { shipment: newShipment }
      });

    } catch (error) {
      logError('Erro ao criar shipment', error as Error);
      next(error);
    }
  },

  // Atualizar shipment
  updateShipment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados de entrada inválidos', 400, errors.array());
      }

      const { id } = req.params;
      const shipmentId = parseInt(id, 10);
      const updateData: UpdateShipmentRequest = req.body;

      if (isNaN(shipmentId)) {
        throw new AppError('ID do shipment inválido', 400);
      }

      // TODO: Verificar se shipment existe e atualizar no banco
      // Simulação
      const updatedShipment = {
        id: shipmentId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      logInfo('Shipment atualizado', { shipmentId, updates: updateData });

      res.json({
        success: true,
        message: 'Shipment atualizado com sucesso',
        data: { shipment: updatedShipment }
      });

    } catch (error) {
      logError('Erro ao atualizar shipment', error as Error);
      next(error);
    }
  },

  // Deletar shipment
  deleteShipment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const shipmentId = parseInt(id, 10);

      if (isNaN(shipmentId)) {
        throw new AppError('ID do shipment inválido', 400);
      }

      // TODO: Verificar se shipment existe e pode ser deletado
      // TODO: Deletar do banco (soft delete)

      logInfo('Shipment deletado', { shipmentId });

      res.json({
        success: true,
        message: 'Shipment deletado com sucesso'
      });

    } catch (error) {
      logError('Erro ao deletar shipment', error as Error);
      next(error);
    }
  },

  // Obter rota do shipment
  getShipmentRoute: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const shipmentId = parseInt(id, 10);

      if (isNaN(shipmentId)) {
        throw new AppError('ID do shipment inválido', 400);
      }

      // TODO: Buscar rota no banco de dados
      // Simulação
      const route = {
        shipmentId,
        plannedRoute: [
          { lat: -23.5505, lng: -46.6333, address: 'São Paulo, SP' },
          { lat: -22.9068, lng: -43.1729, address: 'Rio de Janeiro, RJ' }
        ],
        actualRoute: [
          { lat: -23.5505, lng: -46.6333, timestamp: new Date().toISOString() }
        ]
      };

      res.json({
        success: true,
        data: { route }
      });

    } catch (error) {
      logError('Erro ao obter rota do shipment', error as Error);
      next(error);
    }
  },

  // Iniciar shipment
  startShipment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const shipmentId = parseInt(id, 10);

      if (isNaN(shipmentId)) {
        throw new AppError('ID do shipment inválido', 400);
      }

      // TODO: Atualizar status no banco e iniciar monitoramento

      logInfo('Shipment iniciado', { shipmentId });

      res.json({
        success: true,
        message: 'Shipment iniciado com sucesso',
        data: {
          shipmentId,
          status: 'in_transit',
          startedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logError('Erro ao iniciar shipment', error as Error);
      next(error);
    }
  },

  // Completar shipment
  completeShipment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const shipmentId = parseInt(id, 10);

      if (isNaN(shipmentId)) {
        throw new AppError('ID do shipment inválido', 400);
      }

      // TODO: Atualizar status para completed

      logInfo('Shipment completado', { shipmentId });

      res.json({
        success: true,
        message: 'Shipment completado com sucesso',
        data: {
          shipmentId,
          status: 'completed',
          completedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logError('Erro ao completar shipment', error as Error);
      next(error);
    }
  },

  // Parada de emergência
  emergencyStop: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const shipmentId = parseInt(id, 10);
      const { reason } = req.body;

      if (isNaN(shipmentId)) {
        throw new AppError('ID do shipment inválido', 400);
      }

      // TODO: Atualizar status para emergency e criar alerta

      logInfo('Parada de emergência ativada', { shipmentId, reason });

      res.json({
        success: true,
        message: 'Parada de emergência ativada',
        data: {
          shipmentId,
          status: 'emergency',
          emergencyAt: new Date().toISOString(),
          reason
        }
      });

    } catch (error) {
      logError('Erro na parada de emergência', error as Error);
      next(error);
    }
  }
};
