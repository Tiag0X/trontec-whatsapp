
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for duplicates in Contact table...");

    const contacts = await prisma.contact.findMany();
    console.log(`Total Contacts: ${contacts.length}`);

    // Check for LID vs Phone
    const lids = contacts.filter(c => c.jid.includes('@lid'));
    const phones = contacts.filter(c => c.jid.includes('@s.whatsapp.net'));

    console.log(`Contacts with LID (@lid): ${lids.length}`);
    console.log(`Contacts with Phone (@s.whatsapp.net): ${phones.length}`);
    console.log(`Other: ${contacts.length - lids.length - phones.length}`);

    // Check for duplicates by Name (fuzzy)
    const nameMap = new Map<string, typeof contacts>();
    contacts.forEach(c => {
        const n = c.name || c.pushName;
        if (n) {
            const list = nameMap.get(n) || [];
            list.push(c);
            nameMap.set(n, list);
        }
    });

    console.log("\nPotential Duplicates by Name:");
    let duplicateCount = 0;
    for (const [name, list] of nameMap.entries()) {
        if (list.length > 1) {
            // Check if it's a mix of LID and Phone
            const hasLid = list.some(c => c.jid.includes('@lid'));
            const hasPhone = list.some(c => c.jid.includes('@s.whatsapp.net'));

            if (hasLid && hasPhone) {
                console.log(`- "${name}": Has both LID and Phone entries.`);
                duplicateCount++;
            } else if (list.length > 1) {
                // confusing, but maybe same name different people?
                // console.log(`- "${name}": ${list.length} entries (Same type).`);
            }
        }
    }

    if (duplicateCount === 0) {
        console.log("No obvious LID/Phone duplicates found by name.");
    } else {
        console.log(`\nFound ${duplicateCount} names with both LID and Phone entries.`);
    }

    if (lids.length > 0) {
        console.log("\nSuggestion: You might want to remove @lid contacts if you are now using @s.whatsapp.net.");
    }
}

main();
