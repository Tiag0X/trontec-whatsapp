import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const report = await prisma.report.findUnique({
        where: { id: '7b85b117-c50c-4da9-a798-b89cf73a94d9' }
    });

    if (!report) {
        console.log("Relatório não encontrado.");
        return;
    }

    console.log("--- CONTEÚDO DO RELATÓRIO DO USUÁRIO ---");
    console.log(`DataRef: ${report.dateRef}`);
    console.log(`Summary: ${report.summary}`);
    console.log(`FullText (primeiros 500):`);
    console.log(report.fullText.substring(0, 500));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
