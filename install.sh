#!/bin/bash

# --- Trontec WhatsApp Orchestrator - Linux Installer ---
set -e

echo "🚀 Iniciando instalação do Trontec WhatsApp Orchestrator..."

# 1. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 20+ primeiro."
    echo "Sugestão (Ubuntu/Debian):"
    echo "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️ Versão do Node.js detectada: $NODE_VERSION. Recomendado: 20+."
fi

# 2. Instalar dependências
echo "📦 Instalando dependências do projeto..."
npm install

# 3. Configurar .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env inicial..."
    cat <<EOF > .env
APP_PASSWORD=admin
DATABASE_URL="file:./prisma/dev.db"
# Adicione suas chaves abaixo ou via interface web
# OPENAI_API_KEY=
# EVOLUTION_API_URL=
# EVOLUTION_API_TOKEN=
EOF
    echo "✅ Arquivo .env criado com senha padrão 'admin'."
fi

# 4. Preparar Banco de Dados
echo "🗄️ Preparando banco de dados (Prisma)..."
npx prisma generate
npx prisma db push

# 5. Build (Opcional, mas recomendado para produção)
echo "🏗️ Gerando build de produção..."
npm run build

echo ""
echo "----------------------------------------------------"
echo "✅ Instalação concluída com sucesso!"
echo "----------------------------------------------------"
echo "Para iniciar em desenvolvimento:  npm run dev:all"
echo "Para iniciar em produção:         npm start"
echo "----------------------------------------------------"
