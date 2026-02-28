import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const scheduledMessages = await prisma.scheduledMessage.findMany({
            where: {
                status: {
                    in: ['PENDING', 'FAILED', 'PARTIAL']
                }
            },
            orderBy: { scheduledAt: 'asc' },
        });
        return NextResponse.json(scheduledMessages);
    } catch (error) {
        console.error("Error fetching scheduled messages:", error);
        return NextResponse.json({ error: "Failed to fetch scheduled messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as { message: string, recipients: string[], scheduledAt: string };
        const { message, recipients, scheduledAt } = body;

        if (!message || !recipients || recipients.length === 0 || !scheduledAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const scheduledDate = new Date(scheduledAt);
        if (isNaN(scheduledDate.getTime())) {
            return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
        }

        const scheduledMessage = await prisma.scheduledMessage.create({
            data: {
                message,
                recipients: JSON.stringify(recipients),
                scheduledAt: scheduledDate,
                status: 'PENDING',
            }
        });

        return NextResponse.json(scheduledMessage);
    } catch (error) {
        console.error("Error scheduling message:", error);
        return NextResponse.json({ error: "Failed to schedule message" }, { status: 500 });
    }
}
