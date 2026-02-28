import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const groups = await prisma.group.findMany();
    console.log("Grupos no Banco de Dados:");
    groups.forEach(g => {
        console.log(`Nome: "${g.name}" | JID: ${g.jid} | ID: ${g.id}`);
    });
}
main();
