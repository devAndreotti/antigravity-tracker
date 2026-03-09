import { useTrackerStore } from '../stores/useTrackerStore'
import Sidebar from './Sidebar'
import SearchBar from './SearchBar'
import SkillsPage from '../pages/SkillsPage'
import WorkflowsPage from '../pages/WorkflowsPage'
import McpsPage from '../pages/McpsPage'
import WorkspacesPage from '../pages/WorkspacesPage'

// Ícone SVG minimalista — logo Antigravity
function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="12" cy="12" r="4" fill="var(--color-accent)" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

const tabTitles = {
  skills: 'Skills',
  workflows: 'Workflows',
  mcps: 'MCPs',
  workspaces: 'Workspaces'
}

const tabDescriptions = {
  skills: 'Reusable capabilities and specialized knowledge',
  workflows: 'Step-by-step automation scripts',
  mcps: 'Model Context Protocol servers',
  workspaces: 'Active project directories'
}

export default function Layout() {
  const { activeTab, skills, workflows, mcps, workspaces, isLoading } = useTrackerStore()

  const counts = {
    skills: skills.length,
    workflows: workflows.length,
    mcps: mcps.length,
    workspaces: workspaces.length
  }

  // Renderiza a página ativa
  function renderPage() {
    switch (activeTab) {
      case 'skills': return <SkillsPage />
      case 'workflows': return <WorkflowsPage />
      case 'mcps': return <McpsPage />
      case 'workspaces': return <WorkspacesPage />
    }
  }

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', background: 'var(--color-bg-primary)' }}>
      {/* Sidebar esquerda */}
      <Sidebar />

      {/* Área de conteúdo principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header com drag region + search */}
        <header
          className="drag-region"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            padding: '0 var(--space-lg)',
            height: 56,
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-primary)',
            flexShrink: 0
          }}
        >
          <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Logo size={20} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              letterSpacing: '-0.02em'
            }}>
              Antigravity
            </span>
          </div>

          {/* Título da aba com contagem */}
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em'
              }}>
                {tabTitles[activeTab]}
              </h1>
              {!isLoading && (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-accent)',
                  background: 'var(--color-accent-glow)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 500
                }}>
                  {counts[activeTab]}
                </span>
              )}
            </div>
            <span style={{
              fontSize: 12,
              color: 'var(--color-text-muted)',
              letterSpacing: '-0.01em'
            }}>
              {tabDescriptions[activeTab]}
            </span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search bar */}
          <div className="no-drag" style={{ width: 280 }}>
            <SearchBar />
          </div>
        </header>

        {/* Content scrollável */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-lg)'
        }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              gap: 'var(--space-sm)'
            }}>
              <div style={{
                width: 16,
                height: 16,
                border: '2px solid var(--color-accent)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              Scanning assets…
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>
    </div>
  )
}
