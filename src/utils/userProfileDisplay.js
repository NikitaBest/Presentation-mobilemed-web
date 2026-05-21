/** @typedef {import('../sdk/userInformation.js').typeof USER_FORM_INITIAL} UserFormShape */

function getAgeWordRu(n) {
  const lastDigit = n % 10
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 14) return 'лет'
  if (lastDigit === 1) return 'год'
  if (lastDigit >= 2 && lastDigit <= 4) return 'года'
  return 'лет'
}

/**
 * @param {Record<string, unknown>} form
 */
export function isUserProfileFilled(form) {
  return Boolean(
    form.sex && form.age && form.height && form.weight && form.smokingStatus,
  )
}

/**
 * @param {Record<string, unknown>} form
 * @param {(key: string, vars?: Record<string, string>) => string} t
 * @param {'ru' | 'en'} locale
 * @returns {{ label: string, value: string }[]}
 */
export function formatUserProfileLines(form, t, locale) {
  const notSet = t('home.profileNotSet')

  let sexValue = notSet
  if (form.sex === 'MALE') sexValue = t('userData.sexMale')
  else if (form.sex === 'FEMALE') sexValue = t('userData.sexFemale')

  let ageValue = notSet
  const ageNum = Number.parseInt(String(form.age ?? '').trim(), 10)
  if (Number.isFinite(ageNum) && ageNum >= 1) {
    ageValue =
      locale === 'en'
        ? `${ageNum} ${ageNum === 1 ? 'year' : 'years'}`
        : `${ageNum} ${getAgeWordRu(ageNum)}`
  }

  let heightValue = notSet
  const heightNum = Number.parseInt(String(form.height ?? '').trim(), 10)
  if (Number.isFinite(heightNum) && heightNum > 0) {
    heightValue = `${heightNum} ${locale === 'en' ? 'cm' : 'см'}`
  }

  let weightValue = notSet
  const weightNum = Number.parseFloat(String(form.weight ?? '').trim().replace(',', '.'))
  if (Number.isFinite(weightNum) && weightNum > 0) {
    weightValue = `${weightNum} ${locale === 'en' ? 'kg' : 'кг'}`
  }

  let smokingValue = notSet
  if (form.smokingStatus === 'NON_SMOKER') smokingValue = t('userData.smokingNon')
  else if (form.smokingStatus === 'SMOKER') smokingValue = t('userData.smokingYes')

  return [
    { label: t('userData.sexTitle'), value: sexValue },
    { label: t('userData.ageTitle'), value: ageValue },
    { label: t('userData.heightWeightTitle'), value: `${heightValue} · ${weightValue}` },
    { label: t('userData.smokingTitle'), value: smokingValue },
  ]
}
