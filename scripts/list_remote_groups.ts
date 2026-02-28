import { PrismaClient } from '@prisma/client';
import { EvolutionService } from '../lib/services/evolution.service';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");

    console.log("Conectando à API Evolution...");
    const evo = new EvolutionService(settings.evolutionApiUrl, settings.evolutionInstanceName, settings.evolutionToken);

    try {
        const groups = await evo.fetchAllGroups();
        console.log(`Total de grupos remotos: ${groups.length}`);

        const rondas = groups.filter(g => g.subject.toLowerCase().includes('ronda'));

        console.log("\nGrupos encontrados com 'Ronda':");
        rondas.forEach(g => {
            console.log(`- Nome: "${g.subject}" | ID: ${g.id}`);
        });

        const teste = groups.filter(g => g.subject.toLowerCase().includes('teste'));
        console.log("\nGrupos encontrados com 'Teste':");
        teste.forEach(g => {
            console.log(`- Nome: "${g.subject}" | ID: ${g.id}`);
        });

    } catch (e) {
        console.error("Erro:", e);
    }
}

main();
