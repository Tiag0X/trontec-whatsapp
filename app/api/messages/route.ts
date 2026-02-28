import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET(req: Request) {
    try {
        const history = await prisma.broadcast.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20 // Limit to last 20
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("Failed to fetch broadcast history:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
