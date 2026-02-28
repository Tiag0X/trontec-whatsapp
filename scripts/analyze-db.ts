import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('📊 Analisando banco de dados local...')

    try {
        const settingsCount = await prisma.settings.count()
        const groupsCount = await prisma.group.count()
        const contactsCount = await prisma.contact.count()
        const reportsCount = await prisma.report.count()
        const templatesCount = await prisma.messageTemplate.count()

        console.log('\n--- Resumo dos Dados ---')
        console.log(`⚙️  Configurações: ${settingsCount} registro(s)`)
        console.log(`👥  Grupos: ${groupsCount}`)
        console.log(`👤  Contatos: ${contactsCount}`)
        console.log(`📄  Relatórios: ${reportsCount}`)
        console.log(`📝  Modelos: ${templatesCount}`)

        if (settingsCount > 0) {
            const settings = await prisma.settings.findFirst()
            console.log('\n--- Configuração Atual ---')
            console.log(`Auto Report: ${settings?.isAutoReportEnabled ? 'Ativo' : 'Inativo'}`)
            console.log(`Horário: ${settings?.autoReportTime}`)
        }
    } catch (error) {
        console.error('❌ Erro ao ler banco:', error)
    }
}

main()
    .finally(() => prisma.$disconnect())
