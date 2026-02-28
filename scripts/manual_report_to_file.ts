import { PrismaClient } from '@prisma/client';
import { ReportProcessor } from '../lib/services/processor.service';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Iniciando Processo Manual de Relatório -> Arquivo...");

    // 1. Encontrar o Grupo pelo JID legado
    const targetJid = "555191751921-1452255324@g.us";
    const group = await prisma.group.findFirst({
        where: { jid: targetJid }
    });

    if (!group) {
        console.error(`❌ Grupo não encontrado no banco de dados para JID: ${targetJid}`);
        // Tentar buscar pelo nome "Rondas Trontec" caso o JID tenha mudado no banco mas usuário não saiba
        const groupByName = await prisma.group.findFirst({
            where: { name: { contains: "Ronda" } }
        });
        if (groupByName) {
            console.log(`⚠️ Usando grupo encontrado por nome: ${groupByName.name} (${groupByName.jid})`);
            await generateForGroup(groupByName.id, groupByName.name);
        } else {
            process.exit(1);
        }
    } else {
        await generateForGroup(group.id, group.name);
    }
}

async function generateForGroup(groupId: string, groupName: string) {
    const processor = new ReportProcessor();

    console.log(`⚙️ Processando grupo: ${groupName} (ID: ${groupId})`);

    // Configurar datas para "Últimas 24h" (19/02 a 20/02) para garantir que pegamos as mensagens
    // Hardcoded para o teste de hoje, ou dinâmico?
    // Melhor dinâmico: Yesterday to Today.
    // Mas para reproducir o erro/sucesso do usuário: 2026-02-19 a 2026-02-20
    const startDate = "2026-02-19";
    const endDate = "2026-02-20";

    try {
        const result = await processor.process({
            groupIds: [groupId],
            startDate: startDate,
            endDate: endDate
        });

        console.log("✅ Processamento concluído. Status:", result.status);

        if (result.results && result.results.length > 0) {
            const output = result.results[0].result; // Report Data

            // Wait, processSingleGroup returns { status, reportId, error }? 
            // process returns { status, results: [{ group, result }] }
            // Let's check structure.

            // Se processou com sucesso, recuperamos o relatório do banco para ter certeza
            // Ou o processSingleGroup retorna dados completos?
            // O código do processor retorna { status, reportId }.

            if (output.reportId) {
                const report = await prisma.report.findUnique({
                    where: { id: output.reportId }
                });

                if (report) {
                    const filename = `relatorio_rondas_${Date.now()}.md`;
                    const content = `# Relatório Gerado Manualmente\n\n` +
                        `**Grupo:** ${groupName}\n` +
                        `**Status:** ${report.status}\n` +
                        `**Referência:** ${report.dateRef}\n\n` +
                        `## Conteúdo Gerado:\n\n${report.fullText}\n\n` +
                        `## Debug - Dados Processados:\n\n\`\`\`json\n${report.processedData}\n\`\`\``;

                    fs.writeFileSync(filename, content);
                    console.log(`📄 Relatório salvo em: ${filename}`);
                    console.log(`📝 Conteúdo Prévio: \n${report.fullText.substring(0, 200)}...`);
                }
            } else {
                console.log("⚠️ Resultado sem reportId:", output);
            }
        }

    } catch (e: unknown) {
        const err = e as { message?: string };
        console.error("❌ Erro no processador:", err.message);
        console.error(e);
    }
}

main();
