#!/bin/bash

echo "🚀 Iniciando Sompo IA - Sistema de Redução de Sinistros"
echo "=================================================="

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p ml_models
mkdir -p backend/data

# Construir e iniciar os containers
echo "🔨 Construindo containers..."
docker-compose build

echo "🚀 Iniciando serviços..."
docker-compose up -d

echo ""
echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "🔧 API Backend: http://localhost:8000"
echo "📚 Documentação da API: http://localhost:8000/docs"
echo ""
echo "📋 Comandos úteis:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Parar sistema: docker-compose down"
echo "  - Reiniciar: docker-compose restart"
echo ""
echo "🎯 Aguarde alguns segundos para que todos os serviços estejam prontos..."
