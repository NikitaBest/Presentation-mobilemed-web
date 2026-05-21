import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { HomeLatestScan } from '../components/home/HomeLatestScan.jsx'
import { getScansHistory } from '../api/scanHistory.js'
import { getAvailableRppgScansFromUser, getUserMe } from '../api/user.js'
import { SettingsIcon } from '../components/icons/SettingsIcon.jsx'
import { useI18n } from '../i18n/useI18n.js'
import '../components/home/HomeLatestScan.css'
import './HomePage.css'

function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8a2 2 0 0 1 2 2v2M8 20H6a2 2 0 0 1-2-2v-2M20 14v2a2 2 0 0 1-2 2h-2M4 10V8a2 2 0 0 1 2-2h2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <ellipse cx="12" cy="12" rx="4" ry="5.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

function scanRowKey(row) {
  return row?.scan?.id ?? row?.rppgScanId ?? `${row?.scan?.createdAt ?? row?.createdAt ?? ''}`
}

/**
 * @param {{
 *   onStartScan: () => void,
 *   onOpenSettings: () => void,
 *   onOpenScan: (row: object) => void,
 *   onOpenAllScans: () => void,
 * }} props
 */
export function HomePage({ onStartScan, onOpenSettings, onOpenScan, onOpenAllScans }) {
  const { locale, localeRevision, t } = useI18n()
  const [phase, setPhase] = useState('loading')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  /** @type {'loading' | 'ready' | 'hidden'} */
  const [quotaPhase, setQuotaPhase] = useState('loading')
  /** @type {number | null} */
  const [scansLeft, setScansLeft] = useState(null)

  const recentRows = useMemo(() => rows.slice(0, 3), [rows])

  const loadQuota = useCallback(async () => {
    setQuotaPhase('loading')
    try {
      const user = await getUserMe()
      const left = getAvailableRppgScansFromUser(user)
      if (left == null) {
        setQuotaPhase('hidden')
        setScansLeft(null)
      } else {
        setScansLeft(left)
        setQuotaPhase('ready')
      }
    } catch {
      setQuotaPhase('hidden')
      setScansLeft(null)
    }
  }, [])

  const load = useCallback(async () => {
    setPhase('loading')
    setError('')
    try {
      const res = await getScansHistory({ pageNumber: 1, pageSize: 3 })
      const data = res?.value?.data
      setRows(Array.isArray(data) ? data : [])
      setPhase(Array.isArray(data) && data.length > 0 ? 'ready' : 'empty')
    } catch (e) {
      setPhase('error')
      setError(e instanceof Error ? e.message : t('home.historyError'))
      setRows([])
    }
  }, [t])

  const loadHome = useCallback(async () => {
    await Promise.all([load(), loadQuota()])
  }, [load, loadQuota])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- данные главной */
    void loadHome()
  }, [loadHome, localeRevision])

  return (
    <AppLayout>
      <div className="home-page page-shell">
        <header className="home-page__header">
          <div className="home-page__header-top">
            <h1 className="home-page__title">{t('home.title')}</h1>
            <button
              type="button"
              className="home-page__settings-btn"
              aria-label={t('home.openSettings')}
              onClick={onOpenSettings}
            >
              <SettingsIcon />
            </button>
          </div>
          <span className="home-page__brand">{t('home.brand')}</span>
          {quotaPhase === 'loading' ? (
            <p className="home-page__quota home-page__quota--loading" aria-live="polite">
              {t('home.scansLeftLoading')}
            </p>
          ) : null}
          {quotaPhase === 'ready' && scansLeft != null ? (
            <p
              className={`home-page__quota${scansLeft === 0 ? ' home-page__quota--empty' : ''}`}
              role="status"
            >
              <span className="home-page__quota-value">{scansLeft}</span>
              <span className="home-page__quota-label">
                {scansLeft === 0 ? t('home.scansLeftNone') : t('home.scansLeftLabel')}
              </span>
            </p>
          ) : null}
          <p className="home-page__lead">{t('home.lead')}</p>
        </header>

        <div className="home-page__scroll page-shell__scroll">
          <section className="home-scans" aria-labelledby="home-scans-title">
            <div className="home-scans__panel">
              <h2 id="home-scans-title" className="home-scans__panel-title">
                {t('home.historyTitle')}
              </h2>

              {phase === 'loading' ? (
                <p className="home-scans__status">{t('home.historyLoading')}</p>
              ) : null}

              {phase === 'error' ? (
                <div className="home-scans__error-wrap">
                  <p className="home-scans__error" role="alert">
                    {error}
                  </p>
                  <button type="button" className="btn-secondary home-scans__retry" onClick={() => void load()}>
                    {t('home.historyRetry')}
                  </button>
                </div>
              ) : null}

              {phase === 'empty' ? (
                <p className="home-scans__empty">{t('home.historyEmpty')}</p>
              ) : null}

              {phase === 'ready' && recentRows.length > 0 ? (
                <>
                  <ul className="home-scans__list" aria-label={t('home.historyRecentAria')}>
                    {recentRows.map((row) => (
                      <li key={scanRowKey(row)}>
                        <HomeLatestScan
                          row={row}
                          locale={locale}
                          t={t}
                          onOpen={() => onOpenScan(row)}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="home-scans__panel-foot">
                    <button
                      type="button"
                      className="btn-secondary home-scans__all"
                      onClick={onOpenAllScans}
                    >
                      {t('home.allMetrics')}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <button type="button" className="home-scan-card" onClick={onStartScan}>
            <span className="home-scan-card__icon" aria-hidden>
              <IconScan />
            </span>
            <span className="home-scan-card__body">
              <span className="home-scan-card__title">{t('home.scanTitle')}</span>
              <span className="home-scan-card__lead">{t('home.scanLead')}</span>
            </span>
            <span className="home-scan-card__chevron" aria-hidden>
              ›
            </span>
          </button>
        </div>

        <footer className="page-dock home-page__dock">
          <button type="button" className="btn-primary" onClick={onStartScan}>
            {t('home.scanAction')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}
