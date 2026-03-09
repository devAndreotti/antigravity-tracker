import { useMemo, useState } from 'react'
import { useTrackerStore } from '../stores/useTrackerStore'
import StatusBadge from '../components/StatusBadge'

export default function McpsPage() {
  const { mcps, searchQuery } = useTrackerStore()

  const filtered = useMemo(() => {
    if (!searchQuery) return mcps
    const q = searchQuery.toLowerCase()
    return mcps.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.command.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q)
    )
  }, [mcps, searchQuery])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {filtered.length === 0 ? (
        <div style={{
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: 14
        }}>
          {searchQuery ? `No MCPs matching "${searchQuery}"` : 'No MCPs found'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'var(--space-md)'
        }}>
          {filtered.map((mcp, i) => (
            <McpCard key={mcp.id} mcp={mcp} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function McpCard({ mcp, index }: { mcp: any; index: number }) {
  const [hovered, setHovered] = useState(false)

  // Cor do gradiente baseada no tipo
  const typeHues: Record<string, number> = {
    node: 140,
    python: 210,
    docker: 200,
    url: 40,
    unknown: 0
  }
  const hue = typeHues[mcp.type] ?? 0

  return (
    <div
      className="animate-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--color-bg-surface)',
        border: `1px solid ${hovered ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: `all var(--duration-normal) var(--ease-out-expo)`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 30px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Header gradient */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, hsl(${hue}, 60%, 45%), hsl(${hue + 30}, 50%, 35%))`,
        opacity: hovered ? 1 : 0.6,
        transition: 'opacity 150ms ease'
      }} />

      <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {/* Nome e status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.02em'
          }}>
            {mcp.name}
          </h3>
          <StatusBadge label="unknown" variant="unknown" />
        </div>

        {/* Tipo */}
        <div style={{ display: 'flex', gap: 6 }}>
          <StatusBadge label={mcp.type} variant={mcp.type} />
          <StatusBadge label={mcp.origin} variant={mcp.origin} />
        </div>

        {/* Command */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-muted)',
          background: 'var(--color-bg-primary)',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          border: '1px solid var(--color-border-subtle)'
        }}
          title={`${mcp.command} ${mcp.args.join(' ')}`}
        >
          <span style={{ color: 'var(--color-accent)', opacity: 0.6 }}>$ </span>
          {mcp.command} {mcp.args.slice(0, 2).join(' ')}
          {mcp.args.length > 2 && '…'}
        </div>
      </div>
    </div>
  )
}
