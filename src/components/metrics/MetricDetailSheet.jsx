import { useEffect, useId } from 'react'
import { MetricScaleBar } from './MetricScaleBar.jsx'
import {
  formatTranscriptValue,
  metricStatusClass,
  transcriptColorKey,
} from '../../utils/metricTranscript.js'
import { useI18n } from '../../i18n/useI18n.js'
import pulseImage from '../../assets/pulse1.webp'
import heartAgeImage from '../../assets/heart_age.webp'
import './MetricDetailSheet.css'

/** @type {Record<string, { image: string, i18nKey: string, match: (key: string, name: string) => boolean }>} */
const METRIC_EXTRAS = {
  pulseRate: {
    image: pulseImage,
    i18nKey: 'metricSheet.pulseRate.detail',
    match: (key, name) =>
      key === 'pulserate' || key === 'pulse_rate' || key === 'heartrate' || key === 'heart_rate' ||
      name.includes('частота пульса') || name === 'пульс' ||
      name === 'pulse rate' || name === 'heart rate',
  },
  heartAge: {
    image: heartAgeImage,
    i18nKey: 'metricSheet.heartAge.detail',
    match: (key, name) =>
      key === 'heartage' || key === 'heart_age' ||
      name.includes('возраст сердца') || name === 'heart age',
  },
}

/**
 * @param {object | null} transcript
 * @returns {{ image: string, i18nKey: string } | null}
 */
function findMetricExtra(transcript) {
  if (!transcript) return null
  const key = String(transcript.key ?? '').trim().toLowerCase()
  const name = String(transcript.name ?? '').trim().toLowerCase()
  for (const extra of Object.values(METRIC_EXTRAS)) {
    if (extra.match(key, name)) return extra
  }
  return null
}

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
  const extra = findMetricExtra(transcript)
  const extraParagraphs = extra
    ? t(extra.i18nKey).split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : []

  return (
    <div className="metric-sheet" role="presentation">
      <button type="button" className="metric-sheet__backdrop" aria-label={t('common.close')} onClick={onClose} />
      <div
        className="metric-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="metric-sheet__scroll">
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

          {extra ? (
            <div className="metric-sheet__extra">
              <img
                className="metric-sheet__extra-image"
                src={extra.image}
                alt=""
                aria-hidden
                decoding="async"
                draggable={false}
              />
              <div className="metric-sheet__extra-body">
                {extraParagraphs.map((paragraph, index) => (
                  <p key={`extra-p-${index}`}>{paragraph}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="metric-sheet__footer">
          <button type="button" className="metric-sheet__btn" onClick={onClose}>
            {t('metricSheet.ok')}
          </button>
          <p className="metric-sheet__disclaimer">{t('metricSheet.disclaimer')}</p>
        </footer>
      </div>
    </div>
  )
}
