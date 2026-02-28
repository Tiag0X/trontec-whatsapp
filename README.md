# 🤖 Trontec WhatsApp Orchestrator

> **Relatórios Executivos Inteligentes & Sistema de Broadcast para Grupos**
>
> Uma plataforma de gestão avançada que integra a **Evolution API** com a **OpenAI** para automatizar o monitoramento de grupos, gerar resumos executivos e orquestrar envios em massa com mensagens aprimoradas por IA.

---

## ✨ Funcionalidades Principais

- 📑 **Resumos Executivos com IA**: Processa automaticamente as mensagens diárias dos grupos em relatórios executivos concisos e acionáveis.
- 📣 **Broadcast Inteligente**: Envia mensagens para múltiplos grupos simultaneamente com refinamento de conteúdo via IA.
- 👤 **Enriquecimento de Contatos**: Sincroniza e enriquece perfis de contatos automaticamente com dados de negócios e fotos de perfil.
- 🧠 **Biblioteca de Prompts**: Gerenciamento centralizado de personas de IA e modelos de mensagens.
- ⚙️ **Agendador Automático**: Worker integrado para geração recorrente de relatórios e tarefas de sincronização.
- 📊 **Dashboard de Monitoramento**: Status em tempo real das APIs, workers e saúde do sistema.

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js**: 20.x (LTS) ou superior
- **Banco de Dados**: SQLite (embutido)
- **Evolution API**: Acesso a uma instância ativa (URL + Token)
- **OpenAI**: Chave de API para GTP-4o/GTP-4o-mini

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/Tiag0X/trontec-whatsapp.git
cd trontec-whatsapp

# Instale as dependências
npm install

# OU use o script de instalação automatizada (Linux)
chmod +x install.sh
./install.sh
```

### 2. Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Segurança da Aplicação
APP_PASSWORD=sua_senha_segura

# Configuração do Banco de Dados
DATABASE_URL="file:./prisma/dev.db"

# Opcional: APIs Externas (Também podem ser configuradas via Interface Web)
# OPENAI_API_KEY=sk-...
# EVOLUTION_API_URL=https://...
# EVOLUTION_API_TOKEN=...
```

### 3. Inicializar Banco de Dados

```bash
npx prisma db push
```

### 4. Iniciar Ambiente de Desenvolvimento

```bash
# Inicia tanto a Interface Web quanto o Worker de Background
npm run dev:all
```

- **Interface Web**: [http://localhost:3000](http://localhost:3000)
- **Worker de Background**: Rodando via `tsx`

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|----------|------------|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Estilização** | [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) |
| **Backend** | [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) |
| **Banco de Dados** | [Prisma ORM](https://www.prisma.io/), [SQLite](https://sqlite.org/) |
| **Integrações** | [Evolution API](https://evolution-api.com/), [OpenAI SDK](https://github.com/openai/openai-node), [LangChain](https://www.langchain.com/) |
| **Automação** | [Node-Cron](https://github.com/node-cron/node-cron) |

---

## 📡 Visão Geral da API

O sistema expõe diversos endpoints REST para automação externa:

| Endpoint | Método | Descrição |
|----------|--------|-------------|
| `/api/process` | `POST` | Dispara a geração manual de relatórios |
| `/api/messages/send` | `POST` | Envia mensagens de broadcast |
| `/api/contacts/sync` | `POST` | Força a sincronização de contatos |
| `/api/groups/remote` | `GET` | Busca grupos diretamente da Evolution API |

*Para documentação detalhada da API, veja [API.md](./API.md).*

---

## 🔒 Segurança & Boas Práticas

- **Autenticação**: Todas as rotas sensíveis da UI e API são protegidas por `APP_PASSWORD`.
- **Variáveis de Ambiente**: Chaves sensíveis (OpenAI/Evolution) podem ser armazenadas no banco de dados (criptografadas) ou via `.env`.
- **Isolamento do Worker**: O agendador roda em um processo separado para garantir a responsividade da interface.

---

## 📄 Licença & Créditos

Distribuído sob a Licença MIT. Desenvolvido por **Trontec**.

---

> Construído com ❤️ e IA para a próxima geração de gestão de WhatsApp.
