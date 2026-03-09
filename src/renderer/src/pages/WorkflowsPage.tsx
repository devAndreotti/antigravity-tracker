import { useState } from 'react'
import { type Workflow, WF_CAT_COLORS, Tag, CopyBtn, BADGE_TOOLTIPS } from '../data'
import { highlightText } from '../utils/highlightText'
import Sparkline from '../components/Sparkline'

interface Props {
  workflows: Workflow[]
  allWorkflows: Workflow[]
  search: string
  onSelect: (item: Workflow, type: string) => void
  focusIndex?: number
}

function WFRow({ w, isExpanded, onToggle, onSelect, search, isFocused }: {
  w: Workflow; isExpanded: boolean; onToggle: () => void; onSelect: () => void
  search: string; isFocused: boolean
}) {
  return (
    <div>
      <div onClick={() => { onToggle(); onSelect() }} style={{
        display: 'grid', gridTemplateColumns: '180px 1fr 40px 80px 100px',
        alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
        background: isExpanded ? '#0d1219' : 'transparent', transition: 'background 0.1s',
        border: isFocused ? '1px solid #a3ff1244' : '1px solid transparent',
      }}
        onMouseEnter={e => !isExpanded && (e.currentTarget.style.background = '#0a0f14')}
        onMouseLeave={e => !isExpanded && (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: WF_CAT_COLORS[w.category] || '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#a3ff12', letterSpacing: '-0.01em' }}>
            {highlightText(w.slug, search)}
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#4a5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {highlightText(w.description, search)}
        </span>
        <Sparkline id={w.id} />
        <div><Tag label={w.category} color={WF_CAT_COLORS[w.category] || '#94a3b8'} small /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 9, color: '#1e293b' }}>{w.uses}×</span>
          <CopyBtn text={w.slug} label="SLUG" />
        </div>
      </div>
      {/* Expanded */}
      {isExpanded && (
        <div style={{ padding: '10px 12px 12px 24px', background: '#0d1219', borderTop: '1px solid #ffffff06', marginTop: -2 }}>
          <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>{w.description}</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#2d3748' }}>Last used: <span style={{ color: '#4a5568' }}>{w.lastUsed || '—'}</span></span>
            <span style={{ fontSize: 10, color: '#2d3748' }}>Total: <span style={{ color: '#a3ff12' }}>{w.uses} uses</span></span>
            <Tag label={w.origin} color={w.origin === 'global' ? '#a3ff12' : '#f97316'} small tooltip={BADGE_TOOLTIPS[w.origin]} />
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ label, items, count, search, expanded, setExpanded, onSelect, focusIndex, startIdx }: {
  label: string; items: Workflow[]; count: string; search: string
  expanded: string | null; setExpanded: (v: string | null) => void
  onSelect: (item: Workflow, type: string) => void
  focusIndex?: number; startIdx: number
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#2d3748', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: '#ffffff06' }} />
        <span style={{ fontSize: 10, color: '#2d3748' }}>{count}</span>
      </div>
      <div style={{ background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 8, overflow: 'hidden', padding: 4 }}>
        {items.map((w, i) => (
          <WFRow key={w.id} w={w} search={search}
            isExpanded={expanded === w.id}
            isFocused={focusIndex === (startIdx + i)}
            onToggle={() => setExpanded(expanded === w.id ? null : w.id)}
            onSelect={() => onSelect(w, 'workflow')} />
        ))}
      </div>
    </div>
  )
}

export default function WorkflowsPage({ workflows, allWorkflows, search, onSelect, focusIndex }: Props) {
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const displayed = workflows.filter(w => filter === 'All' || (filter === 'Global' ? w.origin === 'global' : w.origin === 'local'))
  const global = displayed.filter(w => w.origin === 'global')
  const local = displayed.filter(w => w.origin === 'local')

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['All', 'Global', 'Local'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
            background: filter === f ? '#a3ff1218' : 'transparent',
            color: filter === f ? '#a3ff12' : '#4a5568',
            border: filter === f ? '1px solid #a3ff1244' : '1px solid #ffffff0d',
          }}>{f}</button>
        ))}
      </div>
      {(filter === 'All' || filter === 'Global') && global.length > 0 && (
        <Section label="GLOBAL" items={global} count={`${global.length} workflows`} search={search}
          expanded={expanded} setExpanded={setExpanded} onSelect={onSelect}
          focusIndex={focusIndex} startIdx={0} />
      )}
      {(filter === 'All' || filter === 'Local') && local.length > 0 && (
        <Section label="LOCAL" items={local} count={`${local.length} workflows`} search={search}
          expanded={expanded} setExpanded={setExpanded} onSelect={onSelect}
          focusIndex={focusIndex} startIdx={global.length} />
      )}
    </div>
  )
}
