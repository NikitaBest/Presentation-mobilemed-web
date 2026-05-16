import { apiFetch } from './client.js'
import { readJsonResultResponse } from './http.js'

/**
 * GET /scan/get — история сканов (см. docs/API.md: pageNumber, pageSize обязательны в query).
 * @param {{ pageNumber?: number, pageSize?: number }} [params]
 */
export async function getScansHistory({ pageNumber = 1, pageSize = 10 } = {}) {
  const q = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })
  const res = await apiFetch(`/scan/get?${q}`, { method: 'GET' })
  return readJsonResultResponse(res)
}
