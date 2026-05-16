import { MetricIcon } from './MetricIcon.jsx'
import {
  formatTranscriptValue,
  metricStatusClass,
  transcriptColorKey,
} from '../../utils/metricTranscript.js'
import './MetricCard.css'

/**
 * @param {{
 *   transcript: object,
 *   onSelect?: (t: object) => void,
 *   highlighted?: boolean,
 *   preview?: boolean,
 * }} props
 */
export function MetricCard({ transcript: t, onSelect, highlighted = false, preview = false }) {
  const color = transcriptColorKey(t)
  const colorClass =
    color === 'green' || color === 'yellow' || color === 'red' ? `metric-card--${color}` : ''
  const cardClass = [
    'metric-card',
    colorClass,
    highlighted ? 'metric-card--highlighted' : '',
    preview ? 'metric-card--preview' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const inner = (
    <>
      <span className="metric-card__icon" aria-hidden>
        <MetricIcon metricKey={t.key} />
      </span>
      <span className="metric-card__name">{t.name}</span>
      <span className="metric-card__value-row">
        <span className="metric-card__value">{formatTranscriptValue(t)}</span>
        {t.unit ? <span className="metric-card__unit">{t.unit}</span> : null}
      </span>
      {t.status ? (
        <span className={metricStatusClass(color)}>{t.status}</span>
      ) : null}
    </>
  )

  if (preview) {
    return (
      <div className={cardClass} aria-hidden>
        {inner}
      </div>
    )
  }

  return (
    <button type="button" className={cardClass} onClick={() => onSelect?.(t)}>
      {inner}
    </button>
  )
}
