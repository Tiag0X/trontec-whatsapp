# 📡 Documentação de Integração da API

Este documento técnico de referência detalha os endpoints REST disponíveis publicamente e internamente pelo **Trontec WhatsApp Orchestrator**. As descrições seguem padrões orientados a dados (Data-Driven) para facilitar o consumo por aplicações clientes, painéis web (ex: Next.js) e integrações externas (N8N, Zapier, etc).

---

## 🔐 Autenticação

Todas as requisições API exigem que você forneça credenciais de segurança. Você pode autenticar através de duas formas:
1. **Header `password`** (Recomendado para S2S - Server to Server)
2. **Cookie de Sessão** (Recomendado para Integração Front-end local)

| Parâmetro | Tipo | Local | Obrigatório | Descrição |
|-----------|------|-------|-------------|-------------|
| `password`| string | Header | Sim | Senha mestra configurada na variável `APP_PASSWORD`. |

---

## 📊 Relatórios & Processamentos

Rotas responsáveis por iniciar as cadeias de requisições analíticas massivas ou lidar com o histórico destes procedimentos.

### `POST /api/process`
Dispara manualmente o motor assíncrono para colher dados de mensagens dos grupos e gerar um novo relatório executivo.

**Parâmetros:**
*Nenhum Body é necessário. A configuração global determina os parâmetros operacionais.*

**Responses:**
- `200 OK`: O processamento em background foi iniciado de forma satisfatória.
- `401 Unauthorized`: Header `password` inválido.
- `500 Server Error`: Erro interno ao iniciar o Job do orquestrador.

**Exemplo de Resposta (200):**
```json
{
  "success": true,
  "message": "Processamento concluído com sucesso",
  "reportId": "d7a46c2b-ab...-84f9"
}
```

### `GET /api/reports`
Recupera a lista resumida (metadados) de todos os relatórios disponíveis no sistema.

**Parâmetros de Consulta (Query):**
| Nome | Tipo | Opcional | Descrição |
|------|------|----------|-------------|
| `limit` | number | Sim | Limita a quantidade de registros retornados (default: 50). |

**Responses:**
- `200 OK`: Retorna o Array JSON com a meta-estrutura dos relatórios concluídos.

### `GET /api/reports/{id}`
Busca os dados colossais e detalhados de um relatório concluído.

**Parâmetros (Path):**
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-------------|
| `id` | string | Sim | UUID gerado pelo Processamento (reportId). |

**Responses:**
- `200 OK`: JSON contendo a análise da IA e detalhes do parse de grupos.
- `404 Not Found`: Relatório ou UUID não localizados no banco.

---

## 📣 Mensagens & Disparos (Broadcast)

Rotas fundamentais de Interação Ativa (Disparo de textos da plataforma para grupos do WhatsApp).

### `POST /api/messages/send`
Dispara uma mesma mensagem textual instantaneamente para arrays de múltiplos IDs de Grupos do WhatsApp via Evolution API.

**Corpo (Request Body):**
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-------------|
| `groupIds` | array[string] | Sim | IDs internos (UUIDs do banco local) dos grupos selecionados. |
| `message` | string | Sim | Texto livre final a ser entregue. |

**Responses:**
- `200 OK`: Entrega das tarefas concluída. Retorna métricas.
- `400 Bad Request`: Parâmetros ausentes (texto vazio ou grupos sem seleção).
- `404 Not Found`: Nenhum grupo válido/ativo encontrado com os IDs informados.

**Exemplo de Request:**
```json
{
  "groupIds": ["clxyz123-abc...", "clxyz456-def..."],
  "message": "Aviso de manutenção agendado para o próximo final de semana."
}
```
**Exemplo de Resposta (200):**
```json
{
  "success": true,
  "successCount": 2,
  "failCount": 0
}
```

### `POST /api/messages/schedule`
Cria um agendamento assíncrono para disparo futuro. Motor de rotina local avalia e engatilha o `EvolutionService`.

**Corpo (Request Body):**
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-------------|
| `recipients` | array[string] | Sim | JIDs dos destinatários/grupos. |
| `message` | string | Sim | Texto do agendamento a ser salvo. |
| `scheduledAt` | string | Sim | Timestamp no padrão ISO 8601 (futuro). |

**Responses:**
- `200 OK`: Agendamento persistido na base de escalonamento.
- `400 Bad Request`: Horário configurado no passado.

### `GET /api/messages/schedule`
Busca a fila contendo todo o histórico de agendamentos solicitados.

**Responses:**
- `200 OK`: Array JSON exibindo entidades PENDING, SENT, FAILED, PARTIAL.

### `DELETE /api/messages/schedule/{id}`
Aborta e deleta preventivamente um agendamento salvo pelo UUID. Só pode cancelar caso o status ainda seja `PENDING`.

**Responses:**
- `200 OK`: Excluído do banco.
- `400 Bad Request`: A mensagem já foi processada pela roleta do Orquestrador.

### `POST /api/messages/rewrite`
Utilitário de IA. Aciona o LLM e reescreve textos livres baseado na "Persona" e "Regras" de um Prompt específico da galeria.

**Corpo (Request Body):**
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-------------|
| `text` | string | Sim | Mensagem de entrada (Draft/Rascunho). |
| `promptId` | string | Não | UUID que aponta para um Prompt Base de Comportamento. Se nulo, usará regra padrão de formatação limpa. |

**Responses:**
- `200 OK`: Texto filtrado retornado pela OpenAI.
- `500 Server Error`: Key da API inválida ou limites do ChatGPT ultrapassados.

---

## 👥 Contatos e Grupos

Rotas passivas/Datalake usadas para preencher as listagens, checkboxes e telas primárias do sistema.

### `POST /api/contacts/sync`
Comunica-se proativamente com a API da Evolution puxando o catálogo integral de contatos da instância do WhatsApp logada. Atualiza o cache SQL local.

**Responses:**
- `200 OK`: Sincronização espelhada efetuada.

### `POST /api/contacts/enrich` (Opcional/Experimental)
Pesquisa em rede neural, dados de redes sociais e inteligência open source dados anexos para contatos específicos visando CRM.

**Parâmetros de Consulta (Query):**
| Nome | Tipo | Opcional | Descrição |
|------|------|----------|-------------|
| `limit` | number | Sim | Limita a banda máxima gerada no prompt (default: 5). |

### `GET /api/groups`
Recupera do Banco de Dados local rápido a lista dos últimos grupos sincronizados conhecidos. (Ideal para selects UI).

### `GET /api/groups/remote`
Ignora o cache interno e perfura a comunicação primária direto na API Evolution verificando quais os grupos logados neste exato milissegundo. Mais demorado.

---

## ⚙️ Core & Settings

### `GET /api/stats/dashboard`
Obtém totalizadores cardeais.

**Exemplo de Resposta (200):**
```json
{
  "totalContacts": 450,
  "totalGroups": 12,
  "totalReports": 38,
  "lastSync": "2025-10-18T12:00:00.000Z"
}
```

### `POST /api/settings`
Altera chaves mestras globais. CUIDADO: Essas mudanças refletem em todo o runtime imediatamente.

**Corpo (Request Body):**
| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-------------|
| `evolutionUrl` | string | Sim | URL endpoint Host da plataforma Evolution. |
| `evolutionToken` | string | Sim | Chave API Key para consumo Global do Evolution. |
| `openaiKey` | string | Sim | Chave Secreta OpenAI (Sk-...) de LLM Analytics. |

**Responses:**
- `200 OK`: Prisma DB Configuração Atualizada com as novas conexões.
- `403 Forbidden`: Usuário não privilegiado efetuando requisição.
