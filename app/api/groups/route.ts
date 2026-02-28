
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all groups
export async function GET() {
    try {
        const groups = await prisma.group.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(groups);
    } catch {
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}

// POST: Create a new group
export async function POST(req: Request) {
    try {
        const body = await req.json() as { name?: string, jid?: string };
        const { name, jid } = body;

        if (!name || !jid) {
            return NextResponse.json({ error: "Name and JID are required" }, { status: 400 });
        }

        const group = await prisma.group.create({
            data: { name, jid, isActive: true }
        });

        return NextResponse.json(group);
    } catch {
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}

// DELETE: Bulk delete groups
export async function DELETE(req: Request) {
    try {
        const body = await req.json() as { ids?: string[] };
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "IDs array is required" }, { status: 400 });
        }

        // Transaction to clean up reports first (if foreign keys restrict)
        // Although Report.groupId is nullable, Prisma schema might enforce FK.
        // Safer to delete reports or set them to null. Deleting is cleaner for "cleaning up".
        const deletedReports = await prisma.report.deleteMany({
            where: { groupId: { in: ids } }
        });

        const deletedGroups = await prisma.group.deleteMany({
            where: { id: { in: ids } }
        });

        return NextResponse.json({
            success: true,
            deletedGroups: deletedGroups.count,
            deletedReports: deletedReports.count
        });
    } catch (error) {
        console.error("Bulk Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete groups" }, { status: 500 });
    }
}
