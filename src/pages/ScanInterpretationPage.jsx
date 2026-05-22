import { useLayoutEffect, useRef } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { useI18n } from '../i18n/useI18n.js'
import './ScanInterpretationPage.css'

function scrollInterpretationToTop(scrollEl) {
  if (scrollEl) {
    scrollEl.scrollTop = 0
    scrollEl.scrollLeft = 0
    let node = scrollEl.parentElement
    while (node) {
      if (node.scrollTop > 0 || node.scrollLeft > 0) {
        node.scrollTop = 0
        node.scrollLeft = 0
      }
      node = node.parentElement
    }
  }
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}

/**
 * @param {{
 *   scanId: string,
 *   interpretation: { phase: string, html: string, fromCache: boolean, error: string, scanId: string | null },
 *   regenerating: boolean,
 *   onRegenerate: () => void,
 *   onRetry: () => void,
 *   onBack: () => void,
 * }} props
 */
export function ScanInterpretationPage({
  scanId,
  interpretation,
  regenerating,
  onRegenerate,
  onRetry,
  onBack,
}) {
  const { t } = useI18n()
  const scrollRef = useRef(null)
  const { phase, html, fromCache, error } = interpretation
  const isCurrentScan = interpretation.scanId === scanId
  const showLoading = !isCurrentScan || phase === 'loading' || phase === 'idle'
  const showError = isCurrentScan && phase === 'error'
  const showEmpty = isCurrentScan && phase === 'empty'
  const showReady = isCurrentScan && phase === 'ready' && html

  useLayoutEffect(() => {
    scrollInterpretationToTop(scrollRef.current)
  }, [scanId])

  useLayoutEffect(() => {
    if (showReady) {
      scrollInterpretationToTop(scrollRef.current)
    }
  }, [showReady, html])

  return (
    <AppLayout>
      <div className="scan-interpretation page-shell">
        <header className="scan-interpretation__header">
          <h1 className="scan-interpretation__title">{t('scanInterpretation.title')}</h1>
          <p className="scan-interpretation__lead">{t('scanInterpretation.lead')}</p>
        </header>

        <div ref={scrollRef} className="scan-interpretation__scroll page-shell__scroll">
          {showLoading ? (
            <div className="scan-interpretation__status">
              <p>{t('scanInterpretation.loading')}</p>
              <p className="scan-interpretation__status-hint">{t('scanInterpretation.loadingHint')}</p>
            </div>
          ) : null}

          {showError ? (
            <div className="scan-interpretation__status">
              <p className="scan-interpretation__error" role="alert">
                {error}
              </p>
              <button type="button" className="btn-secondary" onClick={onRetry}>
                {t('scanInterpretation.retry')}
              </button>
            </div>
          ) : null}

          {showEmpty ? (
            <p className="scan-interpretation__status">{t('scanInterpretation.empty')}</p>
          ) : null}

          {showReady ? (
            <>
              {!fromCache ? (
                <p className="scan-interpretation__badge" role="status">
                  {t('scanInterpretation.fresh')}
                </p>
              ) : null}
              <article
                className="scan-interpretation__article"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </>
          ) : null}
        </div>

        <footer className="page-dock scan-interpretation__dock">
          <button
            type="button"
            className="btn-secondary scan-interpretation__regen"
            disabled={showLoading}
            onClick={onRegenerate}
          >
            {regenerating ? t('scanInterpretation.regenerating') : t('scanInterpretation.regenerate')}
          </button>
          <button type="button" className="btn-primary" onClick={onBack}>
            {t('scanInterpretation.back')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}
