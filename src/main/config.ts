// ─── CONFIG ─────────────────────────────────────────────────────────────────
// Carrega, salva e mescla configurações do app em JSON.

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { homedir } from 'os'

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface AppConfig {
  skillsDirs: string[]
  workflowsDirs: string[]
  mcpConfigPath: string
  customDirs: string[]
  projectsJsonPath: string
  watchMode: boolean
  apiPort: number
  scanInterval: 'realtime' | '30s' | '1min' | '5min'
  theme: 'dark' | 'light'
}

// ─── DEFAULTS ───────────────────────────────────────────────────────────────

export const defaultConfig: AppConfig = {
  skillsDirs: [join(homedir(), '.gemini', 'antigravity', 'skills')],
  workflowsDirs: [join(homedir(), '.gemini', 'antigravity', 'global_workflows')],
  mcpConfigPath: join(homedir(), '.gemini', 'antigravity', 'mcp_config.json'),
  customDirs: [],
  projectsJsonPath: join(homedir(), '.gemini', 'projects.json'),
  watchMode: true,
  apiPort: 19847,
  scanInterval: 'realtime',
  theme: 'dark',
}

// ─── FUNCTIONS ──────────────────────────────────────────────────────────────

export function getConfigPath(): string {
  return join(homedir(), '.antigravity-tracker', 'config.json')
}

export function loadConfig(configPath: string = getConfigPath()): AppConfig {
  try {
    const raw = readFileSync(configPath, 'utf-8')
    const loaded = JSON.parse(raw)
    // Mescla com defaults para que campos novos sejam preenchidos
    return { ...defaultConfig, ...loaded }
  } catch {
    return { ...defaultConfig }
  }
}

export function saveConfig(configPath: string = getConfigPath(), config: Partial<AppConfig>): void {
  const dir = dirname(configPath)
  mkdirSync(dir, { recursive: true })
  const current = loadConfig(configPath)
  const merged = { ...current, ...config }
  writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf-8')
}
