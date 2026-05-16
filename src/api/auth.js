import { getApiBaseUrl } from '../config.js'
import {
  clearSession,
  getStoredToken,
  getStoredUserId,
  setSessionFromLogin,
} from './session.js'

/** POST /auth/login — ApplicationModelsAuthLoginRequest */
const LOGIN_PATH = '/auth/login'

/** Клейм .NET JWT (совпадает с user.id в ответе login). */
const JWT_NAMEIDENTIFIER =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'

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
 * При расхождении JSON vs JWT берём JWT — по нему бекенд проверяет сессию.
 */
export function resolveLoginUserId(data, token) {
  const fromBody = userIdFromLoginJson(data)
  const fromJwt = userIdFromJwtPayload(decodeJwtPayload(token))

  if (fromJwt && fromBody && fromJwt !== fromBody) {
    if (import.meta.env.DEV) {
      console.warn(
        '[MobileMed] auth/login: user.id в JSON и субъект в JWT различаются, сохраняем id из JWT:',
        { fromBody, fromJwt },
      )
    }
    return fromJwt
  }
  return fromJwt || fromBody || ''
}

function getLoginBearer() {
  return import.meta.env.VITE_API_AUTH_BEARER ?? ''
}

function getUtmFromUrl() {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)
  return params.get('utm') ?? params.get('Utm') ?? ''
}

function getUtmForLogin() {
  return getUtmFromUrl() || (import.meta.env.VITE_AUTH_UTM ?? '') || ''
}

/** Сброс сохранённого JWT и повторный login (удобно в DevTools). Параметры из URL затем убираются. */
function consumeForceReauthFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const force =
    params.has('reauth') ||
    params.get('forceLogin') === '1' ||
    params.get('forceLogin') === 'true'
  if (!force) return
  clearSession()
  params.delete('reauth')
  params.delete('forceLogin')
  const q = params.toString()
  const path = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', path)
}

function buildLoginBody() {
  const body = {}
  const utm = getUtmForLogin()
  if (utm) body.utm = utm
  const existingUserId = getStoredUserId()
  const existingToken = getStoredToken()
  if (existingUserId && !existingToken) body.id = existingUserId
  return body
}

/**
 * @returns {Promise<{ user: object, profile: object | null, token: string }>}
 */
export async function postAuthLogin(body) {
  const base = getApiBaseUrl().replace(/\/$/, '')
  if (!base) {
    throw new Error('Не задан VITE_API_BASE_URL')
  }

  const headers = { 'Content-Type': 'application/json' }
  const bearer = getLoginBearer()
  if (bearer) headers.Authorization = `Bearer ${bearer}`

  const res = await fetch(`${base}${LOGIN_PATH}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body ?? {}),
  })

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    const detail =
      (data && (data.message || data.title || data.detail)) || text || res.statusText
    throw new Error(`auth/login: ${res.status} ${detail}`.trim())
  }

  const token = data?.token
  const userId = resolveLoginUserId(data, token)
  if (!token || !userId) {
    throw new Error(
      'auth/login: в ответе нет token или идентификатора пользователя (user.id / userId / JWT)',
    )
  }

  return data
}

/**
 * Если JWT уже есть — повторный вызов login не делаем.
 * Иначе POST /auth/login и сохранение token и userId (см. resolveLoginUserId).
 */
export async function ensureAuthSession() {
  consumeForceReauthFromUrl()

  if (getStoredToken()) {
    if (import.meta.env.DEV) {
      console.info(
        '[MobileMed] JWT уже в sessionStorage — запрос auth/login не отправляется. Чтобы увидеть запрос: вкладка Application → Session Storage → удалите mm_api_token, либо откройте страницу с ?reauth=1',
      )
    }
    return
  }

  const data = await postAuthLogin(buildLoginBody())
  const userId = resolveLoginUserId(data, data.token)
  setSessionFromLogin({ token: data.token, userId })
}
