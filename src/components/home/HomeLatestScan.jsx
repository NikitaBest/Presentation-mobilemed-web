import { healthScoreBand } from '../healthScoreBand.js'
import { formatScanWhen } from '../../utils/scanDate.js'
import '../../components/HealthScoreCore.css'
import './HomeLatestScan.css'

const RING_C = 2 * Math.PI * 20

/**
 * @param {object} props
 * @param {object | null} props.row
 * @param {'ru' | 'en'} props.locale
 * @param {(key: string, vars?: Record<string, string>) => string} props.t
 * @param {() => void} props.onOpen
 */
export function HomeLatestScan({ row, locale, t, onOpen }) {
  const score = row?.healthScore
  const band = healthScoreBand(score)
  const n = score != null && score !== '' ? Number(score) : NaN
  const display = Number.isFinite(n) ? String(Math.round(n)) : '—'
  const progress = Number.isFinite(n) ? Math.min(1, Math.max(0, n / 100)) : 0
  const dashOffset = RING_C * (1 - progress)
  const caption = t(`healthScore.band.${band}`)

  const when = formatScanWhen(row?.scan?.createdAt ?? row?.createdAt, locale)
  const whenLabel = when.time ? `${when.date} · ${when.time}` : when.date

  return (
    <button
      type="button"
      className={`home-latest health-core--${band}`}
      onClick={onOpen}
      aria-label={t('home.latestOpen', { date: whenLabel })}
    >
      <div className="home-latest__ring" aria-hidden>
        <svg className="home-latest__ring-svg" viewBox="0 0 52 52" focusable="false">
          <circle className="home-latest__track" cx="26" cy="26" r="20" />
          <circle
            className="home-latest__progress"
            cx="26"
            cy="26"
            r="20"
            strokeDasharray={RING_C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 26 26)"
          />
        </svg>
        <span className="home-latest__ring-inner">
          <span className="home-latest__value">{display}</span>
          <span className="home-latest__of">{t('home.latestOf')}</span>
        </span>
      </div>

      <div className="home-latest__desc">
        <div className="home-latest__head">
          <p className="home-latest__when">
            <time dateTime={row?.scan?.createdAt ?? row?.createdAt ?? undefined}>
              {whenLabel}
            </time>
          </p>
          <span className={`home-latest__pill home-latest__pill--${band}`}>{caption}</span>
          <span className="home-latest__chevron" aria-hidden>
            ›
          </span>
        </div>
      </div>
    </button>
  )
}
