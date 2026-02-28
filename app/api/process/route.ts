import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ReportProcessor } from '@/lib/services/processor.service';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { startDate, endDate, groupIds } = body;
        console.log(`[API] Processing request for groups: ${groupIds ? JSON.stringify(groupIds) : 'all'}`);

        // Debug Settings Direct Check
        const settings = await prisma.settings.findFirst();
        console.log(`[API] DB Settings Check: URL=${settings?.evolutionApiUrl}, Instance=${settings?.evolutionInstanceName}`);

        const processor = new ReportProcessor();
        const result = await processor.process({ startDate, endDate, groupIds });
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error processing report:", error);
        return NextResponse.json(
            { error: "Failed to process report", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
