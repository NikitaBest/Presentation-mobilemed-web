/**
 * Сессия после auth/login (см. docs/API.md).
 * В mm_api_user_id попадает идентификатор пользователя (как в JWT и user.id), см. resolveLoginUserId в auth.js.
 */
const STORAGE_TOKEN = 'mm_api_token'
const STORAGE_USER_ID = 'mm_api_user_id'
const STORAGE_EMAIL = 'mm_api_email'

export function getStoredToken() {
  try {
    return sessionStorage.getItem(STORAGE_TOKEN) ?? ''
  } catch {
    return ''
  }
}

export function getStoredUserId() {
  try {
    return sessionStorage.getItem(STORAGE_USER_ID) ?? ''
  } catch {
    return ''
  }
}

export function getStoredEmail() {
  try {
    return sessionStorage.getItem(STORAGE_EMAIL) ?? ''
  } catch {
    return ''
  }
}

export function setStoredEmail(email) {
  try {
    const s = String(email ?? '').trim()
    if (s) sessionStorage.setItem(STORAGE_EMAIL, s)
    else sessionStorage.removeItem(STORAGE_EMAIL)
  } catch {
    /* ignore */
  }
}

export function setSessionFromLogin({ token, userId }) {
  try {
    if (token) sessionStorage.setItem(STORAGE_TOKEN, token)
    if (userId) sessionStorage.setItem(STORAGE_USER_ID, userId)
  } catch {
    // sessionStorage может быть недоступен (приватный режим и т.п.)
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_TOKEN)
    sessionStorage.removeItem(STORAGE_USER_ID)
    sessionStorage.removeItem(STORAGE_EMAIL)
  } catch {
    /* ignore */
  }
}
