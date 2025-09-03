#!/bin/bash

# Script para tornar os arquivos executáveis no Unix/Linux/macOS

echo "🔧 Tornando scripts executáveis..."

# Tornar start.sh executável
chmod +x start.sh
echo "✅ start.sh agora é executável"

# Tornar start.js executável
chmod +x start.js
echo "✅ start.js agora é executável"

echo ""
echo "🎉 Todos os scripts estão prontos para uso!"
echo ""
echo "Para iniciar o sistema:"
echo "  ./start.sh          # Linux/macOS"
echo "  node start.js       # Universal"
echo "  npm start           # Via npm"
echo ""
