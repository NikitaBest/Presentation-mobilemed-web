const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_MIN = 6
const PASSWORD_MAX = 128

function trim(raw) {
  return String(raw ?? '').trim()
}

/**
 * @param {string} raw
 * @param {{ required?: boolean, t?: (key: string, vars?: Record<string, string>) => string }} opts
 */
export function validateAuthEmailField(raw, { required = false, t } = {}) {
  const tr = (key, vars) => (typeof t === 'function' ? t(key, vars) : '')
  const s = trim(raw)
  if (s === '') return required ? tr('auth.validation.emailRequired') : ''
  if (!EMAIL_RE.test(s)) return tr('auth.validation.emailInvalid')
  if (s.length > 254) return tr('auth.validation.emailTooLong')
  return ''
}

/**
 * @param {string} raw
 * @param {{ required?: boolean, t?: (key: string, vars?: Record<string, string>) => string }} opts
 */
export function validateAuthPasswordField(raw, { required = false, t } = {}) {
  const tr = (key, vars) => (typeof t === 'function' ? t(key, vars) : '')
  const s = String(raw ?? '')
  if (s === '') return required ? tr('auth.validation.passwordRequired') : ''
  if (s.length < PASSWORD_MIN) {
    return tr('auth.validation.passwordMin', { min: String(PASSWORD_MIN) })
  }
  if (s.length > PASSWORD_MAX) {
    return tr('auth.validation.passwordMax', { max: String(PASSWORD_MAX) })
  }
  return ''
}
