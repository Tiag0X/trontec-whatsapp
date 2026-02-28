
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- CHECKING GROUPS AND PROMPTS ---");

    // 1. Search for the group "Coordenação"
    const groups = await prisma.group.findMany({
        where: { name: { contains: 'Coordenação' } },
        include: { prompt: true }
    });

    if (groups.length === 0) {
        console.log("❌ No group found with name containing 'Coordenação'");
        // List all groups just in case
        const allGroups = await prisma.group.findMany({ select: { id: true, name: true, promptId: true } });
        console.log("Available groups:", allGroups.map(g => `${g.name} (ID: ${g.id}, Prompt: ${g.promptId})`).join(', '));
    } else {
        groups.forEach(g => {
            console.log(`\nGROUP: ${g.name} (ID: ${g.id})`);
            console.log(`- Assigned Prompt ID: ${g.promptId || 'None (Using System Default)'}`);

            if (g.prompt) {
                console.log(`- PROMPT NAME: ${g.prompt.name}`);
                console.log(`- PROMPT CONTENT:\n${g.prompt.content}`);
            }
        });
    }

    // 2. Check System Default Prompt
    const settings = await prisma.settings.findFirst();
    /* 
       Note: The Settings model definition seen earlier had:
       systemPrompt          String? // Custom system prompt for AI
       defaultPromptId       String? // Default prompt for rewriter
    */
    console.log(`\nSYSTEM SETTINGS:`);
    if (settings) {
        console.log(`- System Custom Prompt:\n${settings.systemPrompt}`);
        console.log(`- Default Rewrite Prompt ID: ${settings.defaultPromptId}`);
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
