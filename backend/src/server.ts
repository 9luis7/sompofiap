import express from 'express';
import cors from 'cors';
import { environment } from './config/environment';
import { setupRoutes } from './routes/index';
import riskLookupService from './services/risk-lookup.service';
import mlApiClient from './services/ml-api-client.service';

const app = express();

// Middlewares básicos - CORS para desenvolvimento
app.use(
  cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: environment.NODE_ENV,
    message: 'Sistema Sompo - Visualização de Dados DATATRAN',
  });
});

// Register API routes
const apiRoutes = setupRoutes();
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// Start server
async function startServer() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('   🚀 SISTEMA SOMPO - Inicializando...                 ');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // Step 1: Inicializar serviço de predição de risco (scores pré-calculados)
    console.log('📊 [1/3] Inicializando scores pré-calculados...');
    await riskLookupService.initialize();
    console.log('');

    // Step 2: Verificar disponibilidade da API Python de ML
    console.log('🤖 [2/3] Verificando API Python de ML...');
    await mlApiClient.checkAvailability();
    console.log('');

    // Step 3: Iniciar servidor
    console.log('🌐 [3/3] Iniciando servidor web...');
    app.listen(environment.PORT, environment.HOST, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('   ✅ SISTEMA SOMPO - OPERACIONAL                     ');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      console.log(`🌐 Frontend:  http://localhost:8080`);
      console.log(`🔧 Backend:   http://${environment.HOST}:${environment.PORT}`);
      console.log(`📡 API:       http://${environment.HOST}:${environment.PORT}/api/v1`);
      console.log(`💚 Health:    http://${environment.HOST}:${environment.PORT}/health`);
      console.log('');
      console.log('📚 Endpoints Disponíveis:');
      console.log('   📊 Dados Reais:     /api/v1/real-data/*');
      console.log('   🤖 Predição Risco:  /api/v1/risk/*');
      console.log('');
      console.log('🎯 Modos de Predição:');
      console.log('   1️⃣  Scores pré-calculados (rápido, cache)');
      console.log('   2️⃣  ML em tempo real (modelo joblib via API Python)');
      console.log('');
      console.log('💡 Exemplos de Uso:');
      console.log('   GET  /api/v1/risk/status');
      console.log('   POST /api/v1/risk/predict (scores pré-calculados)');
      console.log('   POST /api/v1/risk/predict {"useRealTimeML": true} (modelo ML)');
      console.log('   GET  /api/v1/risk/high-risk-segments');
      console.log('');
      console.log('🎯 Acesse: http://localhost:8080');
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('   ❌ ERRO AO INICIAR SISTEMA                         ');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    console.error('Erro:', error);
    console.error('');
    process.exit(1);
  }
}

startServer();
