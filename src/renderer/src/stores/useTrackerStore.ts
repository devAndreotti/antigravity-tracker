// ─── TRACKER STORE ──────────────────────────────────────────────────────────
// Estado global do app com dados reais do filesystem via Electron IPC.

import { create } from 'zustand'

// ─── TYPES ──────────────────────────────────────────────────────────────────

// Config espelhada do main process (evita import cross-project)
interface AppConfig {
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

interface TrackerState {
  skills: any[]
  workflows: any[]
  mcps: any[]
  workspaces: any[]
  config: AppConfig | null
  isLoading: boolean
  lastScan: Date | null
  error: string | null

  fetchAll: () => Promise<void>
  loadConfig: () => Promise<void>
  saveConfig: (partial: Partial<AppConfig>) => Promise<void>
  startWatcher: () => Promise<void>
  stopWatcher: () => Promise<void>
}

// ─── API BRIDGE ─────────────────────────────────────────────────────────────
// Tipagem para o window.api exposto pelo preload

declare global {
  interface Window {
    api: {
      scan: () => Promise<any>
      loadConfig: () => Promise<any>
      saveConfig: (partial: any) => Promise<any>
      startWatcher: () => Promise<void>
      stopWatcher: () => Promise<void>
      onUpdate: (cb: (data: any) => void) => () => void
      minimize: () => void
      maximize: () => void
      close: () => void
    }
  }
}

// ─── STORE ──────────────────────────────────────────────────────────────────

export const useTrackerStore = create<TrackerState>((set) => ({
  skills: [],
  workflows: [],
  mcps: [],
  workspaces: [],
  config: null,
  isLoading: false,
  lastScan: null,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const data = await window.api.scan()
      set({
        skills: data.skills || [],
        workflows: data.workflows || [],
        mcps: data.mcps || [],
        workspaces: data.workspaces || [],
        isLoading: false,
        lastScan: new Date(),
      })
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Scan failed' })
      console.error('[store] Erro ao carregar dados:', err)
    }
  },

  loadConfig: async () => {
    try {
      const config = await window.api.loadConfig()
      set({ config })
    } catch (err) {
      console.error('[store] Erro ao carregar config:', err)
    }
  },

  saveConfig: async (partial) => {
    try {
      const config = await window.api.saveConfig(partial)
      set({ config })
    } catch (err) {
      console.error('[store] Erro ao salvar config:', err)
    }
  },

  startWatcher: async () => {
    try {
      await window.api.startWatcher()
    } catch (err) {
      console.error('[store] Erro ao iniciar watcher:', err)
    }
  },

  stopWatcher: async () => {
    try {
      await window.api.stopWatcher()
    } catch (err) {
      console.error('[store] Erro ao parar watcher:', err)
    }
  },
}))
