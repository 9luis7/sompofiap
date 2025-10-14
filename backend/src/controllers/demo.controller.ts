import { Request, Response } from 'express';

/**
 * Demo controller with static data for immediate testing
 */

// Static demo data - São Paulo highways accidents
const demoAccidents = [
  { lat: -23.55, lng: -46.633, intensity: 0.8, br: '116', km: 523 },
  { lat: -23.563, lng: -46.654, intensity: 0.6, br: '381', km: 145 },
  { lat: -23.547, lng: -46.616, intensity: 0.9, br: '101', km: 234 },
  { lat: -23.532, lng: -46.645, intensity: 0.7, br: '040', km: 789 },
  { lat: -23.576, lng: -46.629, intensity: 0.5, br: '153', km: 456 },
  { lat: -23.524, lng: -46.67, intensity: 0.8, br: '116', km: 534 },
  { lat: -23.589, lng: -46.643, intensity: 0.6, br: '381', km: 167 },
  { lat: -23.512, lng: -46.625, intensity: 0.9, br: '101', km: 298 },
  { lat: -23.598, lng: -46.615, intensity: 0.7, br: '040', km: 801 },
  { lat: -23.541, lng: -46.688, intensity: 0.5, br: '153', km: 478 },
];

const demoShipments = [
  {
    id: 1,
    shipmentNumber: 'DEMO-001',
    status: 'in_transit',
    origin: 'São Paulo - SP',
    destination: 'Rio de Janeiro - RJ',
    cargoType: 'Eletrônicos',
    cargoValue: 125000,
    progress: 45,
    riskScore: 35,
    is_simulated: true,
  },
  {
    id: 2,
    shipmentNumber: 'DEMO-002',
    status: 'in_transit',
    origin: 'Campinas - SP',
    destination: 'Belo Horizonte - MG',
    cargoType: 'Medicamentos',
    cargoValue: 89000,
    progress: 67,
    riskScore: 58,
    is_simulated: true,
  },
  {
    id: 3,
    shipmentNumber: 'DEMO-003',
    status: 'in_transit',
    origin: 'Santos - SP',
    destination: 'Curitiba - PR',
    cargoType: 'Alimentos',
    cargoValue: 45000,
    progress: 23,
    riskScore: 22,
    is_simulated: true,
  },
];

export const demoController = {
  // GET /api/v1/demo/heatmap
  getHeatmap: (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        points: demoAccidents,
        count: demoAccidents.length,
      },
    });
  },

  // GET /api/v1/demo/shipments
  getShipments: (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        shipments: demoShipments,
        total: demoShipments.length,
      },
    });
  },

  // GET /api/v1/demo/dashboard
  getDashboard: (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        activeShipments: 3,
        activeAlerts: 2,
        criticalZones: 5,
        totalValue: 259000,
        statistics: {
          shipmentsInTransit: 3,
          shipmentsCompleted: 12,
          averageRisk: 38,
        },
      },
    });
  },

  // GET /api/v1/demo/alerts
  getAlerts: (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        alerts: [
          {
            id: 1,
            title: 'Zona de Alto Risco - BR-116',
            severity: 'high',
            shipment_number: 'DEMO-001',
            br: '116',
            uf: 'SP',
            km: 523,
            risk_score: 75,
            location: { lat: -23.55, lng: -46.633 },
          },
          {
            id: 2,
            title: 'Trânsito Intenso - BR-381',
            severity: 'medium',
            shipment_number: 'DEMO-002',
            br: '381',
            uf: 'MG',
            km: 145,
            risk_score: 58,
            location: { lat: -23.563, lng: -46.654 },
          },
        ],
      },
    });
  },
};
