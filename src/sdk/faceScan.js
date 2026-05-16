import { DeviceOrientation, ImageValidity, Sex, SmokingStatus } from './biosenseEnums.js'
import { getHealthMonitorManager } from './loadBiosenseSdk.js'
import { scanSdkDebug } from './scanSdkDebug.js'
import { normalizeUserInformationForm } from './userInformation.js'

/**
 * Лицензия и productId: VITE_BIOSENSESIGNAL_LICENSE_KEY, VITE_BIOSENSESIGNAL_PRODUCT_ID (.env).
 * Инициализация: healthMonitorManager.initialize({ licenseKey, productId?, licenseInfo }) — см. docs/SDK.md.
 * onEnabledVitalSigns задаётся в licenseInfo (не в createFaceSession) — см. LicenseInfo в SDK.
 */

let sdkInitPromise = null

export function getBiosenseLicenseKey() {
  return String(import.meta.env.VITE_BIOSENSESIGNAL_LICENSE_KEY ?? '').trim()
}

export function getBiosenseProductId() {
  return String(import.meta.env.VITE_BIOSENSESIGNAL_PRODUCT_ID ?? '').trim()
}

/** Длительность измерения, сек (допустимо 20–180 по SDK). */
export const DEFAULT_PROCESSING_SECONDS = 60

/**
 * DeviceOrientation для FaceSessionOptions (docs/SDK.md «Ориентация устройства»).
 * Задаётся при createFaceSession; при несовпадении с фактической — INVALID_DEVICE_ORIENTATION.
 * Опционально: VITE_FACE_SDK_ORIENTATION=PORTRAIT | LANDSCAPE_LEFT | LANDSCAPE_RIGHT (принудительно).
 */
export function resolveSdkDeviceOrientation() {
  const raw = String(import.meta.env?.VITE_FACE_SDK_ORIENTATION ?? '')
    .trim()
    .toUpperCase()
  if (raw === 'PORTRAIT') return DeviceOrientation.PORTRAIT
  if (raw === 'LANDSCAPE_LEFT' || raw === 'LANDSCAPELEFT')
    return DeviceOrientation.LANDSCAPE_LEFT
  if (raw === 'LANDSCAPE_RIGHT' || raw === 'LANDSCAPERIGHT')
    return DeviceOrientation.LANDSCAPE_RIGHT

  if (typeof window === 'undefined') return DeviceOrientation.PORTRAIT

  const t = window.screen?.orientation?.type
  if (t === 'portrait-primary' || t === 'portrait-secondary') {
    return DeviceOrientation.PORTRAIT
  }
  if (t === 'landscape-primary') {
    return DeviceOrientation.LANDSCAPE_LEFT
  }
  if (t === 'landscape-secondary') {
    return DeviceOrientation.LANDSCAPE_RIGHT
  }

  try {
    if (window.matchMedia('(orientation: portrait)').matches) {
      return DeviceOrientation.PORTRAIT
    }
  } catch {
    /* ignore */
  }

  const o = window.orientation
  if (o === 90) return DeviceOrientation.LANDSCAPE_LEFT
  if (o === -90) return DeviceOrientation.LANDSCAPE_RIGHT

  return DeviceOrientation.PORTRAIT
}

/** Имя enum для логов (локальные числа как в biosenseEnums). */
export function sdkDeviceOrientationLabel(value) {
  const key = Object.keys(DeviceOrientation).find((k) => DeviceOrientation[k] === value)
  return key ?? String(value)
}

export function ensureSdkInitialized() {
  if (sdkInitPromise) return sdkInitPromise
  const licenseKey = getBiosenseLicenseKey()
  if (!licenseKey) {
    return Promise.reject(new Error('Не задан VITE_BIOSENSESIGNAL_LICENSE_KEY'))
  }
  const productId = getBiosenseProductId()
  const baseOpts = productId ? { licenseKey, productId } : { licenseKey }
  const opts = {
    ...baseOpts,
    licenseInfo: {
      onEnabledVitalSigns: (enabledVitalSigns) => {
        if (enabledVitalSigns == null || typeof enabledVitalSigns !== 'object') {
          scanSdkDebug('onEnabledVitalSigns', { raw: enabledVitalSigns })
          return
        }
        const keysOn = Object.keys(enabledVitalSigns).filter(
          (k) => enabledVitalSigns[k] === true,
        )
        scanSdkDebug('onEnabledVitalSigns — показатели по лицензии', {
          isEnabledPulseRate: enabledVitalSigns.isEnabledPulseRate,
          isEnabledRespirationRate: enabledVitalSigns.isEnabledRespirationRate,
          isEnabledBloodPressure: enabledVitalSigns.isEnabledBloodPressure,
          enabledCount: keysOn.length,
          enabledKeysSample: keysOn.slice(0, 16),
        })
      },
    },
  }
  sdkInitPromise = getHealthMonitorManager()
    .then((healthMonitorManager) => healthMonitorManager.initialize(opts))
    .catch((e) => {
      sdkInitPromise = null
      throw e
    })
  return sdkInitPromise
}

/**
 * Форма «Ваши данные» → UserInformation для FaceSessionOptions (docs/SDK.md).
 * Неизвестные поля не подменяются «типовыми» числами — без полного набора userInformation
 * не передаётся (риски АССЗ / сердечный возраст по доке тогда не считаются).
 * Sex/Smoking: UNSPECIFIED = 0, MALE=1, FEMALE=2; SMOKER=1, NON_SMOKER=2.
 *
 * @returns {{ sex: number, age: number, weight: number, height: number, smokingStatus: number } | null}
 */
export function mapFormToSdkUserInformation(form) {
  const n = normalizeUserInformationForm(form ?? {})
  if (
    n.sex == null ||
    n.smokingStatus == null ||
    n.age == null ||
    n.height == null ||
    n.weight == null
  ) {
    return null
  }
  return {
    sex: n.sex === 'FEMALE' ? Sex.FEMALE : n.sex === 'MALE' ? Sex.MALE : Sex.UNSPECIFIED,
    smokingStatus:
      n.smokingStatus === 'SMOKER'
        ? SmokingStatus.SMOKER
        : n.smokingStatus === 'NON_SMOKER'
          ? SmokingStatus.NON_SMOKER
          : SmokingStatus.UNSPECIFIED,
    age: n.age,
    height: Math.round(n.height),
    weight: Math.round(n.weight),
  }
}

/**
 * Тексты под ImageValidity из onImageData (docs/SDK.md — «Достоверность изображения», таблица причин).
 * Покрыты: VALID, INVALID_DEVICE_ORIENTATION, INVALID_ROI, TILTED_HEAD, FACE_TOO_FAR, UNEVEN_LIGHT.
 * FACE_TOO_FAR: в веб-версии по доке часто не используется; строка оставлена на случай ответа SDK.
 */
export function imageValidityToUserMessage(validity) {
  switch (validity) {
    case ImageValidity.VALID:
      return 'Лицо в кадре — можно не двигаться'
    case ImageValidity.INVALID_DEVICE_ORIENTATION:
      return 'Поверните устройство так же, как при нажатии «Начать» (ориентация сессии)'
    case ImageValidity.INVALID_ROI:
      return 'Алгоритм не видит лицо в кадре — чуть ближе, ровный свет, смотрите прямо в камеру'
    case ImageValidity.TILTED_HEAD:
      return 'Не наклоняйте голову'
    case ImageValidity.FACE_TOO_FAR:
      return 'Подойдите ближе к камере'
    case ImageValidity.UNEVEN_LIGHT:
      return 'Свет на лице должен быть ровнее'
    default:
      return 'Настройте положение лица'
  }
}

/**
 * Короткая подпись для HUD (onImageData / ImageValidity — docs/SDK.md).
 * @param {number | null | undefined} validity
 * @returns {string}
 */
export function imageValidityShortPillLabel(validity) {
  switch (validity) {
    case ImageValidity.VALID:
      return 'Лицо и свет — OK'
    case ImageValidity.INVALID_ROI:
      return 'Лицо не распознано'
    case ImageValidity.UNEVEN_LIGHT:
      return 'Свет неровный'
    case ImageValidity.TILTED_HEAD:
      return 'Голова наклонена'
    case ImageValidity.INVALID_DEVICE_ORIENTATION:
      return 'Сменилась ориентация'
    case ImageValidity.FACE_TOO_FAR:
      return 'Дальше к камере'
    default:
      return 'Кадр проверяется…'
  }
}

export { getHealthMonitorManager }
