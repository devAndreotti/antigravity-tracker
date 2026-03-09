import { Workflow, WF_CAT_COLORS, Tag } from '../data'

interface Props {
  workflows: Workflow[]
  filter: string
  setFilter: (f: string) => void
}

function WFRow({ w }: { w: Workflow }) {
  return (
    <div className="wf-row" style={{
      display: 'grid', gridTemplateColumns: '200px 1fr auto auto', alignItems: 'center', gap: 16,
      padding: '10px 14px', borderRadius: 6, background: 'transparent', marginBottom: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 3, height: 20, borderRadius: 2, flexShrink: 0,
          background: WF_CAT_COLORS[w.category] || WF_CAT_COLORS.Default,
        }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: '#a3ff12', letterSpacing: '-0.01em' }}>
          {w.slug}
        </span>
      </div>
      <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {w.description}
      </span>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <Tag label={w.category} color={WF_CAT_COLORS[w.category] || WF_CAT_COLORS.Default} small />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: '#2d3748' }}>{w.uses} uses</span>
        <Tag label={w.origin} color={w.origin === 'global' ? '#a3ff12' : '#f97316'} small />
      </div>
    </div>
  )
}

export default function WorkflowsPage({ workflows, filter, setFilter }: Props) {
  const global = workflows.filter(w => w.origin === 'global')
  const local = workflows.filter(w => w.origin === 'local')

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['All', 'Global', 'Local'].map(f => (
          <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: 'inherit',
            cursor: 'pointer', background: filter === f ? '#a3ff1218' : 'transparent',
            color: filter === f ? '#a3ff12' : '#4a5568',
            border: filter === f ? '1px solid #a3ff1244' : '1px solid #ffffff0d',
          }}>{f}</button>
        ))}
      </div>

      {/* Seção GLOBAL */}
      {(filter === 'All' || filter === 'Global') && global.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#2d3748', letterSpacing: '0.12em', textTransform: 'uppercase' }}>GLOBAL</span>
            <div style={{ flex: 1, height: 1, background: '#ffffff06' }} />
            <span style={{ fontSize: 10, color: '#2d3748' }}>{global.length} workflows</span>
          </div>
          <div style={{ background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 8, overflow: 'hidden', padding: 4 }}>
            {global.map(w => <WFRow key={w.id} w={w} />)}
          </div>
        </div>
      )}

      {/* Seção LOCAL */}
      {(filter === 'All' || filter === 'Local') && local.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#2d3748', letterSpacing: '0.12em', textTransform: 'uppercase' }}>LOCAL</span>
            <div style={{ flex: 1, height: 1, background: '#ffffff06' }} />
            <span style={{ fontSize: 10, color: '#2d3748' }}>{local.length} workflows</span>
          </div>
          <div style={{ background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 8, overflow: 'hidden', padding: 4 }}>
            {local.map(w => <WFRow key={w.id} w={w} />)}
          </div>
        </div>
      )}
    </div>
  )
}
