#!/bin/bash

# Sompo Monitoring System - Unix/Linux/macOS Setup Script

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_status() {
    echo -e "${BLUE}[$1/5]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_info() {
    echo -e "${CYAN}📱${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Este script deve ser executado no diretório raiz do projeto!"
    exit 1
fi

echo
echo "========================================"
echo "  🚀 SOMPO MONITORING SYSTEM"
echo "========================================"
echo
echo "Iniciando configuração automática..."
echo

# Verificar se Node.js está instalado
print_status "1" "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js encontrado: $NODE_VERSION"
else
    print_error "Node.js não encontrado!"
    echo "Por favor, instale o Node.js em: https://nodejs.org/"
    echo
    read -p "Pressione Enter para sair"
    exit 1
fi

# Verificar se Python está instalado
echo
print_status "2" "Verificando Python..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
    PYTHON_VERSION=$(python3 --version)
    print_success "Python encontrado: $PYTHON_VERSION"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
    PYTHON_VERSION=$(python --version)
    print_success "Python encontrado: $PYTHON_VERSION"
else
    print_error "Python não encontrado!"
    echo "Por favor, instale o Python em: https://python.org/"
    echo
    read -p "Pressione Enter para sair"
    exit 1
fi

# Instalar dependências Node.js
echo
print_status "3" "Instalando dependências Node.js..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Erro ao instalar dependências Node.js"
        read -p "Pressione Enter para sair"
        exit 1
    fi
    print_success "Dependências Node.js instaladas"
else
    print_success "Dependências Node.js já instaladas"
fi

# Instalar dependências Python
echo
print_status "4" "Instalar dependências Python..."
echo "📦 Instalando ferramentas de qualidade Python..."
$PYTHON_CMD -m pip install flake8 black isort
if [ $? -ne 0 ]; then
    print_error "Erro ao instalar dependências Python"
    read -p "Pressione Enter para sair"
    exit 1
fi
print_success "Dependências Python instaladas"

# Verificar qualidade do código
echo
print_status "5" "Verificando qualidade do código..."
echo "🔍 Executando linters..."
npm run quality
if [ $? -ne 0 ]; then
    print_warning "Alguns problemas de qualidade encontrados"
    echo "Executando correções automáticas..."
    npm run lint
    npm run format
else
    print_success "Código verificado com sucesso"
fi

echo
echo "========================================"
echo "   🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo "========================================"
echo
echo "Iniciando sistema em terminais separados..."
echo

# Função para abrir terminal (detecta o sistema)
open_terminal() {
    local title="$1"
    local command="$2"
    
    if command -v gnome-terminal &> /dev/null; then
        # GNOME Terminal (Linux)
        gnome-terminal --title="$title" -- bash -c "$command; exec bash"
    elif command -v konsole &> /dev/null; then
        # Konsole (KDE)
        konsole --title "$title" -e bash -c "$command; exec bash"
    elif command -v xterm &> /dev/null; then
        # xterm (fallback)
        xterm -title "$title" -e bash -c "$command; exec bash"
    elif command -v open &> /dev/null; then
        # macOS Terminal
        osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && $command\""
    else
        print_warning "Não foi possível abrir terminal separado. Execute manualmente:"
        echo "Terminal 1: npm run backend"
        echo "Terminal 2: npm run frontend"
        return 1
    fi
}

# Abrir terminal para o backend
echo "🚀 Iniciando Backend..."
open_terminal "Sompo Backend" "echo '🚀 Iniciando Backend...' && npm run backend"

# Aguardar um pouco para o backend inicializar
sleep 3

# Abrir terminal para o frontend
echo "🌐 Iniciando Frontend..."
open_terminal "Sompo Frontend" "echo '🌐 Iniciando Frontend...' && sleep 2 && npm run frontend"

echo
print_success "Sistema iniciado com sucesso!"
echo
print_info "Frontend: http://localhost:3000"
print_info "Backend: http://localhost:5000"
echo
echo "Pressione Enter para fechar este terminal..."
read
