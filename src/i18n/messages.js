import { normalizeLocale } from './locale.js'

/**
 * Строки UI (ru/en). Ключи — плоские с точками.
 * Бэкенд: locale в POST /auth/login + Accept-Language (см. docs/API.md).
 */

/** @typedef {import('./locale.js').AppLocale} AppLocale */

/** @type {Record<AppLocale, Record<string, string>>} */
export const MESSAGES = {
  ru: {
    'lang.ru': 'Русский',
    'lang.en': 'English',

    'languageSelect.continue': 'Продолжить',
    'languageSelect.continueBilingual': 'Продолжить / Continue',
    'languageSelect.continueWait': 'Подождите…',
    'languageSelect.error': 'Не удалось применить язык. Попробуйте ещё раз.',

    'welcome.brand': 'MobileMed',
    'welcome.title': 'Оценка здоровья по лицу',
    'welcome.lead':
      'Сканирование через камеру телефона — без отдельного приложения, прямо в браузере.',
    'welcome.langLabel': 'Язык',
    'welcome.stepsTitle': 'Как это работает',
    'welcome.previewScoreTitle': 'Пример результатов',
    'welcome.previewScoreHint': 'Общий показатель после сканирования',
    'welcome.metricsTitle': 'Показатели',
    'welcome.tapFlow1': 'Нажмите карточку',
    'welcome.tapFlow2': 'Окно с расшифровкой',
    'welcome.demoHint': 'Нажмите, чтобы узнать больше',
    'welcome.connecting': 'Подключение к серверу…',
    'welcome.retry': 'Повторить',
    'welcome.continueWait': 'Подождите…',
    'welcome.continue': 'Начать измерение',
    'welcome.disclaimer':
      'Нужен доступ к камере на шаге сканирования. Сервис не заменяет консультацию врача.',
    'welcome.localeError': 'Не удалось сменить язык. Попробуйте ещё раз.',

    'results.brand': 'MobileMed',
    'results.title': 'Результаты',
    'results.leadOk':
      'Сводка по последнему сканированию: общая оценка и детали по каждому показателю.',
    'results.leadSaveFail':
      'Данные последнего скана не сохранены — при необходимости пройдите измерение заново.',
    'results.loading': 'Загружаем расшифровку…',
    'results.retry': 'Повторить',
    'results.empty':
      'В истории пока нет сканов с расшифровкой. После успешного сохранения измерения данные появятся здесь.',
    'results.idMismatch':
      'Расшифровка только что сохранённого скана ещё не в списке — показан последний доступный скан. Обновите страницу через несколько секунд или нажмите «Повторить».',
    'results.metricsTitle': 'Все показатели',
    'results.transcriptsEmpty':
      'Расшифровка показателей пока пуста. Данные могут появиться после обработки на сервере.',
    'results.measureAgain': 'Измерить снова',
    'results.home': 'На главную',
    'results.disclaimer': 'Данный анализ не заменяет медицинскую консультацию.',
    'results.settingsTitle': 'Настройки',
    'results.settingsLang': 'Язык интерфейса и ответов API',
    'results.settingsLangHint':
      'После смены языка выполняется повторный вход — список сканов подгрузится заново.',
    'results.loadError': 'Не удалось загрузить результаты',
    'results.localeError': 'Не удалось сменить язык',
    'results.heroAria': 'Общий показатель здоровья',
    'results.metricsAria': 'Все показатели',
    'results.actionsAria': 'Действия',

    'common.back': 'Назад',
    'common.close': 'Закрыть',
    'common.closeHint': 'Закрыть подсказку',

    'app.scanLoading': 'Загрузка сканирования…',
    'app.authError': 'Ошибка подключения',
    'app.profileLoadError': 'Не удалось загрузить сохранённые данные',

    'userData.title': 'Ваши данные',
    'userData.lead':
      'При заполнении анкеты в разборе после сканирования можно получить больше данных.',
    'userData.sexTitle': 'Ваш пол',
    'userData.sexSubtitle': 'Нужен, чтобы учитывать особенности организма',
    'userData.sexMale': 'Мужской',
    'userData.sexFemale': 'Женский',
    'userData.sexNote': 'Сохраним и используем при разборе результата',
    'userData.ageTitle': 'Возраст',
    'userData.ageSubtitle': 'Укажите полное количество лет',
    'userData.agePlaceholder': 'Например, 42',
    'userData.heightWeightTitle': 'Рост и вес',
    'userData.heightWeightSubtitle': 'В сантиметрах и килограммах.',
    'userData.heightLabel': 'Рост, см',
    'userData.weightLabel': 'Вес, кг',
    'userData.heightOk': 'Рост и вес указаны — записали',
    'userData.smokingTitle': 'Курение',
    'userData.smokingSubtitle':
      'Честный ответ помогает точнее оценить влияние привычек на здоровье',
    'userData.smokingNon': 'Не курю',
    'userData.smokingYes': 'Курю',
    'userData.smokingNoteNon': 'Запомним для отчёта',
    'userData.smokingNoteYes': 'Учтём при разборе результата',
    'userData.saveError': 'Не удалось сохранить данные',
    'userData.next': 'Далее',
    'userData.saving': 'Сохранение…',
    'userData.footerHint':
      'Все поля обязательны. По кнопке «Далее» анкета отправляется на сервер (user/update), подтверждение политики и документов — да.',
    'userData.validation.ageRequired': 'Укажите возраст',
    'userData.validation.ageInt': 'Введите возраст целым числом',
    'userData.validation.ageRange': 'Возраст от {min} до {max} лет',
    'userData.validation.heightRequired': 'Укажите рост',
    'userData.validation.heightInt': 'Рост — целое число в сантиметрах',
    'userData.validation.heightRange': 'Рост от {min} до {max} см',
    'userData.validation.weightRequired': 'Укажите вес',
    'userData.validation.weightFormat': 'Введите вес числом, можно с десятичной частью',
    'userData.validation.weightInvalid': 'Неверный формат веса',
    'userData.validation.weightRange': 'Вес от {min} до {max} кг',
    'userData.validation.sexRequired': 'Выберите пол',
    'userData.validation.smokingRequired': 'Выберите вариант про курение',
    'userData.ageSavedSuffix': '— записали',
    'userData.ageLineEn': '{count} {years} — saved',

    'instruction.title': 'Подготовка',
    'instruction.lead': 'Подготовьтесь к сканированию. Следуйте рекомендациям для точного результата.',
    'instruction.cardPrivate': 'Приватно',
    'instruction.cardTime': '~60 секунд',
    'instruction.cardNotDiag': 'Не диагноз',
    'instruction.important': 'Важные рекомендации',
    'instruction.req1Title': 'Хорошее освещение',
    'instruction.req1Text': 'Убедитесь, что лицо хорошо освещено. Избегайте сильных теней на лице.',
    'instruction.req2Title': 'Не двигайтесь',
    'instruction.req2Text':
      'Сядьте, держите устройство на расстоянии 20–30 см, не говорите во время сканирования.',
    'instruction.req3Title': 'Доступность',
    'instruction.req3Text': 'Снимите очки и головной убор — они мешают сканированию.',
    'instruction.req3Extra': 'Не проводите сканирование при заряде батареи менее 20%.',
    'instruction.req4Title': 'Спокойствие',
    'instruction.req4Text':
      'Не занимайтесь интенсивной активностью прямо перед сканированием, не курите.',
    'instruction.confirm': 'Понятно, я готов(а) к сканированию',
    'instruction.startScan': 'Начать сканирование',

    'scan.ariaApp': 'Сканирование лица',
    'scan.title': 'Сканирование',
    'scan.lead':
      'Анализ на телефоне. После замера откройте «Результаты» — там итог и расшифровка.',
    'scan.hintCameraOn': 'Включаем камеру…',
    'scan.hintCameraRequest': 'Запрашиваем доступ к камере…',
    'scan.hintSdkLoad': 'Загрузка алгоритма…',
    'scan.hintPreview': 'Поместите лицо в овал. Нажмите «Начать», когда будете готовы.',
    'scan.hintRunning':
      'Сессия готова. Через секунду начнётся замер — подсказки по кадру (ImageValidity) появятся в процессе измерения (Web SDK). Держите лицо в овале.',
    'scan.hintMeasuring': 'Идёт замер — следуйте подсказкам по кадру (лицо, свет, овал)',
    'scan.hintPrepare': 'Включаем камеру и алгоритм…',
    'scan.hintPrepareRun': 'Подготовка к замеру…',
    'scan.hintProcessing': 'Обработка результатов…',
    'scan.hintSaving': 'Сохраняем результат на сервер…',
    'scan.hintSaveFail': 'Не удалось отправить данные',
    'scan.errVideoTimeout': 'Камера не передала кадр. Проверьте разрешения и попробуйте снова.',
    'scan.errNoVideo': 'Нет элемента видео',
    'scan.errCameraRetry': 'Камера недоступна. Нажмите «Повторить».',
    'scan.errStartMeasure': 'Не удалось начать измерение',
    'scan.errSave': 'Ошибка сохранения',
    'scan.errSdk': 'Ошибка SDK (код {code}). Попробуйте ещё раз.',
    'scan.hintSdkErr': 'Ошибка измерения (код {code})',
    'scan.hintSdkWarn': 'Предупреждение {code}: при возможности улучшите кадр',
    'scan.errPrepare': 'Не удалось подготовить сканирование',
    'scan.btnCancel': 'Отменить',
    'scan.btnRetry': 'Повторить',
    'scan.btnStart': 'Начать',
    'scan.btnPreparing': 'Подготовка…',
    'scan.btnWait': 'Подождите…',
    'scan.btnCamera': 'Камера…',
    'scan.btnSaving': 'Сохранение…',
    'scan.pulseWait': 'Пульс…',
    'scan.pulseBpmUnit': 'уд/мин',
    'scan.framePending': 'Кадр: ожидание…',
    'scan.session.init': 'Инициализация…',
    'scan.session.active': 'Готовность',
    'scan.session.measuring': 'Измерение',
    'scan.session.stopping': 'Обработка',
    'scan.session.terminated': 'Завершено',
    'scan.session.default': 'Подготовка',
    'scan.hintMeasuringValid':
      'Кадр хороший — не двигайтесь. Пульс появится в плашке, когда алгоритм стабилизирует кадр.',
    'scan.hintMeasuringRoi':
      'Идёт измерение — SDK не видит лицо в кадре: ближе к камере, ровный свет, смотрите прямо',
    'scan.hintMeasuringOrientation':
      'Идёт измерение — удержите ту же ориентацию устройства, что при «Начать»',
    'scan.hintMeasuringTilt': 'Идёт измерение — выпрямите голову, без резких движений',
    'scan.hintMeasuringFar': 'Идёт измерение — подойдите чуть ближе к камере',
    'scan.hintMeasuringLight': 'Идёт измерение — сделайте свет на лице ровнее',
    'scan.hintMeasuringDefault': 'Идёт измерение — сохраняйте лицо в овале и не двигайтесь',
    'scan.iv.valid': 'Лицо в кадре — можно не двигаться',
    'scan.iv.orientation': 'Поверните устройство так же, как при нажатии «Начать» (ориентация сессии)',
    'scan.iv.roi': 'Алгоритм не видит лицо в кадре — чуть ближе, ровный свет, смотрите прямо в камеру',
    'scan.iv.tilt': 'Не наклоняйте голову',
    'scan.iv.far': 'Подойдите ближе к камере',
    'scan.iv.light': 'Свет на лице должен быть ровнее',
    'scan.iv.default': 'Настройте положение лица',
    'scan.pill.valid': 'Лицо и свет — OK',
    'scan.pill.roi': 'Лицо не распознано',
    'scan.pill.light': 'Свет неровный',
    'scan.pill.tilt': 'Голова наклонена',
    'scan.pill.orientation': 'Сменилась ориентация',
    'scan.pill.far': 'Дальше к камере',
    'scan.pill.pending': 'Кадр проверяется…',

    'healthScore.label': 'Показатель здоровья',
    'healthScore.band.green': 'Хороший уровень',
    'healthScore.band.yellow': 'Средний уровень',
    'healthScore.band.red': 'Требует внимания',
    'healthScore.band.unknown': 'Нет данных',
    'healthScore.aria': 'Показатель здоровья {score} из 100, {caption}',
    'healthScore.ariaNA': 'Показатель здоровья недоступен',

    'welcome.sheetCaption': 'После нажатия на карточку',
    'welcome.sheetOk': 'Понятно',

    'metricGrid.tapHint': 'Нажмите, чтобы узнать больше',

    'metricSheet.disclaimer':
      'Не является медицинским диагнозом. Необходима консультация специалиста.',
    'metricSheet.ok': 'Понятно',
  },
  en: {
    'lang.ru': 'Русский',
    'lang.en': 'English',

    'languageSelect.continue': 'Continue',
    'languageSelect.continueBilingual': 'Продолжить / Continue',
    'languageSelect.continueWait': 'Please wait…',
    'languageSelect.error': 'Could not apply language. Please try again.',

    'welcome.brand': 'MobileMed',
    'welcome.title': 'Face-based health check',
    'welcome.lead':
      'Scan with your phone camera — no separate app, right in the browser.',
    'welcome.langLabel': 'Language',
    'welcome.stepsTitle': 'How it works',
    'welcome.previewScoreTitle': 'Sample results',
    'welcome.previewScoreHint': 'Overall score after scanning',
    'welcome.metricsTitle': 'Metrics',
    'welcome.tapFlow1': 'Tap a card',
    'welcome.tapFlow2': 'Details sheet',
    'welcome.demoHint': 'Tap to learn more',
    'welcome.connecting': 'Connecting to server…',
    'welcome.retry': 'Try again',
    'welcome.continueWait': 'Please wait…',
    'welcome.continue': 'Start measurement',
    'welcome.disclaimer':
      'Camera access is required for scanning. This service does not replace a doctor’s advice.',
    'welcome.localeError': 'Could not change language. Please try again.',

    'results.brand': 'MobileMed',
    'results.title': 'Results',
    'results.leadOk':
      'Summary of your latest scan: overall score and details for each metric.',
    'results.leadSaveFail':
      'The latest scan was not saved — run the measurement again if needed.',
    'results.loading': 'Loading details…',
    'results.retry': 'Retry',
    'results.empty':
      'No scans with interpretation yet. After a successful save, data will appear here.',
    'results.idMismatch':
      'The scan you just saved is not in the list yet — showing the latest available scan. Refresh in a few seconds or tap Retry.',
    'results.metricsTitle': 'All metrics',
    'results.transcriptsEmpty':
      'No metric details yet. Data may appear after server processing.',
    'results.measureAgain': 'Measure again',
    'results.home': 'Home',
    'results.disclaimer': 'This analysis does not replace medical advice.',
    'results.settingsTitle': 'Settings',
    'results.settingsLang': 'UI and API response language',
    'results.settingsLangHint':
      'Changing language re-authenticates you — the scan list will reload.',
    'results.loadError': 'Could not load results',
    'results.localeError': 'Could not change language',
    'results.heroAria': 'Overall health score',
    'results.metricsAria': 'All metrics',
    'results.actionsAria': 'Actions',

    'common.back': 'Back',
    'common.close': 'Close',
    'common.closeHint': 'Dismiss hint',

    'app.scanLoading': 'Loading scanner…',
    'app.authError': 'Connection error',
    'app.profileLoadError': 'Could not load saved profile data',

    'userData.title': 'Your details',
    'userData.lead':
      'Filling in the form lets the app provide richer interpretation after scanning.',
    'userData.sexTitle': 'Sex',
    'userData.sexSubtitle': 'Used to account for physiological differences',
    'userData.sexMale': 'Male',
    'userData.sexFemale': 'Female',
    'userData.sexNote': 'Saved and used when interpreting results',
    'userData.ageTitle': 'Age',
    'userData.ageSubtitle': 'Enter your full age in years',
    'userData.agePlaceholder': 'e.g. 42',
    'userData.heightWeightTitle': 'Height and weight',
    'userData.heightWeightSubtitle': 'In centimetres and kilograms.',
    'userData.heightLabel': 'Height, cm',
    'userData.weightLabel': 'Weight, kg',
    'userData.heightOk': 'Height and weight saved',
    'userData.smokingTitle': 'Smoking',
    'userData.smokingSubtitle': 'An honest answer helps estimate lifestyle impact more accurately',
    'userData.smokingNon': 'Non-smoker',
    'userData.smokingYes': 'Smoker',
    'userData.smokingNoteNon': 'Saved for the report',
    'userData.smokingNoteYes': 'Will be considered in interpretation',
    'userData.saveError': 'Could not save data',
    'userData.next': 'Continue',
    'userData.saving': 'Saving…',
    'userData.footerHint':
      'All fields are required. Tapping Continue sends the form to the server (user/update); policy and documents are accepted.',
    'userData.validation.ageRequired': 'Enter your age',
    'userData.validation.ageInt': 'Age must be a whole number',
    'userData.validation.ageRange': 'Age must be between {min} and {max}',
    'userData.validation.heightRequired': 'Enter your height',
    'userData.validation.heightInt': 'Height must be a whole number in cm',
    'userData.validation.heightRange': 'Height must be between {min} and {max} cm',
    'userData.validation.weightRequired': 'Enter your weight',
    'userData.validation.weightFormat': 'Enter weight as a number, decimals allowed',
    'userData.validation.weightInvalid': 'Invalid weight format',
    'userData.validation.weightRange': 'Weight must be between {min} and {max} kg',
    'userData.validation.sexRequired': 'Select sex',
    'userData.validation.smokingRequired': 'Select a smoking option',
    'userData.ageSavedSuffix': '— saved',
    'userData.ageLineEn': '{count} {years} — saved',

    'instruction.title': 'Preparation',
    'instruction.lead': 'Get ready to scan. Follow the tips for a more accurate result.',
    'instruction.cardPrivate': 'Private',
    'instruction.cardTime': '~60 seconds',
    'instruction.cardNotDiag': 'Not a diagnosis',
    'instruction.important': 'Important tips',
    'instruction.req1Title': 'Good lighting',
    'instruction.req1Text': 'Make sure your face is well lit. Avoid harsh shadows on your face.',
    'instruction.req2Title': 'Stay still',
    'instruction.req2Text':
      'Sit down, hold the phone 20–30 cm away, and do not talk during the scan.',
    'instruction.req3Title': 'Accessibility',
    'instruction.req3Text': 'Remove glasses and headwear — they interfere with scanning.',
    'instruction.req3Extra': 'Do not scan if battery is below 20%.',
    'instruction.req4Title': 'Stay calm',
    'instruction.req4Text': 'Avoid intense exercise right before scanning and do not smoke.',
    'instruction.confirm': 'I understand and I am ready to scan',
    'instruction.startScan': 'Start scanning',

    'scan.ariaApp': 'Face scanning',
    'scan.title': 'Scanning',
    'scan.lead':
      'On-device analysis. After the scan open Results for the summary and interpretation.',
    'scan.hintCameraOn': 'Turning on camera…',
    'scan.hintCameraRequest': 'Requesting camera access…',
    'scan.hintSdkLoad': 'Loading algorithm…',
    'scan.hintPreview': 'Place your face in the oval. Tap Start when you are ready.',
    'scan.hintRunning':
      'Session ready. Measurement will begin in a second — frame hints (ImageValidity) appear during the scan (Web SDK). Keep your face in the oval.',
    'scan.hintMeasuring': 'Measuring — follow the on-screen frame hints (face, light, oval)',
    'scan.hintPrepare': 'Starting camera and algorithm…',
    'scan.hintPrepareRun': 'Preparing measurement…',
    'scan.hintProcessing': 'Processing results…',
    'scan.hintSaving': 'Saving result to server…',
    'scan.hintSaveFail': 'Could not send data',
    'scan.errVideoTimeout': 'No video frame. Check permissions and try again.',
    'scan.errNoVideo': 'Video element missing',
    'scan.errCameraRetry': 'Camera unavailable. Tap Retry.',
    'scan.errStartMeasure': 'Could not start measurement',
    'scan.errSave': 'Save error',
    'scan.errSdk': 'SDK error (code {code}). Please try again.',
    'scan.hintSdkErr': 'Measurement error (code {code})',
    'scan.hintSdkWarn': 'Warning {code}: improve the frame if you can',
    'scan.errPrepare': 'Could not prepare scanning',
    'scan.btnCancel': 'Cancel',
    'scan.btnRetry': 'Retry',
    'scan.btnStart': 'Start',
    'scan.btnPreparing': 'Preparing…',
    'scan.btnWait': 'Please wait…',
    'scan.btnCamera': 'Camera…',
    'scan.btnSaving': 'Saving…',
    'scan.pulseWait': 'Pulse…',
    'scan.pulseBpmUnit': 'bpm',
    'scan.framePending': 'Frame: waiting…',
    'scan.session.init': 'Initializing…',
    'scan.session.active': 'Ready',
    'scan.session.measuring': 'Measuring',
    'scan.session.stopping': 'Processing',
    'scan.session.terminated': 'Finished',
    'scan.session.default': 'Preparation',
    'scan.hintMeasuringValid':
      'Good frame — hold still. Pulse will appear once the algorithm stabilizes the image.',
    'scan.hintMeasuringRoi':
      'Measuring — face not in frame: move closer, even light, look straight at the camera',
    'scan.hintMeasuringOrientation':
      'Measuring — keep the same device orientation as when you tapped Start',
    'scan.hintMeasuringTilt': 'Measuring — straighten your head, avoid sudden moves',
    'scan.hintMeasuringFar': 'Measuring — move a little closer to the camera',
    'scan.hintMeasuringLight': 'Measuring — make the light on your face more even',
    'scan.hintMeasuringDefault': 'Measuring — keep your face in the oval and stay still',
    'scan.iv.valid': 'Face in frame — you can hold still',
    'scan.iv.orientation': 'Hold the device the same way as when you tapped Start (session orientation)',
    'scan.iv.roi': 'Algorithm does not see a face — move closer, even light, look at the camera',
    'scan.iv.tilt': 'Do not tilt your head',
    'scan.iv.far': 'Move closer to the camera',
    'scan.iv.light': 'Light on the face should be more even',
    'scan.iv.default': 'Adjust face position',
    'scan.pill.valid': 'Face and light — OK',
    'scan.pill.roi': 'Face not detected',
    'scan.pill.light': 'Uneven light',
    'scan.pill.tilt': 'Head tilted',
    'scan.pill.orientation': 'Orientation changed',
    'scan.pill.far': 'Move closer',
    'scan.pill.pending': 'Checking frame…',

    'healthScore.label': 'Health score',
    'healthScore.band.green': 'Good level',
    'healthScore.band.yellow': 'Average level',
    'healthScore.band.red': 'Needs attention',
    'healthScore.band.unknown': 'No data',
    'healthScore.aria': 'Health score {score} out of 100, {caption}',
    'healthScore.ariaNA': 'Health score unavailable',

    'welcome.sheetCaption': 'After you tap a card',
    'welcome.sheetOk': 'OK',

    'metricGrid.tapHint': 'Tap to learn more',

    'metricSheet.disclaimer':
      'This is not a medical diagnosis. Consult a healthcare professional.',
    'metricSheet.ok': 'OK',
  },
}

/**
 * @param {AppLocale} locale
 * @param {string} key
 * @param {Record<string, string>} [vars]
 */
export function formatMessage(locale, key, vars) {
  const table = MESSAGES[normalizeLocale(locale)] ?? MESSAGES.ru
  let s = table[key] ?? MESSAGES.ru[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  }
  return s
}
