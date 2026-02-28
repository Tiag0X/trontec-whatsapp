import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const reportId = "d42b295f-3151-4b9c-91cc-2cebdefa0ba5";

    try {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: { group: true }
        });

        if (!report) {
            console.error(`❌ Relatório ${reportId} não encontrado.`);
            return;
        }

        console.log("\n========================================");
        console.log(`REPORT ANALYSIS: ${report.group?.name || 'Unknown Group'}`);
        console.log(`Date Ref: ${report.dateRef}`);
        console.log(`Status: ${report.status}`);
        console.log(`Created At: ${report.createdAt}`);
        console.log("========================================\n");

        console.log("--- SUMMARY ---");
        console.log(report.summary);

        console.log("\n--- FULL TEXT ---");
        console.log(report.fullText);

        console.log("\n--- STRUCTURED DATA (JSON Lengths) ---");
        console.log(`Occurrences: ${report.occurrences.length} chars`);
        console.log(`Problems: ${report.problems.length} chars`);
        console.log(`Orders: ${report.orders.length} chars`);
        console.log(`Actions: ${report.actions.length} chars`);

        console.log("\n--- PROCESSED DATA SAMPLE ---");
        console.log(report.processedData.substring(0, 500) + "..."); // First 500 chars of raw data

    } catch (e: unknown) {
        const err = e as { message?: string };
        console.error("Error fetching report:", err.message);
    }
}

main();
