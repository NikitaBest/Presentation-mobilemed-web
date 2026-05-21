import { vitalSignsToFlatMetrics } from './vitalSignsSerialize.js'

/**
 * POST /scan/save-rppg: scanResult + name/антропометрия из анкеты (см. mapFormToSaveRppgRequest, docs/API.md).
 * metrics — плоские показатели с unit/confidence для бекенда; sdkRaw — объект с полным results.
 */

const DEFAULT_SOURCE =
  String(import.meta.env?.VITE_SCAN_RPPG_SOURCE ?? '').trim() || 'web_sdk'

/** Единицы для известных ключей VitalSignsResults (остальные — без поля unit). */
const UNIT_BY_KEY = {
  pulseRate: 'bpm',
  respirationRate: 'breaths_per_min',
  oxygenSaturation: 'percent',
  sdnn: 'ms',
  stressLevel: 'ratio',
  bloodPressure: 'mmHg',
  heartAge: 'years',
  hemoglobin: 'g/dL',
  hemoglobinA1c: 'percent',
  meanArterialPressure: 'mmHg',
  pulsePressure: 'mmHg',
  cardiacWorkload: 'index',
  prq: 'index',
  wellnessIndex: 'index',
  wellnessLevel: 'level',
  ascvdRisk: 'score',
  ascvdRiskLevel: 'level',
  highBloodPressureRisk: 'level',
  highFastingGlucoseRisk: 'level',
  highHemoglobinA1cRisk: 'level',
  highTotalCholesterolRisk: 'level',
  lowHemoglobinRisk: 'level',
}

export function cloneForJson(value) {
  if (value === undefined) return undefined
  if (value === null) return null
  try {
    if (typeof structuredClone === 'function') return structuredClone(value)
  } catch {
    /* fallthrough */
  }
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return null
  }
}

/**
 * @param {object | null | undefined} vitalSignsResults — аргумент onFinalResults от Web SDK
 * @param {{ source?: string, takenAt?: string }} [options]
 * @returns {{ takenAt: string, source: string, metrics: Record<string, object>, sdkRaw: { source: string, takenAt: string, results: object } }}
 */
export function buildSaveRppgScanResult(vitalSignsResults, options = {}) {
  const source = options.source ?? DEFAULT_SOURCE
  const takenAt = options.takenAt ?? new Date().toISOString()
  const results = vitalSignsResults?.results
  const flat = vitalSignsToFlatMetrics(results)

  const metrics = {}
  for (const [key, row] of Object.entries(flat)) {
    if (!row || typeof row !== 'object') continue
    const next = { ...row }
    const unit = UNIT_BY_KEY[key]
    if (unit) next.unit = unit
    if (next.confidenceLevel != null && next.confidence == null) {
      next.confidence = next.confidenceLevel
    }
    metrics[key] = next
  }

  const resultsClone = cloneForJson(results) ?? {}

  return {
    takenAt,
    source,
    metrics,
    sdkRaw: {
      source,
      takenAt,
      results: resultsClone,
    },
  }
}
