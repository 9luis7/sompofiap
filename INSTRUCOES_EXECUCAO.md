# 🚀 Instruções de Execução - Sompo IA

## 📋 Pré-requisitos

### Software Necessário
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (vem com Node.js)
- **4GB RAM** disponível
- **2GB espaço** em disco

### Verificação de Instalação
```bash
# Verificar Python
python --version

# Verificar Node.js
node --version

# Verificar npm
npm --version
```

## 🎯 Execução Rápida (Recomendado)

### 1. Clone o Repositório
```bash
git clone https://github.com/9luis7/sompofiap.git
cd sompo
```

### 2. Execute o Script de Inicialização
```bash
# No Windows
start_local.bat

# No Linux/Mac (se disponível)
chmod +x start_local.sh
./start_local.sh
```

### 3. Aguarde a Inicialização
O script irá:
- ✅ Verificar dependências
- ✅ Instalar pacotes Python e Node.js
- ✅ Iniciar backend (porta 8000)
- ✅ Iniciar frontend (porta 3000)
- ✅ Exibir URLs de acesso

## 🔧 Execução Manual

### 1. Preparar Ambiente
```bash
# Criar diretórios necessários
mkdir -p ml_models
mkdir -p backend/data
```

### 2. Instalar Dependências do Backend
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Instalar Dependências do Frontend
```bash
cd frontend
npm install
cd ..
```

### 4. Iniciar Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Iniciar Frontend (em outro terminal)
```bash
cd frontend
npm start
```

## 🌐 Acessos do Sistema

### URLs Principais
- **Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
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
1. Acesse http://localhost:3000
2. Verifique se as métricas estão carregando
3. Navegue pelos diferentes módulos

### 3. Testar APIs
```bash
# Predição de Risco
curl -X POST http://localhost:8000/api/prediction/risk-assessment \
  -H "Content-Type: application/json" \
  -d '{"driver_id": "DRIVER001", "vehicle_id": "VEHICLE001", "origin": "São Paulo", "destination": "Rio de Janeiro", "date": "2025-08-25"}'

# Otimização de Rota
curl -X POST http://localhost:8000/api/optimization/route \
  -H "Content-Type: application/json" \
  -d '{"origin": "São Paulo", "destination": "Rio de Janeiro", "preferences": {"risk_aversion": 0.8, "time_priority": 0.6, "distance_priority": 0.4}}'

# Score do Motorista
curl http://localhost:8000/api/scoring/driver/DRIVER001
```

## 🔧 Solução de Problemas

### Erro: "Python não encontrado"
```bash
# Windows
# Instale Python do site oficial e adicione ao PATH

# Linux/Mac
sudo apt-get install python3 python3-pip  # Ubuntu/Debian
brew install python3  # macOS
```

### Erro: "Node.js não encontrado"
```bash
# Windows
# Instale Node.js do site oficial

# Linux/Mac
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs  # Ubuntu/Debian
brew install node  # macOS
```

### Erro: "Porta já em uso"
```bash
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
lsof -i :3000
kill -9 <PID>
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

### Erro: "npm install falhou"
```bash
# Limpar cache do npm
npm cache clean --force

# Reinstalar
cd frontend
rm -rf node_modules package-lock.json
npm install
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
└── INSTRUCOES_EXECUCAO.md  # Este arquivo
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

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
# Backend com reload automático
cd backend
python -m uvicorn app.main:app --reload

# Frontend com hot reload
cd frontend
npm start

# Ver logs do backend
# Os logs aparecem no terminal onde o backend está rodando

# Ver logs do frontend
# Os logs aparecem no terminal onde o frontend está rodando
```

### Manutenção
```bash
# Atualizar dependências do backend
cd backend
pip install -r requirements.txt --upgrade

# Atualizar dependências do frontend
cd frontend
npm update

# Limpar cache
npm cache clean --force
pip cache purge
```

## 💡 Dicas de Desenvolvimento

### Hot Reload
- **Backend**: Recarrega automaticamente quando você salva arquivos Python
- **Frontend**: Recarrega automaticamente quando você salva arquivos React

### Debugging
- **Backend**: Use `print()` ou logs para debug
- **Frontend**: Use `console.log()` e DevTools do navegador

### Performance
- **Backend**: Use `--reload` apenas em desenvolvimento
- **Frontend**: Use `npm start` para desenvolvimento, `npm run build` para produção

## 🎉 Próximos Passos

1. **Execute o projeto**: `start_local.bat`
2. **Acesse o dashboard**: http://localhost:3000
3. **Explore as APIs**: http://localhost:8000/docs
4. **Teste as funcionalidades**: Use a interface para navegar
5. **Apresente para a Sompo**: Sistema pronto para demonstração!

---

**🎯 Projeto Sompo IA - Sistema de Redução de Sinistros**
