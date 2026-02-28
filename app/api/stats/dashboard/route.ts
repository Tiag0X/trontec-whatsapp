
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [
            groupsTotal,
            groupsActive,
            contactsTotal,
            contactsBusiness,
            reportsTotal,
            reportsSent,
            promptsTotal
        ] = await Promise.all([
            prisma.group.count(),
            prisma.group.count({ where: { isActive: true } }),
            prisma.contact.count(),
            prisma.contact.count({ where: { isBusiness: true } }),
            prisma.report.count(),
            prisma.report.count({ where: { status: 'SENT' } }),
            prisma.prompt.count()
        ]);

        const settings = await prisma.settings.findUnique({ where: { id: 1 } });

        return NextResponse.json({
            groups: { total: groupsTotal, active: groupsActive },
            contacts: { total: contactsTotal, business: contactsBusiness },
            reports: { total: reportsTotal, sent: reportsSent },
            prompts: { total: promptsTotal },
            scheduler: {
                enabled: settings?.isAutoReportEnabled ?? false,
                time: settings?.autoReportTime ?? "08:00",
                lastHeartbeat: settings?.schedulerHeartbeat
            }
        });
    } catch (error) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
