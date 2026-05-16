const STEP_STORAGE_KEY = 'mm_app_step'

export const APP_STEPS = [
  'welcome',
  'userData',
  'instruction',
  'scan',
  'results',
]

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
