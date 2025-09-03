import express from 'express';
import cors from 'cors';
import { environment } from './config/environment';
import { logger } from './utils/logger';

const app = express();

// Middlewares básicos
app.use(cors({
  origin: environment.cors.origin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: environment.NODE_ENV,
    message: 'Sistema de Monitoramento Sompo - Backend funcionando!'
  });
});

// API básica
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API Sompo Monitoring - Sistema de Monitoramento de Cargas',
    version: '1.0.0',
    status: 'Funcionando com dados mockados',
    endpoints: {
      auth: '/api/v1/auth',
      shipments: '/api/v1/shipments',
      vehicles: '/api/v1/vehicles',
      monitoring: '/api/v1/monitoring',
      alerts: '/api/v1/alerts',
      risks: '/api/v1/risks',
      users: '/api/v1/users'
    }
  });
});

// Rotas mockadas para demonstração
app.get('/api/v1/auth/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login simulado',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: 'admin.sompo',
      role: 'admin'
    }
  });
});

app.get('/api/v1/shipments', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        code: 'SHP-2024-001',
        status: 'em_transito',
        origin: 'São Paulo, SP',
        destination: 'Rio de Janeiro, RJ',
        value: 125000,
        vehicle_id: 1
      },
      {
        id: 2,
        code: 'SHP-2024-002',
        status: 'em_transito',
        origin: 'Belo Horizonte, MG',
        destination: 'Brasília, DF',
        value: 89000,
        vehicle_id: 2
      }
    ]
  });
});

app.get('/api/v1/monitoring/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      total_shipments: 4,
      active_shipments: 3,
      total_alerts: 5,
      critical_alerts: 1,
      risk_zones: 6
    }
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
app.listen(environment.PORT, environment.HOST, () => {
  logger.info(`🚀 Servidor rodando em http://${environment.HOST}:${environment.PORT}`);
  logger.info(`📊 Ambiente: ${environment.NODE_ENV}`);
  logger.info(`🔗 Health Check: http://${environment.HOST}:${environment.PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, fechando servidor...');
  process.exit(0);
});

