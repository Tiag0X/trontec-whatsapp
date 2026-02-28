
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Validate allowed fields to update
        const { name, email, description, isBusiness, website } = body;

        const contact = await prisma.contact.update({
            where: { id },
            data: {
                name,
                email,
                description,
                isBusiness,
                website
            }
        });

        return NextResponse.json({ status: 'SUCCESS', data: contact });
    } catch (error) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
