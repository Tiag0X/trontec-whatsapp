import { NextResponse } from 'next/server';
import { ContactsService } from '@/lib/services/contacts.service';

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get('limit')) || 10;

        const service = new ContactsService();
        const stats = await service.enrichContacts(limit);
        return NextResponse.json({ status: 'SUCCESS', stats });
    } catch (error) {
        const err = error as { message?: string };
        console.error("Enrich failed:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
