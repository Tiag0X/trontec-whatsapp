
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { name, content } = await req.json();
        const template = await prisma.messageTemplate.update({
            where: { id },
            data: { name, content }
        });
        return NextResponse.json(template);
    } catch (error) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prisma.messageTemplate.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
