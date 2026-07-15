import { useCallback, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { LanguageSwitch } from '../components/LanguageSwitch.jsx'
import { useI18n } from '../i18n/useI18n.js'
import './SettingsPage.css'

/**
 * @param {{
 *   onBack: () => void,
 *   onLogout: () => void,
 *   onOpenDocuments: () => void,
 * }} props
 */
export function SettingsPage({ onBack, onLogout, onOpenDocuments }) {
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
          <h1 className="settings-page__title">{t('results.settingsTitle')}</h1>
        </header>

        <div className="settings-page__scroll page-shell__scroll">
          <section className="settings-page__group" aria-labelledby="settings-general-title">
            <h2 id="settings-general-title" className="settings-page__group-label">
              {t('settings.general')}
            </h2>
            <ul className="settings-page__list">
              <li className="settings-page__item settings-page__item--lang">
                <div className="settings-page__row">
                  <span className="settings-page__row-label">{t('results.settingsLang')}</span>
                  <LanguageSwitch
                    value={locale}
                    onChange={handleLocaleChange}
                    disabled={busy}
                    labels={{ ru: t('lang.ru'), en: t('lang.en') }}
                    aria-labelledby="settings-general-title"
                  />
                </div>
              </li>
              <li className="settings-page__item">
                <button
                  type="button"
                  className="settings-page__row settings-page__row--link"
                  disabled={busy}
                  onClick={onOpenDocuments}
                >
                  <span className="settings-page__link-text">
                    <span className="settings-page__link-title">{t('settings.documents.open')}</span>
                    <span className="settings-page__link-subtitle">
                      {t('settings.documents.subtitle')}
                    </span>
                  </span>
                  <span className="settings-page__chevron" aria-hidden>
                    ›
                  </span>
                </button>
              </li>
            </ul>
            {error ? (
              <p className="settings-page__error" role="alert">
                {error}
              </p>
            ) : null}
          </section>

          <section className="settings-page__group" aria-labelledby="settings-account-title">
            <h2 id="settings-account-title" className="settings-page__group-label">
              {t('results.settingsAccount')}
            </h2>
            <ul className="settings-page__list">
              <li className="settings-page__item">
                <button
                  type="button"
                  className="settings-page__row settings-page__row--danger"
                  disabled={busy}
                  onClick={onLogout}
                >
                  {t('results.settingsLogout')}
                </button>
              </li>
            </ul>
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
