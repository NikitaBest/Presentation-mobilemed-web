import { useEffect, useId } from 'react'
import { MetricScaleBar } from './MetricScaleBar.jsx'
import {
  formatTranscriptValue,
  metricStatusClass,
  transcriptColorKey,
} from '../../utils/metricTranscript.js'
import { useI18n } from '../../i18n/useI18n.js'
import './MetricDetailSheet.css'

/**
 * @param {{ transcript: object | null, onClose: () => void }} props
 */
export function MetricDetailSheet({ transcript, onClose }) {
  const { t } = useI18n()
  const titleId = useId()
  const open = transcript != null

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

  const color = transcriptColorKey(transcript)

  return (
    <div className="metric-sheet" role="presentation">
      <button type="button" className="metric-sheet__backdrop" aria-label={t('common.close')} onClick={onClose} />
      <div
        className="metric-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="metric-sheet__handle" aria-hidden />

        <h2 id={titleId} className="metric-sheet__title">
          {transcript.name}
        </h2>

        <p className="metric-sheet__value-row">
          <span className="metric-sheet__value">{formatTranscriptValue(transcript)}</span>
          {transcript.unit ? <span className="metric-sheet__unit">{transcript.unit}</span> : null}
        </p>

        {transcript.status ? (
          <p className="metric-sheet__status-wrap">
            <span className={metricStatusClass(color)}>{transcript.status}</span>
          </p>
        ) : null}

        {transcript.commentUser ? <p className="metric-sheet__comment">{transcript.commentUser}</p> : null}

        {transcript.scaleMetadata ? <MetricScaleBar scaleMetadata={transcript.scaleMetadata} /> : null}

        {transcript.descriptionUser ? (
          <p className="metric-sheet__description">{transcript.descriptionUser}</p>
        ) : null}

        <button type="button" className="metric-sheet__btn" onClick={onClose}>
          {t('metricSheet.ok')}
        </button>

        <p className="metric-sheet__disclaimer">{t('metricSheet.disclaimer')}</p>
      </div>
    </div>
  )
}
