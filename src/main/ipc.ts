import { ipcMain } from 'electron'
import { scanSkills, scanGlobalWorkflows, scanMcps, scanWorkspaces, scanAll } from './scanner'

// Registra todos os handlers IPC do main process
export function registerIpcHandlers(): void {
  ipcMain.handle('scan:skills', () => {
    return scanSkills()
  })

  ipcMain.handle('scan:workflows', () => {
    const globalWorkflows = scanGlobalWorkflows()
    const { localWorkflows } = scanWorkspaces()
    return [...globalWorkflows, ...localWorkflows]
  })

  ipcMain.handle('scan:mcps', () => {
    return scanMcps()
  })

  ipcMain.handle('scan:workspaces', () => {
    const { workspaces } = scanWorkspaces()
    return workspaces
  })

  ipcMain.handle('scan:all', () => {
    return scanAll()
  })

  // Controle de janela para title bar custom
  ipcMain.handle('window:minimize', (event) => {
    const { BrowserWindow } = require('electron')
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('window:maximize', (event) => {
    const { BrowserWindow } = require('electron')
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.handle('window:close', (event) => {
    const { BrowserWindow } = require('electron')
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}
