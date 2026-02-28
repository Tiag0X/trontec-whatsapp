/* eslint-disable */
// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log(`System Time (Local): ${new Date().toString()}`);
        console.log(`System Time (ISO): ${new Date().toISOString()}`);

        const settings = await prisma.settings.findFirst();
        if (!settings) { console.error("No Settings"); return; }

        const report = await prisma.report.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { group: true }
        });

        if (!report) { console.error("No report found"); return; }

        console.log(`Analyzing Last Report: ${report.id}`);
        console.log(`Status: ${report.status}`);
        console.log(`Created At: ${new Date(report.createdAt).toLocaleString()} (${new Date(report.createdAt).toISOString()})`);

        if (report.status !== 'EMPTY' && report.status !== 'SKIPPED') {
            console.log("⚠️ Warning: Latest report is NOT 'EMPTY'. It is " + report.status);
            // We analyze anyway to see messages
        }

        const group = report.group;
        if (!group) { console.error("No group"); return; }

        const jid = group.jid;
        console.log(`Group: ${group.name} (${jid})`);

        const url = `${settings.evolutionApiUrl.replace(/\/$/, '')}/chat/findMessages/${settings.evolutionInstanceName}`;
        console.log(`Fetching raw messages from: ${url}`);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': settings.evolutionToken
            },
            body: JSON.stringify({
                where: { key: { remoteJid: jid } },
                options: { limit: 10, sort: 'desc' }
            })
        });

        if (!res.ok) {
            console.error(`API Error: ${res.status} ${res.statusText}`);
            console.error(await res.text());
            return;
        }

        const data = await res.json();
        const msgs = Array.isArray(data) ? data : (data.messages || []);

        console.log(`--- API FETCH RESULT ---`);
        console.log(`Messages Found: ${msgs.length}`);

        if (msgs.length > 0) {
            msgs.forEach((m, i) => {
                const ts = Number(m.messageTimestamp);
                const date = new Date(ts * 1000);
                const hasText = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption;

                console.log(`\nMsg #${i + 1}:`);
                console.log(`Timestamp: ${ts} -> ${date.toLocaleString()} (ISO: ${date.toISOString()})`);
                console.log(`Type Keys: ${Object.keys(m.message || {}).join(', ')}`);
                console.log(`Has Text? ${!!hasText} "${(hasText || '').substring(0, 30)}..."`);
                console.log(`From Me? ${m.key?.fromMe}`);
            });
        } else {
            console.warn("⚠️ API returned NO messages. Is the JID correct? Does the instance have history?");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
