import { apiFetch } from './client.js'
import { readJsonResultResponse } from './http.js'
import { mapFormToSaveRppgRequest } from './user.js'

const SAVE_RPPG_PATH = '/scan/save-rppg'

/**
 * POST /scan/save-rppg — scanResult + name и антропометрия из анкеты (docs/API.md).
 * @param {object} scanResult
 * @param {object} [userForm] — поля USER_FORM_INITIAL; без формы отправляется только scanResult
 */
export async function postSaveRppgScan(scanResult, userForm) {
  const body =
    userForm && typeof userForm === 'object'
      ? mapFormToSaveRppgRequest(scanResult, userForm)
      : { scanResult }
  const res = await apiFetch(SAVE_RPPG_PATH, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return readJsonResultResponse(res)
}

/**
 * GET /scan/rppg-scan/{scanId}/llm-interpretation — HTML-расшифровка (docs/API.md).
 * @param {string} scanId
 * @param {{ regenerate?: boolean }} [options]
 */
export async function getRppgScanLlmInterpretation(scanId, { regenerate = false } = {}) {
  const id = String(scanId ?? '').trim()
  if (!id) throw new Error('scanId is required')
  const q = new URLSearchParams({ regenerate: String(Boolean(regenerate)) })
  const res = await apiFetch(
    `/scan/rppg-scan/${encodeURIComponent(id)}/llm-interpretation?${q}`,
    { method: 'GET' },
  )
  return readJsonResultResponse(res)
}

/**
 * @param {object | null | undefined} data — SharedContractsResultOfRppgScanLlmInterpretationResponse
 * @returns {{ html: string, fromCache: boolean, scanId: string | null, culture: string | null }}
 */
export function parseLlmInterpretationResponse(data) {
  const value = data?.value ?? data?.Value
  const htmlRaw = value?.html ?? value?.Html
  const html = typeof htmlRaw === 'string' ? htmlRaw : ''
  const fromCache = Boolean(value?.fromCache ?? value?.FromCache)
  const scanId = value?.scanId ?? value?.ScanId
  const culture = value?.culture ?? value?.Culture
  return {
    html,
    fromCache,
    scanId: typeof scanId === 'string' ? scanId : null,
    culture: typeof culture === 'string' ? culture : null,
  }
}
