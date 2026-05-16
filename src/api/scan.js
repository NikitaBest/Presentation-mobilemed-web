import { apiFetch } from './client.js'
import { readJsonResultResponse } from './http.js'

const SAVE_RPPG_PATH = '/scan/save-rppg'

/**
 * POST /scan/save-rppg
 * Тело: `{ scanResult }`, где scanResult — `{ takenAt, source, metrics, sdkRaw }`
 * (описание в docs/API.md, operation SaveRppgScan; схема scanResult в OpenAPI без детализации — фактический контракт по полям takenAt/source/metrics/sdkRaw).
 * @param {object} scanResult
 */
export async function postSaveRppgScan(scanResult) {
  const res = await apiFetch(SAVE_RPPG_PATH, {
    method: 'POST',
    body: JSON.stringify({ scanResult }),
  })
  return readJsonResultResponse(res)
}
