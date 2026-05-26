import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { HomeBannerCarousel } from '../components/home/HomeBannerCarousel.jsx'
import { HomeBannerDetailSheet } from '../components/home/HomeBannerDetailSheet.jsx'
import { HomeLatestScan } from '../components/home/HomeLatestScan.jsx'
import { buildHomeBanners } from '../utils/homeBanners.js'
import {
  getScanHistoryRowKey,
  getScansHistory,
  SCAN_HISTORY_HOME_PREVIEW_SIZE,
} from '../api/scanHistory.js'
import { getAvailableRppgScansFromUser, getUserMe } from '../api/user.js'
import { SettingsIcon } from '../components/icons/SettingsIcon.jsx'
import { useI18n } from '../i18n/useI18n.js'
import '../components/home/HomeLatestScan.css'
import './HomePage.css'

function FaceScanIcon() {
  return (
    <svg className="home-page__facescan-svg" viewBox="0 0 96 96" fill="none" aria-hidden>
      <path d="M28 16H20C17.79 16 16 17.79 16 20V28" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M68 16H76C78.21 16 80 17.79 80 20V28" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 68V76C16 78.21 17.79 80 20 80H28" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M80 68V76C80 78.21 78.21 80 76 80H68" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M48 25.5C36.9 25.5 30.2 33.4 30.2 45.2V50.2C30.2 52.7 31.3 55 33.1 56.5C34.2 66.9 40.3 73.2 48 73.2C55.7 73.2 61.8 66.9 62.9 56.5C64.7 55 65.8 52.7 65.8 50.2V45.2C65.8 33.4 59.1 25.5 48 25.5Z" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M37.4 38C41.2 35.7 44.7 33.2 46.8 29.8" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M45.8 36.6C51.2 36.9 55.5 34.6 58.1 30.3" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M38.2 45.4C40.1 44.3 42.4 44.3 44.1 45.4" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M51.9 45.4C53.6 44.3 55.9 44.3 57.8 45.4" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M41 50V52" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M55 50V52" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M43.7 62.2C46.2 64 49.8 64 52.3 62.2" stroke="url(#fs-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <g className="home-page__scanline">
        <g opacity="0.9" filter="url(#fs-blur)">
          <path d="M16 48H84" stroke="url(#fs-line)" strokeWidth="10" strokeLinecap="round"/>
        </g>
        <path d="M16 48H84" stroke="url(#fs-line)" strokeWidth="0.5" strokeLinecap="round"/>
        <path opacity="0.9" d="M25 48H75" stroke="#EFF6FF" strokeWidth="0.1" strokeLinecap="round"/>
      </g>
      <defs>
        <filter id="fs-blur" x="4.6" y="36.6" width="90.8" height="22.8" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="bg"/>
          <feBlend in="SourceGraphic" in2="bg" result="shape"/>
          <feGaussianBlur stdDeviation="3.2" result="blur"/>
        </filter>
        <linearGradient id="fs-g" x1="18" y1="12" x2="78" y2="84" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5E8CFF"/><stop offset="0.48" stopColor="#3B82F6"/><stop offset="1" stopColor="#2563EB"/>
        </linearGradient>
        <linearGradient id="fs-line" x1="14" y1="48" x2="86" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity="0"/><stop offset="0.18" stopColor="#34D399" stopOpacity="0.4"/>
          <stop offset="0.5" stopColor="#ECFDF5" stopOpacity="0.95"/><stop offset="0.82" stopColor="#34D399" stopOpacity="0.4"/>
          <stop offset="1" stopColor="#10B981" stopOpacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * @param {{
 *   onStartScan: () => void,
 *   onOpenSettings: () => void,
 *   onOpenScan: (row: object) => void,
 *   onOpenAllScans: () => void,
 * }} props
 */
export function HomePage({
  onStartScan,
  onOpenSettings,
  onOpenScan,
  onOpenAllScans,
}) {
  const { locale, localeRevision, t } = useI18n()
  const [phase, setPhase] = useState('loading')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [historyTotal, setHistoryTotal] = useState(0)
  /** @type {'loading' | 'ready' | 'hidden'} */
  const [quotaPhase, setQuotaPhase] = useState('loading')
  /** @type {number | null} */
  const [scansLeft, setScansLeft] = useState(null)
  /** @type {[ReturnType<typeof buildHomeBanners>[number] | null, (banner: ReturnType<typeof buildHomeBanners>[number] | null) => void]} */
  const [sheetBanner, setSheetBanner] = useState(null)

  const recentRows = useMemo(
    () => rows.slice(0, SCAN_HISTORY_HOME_PREVIEW_SIZE),
    [rows],
  )

  const homeBanners = useMemo(() => buildHomeBanners({ t }), [t])

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
      const res = await getScansHistory({
        pageNumber: 1,
        pageSize: SCAN_HISTORY_HOME_PREVIEW_SIZE,
      })
      const value = res?.value
      const data = Array.isArray(value?.data) ? value.data : []
      const total = typeof value?.totalCount === 'number' ? value.totalCount : data.length
      setRows(data)
      setHistoryTotal(total)
      setPhase(data.length > 0 ? 'ready' : 'empty')
    } catch (e) {
      setPhase('error')
      setError(e instanceof Error ? e.message : t('home.historyError'))
      setRows([])
      setHistoryTotal(0)
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
        <div className="home-page__body page-shell__scroll">
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
          </header>

          <section className="home-page__scan-section" aria-label={t('home.scanTitle')}>
            <button
              type="button"
              className={`home-page__scan-card${
                quotaPhase === 'ready' && scansLeft === 0
                  ? ' home-page__scan-card--disabled'
                  : ''
              }`}
              disabled={quotaPhase === 'ready' && scansLeft === 0}
              onClick={onStartScan}
            >
              <span className="home-page__scan-icon" aria-hidden>
                <FaceScanIcon />
              </span>
              <span className="home-page__scan-body">
                <span className="home-page__scan-label">{t('home.scanTitle')}</span>
                <span className="home-page__scan-hint">{t('home.scanLead')}</span>
              </span>
              <span className="home-page__scan-chevron" aria-hidden>
                ›
              </span>
              {quotaPhase === 'loading' ? (
                <span
                  className="home-page__scan-quota home-page__scan-quota--loading"
                  aria-live="polite"
                >
                  {t('home.scansLeftLoading')}
                </span>
              ) : null}
              {quotaPhase === 'ready' && scansLeft != null ? (
                <span
                  className={`home-page__scan-quota${
                    scansLeft === 0 ? ' home-page__scan-quota--empty' : ''
                  }`}
                  role="status"
                >
                  <span className="home-page__scan-quota-value">{scansLeft}</span>
                  <span className="home-page__scan-quota-label">
                    {scansLeft === 0 ? t('home.scansLeftNone') : t('home.scansLeftLabel')}
                  </span>
                </span>
              ) : null}
            </button>
          </section>

          <HomeBannerCarousel banners={homeBanners} onOpenBanner={setSheetBanner} />

          <section className="home-scans" aria-labelledby="home-scans-title">
            <h2 id="home-scans-title" className="home-page__section-title">
              {t('home.historyTitle')}
            </h2>
            <div className="home-scans__panel">
              {phase === 'loading' ? (
                <p className="home-scans__status">{t('home.historyLoading')}</p>
              ) : null}

              {phase === 'error' ? (
                <div className="home-scans__error-wrap">
                  <p className="home-scans__error" role="alert">
                    {error}
                  </p>
                  <button
                    type="button"
                    className="btn-secondary home-scans__retry"
                    onClick={() => void load()}
                  >
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
                    {recentRows.map((row, index) => (
                      <li key={getScanHistoryRowKey(row)}>
                        <HomeLatestScan
                          row={row}
                          locale={locale}
                          t={t}
                          className={index > 0 ? 'home-latest--in-panel-bordered' : ''}
                          onOpen={() => onOpenScan(row)}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="home-scans__panel-foot">
                    <button
                      type="button"
                      className="home-scans__all"
                      onClick={onOpenAllScans}
                    >
                      {t('home.allHistory')}
                      {historyTotal > recentRows.length
                        ? ` (${historyTotal})`
                        : ''}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>

        <footer className="page-dock home-page__dock">
          <button type="button" className="btn-primary" onClick={onStartScan}>
            {t('home.scanAction')}
          </button>
        </footer>

        <HomeBannerDetailSheet banner={sheetBanner} onClose={() => setSheetBanner(null)} />
      </div>
    </AppLayout>
  )
}
