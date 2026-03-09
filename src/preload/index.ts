// ─── PRELOAD ────────────────────────────────────────────────────────────────
// Expõe APIs seguras para o renderer via contextBridge.

import { contextBridge, ipcRenderer } from 'electron'

const api = {
  // Scanner
  scan: () => ipcRenderer.invoke('scanner:fullScan'),

  // Config
  loadConfig: () => ipcRenderer.invoke('config:load'),
  saveConfig: (partial: any) => ipcRenderer.invoke('config:save', partial),

  // Watcher
  startWatcher: () => ipcRenderer.invoke('watcher:start'),
  stopWatcher: () => ipcRenderer.invoke('watcher:stop'),

  // Listener de atualizações em tempo real
  onUpdate: (callback: (data: any) => void) => {
    const handler = (_e: any, payload: any) => callback(payload)
    ipcRenderer.on('scanner:updated', handler)
    // Retorna função de cleanup
    return () => ipcRenderer.removeListener('scanner:updated', handler)
  },

  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
}

contextBridge.exposeInMainWorld('api', api)

// Tipagem para o renderer
export type ElectronAPI = typeof api
