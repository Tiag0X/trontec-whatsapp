
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) return;

    const { evolutionApiUrl, evolutionInstanceName, evolutionToken } = settings;
    const baseUrl = evolutionApiUrl.replace(/\/$/, '');

    try {
        const res = await axios.get(
            `${baseUrl}/group/fetchAllGroups/${encodeURIComponent(evolutionInstanceName)}?getParticipants=true`,
            { headers: { apikey: evolutionToken } }
        );

        const groups = (res.data || []) as { participants: { id: string; phoneNumber?: string }[] }[];
        if (groups.length > 0) {
            const p = groups[0].participants.find(p => p.id.includes('@lid'));
            if (p) {
                console.log("Found LID Participant:");
                console.log("ID:", p.id);
                console.log("PhoneNumber:", p.phoneNumber); // Check this value
            } else {
                console.log("No LID participant found in first group sample.");
                // Log any participant
                const p2 = groups[0].participants[0];
                console.log("Sample:", p2);
            }
        }
    } catch (e: unknown) {
        const err = e as { message?: string };
        console.error("Error:", err.message);
    }
}

main();
