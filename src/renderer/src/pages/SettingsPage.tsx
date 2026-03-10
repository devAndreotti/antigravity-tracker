import { useState, useEffect, useRef } from 'react'
import { useTrackerStore } from '../stores/useTrackerStore'

// ─── SETTINGS PAGE — Funcional com persistência ─────────────────────────────

const SCAN_INTERVALS: Array<'realtime' | '30s' | '1min' | '5min'> = ['realtime', '30s', '1min', '5min']

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      width: 34, height: 18, borderRadius: 9, padding: 2, cursor: 'pointer',
      border: 'none', transition: 'all 0.2s',
      background: on ? '#a3ff1240' : '#ffffff15',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%', transition: 'all 0.2s',
        transform: on ? 'translateX(16px)' : 'translateX(0)',
        background: on ? '#a3ff12' : '#4a5568',
      }} />
    </button>
  )
}

export default function SettingsPage() {
  const { config, saveConfig, fetchAll, isLoading, lastScan, skills, workflows, mcps, workspaces } = useTrackerStore()
  const isElectron = typeof window !== 'undefined' && !!window.api?.scan

  // Estado local espelhando config (sincroniza quando config carrega)
  const [customDirs, setCustomDirs] = useState<string[]>([])
  const [newDir, setNewDir] = useState('')
  const [port, setPort] = useState('19847')
  const [watchMode, setWatchMode] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [scanInterval, setScanInterval] = useState<'realtime' | '30s' | '1min' | '5min'>('realtime')
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null)

  // Diretórios base (read-only, vêm do config)
  const [skillsDirs, setSkillsDirs] = useState<string[]>([])
  const [workflowsDirs, setWorkflowsDirs] = useState<string[]>([])
  const [mcpConfigPath, setMcpConfigPath] = useState('')

  // Sincroniza estado local quando config carrega
  useEffect(() => {
    if (!config) return
    setCustomDirs(config.customDirs || [])
    setPort(String(config.apiPort || 19847))
    setWatchMode(config.watchMode ?? true)
    setTheme(config.theme || 'dark')
    setScanInterval(config.scanInterval || 'realtime')
    setSkillsDirs(config.skillsDirs || [])
    setWorkflowsDirs(config.workflowsDirs || [])
    setMcpConfigPath(config.mcpConfigPath || '')
  }, [config])

  // Debounce para salvar config
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const persistConfig = (partial: Record<string, any>) => {
    if (!isElectron) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => saveConfig(partial), 400)
  }

  // ─── HANDLERS ─────────────────────────────────────────────────────────

  const addDir = () => {
    if (!newDir.trim()) return
    const updated = [...customDirs, newDir.trim()]
    setCustomDirs(updated)
    setNewDir('')
    persistConfig({ customDirs: updated })
  }

  const removeDir = (idx: number) => {
    const updated = customDirs.filter((_, i) => i !== idx)
    setCustomDirs(updated)
    setConfirmRemove(null)
    persistConfig({ customDirs: updated })
  }

  const handlePortApply = () => {
    const p = parseInt(port)
    if (p > 0 && p < 65536) persistConfig({ apiPort: p })
  }

  const handleWatchToggle = () => {
    const next = !watchMode
    setWatchMode(next)
    persistConfig({ watchMode: next })
    if (isElectron) {
      if (next) window.api.startWatcher()
      else window.api.stopWatcher()
    }
  }

  const handleTheme = (t: 'dark' | 'light') => {
    setTheme(t)
    persistConfig({ theme: t })
  }

  const handleInterval = (s: typeof scanInterval) => {
    setScanInterval(s)
    persistConfig({ scanInterval: s })
  }

  const handleScan = async () => {
    setScanning(true)
    setScanDone(false)
    try {
      await fetchAll()
    } catch { /* handled in store */ }
    setScanning(false)
    setScanDone(true)
    setTimeout(() => setScanDone(false), 2000)
  }

  // ─── STYLES ───────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '6px 10px', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'inherit', outline: 'none',
  }

  const btnStyle: React.CSSProperties = {
    padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 10, fontWeight: 600,
    fontFamily: 'inherit', letterSpacing: '0.04em', transition: 'all 0.15s',
  }

  // ─── RENDER ───────────────────────────────────────────────────────────

  const allBaseDirs = [
    ...skillsDirs.map(p => ({ path: p, type: 'skills' })),
    ...workflowsDirs.map(p => ({ path: p, type: 'workflows' })),
    ...(mcpConfigPath ? [{ path: mcpConfigPath, type: 'mcp config' }] : []),
  ]

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Status resumo */}
      <div style={{ marginBottom: 20, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            ['Skills', skills.length, '#a78bfa'],
            ['Workflows', workflows.length, 'var(--accent)'],
            ['MCPs', mcps.length, '#60a5fa'],
            ['Workspaces', workspaces.length, '#f97316'],
          ].map(([label, count, color]) => (
            <div key={label as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: color as string, fontFamily: "'Syne', sans-serif" }}>{count}</div>
              <div style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>
        {lastScan && <div style={{ fontSize: 9, color: 'var(--text-ghost)', marginTop: 8, textAlign: 'center' }}>Last scan: {lastScan.toLocaleTimeString()}</div>}
      </div>

      {/* Diretórios base (read-only) */}
      <SectionTitle title="Base directories (auto-detected)" />
      <div style={{ marginBottom: 16 }}>
        {allBaseDirs.map((dir, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
            background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 2,
          }}>
            <span style={{ fontSize: 9, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.06em' }}>{dir.type}</span>
            <span style={{ flex: 1, fontSize: 10, color: 'var(--text-faint)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{dir.path}</span>
          </div>
        ))}
      </div>

      {/* Custom directories */}
      <SectionTitle title="Custom watched directories" />
      <div style={{ marginBottom: 20 }}>
        {customDirs.map((dir, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
            background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 6, marginBottom: 4,
          }}>
            <span style={{ flex: 1, fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', wordBreak: 'break-all' }}>{dir}</span>
            {confirmRemove === i ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 9, color: '#f87171', marginRight: 4 }}>Remove?</span>
                <button onClick={() => removeDir(i)} style={{ ...btnStyle, padding: '2px 6px', background: '#f8717120', color: '#f87171', border: '1px solid #f8717140' }}>YES</button>
                <button onClick={() => setConfirmRemove(null)} style={{ ...btnStyle, padding: '2px 6px', background: '#ffffff08', color: '#4a5568', border: '1px solid #ffffff0d' }}>NO</button>
              </div>
            ) : (
              <button onClick={() => setConfirmRemove(i)} style={{
                ...btnStyle, padding: '2px 8px', background: '#f8717115', color: '#f87171', border: '1px solid #f8717130',
              }}>REMOVE</button>
            )}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input value={newDir} onChange={e => setNewDir(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDir()}
            placeholder="Add directory path..."
            style={{ ...inputStyle, flex: 1 }} />
          <button onClick={addDir} style={{ ...btnStyle, background: '#a3ff1218', color: '#a3ff12', border: '1px solid #a3ff1244' }}>ADD</button>
        </div>
        {customDirs.length === 0 && (
          <div style={{ fontSize: 10, color: '#1e293b', marginTop: 6, fontStyle: 'italic' }}>No custom directories. Add project folders to track local workflows.</div>
        )}
      </div>

      {/* Porta API */}
      <SectionTitle title="Local API port" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, alignItems: 'center' }}>
        <input type="number" value={port} onChange={e => setPort(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePortApply()}
          style={{ ...inputStyle, width: 100 }} />
        <button onClick={handlePortApply} style={{ ...btnStyle, background: '#ffffff08', color: '#4a5568', border: '1px solid #ffffff0d' }}>APPLY</button>
        <span style={{ fontSize: 10, color: '#2d3748', marginLeft: 4 }}>Default: 19847</span>
      </div>

      {/* Watch Mode */}
      <SectionTitle title="Watch mode" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Toggle on={watchMode} onToggle={handleWatchToggle} />
        <span style={{ fontSize: 11, color: watchMode ? '#94a3b8' : '#4a5568' }}>
          {watchMode ? 'Watching for file changes (realtime updates)' : 'Watching disabled (manual scan only)'}
        </span>
      </div>

      {/* Theme */}
      <SectionTitle title="Theme" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['dark', 'light'] as const).map(t => (
          <button key={t} onClick={() => handleTheme(t)} style={{
            ...btnStyle,
            background: theme === t ? (t === 'dark' ? '#a3ff1218' : '#60a5fa18') : 'transparent',
            color: theme === t ? (t === 'dark' ? '#a3ff12' : '#60a5fa') : '#4a5568',
            border: theme === t ? `1px solid ${t === 'dark' ? '#a3ff1244' : '#60a5fa44'}` : '1px solid #ffffff0d',
            textTransform: 'capitalize',
          }}>{t}</button>
        ))}
      </div>

      {/* Scan interval */}
      <SectionTitle title="Scan interval" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {SCAN_INTERVALS.map(s => (
          <button key={s} onClick={() => handleInterval(s)} style={{
            ...btnStyle,
            background: scanInterval === s ? '#a3ff1218' : 'transparent',
            color: scanInterval === s ? '#a3ff12' : '#4a5568',
            border: scanInterval === s ? '1px solid #a3ff1244' : '1px solid #ffffff0d',
          }}>{s}</button>
        ))}
      </div>

      {/* Scan Now */}
      <SectionTitle title="Manual scan" />
      <button onClick={handleScan} disabled={scanning || isLoading} style={{
        ...btnStyle, padding: '8px 20px', fontSize: 11,
        background: scanDone ? '#4ade8015' : (scanning || isLoading) ? '#ffffff08' : '#a3ff1218',
        color: scanDone ? '#4ade80' : (scanning || isLoading) ? '#64748b' : '#a3ff12',
        border: `1px solid ${scanDone ? '#4ade8044' : (scanning || isLoading) ? '#ffffff15' : '#a3ff1244'}`,
        cursor: (scanning || isLoading) ? 'not-allowed' : 'pointer',
      }}>
        {(scanning || isLoading) ? '⟳ Scanning...' : scanDone ? '✓ Done' : 'SCAN NOW'}
      </button>

      {/* Data source indicator */}
      <div style={{ marginTop: 24, padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 6, border: '1px solid var(--border-faint)' }}>
        <div style={{ fontSize: 9, color: 'var(--text-ghost)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: isElectron ? '#4ade80' : '#fbbf24', display: 'inline-block' }} />
          {isElectron ? 'Connected to filesystem — reading real data' : 'Browser mode — using mock data'}
        </div>
      </div>
    </div>
  )
}
