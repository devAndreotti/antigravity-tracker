// ─── IPC HANDLERS ───────────────────────────────────────────────────────────
// Registra todos os handlers IPC entre main process e renderer.

import { ipcMain, BrowserWindow } from 'electron'
import { fullScan } from './scanner'
import { loadConfig, saveConfig } from './config'
import { createWatcher } from './watcher'
import type { FSWatcher } from 'chokidar'

let currentWatcher: FSWatcher | null = null
let scanIntervalId: ReturnType<typeof setInterval> | null = null

// Converte string do config em ms
function intervalToMs(interval: string): number | null {
  switch (interval) {
    case '30s': return 30_000
    case '1min': return 60_000
    case '5min': return 300_000
    default: return null // 'realtime' usa watcher, não interval
  }
}

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
    const newConfig = loadConfig()

    // Reinicia watcher/interval se scanInterval ou watchMode mudou
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) {
      restartScanSystem(mainWindow)
    }

    return newConfig
  })

  // ─── WATCHER ────────────────────────────────────────────────────────────
  ipcMain.handle('watcher:start', () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]
    if (mainWindow) restartScanSystem(mainWindow)
    return true
  })

  ipcMain.handle('watcher:stop', () => {
    stopAll()
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

// ─── AUTO-START ─────────────────────────────────────────────────────────────

export function autoStartWatcher(mainWindow: BrowserWindow): void {
  const config = loadConfig()
  if (config.watchMode) {
    restartScanSystem(mainWindow)
  }
}

// ─── STOP ALL ───────────────────────────────────────────────────────────────

function stopAll(): void {
  if (currentWatcher) {
    currentWatcher.close()
    currentWatcher = null
  }
  if (scanIntervalId) {
    clearInterval(scanIntervalId)
    scanIntervalId = null
  }
}

// ─── RESTART SCAN SYSTEM ────────────────────────────────────────────────────
// Decide se usa chokidar (realtime) ou setInterval (periódico)

function restartScanSystem(mainWindow: BrowserWindow): void {
  stopAll()

  const config = loadConfig()
  if (!config.watchMode) return

  const ms = intervalToMs(config.scanInterval)

  if (ms === null) {
    // ─── REALTIME via chokidar ──────────────────────────────────────────
    const paths = [
      ...config.skillsDirs,
      ...config.workflowsDirs,
      config.mcpConfigPath,
      ...config.customDirs,
    ]

    currentWatcher = createWatcher(paths, async () => {
      await sendScanUpdate(mainWindow, config)
    })
  } else {
    // ─── PERIÓDICO via setInterval ──────────────────────────────────────
    scanIntervalId = setInterval(async () => {
      await sendScanUpdate(mainWindow, config)
    }, ms)
  }
}

// ─── SEND SCAN UPDATE ───────────────────────────────────────────────────────

async function sendScanUpdate(mainWindow: BrowserWindow, config: any): Promise<void> {
  try {
    const data = await fullScan(config)
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('scanner:updated', { data })
    }
  } catch (err) {
    console.error('[scan] Erro ao processar:', err)
  }
}
