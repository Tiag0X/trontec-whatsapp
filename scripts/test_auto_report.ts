import { ReportProcessor } from '../lib/services/processor.service';
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧪 Simulating Automatic Report Trigger...');

    const settings = await prisma.settings.findFirst();
    if (!settings?.isAutoReportEnabled) {
        console.warn('⚠️ Auto-Report is DISABLED in settings. Forcing enable for this test...');
    }

    // Force enable just for log output context (logic inside processor considers the flag? No, logic inside processor considers includeInAutoReport group flag, settings flag is checked by scheduler only)
    // The scheduler checks settings.isAutoReportEnabled BEFORE calling process.
    // So calling process() directly bypasses the "Is Enabled" check, which is fine for testing the GENERATION logic.

    console.log('🔄 Calling processor.process() as if triggered by Cron...');

    // Logic matches scheduler.ts line 38
    const processor = new ReportProcessor();

    // We pass empty object to trigger "Auto Mode" inside processor (it looks for groups with includeInAutoReport=true)
    const result = await processor.process({});

    console.log('✅ Result:', JSON.stringify(result, null, 2));

    if (result.status === 'COMPLETED') {
        console.log('🎉 Automation Logic Checked: Success.');
    } else {
        console.log('⚠️ Automation Logic Checked: Skipped or Failed.');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
