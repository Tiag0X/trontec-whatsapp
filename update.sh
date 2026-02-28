#!/bin/bash

# --- Trontec WhatsApp Orchestrator - PRO Updater ---
# Este script automatiza a atualização segura do sistema em produção.
# Uso: chmod +x update.sh && ./update.sh

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_FILE="prisma/dev.db"
BACKUP_FILE="prisma/dev.db.backup_${TIMESTAMP}"

echo "----------------------------------------------------"
echo "🔄 Trontec WhatsApp Orchestrator - Atualizador"
echo "----------------------------------------------------"
echo ""

# 0. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado."
    echo "   Execute este script dentro do diretório do projeto."
    exit 1
fi

# 1. Parar processos PM2 (se existirem)
echo "⏸️  Parando processos PM2..."
if command -v pm2 &> /dev/null; then
    pm2 stop trontec-app trontec-worker 2>/dev/null || true
    echo "   ✅ Processos PM2 parados."
else
    echo "   ⚠️  PM2 não encontrado. Pulando esta etapa."
    echo "   Se o sistema está rodando de outra forma, pare-o manualmente antes de continuar."
fi

# 2. Backup do banco de dados
echo ""
echo "💾 Fazendo backup do banco de dados..."
if [ -f "$DB_FILE" ]; then
    cp "$DB_FILE" "$BACKUP_FILE"
    echo "   ✅ Backup salvo em: $BACKUP_FILE"
else
    echo "   ⚠️  Arquivo $DB_FILE não encontrado. Pulando backup."
fi

# 3. Puxar atualizações do Git
echo ""
echo "📥 Baixando atualizações do repositório..."
git pull origin main
echo "   ✅ Código atualizado."

# 4. Instalar/atualizar dependências
echo ""
echo "📦 Atualizando dependências (npm install)..."
npm install --no-audit --no-fund
echo "   ✅ Dependências atualizadas."

# 5. Aplicar migrações do banco de dados
echo ""
echo "🗄️  Aplicando migrações do banco de dados..."
export DATABASE_URL="file:./prisma/dev.db"
npx prisma generate
npx prisma db push --accept-data-loss
echo "   ✅ Schema do banco atualizado."

# 6. Gerar build de produção
echo ""
echo "🏗️  Gerando build de produção (Next.js)..."
DATABASE_URL="file:./prisma/dev.db" npm run build
echo "   ✅ Build concluído."

# 7. Reiniciar processos PM2
echo ""
echo "🚀 Reiniciando processos PM2..."
if command -v pm2 &> /dev/null; then
    pm2 restart trontec-app trontec-worker 2>/dev/null || {
        echo "   ⚠️  Processos não encontrados no PM2. Iniciando novamente..."
        pm2 start "npm start" --name trontec-app
        pm2 start "npm run worker" --name trontec-worker
    }
    pm2 save
    echo "   ✅ Processos reiniciados e salvos."
else
    echo "   ⚠️  PM2 não encontrado. Inicie o sistema manualmente:"
    echo "      npm start"
fi

# 8. Verificação final
echo ""
echo "----------------------------------------------------"
echo "🎉 ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "----------------------------------------------------"
echo ""
if command -v pm2 &> /dev/null; then
    echo "📊 Status dos processos:"
    pm2 status
fi
echo ""
echo "🔗 Acesse: http://localhost:3000"
echo ""
echo "💾 Backup do banco salvo em: $BACKUP_FILE"
echo "   Para restaurar em caso de problemas:"
echo "   cp $BACKUP_FILE $DB_FILE"
echo "----------------------------------------------------"
