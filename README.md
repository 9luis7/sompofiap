# 🎯 Sompo IA - Sistema de Redução de Sinistros

## 📋 Visão Geral

Sistema inteligente de IA para a **Sompo Seguros** que utiliza Machine Learning para reduzir sinistros e aumentar a segurança da logística. O projeto combina predição de riscos, otimização de rotas e monitoramento em tempo real.

## 🚀 Funcionalidades Principais

### 🤖 **IA e Machine Learning**
- **Predição de Riscos**: Modelo de ML que prevê probabilidade de sinistros
- **Otimização de Rotas**: Algoritmo que calcula rotas mais seguras
- **Scoring Inteligente**: Sistema de pontuação para motoristas e veículos

### 📊 **Dashboard em Tempo Real**
- **Monitoramento da Frota**: Status de todos os veículos
- **Alertas de Risco**: Notificações automáticas de situações críticas
- **Analytics Avançados**: Gráficos e métricas de performance

### 🔧 **APIs Inteligentes**
- **Health Check**: Status dos serviços
- **Risk Assessment**: Avaliação de riscos em tempo real
- **Route Optimization**: Otimização de rotas
- **Driver/Vehicle Scoring**: Sistema de pontuação

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Python 3.8+**: Linguagem principal
- **FastAPI**: Framework web moderno e rápido
- **Scikit-learn**: Machine Learning
- **Pandas & NumPy**: Manipulação de dados
- **Uvicorn**: Servidor ASGI

### **Frontend**
- **React 18**: Interface moderna
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Recharts**: Gráficos interativos
- **Axios**: Comunicação com API

### **Machine Learning**
- **Random Forest**: Modelo de predição
- **Feature Engineering**: Extração de características
- **Model Persistence**: Salvamento de modelos treinados

## 📁 Estrutura do Projeto

```
sompo/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── main.py         # Aplicação principal
│   │   ├── models/         # Modelos de ML
│   │   │   ├── risk_prediction.py
│   │   │   └── route_optimization.py
│   │   ├── services/       # Serviços
│   │   │   ├── dashboard_service.py
│   │   │   └── scoring_service.py
│   │   └── utils/          # Utilitários
│   │       └── data_generator.py
│   └── requirements.txt    # Dependências Python
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   └── App.js          # Aplicação principal
│   └── package.json        # Dependências Node.js
├── start_local.bat         # Script de inicialização
├── EXECUCAO_LOCAL.md       # Instruções detalhadas
└── README.md               # Este arquivo
```

## 🚀 Como Executar

### **Pré-requisitos**
- Python 3.8+
- Node.js 16+
- npm

### **Execução Rápida**
1. **Clone o repositório**:
   ```bash
   git clone https://github.com/9luis7/sompofiap.git
   cd sompo
   ```

2. **Execute o script automático**:
   ```bash
   start_local.bat
   ```

3. **Acesse o sistema**:
   - Dashboard: http://localhost:3000
   - API Docs: http://localhost:8000/docs

### **Execução Manual**
```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (em outro terminal)
cd frontend
npm install
npm start
```

## 📊 Dados de Demonstração

O sistema utiliza dados fictícios realistas para demonstração:

- **200 veículos** na frota
- **150 motoristas** cadastrados
- **Histórico de sinistros** dos últimos 12 meses
- **Dados de rotas** com informações de risco
- **Métricas de performance** em tempo real

## 🔗 APIs Disponíveis

### **Dashboard**
- `GET /api/dashboard/overview` - Visão geral
- `GET /api/dashboard/fleet-status` - Status da frota
- `GET /api/dashboard/risk-alerts` - Alertas de risco

### **Predição de Riscos**
- `POST /api/prediction/risk-assessment` - Avaliação de risco

### **Otimização de Rotas**
- `POST /api/optimization/route` - Otimização de rota

### **Scoring**
- `GET /api/scoring/driver/{id}` - Score do motorista
- `GET /api/scoring/vehicle/{id}` - Score do veículo

## 🎯 Casos de Uso

### **1. Predição de Riscos**
- **Entrada**: Dados do motorista, veículo, rota, clima
- **Saída**: Probabilidade de sinistro (0-1)
- **Ação**: Recomendações de segurança

### **2. Otimização de Rotas**
- **Entrada**: Origem, destino, preferências
- **Saída**: Rota otimizada com menor risco
- **Ação**: Redirecionamento de veículos

### **3. Monitoramento em Tempo Real**
- **Entrada**: Dados da frota em tempo real
- **Saída**: Alertas e métricas
- **Ação**: Intervenção preventiva

## 📈 Impacto Esperado

### **Redução de Sinistros**
- **15-25%** redução na frequência de sinistros
- **20-30%** redução no custo de sinistros
- **Melhoria** na segurança da frota

### **Otimização Operacional**
- **Redução** no tempo de entrega
- **Economia** de combustível
- **Melhoria** na satisfação do cliente

## 🔒 Segurança

- **Autenticação** de usuários
- **Validação** de dados de entrada
- **Logs** de auditoria
- **Backup** automático de dados

## 📞 Suporte

Para dúvidas ou problemas:
- **Documentação**: `EXECUCAO_LOCAL.md`
- **API Docs**: http://localhost:8000/docs
- **Issues**: GitHub Issues

## 🚀 Próximos Passos

1. **Demonstração** para stakeholders
2. **Integração** com sistemas existentes
3. **Treinamento** de modelos com dados reais
4. **Deploy** em produção
5. **Monitoramento** contínuo

---

**🎉 Projeto desenvolvido para Sompo Seguros - Sistema de IA para Redução de Sinistros**
