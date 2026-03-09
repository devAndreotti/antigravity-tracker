// Tipos globais da API exposta pelo preload
import type { ElectronAPI } from '../../preload/index'

declare global {
  interface Window {
    api: ElectronAPI
  }
}

// Re-exporta os tipos do scanner para uso no renderer
export interface Skill {
  id: string
  name: string
  description: string
  path: string
  category: string
  origin: 'global' | 'user' | 'custom'
}

export interface Workflow {
  id: string
  slug: string
  description: string
  path: string
  scope: 'global' | 'local'
  workspace?: string
  origin: 'global' | 'user' | 'custom'
}

export interface McpServer {
  id: string
  name: string
  command: string
  args: string[]
  env: Record<string, string>
  type: 'node' | 'python' | 'docker' | 'url' | 'unknown'
  origin: 'global' | 'user' | 'custom'
}

export interface Workspace {
  id: string
  name: string
  uri: string
  corpusName: string
  hasAgents: boolean
  localWorkflows: string[]
}

export type TabId = 'skills' | 'workflows' | 'mcps' | 'workspaces'
export type ViewMode = 'grid' | 'list'
