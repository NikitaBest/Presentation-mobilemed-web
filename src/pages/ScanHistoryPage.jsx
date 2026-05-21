import { useCallback, useEffect, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { HomeLatestScan } from '../components/home/HomeLatestScan.jsx'
import { getAllScansHistory, getScanHistoryRowKey } from '../api/scanHistory.js'
import { useI18n } from '../i18n/useI18n.js'
import '../components/home/HomeLatestScan.css'
import './ScanHistoryPage.css'

/**
 * @param {{ onBack: () => void, onOpenScan: (row: object) => void }} props
 */
export function ScanHistoryPage({ onBack, onOpenScan }) {
  const { locale, localeRevision, t } = useI18n()
  const [phase, setPhase] = useState('loading')
  const [rows, setRows] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    setPhase('loading')
    setError('')
    try {
      const { rows: allRows, totalCount: total } = await getAllScansHistory()
      setRows(allRows)
      setTotalCount(total)
      setPhase(allRows.length > 0 ? 'ready' : 'empty')
    } catch (e) {
      setPhase('error')
      setRows([])
      setTotalCount(0)
      setError(e instanceof Error ? e.message : t('scanHistory.error'))
    }
  }, [t])

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- полная история GET /scan/get */
    void loadAll()
  }, [loadAll, localeRevision])

  const countLabel =
    phase === 'ready' && rows.length > 0
      ? t('scanHistory.count', { count: String(totalCount || rows.length) })
      : null

  return (
    <AppLayout>
      <div className="scan-history-page page-shell">
        <header className="scan-history-page__header">
          <span className="scan-history-page__brand">{t('home.brand')}</span>
          <h1 className="scan-history-page__title">{t('scanHistory.title')}</h1>
          <p className="scan-history-page__lead">{t('scanHistory.lead')}</p>
          {countLabel ? (
            <p className="scan-history-page__count" role="status">
              {countLabel}
            </p>
          ) : null}
        </header>

        <div className="scan-history-page__scroll page-shell__scroll">
          {phase === 'loading' ? (
            <p className="scan-history-page__status">{t('scanHistory.loading')}</p>
          ) : null}

          {phase === 'error' ? (
            <div className="scan-history-page__error-wrap">
              <p className="scan-history-page__error" role="alert">
                {error}
              </p>
              <button
                type="button"
                className="btn-secondary scan-history-page__retry"
                onClick={() => void loadAll()}
              >
                {t('scanHistory.retry')}
              </button>
            </div>
          ) : null}

          {phase === 'empty' ? (
            <p className="scan-history-page__status">{t('scanHistory.empty')}</p>
          ) : null}

          {phase === 'ready' && rows.length > 0 ? (
            <ul className="scan-history-page__list">
              {rows.map((row) => (
                <li key={getScanHistoryRowKey(row)}>
                  <HomeLatestScan
                    row={row}
                    locale={locale}
                    t={t}
                    className="home-latest--card"
                    onOpen={() => onOpenScan(row)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <footer className="page-dock scan-history-page__dock" aria-label={t('common.back')}>
          <button type="button" className="btn-secondary scan-history-page__back" onClick={onBack}>
            {t('common.back')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}
