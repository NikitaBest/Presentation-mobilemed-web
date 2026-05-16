import { useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
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
  const [ready, setReady] = useState(false)

  return (
    <AppLayout>
      <div className="scan-prep page-shell">
        <header className="scan-prep-header">
          <h1 className="scan-prep-screen-title">Подготовка</h1>
          <p className="scan-prep-lead">
            Подготовьтесь к сканированию. Следуйте рекомендациям для точного результата.
          </p>
        </header>

        <div className="scan-prep-content page-shell__scroll">
          <div className="scan-prep-info-cards">
            <div className="scan-prep-info-card">
              <IconLock />
              <span className="scan-prep-info-text">Приватно</span>
            </div>
            <div className="scan-prep-info-card">
              <IconClock />
              <span className="scan-prep-info-text">~60 секунд</span>
            </div>
            <div className="scan-prep-info-card">
              <IconDoc />
              <span className="scan-prep-info-text">Не диагноз</span>
            </div>
          </div>

          <h2 className="scan-prep-important-title">Важные рекомендации</h2>

          <div className="scan-prep-requirements">
            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">Хорошее освещение</h3>
                <p className="scan-prep-req-desc">
                  Убедитесь, что лицо хорошо освещено. Избегайте сильных теней на лице.
                </p>
              </div>
            </div>

            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">Не двигайтесь</h3>
                <p className="scan-prep-req-desc">
                  Сядьте, держите устройство на расстоянии 20–30 см, не говорите во время
                  сканирования.
                </p>
              </div>
            </div>

            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">Доступность</h3>
                <p className="scan-prep-req-desc">
                  Снимите очки и головной убор — они мешают сканированию.
                </p>
                <p className="scan-prep-req-desc scan-prep-req-desc--extra">
                  Не проводите сканирование при заряде батареи менее 20%.
                </p>
              </div>
            </div>

            <div className="scan-prep-req-item">
              <div className="scan-prep-req-icon-wrap" aria-hidden>
                <IconRequirement />
              </div>
              <div className="scan-prep-req-body">
                <h3 className="scan-prep-req-title">Спокойствие</h3>
                <p className="scan-prep-req-desc">
                  Не занимайтесь интенсивной активностью прямо перед сканированием, не курите.
                </p>
              </div>
            </div>
          </div>

          <label className="scan-prep-confirm">
            <input
              type="checkbox"
              checked={ready}
              onChange={(e) => setReady(e.target.checked)}
            />
            <span className="scan-prep-confirm-text">Понятно, я готов(а) к сканированию</span>
          </label>
        </div>

        <footer className="page-dock scan-prep-footer">
          <div className="page-footer--row">
            <button type="button" className="btn-secondary" onClick={onBack}>
              Назад
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!ready}
              onClick={onContinue}
            >
              Начать сканирование
            </button>
          </div>
        </footer>
      </div>
    </AppLayout>
  )
}
