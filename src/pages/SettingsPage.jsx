import { useCallback, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { SettingsIcon } from '../components/icons/SettingsIcon.jsx'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import { useI18n } from '../i18n/useI18n.js'
import './SettingsPage.css'

/**
 * @param {{ onBack: () => void, onLogout: () => void }} props
 */
export function SettingsPage({ onBack, onLogout }) {
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
            <SettingsIcon className="settings-page__title-icon" />
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

          <section
            className="settings-page__section settings-page__account"
            aria-labelledby="settings-account-title"
          >
            <h2 id="settings-account-title" className="settings-page__section-title">
              {t('results.settingsAccount')}
            </h2>
            <p className="settings-page__account-lead">{t('results.settingsLogoutLead')}</p>
            <button
              type="button"
              className="btn-secondary settings-page__logout"
              disabled={busy}
              onClick={onLogout}
            >
              {t('results.settingsLogout')}
            </button>
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
