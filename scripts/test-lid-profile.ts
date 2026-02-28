
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) return;

    const { evolutionApiUrl, evolutionInstanceName, evolutionToken } = settings;
    const baseUrl = evolutionApiUrl.replace(/\/$/, '');
    const headers = { apikey: evolutionToken };
    const instance = encodeURIComponent(evolutionInstanceName);

    // Use a LID found in previous logs
    const targetLid = "65854918156307@lid"; // Example from logs

    console.log(`Testing Profile Pic for LID: ${targetLid}...`);

    try {
        const res = await axios.post(
            `${baseUrl}/chat/findProfilePicture/${instance}`,
            { number: targetLid },
            { headers }
        );
        console.log("LID Result:", res.data);
    } catch (e: unknown) {
        const err = e as { message?: string };
        console.log("LID Failed:", err.message);
    }
}

main();
