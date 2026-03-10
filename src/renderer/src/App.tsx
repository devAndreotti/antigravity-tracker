import { useState, useEffect, useCallback } from 'react'
import SkillsPage from './pages/SkillsPage'
import WorkflowsPage from './pages/WorkflowsPage'
import McpsPage from './pages/McpsPage'
import WorkspacesPage from './pages/WorkspacesPage'
import SettingsPage from './pages/SettingsPage'
import CommandPalette from './components/CommandPalette'
import DetailPanel from './components/DetailPanel'
import RecentlyUsed, { type RecentItem } from './components/RecentlyUsed'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useTrackerStore } from './stores/useTrackerStore'
import {
  SKILLS as MOCK_SKILLS, WORKFLOWS as MOCK_WORKFLOWS,
  MCPS as MOCK_MCPS, WORKSPACES as MOCK_WORKSPACES,
  icons, type PageId,
} from './data'

// Detecta se é Mac ou Windows para mostrar atalhos corretos
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
const modKey = isMac ? '⌘' : 'Ctrl+'

export default function App() {
  const [page, setPage] = useState<PageId>('skills')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<{ item: any; type: string } | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [focusIndex, setFocusIndex] = useState(-1)

  // Zustand store — dados reais do filesystem
  const store = useTrackerStore()
  const isElectron = typeof window !== 'undefined' && !!window.api?.scan
  const theme = store.config?.theme || 'dark'

  // Aplica tema no document root
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  // Dados: Electron → sempre store (mesmo vazio enquanto carrega), Browser → mock
  // Isso evita o flash de dados mock por ~500ms antes do scan real completar
  const SKILLS = isElectron ? store.skills : MOCK_SKILLS
  const WORKFLOWS = isElectron ? store.workflows : MOCK_WORKFLOWS
  const MCPS = isElectron ? store.mcps : MOCK_MCPS
  const WORKSPACES = isElectron ? (store.workspaces as any[]) : MOCK_WORKSPACES

  // Carrega dados reais ao iniciar
  useEffect(() => {
    if (!isElectron) return
    store.fetchAll()
    store.loadConfig()
    // Escuta atualizações do watcher
    const unsub = window.api.onUpdate(({ data }) => {
      if (data) {
        useTrackerStore.setState({
          skills: data.skills || [],
          workflows: data.workflows || [],
          mcps: data.mcps || [],
          workspaces: data.workspaces || [],
          lastScan: new Date(),
        })
      }
    })
    return unsub
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtragem global
  const q = search.toLowerCase()
  const filteredSkills = SKILLS.filter((s: any) => !q || s.name?.includes(q) || s.description?.toLowerCase().includes(q) || s.tags?.some((t: string) => t.includes(q)))
  const filteredWorkflows = WORKFLOWS.filter((w: any) => !q || w.slug?.includes(q) || w.description?.toLowerCase().includes(q))
  const filteredMcps = MCPS.filter((m: any) => !q || m.name?.includes(q) || m.description?.toLowerCase().includes(q))
  const filteredWorkspaces = WORKSPACES.filter((w: any) => !q || w.name?.includes(q) || w.description?.toLowerCase().includes(q))

  // Contagem de itens por página para keyboard nav
  const pageItemCounts: Record<string, number> = {
    skills: filteredSkills.length,
    workflows: filteredWorkflows.length,
    mcps: filteredMcps.length,
    workspaces: filteredWorkspaces.length,
    settings: 0,
  }

  // Selecionar item → detail panel + add to recent
  const handleSelect = useCallback((item: any, type: string) => {
    setDetail({ item, type })
    const label = item.name || item.slug || item.id
    setRecent(prev => {
      const filtered = prev.filter(r => !(r.id === item.id && r.type === type))
      return [{ id: item.id, label, type: type as any, category: item.category || '' }, ...filtered].slice(0, 5)
    })
  }, [])

  // Handler para selecionar recent item
  const handleRecentSelect = useCallback((item: RecentItem) => {
    const sourceMap: Record<string, any[]> = { skill: SKILLS, workflow: WORKFLOWS, mcp: MCPS, workspace: WORKSPACES }
    const found = sourceMap[item.type]?.find(x => x.id === item.id)
    if (found) {
      const pageMap: Record<string, PageId> = { skill: 'skills', workflow: 'workflows', mcp: 'mcps', workspace: 'workspaces' }
      setPage(pageMap[item.type])
      setDetail({ item: found, type: item.type })
    }
  }, [])

  // Navegar via Detail Panel (ex: clicar workflow no workspace detail)
  const handleDetailNavigate = useCallback((targetPage: PageId, itemId?: string) => {
    setPage(targetPage)
    if (itemId) {
      const sourceMap: Record<string, any[]> = { workflows: WORKFLOWS, skills: SKILLS, mcps: MCPS, workspaces: WORKSPACES }
      const found = sourceMap[targetPage]?.find(x => x.id === itemId || x.slug === itemId)
      if (found) {
        const typeMap: Record<string, string> = { workflows: 'workflow', skills: 'skill', mcps: 'mcp', workspaces: 'workspace' }
        handleSelect(found, typeMap[targetPage])
      }
    }
  }, [handleSelect])

  // Navegar workflow a partir do WorkspacesPage
  const handleNavigateWorkflow = useCallback((slug: string) => {
    setPage('workflows')
    const found = WORKFLOWS.find(w => w.slug === slug)
    if (found) handleSelect(found, 'workflow')
  }, [handleSelect])

  // Keyboard navigation global
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      // ⌘K = Command Palette
      if (meta && e.key === 'k') { e.preventDefault(); setShowPalette(p => !p); return }
      // ⌘1-5 = trocar aba
      if (meta && e.key >= '1' && e.key <= '5') {
        e.preventDefault()
        const pages: PageId[] = ['skills', 'workflows', 'mcps', 'workspaces', 'settings']
        const idx = parseInt(e.key) - 1
        if (pages[idx]) { setPage(pages[idx]); setDetail(null); setFocusIndex(-1) }
        return
      }
      // Escape
      if (e.key === 'Escape') {
        if (showPalette) { setShowPalette(false); return }
        if (detail) { setDetail(null); return }
        if (search) { setSearch(''); return }
        setFocusIndex(-1)
        return
      }
      // ↑↓ = navegar itens
      if (e.key === 'ArrowDown' && !showPalette) {
        e.preventDefault()
        setFocusIndex(i => Math.min(i + 1, (pageItemCounts[page] || 1) - 1))
        return
      }
      if (e.key === 'ArrowUp' && !showPalette) {
        e.preventDefault()
        setFocusIndex(i => Math.max(i - 1, 0))
        return
      }
      // ↵ = abrir item em foco
      if (e.key === 'Enter' && focusIndex >= 0 && !showPalette) {
        const itemArrays: Record<string, any[]> = {
          skills: filteredSkills, workflows: filteredWorkflows,
          mcps: filteredMcps, workspaces: filteredWorkspaces,
        }
        const items = itemArrays[page]
        if (items && items[focusIndex]) {
          const typeMap: Record<string, string> = { skills: 'skill', workflows: 'workflow', mcps: 'mcp', workspaces: 'workspace' }
          handleSelect(items[focusIndex], typeMap[page])
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [page, showPalette, detail, search, focusIndex, filteredSkills, filteredWorkflows, filteredMcps, filteredWorkspaces, handleSelect, pageItemCounts])

  // Reset focus ao trocar de página
  useEffect(() => { setFocusIndex(-1) }, [page])

  const pages: { id: PageId; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'skills', label: 'Skills', count: SKILLS.length, icon: icons.skills },
    { id: 'workflows', label: 'Workflows', count: WORKFLOWS.length, icon: icons.workflows },
    { id: 'mcps', label: 'MCPs', count: MCPS.length, icon: icons.mcps },
    { id: 'workspaces', label: 'Workspaces', count: WORKSPACES.length, icon: icons.workspaces },
    { id: 'settings', label: 'Settings', count: 0, icon: icons.settings },
  ]

  const pageTitles: Record<string, [string, string]> = {
    skills: ['Skills', 'Reusable capabilities & specialized knowledge'],
    workflows: ['Workflows', 'Step-by-step automation scripts'],
    mcps: ['MCPs', 'Model Context Protocol servers'],
    workspaces: ['Workspaces', 'Active project directories'],
    settings: ['Settings', 'Application configuration'],
  }

  return (
    <ErrorBoundary>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', background: 'var(--bg-root)', color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", overflow: 'hidden' }}>

      {/* Command Palette */}
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} onNavigate={setPage} onSelect={handleSelect} />}

      {/* HEADER */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 44,
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
        WebkitAppRegion: 'drag' as any,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a3ff12', boxShadow: '0 0 8px #a3ff12' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#a3ff12', letterSpacing: '0.15em', fontFamily: "'Syne', sans-serif" }}>ANTIGRAVITY</span>
          <span style={{ color: '#ffffff10', fontSize: 16, margin: '0 2px' }}>/</span>
          <span style={{ fontSize: 10, color: '#334155' }}>{pageTitles[page]?.[0].toLowerCase()}</span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 320, position: 'relative', WebkitAppRegion: 'no-drag' as any }}>
          <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2d3748" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter assets..."
            style={{ width: '100%', height: 30, background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 6, paddingLeft: 28, paddingRight: 10, color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'inherit' }} />
        </div>

        {/* Quick search button */}
        <button onClick={() => setShowPalette(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6,
          color: 'var(--text-dim)', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit',
          WebkitAppRegion: 'no-drag' as any,
        }}>
          Quick search
          <span style={{ background: 'var(--accent-bg)', padding: '1px 4px', borderRadius: 3, fontSize: 9, color: 'var(--accent)' }}>{modKey}K</span>
        </button>

        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: '#1e293b', letterSpacing: '0.08em' }}>v9.1.0</span>

        {/* Window controls */}
        <div style={{ display: 'flex', gap: 5, WebkitAppRegion: 'no-drag' as any }}>
          <div onClick={() => (window as any).api?.minimize()} style={{ width: 9, height: 9, borderRadius: '50%', background: '#fbbf24', opacity: 0.5, cursor: 'pointer' }} />
          <div onClick={() => (window as any).api?.maximize()} style={{ width: 9, height: 9, borderRadius: '50%', background: '#4ade80', opacity: 0.5, cursor: 'pointer' }} />
          <div onClick={() => (window as any).api?.close()} style={{ width: 9, height: 9, borderRadius: '50%', background: '#f87171', opacity: 0.5, cursor: 'pointer' }} />
        </div>
      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <div style={{ width: 188, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', padding: '12px 0', flexShrink: 0 }}>
          {pages.map((p, i) => (
            <div key={p.id} onClick={() => { setPage(p.id); setDetail(null) }} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', margin: '1px 8px',
              borderRadius: 6, cursor: 'pointer', fontSize: 12, transition: 'all 0.15s',
              background: page === p.id ? 'var(--accent-bg)' : 'transparent',
              color: page === p.id ? 'var(--accent)' : 'var(--text-dim)',
              borderLeft: page === p.id ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: page === p.id ? 600 : 400,
            }}
              onMouseEnter={e => page !== p.id && (e.currentTarget.style.background = 'var(--border-faint)')}
              onMouseLeave={e => page !== p.id && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ flexShrink: 0 }}>{p.icon}</span>
              <span style={{ flex: 1 }}>{p.label}</span>
              {p.count > 0 && (
                <span style={{ fontSize: 10, color: page === p.id ? 'var(--accent)' : 'var(--text-ghost)', opacity: page === p.id ? 0.6 : 1, background: 'var(--border-faint)', padding: '0 4px', borderRadius: 3 }}>{p.count}</span>
              )}
            </div>
          ))}

          {/* Atalhos de teclado */}
          <div style={{ padding: '6px 20px', marginTop: 4 }}>
            {pages.map((p, i) => (
              <div key={p.id} style={{ fontSize: 9, color: 'var(--text-ghost)', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>{p.label}</span>
                <span style={{ color: 'var(--text-faint)' }}>{modKey}{i + 1}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Ecosystem stats */}
          <div style={{ margin: '0 12px 8px', padding: 10, background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-faint)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-ghost)', letterSpacing: '0.1em', marginBottom: 7, textTransform: 'uppercase' }}>Ecosystem</div>
            {[
              ['Skills', SKILLS.length, '#a78bfa'],
              ['Workflows', WORKFLOWS.length, 'var(--accent)'],
              ['MCPs', MCPS.length, '#60a5fa'],
              ['Workspaces', WORKSPACES.length, '#f97316'],
            ].map(([l, n, c]) => (
              <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-faint)', marginBottom: 3 }}>
                <span>{l}</span><span style={{ color: c as string, fontWeight: 600 }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Page header */}
          <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid var(--border-faint)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{pageTitles[page]?.[0]}</div>
              <div style={{ fontSize: 10, color: '#2d3748', marginTop: 1 }}>{pageTitles[page]?.[1]}</div>
            </div>
            {search && <div style={{ fontSize: 10, color: '#334155' }}>Filtering by "<span style={{ color: '#a3ff12' }}>{search}</span>"</div>}
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 18px' }}>
            {/* Recently Used */}
            {page !== 'settings' && <RecentlyUsed items={recent} onSelect={handleRecentSelect} />}

            {page === 'skills' && <SkillsPage skills={filteredSkills} allSkills={SKILLS} search={search} onSelect={handleSelect} focusIndex={focusIndex} />}
            {page === 'workflows' && <WorkflowsPage workflows={filteredWorkflows} allWorkflows={WORKFLOWS} search={search} onSelect={handleSelect} focusIndex={focusIndex} />}
            {page === 'mcps' && <McpsPage mcps={filteredMcps} search={search} onSelect={handleSelect} focusIndex={focusIndex} />}
            {page === 'workspaces' && <WorkspacesPage workspaces={filteredWorkspaces} search={search} onSelect={handleSelect} onNavigateWorkflow={handleNavigateWorkflow} focusIndex={focusIndex} />}
            {page === 'settings' && <SettingsPage />}
          </div>
        </div>

        {/* DETAIL PANEL */}
        {detail && <DetailPanel item={detail.item} type={detail.type} onClose={() => setDetail(null)} onNavigate={handleDetailNavigate} />}
      </div>

      {/* STATUS BAR */}
      <div style={{ height: 24, background: 'var(--bg-surface)', borderTop: '1px solid var(--border-faint)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: 'var(--text-faint)' }}>watching</span>
        </div>
        <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>Last scan: {store.lastScan ? store.lastScan.toLocaleTimeString() : 'just now'}</span>
        <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>•</span>
        <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>{SKILLS.length + WORKFLOWS.length + MCPS.length + WORKSPACES.length} total assets</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>{modKey}K quick search</span>
        <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>•</span>
        <span style={{ fontSize: 9, color: 'var(--text-ghost)' }}>click any item for details</span>
      </div>
    </div>
    </ErrorBoundary>
  )
}
