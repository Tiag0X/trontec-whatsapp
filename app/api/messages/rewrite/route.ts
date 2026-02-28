
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { LangChainService } from "@/lib/services/langchain-agent.service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, promptId } = body;

        if (!text || !promptId) {
            return NextResponse.json({ error: "Texto e Prompt são obrigatórios" }, { status: 400 });
        }

        // 1. Fetch Settings for API Key
        const settings = await prisma.settings.findFirst();
        if (!settings?.openaiApiKey) {
            return NextResponse.json({ error: "OpenAI API Key não configurada" }, { status: 500 });
        }

        // 2. Fetch Prompt Content
        const prompt = await prisma.prompt.findUnique({
            where: { id: promptId }
        });

        if (!prompt) {
            return NextResponse.json({ error: "Prompt não encontrado" }, { status: 404 });
        }

        // 3. Process Rewrite using LangChain
        const aiService = new LangChainService(settings.openaiApiKey);
        const rewrittenText = await aiService.rewriteMessage(text, prompt.content);

        return NextResponse.json({ rewritten: rewrittenText });

    } catch (error) {
        console.error("Rewrite error:", error);
        return NextResponse.json({ error: "Falha ao processar solicitação" }, { status: 500 });
    }
}
