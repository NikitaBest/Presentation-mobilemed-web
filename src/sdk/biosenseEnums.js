/**
 * Числовые enum из BiosenseSignal Web SDK (см. vendor …/dist/*.d.ts).
 * UMD-бандл main.js не отдаёт именованные ESM-экспорты — используем локальные константы.
 */

/** @readonly */
export const ImageValidity = {
  VALID: 0,
  INVALID_DEVICE_ORIENTATION: 1,
  INVALID_ROI: 2,
  TILTED_HEAD: 3,
  FACE_TOO_FAR: 4,
  UNEVEN_LIGHT: 5,
  FACE_NOT_CENTERED: 6,
  DEVICE_NOT_ALIGNED: 7,
}

/** @readonly */
export const Sex = {
  UNSPECIFIED: 0,
  MALE: 1,
  FEMALE: 2,
}

/** @readonly */
export const SmokingStatus = {
  UNSPECIFIED: 0,
  SMOKER: 1,
  NON_SMOKER: 2,
}

/** @readonly */
export const SessionState = {
  INIT: 0,
  ACTIVE: 1,
  MEASURING: 2,
  STOPPING: 3,
  TERMINATED: 4,
  POSTURE_CHECK: 5,
}

/** @readonly — SDK v5.13 PGS */
export const CaptureMetricStatus = {
  VALID: 0,
  WARNING: 1,
  ERROR: 2,
}

/** @readonly — SDK v5.13 PGS */
export const CaptureValidity = {
  CAPTURE_VALID: 0,
  CAPTURE_WARNING: 1,
  CAPTURE_ERROR: 2,
}

/** @readonly — SDK v5.13 PGS, единственный landmark в CaptureFaceData */
export const CaptureLandmark = {
  NOSE: 0,
}

/** @readonly — см. vendor …/device/types.d.ts */
export const DeviceOrientation = {
  PORTRAIT: 0,
  LANDSCAPE_LEFT: 1,
  LANDSCAPE_RIGHT: 2,
}
