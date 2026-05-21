import { useCallback, useEffect, useMemo, useState } from 'react'
import { reauthenticateWithCurrentLocale } from '../api/auth.js'
import { getStoredToken } from '../api/session.js'
import { I18nContext } from './I18nContext.js'
import {
  markLocaleAsChosen,
  normalizeLocale,
  readLocaleForApp,
  writeLocaleToStorage,
} from './locale.js'
import { formatMessage } from './messages.js'

/** @typedef {import('./locale.js').AppLocale} AppLocale */

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => readLocaleForApp())

  const applyDocumentLang = useCallback((loc) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = loc === 'en' ? 'en' : 'ru'
    }
  }, [])

  useEffect(() => {
    applyDocumentLang(locale)
  }, [locale, applyDocumentLang])

  const setLocale = useCallback(async (next) => {
    const normalized = normalizeLocale(next)
    if (normalized === locale) {
      applyDocumentLang(normalized)
      return
    }
    writeLocaleToStorage(normalized)
    markLocaleAsChosen()
    setLocaleState(normalized)
    applyDocumentLang(normalized)
    if (getStoredToken()) {
      await reauthenticateWithCurrentLocale()
    }
  }, [locale, applyDocumentLang])

  const t = useCallback(
    (key, vars) => formatMessage(locale, key, vars),
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
