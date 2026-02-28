import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const startMonitor = new Date();
console.log(`📡 Monitoring for NEW reports created after ${startMonitor.toISOString()}...`);

const timer = setInterval(async () => {
    try {
        const reports = await prisma.report.findMany({
            where: { createdAt: { gte: startMonitor } },
            orderBy: { createdAt: 'desc' },
            include: { group: true }
        });

        if (reports.length > 0) {
            console.log("\n✅ NEW REPORT DETECTED!");
            reports.forEach(r => {
                console.log(`[${r.createdAt.toISOString()}] ID: ${r.id} | Group: ${r.group?.name} -> ${r.group?.sendToJid || 'Self'} | Status: ${r.status}`);
                console.log(`Summary: ${r.summary.substring(0, 50)}...`);
            });
            // Update startMonitor to avoid repeating log (simple debounce)
            // But for monitoring, repeating is fine as long as count grows
        } else {
            process.stdout.write(".");
        }
    } catch (e) {
        // ignore connection errors during dev reload
    }
}, 5000); // Check every 5s

// Keep alive for 5 minutes
setTimeout(() => {
    clearInterval(timer);
    console.log("Monitor stopped.");
    process.exit(0);
}, 300000);
