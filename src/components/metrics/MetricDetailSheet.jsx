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
import sympatheticZoneImage from '../../assets/sympathetic_zone.webp'
import glucoseImage from '../../assets/glucose.webp'
import diastolicImage from '../../assets/diastolic_pressure.webp'
import prqImage from '../../assets/PRQ.webp'
import cholesterolImage from '../../assets/cholesterol.webp'
import respiratoryRateImage from '../../assets/respiratory_rate.png'
import systolicImage from '../../assets/systolic_pressure.webp'
import hba1cImage from '../../assets/hba1c.webp'
import hemoglobinImage from '../../assets/hemoglobin.webp'
import baevskyImage from '../../assets/Baevsky.webp'
import ascvdImage from '../../assets/ASCVD.webp'
import cardiacLoadImage from '../../assets/cardiac_load.webp'
import bloodPressureImage from '../../assets/blood_pressure.webp'
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
  sympatheticZone: {
    image: sympatheticZoneImage,
    i18nKey: 'metricSheet.sympatheticZone.detail',
    match: (key, name) =>
      key === 'sympatheticzone' || key === 'sympathetic_zone' || key === 'sns_zone' ||
      name.includes('симпатическ') || name.includes('sympathetic'),
  },
  glucoseRisk: {
    image: glucoseImage,
    i18nKey: 'metricSheet.glucoseRisk.detail',
    match: (key, name) =>
      key === 'glucoserisk' || key === 'glucose_risk' || key === 'fastingglucose' || key === 'fasting_glucose' ||
      name.includes('глюкоз') || name.includes('glucose'),
  },
  diastolicPressure: {
    image: diastolicImage,
    i18nKey: 'metricSheet.diastolicPressure.detail',
    match: (key, name) =>
      key === 'diastolicpressure' || key === 'diastolic_pressure' || key === 'diastolic' ||
      name.includes('диастолическ') || name.includes('diastolic'),
  },
  prq: {
    image: prqImage,
    i18nKey: 'metricSheet.prq.detail',
    match: (key, name) =>
      key === 'prq' || key === 'pulse_respiration_quotient' ||
      name.includes('prq') || name.includes('пульс дыхани') || name.includes('pulse-respiration'),
  },
  cholesterol: {
    image: cholesterolImage,
    i18nKey: 'metricSheet.cholesterol.detail',
    match: (key, name) =>
      key === 'cholesterol' || key === 'cholesterol_risk' || key === 'totalcholesterol' || key === 'total_cholesterol' ||
      name.includes('холестерин') || name.includes('cholesterol'),
  },
  respiratoryRate: {
    image: respiratoryRateImage,
    i18nKey: 'metricSheet.respiratoryRate.detail',
    match: (key, name) =>
      key === 'respiratoryrate' || key === 'respiratory_rate' || key === 'breathingrate' || key === 'breathing_rate' ||
      name.includes('частота дыхани') || name.includes('respiratory rate') || name.includes('breathing rate'),
  },
  systolicPressure: {
    image: systolicImage,
    i18nKey: 'metricSheet.systolicPressure.detail',
    match: (key, name) =>
      key === 'systolicpressure' || key === 'systolic_pressure' || key === 'systolic' ||
      name.includes('систолическ') || name.includes('systolic'),
  },
  hba1c: {
    image: hba1cImage,
    i18nKey: 'metricSheet.hba1c.detail',
    match: (key, name) =>
      key === 'hba1c' || key === 'hb_a1c' || key === 'glycatedhemoglobin' || key === 'glycated_hemoglobin' ||
      name.includes('гликированн') || name.includes('hba1c') || name.includes('hemoglobin a1c'),
  },
  hemoglobin: {
    image: hemoglobinImage,
    i18nKey: 'metricSheet.hemoglobin.detail',
    match: (key, name) =>
      key === 'hemoglobin' || key === 'haemoglobin' ||
      (name.includes('гемоглобин') && !name.includes('гликированн')) ||
      (name.includes('hemoglobin') && !name.includes('a1c')),
  },
  baevsky: {
    image: baevskyImage,
    i18nKey: 'metricSheet.baevsky.detail',
    match: (key, name) =>
      key === 'baevsky' || key === 'baevsky_stress' || key === 'baevskystress' || key === 'stress_index' ||
      name.includes('баевск') || name.includes('baevsky'),
  },
  ascvd: {
    image: ascvdImage,
    i18nKey: 'metricSheet.ascvd.detail',
    match: (key, name) =>
      key === 'ascvd' || key === 'ascvd_risk' || key === 'ascvdrisk' ||
      name.includes('ascvd') || name.includes('атеросклеротическ'),
  },
  cardiacLoad: {
    image: cardiacLoadImage,
    i18nKey: 'metricSheet.cardiacLoad.detail',
    match: (key, name) =>
      key === 'cardiacload' || key === 'cardiac_load' || key === 'cardiacworkload' || key === 'cardiac_workload' ||
      name.includes('кардиальн') || name.includes('cardiac load') || name.includes('cardiac work'),
  },
  meanArterialPressure: {
    image: bloodPressureImage,
    i18nKey: 'metricSheet.meanArterialPressure.detail',
    match: (key, name) =>
      key === 'meanarterialpressure' || key === 'mean_arterial_pressure' || key === 'map' ||
      name.includes('среднее артериальн') || name.includes('mean arterial'),
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
