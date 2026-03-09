import { useMemo, useState } from 'react'
import { useTrackerStore } from '../stores/useTrackerStore'
import ItemCard from '../components/ItemCard'

// Categorias para filtro
const ALL_CATEGORIES = 'All'

export default function SkillsPage() {
  const { skills, searchQuery, viewMode } = useTrackerStore()
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES)

  // Filtra por busca e categoria
  const filtered = useMemo(() => {
    let result = skills
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
    }
    if (selectedCategory !== ALL_CATEGORIES) {
      result = result.filter(s => s.category === selectedCategory)
    }
    return result
  }, [skills, searchQuery, selectedCategory])

  // Categorias únicas
  const categories = useMemo(() => {
    const cats = [...new Set(skills.map(s => s.category))].sort()
    return [ALL_CATEGORIES, ...cats]
  }, [skills])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Filtros de categoria — pills horizontais */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${selectedCategory === cat ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
              background: selectedCategory === cat ? 'var(--color-accent-glow)' : 'transparent',
              color: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: selectedCategory === cat ? 600 : 400,
              cursor: 'pointer',
              transition: `all var(--duration-fast) ease`
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      {filtered.length === 0 ? (
        <div style={{
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-display)',
          fontSize: 14
        }}>
          {searchQuery ? `No skills matching "${searchQuery}"` : 'No skills found'}
        </div>
      ) : (
        <div style={{
          display: viewMode === 'grid' ? 'grid' : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined,
          flexDirection: viewMode === 'list' ? 'column' : undefined,
          gap: 'var(--space-md)'
        }}>
          {filtered.map((skill, i) => (
            <ItemCard
              key={skill.id}
              name={skill.name}
              description={skill.description}
              path={skill.path}
              category={skill.category}
              index={i}
              badges={[
                { label: skill.category, variant: 'skill' },
                { label: skill.origin, variant: skill.origin }
              ]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
