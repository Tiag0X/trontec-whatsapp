import { NextResponse } from 'next/server';
import { ContactsService } from '@/lib/services/contacts.service';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || undefined;
        const groupId = searchParams.get('groupId') || undefined;
        const businessOnly = searchParams.get('business') === 'true';

        const service = new ContactsService();
        const result = await service.listContacts(page, limit, search, groupId, businessOnly);
        return NextResponse.json(result);
    } catch (error) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

