import { type ReactNode } from 'react'

export type ViewMode = 'auto' | '2col' | '3col' | 'list'

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

function IconButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-ghost)',
        border: '1px solid transparent', // remove default border
        transition: 'all 0.15s'
      }}
      onMouseEnter={e => !active && (e.currentTarget.style.color = 'var(--text-primary)')}
      onMouseLeave={e => !active && (e.currentTarget.style.color = 'var(--text-ghost)')}
    >
      {children}
    </button>
  )
}

export default function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--bg-card)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
      {/* Auto / Multi (4 quadrados) */}
      <IconButton active={mode === 'auto'} onClick={() => onChange('auto')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </IconButton>

      {/* 2 Colunas */}
      <IconButton active={mode === '2col'} onClick={() => onChange('2col')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="6" height="16" rx="1.5" />
          <rect x="14" y="4" width="6" height="16" rx="1.5" />
        </svg>
      </IconButton>

      {/* 3 Colunas */}
      <IconButton active={mode === '3col'} onClick={() => onChange('3col')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="4" height="16" rx="1" />
          <rect x="10" y="4" width="4" height="16" rx="1" />
          <rect x="17" y="4" width="4" height="16" rx="1" />
        </svg>
      </IconButton>

      {/* Lista */}
      <IconButton active={mode === 'list'} onClick={() => onChange('list')}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </IconButton>
    </div>
  )
}
