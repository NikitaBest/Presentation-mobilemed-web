import { createContext } from 'react'

/** @typedef {import('./locale.js').AppLocale} AppLocale */

/** @type {React.Context<null | { locale: AppLocale; setLocale: (l: AppLocale) => Promise<void>; t: (key: string, vars?: Record<string, string>) => string }>} */
export const I18nContext = createContext(null)
