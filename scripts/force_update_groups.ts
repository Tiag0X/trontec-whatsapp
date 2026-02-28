import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.settings.findFirst();
    if (!settings) throw new Error("No settings");

    const baseUrl = settings.evolutionApiUrl.replace(/\/$/, '');
    const token = settings.evolutionToken;
    const instance = settings.evolutionInstanceName;

    console.log(`Forçando atualização de grupos param ${instance}...`);

    // Tentativa 1: POST /group/updateAllGroups
    // (Comum em versões recentes baseadas em Baileys)
    try {
        const url = `${baseUrl}/group/updateAllGroups/${instance}`;
        console.log(`Tentando POST ${url}...`);
        const res = await axios.post(url, {}, { headers: { apikey: token } });
        console.log("Status:", res.status);
        console.log("✅ Grupos atualizados via updateAllGroups.");
    } catch (e: unknown) {
        const err = e as { message?: string };
        console.log(`⚠️ Falha em updateAllGroups: ${err.message}`);

        // Tentativa 2: GET /group/fetchAllGroups?getParticipants=true (Refresh implícito)
        try {
            const url2 = `${baseUrl}/group/fetchAllGroups/${instance}?getParticipants=true`;
            console.log(`Tentando GET ${url2}...`);
            const res2 = await axios.get(url2, { headers: { apikey: token } });
            console.log(`Wait: fetchAllGroups retornou ${res2.data?.length || 0} grupos.`);
        } catch (e2: unknown) {
            const err2 = e2 as { message?: string };
            console.error("Erro fatal na atualização:", err2.message);
        }
    }
}

main();
