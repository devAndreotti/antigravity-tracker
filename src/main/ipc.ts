// ─── IPC HANDLERS ───────────────────────────────────────────────────────────
// Registra todos os handlers IPC entre main process e renderer.

import { ipcMain, BrowserWindow } from 'electron'
import { fullScan } from './scanner'
import { loadConfig, saveConfig } from './config'
import { createWatcher } from './watcher'
import type { FSWatcher } from 'chokidar'

let currentWatcher: FSWatcher | null = null

// ─── SETUP ──────────────────────────────────────────────────────────────────

export function registerIpcHandlers(): void {

  // ─── SCANNER ────────────────────────────────────────────────────────────
  ipcMain.handle('scanner:fullScan', async () => {
    const config = loadConfig()
    return await fullScan(config)
  })

  // ─── CONFIG ─────────────────────────────────────────────────────────────
  ipcMain.handle('config:load', () => {
    return loadConfig()
  })

  ipcMain.handle('config:save', async (_e, partial) => {
    saveConfig(undefined, partial)
    return loadConfig()
  })

  // ─── WATCHER ────────────────────────────────────────────────────────────
  ipcMain.handle('watcher:start', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) restartWatcher(mainWindow)
    return true
  })

  ipcMain.handle('watcher:stop', () => {
    if (currentWatcher) {
      currentWatcher.close()
      currentWatcher = null
    }
    return true
  })

  // ─── WINDOW CONTROLS ───────────────────────────────────────────────────
  ipcMain.handle('window:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win?.isMaximized()) win.unmaximize()
    else win?.maximize()
  })

  ipcMain.handle('window:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}

// ─── AUTO-START WATCHER ─────────────────────────────────────────────────────

export function autoStartWatcher(mainWindow: BrowserWindow): void {
  const config = loadConfig()
  if (config.watchMode) {
    restartWatcher(mainWindow)
  }
}

// ─── RESTART WATCHER ────────────────────────────────────────────────────────

function restartWatcher(mainWindow: BrowserWindow): void {
  // Para o watcher anterior
  if (currentWatcher) {
    currentWatcher.close()
    currentWatcher = null
  }

  const config = loadConfig()
  if (!config.watchMode) return

  // Paths para monitorar
  const paths = [
    ...config.skillsDirs,
    ...config.workflowsDirs,
    config.mcpConfigPath,
    ...config.customDirs,
  ]

  currentWatcher = createWatcher(paths, async (event) => {
    // Quando algo muda, faz rescan e notifica o renderer
    try {
      const data = await fullScan(config)
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('scanner:updated', { event, data })
      }
    } catch (err) {
      console.error('[watcher] Erro ao processar mudança:', err)
    }
  })
}
