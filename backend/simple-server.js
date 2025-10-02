const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Sistema de Monitoramento Sompo - Backend funcionando!',
  });
});

// API básica
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API Sompo Monitoring - Sistema de Monitoramento de Cargas',
    version: '1.0.0',
    status: 'Sistema refatorado - Pronto para dados reais via CSV',
    endpoints: {
      auth: '/api/v1/auth',
      shipments: '/api/v1/shipments',
      vehicles: '/api/v1/vehicles',
      monitoring: '/api/v1/monitoring',
      alerts: '/api/v1/alerts',
      risks: '/api/v1/risks',
      users: '/api/v1/users',
    },
  });
});

// Rotas mockadas removidas - usar controllers reais

// Endpoint de login removido - usar controllers reais

// Rotas mockadas removidas - usar controllers reais

// Rotas mockadas removidas - usar controllers reais

// Rotas mockadas removidas - usar controllers reais

// Rotas mockadas removidas - usar controllers reais

// Rotas mockadas removidas - usar controllers reais

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`📊 API: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, fechando servidor...');
  process.exit(0);
});
