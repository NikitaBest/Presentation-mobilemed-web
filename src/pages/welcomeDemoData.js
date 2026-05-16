/** Демо-данные для превью на главной (не с API). */

export const WELCOME_DEMO_SCORE = 76

export const WELCOME_DEMO_METRICS = [
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
]

export const WELCOME_STEPS = [
  { title: 'Профиль', text: 'Укажите пол, возраст и рост — для точности расчёта.' },
  { title: 'Сканирование', text: 'Камера телефона, ~1 минута, лицо в овале на экране.' },
  { title: 'Результаты', text: 'Общая оценка и карточки показателей с расшифровкой.' },
]

/** Превью окна расшифровки (пример для пульса). */
export const WELCOME_DEMO_DETAIL = {
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
}
