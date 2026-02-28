import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    console.log(await prisma.scheduledMessage.findMany());
    await prisma.$disconnect();
}
run();
