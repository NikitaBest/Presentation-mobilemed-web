import { useCallback, useEffect, useRef, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { HomeLatestScan } from '../components/home/HomeLatestScan.jsx'
import {
  getScansHistory,
  getScanHistoryRowKey,
  mergeScanHistoryRows,
} from '../api/scanHistory.js'
import { useI18n } from '../i18n/useI18n.js'
import '../components/home/HomeLatestScan.css'
import './ScanHistoryPage.css'

const PAGE_SIZE = 10

/**
 * @param {{ onBack: () => void, onOpenScan: (row: object) => void }} props
 */
export function ScanHistoryPage({ onBack, onOpenScan }) {
  const { locale, localeRevision, t } = useI18n()
  const [phase, setPhase] = useState('loading')
  const [rows, setRows] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const pageRef = useRef(1)
  const sentinelRef = useRef(null)

  const loadPage = useCallback(
    async (pageNumber, append = false) => {
      if (!append) {
        setPhase('loading')
        setError('')
      } else {
        setLoadingMore(true)
      }

      try {
        const res = await getScansHistory({ pageNumber, pageSize: PAGE_SIZE })
        const value = res?.value
        const chunk = Array.isArray(value?.data) ? value.data : []
        const nextHasMore = Boolean(value?.hasNext) && chunk.length > 0

        if (typeof value?.totalCount === 'number' && Number.isFinite(value.totalCount)) {
          setTotalCount(value.totalCount)
        }

        if (append) {
          setRows((prev) => mergeScanHistoryRows(prev, chunk))
        } else {
          setRows(chunk)
        }

        setHasMore(nextHasMore)
        pageRef.current = pageNumber
        setPhase((prev) => (append ? prev : chunk.length > 0 ? 'ready' : 'empty'))
      } catch (e) {
        if (!append) {
          setPhase('error')
          setRows([])
          setTotalCount(0)
        }
        setError(e instanceof Error ? e.message : t('scanHistory.error'))
      } finally {
        setLoadingMore(false)
      }
    },
    [t],
  )

  useEffect(() => {
    pageRef.current = 1
    void loadPage(1)
  }, [loadPage, localeRevision])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    void loadPage(pageRef.current + 1, true)
  }, [loadingMore, hasMore, loadPage])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

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
                onClick={() => {
                  pageRef.current = 1
                  void loadPage(1)
                }}
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

              {hasMore ? (
                <div ref={sentinelRef} className="scan-history-page__sentinel">
                  {loadingMore ? (
                    <p className="scan-history-page__loading-more">
                      {t('scanHistory.loading')}
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary scan-history-page__more"
                      onClick={loadMore}
                    >
                      {t('scanHistory.loadMore')}
                    </button>
                  )}
                </div>
              ) : null}
            </>
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
