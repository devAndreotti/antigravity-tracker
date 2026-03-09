import { contextBridge, ipcRenderer } from 'electron'

// Expõe APIs seguras para o renderer via contextBridge
const api = {
  scan: {
    skills: () => ipcRenderer.invoke('scan:skills'),
    workflows: () => ipcRenderer.invoke('scan:workflows'),
    mcps: () => ipcRenderer.invoke('scan:mcps'),
    workspaces: () => ipcRenderer.invoke('scan:workspaces'),
    all: () => ipcRenderer.invoke('scan:all')
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  }
}

contextBridge.exposeInMainWorld('api', api)

// Tipagem para o renderer
export type ElectronAPI = typeof api
