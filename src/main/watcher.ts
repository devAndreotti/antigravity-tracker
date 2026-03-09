// ─── WATCHER ────────────────────────────────────────────────────────────────
// Monitora o filesystem para detectar mudanças em assets Antigravity.

import chokidar, { type FSWatcher } from 'chokidar'

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface WatchEvent {
  type: 'skill' | 'workflow' | 'mcp' | 'unknown'
  event: 'add' | 'change' | 'unlink'
  path: string
}

// ─── CREATE WATCHER ─────────────────────────────────────────────────────────

export function createWatcher(
  paths: string[],
  onChange: (event: WatchEvent) => void,
  options = { debounce: 300 }
): FSWatcher {
  // Filtra paths vazios
  const validPaths = paths.filter(Boolean)

  const watcher = chokidar.watch(validPaths, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: options.debounce,
      pollInterval: 100,
    },
    ignored: /(^|[/\\])\..(?!agents|agent)/, // ignora dotfiles mas permite .agents
  })

  // Classifica o tipo de asset pela path
  const classify = (filePath: string): WatchEvent['type'] => {
    if (filePath.endsWith('SKILL.md')) return 'skill'
    if (filePath.includes('workflows') && filePath.endsWith('.md')) return 'workflow'
    if (filePath.endsWith('mcp_config.json')) return 'mcp'
    return 'unknown'
  }

  // Handler genérico
  const handle = (event: WatchEvent['event']) => (path: string) => {
    const type = classify(path)
    if (type !== 'unknown') {
      onChange({ type, event, path })
    }
  }

  watcher.on('add', handle('add'))
  watcher.on('change', handle('change'))
  watcher.on('unlink', handle('unlink'))

  return watcher
}
