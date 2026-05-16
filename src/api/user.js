import { apiFetch } from './client.js'
import { readJsonResultResponse } from './http.js'

const ME_PATH = '/user/me'
const UPDATE_PATH = '/user/update'

/**
 * GET /user/me — текущий пользователь по JWT (SharedContractsResultOfUserEntity).
 * @returns {Promise<object | null>} value (UserEntity) или null
 */
export async function getUserMe() {
  const res = await apiFetch(ME_PATH, { method: 'GET' })
  const data = await readJsonResultResponse(res)
  return data?.value ?? null
}

/**
 * PUT /user/update — ApplicationModelsUserUpdateUserRequest.
 * @param {object} body — age, height, weight, gender, smokeStatus, goals, confirmedPolicyAndDocuments
 * @returns {Promise<object | null>} обновлённый UserEntity в value
 */
export async function putUserUpdate(body) {
  const res = await apiFetch(UPDATE_PATH, {
    method: 'PUT',
    body: JSON.stringify(body ?? {}),
  })
  const data = await readJsonResultResponse(res)
  return data?.value ?? null
}

/** Gender в API: Male=0, Female=1 (InfrastructureDbAppEntitiesGender). */
/** SmokeStatus: NotSmoking=0, Smoking=1 (InfrastructureDbAppEntitiesSmokeStatus). */

/**
 * Форма экрана «Ваши данные» → тело PUT /user/update.
 * @param {object} form — поля как в USER_FORM_INITIAL
 */
export function mapFormToUpdateUserRequest(form) {
  const age = Number.parseInt(String(form.age ?? '').trim(), 10)
  const height = Number.parseInt(String(form.height ?? '').trim(), 10)
  const weight = Math.round(
    Number.parseFloat(String(form.weight ?? '').trim().replace(',', '.')),
  )
  const gender =
    form.sex === 'MALE' ? 0 : form.sex === 'FEMALE' ? 1 : null
  const smokeStatus =
    form.smokingStatus === 'NON_SMOKER'
      ? 0
      : form.smokingStatus === 'SMOKER'
        ? 1
        : null
  const goals = Array.isArray(form.goals)
    ? form.goals.filter((g) => typeof g === 'string' && g.trim().length > 0)
    : []

  return {
    age,
    height,
    weight,
    gender,
    smokeStatus,
    goals,
    confirmedPolicyAndDocuments: true,
  }
}

/**
 * UserEntity из /user/me → частичное состояние формы (поверх текущего).
 * @param {object | null} user
 * @returns {Record<string, unknown>} только заданные с сервера поля
 */
export function mapUserEntityToFormPatch(user) {
  const p = user?.profile
  if (!p || typeof p !== 'object') return {}
  const out = {}
  if (typeof p.age === 'number' && Number.isFinite(p.age)) {
    out.age = String(p.age)
  }
  if (typeof p.height === 'number' && Number.isFinite(p.height)) {
    out.height = String(p.height)
  }
  if (typeof p.weight === 'number' && Number.isFinite(p.weight)) {
    out.weight = String(p.weight)
  }
  if (p.gender === 0) out.sex = 'MALE'
  else if (p.gender === 1) out.sex = 'FEMALE'
  if (p.smokeStatus === 0) out.smokingStatus = 'NON_SMOKER'
  else if (p.smokeStatus === 1) out.smokingStatus = 'SMOKER'
  if (Array.isArray(p.goals)) {
    out.goals = [...p.goals]
  }
  return out
}
