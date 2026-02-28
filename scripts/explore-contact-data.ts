
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
    const headers = { apikey: evolutionToken };
    const instance = encodeURIComponent(evolutionInstanceName);

    console.log(`Checking data from: ${baseUrl}`);

    try {
        // Fetch some contacts from DB to test
        const contacts = await prisma.contact.findMany({ take: 5 });

        for (const contact of contacts) {
            console.log(`\n\n--- Analyzing ${contact.name} (${contact.jid}) ---`);

            // 1. fetchProfile
            try {
                const profile = await axios.post(`${baseUrl}/chat/fetchProfile/${instance}`, { number: contact.jid }, { headers });
                console.log("fetchProfile Keys:", Object.keys(profile.data || {}));
                if (profile.data) console.log(JSON.stringify(profile.data, null, 2));
            } catch { console.log("fetchProfile (404/Error)"); }

            // 2. fetchBusinessProfile
            try {
                const biz = await axios.post(`${baseUrl}/chat/fetchBusinessProfile/${instance}`, { number: contact.jid }, { headers });
                console.log("fetchBusinessProfile Keys:", Object.keys(biz.data || {}));
                if (biz.data) console.log(JSON.stringify(biz.data, null, 2));
            } catch { console.log("fetchBusinessProfile (Not Business)"); }
        }

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Main Error:", err.message);
    }
}

main();
