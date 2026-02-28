import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const p = new PrismaClient();

async function main() {
    const data = JSON.parse(fs.readFileSync('db_export.json', 'utf8'));

    // Import Settings
    if (data.settings) {
        const s = data.settings;
        await p.settings.upsert({
            where: { id: s.id || 1 },
            update: {
                evolutionApiUrl: s.evolutionApiUrl || '',
                evolutionInstanceName: s.evolutionInstanceName || '',
                evolutionToken: s.evolutionToken || '',
                whatsappGroupId: s.whatsappGroupId || '',
                openaiApiKey: s.openaiApiKey || '',
                systemPrompt: s.systemPrompt || null,
                defaultPromptId: s.defaultPromptId || null,
                autoReportTime: s.autoReportTime || '08:00',
                isAutoReportEnabled: s.isAutoReportEnabled || false,
                autoReportPeriod: s.autoReportPeriod || 'YESTERDAY',
                langchainModel: s.langchainModel || 'gpt-4o-mini',
                langchainTemperature: s.langchainTemperature ?? 0.7,
            },
            create: {
                id: s.id || 1,
                evolutionApiUrl: s.evolutionApiUrl || '',
                evolutionInstanceName: s.evolutionInstanceName || '',
                evolutionToken: s.evolutionToken || '',
                whatsappGroupId: s.whatsappGroupId || '',
                openaiApiKey: s.openaiApiKey || '',
                systemPrompt: s.systemPrompt || null,
                defaultPromptId: null,
                autoReportTime: s.autoReportTime || '08:00',
                isAutoReportEnabled: s.isAutoReportEnabled || false,
                autoReportPeriod: s.autoReportPeriod || 'YESTERDAY',
                langchainModel: s.langchainModel || 'gpt-4o-mini',
                langchainTemperature: s.langchainTemperature ?? 0.7,
            },
        });
        console.log('Settings imported');
    }

    // Import Prompts
    for (const pr of (data.prompts || [])) {
        await p.prompt.upsert({
            where: { id: pr.id },
            update: { name: pr.name, content: pr.content },
            create: { id: pr.id, name: pr.name, content: pr.content },
        });
    }
    console.log(`${(data.prompts || []).length} prompts imported`);

    // Import Groups
    for (const g of (data.groups || [])) {
        await p.group.upsert({
            where: { id: g.id },
            update: {
                name: g.name,
                jid: g.jid,
                isActive: g.isActive,
                includeInAutoReport: g.includeInAutoReport,
                sendToJid: g.sendToJid,
                sendToName: g.sendToName,
                promptId: g.promptId,
            },
            create: {
                id: g.id,
                name: g.name,
                jid: g.jid,
                isActive: g.isActive ?? true,
                includeInAutoReport: g.includeInAutoReport ?? true,
                sendToJid: g.sendToJid || null,
                sendToName: g.sendToName || null,
                promptId: g.promptId || null,
            },
        });
    }
    console.log(`${(data.groups || []).length} groups imported`);

    // Import Reports
    for (const r of (data.reports || [])) {
        try {
            await p.report.upsert({
                where: { id: r.id },
                update: {
                    groupId: r.groupId,
                    createdAt: new Date(r.createdAt),
                    dateRef: r.dateRef,
                    summary: r.summary,
                    fullText: r.fullText,
                    occurrences: r.occurrences || '',
                    problems: r.problems || '',
                    orders: r.orders || '',
                    actions: r.actions || '',
                    engagement: r.engagement || '',
                    processedData: r.processedData || '',
                    status: r.status || 'GENERATED',
                },
                create: {
                    id: r.id,
                    groupId: r.groupId,
                    createdAt: new Date(r.createdAt),
                    dateRef: r.dateRef || new Date().toLocaleDateString('pt-BR'),
                    summary: r.summary || '',
                    fullText: r.fullText || '',
                    occurrences: r.occurrences || '',
                    problems: r.problems || '',
                    orders: r.orders || '',
                    actions: r.actions || '',
                    engagement: r.engagement || '',
                    processedData: r.processedData || '',
                    status: r.status || 'GENERATED',
                },
            });
        } catch (e: unknown) {
            const err = e as { message?: string };
            console.error(`Failed to import report ${r.id}:`, err.message);
            // Skip FK errors for reports with missing groups
        }
    }
    console.log(`${(data.reports || []).length} reports imported`);

    // Verify
    const gc = await p.group.count();
    const pc = await p.prompt.count();
    const rc = await p.report.count();
    console.log(`\nVerification: ${gc} groups, ${pc} prompts, ${rc} reports`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await p.$disconnect());
