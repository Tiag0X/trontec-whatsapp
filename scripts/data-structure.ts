
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
        console.error("No settings found");
        return;
    }

    const { evolutionApiUrl, evolutionInstanceName, evolutionToken } = settings;
    const baseUrl = evolutionApiUrl.replace(/\/$/, '');

    try {
        const response = await axios.get(
            `${baseUrl}/group/fetchAllGroups/${encodeURIComponent(evolutionInstanceName)}?getParticipants=true`,
            { headers: { apikey: evolutionToken } }
        );

        const groups = response.data || [];
        if (groups.length > 0) {
            const participants = groups[0].participants || [];
            if (participants.length > 0) {
                console.log("Keys:", Object.keys(participants[0]));
                console.log("Sample:", JSON.stringify(participants[0], null, 2));
            } else {
                console.log("No participants in first group.");
            }
        }
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Error:", err.message);
    }
}

main();
