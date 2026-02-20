# 📡 Documentação da API

Este documento fornece detalhes para os endpoints REST disponíveis no Trontec WhatsApp Orchestrator.

## 🔐 Autenticação

Todas as chamadas de API requerem um header `password` ou um cookie de sessão válido.

---

## 📑 Relatórios & Processamento

### Disparar Processamento Manual
Processa mensagens dos grupos configurados e gera um novo relatório.

- **Endpoint**: `/api/process`
- **Método**: `POST`
- **Headers**:
  - `password`: `APP_PASSWORD`
- **Resposta**:
  ```json
  {
    "success": true,
    "message": "Processamento concluído com sucesso",
    "reportId": "uuid"
  }
  ```

### Listar Todos os Relatórios
Retorna uma lista de todos os relatórios executivos gerados.

- **Endpoint**: `/api/reports`
- **Método**: `GET`

### Obter Detalhes do Relatório
Retorna o conteúdo completo de um relatório específico.

- **Endpoint**: `/api/reports/{id}`
- **Método**: `GET`

---

## 📣 Mensagens & Broadcast

### Enviar Mensagem de Broadcast
Envia uma mensagem para múltiplos grupos.

- **Endpoint**: `/api/messages/send`
- **Método**: `POST`
- **Corpo (Body)**:
  ```json
  {
    "groups": ["jid1", "jid2"],
    "message": "Texto da mensagem"
  }
  ```

### Reescrever com IA
Usa um prompt da biblioteca para reescrever uma mensagem.

- **Endpoint**: `/api/messages/rewrite`
- **Método**: `POST`
- **Corpo (Body)**:
  ```json
  {
    "text": "Mensagem original",
    "promptId": "uuid"
  }
  ```

---

## 👤 Contatos

### Sincronizar Contatos
Busca contatos da Evolution API e atualiza o banco de dados local.

- **Endpoint**: `/api/contacts/sync`
- **Método**: `POST`

### Enriquecer Contatos
Usa IA ou dados externos para enriquecer perfis de contatos (fotos, info de negócio).

- **Endpoint**: `/api/contacts/enrich`
- **Método**: `POST`
- **Parâmetros de Consulta (Query)**:
  - `limit`: Número de contatos para enriquecer (padrão: 5)

---

## 👥 Grupos

### Listar Grupos Locais
- **Endpoint**: `/api/groups`
- **Método**: `GET`

### Buscar Grupos Remotos
Busca grupos diretamente da Evolution API.

- **Endpoint**: `/api/groups/remote`
- **Método**: `GET`

---

## ⚙️ Sistema & Config

### Obter Estatísticas do Dashboard
- **Endpoint**: `/api/stats/dashboard`
- **Método**: `GET`

### Atualizar Configurações
- **Endpoint**: `/api/settings`
- **Método**: `POST`
- **Corpo (Body)**:
  ```json
  {
    "evolutionUrl": "...",
    "evolutionToken": "...",
    "openaiKey": "..."
  }
  ```

---

> Para qualquer problema ou solicitação de funcionalidade, entre em contato com a equipe de desenvolvimento.
