import {
  CaptureMetricStatus,
  CaptureValidity,
  ImageValidity,
  SessionState,
} from './biosenseEnums.js'
import { imageValidityShortPillLabel, imageValidityToUserMessage } from './faceScan.js'

/** Ошибки SDK на экране сканирования — см. alerts-list (Web SDK docs). */
const SDK_MEASUREMENT_ERROR_KEYS = {
  1001: 'scan.sdkErr1001',
  1002: 'scan.sdkErr1002',
  1005: 'scan.sdkErr1005',
  3003: 'scan.sdkErr3003',
  3004: 'scan.sdkErr3004',
  3006: 'scan.sdkErr3006',
  3008: 'scan.sdkErr3008',
  3009: 'scan.sdkErr3009',
  3011: 'scan.sdkErr3011',
  3013: 'scan.sdkErr3013',
  3014: 'scan.sdkErr3014',
  3015: 'scan.sdkErr3015',
  6004: 'scan.sdkErr6004',
  6005: 'scan.sdkErr6005',
  6006: 'scan.sdkErr6006',
  6007: 'scan.sdkErr6007',
}

/** PGS: при strictMeasurementGuidance ошибки позы — не фатальны, только подсказка в UI */
export const SDK_POSTURE_GUIDANCE_ERROR_CODES = new Set([3011, 3013, 3014, 3015])

/**
 * @param {number | string | null | undefined} code
 */
export function isPostureGuidanceSdkError(code) {
  return SDK_POSTURE_GUIDANCE_ERROR_CODES.has(Number(code))
}

const SDK_MEASUREMENT_WARNING_KEYS = {
  1501: 'scan.sdkWarn1501',
  3500: 'scan.sdkWarn3500',
  3505: 'scan.sdkWarn3505',
  3506: 'scan.sdkWarn3506',
  4505: 'scan.sdkWarn4505',
  4506: 'scan.sdkWarn4506',
}

/**
 * @param {{ value?: number, status?: number } | null | undefined} metric
 * @param {string} negKey
 * @param {string} posKey
 * @param {(key: string) => string} t
 */
function hintFromSignedMetric(metric, negKey, posKey, t) {
  if (!metric || metric.status === CaptureMetricStatus.VALID) return null
  const key = (metric.value ?? 0) < 0 ? negKey : posKey
  return t(key)
}

/**
 * @param {{ value?: number, status?: number } | null | undefined} metric
 * @param {string} key
 * @param {(key: string) => string} t
 */
function hintFromMetric(metric, key, t) {
  if (!metric || metric.status === CaptureMetricStatus.VALID) return null
  return t(key)
}

/**
 * @typedef {{
 *   face?: {
 *     yaw?: { value?: number, status?: number },
 *     roll?: { value?: number, status?: number },
 *     pitch?: { value?: number, status?: number },
 *     verticalAlignment?: { value?: number, status?: number },
 *     horizontalAlignment?: { value?: number, status?: number },
 *   },
 *   device?: { pitch?: { value?: number, status?: number } },
 *   environment?: { lightingUniformity?: { value?: number, status?: number } },
 *   validity?: number,
 * }} CaptureDataLike
 */

/**
 * @param {CaptureDataLike | null | undefined} capture
 */
function collectFaceMetrics(capture) {
  if (!capture?.face) return []
  const face = capture.face
  return [face.yaw, face.roll, face.pitch, face.horizontalAlignment, face.verticalAlignment]
}

/**
 * @param {Array<{ status?: number } | null | undefined>} metrics
 */
function worstMetricStatus(metrics) {
  let worst = CaptureMetricStatus.VALID
  for (const metric of metrics) {
    if (metric?.status == null) continue
    if (metric.status > worst) worst = metric.status
  }
  return worst
}

/**
 * @param {number | null | undefined} status
 */
export function postureAxisTone(status) {
  if (status == null) return 'na'
  if (status === CaptureMetricStatus.VALID) return 'ok'
  if (status === CaptureMetricStatus.WARNING) return 'warn'
  return 'error'
}

/**
 * Сводка по трём осям PGS для UI.
 * @param {{ captureData?: CaptureDataLike } | null | undefined} imageData
 * @returns {{ face: number, light: number, device: number | null, overall: number | null } | null}
 */
export function buildPostureAxisSummary(imageData) {
  const capture = imageData?.captureData
  if (!capture?.face) return null

  const devicePitch = capture.device?.pitch
  return {
    face: worstMetricStatus(collectFaceMetrics(capture)),
    light: capture.environment?.lightingUniformity?.status ?? CaptureMetricStatus.VALID,
    device: devicePitch == null ? null : (devicePitch.status ?? CaptureMetricStatus.VALID),
    overall: capture.validity ?? null,
  }
}

/**
 * @param {CaptureDataLike | null | undefined} capture
 * @param {(key: string) => string} t
 * @param {{ measuring?: boolean }} [opts]
 */
function hintFromCaptureData(capture, t, opts = {}) {
  if (!capture?.face) return null
  const prefix = opts.measuring ? 'scan.pgs.measuring.' : 'scan.pgs.'

  /** @type {{ severity: number, text: string }[]} */
  const items = []

  const push = (metric, negKey, posKey) => {
    if (!metric || metric.status === CaptureMetricStatus.VALID) return
    const text = hintFromSignedMetric(metric, `${prefix}${negKey}`, `${prefix}${posKey}`, t)
    if (text) items.push({ severity: metric.status ?? 0, text })
  }

  const pushPlain = (metric, key) => {
    if (!metric || metric.status === CaptureMetricStatus.VALID) return
    const text = hintFromMetric(metric, `${prefix}${key}`, t)
    if (text) items.push({ severity: metric.status ?? 0, text })
  }

  push(capture.face.horizontalAlignment, 'alignLeft', 'alignRight')
  push(capture.face.verticalAlignment, 'alignHigh', 'alignLow')
  push(capture.face.yaw, 'yawRight', 'yawLeft')
  push(capture.face.roll, 'rollLeft', 'rollRight')
  push(capture.face.pitch, 'pitchDown', 'pitchUp')
  pushPlain(capture.environment?.lightingUniformity, 'light')
  push(capture.device?.pitch, 'deviceDown', 'deviceUp')

  if (items.length === 0) {
    if (capture.validity === CaptureValidity.CAPTURE_VALID) {
      return t(opts.measuring ? 'scan.hintMeasuringValid' : 'scan.pgs.ready')
    }
    return t('scan.pgs.adjust')
  }

  items.sort((a, b) => b.severity - a.severity)
  return items[0].text
}

/**
 * @param {number | null | undefined} imageValidity
 * @param {{ imageValidity?: number, captureData?: CaptureDataLike } | null | undefined} imageData
 */
export function isScanFrameOk(imageValidity, imageData) {
  const capture = imageData?.captureData
  if (capture) {
    return capture.validity === CaptureValidity.CAPTURE_VALID
  }
  return imageValidity === ImageValidity.VALID
}

/**
 * @param {number | null | undefined} imageValidity
 * @param {{ imageValidity?: number, captureData?: CaptureDataLike } | null | undefined} imageData
 * @param {(key: string) => string} t
 * @param {{ measuring?: boolean }} [opts]
 */
export function resolveScanFrameHint(imageValidity, imageData, t, opts = {}) {
  const validity = imageData?.imageValidity ?? imageValidity
  const capture = imageData?.captureData

  if (validity === ImageValidity.INVALID_DEVICE_ORIENTATION) {
    return imageValidityToUserMessage(validity, t)
  }
  if (validity === ImageValidity.INVALID_ROI) {
    return imageValidityToUserMessage(validity, t)
  }

  const captureHint = hintFromCaptureData(capture, t, opts)
  if (captureHint) return captureHint

  if (opts.measuring) {
    switch (validity) {
      case ImageValidity.VALID:
        return t('scan.hintMeasuringValid')
      case ImageValidity.TILTED_HEAD:
        return t('scan.hintMeasuringTilt')
      case ImageValidity.UNEVEN_LIGHT:
        return t('scan.hintMeasuringLight')
      case ImageValidity.FACE_NOT_CENTERED:
        return t('scan.pgs.measuring.alignLeft')
      case ImageValidity.DEVICE_NOT_ALIGNED:
        return t('scan.pgs.measuring.deviceDown')
      default:
        return t('scan.hintMeasuringDefault')
    }
  }

  return imageValidityToUserMessage(validity, t)
}

/**
 * @param {number | null | undefined} imageValidity
 * @param {{ imageValidity?: number, captureData?: CaptureDataLike } | null | undefined} imageData
 * @param {(key: string) => string} t
 */
export function resolveScanFramePill(imageValidity, imageData, t) {
  if (isScanFrameOk(imageValidity, imageData)) {
    return t('scan.pill.valid')
  }

  const capture = imageData?.captureData
  if (capture?.face) {
    const face = capture.face
    if (
      face.horizontalAlignment?.status !== CaptureMetricStatus.VALID ||
      face.verticalAlignment?.status !== CaptureMetricStatus.VALID
    ) {
      return t('scan.pill.center')
    }
    if (
      face.yaw?.status !== CaptureMetricStatus.VALID ||
      face.roll?.status !== CaptureMetricStatus.VALID ||
      face.pitch?.status !== CaptureMetricStatus.VALID
    ) {
      return t('scan.pill.tilt')
    }
    if (capture.environment?.lightingUniformity?.status !== CaptureMetricStatus.VALID) {
      return t('scan.pill.light')
    }
    if (capture.device?.pitch?.status !== CaptureMetricStatus.VALID) {
      return t('scan.pill.device')
    }
  }

  const validity = imageData?.imageValidity ?? imageValidity
  return imageValidityShortPillLabel(validity, t)
}

/**
 * @param {number | string | null | undefined} code
 * @param {(key: string) => string} t
 */
export function sdkMeasurementErrorMessage(code, t) {
  const n = Number(code)
  const key = SDK_MEASUREMENT_ERROR_KEYS[n]
  if (key) return t(key)
  return t('scan.errSdk', { code: String(code ?? '?') })
}

/**
 * @param {number | string | null | undefined} code
 * @param {(key: string) => string} t
 */
export function sdkMeasurementWarningMessage(code, t) {
  const n = Number(code)
  const key = SDK_MEASUREMENT_WARNING_KEYS[n]
  if (key) return t(key)
  return t('scan.hintSdkWarn', { code: String(code ?? '?') })
}
