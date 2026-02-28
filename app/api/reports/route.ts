import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            include: { group: true }
        });
        return NextResponse.json(reports);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
