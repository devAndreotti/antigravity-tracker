import { useState } from 'react'
import { type Skill, CATEGORY_COLORS, SKILLS, Tag, CopyBtn, BADGE_TOOLTIPS } from '../data'
import { highlightText } from '../utils/highlightText'

interface Props {
  skills: Skill[]
  allSkills: Skill[]
  search: string
  onSelect: (item: Skill, type: string) => void
  focusIndex?: number
}

export default function SkillsPage({ skills, allSkills, search, onSelect, focusIndex }: Props) {
  const [filter, setFilter] = useState('All')
  const [pinned, setPinned] = useState<string[]>(allSkills.filter(s => s.pinned).map(s => s.id))
  const categories = ['All', ...Array.from(new Set(allSkills.map(s => s.category)))]

  const displayed = skills.filter(s => filter === 'All' || s.category === filter)
  const pinnedSkills = displayed.filter(s => pinned.includes(s.id))
  const rest = displayed.filter(s => !pinned.includes(s.id))
  const allDisplayed = [...pinnedSkills, ...rest]

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPinned(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const SkillCard = ({ skill, isFocused }: { skill: Skill; isFocused: boolean }) => (
    <div onClick={() => onSelect(skill, 'skill')} className="card" style={{
      background: '#0a0f18', border: `1px solid ${isFocused ? '#a3ff1244' : '#ffffff0d'}`,
      borderRadius: 8, padding: '14px 16px', position: 'relative', overflow: 'hidden', cursor: 'pointer',
    }}>
      {/* Accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: CATEGORY_COLORS[skill.category] || '#4a5568', opacity: 0.7 }} />
      {/* Pin button */}
      <div style={{ position: 'absolute', top: 10, right: 12, opacity: 0 }} className="pin-btn">
        <button onClick={e => togglePin(skill.id, e)} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 2,
          color: pinned.includes(skill.id) ? '#a3ff12' : '#2d3748',
        }}>★</button>
      </div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6, marginTop: 4, paddingRight: 20 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
          {highlightText(skill.name, search)}
        </div>
        <span style={{ fontSize: 9, color: '#2d3748', flexShrink: 0, marginLeft: 8 }}>{skill.updated}</span>
      </div>
      {/* Description */}
      <div style={{
        fontSize: 11, color: '#64748b', lineHeight: 1.5, marginBottom: 10,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {highlightText(skill.description, search)}
      </div>
      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Tag label={skill.category} color={CATEGORY_COLORS[skill.category]} />
        <Tag label={skill.origin} color="#a3ff12" tooltip={BADGE_TOOLTIPS[skill.origin]} />
        {skill.tags?.slice(0, 2).map(t => <Tag key={t} label={t} small />)}
      </div>
    </div>
  )

  return (
    <div>
      <style>{`.card:hover .pin-btn { opacity: 1 !important; }`}</style>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer',
            letterSpacing: '0.03em',
            background: filter === c ? '#a3ff1218' : 'transparent',
            color: filter === c ? '#a3ff12' : '#4a5568',
            border: filter === c ? '1px solid #a3ff1244' : '1px solid #ffffff0d',
          }}>
            {c}{c !== 'All' && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>{allSkills.filter(s => s.category === c).length}</span>}
          </button>
        ))}
      </div>
      {/* Pinned section */}
      {pinnedSkills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#2d3748', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
            ★ PINNED <div style={{ flex: 1, height: 1, background: '#ffffff06' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {pinnedSkills.map((s, i) => <SkillCard key={s.id} skill={s} isFocused={focusIndex === i} />)}
          </div>
        </div>
      )}
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {rest.map((s, i) => <SkillCard key={s.id} skill={s} isFocused={focusIndex === (pinnedSkills.length + i)} />)}
      </div>
    </div>
  )
}
