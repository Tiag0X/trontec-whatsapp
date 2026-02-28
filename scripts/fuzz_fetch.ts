import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");

    const baseUrl = settings.evolutionApiUrl.replace(/\/$/, '');
    const token = settings.evolutionToken;
    const instance = settings.evolutionInstanceName;

    // ID Problemático
    const jid = "555191751921-1452255324@g.us";

    console.log(`Fuzzing fetch for JID: ${jid} at ${baseUrl}/${instance}`);

    // Endpoint principal
    const url = `${baseUrl}/chat/findMessages/${instance}`;

    const payloads = [
        { name: "Standard V2 (Key)", body: { where: { key: { remoteJid: jid } }, page: 1, limit: 10 } },
        { name: "Standard V2 + Update", body: { where: { key: { remoteJid: jid } }, page: 1, limit: 10, sort: "desc" } },
        { name: "Flat Where", body: { where: { remoteJid: jid }, page: 1, limit: 10 } },
        { name: "Direct Body", body: { remoteJid: jid, page: 1, limit: 10 } },
        { name: "With Sort Object", body: { where: { key: { remoteJid: jid } }, options: { sort: { messageTimestamp: 'desc' } }, page: 1, limit: 10 } },
        { name: "Query Param Style", body: {}, urlSuffix: `?where[key][remoteJid]=${jid}` } // For old parsers
    ];

    for (const p of payloads) {
        try {
            console.log(`Trying ${p.name}...`);
            const reqUrl = p.urlSuffix ? url + p.urlSuffix : url;
            const res = await axios.post(reqUrl, p.body, { headers: { apikey: token } });

            // Handle various response formats
            let count = 0;
            if (Array.isArray(res.data)) count = res.data.length;
            else if (res.data?.messages?.records) count = res.data.messages.records.length;
            else if (res.data?.records) count = res.data.records.length;

            console.log(`  -> Result: ${count} messages.`);
            if (count > 0) {
                console.log("  SUCCESS! FOUND WORKING PAYLOAD.");
                // Break loop? No, see all options.
            }
        } catch (e: unknown) {
            const err = e as { message?: string };
            console.log(`  -> Error: ${err.message}`);
        }
    }
}

main();
