
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
        console.error("No settings found");
        return;
    }

    const { evolutionApiUrl, evolutionInstanceName, evolutionToken } = settings;
    const baseUrl = evolutionApiUrl.replace(/\/$/, '');

    console.log(`Fetching groups from ${baseUrl}...`);

    try {
        const response = await axios.get(
            `${baseUrl}/group/fetchAllGroups/${encodeURIComponent(evolutionInstanceName)}?getParticipants=true`,
            {
                headers: { apikey: evolutionToken }
            }
        );

        const groups = response.data || [];
        console.log(`Found ${groups.length} groups.`);

        if (groups.length > 0) {
            const group = groups[0];
            console.log("Sample Group:", group.subject);
            if (group.participants && group.participants.length > 0) {
                console.log("Sample Participant Structure:", JSON.stringify(group.participants[0], null, 2));
            } else {
                console.log("No participants in first group.");
            }
        }

    } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: unknown } };
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Data:", err.response.data);
        }
    }
}

main();
