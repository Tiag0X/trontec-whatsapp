
import 'dotenv/config';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { ReportProcessor } from '@/lib/services/processor.service';

const prisma = new PrismaClient();

console.log("🚀 Agendador de Relatórios Iniciado!");
console.log("🕒 Monitorando configurações do banco de dados a cada minuto...");

// Executa A CADA MINUTO para verificar se deve disparar
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentHM = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    try {
        const settings = await prisma.settings.findFirst();

        // Update Heartbeat
        await prisma.settings.update({
            where: { id: 1 },
            data: { schedulerHeartbeat: new Date() }
        });

        if (!settings?.isAutoReportEnabled) {
            // Debug log opcional (muito verbo se deixar ligado direto)
            return;
        }

        if (settings.autoReportTime === currentHM) {
            console.log(`[${now.toISOString()}] ⏰ Hora agendada (${currentHM}) encontrada! Iniciando processamento...`);

            // Check duplicidade hoje (opcional, mas bom pra evitar run duplo no mesmo minuto se script reiniciar)
            // Mas como cron roda 1x por minuto, o risco é baixo.

            const processor = new ReportProcessor();
            const result = await processor.process();
            console.log("✅ Relatório Processado Automaticamente:", result);
        }

    } catch (e) {
        console.error("❌ Erro no Agendador:", e);
    }
});

// Keep alive
process.stdin.resume();
