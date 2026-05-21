import { apiFetch } from './client.js'
import { readJsonResultResponse } from './http.js'

/**
 * @param {unknown} raw
 * @returns {object | null}
 */
function normalizeScanEntity(raw) {
  if (!raw || typeof raw !== 'object') return null
  const o = /** @type {Record<string, unknown>} */ (raw)
  const nameRaw = o.name ?? o.Name
  const name = typeof nameRaw === 'string' ? nameRaw.trim() : ''
  const id = o.id ?? o.Id
  const createdAt = o.createdAt ?? o.CreatedAt
  return {
    id: typeof id === 'string' ? id : id != null ? String(id) : null,
    createdAt: typeof createdAt === 'string' ? createdAt : null,
    name: name || null,
  }
}

/**
 * Элемент `value.data[]` — ApplicationModelsRppgScanSaveRppgSсanResponse (GET /scan/get).
 * @param {unknown} raw
 * @returns {object}
 */
export function normalizeScanHistoryRow(raw) {
  if (!raw || typeof raw !== 'object') {
    return { healthScore: null, scan: null, transcripts: null }
  }
  const o = /** @type {Record<string, unknown>} */ (raw)
  const scan = normalizeScanEntity(o.scan ?? o.Scan)
  const transcripts = o.transcripts ?? o.Transcripts
  const healthScore = o.healthScore ?? o.HealthScore

  return {
    healthScore:
      typeof healthScore === 'number' && Number.isFinite(healthScore) ? healthScore : null,
    scan,
    transcripts: Array.isArray(transcripts) ? transcripts : null,
  }
}

/**
 * @param {unknown} value — InfrastructureModelsPagedListOfSaveRppgSсanResponse
 */
function normalizePagedList(value) {
  if (!value || typeof value !== 'object') {
    return {
      currentPage: 1,
      totalPages: 0,
      pageSize: 0,
      totalCount: 0,
      hasPrevious: false,
      hasNext: false,
      data: [],
    }
  }
  const p = /** @type {Record<string, unknown>} */ (value)
  const dataRaw = p.data ?? p.Data
  const data = Array.isArray(dataRaw) ? dataRaw.map(normalizeScanHistoryRow) : []

  return {
    currentPage: Number(p.currentPage ?? p.CurrentPage) || 1,
    totalPages: Number(p.totalPages ?? p.TotalPages) || 0,
    pageSize: Number(p.pageSize ?? p.PageSize) || 0,
    totalCount: Number(p.totalCount ?? p.TotalCount) || 0,
    hasPrevious: Boolean(p.hasPrevious ?? p.HasPrevious),
    hasNext: Boolean(p.hasNext ?? p.HasNext),
    data,
  }
}

/**
 * Имя из `scan.name` (UserRppgScanEntity), сохранённое при POST /scan/save-rppg.
 * @param {object | null | undefined} row — нормализованная строка GET /scan/get
 * @returns {string}
 */
export function getScanDisplayName(row) {
  const name = row?.scan?.name
  return typeof name === 'string' ? name.trim() : ''
}

/**
 * @param {object | null | undefined} row
 * @returns {string | null}
 */
export function getScanRowId(row) {
  const id = row?.scan?.id
  return typeof id === 'string' && id ? id : null
}

/**
 * @param {object | null | undefined} row
 * @returns {string | undefined}
 */
export function getScanRowCreatedAt(row) {
  const at = row?.scan?.createdAt
  return typeof at === 'string' && at ? at : undefined
}

/**
 * @param {object | null | undefined} row
 * @returns {string}
 */
export function getScanHistoryRowKey(row) {
  const id = getScanRowId(row)
  if (id) return id
  const at = getScanRowCreatedAt(row)
  return at ? `scan-at-${at}` : 'scan-unknown'
}

/**
 * GET /scan/get — история сканов (см. docs/API.md: pageNumber, pageSize в query).
 * @param {{ pageNumber?: number, pageSize?: number }} [params]
 * @returns {Promise<{ isSuccess?: boolean, value?: ReturnType<typeof normalizePagedList>, error?: string | null }>}
 */
export async function getScansHistory({ pageNumber = 1, pageSize = 10 } = {}) {
  const q = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  })
  const res = await apiFetch(`/scan/get?${q}`, { method: 'GET' })
  const data = await readJsonResultResponse(res)
  const valueRaw = data?.value ?? data?.Value
  if (valueRaw == null) return data

  return {
    ...data,
    value: normalizePagedList(valueRaw),
  }
}
