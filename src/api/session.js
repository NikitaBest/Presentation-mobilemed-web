/**
 * Сессия после auth/login (см. docs/API.md).
 * В mm_api_user_id попадает идентификатор пользователя (как в JWT и user.id), см. resolveLoginUserId в auth.js.
 */
const STORAGE_TOKEN = 'mm_api_token'
const STORAGE_USER_ID = 'mm_api_user_id'

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
  } catch {
    /* ignore */
  }
}
