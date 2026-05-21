/**
 * Валидация полей антропометрии для экрана «Ваши данные».
 * При `required: true` пустое значение даёт ошибку.
 * `t` — функция перевода (ключи userData.validation.*).
 * @returns {string} пустая строка если ок, иначе текст ошибки для пользователя
 */

const AGE_MIN = 1
const AGE_MAX = 120
const HEIGHT_MIN = 50
const HEIGHT_MAX = 260
const WEIGHT_MIN = 20
const WEIGHT_MAX = 300
const NAME_MIN = 1
const NAME_MAX = 80

function trim(raw) {
  return String(raw ?? '').trim()
}

/** Целое число без лишних символов */
function isStrictIntString(s) {
  return /^\d+$/.test(s)
}

/** Число с необязательной дробной частью */
function isStrictWeightString(s) {
  return /^\d+([.,]\d+)?$/.test(s)
}

/**
 * @param {string} raw
 * @param {{ required?: boolean, t?: (key: string, vars?: Record<string, string>) => string }} opts
 */
export function validateNameField(raw, { required = false, t } = {}) {
  const tr = (key, vars) => (typeof t === 'function' ? t(key, vars) : '')
  const s = trim(raw)
  if (s === '') return required ? tr('userData.validation.nameRequired') : ''
  if (s.length < NAME_MIN) {
    return tr('userData.validation.nameTooShort', { min: String(NAME_MIN) })
  }
  if (s.length > NAME_MAX) {
    return tr('userData.validation.nameTooLong', { max: String(NAME_MAX) })
  }
  return ''
}

/**
 * @param {string} raw
 * @param {{ required?: boolean, t?: (key: string, vars?: Record<string, string>) => string }} opts
 */
export function validateAgeField(raw, { required = false, t } = {}) {
  const tr = (key, vars) => (typeof t === 'function' ? t(key, vars) : '')
  const s = trim(raw)
  if (s === '') return required ? tr('userData.validation.ageRequired') : ''
  if (!isStrictIntString(s)) {
    return tr('userData.validation.ageInt')
  }
  const n = Number.parseInt(s, 10)
  if (n < AGE_MIN || n > AGE_MAX) {
    return tr('userData.validation.ageRange', { min: String(AGE_MIN), max: String(AGE_MAX) })
  }
  return ''
}

/**
 * @param {string} raw
 * @param {{ required?: boolean, t?: (key: string, vars?: Record<string, string>) => string }} opts
 */
export function validateHeightField(raw, { required = false, t } = {}) {
  const tr = (key, vars) => (typeof t === 'function' ? t(key, vars) : '')
  const s = trim(raw).replace(',', '.')
  if (s === '') return required ? tr('userData.validation.heightRequired') : ''
  if (!isStrictIntString(s)) {
    return tr('userData.validation.heightInt')
  }
  const n = Number.parseInt(s, 10)
  if (n < HEIGHT_MIN || n > HEIGHT_MAX) {
    return tr('userData.validation.heightRange', {
      min: String(HEIGHT_MIN),
      max: String(HEIGHT_MAX),
    })
  }
  return ''
}

/**
 * @param {string} raw
 * @param {{ required?: boolean, t?: (key: string, vars?: Record<string, string>) => string }} opts
 */
export function validateWeightField(raw, { required = false, t } = {}) {
  const tr = (key, vars) => (typeof t === 'function' ? t(key, vars) : '')
  const s = trim(raw).replace(',', '.')
  if (s === '') return required ? tr('userData.validation.weightRequired') : ''
  if (!isStrictWeightString(s)) {
    return tr('userData.validation.weightFormat')
  }
  const n = Number.parseFloat(s)
  if (!Number.isFinite(n)) {
    return tr('userData.validation.weightInvalid')
  }
  if (n < WEIGHT_MIN || n > WEIGHT_MAX) {
    return tr('userData.validation.weightRange', {
      min: String(WEIGHT_MIN),
      max: String(WEIGHT_MAX),
    })
  }
  return ''
}

/**
 * @param {string} sex
 * @param {(key: string) => string} [t]
 */
export function validateSexField(sex, t) {
  const tr = (key) => (typeof t === 'function' ? t(key) : '')
  if (sex === 'MALE' || sex === 'FEMALE') return ''
  return tr('userData.validation.sexRequired')
}

/**
 * @param {string} smokingStatus
 * @param {(key: string) => string} [t]
 */
export function validateSmokingField(smokingStatus, t) {
  const tr = (key) => (typeof t === 'function' ? t(key) : '')
  if (smokingStatus === 'NON_SMOKER' || smokingStatus === 'SMOKER') return ''
  return tr('userData.validation.smokingRequired')
}
