# 🚀 Instruções de Execução - Sompo IA

## 📋 Pré-requisitos

### Software Necessário
- **Docker Desktop** (versão 20.10+)
- **Docker Compose** (versão 2.0+)
- **Git** (para clonar o repositório)
- **4GB RAM** disponível
- **2GB espaço** em disco

### Verificação de Instalação
```bash
# Verificar Docker
docker --version

# Verificar Docker Compose
docker-compose --version

# Verificar Git
git --version
```

## 🎯 Execução Rápida (Recomendado)

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd sompo
```

### 2. Execute o Script de Inicialização
```bash
# No Windows (PowerShell)
.\start.sh

# No Linux/Mac
chmod +x start.sh
./start.sh
```

### 3. Aguarde a Inicialização
O script irá:
- ✅ Verificar dependências
- ✅ Criar diretórios necessários
- ✅ Construir containers Docker
- ✅ Iniciar todos os serviços
- ✅ Exibir URLs de acesso

## 🔧 Execução Manual

### 1. Preparar Ambiente
```bash
# Criar diretórios necessários
mkdir -p ml_models
mkdir -p backend/data
```

### 2. Construir e Iniciar
```bash
# Construir containers
docker-compose build

# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

### 3. Verificar Logs
```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🌐 Acessos do Sistema

### URLs Principais
- **Dashboard**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Credenciais (se necessário)
- **Usuário**: admin
- **Senha**: admin123

## 📊 Testando o Sistema

### 1. Verificar Dashboard
1. Acesse http://localhost:3000
2. Verifique se as métricas estão carregando
3. Navegue pelos diferentes módulos

### 2. Testar APIs
1. Acesse http://localhost:8000/docs
2. Teste os endpoints disponíveis
3. Verifique as respostas

### 3. Gerar Dados de Demonstração
```bash
# Via API
curl -X GET "http://localhost:8000/api/data/generate-demo"

# Ou acesse no navegador
http://localhost:8000/api/data/generate-demo
```

## 🔍 Comandos Úteis

### Gerenciamento de Containers
```bash
# Parar todos os serviços
docker-compose down

# Reiniciar serviços
docker-compose restart

# Reconstruir containers
docker-compose up --build -d

# Ver logs em tempo real
docker-compose logs -f

# Entrar em um container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Limpeza e Reset
```bash
# Parar e remover containers
docker-compose down

# Remover volumes (cuidado - apaga dados)
docker-compose down -v

# Limpar imagens não utilizadas
docker system prune -a

# Reset completo
docker-compose down -v
docker system prune -a -f
docker-compose up --build -d
```

## 🐛 Solução de Problemas

### Problema: Porta já em uso
```bash
# Verificar processos usando as portas
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Parar processo específico
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux/Mac
```

### Problema: Containers não iniciam
```bash
# Verificar logs detalhados
docker-compose logs backend
docker-compose logs frontend

# Verificar recursos do sistema
docker stats

# Reiniciar Docker Desktop (Windows/Mac)
```

### Problema: API não responde
```bash
# Verificar se o backend está rodando
curl http://localhost:8000/health

# Verificar logs do backend
docker-compose logs -f backend

# Reiniciar apenas o backend
docker-compose restart backend
```

### Problema: Frontend não carrega
```bash
# Verificar se o frontend está rodando
curl http://localhost:3000

# Verificar logs do frontend
docker-compose logs -f frontend

# Reiniciar apenas o frontend
docker-compose restart frontend
```

## 📱 Testando Funcionalidades

### 1. Predição de Risco
```bash
curl -X POST "http://localhost:8000/api/prediction/risk-assessment" \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "DRIVER001",
    "vehicle_id": "VEHICLE001",
    "origin": "São Paulo",
    "destination": "Rio de Janeiro",
    "date": "2024-01-15T08:00:00Z"
  }'
```

### 2. Otimização de Rota
```bash
curl -X POST "http://localhost:8000/api/optimization/route" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "São Paulo",
    "destination": "Rio de Janeiro",
    "preferences": {
      "risk_aversion": 0.7,
      "time_importance": 0.2,
      "distance_importance": 0.1
    }
  }'
```

### 3. Dashboard Overview
```bash
curl -X GET "http://localhost:8000/api/dashboard/overview"
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
# Backend
PYTHONPATH=/app
DATABASE_URL=postgresql://sompo_user:sompo_password@postgres:5432/sompo_ia

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Database
POSTGRES_DB=sompo_ia
POSTGRES_USER=sompo_user
POSTGRES_PASSWORD=sompo_password
```

### Modificar Portas
Edite o `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "8001:8000"  # Mudou de 8000 para 8001
  
  frontend:
    ports:
      - "3001:3000"  # Mudou de 3000 para 3001
```

## 📊 Monitoramento

### Verificar Status dos Serviços
```bash
# Status geral
docker-compose ps

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose logs -f
```

### Métricas de Performance
- **Backend**: http://localhost:8000/health
- **Frontend**: Verificar console do navegador
- **Database**: Verificar logs do PostgreSQL

## 🎯 Próximos Passos

### Após Execução Bem-sucedida
1. ✅ **Explorar Dashboard**: Navegue por todas as funcionalidades
2. ✅ **Testar APIs**: Use a documentação Swagger
3. ✅ **Analisar Dados**: Verifique as métricas e gráficos
4. ✅ **Fazer Demonstração**: Apresente o sistema para stakeholders

### Para Produção
1. 🔄 **Configurar SSL**: Certificados HTTPS
2. 🔄 **Backup Database**: Configurar backups automáticos
3. 🔄 **Monitoramento**: Implementar alertas
4. 🔄 **Segurança**: Configurar autenticação

---

## 📞 Suporte

Se encontrar problemas:
1. **Verifique os logs**: `docker-compose logs -f`
2. **Consulte a documentação**: DOCUMENTACAO.md
3. **Verifique requisitos**: Certifique-se que Docker está rodando
4. **Reinicie o sistema**: `docker-compose down && docker-compose up -d`

**Boa sorte com a demonstração!** 🚀
