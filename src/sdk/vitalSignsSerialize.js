/**
 * Сжатие VitalSigns в JSON-совместимый объект для поля metrics на бекенде.
 */

function pickSign(sign) {
  if (!sign || typeof sign !== 'object') return null
  const row = {}
  if ('value' in sign && sign.value !== undefined && sign.value !== null) {
    row.value =
      typeof sign.value === 'object' && sign.value !== null
        ? { ...sign.value }
        : sign.value
  }
  if (sign.confidenceLevel !== undefined && sign.confidenceLevel !== null) {
    row.confidenceLevel = sign.confidenceLevel
  }
  if (sign.confidence !== undefined && sign.confidence !== null) {
    row.confidence = sign.confidence
  }
  return Object.keys(row).length ? row : null
}

export function vitalSignsToFlatMetrics(vs) {
  if (!vs || typeof vs !== 'object') return {}
  const out = {}
  for (const [key, sign] of Object.entries(vs)) {
    const row = pickSign(sign)
    if (row) out[key] = row
  }
  return out
}

export function safeJsonStringify(value) {
  try {
    return JSON.stringify(value)
  } catch {
    return '{}'
  }
}
