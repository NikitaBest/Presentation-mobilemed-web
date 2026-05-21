import { useCallback, useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { useI18n } from '../i18n/useI18n.js'
import { markLocaleAsChosen } from '../i18n/locale.js'
import { formatMessage } from '../i18n/messages.js'
import './LanguageSelectPage.css'

const LANGUAGES = [
  { code: 'ru', labelKey: 'lang.ru' },
  { code: 'en', labelKey: 'lang.en' },
]

/**
 * @param {{ onComplete: () => void }} props
 */
export function LanguageSelectPage({ onComplete }) {
  const { locale, setLocale } = useI18n()
  const [selected, setSelected] = useState(locale)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const preview = selected ?? locale

  const msg = useCallback((key, vars) => formatMessage(preview, key, vars), [preview])

  const headerCopy = useMemo(
    () => ({
      title: msg('languageSelect.title'),
      lead: msg('languageSelect.lead'),
      hint: msg('languageSelect.hintSettings'),
    }),
    [msg],
  )

  const handleSelect = useCallback(
    (code) => {
      if (saving) return
      setSelected(code)
      setError('')
    },
    [saving],
  )

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
      setError(e instanceof Error ? e.message : msg('languageSelect.error'))
    }
  }, [msg, onComplete, saving, selected, setLocale])

  return (
    <AppLayout>
      <div className="lang-select page-shell">
        <div className="lang-select__body page-shell__scroll">
          <header className="lang-select__header">
            <span className="lang-select__brand">{msg('home.brand')}</span>
            <h1 className="lang-select__title">{headerCopy.title}</h1>
            <p className="lang-select__lead">{headerCopy.lead}</p>
            <p className="lang-select__hint">{headerCopy.hint}</p>
          </header>

          <div
            className="lang-select__panel"
            role="radiogroup"
            aria-label={msg('languageSelect.ariaGroup')}
          >
            {LANGUAGES.map((item, index) => {
              const isSelected = selected === item.code
              return (
                <button
                  key={item.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`lang-select__row${isSelected ? ' lang-select__row--selected' : ''}${
                    index > 0 ? ' lang-select__row--bordered' : ''
                  }`}
                  disabled={saving}
                  onClick={() => handleSelect(item.code)}
                >
                  <span className="lang-select__row-label">{formatMessage(item.code, item.labelKey)}</span>
                  <span
                    className={`lang-select__check${isSelected ? ' lang-select__check--on' : ''}`}
                    aria-hidden
                  >
                    {isSelected ? (
                      <svg viewBox="0 0 20 20" fill="none" focusable="false">
                        <path
                          d="M5 10.5 8.5 14 15 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                </button>
              )
            })}
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
            onClick={() => void handleContinue()}
          >
            {saving ? msg('languageSelect.continueWait') : msg('languageSelect.continue')}
          </button>
        </footer>
      </div>
    </AppLayout>
  )
}
