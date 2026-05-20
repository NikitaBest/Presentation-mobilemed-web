/** Демо-данные для превью на главной (не с API). Локализованы ru/en. */

/** @typedef {'ru' | 'en'} AppLocale */

const STEPS = {
  ru: [
    { title: 'Профиль', text: 'Укажите пол, возраст и рост — для точности расчёта.' },
    { title: 'Сканирование', text: 'Камера телефона, ~1 минута, лицо в овале на экране.' },
    { title: 'Результаты', text: 'Общая оценка и карточки показателей с расшифровкой.' },
  ],
  en: [
    { title: 'Profile', text: 'Enter sex, age, and height for more accurate estimates.' },
    { title: 'Scanning', text: 'Phone camera, ~1 minute, keep your face in the on-screen oval.' },
    { title: 'Results', text: 'Overall score and metric cards with interpretation.' },
  ],
}

const DEMO_METRICS = {
  ru: [
    {
      key: 'pulseRate',
      name: 'Частота пульса',
      value: 72,
      unit: 'уд/мин',
      status: 'В норме',
      color: 'green',
    },
    {
      key: 'respirationRate',
      name: 'Частота дыхания',
      value: 16,
      unit: 'дых/мин',
      status: 'В норме',
      color: 'green',
    },
    {
      key: 'bloodPressureSystolic',
      name: 'Систолическое давление',
      value: 128,
      unit: 'мм рт. ст.',
      status: 'Выше нормы',
      color: 'yellow',
    },
    {
      key: 'hemoglobinA1c',
      name: 'HbA1c',
      value: 5.4,
      unit: '%',
      status: 'В норме',
      color: 'green',
    },
  ],
  en: [
    {
      key: 'pulseRate',
      name: 'Pulse rate',
      value: 72,
      unit: 'bpm',
      status: 'Normal',
      color: 'green',
    },
    {
      key: 'respirationRate',
      name: 'Respiration rate',
      value: 16,
      unit: 'breaths/min',
      status: 'Normal',
      color: 'green',
    },
    {
      key: 'bloodPressureSystolic',
      name: 'Systolic blood pressure',
      value: 128,
      unit: 'mmHg',
      status: 'Above normal',
      color: 'yellow',
    },
    {
      key: 'hemoglobinA1c',
      name: 'HbA1c',
      value: 5.4,
      unit: '%',
      status: 'Normal',
      color: 'green',
    },
  ],
}

const DEMO_DETAIL = {
  ru: {
    key: 'pulseRate',
    name: 'Частота пульса',
    value: 72,
    unit: 'уд/мин',
    status: 'В норме',
    color: 'green',
    commentUser: 'Пульс в спокойном состоянии соответствует норме для вашего возраста.',
    descriptionUser:
      'Частота пульса отражает ритм сердечных сокращений. Отклонения могут быть связаны со стрессом, нагрузкой или самочувствием.',
    scaleMetadata: {
      valuePercentLabel: 42,
      items: [
        { color: 'yellow', fromToAlias: 'Ниже', percentFrom: 0, percentTo: 33 },
        { color: 'green', fromToAlias: 'Норма', percentFrom: 33, percentTo: 66 },
        { color: 'yellow', fromToAlias: 'Выше', percentFrom: 66, percentTo: 100 },
      ],
    },
  },
  en: {
    key: 'pulseRate',
    name: 'Pulse rate',
    value: 72,
    unit: 'bpm',
    status: 'Normal',
    color: 'green',
    commentUser: 'Your resting pulse is within the expected range for your age.',
    descriptionUser:
      'Pulse rate reflects how fast your heart beats. Shifts can be linked to stress, activity, or how you feel.',
    scaleMetadata: {
      valuePercentLabel: 42,
      items: [
        { color: 'yellow', fromToAlias: 'Low', percentFrom: 0, percentTo: 33 },
        { color: 'green', fromToAlias: 'Normal', percentFrom: 33, percentTo: 66 },
        { color: 'yellow', fromToAlias: 'High', percentFrom: 66, percentTo: 100 },
      ],
    },
  },
}

export const WELCOME_DEMO_SCORE = 76

/** @param {AppLocale} locale */
export function getWelcomeSteps(locale) {
  return locale === 'en' ? STEPS.en : STEPS.ru
}

/** @param {AppLocale} locale */
export function getWelcomeDemoMetrics(locale) {
  return locale === 'en' ? DEMO_METRICS.en : DEMO_METRICS.ru
}

/** @param {AppLocale} locale */
export function getWelcomeDemoDetail(locale) {
  return locale === 'en' ? DEMO_DETAIL.en : DEMO_DETAIL.ru
}
