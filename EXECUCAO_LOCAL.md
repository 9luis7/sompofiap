# 🚀 Execução Local - Sompo IA

## 📋 Pré-requisitos

### Software Necessário
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (vem com Node.js)

### Verificação de Instalação
```bash
# Verificar Python
python --version

# Verificar Node.js
node --version

# Verificar npm
npm --version
```

## 🎯 Execução Rápida (Windows)

### Opção 1: Script Automático
1. **Execute o script**: `start_local.bat`
2. **Aguarde** a instalação das dependências
3. **Acesse**:
   - Dashboard: http://localhost:3000
   - API Docs: http://localhost:8000/docs

### Opção 2: Execução Manual

#### 1. Instalar Dependências do Backend
```bash
cd backend
pip install -r requirements.txt
```

#### 2. Instalar Dependências do Frontend
```bash
cd frontend
npm install
```

#### 3. Iniciar Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 4. Iniciar Frontend (em outro terminal)
```bash
cd frontend
npm start
```

## 🌐 URLs de Acesso

### Frontend (Dashboard)
- **URL**: http://localhost:3000
- **Descrição**: Interface principal do sistema

### Backend (API)
- **URL**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📊 Testando o Sistema

### 1. Verificar Backend
```bash
# Health Check
curl http://localhost:8000/health

# Dados do Dashboard
curl http://localhost:8000/api/dashboard/overview

# Alertas de Risco
curl http://localhost:8000/api/dashboard/risk-alerts
```

### 2. Verificar Frontend
- Acesse http://localhost:3000
- Verifique se a página carrega corretamente
- Teste os links para as APIs

## 🔧 Solução de Problemas

### Erro: "Python não encontrado"
- Instale Python 3.8+ do site oficial
- Adicione Python ao PATH do sistema

### Erro: "Node.js não encontrado"
- Instale Node.js 16+ do site oficial
- Reinicie o terminal após instalação

### Erro: "Porta já em uso"
```bash
# Windows - Encontrar processo usando a porta
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número do processo)
taskkill /PID <PID> /F
```

### Erro: "Módulo não encontrado"
```bash
# Reinstalar dependências do backend
cd backend
pip install -r requirements.txt --force-reinstall

# Reinstalar dependências do frontend
cd frontend
npm install --force
```

## 📁 Estrutura do Projeto

```
sompo/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── main.py         # Aplicação principal
│   │   ├── models/         # Modelos de ML
│   │   ├── services/       # Serviços
│   │   └── utils/          # Utilitários
│   └── requirements.txt    # Dependências Python
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   └── App.js          # Aplicação principal
│   └── package.json        # Dependências Node.js
├── start_local.bat         # Script de inicialização
└── EXECUCAO_LOCAL.md       # Este arquivo
```

## 🎯 Funcionalidades Disponíveis

### Backend (APIs)
- ✅ **Health Check**: Status dos serviços
- ✅ **Dashboard Overview**: Dados gerais
- ✅ **Risk Alerts**: Alertas de risco
- ✅ **Risk Prediction**: Predição de riscos
- ✅ **Route Optimization**: Otimização de rotas
- ✅ **Driver/Vehicle Scoring**: Sistema de pontuação

### Frontend (Dashboard)
- ✅ **Interface Principal**: Visão geral do sistema
- ✅ **Links para APIs**: Acesso direto às funcionalidades
- ✅ **Status do Sistema**: Indicadores de funcionamento

## 🚀 Próximos Passos

1. **Execute o projeto**: `start_local.bat`
2. **Acesse o dashboard**: http://localhost:3000
3. **Explore as APIs**: http://localhost:8000/docs
4. **Teste as funcionalidades**: Use a interface para navegar
5. **Apresente para a Sompo**: Sistema pronto para demonstração!

## 💡 Dicas

- **Hot Reload**: O backend e frontend recarregam automaticamente quando você faz alterações
- **Logs**: Os logs aparecem nos terminais onde os serviços estão rodando
- **Parar Serviços**: Feche as janelas dos terminais ou pressione Ctrl+C
- **Reiniciar**: Execute `start_local.bat` novamente se necessário

---

**🎉 O projeto está pronto para demonstração na Sompo Seguros!**
