import { useState } from 'react'
import { type Mcp, TYPE_COLORS, Tag, DotStatus, CopyBtn, BADGE_TOOLTIPS } from '../data'
import { highlightText } from '../utils/highlightText'

interface Props {
  mcps: Mcp[]
  search: string
  onSelect: (item: Mcp, type: string) => void
  focusIndex?: number
}

export default function McpsPage({ mcps, search, onSelect, focusIndex }: Props) {
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const toggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(l => ({ ...l, [id]: true }))
    setTimeout(() => {
      setStatuses(p => ({ ...p, [id]: p[id] === 'running' ? 'stopped' : 'running' }))
      setLoading(l => ({ ...l, [id]: false }))
    }, 1200)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
      {mcps.map((mcp, i) => {
        const st = statuses[mcp.id] || mcp.status
        const isLoading = loading[mcp.id]
        const isFocused = focusIndex === i
        return (
          <div key={mcp.id} onClick={() => onSelect(mcp, 'mcp')} className="card" style={{
            background: '#0a0f18', border: `1px solid ${isFocused ? '#a3ff1244' : '#ffffff0d'}`,
            borderRadius: 8, padding: '14px 16px', position: 'relative', overflow: 'hidden', cursor: 'pointer',
          }}>
            {/* Accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: TYPE_COLORS[mcp.type] || '#4a5568', opacity: 0.6 }} />
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, marginTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                {highlightText(mcp.name, search)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DotStatus status={st} />
                <button onClick={e => toggle(mcp.id, e)} style={{
                  padding: '2px 7px', fontSize: 9, fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: 4, border: '1px solid #ffffff12', letterSpacing: '0.06em', transition: 'all 0.15s',
                  background: isLoading ? '#ffffff08' : st === 'running' ? '#f8717115' : '#4ade8015',
                  color: isLoading ? '#64748b' : st === 'running' ? '#f87171' : '#4ade80',
                }}>
                  {isLoading ? '...' : st === 'running' ? 'STOP' : 'START'}
                </button>
              </div>
            </div>
            {/* Description */}
            <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 10 }}>
              {highlightText(mcp.description, search)}
            </div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              <Tag label={mcp.type} color={TYPE_COLORS[mcp.type]} tooltip={BADGE_TOOLTIPS[mcp.type]} />
              <Tag label={mcp.origin} color="#a3ff12" tooltip={BADGE_TOOLTIPS[mcp.origin]} />
            </div>
            {/* Command preview */}
            {mcp.command && (
              <div style={{
                background: '#060910', borderRadius: 5, padding: '5px 8px', marginBottom: 8,
                border: '1px solid #ffffff06', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 9, color: '#2d3748', flexShrink: 0 }}>$</span>
                <span style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mcp.command}</span>
                <CopyBtn text={mcp.command} />
              </div>
            )}
            {/* Tools preview */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {mcp.tools?.slice(0, 4).map(t => (
                <span key={t} style={{ fontSize: 9, color: '#334155', background: '#ffffff05', border: '1px solid #ffffff08', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace' }}>{t}</span>
              ))}
              {mcp.tools?.length > 4 && <span style={{ fontSize: 9, color: '#2d3748' }}>+{mcp.tools.length - 4}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
