import { getApiBaseUrl } from '../config.js'
import { getStoredToken } from './session.js'

/**
 * fetch к API с базой из VITE_API_BASE_URL и Bearer из сессии (после login).
 */
export async function apiFetch(path, options = {}) {
  const base = getApiBaseUrl().replace(/\/$/, '')
  if (!base) {
    throw new Error('Не задан VITE_API_BASE_URL')
  }
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const headers = new Headers(options.headers ?? {})
  const token = getStoredToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (
    options.body != null &&
    typeof options.body === 'string' &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(url, { ...options, headers })
}
