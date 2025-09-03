import { Request, Response, NextFunction } from 'express';
import Alert from '../models/Alert';
import Shipment from '../models/Shipment';
import Vehicle from '../models/Vehicle';
import Driver from '../models/Driver';
import { AppError } from '../middleware/error.middleware';

// Função para buscar todos os alertas não reconhecidos
async function getActiveAlerts() {
  try {
    const alerts = await Alert.findAll({
      where: {
        is_acknowledged: false,
      },
      order: [['timestamp', 'DESC']],
      limit: 10,
    });

    const alertsWithDetails = await Promise.all(
      alerts.map(async (alert) => {
        // Buscar shipment relacionado
        const shipment = await Shipment.findByPk(alert.shipment_id);
        const vehicle = shipment ? await Vehicle.findByPk(shipment.vehicle_id) : null;
        const driver = shipment ? await Driver.findByPk(shipment.driver_id) : null;

        return {
          id: alert.id,
          shipment_id: alert.shipment_id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          message: alert.message,
          location: alert.location,
          is_acknowledged: alert.is_acknowledged,
          acknowledged_by: alert.acknowledged_by,
          acknowledged_at: alert.acknowledged_at,
          timestamp: alert.timestamp,
          created_at: alert.created_at,
          shipment_info: {
            shipment_number: shipment?.shipment_number,
            cargo_type: shipment?.cargo_type,
            cargo_value: shipment?.cargo_value,
            vehicle_plate: vehicle?.license_plate,
            driver: driver?.full_name,
            driver_phone: driver?.phone,
          },
          coordinates: alert.location ? {
            lat: alert.location.coordinates[1],
            lng: alert.location.coordinates[0],
          } : null,
        };
      })
    );

    return alertsWithDetails;
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return [];
  }
}

// Função para buscar detalhes de um alerta específico
async function getAlertDetails(alertId: number) {
  try {
    const alert = await Alert.findByPk(alertId);

    if (!alert) {
      return null;
    }

    // Buscar shipment relacionado
    const shipment = await Shipment.findByPk(alert.shipment_id);
    const vehicle = shipment ? await Vehicle.findByPk(shipment.vehicle_id) : null;
    const driver = shipment ? await Driver.findByPk(shipment.driver_id) : null;

    return {
      id: alert.id,
      shipment_id: alert.shipment_id,
      alert_type: alert.alert_type,
      severity: alert.severity,
      message: alert.message,
      location: alert.location,
      is_acknowledged: alert.is_acknowledged,
      acknowledged_by: alert.acknowledged_by,
      acknowledged_at: alert.acknowledged_at,
      timestamp: alert.timestamp,
      created_at: alert.created_at,
      shipment_info: {
        shipment_number: shipment?.shipment_number,
        cargo_type: shipment?.cargo_type,
        cargo_value: shipment?.cargo_value,
        vehicle_plate: vehicle?.license_plate,
        vehicle_type: vehicle?.vehicle_type,
        driver: driver?.full_name,
        driver_phone: driver?.phone,
        driver_email: driver?.email,
        origin_address: shipment?.origin_address,
        destination_address: shipment?.destination_address,
        status: shipment?.status,
      },
      coordinates: alert.location ? {
        lat: alert.location.coordinates[1],
        lng: alert.location.coordinates[0],
      } : null,
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do alerta:', error);
    return null;
  }
}

// Controller de alertas
export const alertController = {
  // Obter todos os alertas
  getAllAlerts: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alerts = await getActiveAlerts();
      
      res.json({
        success: true,
        data: {
          alerts,
          total: alerts.length,
        },
      });
    } catch (error) {
      console.error('Erro ao obter alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  },

  // Obter alerta por ID
  getAlertById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alertId = parseInt(req.params.id);
      
      if (isNaN(alertId)) {
        res.status(400).json({
          success: false,
          message: 'ID do alerta inválido',
        });
        return;
      }

      const alert = await getAlertDetails(alertId);
      
      if (!alert) {
        res.status(404).json({
          success: false,
          message: 'Alerta não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: { alert },
      });
    } catch (error) {
      console.error('Erro ao obter alerta por ID:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  },

  // Reconhecer alerta
  acknowledgeAlert: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alertId = parseInt(req.params.id);
              const userId = req.user?.userId; // Assumindo que o usuário está autenticado
      
      if (isNaN(alertId)) {
        res.status(400).json({
          success: false,
          message: 'ID do alerta inválido',
        });
        return;
      }

      const alert = await Alert.findByPk(alertId);
      
      if (!alert) {
        res.status(404).json({
          success: false,
          message: 'Alerta não encontrado',
        });
        return;
      }

      if (alert.is_acknowledged) {
        res.status(400).json({
          success: false,
          message: 'Alerta já foi reconhecido',
        });
        return;
      }

      // Atualizar alerta
      await alert.update({
        is_acknowledged: true,
        acknowledged_by: userId,
        acknowledged_at: new Date(),
      });

      res.json({
        success: true,
        message: 'Alerta reconhecido com sucesso',
        data: { alert },
      });
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  },

  // Obter estatísticas de alertas
  getAlertStats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [totalAlerts, acknowledgedAlerts, criticalAlerts, highAlerts] = await Promise.all([
        Alert.count(),
        Alert.count({ where: { is_acknowledged: true } }),
        Alert.count({ where: { severity: 'critical', is_acknowledged: false } }),
        Alert.count({ where: { severity: 'high', is_acknowledged: false } }),
      ]);

      const pendingAlerts = totalAlerts - acknowledgedAlerts;

      res.json({
        success: true,
        data: {
          total: totalAlerts,
          pending: pendingAlerts,
          acknowledged: acknowledgedAlerts,
          critical: criticalAlerts,
          high: highAlerts,
        },
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de alertas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  },
};
