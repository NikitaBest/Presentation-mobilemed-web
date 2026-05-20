import { useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { useI18n } from '../i18n/useI18n.js'
import './ScanInstructionPage.css'

function IconLock() {
  return (
    <svg className="scan-prep-info-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg className="scan-prep-info-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDoc() {
  return (
    <svg className="scan-prep-info-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8l4 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 4v4h4M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconRequirement() {
  return (
    <svg className="scan-prep-req-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v4M12 16v4M4 12h4M16 12h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}

/**
 * Инструкция перед сканированием (по референсу Preparation).
 */
export function ScanInstructionPage({ onBack, onContinue }) {
  const { t } = useI18n()
  const [ready, setReady] = useState(false)

  return (
    <AppLayout>
      <div className="scan-prep page-shell">
        <header className="scan-prep-header">
          <h1 className="scan-prep-screen-title">{t('instruction.title')}</h1>
          <p className="scan-prep-lead">{t('instruction.lead')}</p>
        </header>

        <div className="scan-prep-content page-shell__scroll">
          <div className="scan-prep-info-cards">
            <div className="scan-prep-info-card">
              <IconLock />
              <span className="scan-prep-info-text">{t('instruction.cardPrivate')}</span>
            </div>
            <div className="scan-prep-info-card">
              <IconClock />
              <span className="scan-prep-info-text">{t('instruction.cardTime')}</span>
            </div>
            <div className="scan-prep-info-card">
              <IconDoc />
              <span className="scan-prep-info-text">{t('instruction.cardNotDiag')}</span>
            </div>
          </div>

          <h2 className="scan-prep-important-title">{t('instruction.important')}</h2>

          <div className="scan-prep-requirements">
            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">{t('instruction.req1Title')}</h3>
                <p className="scan-prep-req-desc">{t('instruction.req1Text')}</p>
              </div>
            </div>

            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">{t('instruction.req2Title')}</h3>
                <p className="scan-prep-req-desc">{t('instruction.req2Text')}</p>
              </div>
            </div>

            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">{t('instruction.req3Title')}</h3>
                <p className="scan-prep-req-desc">{t('instruction.req3Text')}</p>
                <p className="scan-prep-req-desc scan-prep-req-desc--extra">
                  {t('instruction.req3Extra')}
                </p>
              </div>
            </div>

            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">{t('instruction.req4Title')}</h3>
                <p className="scan-prep-req-desc">{t('instruction.req4Text')}</p>
              </div>
            </div>
          </div>

          <label className="scan-prep-confirm">
            <input
              type="checkbox"
              checked={ready}
              onChange={(e) => setReady(e.target.checked)}
            />
            <span className="scan-prep-confirm-text">{t('instruction.confirm')}</span>
          </label>
        </div>

        <footer className="page-dock scan-prep-footer">
          <div className="page-footer--row">
            <button type="button" className="btn-secondary" onClick={onBack}>
              {t('common.back')}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!ready}
              onClick={onContinue}
            >
              {t('instruction.startScan')}
            </button>
          </div>
        </footer>
      </div>
    </AppLayout>
  )
}
