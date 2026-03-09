# Antigravity Tracker — Electron App

App desktop para rastrear e visualizar todos os ativos do ecossistema Antigravity: **skills**, **workflows**, **workspaces** e **MCPs**.

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Shell | **Electron** (latest) |
| UI | **React 19** + **Tailwind CSS 4** |
| State | **Zustand** |
| File watching | **chokidar** |
| Indexação | **better-sqlite3** |
| API local | **Express** (integração `/`) |
| Parsing | **gray-matter** + **yaml** |
| Build | **electron-builder** |
| Bundler | **Vite** (via electron-vite) |

## Proposed Changes

### Scaffold do Projeto

#### [NEW] [antigravity-tracker/](D:\Dev\Projects\Antigravity\antigravity-tracker)

Projeto Electron criado com `electron-vite` (Vite + Electron). Estrutura:

```
antigravity-tracker/
├── electron.vite.config.ts
├── package.json
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Entry point, janela, tray
│   │   ├── scanner.ts     # Escaneia diretórios (skills, workflows, MCPs)
│   │   ├── watcher.ts     # chokidar file watching
│   │   ├── database.ts    # better-sqlite3 indexação
│   │   ├── api-server.ts  # Express API (integração /)
│   │   └── ipc.ts         # IPC handlers main↔renderer
│   ├── preload/
│   │   └── index.ts       # contextBridge expondo APIs seguras
│   └── renderer/          # React app
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── stores/
│       │   └── useTrackerStore.ts   # Zustand global state
│       ├── components/
│       │   ├── Layout.tsx           # Shell: sidebar + header + content
│       │   ├── Sidebar.tsx          # Navegação entre abas + categorias
│       │   ├── SearchBar.tsx        # Busca full-text global
│       │   ├── ItemCard.tsx         # Card de skill/workflow/MCP
│       │   ├── CategoryFolder.tsx   # "Pasta" visual de categoria
│       │   └── StatusBadge.tsx      # Badge: tipo, origem, status
│       ├── pages/
│       │   ├── SkillsPage.tsx       # Aba Skills
│       │   ├── WorkflowsPage.tsx    # Aba Workflows
│       │   ├── WorkspacesPage.tsx   # Aba Workspaces
│       │   ├── McpsPage.tsx         # Aba MCPs
│       │   └── SettingsPage.tsx     # Diretórios custom + config
│       └── styles/
│           └── globals.css
```

---

### Main Process (Electron Backend)

#### [NEW] [scanner.ts](file:///c:/Users/ricar/antigravity-tracker/src/main/scanner.ts)

Motor de escaneamento que detecta ativos automaticamente:

- **Skills**: Lê `~/.gemini/antigravity/skills/*/SKILL.md`, parseia frontmatter (name, description, license)
- **Workflows globais**: Lê `~/.gemini/antigravity/global_workflows/*.md`, parseia frontmatter (description)
- **Workflows locais**: Detecta `.agents/workflows/` ou `_agents/workflows/` em workspaces
- **MCPs**: Lê `~/.gemini/antigravity/mcp_config.json`, extrai servers com command, args, env
- **Workspaces**: Lê `~/.gemini/projects.json` e detecta pastas com `.agents/` ou `AGENTS.md`
- **Diretórios custom**: Lê paths adicionados pelo usuário em `~/.antigravity-tracker/config.json`

#### [NEW] [watcher.ts](file:///c:/Users/ricar/antigravity-tracker/src/main/watcher.ts)

File watcher com chokidar monitorando todos os diretórios. Re-scaneia e atualiza o DB quando:
- Novos arquivos `.md` são criados
- `mcp_config.json` é modificado
- Skills/workflows são adicionados ou removidos

#### [NEW] [database.ts](file:///c:/Users/ricar/antigravity-tracker/src/main/database.ts)

SQLite local (`~/.antigravity-tracker/tracker.db`) com tabelas:

```sql
assets (id, type, name, description, path, category, origin, tags, updated_at)
virtual_folders (id, name, icon, parent_id, sort_order)
folder_assignments (folder_id, asset_id)
custom_directories (id, path, label, enabled)
```

#### [NEW] [api-server.ts](file:///c:/Users/ricar/antigravity-tracker/src/main/api-server.ts)

Express server em `localhost:19847` com endpoints:

| Endpoint | Descrição |
|---|---|
| `GET /api/skills` | Lista skills com filtros |
| `GET /api/workflows` | Lista workflows |
| `GET /api/mcps` | Lista MCPs + status |
| `GET /api/search?q=` | Busca full-text |
| `GET /api/autocomplete?prefix=` | Para integração `/` |

---

### Renderer (React UI)

#### [NEW] [SkillsPage.tsx](file:///c:/Users/ricar/antigravity-tracker/src/renderer/pages/SkillsPage.tsx)

- Grid de cards com: nome, descrição, path, triggers
- Filtro por categoria (pastas visuais): Design, Docs, Dev, AI, n8n, etc.
- Badge de origem: `global`, `user`, `custom`
- Busca full-text
- Toggle grid/lista

#### [NEW] [WorkflowsPage.tsx](file:///c:/Users/ricar/antigravity-tracker/src/renderer/pages/WorkflowsPage.tsx)

- Lista de workflows com `/slug` clicável
- Separação: **globais** vs **locais** (por workspace)
- Agrupamento por categoria
- Preview do conteúdo expandível

#### [NEW] [McpsPage.tsx](file:///c:/Users/ricar/antigravity-tracker/src/renderer/pages/McpsPage.tsx)

- Cards mostrando cada MCP: nome, tipo (Node/Python/Docker/URL), tools
- Status indicator: 🟢 running / 🔴 stopped / 🟡 unknown
- Botões start/stop (exec process via IPC)
- Lê de `mcp_config.json` atual: **7 MCPs** (github, stripe, n8n, firecrawl, obsidian, playwright, supabase, remotion)

#### [NEW] [WorkspacesPage.tsx](file:///c:/Users/ricar/antigravity-tracker/src/renderer/pages/WorkspacesPage.tsx)

- Lista workspaces detectados de `projects.json`
- Status ativo/inativo
- Workflows locais vinculados

#### [NEW] [SettingsPage.tsx](file:///c:/Users/ricar/antigravity-tracker/src/renderer/pages/SettingsPage.tsx)

- Adicionar/remover diretórios customizados
- Toggle watch mode por diretório
- Porta da API local
- Theme (dark/light)

---

### Pastas Virtuais

Organização lógica por drag-and-drop salva em `~/.antigravity-tracker/layout.json`:

```json
{
  "folders": [
    { "id": "design", "name": "🎨 Design & UI", "items": ["canvas-design", "frontend-design", "dashboard-ui"] },
    { "id": "docs", "name": "📄 Documents", "items": ["docx", "pdf", "pptx", "xlsx"] },
    { "id": "n8n", "name": "⚙️ n8n", "items": ["n8n-code-javascript", "n8n-workflow-patterns"] }
  ]
}
```

O autocomplete `/` do Claude veria:
```
/design/canvas-design
/design/frontend-design
/docs/docx
/n8n/n8n-code-javascript
```

---

## User Review Required

> [!IMPORTANT]
> **Escopo do MVP**: O conceito completo é grande. Proponho implementação em **fases**:
>
> **Fase 1 (MVP)** — o que construímos agora:
> - Scaffold Electron + React + Tailwind
> - Scanner de skills, workflows e MCPs
> - 4 abas funcionais (Skills, Workflows, MCPs, Workspaces)
> - Busca e filtros por categoria
> - UI dark mode com design premium
>
> **Fase 2** (depois):
> - File watcher com chokidar
> - SQLite para persistência  
> - Pastas virtuais com drag-and-drop
> - API Express para integração `/`
>
> **Fase 3** (futuro):
> - Health check MCPs
> - Start/stop MCPs da interface
> - Diretórios customizados
> - Exportação de skill packs

> [!WARNING]
> **Sobre a integração `/`**: Esse recurso depende de como o Claude Desktop/Gemini processa o autocomplete. A API local ficaria pronta, mas a integração real com o `/` pode exigir uma extensão ou configuração específica do editor. Na Fase 1, vamos focar na UI funcional.

## Verification Plan

### Automated Tests
- `npm run build` compila sem erros
- App abre e renderiza corretamente

### Manual Verification
- Abrir o app e verificar que detecta as 25 skills, 45 workflows, 7 MCPs
- Testar busca, filtros, e navegação entre abas
- Verificar responsividade e design
