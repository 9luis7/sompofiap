<div align="center">

# 🚛 Sistema de Monitoramento de Cargas
### Sompo Seguros - FIAP Challenge

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Sistema preditivo de alertas em tempo real para prevenção de roubos de cargas**

Integração de dados históricos DATATRAN (2007-2025) + Machine Learning (LSTM & LightGBM) + Visualização Geoespacial

[Início Rápido](#-início-rápido) • [Features](#-funcionalidades) • [Documentação](docs/) • [API](#-api-endpoints)

</div>

---

## 📋 Sobre o Projeto

Este sistema foi desenvolvido como solução para o desafio FIAP da Sompo Seguros, focando em **reduzir sinistros de roubo de cargas** através de:

- 🎯 **Predição de Riscos** usando Machine Learning com 19 anos de dados reais
- 🗺️ **Visualização Geoespacial** de zonas de alto risco em tempo real
- ⚠️ **Alertas Preditivos** para rotas antes mesmo da viagem começar
- 📊 **Analytics Avançado** com dashboards interativos e mapas de calor

### 🌟 Diferenciais

- ✅ **100% Dados Reais** - DATATRAN 2007-2025 (47.192 registros)
- ✅ **Sistema Ensemble ML** - Múltiplos modelos (LSTM + LightGBM + Classificação)
- ✅ **Auto-gerenciado** - APIs Python iniciadas automaticamente
- ✅ **Produção-Ready** - TypeScript, migrations, logs, error handling
- ✅ **Open Source** - Código limpo, documentado e escalável

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
- ✅ **Inicia API Python ML automaticamente (porta 5000)**
- ✅ Inicia frontend (porta 8080)
- ✅ Carrega modelo LightGBM em memória

> **Novo!** A API de Machine Learning agora é iniciada automaticamente pelo backend. Não é mais necessário executar `start_ml_api.bat` separadamente!

---

## 🎯 Funcionalidades

### 🤖 Sistema Preditivo de Alertas (IA)

<table>
<tr>
<td width="50%">

**Machine Learning**
- 🧠 Modelo LSTM para previsão de riscos
- 📊 LightGBM para scoring de segmentos
- 🎲 Sistema Ensemble (múltiplos modelos)
- 📈 Treinamento com 47.192 registros reais

</td>
<td width="50%">

**Alertas Inteligentes**
- ⚠️ Alertas em tempo real durante viagem
- 🔮 Predição pré-viagem (antes de começar)
- 📍 Análise geoespacial com PostGIS
- 🎯 Scoring por BR, UF, KM e horário

</td>
</tr>
</table>

### 🚛 Simulador de Cargas Realístico

- 🗺️ **Rotas Reais** - Baseadas em rodovias brasileiras (BRs)
- 📍 **Tracking ao Vivo** - Posição e progresso em tempo real
- ⚡ **Alertas Dinâmicos** - Notificações durante o trajeto
- 📊 **Dashboard Completo** - KPIs, gráficos e estatísticas

### 📊 Analytics & Visualização

<table>
<tr>
<td width="50%">

**Análises Temporais**
- 🕐 Por hora do dia
- 📅 Por dia da semana
- 📆 Por mês e ano
- 🌡️ Correlação com clima

</td>
<td width="50%">

**Visualizações**
- 🗺️ Mapas de calor interativos
- 📈 Gráficos e rankings
- 🔥 Hotspots geográficos
- 📊 Dashboards em tempo real

</td>
</tr>
</table>

### 📁 Base de Dados Real

- 📊 **47.192 registros** do DATATRAN (2007-2025)
- 🗂️ **19 anos** de histórico de acidentes
- 🎯 **Dados validados** de São Paulo
- 🔄 **Sistema de importação** automatizado (CSV)

---

## 🏗️ Arquitetura

### Stack Tecnológico

<table>
<tr>
<td width="33%" align="center">

**Backend**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

Node.js 18+ + Express + TypeScript

</td>
<td width="33%" align="center">

**Machine Learning**

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

Python 3.8+ + Flask + LSTM + LightGBM

</td>
<td width="33%" align="center">

**Database**

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-4285F4?style=for-the-badge&logo=postgresql&logoColor=white)

PostgreSQL 12+ + PostGIS

</td>
</tr>
</table>

### Componentes Principais

**Backend (Node.js + TypeScript)**
- ⚡ Express.js REST API
- 🔐 Autenticação JWT
- 🗄️ Sequelize ORM com migrations
- 📝 Sistema de logs (Winston)
- 🔄 Gerenciador de processos Python
- 🌐 Socket.IO (preparado para tempo real)

**Machine Learning (Python)**
- 🤖 API Flask (porta 5000) - auto-iniciada pelo backend
- 🧠 Modelo LSTM (Keras/TensorFlow)
- 📊 LightGBM para scoring de riscos
- 🎯 Sistema de classificação multi-classe
- ⚙️ Health checks automáticos

**Frontend (JavaScript Vanilla)**
- 🗺️ Leaflet.js - mapas interativos
- 📈 Chart.js - dashboards e gráficos
- 🔥 Leaflet.heat - mapas de calor
- 🎨 CSS moderno com variáveis
- 📱 Design responsivo

**Banco de Dados**
- 🗄️ PostgreSQL 12+ com PostGIS
- 📍 Índices geoespaciais (GiST)
- 🔄 Migrations automatizadas
- 💾 Cache de scores em JSON

---

## 📁 Estrutura

```
sompofiap/
├── backend/
│   ├── src/
│   │   ├── controllers/        # APIs REST
│   │   ├── services/           # Lógica de negócio
│   │   │   ├── ml-process-manager.service.ts  # Gerencia processo Python
│   │   │   ├── ml-api-client.service.ts       # Cliente API ML
│   │   │   ├── risk-lookup.service.ts         # Cache de scores
│   │   │   └── ...
│   │   ├── routes/             # Rotas da API
│   │   └── config/             # Configurações
│   ├── models/                 # Modelos ML treinados
│   │   ├── risk_model.joblib
│   │   └── label_encoders.joblib
│   └── package.json
│
├── frontend/
│   ├── index.html              # UI principal
│   ├── modern-app.js           # Lógica da aplicação
│   ├── live-alerts.js          # Módulo de alertas
│   └── data/                   # GeoJSON e dados estáticos
│
├── scripts/                    # 🆕 Scripts organizados
│   ├── ml_prediction_api.py    # API Flask ML (auto-iniciada)
│   ├── train_risk_model.py     # Treinamento do modelo
│   ├── analyze_excel.py        # Análise exploratória
│   ├── import-data.bat         # Importar dados históricos
│   └── README.md               # Documentação dos scripts
│
├── database/
│   ├── migrations/             # SQL migrations
│   └── setup.sql               # Setup inicial
│
├── DadosReais/                 # Dados DATATRAN (19 anos)
│   └── dados_acidentes.xlsx    # 47.192 registros reais
│
├── docs/                       # Documentação técnica
│   ├── database/
│   ├── specifications/
│   └── refactoring/
│
├── start.bat                   # ⭐ Iniciar sistema completo
├── README.md                   # 📖 Este arquivo
└── requirements-ml.txt         # Dependências Python
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

### 4. Treinar Modelo ML (Primeira vez)

```bash
# Treina modelo e gera scores (execute uma vez)
python scripts/train_risk_model.py
```

### 5. Importar Dados Históricos (Opcional)

```bash
# Importa dados do DATATRAN para análises
scripts\import-data.bat
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

## 🤖 Machine Learning

### Sistema de Predição de Risco LightGBM

- **Modelo**: LightGBM (Gradient Boosting)
- **Acurácia**: 77.18%
- **Dataset**: 47.192 acidentes reais (DATATRAN 2007-2025)
- **Segmentos**: 4.997 trechos únicos mapeados
- **Contextos**: 8 cenários (dia/noite, claro/chuvoso, etc.)
- **API Python**: Integrada automaticamente ao backend (porta 5000)

### Arquitetura

O sistema usa **dois modos de predição**:

1. **Scores Pré-calculados** (rápido, ~1ms)
   - 4.997 segmentos com scores cacheados
   - 8 contextos por segmento (39.976 combinações)
   - Ideal para consultas rápidas

2. **Modelo ML em Tempo Real** (preciso, ~50ms)
   - API Python Flask com modelo LightGBM
   - **Iniciada automaticamente pelo backend**
   - Predições dinâmicas com qualquer parâmetro

### Inicialização Automática

A API Python é **gerenciada automaticamente** pelo backend Node.js:

```
Backend Node.js inicia
  └── Spawn processo Python (ml_prediction_api.py)
      └── Carrega modelo LightGBM em memória
          └── Aguarda health check (30s timeout)
              └── Sistema falha se ML não iniciar
```

**Shutdown gracioso**: Ctrl+C no backend mata ambos os processos.

### API Endpoints

```bash
# Status do serviço ML
GET /api/v1/risk/status

# Predição com scores pré-calculados (rápido)
POST /api/v1/risk/predict
Body: { "uf": "SP", "br": "116", "km": 523 }

# Predição com modelo ML em tempo real (preciso)
POST /api/v1/risk/predict
Body: { "uf": "SP", "br": "116", "km": 523, "useRealTimeML": true }

# Segmentos de alto risco
GET /api/v1/risk/high-risk-segments
```

### Treinar Modelo

```bash
# Gera modelo e scores (execute uma vez)
python scripts/train_risk_model.py

# Arquivos gerados:
# - backend/models/risk_model.joblib (Modelo LightGBM)
# - backend/models/label_encoders.joblib (Encoders)
# - backend/risk_scores.json (Cache)
```

> 💡 **Dica**: Todos os scripts estão organizados na pasta `scripts/`. Veja `scripts/README.md` para detalhes.

### Dependências Python

```bash
pip install -r requirements-ml.txt
```

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

**Status**: ✅ Implementado com LightGBM (integração automática)

**Erro**: "Modelo não encontrado"

```bash
# Solução: Treinar o modelo
python scripts/train_risk_model.py
```

**Erro**: "API ML não iniciou em 30 segundos"

```bash
# 1. Verificar se Python está instalado
python --version

# 2. Instalar dependências
pip install -r requirements-ml.txt

# 3. Treinar modelo
python scripts/train_risk_model.py

# 4. Testar API manualmente (opcional)
python scripts/ml_prediction_api.py
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

- **Scripts**: `scripts/README.md` - Documentação completa de todos os scripts
- **Estrutura DB**: `docs/database/db_structure.md`
- **Specs do Projeto**: `docs/specifications/project_specs.md`
- **Features de Mapa**: `docs/specifications/insurance-map-features.md`
- **Refatoração**: `docs/refactoring/` - Guias de arquitetura

---

## 🎉 Changelog

### v2.1.0 - Integração ML Automática + Organização (Outubro 2025)

#### 🚀 Novidades Principais

- **API Python ML integrada**: Backend gerencia automaticamente o processo Python
  - Spawn automático ao iniciar o sistema
  - Health checks obrigatórios (timeout 30s)
  - Shutdown gracioso com Ctrl+C
  - Sistema falha se ML não iniciar (garantindo core do negócio)

#### 📁 Reorganização

- **Pasta `scripts/`**: Todos os scripts Python e utilitários organizados
  - `ml_prediction_api.py` - API Flask (auto-iniciada)
  - `train_risk_model.py` - Treinamento do modelo
  - `analyze_excel.py` - Análise exploratória
  - `import-data.bat` - Importação de dados
  - `README.md` - Documentação completa dos scripts

- **Limpeza de arquivos**:
  - ❌ 7 arquivos `.md` removidos da raiz (consolidados no README)
  - ❌ `start_ml_api.bat` obsoleto (agora automático)
  - ✅ Raiz limpa com apenas arquivos essenciais

#### 🔧 Melhorias Técnicas

- `ml-process-manager.service.ts` - Novo serviço de gerenciamento de processos
- Caminhos dos scripts atualizados (`scripts/` folder)
- Documentação consolidada e organizada
- Estrutura de projeto mais profissional

---

### v2.0.0 - Sistema 100% Automático (Outubro 2025)

#### ✨ Novidades

- **Auto-setup de banco**: Migrations executam automaticamente no start
- **Sistema preditivo**: Alertas em tempo real baseados em ML + dados históricos
- **Simulador de cargas**: PoC completo para demonstração
- **Dashboards avançados**: Analytics temporais, correlações, heatmaps
- **Dados reais**: 100% DATATRAN (2007-2025), removidos todos dados fake
- **Modelo ML integrado**: LightGBM para previsão de riscos

#### 🔧 Melhorias

- Scripts `.bat` eliminados (exceto `start.bat`)
- Frontend servido via HTTP server (porta 8080)
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

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Diretrizes

- ✅ Siga o padrão de código existente (TypeScript para backend)
- ✅ Documente novas funcionalidades
- ✅ Teste antes de enviar PR
- ✅ Atualize o README se necessário

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Créditos e Agradecimentos

### Dados

- **DATATRAN** - Dados históricos de acidentes (2007-2025)
- **FIAP** - Challenge e orientação técnica
- **Sompo Seguros** - Patrocínio e especificações

### Tecnologias

- [Node.js](https://nodejs.org/) - Runtime JavaScript
- [TensorFlow](https://www.tensorflow.org/) - Framework de ML
- [LightGBM](https://lightgbm.readthedocs.io/) - Gradient boosting
- [Leaflet.js](https://leafletjs.com/) - Mapas interativos
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados
- [PostGIS](https://postgis.net/) - Extensão geoespacial

### Inspiração

Este projeto foi desenvolvido para demonstrar como **tecnologia e dados** podem reduzir sinistros e salvar vidas no transporte de cargas brasileiro.

---

<div align="center">

## 🎯 Status do Projeto

**Sistema 100% Funcional** • **Pronto para PoC** • **Produção-Ready**

### 🚀 A Sompo Seguros está revolucionando o transporte de cargas no Brasil!

**Desenvolvido com ❤️ para o FIAP Challenge**

---

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Made with Python](https://img.shields.io/badge/Made%20with-Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**[⬆ Voltar ao topo](#-sistema-de-monitoramento-de-cargas)**

</div>
