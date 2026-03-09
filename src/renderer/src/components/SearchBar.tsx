import { useTrackerStore } from '../stores/useTrackerStore'

export default function SearchBar() {
  const { searchQuery, setSearch } = useTrackerStore()

  return (
    <div style={{
      position: 'relative',
      width: '100%'
    }}>
      {/* Ícone de busca */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search assets…"
        style={{
          width: '100%',
          height: 36,
          padding: '0 12px 0 38px',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          outline: 'none',
          transition: `border-color var(--duration-fast) ease`
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent-border)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      />

      {/* Atalho de teclado */}
      {!searchQuery && (
        <span style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--color-text-muted)',
          padding: '2px 6px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          pointerEvents: 'none',
          lineHeight: 1
        }}>
          ⌘K
        </span>
      )}
    </div>
  )
}
