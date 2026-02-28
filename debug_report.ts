import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const REPORT_ID = 'a0e98c92-57f8-4788-bf51-6a1104159d43';

async function main() {
    console.log(`Checking Report ID: ${REPORT_ID}`);

    const report = await prisma.report.findUnique({
        where: { id: REPORT_ID },
        include: { group: true }
    });

    if (!report) {
        console.log("❌ Report NOT FOUND in database.");
        return;
    }

    console.log("=== REPORT DETAILS ===");
    console.log(`Status: ${report.status}`);
    console.log(`Date Ref: ${report.dateRef}`);
    console.log(`Created At: ${report.createdAt}`);
    console.log(`Full Text Length: ${report.fullText ? report.fullText.length : 0}`);

    if (report.group) {
        console.log("\n=== GROUP DETAILS ===");
        console.log(`Name: ${report.group.name}`);
        console.log(`JID (Origin): ${report.group.jid}`);
        console.log(`SendToJid (Destination): ${report.group.sendToJid || "Not Set (Default to Origin)"}`);
        console.log(`Is Active: ${report.group.isActive}`);
    } else {
        console.log("❌ Report has NO group associated.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
