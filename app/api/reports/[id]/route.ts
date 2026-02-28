import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = params.id;
        const report = await prisma.report.findUnique({
            where: { id },
            include: { group: true }
        });

        if (!report) {
            return NextResponse.json({ error: "Report not found" }, { status: 404 });
        }

        return NextResponse.json(report);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
    }
}
