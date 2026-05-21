import { useCallback, useEffect, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { HomeLatestScan } from '../components/home/HomeLatestScan.jsx'
import { getScansHistory } from '../api/scanHistory.js'
import { useI18n } from '../i18n/useI18n.js'
import '../components/home/HomeLatestScan.css'
import './ScanHistoryPage.css'

const PAGE_SIZE = 20

function scanRowKey(row) {
  return row?.scan?.id ?? row?.rppgScanId ?? `${row?.scan?.createdAt ?? row?.createdAt ?? ''}`
}

/**
 * @param {{ onBack: () => void, onOpenScan: (row: object) => void }} props
 */
export function ScanHistoryPage({ onBack, onOpenScan }) {
  const { locale, t } = useI18n()
  const [phase, setPhase] = useState('loading')
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadPage = useCallback(
    async (pageNumber, { append = false } = {}) => {
      if (append) {
        setLoadingMore(true)
      } else {
        setPhase('loading')
        setError('')
      }
      try {
        const res = await getScansHistory({ pageNumber, pageSize: PAGE_SIZE })
        const value = res?.value
        const data = Array.isArray(value?.data) ? value.data : []
        setRows((prev) => {
          const next = append ? [...prev, ...data] : data
          setPhase(next.length > 0 ? 'ready' : 'empty')
          return next
        })
        setHasNext(Boolean(value?.hasNext))
        setPage(pageNumber)
      } catch (e) {
        if (!append) {
          setPhase('error')
          setRows([])
        }
        setError(e instanceof Error ? e.message : t('scanHistory.error'))
      } finally {
        setLoadingMore(false)
      }
    },
    [t],
  )

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- загрузка полной истории */
    void loadPage(1)
  }, [loadPage])

  const handleLoadMore = useCallback(() => {
    if (!hasNext || loadingMore) return
    void loadPage(page + 1, { append: true })
  }, [hasNext, loadPage, loadingMore, page])

  return (
    <AppLayout>
      <div className="scan-history-page page-shell">
        <header className="scan-history-page__header">
          <span className="scan-history-page__brand">{t('home.brand')}</span>
          <h1 className="scan-history-page__title">{t('scanHistory.title')}</h1>
          <p className="scan-history-page__lead">{t('scanHistory.lead')}</p>
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
                onClick={() => void loadPage(1)}
              >
                {t('scanHistory.retry')}
              </button>
            </div>
          ) : null}

          {phase === 'empty' ? (
            <p className="scan-history-page__status">{t('scanHistory.empty')}</p>
          ) : null}

          {phase === 'ready' && rows.length > 0 ? (
            <>
              <ul className="scan-history-page__list">
                {rows.map((row) => (
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
              {hasNext ? (
                <button
                  type="button"
                  className="btn-secondary scan-history-page__more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? t('scanHistory.loading') : t('scanHistory.loadMore')}
                </button>
              ) : null}
            </>
          ) : null}
        </div>

        <footer className="page-dock scan-history-page__dock">
          <button type="button" className="btn-secondary" onClick={onBack}>
            {t('common.back')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}
