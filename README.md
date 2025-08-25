# Sompo IA - Sistema Inteligente de Redução de Sinistros

## 📋 Descrição do Projeto

Sistema de IA desenvolvido para a seguradora Sompo com foco na redução de sinistros através de:
- **Predição de Riscos**: Modelo de ML para antecipar possíveis sinistros
- **Otimização de Rotas**: Algoritmo inteligente para rotas mais seguras
- **Monitoramento em Tempo Real**: Dashboard para acompanhamento de frota
- **Análise de Comportamento**: Scoring de motoristas e veículos

## 🚀 Funcionalidades Principais

### 1. Sistema de Predição de Sinistros
- Análise de dados históricos
- Predição de probabilidade de sinistros
- Alertas proativos

### 2. Otimização de Rotas
- Roteamento dinâmico baseado em risco
- Evitação de zonas de alto risco
- Otimização de horários de viagem

### 3. Dashboard de Monitoramento
- Visualização em tempo real da frota
- Métricas de performance
- Alertas e notificações

### 4. Sistema de Scoring
- Score de risco por motorista
- Score de risco por veículo
- Score de risco por rota

## 🛠️ Tecnologias Utilizadas

- **Backend**: Python, FastAPI, SQLAlchemy
- **Machine Learning**: Scikit-learn, Pandas, NumPy
- **Frontend**: React, TypeScript, Chart.js
- **Banco de Dados**: PostgreSQL
- **Deploy**: Docker, Docker Compose

## 📁 Estrutura do Projeto

```
sompo/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── models/         # Modelos de ML
│   │   ├── api/           # Endpoints da API
│   │   ├── services/      # Lógica de negócio
│   │   └── utils/         # Utilitários
│   ├── data/              # Dados de treinamento
│   └── requirements.txt
├── frontend/              # Dashboard React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/        # Páginas
│   │   └── services/     # Serviços de API
│   └── package.json
├── ml_models/            # Modelos treinados
├── docker-compose.yml    # Configuração Docker
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Python 3.8+
- Node.js 16+
- Docker e Docker Compose

### Instalação Rápida
```bash
# Clone o repositório
git clone <repository-url>
cd sompo

# Execute com Docker
docker-compose up --build
```

### Instalação Manual

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 📊 Dados de Demonstração

O protótipo inclui dados fictícios realistas para demonstração:
- 1000+ registros de sinistros históricos
- 500+ motoristas com perfis variados
- 200+ veículos com características diferentes
- Dados meteorológicos simulados
- Informações de rotas e tráfego

## 🎯 Próximos Passos

1. **Validação com Dados Reais**: Integração com dados reais da Sompo
2. **Refinamento dos Modelos**: Ajuste baseado em feedback
3. **Expansão de Funcionalidades**: Novos algoritmos e análises
4. **Deploy em Produção**: Infraestrutura escalável

## 📞 Contato

Para mais informações sobre o projeto, entre em contato com a equipe de desenvolvimento.
