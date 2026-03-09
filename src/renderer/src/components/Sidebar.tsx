import { useTrackerStore } from '../stores/useTrackerStore'
import type { TabId } from '../types'

// Ícones SVG dos tabs
const tabIcons: Record<TabId, (active: boolean) => JSX.Element> = {
  skills: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  workflows: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  mcps: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </svg>
  ),
  workspaces: (active) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-accent)' : 'var(--color-text-muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  )
}

const tabLabels: Record<TabId, string> = {
  skills: 'Skills',
  workflows: 'Workflows',
  mcps: 'MCPs',
  workspaces: 'Workspaces'
}

export default function Sidebar() {
  const { activeTab, setTab, sidebarCollapsed, toggleSidebar, skills, workflows, mcps, workspaces } = useTrackerStore()

  const counts: Record<TabId, number> = {
    skills: skills.length,
    workflows: workflows.length,
    mcps: mcps.length,
    workspaces: workspaces.length
  }

  const tabs: TabId[] = ['skills', 'workflows', 'mcps', 'workspaces']

  return (
    <nav
      style={{
        width: sidebarCollapsed ? 64 : 200,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
        transition: `width var(--duration-slow) var(--ease-out-expo)`,
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Toggle collapse */}
      <button
        onClick={toggleSidebar}
        title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        style={{
          position: 'absolute',
          top: 16,
          right: sidebarCollapsed ? 'auto' : 12,
          left: sidebarCollapsed ? '50%' : 'auto',
          transform: sidebarCollapsed ? 'translateX(-50%)' : 'none',
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          transition: `all var(--duration-fast) ease`,
          zIndex: 2
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-hover)'
          e.currentTarget.style.color = 'var(--color-text-secondary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.color = 'var(--color-text-muted)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {sidebarCollapsed
            ? <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>
            : <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>
          }
        </svg>
      </button>

      {/* Espaço acima dos tabs */}
      <div style={{ height: 56 }} />

      {/* Tabs de navegação */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
        padding: `0 ${sidebarCollapsed ? '10px' : 'var(--space-sm)'}`
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              title={sidebarCollapsed ? `${tabLabels[tab]} (${counts[tab]})` : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: sidebarCollapsed ? '10px' : '10px 12px',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                background: isActive ? 'var(--color-accent-glow)' : 'transparent',
                border: isActive ? '1px solid var(--color-accent-border)' : '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: `all var(--duration-fast) ease`,
                width: '100%',
                textAlign: 'left',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-bg-hover)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {tabIcons[tab](isActive)}

              {!sidebarCollapsed && (
                <>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em'
                  }}>
                    {tabLabels[tab]}
                  </span>

                  <span style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: isActive ? 'var(--color-accent-dim)' : 'var(--color-text-muted)',
                    fontWeight: 500
                  }}>
                    {counts[tab]}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Footer da sidebar — versão */}
      <div style={{
        marginTop: 'auto',
        padding: 'var(--space-md)',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border-subtle)'
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-muted)',
          opacity: sidebarCollapsed ? 0 : 1,
          transition: `opacity var(--duration-fast) ease`
        }}>
          v0.1.0
        </span>
      </div>
    </nav>
  )
}
