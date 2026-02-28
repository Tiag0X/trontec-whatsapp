import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");

    const baseUrl = settings.evolutionApiUrl.replace(/\/$/, '');
    const token = settings.evolutionToken;
    const instance = settings.evolutionInstanceName;

    // O ID problemático (Rondas Trontec)
    const targetJid = "555191751921-1452255324@g.us";

    console.log(`Buscando INFO do grupo: ${targetJid}`);

    // Endpoint: /group/findGroupInfos/{instance}?groupJid={jid}
    const url = `${baseUrl}/group/findGroupInfos/${instance}?groupJid=${targetJid}`;

    try {
        const res = await axios.get(url, { headers: { apikey: token } });
        console.log("Status:", res.status);
        console.log("Dados do Grupo (Resumo):", {
            id: res.data?.id,
            subject: res.data?.subject,
            owner: res.data?.owner,
            creation: res.data?.creation,
            participantsCount: res.data?.participants?.length
        });

    } catch (e: unknown) {
        const err = e as { message?: string; response?: { data?: unknown } };
        console.error("Erro ao buscar info do grupo:", err.message);
        if (err.response) {
            console.error("Response:", err.response.data);
        }
    }
}

main();
