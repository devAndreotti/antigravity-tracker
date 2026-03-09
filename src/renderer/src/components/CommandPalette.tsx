import { useState, useEffect, useRef } from 'react'
import { SKILLS, WORKFLOWS, MCPS, WORKSPACES, Tag, type PageId } from '../data'

interface Props {
  onClose: () => void
  onNavigate: (page: PageId) => void
  onSelect: (item: any, type: string) => void
}

// Modal de busca global (⌘K)
export default function CommandPalette({ onClose, onNavigate, onSelect }: Props) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  const [focusIdx, setFocusIdx] = useState(0)

  useEffect(() => { ref.current?.focus() }, [])

  const all = [
    ...SKILLS.map(s => ({ type: 'skill' as const, id: s.id, label: s.name, sub: s.description, page: 'skills' as PageId, data: s })),
    ...WORKFLOWS.map(w => ({ type: 'workflow' as const, id: w.id, label: w.slug, sub: w.description, page: 'workflows' as PageId, data: w })),
    ...MCPS.map(m => ({ type: 'mcp' as const, id: m.id, label: m.name, sub: m.description, page: 'mcps' as PageId, data: m })),
    ...WORKSPACES.map(w => ({ type: 'workspace' as const, id: w.id, label: w.name, sub: w.description, page: 'workspaces' as PageId, data: w })),
  ]

  const results = q.length > 1
    ? all.filter(i => i.label.includes(q.toLowerCase()) || i.sub?.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : all.slice(0, 6)

  const typeColors: Record<string, string> = { skill: '#a78bfa', workflow: '#a3ff12', mcp: '#60a5fa', workspace: '#f97316' }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[focusIdx]) {
      const r = results[focusIdx]
      onNavigate(r.page)
      onSelect(r.data, r.type)
      onClose()
    }
    if (e.key === 'Escape') onClose()
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: '#000000aa', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: 100, backdropFilter: 'blur(4px)',
    }}>
      <div onClick={e => e.stopPropagation()} onKeyDown={handleKey} style={{
        width: 540, background: '#0d1219', border: '1px solid #ffffff15',
        borderRadius: 10, overflow: 'hidden', boxShadow: '0 24px 80px #000000cc',
      }}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #ffffff08', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input ref={ref} value={q} onChange={e => { setQ(e.target.value); setFocusIdx(0) }}
            placeholder="Search skills, workflows, MCPs..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit' }} />
          <span style={{ fontSize: 10, color: '#2d3748', background: '#ffffff08', padding: '2px 6px', borderRadius: 4 }}>ESC</span>
        </div>

        {/* Resultados */}
        <div style={{ maxHeight: 360, overflow: 'auto' }}>
          {results.map((r, i) => (
            <div key={r.id} onClick={() => { onNavigate(r.page); onSelect(r.data, r.type); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer',
                borderBottom: '1px solid #ffffff05', transition: 'background 0.1s',
                background: i === focusIdx ? '#ffffff08' : 'transparent',
              }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: `${typeColors[r.type]}15`, border: `1px solid ${typeColors[r.type]}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, color: typeColors[r.type] }}>{r.type[0].toUpperCase()}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace' }}>{r.label}</div>
                <div style={{ fontSize: 10, color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</div>
              </div>
              <Tag label={r.type} color={typeColors[r.type]} small />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid #ffffff06', display: 'flex', gap: 16 }}>
          {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([k, v]) => (
            <span key={k} style={{ fontSize: 10, color: '#2d3748' }}>
              <span style={{ background: '#ffffff08', padding: '1px 5px', borderRadius: 3, marginRight: 4, color: '#4a5568' }}>{k}</span>{v}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
