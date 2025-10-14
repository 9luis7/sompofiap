# 🚛 Sistema de Monitoramento de Cargas - Sompo Seguros

Sistema preditivo de alertas em tempo real para prevenção de roubos de cargas, com integração de dados históricos do DATATRAN e modelo de Machine Learning.

---

## 🚀 Início Rápido

### Windows (Recomendado)

```bash
.\start.bat
```

### Acessar o Sistema

1. Abrir navegador: **http://localhost:8080**
2. Login: `admin.sompo` / `password123`
3. Ir para **"Simulador"** e clicar em **"Iniciar Simulação"**

**Pronto!** O sistema:

- ✅ Cria o banco automaticamente
- ✅ Executa migrations
- ✅ Inicia backend (porta 3001)
- ✅ Inicia frontend (porta 8080)
- ✅ Carrega modelo ML

---

## 📊 Funcionalidades

### ✅ Sistema Preditivo de Alertas

- **Alertas em tempo real** baseados em dados históricos (DATATRAN 2007-2025)
- **Modelo LSTM** para previsão de riscos
- **Análise geoespacial** com PostGIS
- **Scoring de risco** por segmento de rota (BR, UF, KM)

### ✅ Simulador de Cargas

- **Cargas simuladas** com rotas realistas do Brasil
- **Monitoramento em tempo real** de progresso e localização
- **Integração com alertas** preditivos
- **Dashboard completo** com estatísticas

### ✅ Dashboards Avançados

- **Análise temporal** (hora, dia, mês, ano)
- **Correlações** (condições meteorológicas, tipos de acidentes)
- **Hotspots temporais** (zonas críticas por período)
- **Rankings** (causas, tipos, severidade)
- **Mapas de calor** interativos

### ✅ Dados Reais

- **19 anos de dados** históricos do DATATRAN (2007-2025)
- **Modelo ML treinado** (`modelo_lstm_acidentes_sp.keras`)
- **100% baseado em dados reais** (sem dados fake)

---

## 🏗️ Arquitetura

### Backend

- **Node.js + Express + TypeScript**
- **PostgreSQL 12+ com PostGIS** (geoespacial)
- **Sequelize ORM** (migrations automáticas)
- **TensorFlow.js** (ML - opcional)
- **Socket.IO** (tempo real - preparado para uso futuro)

### Frontend

- **HTML5 + CSS3 + JavaScript Vanilla**
- **Leaflet.js** (mapas interativos)
- **Chart.js** (gráficos)
- **Leaflet.heat** (heatmaps)

---

## 📁 Estrutura

```
Projeto Sompo/
├── backend/
│   ├── src/
│   │   ├── controllers/        # APIs REST
│   │   ├── services/           # Lógica de negócio
│   │   │   ├── cargo-simulator.service.ts
│   │   │   ├── smart-alerts.service.ts
│   │   │   ├── ml-prediction.service.ts
│   │   │   └── risk-analysis.service.ts
│   │   ├── models/             # Modelos Sequelize
│   │   ├── routes/             # Rotas
│   │   └── database/           # Conexão + migrations
│   └── package.json
├── frontend/
│   ├── index.html              # UI principal
│   ├── modern-app.js           # Lógica da aplicação
│   ├── live-alerts.js          # Módulo de alertas
│   └── historical-data.js      # Dados históricos
├── database/
│   ├── migrations/             # SQL migrations
│   └── setup.sql               # Setup inicial
├── DadosReais/                 # Dados DATATRAN (19 anos)
│   ├── Dados Sompo/
│   │   ├── datatran2007.csv ... datatran2017.csv
│   │   └── acidentes2017_todas_causas_tipos.csv ... 2025
│   └── modelo_lstm_acidentes_sp.keras
├── start.bat                   # Iniciar tudo (Windows)
└── import-data.bat             # Importar dados DATATRAN
```

---

## 🔧 Configuração Manual

### 1. Requisitos

- **Node.js** v18+
- **PostgreSQL** 12+ com PostGIS
- **npm** ou **yarn**

### 2. Instalação

```bash
# Backend
cd backend
npm install

# Configurar banco
createdb sompo_db
psql sompo_db -c "CREATE EXTENSION postgis;"

# Copiar config.env.example para .env e ajustar
```

### 3. Variáveis de Ambiente

```env
# backend/.env
NODE_ENV=development
PORT=3001
HOST=localhost

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sompo_db
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=seu_secret_aqui
JWT_EXPIRES_IN=24h
```

### 4. Importar Dados Históricos (Opcional)

```bash
# Importa dados do DATATRAN para análises
.\import-data.bat
```

---

## 📡 API Endpoints

### 🚛 Simulador

- `POST /api/v1/simulator/start` - Iniciar simulação
- `GET /api/v1/simulator/status` - Status da simulação
- `GET /api/v1/simulator/active` - Cargas ativas
- `PUT /api/v1/simulator/pause` - Pausar
- `DELETE /api/v1/simulator/stop` - Parar

### ⚠️ Alertas Preditivos

- `GET /api/v1/alerts/active` - Alertas ativos
- `GET /api/v1/alerts/shipment/:number/live` - Alertas de uma carga
- `POST /api/v1/alerts/predict-route` - Prever alertas para rota
- `GET /api/v1/alerts/summary` - Resumo de alertas

### 📊 Analytics

- `GET /api/v1/analytics/temporal` - Análise temporal
- `GET /api/v1/analytics/correlations` - Correlações
- `GET /api/v1/analytics/hotspots-time` - Hotspots temporais
- `GET /api/v1/analytics/causes-ranking` - Ranking de causas
- `GET /api/v1/analytics/heatmap-temporal` - Heatmap temporal

### 🚚 Cargas (Shipments)

- `GET /api/v1/shipments` - Listar todas
- `GET /api/v1/shipments/:id` - Detalhes
- `POST /api/v1/shipments/:id/start` - Iniciar
- `POST /api/v1/shipments/:id/complete` - Completar

### 📍 Monitoramento

- `GET /api/v1/monitoring/dashboard` - Dashboard
- `GET /api/v1/monitoring/realtime` - Tempo real
- `GET /api/v1/monitoring/statistics` - Estatísticas

### 📈 Dados Históricos

- `GET /api/v1/accidents/summary` - Resumo geral
- `GET /api/v1/accidents/heatmap` - Dados para heatmap
- `GET /api/v1/accidents/by-highway` - Por rodovia
- `GET /api/v1/accidents/temporal` - Análise temporal

---

## 🎯 Fluxo de Uso

### Demonstração PoC

1. **Iniciar sistema**: `.\start.bat`
2. **Login**: http://localhost:8080
3. **Simulador**: Criar cargas simuladas (10-50)
4. **Monitorar**: Ver cargas no mapa em tempo real
5. **Alertas**: Receber alertas preditivos conforme cargas transitam
6. **Analytics**: Explorar dashboards e correlações

### Produção Futura

1. **GPS Real**: Substituir simulador por integração GPS
2. **Sensores IoT**: Conectar sensores de temperatura, umidade, vibração
3. **Socket.IO**: Ativar updates em tempo real
4. **Notificações**: Push notifications para motoristas

---

## 🤖 Machine Learning - **NOVO!**

### Sistema de Predição de Risco LightGBM

- **Modelo**: LightGBM (Gradient Boosting)
- **Acurácia**: 77.18%
- **Dataset**: 47.192 acidentes reais (DATATRAN 2007-2025)
- **Segmentos**: 4.997 trechos únicos mapeados
- **Contextos**: 8 cenários (dia/noite, claro/chuvoso, etc.)

### Como Funciona

1. **Treinamento offline**: Script Python gera `risk_scores.json`
2. **Backend leve**: Carrega JSON em memória (1.29 MB)
3. **Lookup instantâneo**: Consultas em ~1ms (O(1))
4. **Zero dependências pesadas**: Sem TensorFlow no backend

### API Endpoints

```bash
# Status do serviço (mostra ambos os modos)
GET /api/v1/risk/status

# Predição com scores pré-calculados
POST /api/v1/risk/predict
Body: { "uf": "SP", "br": "116", "km": 523 }

# Predição com modelo ML em tempo real
POST /api/v1/risk/predict
Body: { "uf": "SP", "br": "116", "km": 523, "useRealTimeML": true }

# Segmentos de alto risco
GET /api/v1/risk/high-risk-segments
```

### Modelo Salvo em Joblib

```bash
# Treinar e salvar modelo
python train_risk_model.py

# Arquivos gerados:
# - backend/models/risk_model.joblib (Modelo LightGBM)
# - backend/models/label_encoders.joblib (Encoders)
# - backend/risk_scores.json (Cache/Fallback)

# Iniciar API Python (opcional)
python ml_prediction_api.py
```

📖 **Documentação completa**:

- `RISK_PREDICTION_GUIDE.md` - Guia de uso da API
- `ML_MODEL_GUIDE.md` - Guia de modelos joblib/pickle
- `IMPLEMENTACAO_MODELO_JOBLIB.md` - Detalhes da implementação

---

## 📝 Credenciais de Teste

```
👑 ADMIN:
   Usuário: admin.sompo
   Senha: password123

🚛 OPERADOR:
   Usuário: joao.silva
   Senha: password123

👤 CLIENTE:
   Usuário: cliente.techcom
   Senha: password123
```

---

## 🔧 Troubleshooting

### Sistema de ML

**Status**: ✅ Implementado com LightGBM (sem TensorFlow)

Para retreinar o modelo:

```bash
python train_risk_model.py
```

### Erro: "Database connection failed"

```bash
# Verificar se PostgreSQL está rodando
psql -U postgres

# Criar database
CREATE DATABASE sompo_db;
CREATE EXTENSION postgis;

# Verificar credenciais em backend/.env
```

### Frontend não conecta ao backend

```bash
# Verificar se backend está rodando na porta 3001
curl http://localhost:3001/health

# Ajustar frontend/config.js se necessário
window.API_BASE_URL = 'http://localhost:3001/api/v1';
```

### Importação de dados travando

```bash
# Dados são grandes (~100MB). Espere 2-5 minutos.
# Monitore: logs/app.log
```

---

## 📚 Documentação Adicional

- **Estrutura DB**: `db_structure.md`
- **Specs do Projeto**: `project_specs.md`
- **Features de Mapa**: `docs/insurance-map-features.md`

---

## 🎉 Changelog

### v2.0.0 - Sistema 100% Automático (Outubro 2025)

#### ✨ Novidades

- **Auto-setup de banco**: Migrations executam automaticamente no start
- **Sistema preditivo**: Alertas em tempo real baseados em ML + dados históricos
- **Simulador de cargas**: PoC completo para demonstração
- **Dashboards avançados**: Analytics temporais, correlações, heatmaps
- **Dados reais**: 100% DATATRAN (2007-2025), removidos todos dados fake
- **Modelo ML integrado**: LSTM para previsão de riscos

#### 🔧 Melhorias

- Scripts `.bat` eliminados (exceto `start.bat` e `import-data.bat`)
- Frontend servido via HTTP server (porta 8080)
- Fallback inteligente se TensorFlow.js não disponível
- Logs estruturados e informativos
- README consolidado com changelog integrado

#### 📦 Novos Endpoints

- `/api/v1/simulator/*` - Controle do simulador
- `/api/v1/alerts/*` - Sistema de alertas preditivos
- `/api/v1/analytics/*` - Dashboards avançados
- `/api/v1/accidents/*` - Dados históricos DATATRAN

#### 🗑️ Removidos

- Todos arquivos `.md` desnecessários (16 arquivos)
- Scripts `.bat` obsoletos (`run-migrations.bat`, `test-system.bat`)
- Dados simulados/fake do frontend e backend
- Dependência obrigatória de TensorFlow.js

#### 🏗️ Arquitetura

- **Backend**: TypeScript + Express + Sequelize + PostGIS
- **Frontend**: Vanilla JS + Leaflet + Chart.js
- **ML**: TensorFlow.js (opcional) + Fallback histórico
- **Database**: PostgreSQL 12+ com PostGIS

---

### v1.0.0 - MVP Inicial (Setembro 2025)

- Sistema básico de monitoramento
- API REST completa (25+ endpoints)
- Autenticação JWT
- Frontend básico com mapas
- Dados mockados para demonstração
- Socket.IO preparado

---

## 📞 Suporte

**Equipe Sompo Seguros**

- Sistema: Monitoramento Preditivo de Cargas
- Objetivo: Redução de roubos via alertas inteligentes

---

## 🚀 Próximos Passos (Roadmap)

### Fase 1: Produção (Q1 2026)

- [ ] Integração com GPS real (API de tracking)
- [ ] Conexão com sensores IoT
- [ ] Notificações push (SMS/Email/App)
- [ ] Painel de controle para operadores

### Fase 2: Escala (Q2 2026)

- [ ] Multi-tenant (várias transportadoras)
- [ ] API pública para parceiros
- [ ] Mobile app (React Native)
- [ ] BI avançado (Power BI/Tableau)

### Fase 3: Inovação (Q3 2026)

- [ ] Modelo ML próprio (não LSTM genérico)
- [ ] Previsão de roubos por tipo de carga
- [ ] Otimização automática de rotas
- [ ] Integração com PRF e seguradoras

---

**🎯 Status**: Sistema 100% funcional e pronto para demonstração/PoC!

**🚀 A Sompo Seguros está revolucionando o transporte de cargas no Brasil!**
