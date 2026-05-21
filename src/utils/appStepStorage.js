import { hasUserChosenLocale } from '../i18n/locale.js'

const STEP_STORAGE_KEY = 'mm_app_step'

/** Экран выбора языка при первом входе (не в цепочке «Далее»). */
export const LANGUAGE_STEP = 'language'

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
  return readPersistedStep()
}

/**
 * @returns {string}
 */
export function readPersistedStep() {
  try {
    const raw = sessionStorage.getItem(STEP_STORAGE_KEY)
    if (raw && APP_STEPS.includes(raw)) return raw
  } catch {
    /* private mode / quota */
  }
  return 'welcome'
}

/**
 * @param {string} step
 */
export function writePersistedStep(step) {
  if (!APP_STEPS.includes(step)) return
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
