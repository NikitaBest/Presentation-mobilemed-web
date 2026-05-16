import './MetricScaleBar.css'

/**
 * @param {{ scaleMetadata?: { valuePercentLabel?: number, items?: Array<{ color: string, fromToAlias?: string, percentFrom: number, percentTo: number }> } | null }} props
 */
export function MetricScaleBar({ scaleMetadata }) {
  const items = scaleMetadata?.items
  if (!Array.isArray(items) || items.length === 0) return null

  const pointer = Math.min(100, Math.max(0, Number(scaleMetadata.valuePercentLabel) || 0))

  return (
    <div className="metric-scale" aria-hidden>
      <div
        className="metric-scale__pointer"
        style={{ left: `calc(${pointer}% - 6px)` }}
      />
      <div className="metric-scale__track">
        {items.map((item, index) => {
          const width = Math.max(0, (item.percentTo ?? 0) - (item.percentFrom ?? 0))
          const color = String(item.color ?? 'green').toLowerCase()
          return (
            <div
              key={`${item.fromToAlias ?? index}-${item.percentFrom}`}
              className={`metric-scale__seg metric-scale__seg--${color}`}
              style={{ flex: `${width} 1 0` }}
            />
          )
        })}
      </div>
      <div className="metric-scale__labels">
        {items.map((item, index) => {
          const width = Math.max(0, (item.percentTo ?? 0) - (item.percentFrom ?? 0))
          return (
            <div
              key={`label-${item.fromToAlias ?? index}`}
              className="metric-scale__label"
              style={{ flex: `${width} 1 0` }}
            >
              {item.fromToAlias}
            </div>
          )
        })}
      </div>
    </div>
  )
}
