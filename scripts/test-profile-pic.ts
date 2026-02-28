
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

    // Pick a likely valid JID from logs or just a known one. 
    // I'll try to find one from the DB or use a hardcoded sample if DB is empty
    // But I can query the DB.
    const contact = await prisma.contact.findFirst();
    const targetJid = contact?.jid || "5551987654321@s.whatsapp.net"; // Fallback

    console.log(`Testing Profile Picture fetch for ${targetJid} on ${baseUrl}...`);

    try {
        // Try /chat/findProfilePicture
        const url = `${baseUrl}/chat/findProfilePicture/${encodeURIComponent(evolutionInstanceName)}`;
        console.log("Requesting:", url);

        const response = await axios.post(
            url,
            { number: targetJid },
            { headers: { apikey: evolutionToken } }
        );

        console.log("Response:", response.data);
    } catch (error: unknown) {
        const err = error as { message?: string; response?: { data?: unknown } };
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Data:", err.response.data);
        }
    }
}

main();
