
import axios from 'axios';
import { prisma } from '../lib/prisma';
import fs from 'fs';

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) return;

    const baseUrl = settings.evolutionApiUrl.replace(/\/$/, '');
    const token = settings.evolutionToken.trim();
    const instanceName = settings.evolutionInstanceName.trim();

    let log = `Config:\nBaseURL: '${baseUrl}'\nInstance: '${instanceName}' (len: ${instanceName.length})\nToken: '${token.substring(0, 5)}...'\n\n`;

    // 1. Try to list instances
    try {
        log += `Trying GET ${baseUrl}/instance/fetchInstances\n`;
        const res = await axios.get(`${baseUrl}/instance/fetchInstances`, { headers: { apikey: token } });
        log += `Instances found: ${JSON.stringify(res.data, null, 2)}\n`;
    } catch (e: unknown) {
        const err = e as { message?: string; response?: { data?: unknown } };
        log += `List Instances Failed: ${err.message}\n`;
        if (err.response) log += `Data: ${JSON.stringify(err.response.data)}\n`;
    }

    // 2. Try the fetchMessages again with the exact name if found, else original
    const targets = [instanceName, encodeURIComponent(instanceName)];
    for (const t of targets) {
        try {
            log += `\nTrying fetchMessages on: ${t}\n`;
            await axios.post(`${baseUrl}/chat/findMessages/${t}`,
                { where: { key: { remoteJid: settings.whatsappGroupId } }, page: 1, limit: 1 },
                { headers: { apikey: token } }
            );
            log += "SUCCESS\n";
        } catch (e: unknown) {
            const err = e as { message?: string; response?: { status?: number } };
            log += `Failed: ${err.message} - ${err.response?.status}\n`;
        }
    }

    fs.writeFileSync('debug-out.txt', log);
    console.log("Written to debug-out.txt");
}

main();
