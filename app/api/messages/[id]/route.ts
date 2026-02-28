import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const broadcast = await prisma.broadcast.findUnique({
            where: { id }
        });

        if (!broadcast) {
            return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 });
        }

        return NextResponse.json(broadcast);
    } catch (error) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
