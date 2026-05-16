/**
 * Общий разбор JSON-ответов API (HTTP + isSuccess).
 */
export async function readJsonResultResponse(res) {
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok) {
    const detail =
      (data && (data.error || data.message || data.title || data.detail)) ||
      text ||
      res.statusText
    throw new Error(`${res.status} ${detail}`.trim())
  }
  if (data && 'isSuccess' in data && data.isSuccess === false) {
    throw new Error(data.error || 'Запрос отклонён сервером')
  }
  return data
}
