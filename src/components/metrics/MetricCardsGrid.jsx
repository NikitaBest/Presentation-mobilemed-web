import { MetricCard } from './MetricCard.jsx'
import './MetricCardsGrid.css'

/**
 * @param {{
 *   transcripts: object[],
 *   onSelect: (t: object) => void,
 *   tapHintActive?: boolean,
 *   tapHintExiting?: boolean,
 *   onTapHintDismiss?: () => void,
 * }} props
 */
export function MetricCardsGrid({
  transcripts,
  onSelect,
  tapHintActive = false,
  tapHintExiting = false,
  onTapHintDismiss,
}) {
  if (!transcripts.length) return null

  const wrapClass = [
    'metric-grid-wrap',
    tapHintActive ? 'metric-grid-wrap--hint' : '',
    tapHintExiting ? 'metric-grid-wrap--hint-exit' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapClass}>
      {tapHintActive ? (
        <button
          type="button"
          className="metric-grid-backdrop"
          aria-label="Закрыть подсказку"
          onClick={onTapHintDismiss}
        />
      ) : null}

      {tapHintActive ? (
        <div className="metric-tap-hint-anchor" aria-hidden>
          <p className="metric-tap-hint" role="status">
            Нажмите, чтобы узнать больше
          </p>
        </div>
      ) : null}

      <div className="metric-grid" role="list">
        {transcripts.map((t, index) => {
          const isTarget = tapHintActive && index === 0
          return (
            <div
              key={t.key}
              className={`metric-grid__cell${isTarget ? ' metric-grid__cell--hint' : ''}`}
              role="listitem"
            >
              <MetricCard
                transcript={t}
                highlighted={isTarget}
                onSelect={(item) => {
                  if (isTarget) onTapHintDismiss?.()
                  onSelect(item)
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
