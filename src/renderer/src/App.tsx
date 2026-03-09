import { useState } from 'react'
import SkillsPage from './pages/SkillsPage'
import WorkflowsPage from './pages/WorkflowsPage'
import McpsPage from './pages/McpsPage'
import WorkspacesPage from './pages/WorkspacesPage'
import {
  SKILLS, WORKFLOWS, MCPS, WORKSPACES,
  icons, PageId,
  type Skill, type Workflow, type Mcp, type Workspace
} from './data'

export default function App() {
  const [page, setPage] = useState<PageId>('skills')
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('All')
  const [workflowFilter, setWorkflowFilter] = useState('All')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Filtro genérico por busca
  const filtered = <T extends { description?: string; [k: string]: any }>(arr: T[], key = 'name'): T[] =>
    arr.filter(i =>
      !search ||
      String(i[key] ?? '').toLowerCase().includes(search.toLowerCase()) ||
      String(i.description ?? '').toLowerCase().includes(search.toLowerCase())
    )

  const skillCategories = ['All', ...Array.from(new Set(SKILLS.map(s => s.category)))]
  const filteredSkills = filtered(SKILLS).filter(s => skillFilter === 'All' || s.category === skillFilter)
  const filteredWorkflows = filtered(WORKFLOWS, 'slug').filter(w =>
    workflowFilter === 'All' || (workflowFilter === 'Global' ? w.origin === 'global' : w.origin === 'local')
  )

  const pages = [
    { id: 'skills' as PageId, label: 'Skills', count: SKILLS.length, icon: icons.skills },
    { id: 'workflows' as PageId, label: 'Workflows', count: WORKFLOWS.length, icon: icons.workflows },
    { id: 'mcps' as PageId, label: 'MCPs', count: MCPS.length, icon: icons.mcps },
    { id: 'workspaces' as PageId, label: 'Workspaces', count: WORKSPACES.length, icon: icons.workspaces },
  ]

  const pageTitles: Record<PageId, { title: string; sub: string }> = {
    skills: { title: 'Skills', sub: 'Reusable capabilities & specialized knowledge' },
    workflows: { title: 'Workflows', sub: 'Step-by-step automation scripts' },
    mcps: { title: 'MCPs', sub: 'Model Context Protocol servers' },
    workspaces: { title: 'Workspaces', sub: 'Active project directories' },
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh', width: '100%',
      background: '#080B10', color: '#e2e8f0',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      overflow: 'hidden',
    }}>

      {/* ─── TOP HEADER ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 48, background: '#080B10',
        borderBottom: '1px solid #ffffff0a', flexShrink: 0, gap: 16,
        WebkitAppRegion: 'drag' as any,
      }}>
        {/* Esquerda: Logo + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200, WebkitAppRegion: 'no-drag' as any }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#a3ff12', boxShadow: '0 0 10px #a3ff1288' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#a3ff12', letterSpacing: '0.12em', fontFamily: "'Syne', sans-serif" }}>ANTIGRAVITY</span>
          <span style={{ color: '#ffffff15', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.06em' }}>{pageTitles[page].title.toLowerCase()}</span>
          <span style={{ fontSize: 10, color: '#4a5568', background: '#ffffff08', border: '1px solid #ffffff0a', borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>
            {pages.find(p => p.id === page)?.count}
          </span>
        </div>

        {/* Centro: search */}
        <div style={{ flex: 1, maxWidth: 360, position: 'relative', WebkitAppRegion: 'no-drag' as any }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a5568' }}>{icons.search}</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            style={{
              width: '100%', height: 32, background: '#0d1219', border: '1px solid #ffffff0d',
              borderRadius: 6, paddingLeft: 32, paddingRight: 12, color: '#e2e8f0',
              fontSize: 12, fontFamily: 'inherit',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontSize: 14,
            }}>×</button>
          )}
        </div>

        {/* Direita: versão + window controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, WebkitAppRegion: 'no-drag' as any }}>
          <span style={{ fontSize: 10, color: '#2d3748', letterSpacing: '0.08em' }}>v0.1.0</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#fbbf24', '#4ade80', '#f87171'].map((c, i) => (
              <div
                key={i}
                onClick={() => {
                  if (i === 0) window.api?.window.minimize()
                  if (i === 2) window.api?.window.close()
                }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.6, cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── SIDEBAR ─── */}
        <div style={{
          width: sidebarOpen ? 200 : 56, background: '#080B10', borderRight: '1px solid #ffffff0a',
          display: 'flex', flexDirection: 'column', padding: '16px 0', flexShrink: 0,
          transition: 'width 0.2s', overflow: 'hidden',
        }}>
          {pages.map(p => (
            <div
              key={p.id} className="nav-item"
              onClick={() => setPage(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
                margin: '1px 8px', borderRadius: 6, cursor: 'pointer',
                background: page === p.id ? '#a3ff1212' : 'transparent',
                color: page === p.id ? '#a3ff12' : '#64748b',
                borderLeft: page === p.id ? '2px solid #a3ff12' : '2px solid transparent',
                fontSize: 12, fontWeight: page === p.id ? 600 : 400, letterSpacing: '0.02em',
                whiteSpace: 'nowrap', overflow: 'hidden',
              }}
            >
              <span style={{ flexShrink: 0 }}>{p.icon}</span>
              {sidebarOpen && (
                <>
                  <span style={{ flex: 1 }}>{p.label}</span>
                  <span style={{
                    fontSize: 10, color: page === p.id ? '#a3ff1288' : '#2d3748',
                    background: '#ffffff06', padding: '1px 5px', borderRadius: 3,
                  }}>{p.count}</span>
                </>
              )}
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {/* Resumo do ecossistema */}
          {sidebarOpen && (
            <div style={{ margin: '0 12px 12px', padding: 10, background: '#0a0f18', borderRadius: 6, border: '1px solid #ffffff08' }}>
              <div style={{ fontSize: 9, color: '#2d3748', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>Ecosystem</div>
              {([['Skills', SKILLS.length], ['Workflows', WORKFLOWS.length], ['MCPs', MCPS.length]] as const).map(([l, n]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4a5568', marginBottom: 4 }}>
                  <span>{l}</span>
                  <span style={{ color: '#a3ff12', fontWeight: 600 }}>{n}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: '0 16px 4px', fontSize: 9, color: '#1e293b', textAlign: 'center' }}>v0.1.0</div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header da página */}
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #ffffff06', flexShrink: 0 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              {pageTitles[page].title}
            </div>
            <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{pageTitles[page].sub}</div>
          </div>

          {/* Conteúdo da página */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
            {page === 'skills' && <SkillsPage skills={filteredSkills} categories={skillCategories} filter={skillFilter} setFilter={setSkillFilter} />}
            {page === 'workflows' && <WorkflowsPage workflows={filteredWorkflows} filter={workflowFilter} setFilter={setWorkflowFilter} />}
            {page === 'mcps' && <McpsPage mcps={filtered(MCPS)} />}
            {page === 'workspaces' && <WorkspacesPage workspaces={filtered(WORKSPACES)} />}
          </div>
        </div>
      </div>
    </div>
  )
}
