import { generateSparkData } from '../data'

// Mini gráfico de barras (7 dias de atividade)
export default function Sparkline({ id, width = 40, height = 14 }: { id: string; width?: number; height?: number }) {
  const data = generateSparkData(id)
  const max = Math.max(...data)
  const barW = (width - (data.length - 1) * 2) / data.length

  return (
    <svg width={width} height={height} style={{ flexShrink: 0 }}>
      {data.map((v, i) => {
        const barH = (v / max) * height
        const opacity = 0.3 + (v / max) * 0.7
        return (
          <rect
            key={i} x={i * (barW + 2)} y={height - barH}
            width={barW} height={barH} rx={1}
            fill="#a3ff12" opacity={opacity}
          />
        )
      })}
    </svg>
  )
}
