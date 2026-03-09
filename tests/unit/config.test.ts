import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, saveConfig, defaultConfig } from '../../src/main/config'
import { mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

let tmpDir: string

beforeEach(() => {
  tmpDir = join(tmpdir(), `ag-config-test-${Date.now()}`)
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('loadConfig', () => {
  it('retorna defaultConfig se arquivo não existe', () => {
    const config = loadConfig(join(tmpDir, 'config.json'))
    expect(config).toMatchObject(defaultConfig)
  })

  it('carrega config salva corretamente', () => {
    const configPath = join(tmpDir, 'config.json')
    saveConfig(configPath, { apiPort: 12345, watchMode: false })
    const loaded = loadConfig(configPath)
    expect(loaded.apiPort).toBe(12345)
    expect(loaded.watchMode).toBe(false)
  })

  it('mescla com defaultConfig se tiver campos faltando', () => {
    const configPath = join(tmpDir, 'config.json')
    saveConfig(configPath, { apiPort: 9999 })
    const loaded = loadConfig(configPath)
    expect(loaded.apiPort).toBe(9999)
    expect(loaded.watchMode).toBe(defaultConfig.watchMode)
  })

  it('não quebra com JSON corrompido', () => {
    const configPath = join(tmpDir, 'config.json')
    mkdirSync(tmpDir, { recursive: true })
    require('fs').writeFileSync(configPath, '{ broken json }')
    const loaded = loadConfig(configPath)
    expect(loaded).toMatchObject(defaultConfig)
  })
})

describe('saveConfig', () => {
  it('cria diretórios necessários automaticamente', () => {
    const configPath = join(tmpDir, 'sub', 'dir', 'config.json')
    expect(() => saveConfig(configPath, { apiPort: 1234 })).not.toThrow()
    const loaded = loadConfig(configPath)
    expect(loaded.apiPort).toBe(1234)
  })

  it('preserva campos existentes ao salvar parcial', () => {
    const configPath = join(tmpDir, 'config.json')
    saveConfig(configPath, { apiPort: 5555, theme: 'light' })
    saveConfig(configPath, { apiPort: 6666 })
    const loaded = loadConfig(configPath)
    expect(loaded.apiPort).toBe(6666)
    expect(loaded.theme).toBe('light')
  })
})
