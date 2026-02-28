
import { prisma } from './lib/prisma';
import { ReportProcessor } from './lib/services/processor.service';

async function main() {
    console.log("Starting manual process test (Round 2)...");
    try {
        const processor = new ReportProcessor();
        const result = await processor.process();
        console.log("Process Result:", JSON.stringify(result, null, 2));

        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            take: 2
        });
        console.log("Last 2 Reports:", JSON.stringify(reports, null, 2));

    } catch (error) {
        console.error("FATAL ERROR:", error);
    }
}

main();
