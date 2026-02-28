import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        await prisma.prompt.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
    }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const { id } = params;
        const body = await req.json();

        const prompt = await prisma.prompt.update({
            where: { id },
            data: {
                name: body.name,
                content: body.content
            }
        });

        return NextResponse.json(prompt);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
    }
}
