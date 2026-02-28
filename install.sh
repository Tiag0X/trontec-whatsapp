#!/bin/bash

# --- Trontec WhatsApp Orchestrator - PRO Linux Installer ---
# Este script automatiza o setup completo: Git, Node.js, Dependências e Banco.

set -e

# Configurações
REPO_URL="https://github.com/Tiag0X/trontec-whatsapp.git"
TARGET_DIR="trontec-whatsapp"
PORT=3000

echo "----------------------------------------------------"
echo "🚀 Iniciando Instalador Profissional (Ubuntu/Debian)"
echo "----------------------------------------------------"

# Função para executar com sudo se necessário
run_cmd() {
    if [ "$(id -u)" -ne 0 ]; then
        if command -v sudo >/dev/null 2>&1; then
            sudo "$@"
        else
            echo "❌ Erro: Este comando precisa de privilégios de root e 'sudo' não foi encontrado."
            exit 1
        fi
    else
        "$@"
    fi
}

# 1. Verificar se a porta $PORT está ocupada
if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Aviso: A porta $PORT já está em uso. Verifique se a aplicação já não está rodando."
    fi
fi

# 2. Verificar/Instalar Git
if ! command -v git &> /dev/null; then
    echo "📦 Instalando Git..."
    run_cmd apt-get update && run_cmd apt-get install -y git
fi

# 3. Gerenciar o diretório do projeto
if [ -f "package.json" ]; then
    echo "✅ Já está dentro de uma pasta de projeto Node.js."
else
    if [ -d "$TARGET_DIR" ]; then
        echo "📂 Entrando no diretório existente: $TARGET_DIR"
        cd "$TARGET_DIR"
    else
        echo "🌐 Clonando repositório: $REPO_URL"
        git clone "$REPO_URL" "$TARGET_DIR"
        cd "$TARGET_DIR"
    fi
fi

# 4. Verificar/Instalar Node.js 20
if ! command -v node &> /dev/null; then
    echo "🟢 Instalando Node.js 20 (LTS)..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | run_cmd bash -
    run_cmd apt-get install -y nodejs
else
    NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" -lt 20 ]; then
        echo "⚠️  Versão do Node ($NODE_VER) é antiga. Atualizando para v20..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | run_cmd bash -
        run_cmd apt-get install -y nodejs
    fi
fi

# 5. Instalar dependências
echo "📦 Instalando dependências (npm install)..."
npm install --no-audit --no-fund

# 6. Configurar Variáveis (se não existir)
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env padrão..."
    cat <<EOF > .env
APP_PASSWORD=admin
DATABASE_URL="file:./prisma/dev.db"
EOF
    echo "✅ Senha padrão definida como: admin"
fi

# Exportar explicitamente para o Prisma não falhar em alguns shells
export DATABASE_URL="file:./prisma/dev.db"

# 7. Preparar Banco de Dados
echo "🗄️  Configurando Prisma e SQLite..."
npx prisma generate
npx prisma db push --accept-data-loss

# 8. Build de Produção
echo "🏗️  Gerando build de produção (Next.js)..."
# Garantir que DATABASE_URL esteja disponível também no build
DATABASE_URL="file:./prisma/dev.db" npm run build

echo ""
echo "----------------------------------------------------"
echo "🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "----------------------------------------------------"
echo "Para iniciar o servidor agora:"
echo "  npm start"
echo ""
echo "Para rodar em background (recomendado):"
echo "  nohup npm start > output.log 2>&1 &"
echo "----------------------------------------------------"
