import { type Workspace, STACK_COLORS, DotStatus } from '../data'
import { highlightText } from '../utils/highlightText'

interface Props {
  workspaces: any[] // Aceita tanto mock Workspace quanto ScannedWorkspace
  search: string
  onSelect: (item: any, type: string) => void
  onNavigateWorkflow?: (slug: string) => void
  focusIndex?: number
}

export default function WorkspacesPage({ workspaces, search, onSelect, onNavigateWorkflow, focusIndex }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {workspaces.map((ws, i) => {
        const isFocused = focusIndex === i
        // Normaliza workflows — pode ser string[] (mock) ou ParsedWorkflow[] (real)
        const workflowList: string[] = (ws.workflows || []).map((w: any) =>
          typeof w === 'string' ? w : w?.slug || w?.id || ''
        ).filter(Boolean)

        return (
          <div key={ws.id} onClick={() => onSelect(ws, 'workspace')} className="card" style={{
            background: '#0a0f18', border: `1px solid ${isFocused ? '#a3ff1244' : '#ffffff0d'}`,
            borderRadius: 8, padding: '16px 18px', position: 'relative', cursor: 'pointer',
          }}>
            {/* Status bar lateral */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '8px 0 0 8px',
              background: ws.status === 'active' ? '#4ade80' : ws.status === 'idle' ? '#fbbf24' : '#6b7280', opacity: 0.7,
            }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
                    {highlightText(ws.name, search)}
                  </span>
                  <DotStatus status={ws.status || 'active'} />
                  <span style={{ fontSize: 9, color: '#2d3748' }}>{ws.lastActive || ''}</span>
                </div>
                {/* Description ou Path */}
                <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 8 }}>
                  {ws.description
                    ? highlightText(ws.description, search)
                    : <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#2d3748' }}>{ws.path || ''}</span>
                  }
                </div>
                {/* Stack badges (só se existir) */}
                {ws.stack && ws.stack.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                    {ws.stack.map((s: string) => (
                      <span key={s} style={{
                        fontSize: 10, color: STACK_COLORS[s] || '#64748b',
                        background: `${STACK_COLORS[s] || '#64748b'}12`,
                        border: `1px solid ${STACK_COLORS[s] || '#64748b'}22`,
                        borderRadius: 4, padding: '1px 7px', fontWeight: 500,
                      }}>{s}</span>
                    ))}
                  </div>
                )}
                {/* Workflow badges (clicáveis) */}
                {workflowList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {workflowList.map((w: string) => (
                      <span key={w} onClick={e => { e.stopPropagation(); onNavigateWorkflow?.(w) }}
                        style={{
                          fontSize: 10, color: '#a3ff12', background: '#a3ff1208',
                          border: '1px solid #a3ff1218', borderRadius: 4, padding: '1px 7px',
                          fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#a3ff1218'; e.currentTarget.style.borderColor = '#a3ff1244' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#a3ff1208'; e.currentTarget.style.borderColor = '#a3ff1218' }}
                      >{w}</span>
                    ))}
                  </div>
                )}
                {/* Agents badge */}
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {ws.hasAgents && (
                    <span style={{ fontSize: 9, color: '#4ade80', background: '#4ade8010', border: '1px solid #4ade8022', borderRadius: 4, padding: '1px 6px' }}>HAS AGENTS</span>
                  )}
                  {ws.hasAgentsMd && (
                    <span style={{ fontSize: 9, color: '#60a5fa', background: '#60a5fa10', border: '1px solid #60a5fa22', borderRadius: 4, padding: '1px 6px' }}>AGENTS.MD</span>
                  )}
                </div>
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: 'center', padding: '8px 12px', background: '#a3ff1210', border: '1px solid #a3ff1222', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#a3ff12', fontFamily: "'Syne', sans-serif" }}>{workflowList.length}</div>
                  <div style={{ fontSize: 9, color: '#a3ff1270', marginTop: 1, letterSpacing: '0.06em' }}>WF</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
