
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Verifying Contact model fields...");

        // precise validation
        const contact = await prisma.contact.upsert({
            where: { jid: 'test-verify@s.whatsapp.net' },
            create: {
                jid: 'test-verify@s.whatsapp.net',
                name: 'Test Contact',
                email: 'test@example.com',
                description: 'Test Description',
                isBusiness: true
            },
            update: {
                email: 'test@example.com',
                description: 'Updated Description'
            }
        });

        console.log("SUCCESS: Contact created/updated with new fields:", contact);
    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("FAILURE: Could not write to new fields.");
        console.error(err.message);
    }
}

main();
