/**
 * Данные пользователя для userInformation в FaceSessionOptions (SDK).
 * Значения полей совместимы с enum Sex / SmokingStatus при интеграции пакета.
 * @see docs/SDK.md — раздел «Информация о пользователе»
 */

/** Значения формы до заполнения: пустая строка; после отправки все поля должны быть заданы. */
export const USER_FORM_INITIAL = {
  sex: '',
  age: '',
  weight: '',
  height: '',
  smokingStatus: '',
  goals: [],
}

/**
 * Снимок для будущей сессии SDK: null = не передавать / UNSPECIFIED.
 * @param {object} form — то же поле, что и USER_FORM_INITIAL (строковые поля формы).
 * @returns {{
 *   sex: string | null,
 *   age: number | null,
 *   weight: number | null,
 *   height: number | null,
 *   smokingStatus: string | null,
 *   goals: string[]
 * }}
 */
export function normalizeUserInformationForm(form) {
  const ageRaw = String(form.age ?? '').trim()
  const heightRaw = String(form.height ?? '').trim().replace(',', '.')
  const weightRaw = String(form.weight ?? '').trim().replace(',', '.')

  const age = ageRaw === '' ? null : Number.parseInt(ageRaw, 10)
  const weight = weightRaw === '' ? null : Number.parseFloat(weightRaw)
  const height = heightRaw === '' ? null : Number.parseFloat(heightRaw)

  const goals = Array.isArray(form.goals)
    ? form.goals.filter((g) => typeof g === 'string' && g.trim().length > 0)
    : []

  return {
    sex: form.sex === '' ? null : form.sex,
    age: Number.isFinite(age) ? age : null,
    weight: Number.isFinite(weight) ? weight : null,
    height: Number.isFinite(height) ? height : null,
    smokingStatus:
      form.smokingStatus === '' ? null : form.smokingStatus,
    goals,
  }
}
