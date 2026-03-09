import { Skill, CATEGORY_COLORS, SKILLS, Tag } from '../data'

interface Props {
  skills: Skill[]
  categories: string[]
  filter: string
  setFilter: (f: string) => void
}

export default function SkillsPage({ skills, categories, filter, setFilter }: Props) {
  return (
    <div>
      {/* Filtros por categoria */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} className="filter-btn" onClick={() => setFilter(c)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500,
            fontFamily: 'inherit', cursor: 'pointer', letterSpacing: '0.03em',
            background: filter === c ? '#a3ff1218' : 'transparent',
            color: filter === c ? '#a3ff12' : '#4a5568',
            border: filter === c ? '1px solid #a3ff1244' : '1px solid #ffffff0d',
          }}>
            {c}
            {c !== 'All' && (
              <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.6 }}>
                {SKILLS.filter(s => s.category === c).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {skills.map(skill => (
          <div key={skill.id} className="card" style={{
            background: '#0a0f18', border: '1px solid #ffffff0d', borderRadius: 8,
            padding: '14px 16px', position: 'relative', overflow: 'hidden',
          }}>
            {/* Linha de acento da categoria */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: CATEGORY_COLORS[skill.category] || '#4a5568', opacity: 0.7,
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, marginTop: 4 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                {skill.name}
              </div>
              <span style={{ fontSize: 9, color: '#4a5568', flexShrink: 0, marginLeft: 8, marginTop: 2 }}>
                {skill.updated}
              </span>
            </div>

            <div style={{
              fontSize: 11, color: '#64748b', lineHeight: 1.5, marginBottom: 10,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {skill.description}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              <Tag label={skill.category} color={CATEGORY_COLORS[skill.category]} />
              <Tag label={skill.origin} color="#a3ff12" />
              {skill.tags?.slice(0, 2).map(t => <Tag key={t} label={t} small />)}
            </div>

            <div style={{
              fontSize: 9, color: '#1e2d3d', fontFamily: 'monospace',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              borderTop: '1px solid #ffffff05', paddingTop: 8,
            }}>
              {skill.path}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
