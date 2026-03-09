import { useState } from 'react'

// ─── SETTINGS PAGE ──────────────────────────────────────────────────────────
interface WatchedDir {
  path: string
  enabled: boolean
}

const DEFAULT_DIRS: WatchedDir[] = [
  { path: 'C:\\Users\\ricar\\.gemini\\antigravity\\skills', enabled: true },
  { path: 'C:\\Users\\ricar\\.gemini\\antigravity\\workflows', enabled: true },
  { path: 'D:\\Dev\\Projects', enabled: true },
]

const SCAN_INTERVALS = ['Realtime', '30s', '1min', '5min']

function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#2d3748', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: '#ffffff06' }} />
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
  const [dirs, setDirs] = useState<WatchedDir[]>(DEFAULT_DIRS)
  const [newDir, setNewDir] = useState('')
  const [port, setPort] = useState('19847')
  const [watchMode, setWatchMode] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [interval, setInterval] = useState('Realtime')
  const [scanning, setScanning] = useState(false)
  const [scanDone, setScanDone] = useState(false)

  const addDir = () => {
    if (newDir.trim()) {
      setDirs(d => [...d, { path: newDir.trim(), enabled: true }])
      setNewDir('')
    }
  }

  const removeDir = (idx: number) => setDirs(d => d.filter((_, i) => i !== idx))
  const toggleDir = (idx: number) => setDirs(d => d.map((dir, i) => i === idx ? { ...dir, enabled: !dir.enabled } : dir))

  const handleScan = () => {
    setScanning(true)
    setScanDone(false)
    setTimeout(() => { setScanning(false); setScanDone(true); setTimeout(() => setScanDone(false), 2000) }, 1500)
  }

  const inputStyle: React.CSSProperties = {
    background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 6,
    padding: '6px 10px', color: '#e2e8f0', fontSize: 12, fontFamily: 'inherit', outline: 'none',
  }

  const btnStyle: React.CSSProperties = {
    padding: '5px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 10, fontWeight: 600,
    fontFamily: 'inherit', letterSpacing: '0.04em', transition: 'all 0.15s',
  }

  return (
    <div style={{ maxWidth: 560 }}>
      {/* Diretórios monitorados */}
      <SectionTitle title="Watched directories" />
      <div style={{ marginBottom: 20 }}>
        {dirs.map((dir, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
            background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 6, marginBottom: 4,
          }}>
            <Toggle on={dir.enabled} onToggle={() => toggleDir(i)} />
            <span style={{ flex: 1, fontSize: 11, color: dir.enabled ? '#94a3b8' : '#2d3748', fontFamily: 'monospace', wordBreak: 'break-all' }}>{dir.path}</span>
            <button onClick={() => removeDir(i)} style={{
              ...btnStyle, padding: '2px 8px', background: '#f8717115', color: '#f87171', border: '1px solid #f8717130',
            }}>REMOVE</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input value={newDir} onChange={e => setNewDir(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDir()}
            placeholder="Add directory path..."
            style={{ ...inputStyle, flex: 1 }} />
          <button onClick={addDir} style={{ ...btnStyle, background: '#a3ff1218', color: '#a3ff12', border: '1px solid #a3ff1244' }}>ADD</button>
        </div>
      </div>

      {/* Porta API */}
      <SectionTitle title="Local API port" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, alignItems: 'center' }}>
        <input type="number" value={port} onChange={e => setPort(e.target.value)}
          style={{ ...inputStyle, width: 100 }} />
        <button style={{ ...btnStyle, background: '#ffffff08', color: '#4a5568', border: '1px solid #ffffff0d' }}>APPLY</button>
        <span style={{ fontSize: 10, color: '#2d3748', marginLeft: 4 }}>Default: 19847</span>
      </div>

      {/* Watch Mode */}
      <SectionTitle title="Watch mode" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Toggle on={watchMode} onToggle={() => setWatchMode(!watchMode)} />
        <span style={{ fontSize: 11, color: watchMode ? '#94a3b8' : '#4a5568' }}>
          {watchMode ? 'Watching for file changes' : 'Watching disabled'}
        </span>
      </div>

      {/* Theme */}
      <SectionTitle title="Theme" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['dark', 'light'] as const).map(t => (
          <button key={t} onClick={() => setTheme(t)} style={{
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
          <button key={s} onClick={() => setInterval(s)} style={{
            ...btnStyle,
            background: interval === s ? '#a3ff1218' : 'transparent',
            color: interval === s ? '#a3ff12' : '#4a5568',
            border: interval === s ? '1px solid #a3ff1244' : '1px solid #ffffff0d',
          }}>{s}</button>
        ))}
      </div>

      {/* Scan Now */}
      <SectionTitle title="Manual scan" />
      <button onClick={handleScan} disabled={scanning} style={{
        ...btnStyle, padding: '8px 20px', fontSize: 11,
        background: scanDone ? '#4ade8015' : scanning ? '#ffffff08' : '#a3ff1218',
        color: scanDone ? '#4ade80' : scanning ? '#64748b' : '#a3ff12',
        border: `1px solid ${scanDone ? '#4ade8044' : scanning ? '#ffffff15' : '#a3ff1244'}`,
        cursor: scanning ? 'not-allowed' : 'pointer',
      }}>
        {scanning ? '⟳ Scanning...' : scanDone ? '✓ Done' : 'SCAN NOW'}
      </button>
    </div>
  )
}
