import { PrismaClient } from '@prisma/client';
import { EvolutionService } from '../lib/services/evolution.service';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");

    const evo = new EvolutionService(settings.evolutionApiUrl, settings.evolutionInstanceName, settings.evolutionToken);

    try {
        console.log("Buscando todos os grupos...");
        const groups = await evo.fetchAllGroups();

        const lines = groups.map(g => `ID: ${g.id} | Name: ${g.subject}`);
        fs.writeFileSync('remote_groups_dump.txt', lines.join('\n'));
        console.log(`Dump salvo em 'remote_groups_dump.txt' com ${lines.length} grupos.`);

        // Print groups with 'Trontec' just in case
        const matches = groups.filter(g => g.subject.toLowerCase().includes('trontec'));
        console.log("\nGrupos com 'Trontec':");
        matches.forEach(m => console.log(`${m.subject} : ${m.id}`));

    } catch (e) {
        console.error("Erro:", e);
    }
}

main();
