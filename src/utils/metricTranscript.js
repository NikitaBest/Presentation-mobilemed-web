/** @typedef {'green' | 'yellow' | 'red'} MetricColor */

/**
 * @param {unknown} t
 * @returns {MetricColor | 'neutral'}
 */
export function transcriptColorKey(t) {
  const c = String(t?.color ?? '').toLowerCase()
  if (c === 'green' || c === 'yellow' || c === 'red') return c
  return 'neutral'
}

/**
 * @param {unknown} t
 */
export function formatTranscriptValue(t) {
  if (t?.valueAlias != null && t.valueAlias !== '') return String(t.valueAlias)
  if (t?.value === null || t?.value === undefined) return '—'
  if (typeof t.value === 'number' && !Number.isInteger(t.value)) {
    return t.value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })
  }
  return String(t.value)
}

/**
 * Показатели с расшифровкой для сетки карточек (без технических записей без статуса).
 * @param {unknown[]} transcripts
 */
export function filterDisplayableTranscripts(transcripts) {
  if (!Array.isArray(transcripts)) return []
  return transcripts.filter((t) => {
    const color = transcriptColorKey(t)
    const hasName = Boolean(t?.name && String(t.name).trim())
    const hasStatus = Boolean(t?.status && String(t.status).trim())
    return hasName && hasStatus && color !== 'neutral'
  })
}

/**
 * @param {MetricColor | 'neutral'} color
 */
export function metricStatusClass(color) {
  if (color === 'green' || color === 'yellow' || color === 'red') {
    return `metric-status metric-status--${color}`
  }
  return 'metric-status metric-status--neutral'
}
