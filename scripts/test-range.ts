
import { ReportProcessor } from '../lib/services/processor.service';
import { prisma } from '../lib/prisma';

async function main() {
    console.log("--- 🧪 Testando Ordem Cronológica e Intervalo ---");

    const group = await prisma.group.findFirst({
        where: { name: { contains: 'Rondas Trontec' } }
    });

    if (!group) return;

    const processor = new ReportProcessor();
    const options = {
        startDate: '2026-02-17',
        endDate: '2026-02-20',
        groupIds: [group.id]
    };

    try {
        console.log("Processando...");
        await processor.process(options);

        const lastReport = await prisma.report.findFirst({
            where: { groupId: group.id },
            orderBy: { createdAt: 'desc' }
        });

        if (lastReport) {
            console.log(`\nDataRef Salva: ${lastReport.dateRef}`);
            console.log(`Tamanho do Texto: ${lastReport.fullText.length} caracteres`);

            console.log("\nCabeçalho do Relatório Gerado:");
            const lines = lastReport.fullText.split('\n').slice(0, 10);
            console.log(lines.join('\n'));

            if (lastReport.fullText.includes('período 17/02/2026 a 20/02/2026') || lastReport.fullText.includes('17/02/2026 a 20/02/2026')) {
                console.log("\n✅ SUCESSO: O título do relatório contém o intervalo correto.");
            } else {
                console.log("\n❌ AVISO: O título pode não estar como esperado. Verifique o cabeçalho acima.");
            }
        }

    } catch (error) {
        console.error(error);
    }
}

main().finally(() => prisma.$disconnect());
