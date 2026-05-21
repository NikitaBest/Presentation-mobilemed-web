/** Ключ в localStorage; значения ru | en (контракт API, см. docs/API.md). */
export const LOCALE_STORAGE_KEY = 'mm_app_locale'

/** Пользователь явно выбрал язык (экран при первом входе или смена в настройках). */
export const LOCALE_CHOSEN_STORAGE_KEY = 'mm_locale_chosen'

/** @typedef {'ru' | 'en'} AppLocale */

/** @returns {AppLocale} */
export function normalizeLocale(raw) {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (s === 'en' || s.startsWith('en-')) return 'en'
  return 'ru'
}

/**
 * Текущая локаль приложения: сохранённая или по языку браузера.
 * @returns {AppLocale}
 */
export function readLocaleForApp() {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (v != null && v !== '') return normalizeLocale(v)
  } catch {
    /* ignore */
  }
  if (typeof navigator !== 'undefined') {
    return normalizeLocale(navigator.language || 'ru')
  }
  return 'ru'
}

/** @param {AppLocale} locale */
export function writeLocaleToStorage(locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, normalizeLocale(locale))
  } catch {
    /* ignore */
  }
}

/** Первый вход уже пройден (выбор языка или сохранённая локаль из прошлых сессий). */
export function hasUserChosenLocale() {
  try {
    if (localStorage.getItem(LOCALE_CHOSEN_STORAGE_KEY) === '1') return true
    const v = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (v != null && v !== '') return true
  } catch {
    /* ignore */
  }
  return false
}

export function markLocaleAsChosen() {
  try {
    localStorage.setItem(LOCALE_CHOSEN_STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

/** Для JWT / тела login — ru | en */
export function getApiLocale() {
  return readLocaleForApp()
}

/** Заголовок Accept-Language (API: ru/en) */
export function getAcceptLanguageHeader() {
  return getApiLocale() === 'en' ? 'en' : 'ru'
}
