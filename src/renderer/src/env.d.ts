/// <reference types="vite/client" />

// Tipagem para as APIs expostas pelo preload via contextBridge
interface ElectronAPI {
  scan: {
    skills: () => Promise<any[]>
    workflows: () => Promise<any[]>
    mcps: () => Promise<any[]>
    workspaces: () => Promise<any[]>
    all: () => Promise<any>
  }
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
  }
}

declare global {
  interface Window {
    api?: ElectronAPI
  }
}
