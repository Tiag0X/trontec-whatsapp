import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    // 1. Fetch
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");
    const baseUrl = settings.evolutionApiUrl.replace(/\/$/, '');
    const token = settings.evolutionToken;
    const instance = settings.evolutionInstanceName;
    const jid = "555191751921-1452255324@g.us";

    console.log(`[DEBUG] Fetching 50 messages...`);
    const url = `${baseUrl}/chat/findMessages/${instance}`;
    const payload = {
        where: { key: { remoteJid: jid } },
        page: 1,
        limit: 50,
        sort: "desc"
    };

    let messages = [];
    try {
        const res = await axios.post(url, payload, { headers: { apikey: token } });
        interface LogMessage {
            messageTimestamp: string;
            message: {
                conversation?: string;
                extendedTextMessage?: { text: string };
                imageMessage?: { caption: string };
                locationMessage?: unknown;
                reactionMessage?: unknown;
            };
            pushName: string;
        }
        messages = (res.data?.messages?.records || []) as LogMessage[];
        console.log(`[DEBUG] Fetched ${messages.length} messages.`);
    } catch (e: unknown) { console.error(e); return; }

    // 2. Simulate LAST_24H (Wide Range covering yesterday and today)
    const startDate = "2026-02-19";
    const endDate = "2026-02-20";

    console.log(`[DEBUG] Calculated Date Range: ${startDate} to ${endDate}`);

    const filterStart = new Date(`${startDate}T00:00:00`);
    const filterEnd = new Date(`${endDate}T23:59:59.999`);
    // Apply patch +4h logic
    filterEnd.setHours(filterEnd.getHours() + 4);

    console.log(`[DEBUG] Filter Window: ${filterStart.toISOString()} -> ${filterEnd.toISOString()}`);

    const filtered = messages.filter((msg) => {
        const msgTime = new Date(Number(msg.messageTimestamp) * 1000);
        const hasText = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.locationMessage ||
            msg.message?.reactionMessage;

        const kept = msgTime >= filterStart && msgTime <= filterEnd && Boolean(hasText);
        return kept;
    });

    console.log(`[DEBUG] Result: ${filtered.length} messages kept.`);
}

main();
