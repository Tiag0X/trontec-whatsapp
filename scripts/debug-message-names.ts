
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
        console.error("No settings found");
        return;
    }

    // Get an active group
    const group = await prisma.group.findFirst({ where: { isActive: true } });
    if (!group) {
        console.error("No active groups found in DB.");
        return;
    }

    const { evolutionApiUrl, evolutionInstanceName, evolutionToken } = settings;
    const baseUrl = evolutionApiUrl.replace(/\/$/, '');
    const headers = { apikey: evolutionToken };
    const instance = encodeURIComponent(evolutionInstanceName);

    console.log(`Fetching messages for group: ${group.name} (${group.jid})...`);

    try {
        const url = `${baseUrl}/chat/findMessages/${instance}`;
        const res = await axios.post(url, {
            where: {
                key: { remoteJid: group.jid }
            },
            page: 1,
            limit: 50
        }, { headers });

        const messages = (res.data?.messages?.records || []) as { key: { participant?: string; remoteJid: string }; pushName?: string }[];
        console.log(`Found ${messages.length} messages.`);

        const senders: Record<string, string> = {};
        messages.forEach((msg) => {
            const participant = msg.key.participant || msg.key.remoteJid;
            const pushName = msg.pushName;

            if (participant && pushName) {
                senders[participant] = pushName;
            }
        });

        console.log("\n--- Discovered Names ---");
        console.log(JSON.stringify(senders, null, 2));

        if (Object.keys(senders).length === 0) {
            console.log("\nWARNING: No pushNames found in these messages.");
            if (messages.length > 0) {
                console.log("Sample Message Structure:", JSON.stringify(messages[0], null, 2));
            }
        }

    } catch (e: unknown) {
        const err = e as { message?: string };
        console.error("Error:", err.message);
    }
}

main();
