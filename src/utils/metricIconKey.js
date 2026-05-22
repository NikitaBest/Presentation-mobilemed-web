/** Показатели с иконкой src/assets/Icon.svg (сердце + ЭКГ). */
const CARDIAC_METRIC_KEYS = new Set([
  'pulseRate',
  'heartAge',
  'ascvdRisk',
  'ascvdRiskLevel',
  'cardiacWorkload',
])

/** Показатели с иконкой src/assets/dox.svg (лёгкие / дыхание). */
const RESPIRATION_METRIC_KEYS = new Set(['respirationRate', 'prq'])

/**
 * @param {string | null | undefined} key
 * @param {string | null | undefined} [name]
 */
export function usesRespirationMetricIcon(key, name) {
  const k = String(key ?? '').trim()
  if (k && RESPIRATION_METRIC_KEYS.has(k)) return true

  const n = String(name ?? '')
    .trim()
    .toLowerCase()
  if (!n) return false

  if (n.includes('prq') || n.includes('пульс') && n.includes('дыхан')) return true
  if (n.includes('дыхан') || n.includes('respiration') || n.includes('breath')) return true

  return false
}

/**
 * @param {string | null | undefined} key
 * @param {string | null | undefined} [name]
 */
export function usesCardiacMetricIcon(key, name) {
  if (usesRespirationMetricIcon(key, name)) return false

  const k = String(key ?? '').trim()
  if (k && CARDIAC_METRIC_KEYS.has(k)) return true

  const n = String(name ?? '')
    .trim()
    .toLowerCase()
  if (!n) return false

  if (n.includes('частота пульса') || (n.includes('пульс') && !n.includes('дыхан'))) return true
  if (n.includes('возраст сердца') || n.includes('heart age')) return true
  if (n.includes('ascvd') || n.includes('ассз') || n.includes('асквд')) return true
  if (n.includes('кардиальн') && n.includes('нагруз')) return true
  if (n.includes('cardiac workload')) return true

  return false
}
