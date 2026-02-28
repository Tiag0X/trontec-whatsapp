
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const groups = await prisma.group.findMany()
    console.log("Total Groups:", groups.length)
    console.table(groups.map(g => ({ id: g.id, name: g.name, isActive: g.isActive, jid: g.jid })))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
