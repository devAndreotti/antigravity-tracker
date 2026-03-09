import { Workspace, STACK_COLORS, DotStatus } from '../data'

interface Props {
  workspaces: Workspace[]
}

export default function WorkspacesPage({ workspaces }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {workspaces.map(ws => (
        <div key={ws.id} className="card" style={{
          background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 8,
          padding: '16px 18px', position: 'relative',
        }}>
          {/* Barra lateral de status */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            borderRadius: '8px 0 0 8px',
            background: ws.status === 'active' ? '#4ade80' : '#fbbf24', opacity: 0.7,
          }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
            <div>
              {/* Header do workspace */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                  {ws.name}
                </span>
                <DotStatus status={ws.status} />
                <span style={{ fontSize: 9, color: '#2d3748' }}>{ws.lastActive}</span>
              </div>

              <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 10 }}>{ws.description}</div>

              {/* Path do projeto */}
              <div style={{
                fontSize: 10, color: '#1e293b', fontFamily: 'monospace', marginBottom: 10,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {ws.path}
              </div>

              {/* Stack badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ws.stack?.map(s => (
                  <span key={s} style={{
                    fontSize: 10, color: STACK_COLORS[s] || '#64748b',
                    background: `${STACK_COLORS[s] || '#64748b'}12`,
                    border: `1px solid ${STACK_COLORS[s] || '#64748b'}22`,
                    borderRadius: 4, padding: '1px 7px', fontWeight: 500,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Contadores laterais */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {ws.hasAgents && (
                <div style={{ textAlign: 'center', padding: '8px 14px', background: '#4ade8010', border: '1px solid #4ade8022', borderRadius: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80', fontFamily: "'Syne', sans-serif" }}>●</div>
                  <div style={{ fontSize: 9, color: '#4ade8080', marginTop: 2, letterSpacing: '0.06em' }}>AGENTS</div>
                </div>
              )}
              <div style={{ textAlign: 'center', padding: '8px 14px', background: '#a3ff1210', border: '1px solid #a3ff1222', borderRadius: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#a3ff12', fontFamily: "'Syne', sans-serif" }}>{ws.workflows}</div>
                <div style={{ fontSize: 9, color: '#a3ff1280', marginTop: 2, letterSpacing: '0.06em' }}>WORKFLOWS</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 14px', background: '#60a5fa10', border: '1px solid #60a5fa22', borderRadius: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#60a5fa', fontFamily: "'Syne', sans-serif" }}>{ws.skills}</div>
                <div style={{ fontSize: 9, color: '#60a5fa80', marginTop: 2, letterSpacing: '0.06em' }}>SKILLS</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
