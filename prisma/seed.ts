import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create default Settings record if it doesn't exist
    const settings = await prisma.settings.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            evolutionApiUrl: 'https://api.autonexus.app',
            evolutionInstanceName: 'Informação - Clientes',
            evolutionToken: '',
            whatsappGroupId: '',
            openaiApiKey: '',
            autoReportTime: '08:00',
            isAutoReportEnabled: false,
            autoReportPeriod: 'YESTERDAY'
        }
    })

    console.log('✅ Settings record created/updated:', settings.id)
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
