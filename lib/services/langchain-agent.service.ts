
import { ChatOpenAI } from "@langchain/openai";

export class LangChainService {
    private model: ChatOpenAI;

    constructor(apiKey: string, modelName: string = "gpt-4o-mini", temperature: number = 0.7) {
        this.model = new ChatOpenAI({
            apiKey: apiKey,
            modelName: modelName,
            temperature: temperature
        });
    }

    async generateReport(
        messagesJson: string,
        date: string,
        systemPrompt?: string,
        groupName: string = "GRUPO"
    ): Promise<string> {
        const isRange = date.includes(' a ');
        const dateDesc = isRange ? `período ${date}` : `dia ${date}`;
        const timeDesc = isRange ? `nesse período` : `naquele dia`;

        const finalPrompt = `
Você é um Especialista Sênior em Análise de Grupos de WhatsApp (OSINT leve + análise comportamental + resumo executivo).
Seu trabalho é analisar um conjunto de mensagens do grupo "${groupName}" (referentes ao ${dateDesc}) e explicar, com clareza, o que ocorreu ${timeDesc}.

OBJETIVO
- Transformar mensagens caóticas em um retrato fiel do ${isRange ? 'período' : 'dia'}: acontecimentos, decisões, problemas, pedidos, ações e próximos passos.
- Diferenciar fatos vs. suposições/boatos.
- Identificar mudanças de humor/engajamento e possíveis conflitos.
- Preservar contexto sem expor dados sensíveis desnecessários.

REGRAS CRÍTICAS
1) NÃO invente nada. Se algo não estiver explícito, marque como “não confirmado”.
2) NÃO vaze dados sensíveis. Mascarar: telefones, e-mails, CPF, placas, endereços completos. Ex.: “(tel. final 1234)”.
3) Separar “O que aconteceu” de “Interpretação/Leituras”.
4) Resumir com fidelidade: manter intenções, decisões e problemas, sem distorcer.
5) Quando houver conflito, registrar: quem discordou (se relevante), motivo e se houve resolução.
6) Mensagens repetidas/ruído: agrupar e reduzir.

TAREFAS DE ANÁLISE (checklist mental)
- Linha do tempo do dia (manhã/tarde/noite). Use as horas das mensagens (Fuso Horário de Brasília) para classificar.
- Eventos/ocorrências principais
- Problemas relatados e impacto
- Pedidos/solicitações e responsáveis
- Ações executadas e status (feito / em andamento / pendente)
- Decisões tomadas e justificativas (se houver)
- Pendências e próximos passos
- Engajamento e humor (calmo, tenso, brincalhão, crítico, apático etc.)
- Riscos (ex.: escalada de conflito, falha operacional, desinformação, vazamento)

FORMATO DE SAÍDA (MARKDOWN OBRIGATÓRIO)
Você deve retornar APENAS o documento em Markdown (MD), seguindo EXATAMENTE esta estrutura e títulos:

# 📌 Grupo: ${groupName}
**Data:** ${date}

---

## ✅ Resumo executivo
{Resumo curto e direto do dia (3-6 linhas)}

---

## 🧭 O que aconteceu (linha do tempo)
{Liste os acontecimentos em ordem cronológica}

---

## 🧾 Decisões
{Liste as decisões tomadas}

---

## 📥 Pedidos e solicitações
{Liste solicitações e responsáveis}

---

## 🚨 Problemas e ocorrências
{Liste falhas técnicas e incidentes}

---

## 🛠️ Ações tomadas
{O que foi resolvido}

---

## 🔁 Pendências (open loops)
{Próximos passos e prioridades}

---

## 😊 Engajamento e humor do grupo
{Análise de clima e engajamento}

---

## ⚠️ Riscos e pontos de atenção
{Riscos operacionais ou de conflito}

---

## 📲 Texto pronto para WhatsApp
{Texto final resumido, respeitando a linha do tempo e os acontecimentos relatados, com emojis para enviar ao grupo}

${systemPrompt || ""}
`;

        try {
            console.log(`[LangChain] Generating Comprehensive OSINT Report for ${groupName}...`);
            const response = await this.model.invoke([
                { role: "system", content: finalPrompt },
                { role: "user", content: `Analise as mensagens do dia ${date} for generic group ${groupName}:\n${messagesJson}` }
            ]);

            return response.content as string;
        } catch (error) {
            const err = error as { message?: string };
            console.error("LangChain Generation Error:", err);
            throw new Error(`Falha na geração do relatório via LangChain: ${err.message}`);
        }
    }

    async rewriteMessage(text: string, instruction: string): Promise<string> {
        try {
            const response = await this.model.invoke([
                { role: "system", content: "Você é um assistente de redação experiente. Sua tarefa é reescrever o texto fornecido seguindo as instruções. Retorne APENAS o texto reescrito." },
                { role: "user", content: `Instrução: ${instruction}\n\nTexto Original:\n${text}` }
            ]);

            return response.content as string || text;
        } catch (error) {
            console.error("Error rewriting message with LangChain:", error);
            throw new Error("Failed to rewrite message");
        }
    }
}
