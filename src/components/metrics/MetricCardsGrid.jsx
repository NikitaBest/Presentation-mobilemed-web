import { MetricCard } from './MetricCard.jsx'
import { useI18n } from '../../i18n/useI18n.js'
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
  const { t } = useI18n()
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
          className="metric-grid-scrim"
          aria-label={t('common.closeHint')}
          onClick={onTapHintDismiss}
        />
      ) : null}

      {tapHintActive ? (
        <div className="metric-tap-hint-anchor" aria-hidden>
          <p className="metric-tap-hint" role="status">
            {t('metricGrid.tapHint')}
          </p>
        </div>
      ) : null}

      <div className="metric-grid" role="list">
        {transcripts.map((item, index) => {
          const isTarget = tapHintActive && index === 0
          return (
            <div
              key={item.key}
              className={`metric-grid__cell${isTarget ? ' metric-grid__cell--hint' : ''}`}
              role="listitem"
            >
              <MetricCard
                transcript={item}
                highlighted={isTarget}
                onSelect={(selected) => {
                  if (isTarget) onTapHintDismiss?.()
                  onSelect(selected)
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
