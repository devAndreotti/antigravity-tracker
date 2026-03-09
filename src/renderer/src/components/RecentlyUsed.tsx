import { Tag } from '../data'

interface RecentItem {
  id: string
  label: string
  type: 'skill' | 'workflow' | 'mcp' | 'workspace'
  category: string
}

const typeColors: Record<string, string> = { skill: '#a78bfa', workflow: '#a3ff12', mcp: '#60a5fa', workspace: '#f97316' }
const typeLetters: Record<string, string> = { skill: 'S', workflow: 'W', mcp: 'M', workspace: 'WS' }

interface Props {
  items: RecentItem[]
  onSelect: (item: RecentItem) => void
}

// Fila horizontal de pills dos últimos itens acessados
export default function RecentlyUsed({ items, onSelect }: Props) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#2d3748', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Recently opened</span>
        <div style={{ flex: 1, height: 1, background: '#ffffff06' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {items.map(item => (
          <button key={item.id + item.type} onClick={() => onSelect(item)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'monospace',
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            background: '#0a0f18', border: '1px solid #ffffff0d', color: '#94a3b8',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${typeColors[item.type]}44`; e.currentTarget.style.background = '#0f1520' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#ffffff0d'; e.currentTarget.style.background = '#0a0f18' }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${typeColors[item.type]}15`, fontSize: 8, fontWeight: 700, color: typeColors[item.type],
            }}>{typeLetters[item.type]}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export type { RecentItem }
