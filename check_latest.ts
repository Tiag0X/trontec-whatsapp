import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const r = await prisma.report.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { group: true }
    });

    if (r) {
        console.log("LATEST REPORT FOUND:");
        console.log(`ID: ${r.id}`);
        console.log(`Created At: ${new Date(r.createdAt).toISOString()}`);
        console.log(`Status: ${r.status}`);
        console.log(`Summary: ${r.summary}`);
        console.log(`Group: ${r.group?.name}`);
    } else {
        console.log("NO REPORTS FOUND IN DATABASE.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
