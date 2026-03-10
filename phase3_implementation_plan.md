# Antigravity Tracker — Phase 3 Implementation Plan

Este documento detalha o planejamento para a **Fase 3**, focando na indexação avançada, API para consumo externo, organização flexível e ferramentas interativas.

## 📈 Objetivos da Fase 3

### 1. Indexação Robusta (SQLite)
*   Atualmente, os dados vivem no estado *in-memory* do app (`TrackerStore`) através dos watchers ativos usando o evento do preload.
*   **O que será feito:** Implementar o banco de dados `better-sqlite3` no processo Main do Electron (`tracker.db`). O Chokidar não só atualizará a UI ativa, mas manterá todos os metadados ricos em cache no SQL, o que criará extrema performance para busca global.
*   **Vantagem:** O app iniciará no "piscar de olhos" independente da quantidade de dezenas de pastas com scripts pesados locais e globais monitorados.

### 2. The Local API Server (Integração `/`)
*   **O que será feito:** Ligar definitivamente a *Local API Port* (Configurável na aba Settings, default `19847`).
*   **Serviço:** Será um microservidor Express HTTP rodando no background.
*   **Endpoints Básicos:**
    *   `GET /api/skills` → Retorna JSON da árvore
    *   `GET /api/workflows`
    *   `GET /api/search?q={query}`
    *   `GET /api/autocomplete` → Projetado para integrações futuras com extensões VSCode, Scripts externos n8n ou o próprio Claude App em chamadas locais.

### 3. Gerenciamento Avançado de MCPs (Interactive Tools)
*   **Health Checkers:** O Tracker passará a instanciar temporariamente conexões para checar se o link/processo do MCP realmente bate (ex: ping num script stdio) retornando um status "Em tempo" em vez de apenas ler o arquivo *mcp_config.json*.
*   **Controles On-Board:** Funcionalidade visual 100% pronta: Toggle de habilitar ou desabilitar instâncias na UI vão de fato, internamente pelo Electron, gerenciar o JSON original local, injetando ou removendo os servidores para que a modificação faça loopback rápido na AI do usuário.

### 4. Categorias Dinâmicas (Pastas Virtuais)
*   O Sidebar esquerdo passará de *Categorias Hardcoded* para um sistema Drag-and-Drop construído em Json local.
*   A página Sidebar agrupará a flexibilidade completa para o usuário criar novas pastas/divisões e agrupar skills lá dentro sem modificar os paths delas originais.

---

## 📅 Passo a Passo Previsto (Workflow)

1.  **[Backend/Main] `database.ts`**: Criação da Schema SQLite em `appData` do SO do usuário.
2.  **[Backend/Main] `watcher.ts`**: Hook the scanner para fazer `INSERT/UPDATE` no SQlite ao recarregar arquivos.
3.  **[Backend/Main] `api-server.ts`**: Express Boilerplate rodando em Thread assíncrono.
4.  **[Frontend/UI]** Pastas Virtuais na UI + Handlers no IPC + Zustand.
5.  **[Integration]**: Escrever / Editar `mcp_config.json` real com os Toggles.
