import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const p = new PrismaClient();

async function main() {
    const groups = await p.group.findMany();
    const settings = await p.settings.findFirst();
    const prompts = await p.prompt.findMany();
    const reports = await p.report.findMany();

    const data = { groups, settings, prompts, reports };
    fs.writeFileSync('/tmp/db_export.json', JSON.stringify(data, null, 2));
    console.log(`Exported: ${groups.length} groups, ${prompts.length} prompts, ${reports.length} reports`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await p.$disconnect());
