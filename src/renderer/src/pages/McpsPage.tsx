import { useState } from 'react'
import { type Mcp, TYPE_COLORS, Tag, DotStatus, CopyBtn, BADGE_TOOLTIPS } from '../data'
import { highlightText } from '../utils/highlightText'

interface Props {
  mcps: Mcp[]
  search: string
  onSelect: (item: Mcp, type: string) => void
  focusIndex?: number
  viewMode?: 'auto' | '2col' | '3col' | 'list'
}

export default function McpsPage({ mcps, search, onSelect, focusIndex, viewMode = 'auto' }: Props) {
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

  const getGridStyle = () => {
    if (viewMode === 'list') return { display: 'flex', flexDirection: 'column' as const, gap: 10 }
    if (viewMode === '2col') return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }
    if (viewMode === '3col') return { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }
    return { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }
  }

  return (
    <div style={getGridStyle()}>
      {mcps.map((mcp, i) => {
        const st = statuses[mcp.id] || mcp.status
        const isLoading = loading[mcp.id]
        const isFocused = focusIndex === i
        return (
          <div key={mcp.id} onClick={() => onSelect(mcp, 'mcp')} className="card" style={{
            background: 'var(--bg-card)', border: `1px solid ${isFocused ? 'var(--accent-alpha)' : 'var(--border)'}`,
            borderRadius: 8, padding: viewMode === 'list' ? '10px 16px' : '14px 16px', position: 'relative', overflow: 'hidden', cursor: 'pointer',
            display: viewMode === 'list' ? 'flex' : 'block',
            alignItems: 'center', gap: 16
          }}>
            {/* Accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: TYPE_COLORS[mcp.type] || '#4a5568', opacity: 0.6 }} />
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: viewMode === 'list' ? 0 : 6, marginTop: viewMode === 'list' ? 0 : 4, width: viewMode === 'list' ? 260 : 'auto', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {highlightText(mcp.name, search)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <DotStatus status={st} />
                <button onClick={e => toggle(mcp.id, e)} style={{
                  padding: '2px 7px', fontSize: 9, fontFamily: 'inherit', cursor: isLoading ? 'not-allowed' : 'pointer',
                  borderRadius: 4, border: '1px solid var(--border)', letterSpacing: '0.06em', transition: 'all 0.15s',
                  background: isLoading ? 'var(--bg-surface)' : st === 'running' ? '#f8717115' : '#4ade8015',
                  color: isLoading ? 'var(--text-ghost)' : st === 'running' ? '#f87171' : '#4ade80',
                }}>
                  {isLoading ? '...' : st === 'running' ? 'STOP' : 'START'}
                </button>
              </div>
            </div>
            {/* Description */}
            <div style={{
              fontSize: 11, color: 'var(--text-secondary)', marginBottom: viewMode === 'list' ? 0 : 10,
              display: '-webkit-box', WebkitLineClamp: viewMode === 'list' ? 1 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              flex: viewMode === 'list' ? 1 : 'none', paddingRight: viewMode === 'list' ? 16 : 0
            }}>
              {highlightText(mcp.description, search)}
            </div>
            {/* Badges e Infos à direita no modo list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: viewMode === 'list' ? 'auto' : '100%', justifyContent: viewMode === 'list' ? 'flex-end' : 'flex-start', flexShrink: 0, alignItems: 'center', marginBottom: viewMode === 'list' ? 0 : 8 }}>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 4 }}>
                <Tag label={mcp.type} color={TYPE_COLORS[mcp.type]} tooltip={BADGE_TOOLTIPS[mcp.type]} />
                <Tag label={mcp.origin} color="var(--accent)" tooltip={BADGE_TOOLTIPS[mcp.origin]} />
              </div>
              {/* Command preview (oculto no modo list se não tiver espaço) */}
              {mcp.command && viewMode !== 'list' && (
                <div style={{
                  background: 'var(--bg-root)', borderRadius: 5, padding: '5px 8px', marginBottom: 8,
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6, width: '100%'
                }}>
                  <span style={{ fontSize: 9, color: 'var(--text-ghost)', flexShrink: 0 }}>$</span>
                  <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mcp.command}</span>
                  <CopyBtn text={mcp.command} />
                </div>
              )}
              {/* Tools preview */}
              {viewMode !== 'list' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
                  {mcp.tools?.slice(0, 4).map(t => (
                    <span key={t} style={{ fontSize: 9, color: 'var(--text-dim)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace' }}>{t}</span>
                  ))}
                  {mcp.tools?.length > 4 && <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>+{mcp.tools.length - 4}</span>}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
