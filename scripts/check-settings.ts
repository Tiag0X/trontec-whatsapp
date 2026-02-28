
import { prisma } from '../lib/prisma';

async function main() {
    const settings = await prisma.settings.findFirst();
    console.log("Settings found:", settings);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
