import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(`Checking reports since: ${today.toISOString()}`);

    const reports = await prisma.report.findMany({
        where: { createdAt: { gte: today } },
        select: { id: true, status: true, group: { select: { name: true } }, createdAt: true, summary: true }
    });

    console.log(`Found ${reports.length} reports today.`);
    console.log(JSON.stringify(reports, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
