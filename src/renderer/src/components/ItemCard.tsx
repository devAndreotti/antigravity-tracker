import { useState } from 'react'
import StatusBadge from './StatusBadge'

interface ItemCardProps {
  name: string
  description: string
  path: string
  badges: Array<{ label: string; variant: string }>
  category?: string
  index?: number
}

export default function ItemCard({ name, description, path, badges, category, index = 0 }: ItemCardProps) {
  const [hovered, setHovered] = useState(false)

  // Hash simples para gerar gradiente por categoria
  const gradientHue = category
    ? (category.charCodeAt(0) * 17 + category.charCodeAt(Math.min(1, category.length - 1)) * 31) % 360
    : 0

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-in"
      style={{
        background: hovered ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
        border: `1px solid ${hovered ? 'var(--color-border-hover)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: `all var(--duration-normal) var(--ease-out-expo)`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(200,255,0,0.04)'
          : '0 2px 8px rgba(0,0,0,0.15)',
        animationDelay: `${index * 40}ms`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header gradient — inspirado no card-component.jpg */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, hsl(${gradientHue}, 60%, 45%), hsl(${gradientHue + 40}, 50%, 35%))`,
        opacity: hovered ? 1 : 0.6,
        transition: `opacity var(--duration-fast) ease`
      }} />

      {/* Corpo do card */}
      <div style={{ padding: 'var(--space-md)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {/* Nome */}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.3
        }}>
          {name}
        </h3>

        {/* Descrição */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {description || 'No description available'}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'var(--space-xs)' }}>
          {badges.map((badge, i) => (
            <StatusBadge key={i} label={badge.label} variant={badge.variant as any} />
          ))}
        </div>

        {/* Path — mono, truncado */}
        <div
          title={path}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--color-text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: 'var(--space-xs)',
            opacity: hovered ? 1 : 0.6,
            transition: `opacity var(--duration-fast) ease`
          }}
        >
          {path}
        </div>
      </div>
    </div>
  )
}
