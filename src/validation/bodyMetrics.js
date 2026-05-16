/**
 * Валидация полей антропометрии для экрана «Ваши данные».
 * При `required: true` пустое значение даёт ошибку.
 * @returns {string} пустая строка если ок, иначе текст ошибки для пользователя
 */

const AGE_MIN = 1
const AGE_MAX = 120
const HEIGHT_MIN = 50
const HEIGHT_MAX = 260
const WEIGHT_MIN = 20
const WEIGHT_MAX = 300

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

export function validateAgeField(raw, { required = false } = {}) {
  const s = trim(raw)
  if (s === '') return required ? 'Укажите возраст' : ''
  if (!isStrictIntString(s)) {
    return 'Введите возраст целым числом'
  }
  const n = Number.parseInt(s, 10)
  if (n < AGE_MIN || n > AGE_MAX) {
    return `Возраст от ${AGE_MIN} до ${AGE_MAX} лет`
  }
  return ''
}

export function validateHeightField(raw, { required = false } = {}) {
  const s = trim(raw).replace(',', '.')
  if (s === '') return required ? 'Укажите рост' : ''
  if (!isStrictIntString(s)) {
    return 'Рост — целое число в сантиметрах'
  }
  const n = Number.parseInt(s, 10)
  if (n < HEIGHT_MIN || n > HEIGHT_MAX) {
    return `Рост от ${HEIGHT_MIN} до ${HEIGHT_MAX} см`
  }
  return ''
}

export function validateWeightField(raw, { required = false } = {}) {
  const s = trim(raw).replace(',', '.')
  if (s === '') return required ? 'Укажите вес' : ''
  if (!isStrictWeightString(s)) {
    return 'Введите вес числом, можно с десятичной частью'
  }
  const n = Number.parseFloat(s)
  if (!Number.isFinite(n)) {
    return 'Неверный формат веса'
  }
  if (n < WEIGHT_MIN || n > WEIGHT_MAX) {
    return `Вес от ${WEIGHT_MIN} до ${WEIGHT_MAX} кг`
  }
  return ''
}
