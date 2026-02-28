import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");

    const baseUrl = settings.evolutionApiUrl.replace(/\/$/, '');
    const token = settings.evolutionToken;
    const instance = settings.evolutionInstanceName;

    // Valid remote JID from sync log (Ed. Praia de Fora)
    const targetJid = "120363407617382383@g.us";

    console.log(`Testing fetch for KNOWN valid JID: ${targetJid}`);

    const url = `${baseUrl}/chat/findMessages/${instance}`;

    try {
        const payload = {
            where: {
                key: {
                    remoteJid: targetJid
                }
            },
            page: 1,
            limit: 5
        };
        console.log("Payload:", JSON.stringify(payload, null, 2));

        const res = await axios.post(url, payload, { headers: { apikey: token } });

        console.log("Status:", res.status);
        console.log("Records found:", res.data?.messages?.records?.length || 0);

        if (res.data?.messages?.records?.length > 0) {
            const first = res.data.messages.records[0];
            const last = res.data.messages.records[res.data.messages.records.length - 1];

            console.log("First Message TS:", first.messageTimestamp);
            console.log("First Message Key:", first.key);
            console.log("Last Message TS:", last.messageTimestamp);
        } else {
            console.log("Full Response:", JSON.stringify(res.data, null, 2));
        }

    } catch (e: unknown) {
        const err = e as { message?: string; response?: { data?: unknown } };
        console.error("Error:", err.message);
        console.error("Response:", err.response?.data);
    }
}

main();
