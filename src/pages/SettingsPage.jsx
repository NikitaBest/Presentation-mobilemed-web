import { useCallback, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import { useI18n } from '../i18n/useI18n.js'
import './SettingsPage.css'

function IconSettings() {
  return (
    <svg className="settings-page__title-icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 13a7.97 7.97 0 0 0 .1-2l2-1.2-2-3.4-2.3.9a8.1 8.1 0 0 0-1.7-1L15.5 2h-7L8.5 5.3a8.1 8.1 0 0 0-1.7 1L4.5 5.4l-2 3.4 2 1.2a7.97 7.97 0 0 0 0 2l-2 1.2 2 3.4 2.3-.9a8.1 8.1 0 0 0 1.7 1L8.5 22h7l.8-3.3a8.1 8.1 0 0 0 1.7-1l2.3.9 2-3.4-1.9-1.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * @param {{ onBack: () => void }} props
 */
export function SettingsPage({ onBack }) {
  const { locale, setLocale, t } = useI18n()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleLocaleChange = useCallback(
    async (next) => {
      if (next === locale || busy) return
      setError('')
      setBusy(true)
      try {
        await setLocale(next)
      } catch (e) {
        setError(e instanceof Error ? e.message : t('results.localeError'))
      } finally {
        setBusy(false)
      }
    },
    [busy, locale, setLocale, t],
  )

  return (
    <AppLayout>
      <div className="settings-page page-shell">
        <header className="settings-page__header">
          <span className="settings-page__brand">{t('results.brand')}</span>
          <h1 className="settings-page__title">
            <IconSettings />
            {t('results.settingsTitle')}
          </h1>
        </header>

        <div className="settings-page__scroll page-shell__scroll">
          <section
            className="settings-page__section settings-page__lang"
            aria-labelledby="settings-lang-title"
          >
            <h2 id="settings-lang-title" className="settings-page__section-title">
              {t('results.settingsLang')}
            </h2>
            <LanguageSwitch
              value={locale}
              onChange={handleLocaleChange}
              disabled={busy}
              labels={{ ru: t('lang.ru'), en: t('lang.en') }}
              aria-label={t('results.settingsLang')}
            />
            {error ? (
              <p className="settings-page__error" role="alert">
                {error}
              </p>
            ) : null}
          </section>
        </div>

        <footer className="page-dock settings-page__dock" aria-label={t('common.back')}>
          <button
            type="button"
            className="btn-secondary settings-page__back"
            onClick={onBack}
            disabled={busy}
          >
            {t('common.back')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}
