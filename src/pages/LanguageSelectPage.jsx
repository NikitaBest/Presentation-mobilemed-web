import { useCallback, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { useI18n } from '../i18n/useI18n.js'
import { markLocaleAsChosen } from '../i18n/locale.js'
import { formatMessage } from '../i18n/messages.js'
import './LanguageSelectPage.css'

/**
 * @param {{ onComplete: () => void }} props
 */
export function LanguageSelectPage({ onComplete }) {
  const { locale, setLocale } = useI18n()
  const [selected, setSelected] = useState(locale)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSelect = useCallback((code) => {
    if (saving) return
    setSelected(code)
    setError('')
  }, [saving])

  const handleContinue = useCallback(async () => {
    if (saving || selected == null) return
    setSaving(true)
    setError('')
    try {
      await setLocale(selected)
      markLocaleAsChosen()
      onComplete()
    } catch (e) {
      setSaving(false)
      setError(
        e instanceof Error
          ? e.message
          : formatMessage(selected, 'languageSelect.error'),
      )
    }
  }, [onComplete, saving, selected, setLocale])

  const continueLabel =
    selected == null
      ? 'Продолжить / Continue'
      : formatMessage(selected, 'languageSelect.continue')

  const waitLabel =
    selected == null
      ? 'Подождите… / Please wait…'
      : formatMessage(selected, 'languageSelect.continueWait')

  return (
    <AppLayout>
      <div className="lang-select page-shell">
        <header className="lang-select__header">
          <span className="lang-select__brand">MobileMed</span>
          <h1 className="lang-select__title">
            <span className="lang-select__title-line">Выберите язык</span>
            <span className="lang-select__title-line lang-select__title-line--muted">
              Choose your language
            </span>
          </h1>
          <p className="lang-select__lead">
            <span className="lang-select__lead-line">
              Язык интерфейса и ответов сервера. Можно изменить позже в настройках.
            </span>
            <span className="lang-select__lead-line lang-select__lead-line--muted">
              UI and API response language. You can change it later in settings.
            </span>
          </p>
        </header>

        <div className="lang-select__content page-shell__scroll">
          <div
            className="lang-select__options"
            role="radiogroup"
            aria-label="Выберите язык / Choose your language"
          >
            <button
              type="button"
              role="radio"
              aria-checked={selected === 'ru'}
              className={`lang-select__option${selected === 'ru' ? ' lang-select__option--selected' : ''}`}
              disabled={saving}
              onClick={() => handleSelect('ru')}
            >
              <span className="lang-select__option-label">Русский</span>
              <span className="lang-select__option-hint" lang="ru">
                Russian
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={selected === 'en'}
              className={`lang-select__option${selected === 'en' ? ' lang-select__option--selected' : ''}`}
              disabled={saving}
              onClick={() => handleSelect('en')}
            >
              <span className="lang-select__option-label">English</span>
              <span className="lang-select__option-hint" lang="en">
                Английский
              </span>
            </button>
          </div>

          {error ? (
            <p className="lang-select__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="page-dock lang-select__dock">
          <button
            type="button"
            className="btn-primary"
            disabled={selected == null || saving}
            onClick={handleContinue}
          >
            {saving ? waitLabel : continueLabel}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}
