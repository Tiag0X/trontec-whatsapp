
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EvolutionService } from '@/lib/services/evolution.service';

export async function GET() {
    try {
        const settings = await prisma.settings.findFirst();
        if (!settings) return NextResponse.json({ error: "No settings" }, { status: 400 });

        const service = new EvolutionService(
            settings.evolutionApiUrl,
            settings.evolutionInstanceName,
            settings.evolutionToken
        );

        const groups = await service.fetchAllGroups();
        return NextResponse.json(groups);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch remote groups" }, { status: 500 });
    }
}
