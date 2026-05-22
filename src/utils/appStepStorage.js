import { getStoredToken } from '../api/session.js'
import { hasUserChosenLocale } from '../i18n/locale.js'

const STEP_STORAGE_KEY = 'mm_app_step'

/** Экран выбора языка при первом входе (не в цепочке «Далее»). */
export const LANGUAGE_STEP = 'language'

/** Вход / регистрация после выбора языка (не в цепочке сканирования). */
export const AUTH_STEP = 'auth'

/** Настройки (не в цепочке сканирования). */
export const SETTINGS_STEP = 'settings'

/** Полная история сканов (не в цепочке сканирования). */
export const SCAN_HISTORY_STEP = 'scanHistory'

/** LLM-расшифровка скана (оверлей, не в цепочке сканирования). */
export const SCAN_INTERPRETATION_STEP = 'scanInterpretation'

/** Информационные баннеры с главной (оверлей). */
export const HOME_BANNERS_STEP = 'homeBanners'

/** Главная после выбора языка (не в цепочке сканирования). */
export const HOME_STEP = 'home'

/** Линейный сценарий: описание → анкета → подготовка → скан → результаты. */
export const APP_STEPS = [
  'welcome',
  'userData',
  'instruction',
  'scan',
  'results',
]

/**
 * Стартовый шаг: выбор языка при первом входе, иначе из sessionStorage.
 * @returns {string}
 */
export function readInitialStep() {
  if (!hasUserChosenLocale()) return LANGUAGE_STEP
  if (!getStoredToken()) return AUTH_STEP
  return readPersistedStep()
}

/**
 * @returns {string}
 */
export function readPersistedStep() {
  try {
    const raw = sessionStorage.getItem(STEP_STORAGE_KEY)
    if (raw && PERSISTED_STEPS.includes(raw)) return raw
  } catch {
    /* private mode / quota */
  }
  return HOME_STEP
}

const PERSISTED_STEPS = [HOME_STEP, ...APP_STEPS]

/**
 * @param {string} step
 */
export function writePersistedStep(step) {
  if (!PERSISTED_STEPS.includes(step)) return
  try {
    sessionStorage.setItem(STEP_STORAGE_KEY, step)
  } catch {
    /* ignore */
  }
}

export function clearPersistedStep() {
  try {
    sessionStorage.removeItem(STEP_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
