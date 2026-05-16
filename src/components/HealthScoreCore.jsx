import { useId } from 'react'
import './HealthScoreCore.css'
import { healthScoreBand, HEALTH_SCORE_CAPTION } from './healthScoreBand.js'

const GAUGE_R = 52
const GAUGE_C = 2 * Math.PI * GAUGE_R

/**
 * @param {{ score: number | string | null | undefined, layout?: 'center' | 'hero' }} props
 */
export function HealthScoreCore({ score, layout = 'center' }) {
  const band = healthScoreBand(score)
  const uid = useId().replace(/:/g, '')
  const gradId = `hc-grad-${uid}`
  const glowId = `hc-glow-${uid}`

  const n = score != null && score !== '' ? Number(score) : NaN
  const display = Number.isFinite(n) ? String(Math.round(n)) : '—'
  const caption = HEALTH_SCORE_CAPTION[band]
  const progress = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
  const dashOffset = GAUGE_C * (1 - progress / 100)

  const ariaLabel = Number.isFinite(n)
    ? `Показатель здоровья ${display} из 100, ${caption}`
    : 'Показатель здоровья недоступен'

  if (layout === 'hero') {
    return (
      <div
        className={`health-core health-core--hero health-core--${band}`}
        role="img"
        aria-label={ariaLabel}
        style={{ '--hc-offset': dashOffset }}
      >
        <div className="health-core__hero-visual" aria-hidden>
          <span className="health-core__hero-aura" />
          <span className="health-core__hero-pulse health-core__hero-pulse--a" />
          <span className="health-core__hero-pulse health-core__hero-pulse--b" />
          <svg className="health-core__hero-svg" viewBox="0 0 120 120" focusable="false">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--hc-core-light)" />
                <stop offset="55%" stopColor="var(--hc-core)" />
                <stop offset="100%" stopColor="var(--hc-core-dark)" />
              </linearGradient>
              <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle className="health-core__hero-track" cx="60" cy="60" r={GAUGE_R} />
            <circle
              className="health-core__hero-progress"
              cx="60"
              cy="60"
              r={GAUGE_R}
              stroke={`url(#${gradId})`}
              filter={`url(#${glowId})`}
              strokeDasharray={GAUGE_C}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="health-core__hero-score">
            <span className="health-core__hero-value">{display}</span>
            <span className="health-core__hero-of">/ 100</span>
          </div>
        </div>
        <div className="health-core__hero-meta">
          <p className="health-core__hero-label">Показатель здоровья</p>
          <p className={`health-core__pill health-core__pill--${band}`}>{caption}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`health-core health-core--${band}`} role="img" aria-label={ariaLabel}>
      <div className="health-core__stage" aria-hidden>
        <span className="health-core__ring health-core__ring--a" />
        <span className="health-core__ring health-core__ring--b" />
        <span className="health-core__ring health-core__ring--c" />
        <span className="health-core__glow" />
        <span className="health-core__orb">
          <span className="health-core__value">{display}</span>
        </span>
      </div>
      <p className="health-core__label">Показатель здоровья</p>
      <p className="health-core__caption">{caption}</p>
    </div>
  )
}
