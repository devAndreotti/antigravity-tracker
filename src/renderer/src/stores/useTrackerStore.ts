import { create } from 'zustand'
import type { Skill, Workflow, McpServer, Workspace, TabId, ViewMode } from '../types'

interface TrackerState {
  // Dados escaneados
  skills: Skill[]
  workflows: Workflow[]
  mcps: McpServer[]
  workspaces: Workspace[]

  // UI state
  activeTab: TabId
  searchQuery: string
  viewMode: ViewMode
  sidebarCollapsed: boolean
  isLoading: boolean

  // Actions
  setTab: (tab: TabId) => void
  setSearch: (query: string) => void
  setViewMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  loadAll: () => Promise<void>
}

export const useTrackerStore = create<TrackerState>((set) => ({
  // Estado inicial
  skills: [],
  workflows: [],
  mcps: [],
  workspaces: [],

  activeTab: 'skills',
  searchQuery: '',
  viewMode: 'grid',
  sidebarCollapsed: false,
  isLoading: true,

  // Actions
  setTab: (tab) => set({ activeTab: tab }),

  setSearch: (query) => set({ searchQuery: query }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  loadAll: async () => {
    set({ isLoading: true })
    try {
      const data = await window.api.scan.all()
      set({
        skills: data.skills,
        workflows: data.workflows,
        mcps: data.mcps,
        workspaces: data.workspaces,
        isLoading: false
      })
    } catch (err) {
      console.error('Erro ao escanear assets:', err)
      set({ isLoading: false })
    }
  }
}))
