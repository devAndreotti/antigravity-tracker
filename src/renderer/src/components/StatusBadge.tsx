interface StatusBadgeProps {
  label: string
  variant: 'global' | 'local' | 'custom' | 'running' | 'stopped' | 'unknown' |
           'node' | 'python' | 'docker' | 'url' | 'skill' | 'workflow' | 'mcp' | 'workspace'
}

// Mapeamento de cores por variante — inspirado nos badges glassmorfismo
const variantStyles: Record<string, { color: string; bg: string; border: string }> = {
  global:    { color: '#7c5cfc', bg: 'rgba(124, 92, 252, 0.12)', border: 'rgba(124, 92, 252, 0.25)' },
  local:     { color: '#00b4d8', bg: 'rgba(0, 180, 216, 0.12)', border: 'rgba(0, 180, 216, 0.25)' },
  custom:    { color: '#ff6b9d', bg: 'rgba(255, 107, 157, 0.12)', border: 'rgba(255, 107, 157, 0.25)' },
  running:   { color: '#00e5a0', bg: 'rgba(0, 229, 160, 0.12)', border: 'rgba(0, 229, 160, 0.25)' },
  stopped:   { color: '#ff4757', bg: 'rgba(255, 71, 87, 0.12)', border: 'rgba(255, 71, 87, 0.25)' },
  unknown:   { color: '#ffa502', bg: 'rgba(255, 165, 2, 0.12)', border: 'rgba(255, 165, 2, 0.25)' },
  node:      { color: '#68d391', bg: 'rgba(104, 211, 145, 0.12)', border: 'rgba(104, 211, 145, 0.25)' },
  python:    { color: '#4299e1', bg: 'rgba(66, 153, 225, 0.12)', border: 'rgba(66, 153, 225, 0.25)' },
  docker:    { color: '#63b3ed', bg: 'rgba(99, 179, 237, 0.12)', border: 'rgba(99, 179, 237, 0.25)' },
  url:       { color: '#d69e2e', bg: 'rgba(214, 158, 46, 0.12)', border: 'rgba(214, 158, 46, 0.25)' },
  skill:     { color: '#c8ff00', bg: 'rgba(200, 255, 0, 0.10)', border: 'rgba(200, 255, 0, 0.20)' },
  workflow:  { color: '#e9d8fd', bg: 'rgba(233, 216, 253, 0.10)', border: 'rgba(233, 216, 253, 0.20)' },
  mcp:       { color: '#90cdf4', bg: 'rgba(144, 205, 244, 0.10)', border: 'rgba(144, 205, 244, 0.20)' },
  workspace: { color: '#fbd38d', bg: 'rgba(251, 211, 141, 0.10)', border: 'rgba(251, 211, 141, 0.20)' },
}

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const style = variantStyles[variant] || variantStyles.unknown

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.border}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        whiteSpace: 'nowrap',
        lineHeight: 1.2
      }}
    >
      {/* Dot indicator para status */}
      {(variant === 'running' || variant === 'stopped' || variant === 'unknown') && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: style.color,
          flexShrink: 0,
          boxShadow: variant === 'running' ? `0 0 6px ${style.color}` : 'none'
        }} />
      )}
      {label}
    </span>
  )
}
