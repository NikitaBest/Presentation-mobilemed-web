/**
 * Маппинг captureData.face.roi (BiosenseSignal PGS) → позиция овала в UI.
 * Учитывает object-fit: cover и зеркало превью (scaleX(-1) на video).
 */

/** @typedef {{ x: number, y: number, width: number, height: number }} PixelRect */
/** @typedef {{ cx: number, cy: number, rx: number, ry: number }} EllipseLayoutPct */

const ROI_PAD = 1.14
const MIN_AXIS_PCT = 7
const MAX_AXIS_PCT = 48

/**
 * @param {{ x: number, y: number, width: number, height: number }} roi
 * @param {number} videoW
 * @param {number} videoH
 * @returns {PixelRect | null}
 */
export function roiToPixelRect(roi, videoW, videoH) {
  if (!roi || roi.width <= 0 || roi.height <= 0) return null

  const normalized =
    roi.x >= 0 &&
    roi.y >= 0 &&
    roi.x <= 1 &&
    roi.y <= 1 &&
    roi.width <= 1 &&
    roi.height <= 1 &&
    roi.x + roi.width <= 1.05 &&
    roi.y + roi.height <= 1.05

  if (normalized) {
    return {
      x: roi.x * videoW,
      y: roi.y * videoH,
      width: roi.width * videoW,
      height: roi.height * videoH,
    }
  }

  return { x: roi.x, y: roi.y, width: roi.width, height: roi.height }
}

/**
 * @param {PixelRect} rect
 * @param {number} videoW
 * @param {number} videoH
 * @param {number} containerW
 * @param {number} containerH
 * @param {{ mirrorX?: boolean, pad?: number }} [opts]
 * @returns {PixelRect}
 */
export function mapVideoRectToCoverContainer(
  rect,
  videoW,
  videoH,
  containerW,
  containerH,
  opts = {},
) {
  const { mirrorX = true, pad = ROI_PAD } = opts
  const scale = Math.max(containerW / videoW, containerH / videoH)
  const renderedW = videoW * scale
  const renderedH = videoH * scale
  const offsetX = (containerW - renderedW) / 2
  const offsetY = (containerH - renderedH) / 2

  let x = offsetX + rect.x * scale
  let y = offsetY + rect.y * scale
  let w = rect.width * scale
  let h = rect.height * scale

  const cx = x + w / 2
  const cy = y + h / 2
  w *= pad
  h *= pad
  x = cx - w / 2
  y = cy - h / 2

  if (mirrorX) {
    x = containerW - x - w
  }

  return { x, y, width: w, height: h }
}

/**
 * @param {PixelRect} rect
 * @param {number} containerW
 * @param {number} containerH
 * @returns {EllipseLayoutPct}
 */
export function rectToEllipsePercent(rect, containerW, containerH) {
  const cx = ((rect.x + rect.width / 2) / containerW) * 100
  const cy = ((rect.y + rect.height / 2) / containerH) * 100
  let rx = (rect.width / 2 / containerW) * 100
  let ry = (rect.height / 2 / containerH) * 100

  rx = Math.min(MAX_AXIS_PCT, Math.max(MIN_AXIS_PCT, rx))
  ry = Math.min(MAX_AXIS_PCT, Math.max(MIN_AXIS_PCT, ry))

  return { cx, cy, rx, ry }
}

/**
 * @param {EllipseLayoutPct | null | undefined} prev
 * @param {EllipseLayoutPct} next
 * @param {number} [factor]
 * @returns {EllipseLayoutPct}
 */
export function smoothEllipseLayout(prev, next, factor = 0.32) {
  if (!prev) return next
  const lerp = (a, b) => a + (b - a) * factor
  return {
    cx: lerp(prev.cx, next.cx),
    cy: lerp(prev.cy, next.cy),
    rx: lerp(prev.rx, next.rx),
    ry: lerp(prev.ry, next.ry),
  }
}

/**
 * @param {{ x: number, y: number, width: number, height: number } | null | undefined} roi
 * @param {number} videoW
 * @param {number} videoH
 * @param {number} containerW
 * @param {number} containerH
 * @returns {EllipseLayoutPct | null}
 */
export function computeFaceRoiLayout(roi, videoW, videoH, containerW, containerH) {
  if (!roi || videoW <= 0 || videoH <= 0 || containerW <= 0 || containerH <= 0) return null

  const px = roiToPixelRect(roi, videoW, videoH)
  if (!px) return null

  const mapped = mapVideoRectToCoverContainer(px, videoW, videoH, containerW, containerH)
  return rectToEllipsePercent(mapped, containerW, containerH)
}

/**
 * @param {EllipseLayoutPct} layout
 * @returns {Record<string, string>}
 */
export function faceRoiLayoutToCssVars(layout) {
  return {
    '--scan-roi-cx': `${layout.cx}%`,
    '--scan-roi-cy': `${layout.cy}%`,
    '--scan-roi-rx': `${layout.rx}%`,
    '--scan-roi-ry': `${layout.ry}%`,
    '--scan-oval-cy': `${layout.cy}%`,
    '--scan-oval-rx': `${layout.rx}%`,
    '--scan-oval-ry': `${layout.ry}%`,
  }
}

/** @typedef {{ nx: number, ny: number, sx: number, sy: number, yaw: number, pitch: number, roll: number }} MaskProfile */

const DEFAULT_REF_ROI_W = 0.34
const DEFAULT_REF_ROI_H = 0.44

export const DEFAULT_MASK_PROFILE = {
  nx: 0,
  ny: 0.08,
  sx: 1,
  sy: 1,
  yaw: 0,
  pitch: 0,
  roll: 0,
}

/**
 * @param {{ x: number, y: number }} point
 * @param {number} videoW
 * @param {number} videoH
 * @returns {{ x: number, y: number }}
 */
export function capturePointToVideoPixels(point, videoW, videoH) {
  const normalized = point.x >= 0 && point.y >= 0 && point.x <= 1 && point.y <= 1
  if (normalized) {
    return { x: point.x * videoW, y: point.y * videoH }
  }
  return { x: point.x, y: point.y }
}

/**
 * @param {{ x: number, y: number }} point
 * @param {number} videoW
 * @param {number} videoH
 * @param {number} containerW
 * @param {number} containerH
 * @param {{ mirrorX?: boolean }} [opts]
 * @returns {{ x: number, y: number }}
 */
export function mapVideoPointToCoverContainer(
  point,
  videoW,
  videoH,
  containerW,
  containerH,
  opts = {},
) {
  const { mirrorX = true } = opts
  const px = capturePointToVideoPixels(point, videoW, videoH)
  const scale = Math.max(containerW / videoW, containerH / videoH)
  const renderedW = videoW * scale
  const renderedH = videoH * scale
  const offsetX = (containerW - renderedW) / 2
  const offsetY = (containerH - renderedH) / 2

  let x = offsetX + px.x * scale
  let y = offsetY + px.y * scale

  if (mirrorX) {
    x = containerW - x
  }

  return { x, y }
}

/**
 * @param {{ x: number, y: number }} point
 * @param {number} videoW
 * @param {number} videoH
 * @param {number} containerW
 * @param {number} containerH
 * @param {EllipseLayoutPct} layout
 * @returns {{ nx: number, ny: number } | null}
 */
export function computeFaceMaskAnchor(point, videoW, videoH, containerW, containerH, layout) {
  if (!point || !layout || containerW <= 0 || containerH <= 0) return null

  const mapped = mapVideoPointToCoverContainer(point, videoW, videoH, containerW, containerH)
  const cx = (layout.cx / 100) * containerW
  const cy = (layout.cy / 100) * containerH
  const rx = (layout.rx / 100) * containerW
  const ry = (layout.ry / 100) * containerH
  if (rx <= 0 || ry <= 0) return null

  return {
    nx: (mapped.x - cx) / rx,
    ny: (mapped.y - cy) / ry,
  }
}

/**
 * @param {{ landmarks?: Partial<Record<number, { x: number, y: number }>> } | null | undefined} face
 * @returns {{ x: number, y: number } | null}
 */
export function extractNoseLandmark(face) {
  if (!face?.landmarks) return null
  const landmarks = face.landmarks
  return landmarks[0] ?? landmarks.NOSE ?? null
}

/**
 * Профиль маски: нос, масштаб по ROI, углы головы.
 * @param {{ yaw?: { value?: number }, pitch?: { value?: number }, roll?: { value?: number }, landmarks?: Partial<Record<number, { x: number, y: number }>> } | null | undefined} face
 * @param {{ x: number, y: number, width: number, height: number } | null | undefined} roi
 * @param {number} videoW
 * @param {number} videoH
 * @param {number} containerW
 * @param {number} containerH
 * @param {EllipseLayoutPct | null | undefined} layout
 * @returns {MaskProfile}
 */
export function computeFaceMaskProfile(
  face,
  roi,
  videoW,
  videoH,
  containerW,
  containerH,
  layout,
) {
  const profile = { ...DEFAULT_MASK_PROFILE }
  if (!layout || containerW <= 0 || containerH <= 0) return profile

  const nose = extractNoseLandmark(face)
  if (nose) {
    const anchor = computeFaceMaskAnchor(nose, videoW, videoH, containerW, containerH, layout)
    if (anchor) {
      profile.nx = anchor.nx
      profile.ny = anchor.ny
    }
  }

  if (roi && videoW > 0 && videoH > 0) {
    const px = roiToPixelRect(roi, videoW, videoH)
    if (px) {
      const nw = px.width / videoW
      const nh = px.height / videoH
      profile.sx = Math.min(1.38, Math.max(0.7, nw / DEFAULT_REF_ROI_W))
      profile.sy = Math.min(1.38, Math.max(0.7, nh / DEFAULT_REF_ROI_H))
    }
  }

  profile.yaw = face?.yaw?.value ?? 0
  profile.pitch = face?.pitch?.value ?? 0
  profile.roll = face?.roll?.value ?? 0

  return profile
}

/**
 * @param {MaskProfile | null | undefined} prev
 * @param {MaskProfile} next
 * @param {number} [factor]
 * @returns {MaskProfile}
 */
export function smoothMaskProfile(prev, next, factor = 0.28) {
  if (!prev) return next
  const lerp = (a, b) => a + (b - a) * factor
  return {
    nx: lerp(prev.nx, next.nx),
    ny: lerp(prev.ny, next.ny),
    sx: lerp(prev.sx, next.sx),
    sy: lerp(prev.sy, next.sy),
    yaw: lerp(prev.yaw, next.yaw),
    pitch: lerp(prev.pitch, next.pitch),
    roll: lerp(prev.roll, next.roll),
  }
}
