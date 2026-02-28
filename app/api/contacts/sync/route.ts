import { NextResponse } from 'next/server';
import { ContactsService } from '@/lib/services/contacts.service';

export async function POST() {
    try {
        const service = new ContactsService();
        const stats = await service.syncContacts();
        return NextResponse.json({ status: 'SUCCESS', stats });
    } catch (error) {
        const err = error as { message?: string };
        console.error("Sync failed:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
