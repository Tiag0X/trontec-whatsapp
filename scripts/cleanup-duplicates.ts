
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Cleaning up duplicate/LID contacts...");

    const { count } = await prisma.contact.deleteMany({
        where: {
            jid: { contains: '@lid' }
        }
    });

    console.log(`Deleted ${count} contacts with '@lid' JIDs.`);

    const remaining = await prisma.contact.count();
    console.log(`Remaining valid contacts: ${remaining}`);
}

main();
