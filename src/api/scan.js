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
