import { Router } from 'express';
import realDataRoutes from './real-data.routes';
import riskPredictionRoutes from './risk-prediction.routes';
import demoRoutes from './demo.routes';
import highwayLookupRoutes from './highway-lookup.routes';
import ensembleRoutes from './ensemble.routes';

const router = Router();

// Health check da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Sompo - Sistema de Visualização de Dados DATATRAN + Predição de Risco ML',
    version: '2.1.0',
    status: 'Operacional',
      endpoints: {
        realData: '/api/v1/real-data',
        riskPrediction: '/api/v1/risk',
        ensemble: '/api/v1/ensemble',
        demo: '/api/v1/demo',
        highwayLookup: '/api/v1/highways',
        accidents: '/api/v1/accidents (alias para demo)',
        monitoring: '/api/v1/monitoring (alias para demo)',
        shipments: '/api/v1/shipments (alias para demo)',
        alerts: '/api/v1/alerts (alias para demo)',
        simulator: '/api/v1/simulator',
      },
  });
});

// Rotas de dados reais (lê Excel diretamente)
router.use('/real-data', realDataRoutes);

// Rotas de predição de risco (modelo LightGBM)
router.use('/risk', riskPredictionRoutes);

// Rotas de predição com ensemble (múltiplos modelos)
router.use('/ensemble', ensembleRoutes);

// Rotas de lookup de rodovias (baseado em dados reais)
router.use('/highways', highwayLookupRoutes);

// Rotas de demonstração (dados estáticos para testes)
router.use('/demo', demoRoutes);

// Aliases para compatibilidade com o frontend
router.use('/accidents', demoRoutes);
router.use('/monitoring', demoRoutes);
router.use('/shipments', demoRoutes);
router.use('/alerts', demoRoutes);

// Rotas do simulador (temporariamente usando dados demo)
const simulatorRouter = Router();

// Dados de demonstração para o simulador
const demoShipments = [
  {
    id: 1,
    shipmentNumber: 'DEMO-001',
    status: 'in_transit',
    origin: 'São Paulo - SP',
    destination: 'Rio de Janeiro - RJ',
    cargoType: 'Eletrônicos',
    cargo_value: 125000,
    progress: 45,
    risk_score: 35,
    is_simulated: true,
  },
  {
    id: 2,
    shipmentNumber: 'DEMO-002',
    status: 'in_transit',
    origin: 'Campinas - SP',
    destination: 'Belo Horizonte - MG',
    cargoType: 'Medicamentos',
    cargo_value: 89000,
    progress: 67,
    risk_score: 58,
    is_simulated: true,
  },
  {
    id: 3,
    shipmentNumber: 'DEMO-003',
    status: 'in_transit',
    origin: 'Santos - SP',
    destination: 'Curitiba - PR',
    cargoType: 'Alimentos',
    cargo_value: 45000,
    progress: 23,
    risk_score: 22,
    is_simulated: true,
  },
  {
    id: 4,
    shipmentNumber: 'DEMO-004',
    status: 'in_transit',
    origin: 'São Paulo - SP',
    destination: 'Porto Alegre - RS',
    cargoType: 'Autopeças',
    cargo_value: 156000,
    progress: 78,
    risk_score: 72,
    is_simulated: true,
  },
  {
    id: 5,
    shipmentNumber: 'DEMO-005',
    status: 'in_transit',
    origin: 'Guarulhos - SP',
    destination: 'Salvador - BA',
    cargoType: 'Cosméticos',
    cargo_value: 67000,
    progress: 12,
    risk_score: 18,
    is_simulated: true,
  },
];

// GET /api/v1/simulator/active - Retorna cargas ativas
simulatorRouter.get('/active', (req, res) => {
  res.json({
    success: true,
    data: {
      shipments: demoShipments,
      total: demoShipments.length,
    },
  });
});

// GET /api/v1/simulator/status
simulatorRouter.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      is_running: true,
      active_shipments: demoShipments.length,
      shipments: demoShipments,
    },
  });
});

// POST /api/v1/simulator/start
simulatorRouter.post('/start', (req, res) => {
  res.json({
    success: true,
    message: 'Simulador iniciado (modo demo)',
    data: {
      count: req.body.count || 10,
    },
  });
});

// PUT /api/v1/simulator/pause
simulatorRouter.put('/pause', (req, res) => {
  res.json({
    success: true,
    message: 'Simulador pausado',
  });
});

// DELETE /api/v1/simulator/stop
simulatorRouter.delete('/stop', (req, res) => {
  res.json({
    success: true,
    message: 'Simulador parado',
  });
});

router.use('/simulator', simulatorRouter);

export const setupRoutes = (): Router => {
  return router;
};
