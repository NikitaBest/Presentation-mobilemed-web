import { AppLayout } from '../components/AppLayout.jsx'
import { HealthScoreCore } from '../components/HealthScoreCore.jsx'
import { MetricCard } from '../components/metrics/MetricCard.jsx'
import { WelcomeSheetPreview } from '../components/welcome/WelcomeSheetPreview.jsx'
import {
  WELCOME_DEMO_DETAIL,
  WELCOME_DEMO_METRICS,
  WELCOME_DEMO_SCORE,
  WELCOME_STEPS,
} from './welcomeDemoData.js'
import './WelcomePage.css'

/**
 * Стартовый экран: знакомство с сервисом и переход к сценарию.
 */
export function WelcomePage({
  authStatus = 'ready',
  authError = '',
  onRetryAuth,
  onContinue,
}) {
  const loading = authStatus === 'loading'
  const failed = authStatus === 'error'

  return (
    <AppLayout>
      <div className="welcome-page page-shell">
        <header className="welcome-page__header">
          <span className="welcome-page__brand">MobileMed</span>
          <h1 className="welcome-page__title">Оценка здоровья по лицу</h1>
          <p className="welcome-page__lead">
            Сканирование через камеру телефона — без отдельного приложения, прямо в браузере.
          </p>
        </header>

        <div className="welcome-page__scroll page-shell__scroll">
          <section className="welcome-block" aria-labelledby="welcome-steps-title">
            <h2 id="welcome-steps-title" className="welcome-block__title">
              Как это работает
            </h2>
            <ol className="welcome-steps">
              {WELCOME_STEPS.map((step, i) => (
                <li key={step.title} className="welcome-step">
                  <span className="welcome-step__num" aria-hidden>
                    {i + 1}
                  </span>
                  <div className="welcome-step__text">
                    <span className="welcome-step__label">{step.title}</span>
                    <span className="welcome-step__desc">{step.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="welcome-block" aria-labelledby="welcome-preview-score">
            <h2 id="welcome-preview-score" className="welcome-block__title">
              Пример результатов
            </h2>
            <p className="welcome-block__hint">Общий показатель после сканирования</p>
            <div className="welcome-preview welcome-preview--score" aria-hidden>
              <HealthScoreCore score={WELCOME_DEMO_SCORE} layout="hero" />
            </div>
          </section>

          <section className="welcome-block" aria-labelledby="welcome-preview-metrics">
            <h2 id="welcome-preview-metrics" className="welcome-block__title">
              Показатели
            </h2>
            <div className="welcome-tap-flow" aria-hidden>
              <span className="welcome-tap-flow__item">Нажмите карточку</span>
              <span className="welcome-tap-flow__arrow" aria-hidden />
              <span className="welcome-tap-flow__item">Окно с расшифровкой</span>
            </div>
            <div className="welcome-metrics-demo" aria-hidden>
              <div className="welcome-metrics-demo__cards">
                <div className="welcome-demo-hint-row">
                  <p className="welcome-demo-hint">Нажмите, чтобы узнать больше</p>
                </div>
                <div className="welcome-demo-grid">
                  {WELCOME_DEMO_METRICS.map((t, index) => (
                    <MetricCard
                      key={t.key}
                      transcript={t}
                      preview
                      highlighted={index === 0}
                    />
                  ))}
                </div>
              </div>
              <WelcomeSheetPreview detail={WELCOME_DEMO_DETAIL} />
            </div>
          </section>

          {loading ? (
            <p className="welcome-status" aria-live="polite">
              Подключение к серверу…
            </p>
          ) : null}
          {failed && authError ? (
            <p className="welcome-status welcome-status--error" role="alert">
              {authError}
            </p>
          ) : null}
        </div>

        <footer className="page-dock welcome-page__dock">
          <p className="page-dock__disclaimer">
            Нужен доступ к камере на шаге сканирования. Сервис не заменяет консультацию врача.
          </p>
          {failed && onRetryAuth ? (
            <button type="button" className="btn-primary" onClick={onRetryAuth}>
              Повторить
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={onContinue}
              disabled={loading}
            >
              {loading ? 'Подождите…' : 'Начать измерение'}
            </button>
          )}
        </footer>
      </div>
    </AppLayout>
  )
}
