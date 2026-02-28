#!/bin/bash

# --- Trontec WhatsApp Orchestrator - Full Linux Installer ---
set -e

REPO_URL="https://github.com/Tiag0X/trontec-whatsapp.git"
TARGET_DIR="trontec-whatsapp"

echo "🚀 Iniciando instalador completo para Linux..."

# 1. Verificar Git
if ! command -v git &> /dev/null; then
    echo "❌ Git não encontrado. Instalando..."
    sudo apt-get update && sudo apt-get install -y git
fi

# 2. Clonar repositório (se não estiver na pasta correta)
if [ ! -f "package.json" ]; then
    echo "📂 Clonando repositório do GitHub..."
    if [ -d "$TARGET_DIR" ]; then
        echo "⚠️  Diretório $TARGET_DIR já existe. Entrando nele..."
        cd "$TARGET_DIR"
    else
        git clone "$REPO_URL" "$TARGET_DIR"
        cd "$TARGET_DIR"
    fi
fi

# 3. Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 4. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 5. Configurar .env
if [ ! -f .env ]; then
    echo "📝 Criando .env inicial..."
    cat <<EOF > .env
APP_PASSWORD=admin
DATABASE_URL="file:./prisma/dev.db"
EOF
fi

# 6. Banco de Dados
echo "🗄️  Sincronizando banco de dados..."
npx prisma generate
npx prisma db push

# 7. Build
echo "🏗️  Gerando build..."
npm run build

echo ""
echo "✅ Instalação concluída!"
echo "Para iniciar: cd $TARGET_DIR && npm start"
