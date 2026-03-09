import { useMemo, useState } from 'react'
import { useTrackerStore } from '../stores/useTrackerStore'
import StatusBadge from '../components/StatusBadge'

export default function WorkflowsPage() {
  const { workflows, searchQuery } = useTrackerStore()
  const [scopeFilter, setScopeFilter] = useState<'all' | 'global' | 'local'>('all')

  const filtered = useMemo(() => {
    let result = workflows
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(w =>
        w.slug.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        (w.workspace && w.workspace.toLowerCase().includes(q))
      )
    }
    if (scopeFilter !== 'all') {
      result = result.filter(w => w.scope === scopeFilter)
    }
    return result
  }, [workflows, searchQuery, scopeFilter])

  // Agrupa por scope para exibição
  const globalWorkflows = filtered.filter(w => w.scope === 'global')
  const localWorkflows = filtered.filter(w => w.scope === 'local')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Filtro de scope */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        {(['all', 'global', 'local'] as const).map(scope => (
          <button
            key={scope}
            onClick={() => setScopeFilter(scope)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${scopeFilter === scope ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
              background: scopeFilter === scope ? 'var(--color-accent-glow)' : 'transparent',
              color: scopeFilter === scope ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: scopeFilter === scope ? 600 : 400,
              cursor: 'pointer',
              transition: `all var(--duration-fast) ease`,
              textTransform: 'capitalize'
            }}
          >
            {scope === 'all' ? 'All' : scope}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: 14
        }}>
          {searchQuery ? `No workflows matching "${searchQuery}"` : 'No workflows found'}
        </div>
      ) : (
        <>
          {/* Workflows globais */}
          {globalWorkflows.length > 0 && (
            <section>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-sm)'
              }}>
                Global
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                {globalWorkflows.map((wf, i) => (
                  <WorkflowRow key={wf.id} workflow={wf} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Workflows locais */}
          {localWorkflows.length > 0 && (
            <section>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-sm)'
              }}>
                Local
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                {localWorkflows.map((wf, i) => (
                  <WorkflowRow key={wf.id} workflow={wf} index={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

// Componente de linha de workflow
function WorkflowRow({ workflow: wf, index }: { workflow: any; index: number }) {
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
        padding: '12px var(--space-md)',
        background: hovered ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
        border: `1px solid ${hovered ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: `all var(--duration-fast) ease`,
        animationDelay: `${index * 30}ms`
      }}
    >
      {/* Slug clicável */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--color-accent)',
        minWidth: 140,
        flexShrink: 0
      }}>
        {wf.slug}
      </span>

      {/* Descrição */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {wf.description}
      </span>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <StatusBadge label={wf.scope} variant={wf.scope} />
        {wf.workspace && <StatusBadge label={wf.workspace} variant="custom" />}
      </div>
    </div>
  )
}
