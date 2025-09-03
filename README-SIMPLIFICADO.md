# 🚀 Sistema de Monitoramento Sompo - Inicialização Simplificada

## 📋 Pré-requisitos
- Node.js (versão 18 ou superior)
- NPM (vem com Node.js)

## 🚀 Como Iniciar o Sistema

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Sistema Completo
```bash
npm start
```

### 3. Acessar o Sistema
- **URL**: http://localhost:3000
- O navegador abrirá automaticamente

## 📋 Credenciais de Demo

### 👑 Administrador
- **Usuário**: `admin.sompo`
- **Senha**: `password123`

### 🚛 Operador
- **Usuário**: `joao.silva`
- **Senha**: `password123`

### 👤 Cliente
- **Usuário**: `cliente.techcom`
- **Senha**: `password123`

## 🎯 Funcionalidades Disponíveis

### 🎛️ Dashboard Executivo
- Estatísticas em tempo real
- Mapa interativo com zonas de risco
- Sistema de alertas
- Monitoramento de cargas

### 🚛 Gerenciamento de Cargas
- Visualização de todas as cargas
- Status em tempo real
- Rastreamento de veículos
- Alertas automáticos

### ⚠️ Zonas de Risco
- Mapa colorido (verde/amarelo/vermelho)
- Análise de risco geográfica
- Alertas de entrada em zonas perigosas

### 🚨 Sistema de Alertas
- Alertas em tempo real
- Diferentes níveis de severidade
- Notificações automáticas

## 🔧 Comandos Úteis

### Desenvolvimento (com auto-reload)
```bash
npm run dev
```

### Parar o Sistema
- Pressione `Ctrl + C` no terminal

## 📊 Endpoints da API

- **Health Check**: http://localhost:3000/health
- **API Info**: http://localhost:3000/api/v1
- **Login**: POST http://localhost:3000/api/v1/auth/login
- **Cargas**: GET http://localhost:3000/api/v1/shipments
- **Dashboard**: GET http://localhost:3000/api/v1/monitoring/dashboard
- **Alertas**: GET http://localhost:3000/api/v1/alerts
- **Zonas de Risco**: GET http://localhost:3000/api/v1/risks/zones

## 🎉 Sistema Pronto!

O sistema está configurado para funcionar imediatamente após a inicialização. Não há necessidade de configurar banco de dados ou outras dependências - tudo funciona com dados mockados para demonstração.

**🎯 Perfeito para apresentações e demonstrações!**
