import { useMemo, useState } from 'react'
import { useTrackerStore } from '../stores/useTrackerStore'
import StatusBadge from '../components/StatusBadge'

export default function WorkspacesPage() {
  const { workspaces, searchQuery } = useTrackerStore()

  const filtered = useMemo(() => {
    if (!searchQuery) return workspaces
    const q = searchQuery.toLowerCase()
    return workspaces.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.uri.toLowerCase().includes(q) ||
      w.corpusName.toLowerCase().includes(q)
    )
  }, [workspaces, searchQuery])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {filtered.length === 0 ? (
        <div style={{
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: 14
        }}>
          {searchQuery ? `No workspaces matching "${searchQuery}"` : 'No workspaces found'}
        </div>
      ) : (
        filtered.map((ws, i) => (
          <WorkspaceRow key={ws.id} workspace={ws} index={i} />
        ))
      )}
    </div>
  )
}

function WorkspaceRow({ workspace: ws, index }: { workspace: any; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="animate-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
        background: hovered ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
        border: `1px solid ${hovered ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: `all var(--duration-fast) ease`,
        animationDelay: `${index * 30}ms`
      }}
    >
      {/* Ícone de folder */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-md)',
        background: ws.hasAgents ? 'var(--color-accent-glow)' : 'var(--color-bg-active)',
        border: `1px solid ${ws.hasAgents ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={ws.hasAgents ? 'var(--color-accent)' : 'var(--color-text-muted)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em'
        }}>
          {ws.name}
        </div>
        <div
          title={ws.uri}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {ws.uri}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {ws.hasAgents && <StatusBadge label="agents" variant="running" />}
        {ws.localWorkflows.length > 0 && (
          <StatusBadge label={`${ws.localWorkflows.length} workflows`} variant="local" />
        )}
      </div>
    </div>
  )
}
