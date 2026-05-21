import { getApiBaseUrl } from '../config.js'
import { getAcceptLanguageHeader, getApiLocale } from '../i18n/locale.js'
import {
  clearSession,
  getStoredEmail,
  getStoredToken,
  getStoredUserId,
  setSessionFromLogin,
  setStoredEmail,
} from './session.js'

const LOGIN_PATH = '/auth/login'
const REGISTER_PATH = '/auth/register'
const REFRESH_PATH = '/auth/refresh-token'

/** Клейм .NET JWT (совпадает с user.id в ответе login). */
const JWT_NAMEIDENTIFIER =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

/** Пароль только в памяти вкладки — для повторного login при смене locale. */
let sessionPassword = ''

export class AuthRequiredError extends Error {
  constructor() {
    super('AUTH_REQUIRED')
    this.name = 'AuthRequiredError'
  }
}

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4
    if (pad) b64 += '='.repeat(4 - pad)
    return JSON.parse(atob(b64))
  } catch {
    return null
  }
}

function userIdFromJwtPayload(payload) {
  if (!payload || typeof payload !== 'object') return ''
  const fromClaim = payload[JWT_NAMEIDENTIFIER]
  const fromShort =
    payload.Id ?? payload.id ?? payload.sub ?? payload.userId ?? payload.UserId
  const raw = fromClaim ?? fromShort
  if (typeof raw !== 'string') return ''
  const s = raw.trim()
  return s.length > 0 ? s : ''
}

/**
 * Идентификатор пользователя из JSON login (camelCase / PascalCase, корневой userId).
 */
function userIdFromLoginJson(data) {
  if (!data || typeof data !== 'object') return ''
  const u = data.user ?? data.User
  const fromUser =
    (u && typeof u === 'object' && (u.id ?? u.Id)) ||
    data.userId ||
    data.UserId ||
    data.profile?.userId ||
    data.Profile?.userId ||
    data.Profile?.UserId
  if (typeof fromUser !== 'string') return ''
  const s = fromUser.trim()
  return s.length > 0 ? s : ''
}

/**
 * Единый id для хранения: как в ответе API, согласованный с JWT (Bearer).
 */
export function resolveLoginUserId(data, token) {
  const fromBody = userIdFromLoginJson(data)
  const fromJwt = userIdFromJwtPayload(decodeJwtPayload(token))

  if (fromJwt && fromBody && fromJwt !== fromBody) {
    if (import.meta.env.DEV) {
      console.warn(
        '[MobileMed] auth: user.id в JSON и субъект в JWT различаются, сохраняем id из JWT:',
        { fromBody, fromJwt },
      )
    }
    return fromJwt
  }
  return fromJwt || fromBody || ''
}

function getServiceBearer() {
  return import.meta.env.VITE_API_AUTH_BEARER ?? ''
}

function getUtmFromUrl() {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  return params.get('utm') ?? params.get('Utm') ?? ''
}

function getUtmForAuth() {
  return getUtmFromUrl() || (import.meta.env.VITE_AUTH_UTM ?? '') || ''
}

function consumeForceReauthFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const force =
    params.has('reauth') ||
    params.get('forceLogin') === '1' ||
    params.get('forceLogin') === 'true'
  if (!force) return
  clearSession()
  sessionPassword = ''
  params.delete('reauth')
  params.delete('forceLogin')
  const q = params.toString()
  const path = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', path)
}

function rememberCredentials(email, password) {
  const e = String(email ?? '').trim()
  if (e) setStoredEmail(e)
  if (password) sessionPassword = String(password)
}

function authLocaleFields(locale) {
  const out = { locale: locale ?? getApiLocale() }
  const utm = getUtmForAuth()
  if (utm) out.utm = utm
  return out
}

function parseAuthError(res, data, text) {
  const detail =
    (data && (data.error || data.message || data.title || data.detail)) ||
    text ||
    res.statusText
  return `${res.status} ${detail}`.trim()
}

/**
 * @param {string} path
 * @param {object} body
 * @param {{ useUserJwt?: boolean }} [opts]
 */
async function postAuthEndpoint(path, body, { useUserJwt = false } = {}) {
  const base = getApiBaseUrl().replace(/\/$/, '')
  if (!base) {
    throw new Error('Не задан VITE_API_BASE_URL')
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': getAcceptLanguageHeader(),
  }
  const serviceBearer = getServiceBearer()
  if (serviceBearer) headers.Authorization = `Bearer ${serviceBearer}`
  if (useUserJwt) {
    const token = getStoredToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new Error(`auth${path}: ${parseAuthError(res, data, text)}`)
  }

  if (data && 'isSuccess' in data && data.isSuccess === false) {
    throw new Error(data.error || 'Запрос отклонён сервером')
  }

  return data
}

/**
 * @param {object} data — ApplicationModelsAuthLoginResponse
 */
function persistAuthResponse(data) {
  const token = data?.token
  const userId = resolveLoginUserId(data, token)
  if (!token || !userId) {
    throw new Error(
      'auth: в ответе нет token или идентификатора пользователя (user.id / userId / JWT)',
    )
  }
  setSessionFromLogin({ token, userId })
  return data
}

/**
 * @param {{ email: string, password: string, locale?: string, utm?: string }} params
 */
export async function postAuthLogin({ email, password, locale, utm }) {
  const body = {
    email: String(email ?? '').trim(),
    password: String(password ?? ''),
    ...authLocaleFields(locale),
  }
  if (utm) body.utm = utm

  const data = await postAuthEndpoint(LOGIN_PATH, body)
  persistAuthResponse(data)
  rememberCredentials(body.email, body.password)
  return data
}

/**
 * @param {{ email: string, password: string, locale?: string, utm?: string }} params
 */
export async function postAuthRegister({ email, password, locale, utm }) {
  const body = {
    email: String(email ?? '').trim(),
    password: String(password ?? ''),
    ...authLocaleFields(locale),
  }
  if (utm) body.utm = utm

  const data = await postAuthEndpoint(REGISTER_PATH, body)
  persistAuthResponse(data)
  rememberCredentials(body.email, body.password)
  return data
}

/** POST /auth/refresh-token — продление JWT (locale в claim не меняется). */
export async function postAuthRefreshToken() {
  const data = await postAuthEndpoint(REFRESH_PATH, {}, { useUserJwt: true })
  persistAuthResponse(data)
  return data
}

/**
 * Смена locale в JWT: login с email/password и новым locale (docs/API.md).
 * Без пароля в памяти — только refresh-token (Accept-Language для запросов обновится).
 */
export async function reauthenticateWithCurrentLocale() {
  const email = getStoredEmail()
  const password = sessionPassword
  const locale = getApiLocale()

  if (email && password) {
    const data = await postAuthLogin({ email, password, locale })
    const userId = resolveLoginUserId(data, data.token) || getStoredUserId()
    setSessionFromLogin({ token: data.token, userId })
    return
  }

  if (getStoredToken()) {
    await postAuthRefreshToken()
  }
}

/**
 * JWT обязателен; при отсутствии — AuthRequiredError.
 * При наличии — попытка refresh (не критично при ошибке, если токен ещё валиден).
 */
export async function ensureAuthSession() {
  consumeForceReauthFromUrl()

  if (!getStoredToken()) {
    throw new AuthRequiredError()
  }

  try {
    await postAuthRefreshToken()
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[MobileMed] refresh-token не удался, используем сохранённый JWT', e)
    }
  }
}

export function clearAuthSession() {
  sessionPassword = ''
  clearSession()
}
