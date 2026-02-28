
import { PrismaClient } from '@prisma/client';
import { ReportProcessor } from '../lib/services/processor.service';

const prisma = new PrismaClient();

async function main() {
    console.log("--- FORCE AUTO RUN START ---");

    // 1. Check Settings
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");

    console.log(`Settings: Enabled=${settings.isAutoReportEnabled}, Time=${settings.autoReportTime}, Period=${settings.autoReportPeriod}`);

    // 2. Check Groups
    const groups = await prisma.group.findMany({ where: { includeInAutoReport: true, isActive: true } });
    console.log(`Target Groups: ${groups.length}`);
    groups.forEach(g => console.log(`- ${g.name} (${g.jid})`));

    // 3. Run Processor
    console.log("\nRunning Processor...");
    const processor = new ReportProcessor();
    const result = await processor.process();

    console.log("RESULT:", JSON.stringify(result, null, 2));
}

main()
    .catch(e => console.error("ERROR:", e))
    .finally(async () => await prisma.$disconnect());
