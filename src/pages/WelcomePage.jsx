import { useCallback, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { HealthScoreCore } from '../components/HealthScoreCore.jsx'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import { MetricCard } from '../components/metrics/MetricCard.jsx'
import { WelcomeSheetPreview } from '../components/welcome/WelcomeSheetPreview.jsx'
import { useI18n } from '../i18n/useI18n.js'
import {
  getWelcomeDemoDetail,
  getWelcomeDemoMetrics,
  getWelcomeSteps,
  WELCOME_DEMO_SCORE,
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
  const { locale, setLocale, t } = useI18n()
  const [localeError, setLocaleError] = useState('')
  const loading = authStatus === 'loading'
  const failed = authStatus === 'error'

  const welcomeSteps = getWelcomeSteps(locale)
  const demoMetrics = getWelcomeDemoMetrics(locale)
  const demoDetail = getWelcomeDemoDetail(locale)

  const handleLocaleChange = useCallback(
    async (next) => {
      if (next === locale) return
      setLocaleError('')
      try {
        await setLocale(next)
      } catch (e) {
        setLocaleError(e instanceof Error ? e.message : t('welcome.localeError'))
      }
    },
    [locale, setLocale, t],
  )

  return (
    <AppLayout>
      <div className="welcome-page page-shell">
        <header className="welcome-page__header">
          <div className="welcome-page__toolbar">
            <span className="welcome-page__brand">{t('welcome.brand')}</span>
            <div className="welcome-page__lang">
              <span className="welcome-page__lang-label" id="welcome-lang-label">
                {t('welcome.langLabel')}
              </span>
              <LanguageSwitch
                value={locale}
                onChange={handleLocaleChange}
                disabled={loading}
                labels={{ ru: t('lang.ru'), en: t('lang.en') }}
                aria-labelledby="welcome-lang-label"
              />
            </div>
          </div>
          <h1 className="welcome-page__title">{t('welcome.title')}</h1>
          <p className="welcome-page__lead">{t('welcome.lead')}</p>
          {localeError ? (
            <p className="welcome-page__locale-error" role="alert">
              {localeError}
            </p>
          ) : null}
        </header>

        <div className="welcome-page__scroll page-shell__scroll">
          <section className="welcome-block" aria-labelledby="welcome-steps-title">
            <h2 id="welcome-steps-title" className="welcome-block__title">
              {t('welcome.stepsTitle')}
            </h2>
            <ol className="welcome-steps">
              {welcomeSteps.map((step, i) => (
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
              {t('welcome.previewScoreTitle')}
            </h2>
            <p className="welcome-block__hint">{t('welcome.previewScoreHint')}</p>
            <div className="welcome-preview welcome-preview--score" aria-hidden>
              <HealthScoreCore score={WELCOME_DEMO_SCORE} layout="hero" />
            </div>
          </section>

          <section className="welcome-block" aria-labelledby="welcome-preview-metrics">
            <h2 id="welcome-preview-metrics" className="welcome-block__title">
              {t('welcome.metricsTitle')}
            </h2>
            <div className="welcome-tap-flow" aria-hidden>
              <span className="welcome-tap-flow__item">{t('welcome.tapFlow1')}</span>
              <span className="welcome-tap-flow__arrow" aria-hidden />
              <span className="welcome-tap-flow__item">{t('welcome.tapFlow2')}</span>
            </div>
            <div className="welcome-metrics-demo" aria-hidden>
              <div className="welcome-metrics-demo__cards">
                <div className="welcome-demo-hint-row">
                  <p className="welcome-demo-hint">{t('welcome.demoHint')}</p>
                </div>
                <div className="welcome-demo-grid">
                  {demoMetrics.map((metric, index) => (
                    <MetricCard
                      key={metric.key}
                      transcript={metric}
                      preview
                      highlighted={index === 0}
                    />
                  ))}
                </div>
              </div>
              <WelcomeSheetPreview detail={demoDetail} />
            </div>
          </section>

          {loading ? (
            <p className="welcome-status" aria-live="polite">
              {t('welcome.connecting')}
            </p>
          ) : null}
          {failed && authError ? (
            <p className="welcome-status welcome-status--error" role="alert">
              {authError}
            </p>
          ) : null}
        </div>

        <footer className="page-dock welcome-page__dock">
          <p className="page-dock__disclaimer">{t('welcome.disclaimer')}</p>
          {failed && onRetryAuth ? (
            <button type="button" className="btn-primary" onClick={onRetryAuth}>
              {t('welcome.retry')}
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={onContinue}
              disabled={loading}
            >
              {loading ? t('welcome.continueWait') : t('welcome.continue')}
            </button>
          )}
        </footer>
      </div>
    </AppLayout>
  )
}
