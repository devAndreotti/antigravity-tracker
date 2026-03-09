import { Mcp, TYPE_COLORS, Tag, DotStatus } from '../data'

interface Props {
  mcps: Mcp[]
}

export default function McpsPage({ mcps }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
      {mcps.map(mcp => (
        <div key={mcp.id} className="card" style={{
          background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 8,
          padding: '14px 16px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Linha de acento do tipo */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: TYPE_COLORS[mcp.type] || '#4a5568', opacity: 0.6,
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.01em' }}>{mcp.name}</span>
            <DotStatus status={mcp.status} />
          </div>

          <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 10 }}>{mcp.description}</div>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            <Tag label={mcp.type} color={TYPE_COLORS[mcp.type]} />
            <Tag label={mcp.origin} color="#a3ff12" />
          </div>

          {/* Comando de execução */}
          {mcp.command && (
            <div style={{ background: '#060910', borderRadius: 5, padding: '6px 10px', marginBottom: 10, border: '1px solid #ffffff06' }}>
              <span style={{ fontSize: 9, color: '#2d3748', marginRight: 6 }}>$</span>
              <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>
                {mcp.command.length > 40 ? mcp.command.slice(0, 40) + '…' : mcp.command}
              </span>
            </div>
          )}

          {/* Lista de tools */}
          {mcp.tools && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {mcp.tools.map(t => (
                <span key={t} style={{
                  fontSize: 9, color: '#334155', background: '#ffffff05',
                  border: '1px solid #ffffff08', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
