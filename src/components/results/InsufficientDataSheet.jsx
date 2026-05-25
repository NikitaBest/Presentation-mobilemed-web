import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../../i18n/useI18n.js'
import './InsufficientDataSheet.css'

const MIN_METRICS = 8

/**
 * @param {{
 *   metricsCount: number,
 *   visible: boolean,
 *   onRetry: () => void,
 *   onDismiss: () => void,
 * }} props
 */
export function InsufficientDataSheet({ metricsCount, visible, onRetry, onDismiss }) {
  const { t } = useI18n()
  const titleId = useId()
  const open = visible && metricsCount < MIN_METRICS

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('mm-insufficient-sheet-open')
    const onKey = (event) => {
      if (event.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.body.classList.remove('mm-insufficient-sheet-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onDismiss])

  if (!open) return null

  const isEmpty = metricsCount === 0

  return createPortal(
    <div className="insufficient-sheet" role="presentation">
      <button
        type="button"
        className="insufficient-sheet__backdrop"
        aria-label={t('common.close')}
        onClick={onDismiss}
      />
      <div className="insufficient-sheet__column">
        <div
          className="insufficient-sheet__panel"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className="insufficient-sheet__scroll">
            <div className="insufficient-sheet__handle" aria-hidden />

            <div className="insufficient-sheet__icon" aria-hidden>
              <svg viewBox="0 0 48 48" fill="none" focusable="false">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
                <path
                  d="M24 14v12M24 32v2"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h2 id={titleId} className="insufficient-sheet__title">
              {isEmpty
                ? t('results.insufficientData.titleEmpty')
                : t('results.insufficientData.title')}
            </h2>

            <p className="insufficient-sheet__body">
              {isEmpty
                ? t('results.insufficientData.bodyEmpty')
                : t('results.insufficientData.body', { count: String(metricsCount) })}
            </p>

            <ul className="insufficient-sheet__tips">
              <li>{t('results.insufficientData.tip1')}</li>
              <li>{t('results.insufficientData.tip2')}</li>
              <li>{t('results.insufficientData.tip3')}</li>
            </ul>
          </div>

          <footer className="insufficient-sheet__footer">
            <button type="button" className="insufficient-sheet__btn insufficient-sheet__btn--primary" onClick={onRetry}>
              {t('results.insufficientData.retry')}
            </button>
            <button type="button" className="insufficient-sheet__btn insufficient-sheet__btn--secondary" onClick={onDismiss}>
              {t('results.insufficientData.dismiss')}
            </button>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  )
}
