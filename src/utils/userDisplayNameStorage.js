/** Имя пользователя: в API профиля нет поля name — храним локально по userId. */
const STORAGE_KEY = 'mm_user_display_name'

/**
 * @param {string} userId
 * @returns {string}
 */
export function loadUserDisplayName(userId) {
  const id = String(userId ?? '').trim()
  if (!id) return ''
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return ''
    const map = JSON.parse(raw)
    if (!map || typeof map !== 'object') return ''
    const name = map[id]
    return typeof name === 'string' ? name.trim() : ''
  } catch {
    return ''
  }
}

/**
 * @param {string} userId
 * @param {string} name
 */
export function saveUserDisplayName(userId, name) {
  const id = String(userId ?? '').trim()
  if (!id) return
  const trimmed = String(name ?? '').trim()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const map =
      raw && typeof raw === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse(raw)
              return parsed && typeof parsed === 'object' ? { ...parsed } : {}
            } catch {
              return {}
            }
          })()
        : {}
    if (trimmed) {
      map[id] = trimmed
    } else {
      delete map[id]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // localStorage недоступен
  }
}
