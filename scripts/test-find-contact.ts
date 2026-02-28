
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

    // Pick a contact
    const contact = await prisma.contact.findFirst();
    const targetJid = contact?.jid || "5551987654321@s.whatsapp.net";

    console.log(`Testing findContact for ${targetJid}...`);

    try {
        // Try /contact/findContact (standard Evolution endpoint)
        const url = `${baseUrl}/contact/findContact/${instance}`;
        const res = await axios.post(url, { number: targetJid }, { headers });
        console.log("Result:", JSON.stringify(res.data, null, 2));
    } catch (e: unknown) {
        const err = e as { message?: string; response?: { data?: unknown } };
        console.error("Error:", err.message);
        if (err.response) console.error("Data:", err.response.data);
    }
}

main();
