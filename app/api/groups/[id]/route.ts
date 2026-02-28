
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;

        await prisma.group.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (_error) {
        return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await req.json();

        const group = await prisma.group.update({
            where: { id },
            data: {
                isActive: body.isActive,
                name: body.name,
                jid: body.jid,
                sendToJid: body.sendToJid, // Nullable
                sendToName: body.sendToName, // Nullable
                promptId: body.promptId, // Nullable
                includeInAutoReport: body.includeInAutoReport
            }
        });

        return NextResponse.json(group);
    } catch (error) {
        const err = error as { message?: string };
        console.error("Group Update Error:", err);
        return NextResponse.json({ error: "Failed to update group", details: err.message }, { status: 500 });
    }
}
