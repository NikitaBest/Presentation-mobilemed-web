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
}

/** @readonly — см. vendor …/device/types.d.ts */
export const DeviceOrientation = {
  PORTRAIT: 0,
  LANDSCAPE_LEFT: 1,
  LANDSCAPE_RIGHT: 2,
}
