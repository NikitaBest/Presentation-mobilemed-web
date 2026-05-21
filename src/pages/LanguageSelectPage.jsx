import { useCallback, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { useI18n } from '../i18n/useI18n.js'
import { markLocaleAsChosen } from '../i18n/locale.js'
import './LanguageSelectPage.css'

/**
 * Первый экран: выбор языка перед главной (один тап → переход на welcome).
 * @param {{ onComplete: () => void }} props
 */
export function LanguageSelectPage({ onComplete }) {
  const { setLocale } = useI18n()
  const [pending, setPending] = useState(null)
  const [error, setError] = useState('')

  const handlePick = useCallback(
    async (code) => {
      if (pending) return
      setPending(code)
      setError('')
      try {
        await setLocale(code)
        markLocaleAsChosen()
        onComplete()
      } catch (e) {
        setPending(null)
        setError(
          e instanceof Error
            ? e.message
            : code === 'en'
              ? 'Could not apply language. Please try again.'
              : 'Не удалось применить язык. Попробуйте ещё раз.',
        )
      }
    },
    [onComplete, pending, setLocale],
  )

  const busy = pending != null

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
          <div className="lang-select__options" role="group" aria-label="Выберите язык / Choose your language">
            <button
              type="button"
              className={`lang-select__option${pending === 'ru' ? ' lang-select__option--pending' : ''}`}
              disabled={busy}
              onClick={() => handlePick('ru')}
            >
              <span className="lang-select__option-label">Русский</span>
              <span className="lang-select__option-hint" lang="ru">
                Russian
              </span>
            </button>
            <button
              type="button"
              className={`lang-select__option${pending === 'en' ? ' lang-select__option--pending' : ''}`}
              disabled={busy}
              onClick={() => handlePick('en')}
            >
              <span className="lang-select__option-label">English</span>
              <span className="lang-select__option-hint" lang="en">
                Английский
              </span>
            </button>
          </div>

          {busy ? (
            <p className="lang-select__status" role="status">
              {pending === 'en' ? 'Please wait…' : 'Подождите…'}
            </p>
          ) : null}

          {error ? (
            <p className="lang-select__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
