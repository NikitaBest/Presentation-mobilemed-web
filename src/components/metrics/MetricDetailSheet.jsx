import { useEffect, useId } from 'react'
import { MetricScaleBar } from './MetricScaleBar.jsx'
import {
  formatTranscriptValue,
  metricStatusClass,
  transcriptColorKey,
} from '../../utils/metricTranscript.js'
import './MetricDetailSheet.css'

/**
 * @param {{ transcript: object | null, onClose: () => void }} props
 */
export function MetricDetailSheet({ transcript: t, onClose }) {
  const titleId = useId()
  const open = t != null

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const color = transcriptColorKey(t)

  return (
    <div className="metric-sheet" role="presentation">
      <button type="button" className="metric-sheet__backdrop" aria-label="Закрыть" onClick={onClose} />
      <div
        className="metric-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="metric-sheet__handle" aria-hidden />

        <h2 id={titleId} className="metric-sheet__title">
          {t.name}
        </h2>

        <p className="metric-sheet__value-row">
          <span className="metric-sheet__value">{formatTranscriptValue(t)}</span>
          {t.unit ? <span className="metric-sheet__unit">{t.unit}</span> : null}
        </p>

        {t.status ? (
          <p className="metric-sheet__status-wrap">
            <span className={metricStatusClass(color)}>{t.status}</span>
          </p>
        ) : null}

        {t.commentUser ? <p className="metric-sheet__comment">{t.commentUser}</p> : null}

        {t.scaleMetadata ? <MetricScaleBar scaleMetadata={t.scaleMetadata} /> : null}

        {t.descriptionUser ? (
          <p className="metric-sheet__description">{t.descriptionUser}</p>
        ) : null}

        <button type="button" className="metric-sheet__btn" onClick={onClose}>
          Понятно
        </button>

        <p className="metric-sheet__disclaimer">
          Не является медицинским диагнозом. Необходима консультация специалиста.
        </p>
      </div>
    </div>
  )
}
