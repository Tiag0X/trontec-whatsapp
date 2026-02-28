
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("--- DEBUGGING AUTOMATION STATE ---");

    // 1. Check Settings
    const settings = await prisma.settings.findFirst();
    console.log("\n1. SETTINGS:");
    if (!settings) {
        console.log("❌ No settings found!");
    } else {
        console.log(`- Enabled: ${settings.isAutoReportEnabled}`);
        console.log(`- Time: ${settings.autoReportTime}`);
        console.log(`- Period: ${settings.autoReportPeriod}`);
        console.log(`- Heartbeat: ${settings.schedulerHeartbeat}`);

        // Check if time matches current time
        const now = new Date();
        const currentHM = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        console.log(`- Current System Time: ${currentHM}`);
    }

    // 2. Check Groups
    const groups = await prisma.group.findMany();
    console.log(`\n2. GROUPS (${groups.length} total):`);
    const activeAutoGroups = groups.filter(g => g.includeInAutoReport && g.isActive);

    if (activeAutoGroups.length === 0) {
        console.log("❌ NO groups selected for auto-report (includeInAutoReport=true AND isActive=true)");
    } else {
        console.log(`✅ ${activeAutoGroups.length} groups ready for auto-report:`);
        activeAutoGroups.forEach(g => {
            console.log(`- [${g.id}] ${g.name} (JID: ${g.jid})`);
        });
    }

    // 3. Check Recent Reports
    const recentReports = await prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log("\n3. RECENT REPORTS (Last 5):");
    recentReports.forEach(r => {
        console.log(`- [${r.createdAt.toISOString()}] ${r.status} (Group: ${r.groupId || 'None'})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
