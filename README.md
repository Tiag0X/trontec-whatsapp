# Trontec WhatsApp — Relatórios e Broadcast

Aplicação administrativa que integra WhatsApp (Evolution API) e OpenAI para:

- Gerar relatórios executivos diários a partir de mensagens de grupos
- Enviar mensagens em broadcast para múltiplos grupos
- Sincronizar e enriquecer contatos (foto, perfil de negócio)
- Gerenciar biblioteca de prompts e configurações do sistema

## Requisitos

- Node.js 18.18+ (recomendado 20 LTS)
- NPM (ou Yarn/PNPM)
- SQLite (embarcado; usa `DATABASE_URL` do Prisma)
- Credenciais válidas da Evolution API (URL, nome da instância, token)
- OpenAI API Key

## Configuração

1. Instale dependências:

```bash
npm install
```

2. Configure variáveis de ambiente (arquivo `.env` na raiz):

```bash
APP_PASSWORD=admin               # defina sua senha administrativa
DATABASE_URL="file:./prisma/dev.db"  # SQLite local
```

3. (Opcional) Sincronize o schema Prisma com o banco:

```bash
npx prisma db push
```

4. Inicie em desenvolvimento:

```bash
npm run dev:all
# Executa UI (Next.js) em http://localhost:3000 e o worker de agendamento
```

- Apenas UI:

```bash
npm run dev
```

- Apenas worker (agendador de relatórios):

```bash
npm run worker
```

## Primeiros Passos (UI)

1. Acesse `http://localhost:3000` e faça login com `APP_PASSWORD`.
2. Abra `Configurações` e informe:
   - `Evolution API URL`, `Nome da Instância`, `Token`
   - `OpenAI API Key`
   - Opcional: `Prompt Padrão`, `Horário` e `Período` da automação
3. Cadastre seus grupos (nome + `jid`).
4. Marque os grupos que participarão da automação diária.
5. Sincronize contatos: `POST /api/contacts/sync` (há botões na UI).

## Funcionalidades Principais

- Relatórios: geração manual via `POST /api/process` ou automática pelo worker (cron a cada minuto, dispara no horário configurado).
- Broadcast: `POST /api/messages/send` para enviar texto a múltiplos grupos.
- Reescrita com IA: `POST /api/messages/rewrite` usando um `Prompt` da biblioteca.
- Contatos: `GET /api/contacts`, `POST /api/contacts/sync`, `POST /api/contacts/enrich?limit=N`.
- Prompts: `GET/POST /api/prompts`, `PUT/DELETE /api/prompts/[id]`.
- Grupos: `GET/POST /api/groups`, `PUT/DELETE /api/groups/[id]`, `GET /api/groups/remote`.
- Relatórios: `GET /api/reports`, `GET /api/reports/[id]`.
- Dashboard/Status: `GET /api/stats/dashboard` (inclui heartbeat do agendador).

## Produção

1. Build da UI:

```bash
npm run build
npm start
```

2. Execute o worker em processo separado:

```bash
npm run worker
```

Garanta `APP_PASSWORD` e credenciais de Evolution/OpenAI configuradas via UI ou migração.

## Testes e Qualidade

- Lint:

```bash
npm run lint
```

- Testes: não há suíte de testes integrada no momento. Recomenda-se adicionar Jest/Vitest e cobrir serviços públicos (Evolution, OpenAI, Processor) com ≥80% de cobertura.

## Notas de Segurança

- Nunca exponha tokens da Evolution ou a `OpenAI API Key` no cliente.
- Defina `APP_PASSWORD` por variável de ambiente e use HTTPS em produção.
