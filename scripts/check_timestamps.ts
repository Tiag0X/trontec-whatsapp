import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface GenericMessage {
    conversation?: string;
    extendedTextMessage?: { text: string };
    locationMessage?: { degreesLatitude: number; degreesLongitude: number; name?: string; address?: string };
    liveLocationMessage?: { caption: string };
    [key: string]: unknown;
}

interface EvolutionRecord {
    messageTimestamp: string | number;
    message?: GenericMessage;
}

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");
    const baseUrl = settings.evolutionApiUrl.replace(/\/$/, '');
    const token = settings.evolutionToken;
    const instance = settings.evolutionInstanceName;
    const jid = "555191751921-1452255324@g.us";

    console.log(`Verificando TIPO das mensagens para ${jid}...`);
    const url = `${baseUrl}/chat/findMessages/${instance}`;

    const payload = {
        where: { key: { remoteJid: jid } },
        page: 1,
        limit: 10,
        sort: "desc"
    };

    try {
        const res = await axios.post(url, payload, { headers: { apikey: token } });
        const msgs = (res.data?.messages?.records || []) as EvolutionRecord[];
        console.log(`Encontradas: ${msgs.length}`);

        msgs.forEach((m, i: number) => {
            const ts = Number(m.messageTimestamp);
            const date = new Date(ts * 1000);
            const type = m.message ? Object.keys(m.message).filter(k => k !== 'messageContextInfo' && k !== 'senderKeyDistributionMessage').join(', ') : 'unknown';

            console.log(`#${i}: ${date.toLocaleString('pt-BR')} -> Type: ${type}`);

            // Check content sample
            if (m.message?.conversation) console.log(`   Text: ${m.message.conversation.substring(0, 30)}...`);
            else if (m.message?.extendedTextMessage) console.log(`   Text: ${m.message.extendedTextMessage.text.substring(0, 30)}...`);
            else if (m.message?.locationMessage) console.log(`   Loc: ${m.message.locationMessage.degreesLatitude}`);
            else if (m.message?.liveLocationMessage) console.log(`   LiveLoc: ${m.message.liveLocationMessage.caption}`);
            else console.log(`   Content: ${JSON.stringify(m.message).substring(0, 50)}`);
        });

    } catch (e: unknown) {
        const err = e as { message?: string };
        console.error("Erro:", err.message);
    }
}
main();
