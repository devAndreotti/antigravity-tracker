# Antigravity Tracker — Resumo do Desenvolvimento (Fases 1 e 2)

Este documento resume o que foi implementado no projeto até o atual momento (Março de 2026). O aplicativo desktop Antigravity Tracker alcançou total funcionalidade de rastreamento local e interface Rica em Detalhes.

## 🚀 Fase 1 — Fundação e UI (Concluída)

A Fase 1 foi focada na base do aplicativo Electron e no "look and feel" premium da interface:

*   **Arquitetura Base:** Projeto Electron criado via `electron-vite` rodando React 19 + Tailwind CSS 4.
*   **Scanner Estático:** Motor de parsing (`gray-matter`) no backend do Electron (Processo Main) para ler e extrair propriedades (nome, descrição, origin, categoria, slug, port, tags) dos arquivos markdown locais.
*   **Abas Principais:**
    *   **Skills:** Grid de cards detalhados por categoria.
    *   **Workflows:** Lista limpa separando origin global vs local.
    *   **MCPs:** Status de MCPs extraídos do `mcp_config.json`.
    *   **Workspaces:** Monitoramento de diretórios que contém arquivos `.agents` ou `skills`.
*   **Busca Rápida:** Command Palette global acionada por `⌘K` / `Ctrl+K`.
*   **Painel de Detalhes:** Painel lateral dinâmico abrindo ao clicar nos cards, contendo badges customizadas (ex: `global`, `local`), botão "Copy path" e "Preview" detalhado.

## ⚙️ Fase 2 — File Watching e Configuração (Concluída)

A Fase 2 trouxe reatividade em tempo real e estabilidade (resolução de bugs e OS-awareness):

*   **Watch Mode (Chokidar):** Monitoramento assíncrono do file system enviando eventos IPC para a UI atualizar automaticamente instantaneamente quando o usuário cria/modifica/deleta skills e workflows (real-time toggle nas Settings).
*   **Configurações do Usuário:**
    *   Criação da página "Settings" para gerenciamento do app.
    *   Adicionar/Remover **Diretórios Customizados (Custom Watched Directories)**.
    *   Toggle para habilitar/desabilitar modo real-time watching.
*   **Recently Used:** Um histórico navegável persistido que acompanha a sessão ativa, mostrando as últimas visualizações do usuário como *pills* acima da UI principal.
*   **Theming (Light/Dark Mode):** Migração global da UI para Variáveis CSS (`--bg-root`, `--accent`, etc), com alternância em tempo real entre modos Claro e Escuro na tela de Settings.
*   **Sensibilidade Simétrica de OS (Mac/Windows):** Autodetect do SO que adapta todos os atalhos exibidos (ex: `⌘1` no Mac, `Ctrl+1` no Windows).
*   **Eliminação de "Ghost UI":** O modo Desktop usa sempre os dados reais extraídos (com loading states), removendo o uso indesejado de Mock Datas falsos durante a montagem do App.
*   **Testes Unitários:** Base robusta cobrindo formatação, fallback (Browser/Electron mode) e parsing com cerca de 70 testes automatizados (`Vitest`).

---

## 🛑 Estado Atual do Projeto

O app está estável, o front-end é super fluido, os temas estão integrados (e agradáveis) via Variáveis Nativas de CSS, e o scanner em background comunica as transformações nas pastas em tempo real pela ponte segura do IPC (preload).
