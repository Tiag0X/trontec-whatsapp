import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all prompts + Auto-seed System Default
export async function GET() {
    try {
        // Auto-Seed: Ensure "System Default" prompt exists
        const SYSTEM_PROMPT_NAME = "Sistema - Business Analyst (Padrão)";
        let defaultPrompt = await prisma.prompt.findFirst({ where: { name: SYSTEM_PROMPT_NAME } });

        if (!defaultPrompt) {
            const SYSTEM_PROMPT_CONTENT = `Agente de Resumos: Senior Business Analyst.
            
CRITÉRIOS DE ANÁLISE:
1. FILTRAGEM: Ignore saudações simples ("Bom dia", "Boa tarde", "Ok", "👍"), figurinhas e mensagens irrelevantes.
2. CATEGORIZAÇÃO: Separe claramente Problemas (FALHAS) de Solicitações (PEDIDOS) e Ações (RESOLUÇÕES).
3. TOM: Profissional, direto e focado em resultados.
            
CRITÉRIOS DE SAÍDA (FORMATO JSON OBRIGATÓRIO):
Você deve retornar um objeto JSON válido com a seguinte estrutura:
{
  "summary": "Resumo executivo de alto nível (2-3 frases).",
  "occurrences": ["Fato 1", "Fato 2..."],
  "problems": ["Problema 1", "Problema 2..."],
  "orders": ["Pedido 1", "Pedido 2..."],
  "actions": ["Ação 1", "Ação 2..."],
  "engagement": "Clima: Positivo/Neutro/Tenso + Justificativa.",
  "fullText": "Texto formatado com emojis para envio no WhatsApp (Ex: 📊 *Resumo*, ⚠️ *Problemas*)."
}`;
            defaultPrompt = await prisma.prompt.create({
                data: { name: SYSTEM_PROMPT_NAME, content: SYSTEM_PROMPT_CONTENT }
            });

            // Try link to settings if default is unset
            const settings = await prisma.settings.findFirst();
            if (settings && !settings.defaultPromptId) {
                await prisma.settings.update({ where: { id: settings.id }, data: { defaultPromptId: defaultPrompt.id } });
            }
        }

        const prompts = await prisma.prompt.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(prompts);
    } catch (error) {
        console.error("Failed to fetch prompts:", error);
        return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as { name?: string, content?: string };

        if (!body.name || !body.content) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const prompt = await prisma.prompt.create({
            data: {
                name: body.name,
                content: body.content
            }
        });

        return NextResponse.json(prompt);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
    }
}
