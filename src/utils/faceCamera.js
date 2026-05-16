/**
 * Фронтальная камера для сканирования лица (BiosenseSignal).
 * CSS превью не влияет на SDK — кадр берётся из videoWidth×videoHeight.
 */

/** Портретные ideal без жёсткого max — иначе на телефонах часто режим с узким FOV и «зумом». */
export const FACE_CAMERA_VIDEO_CONSTRAINTS = {
  facingMode: { ideal: 'user' },
  aspectRatio: { ideal: 9 / 16 },
  width: { ideal: 720 },
  height: { ideal: 1280 },
}

/**
 * Сброс цифрового zoom трека (Safari / часть Android), если поддерживается.
 */
export async function applyFaceCameraTrackDefaults(track) {
  if (!track?.applyConstraints) return
  const caps = track.getCapabilities?.() ?? {}
  const advanced = []
  if (caps.zoom != null) {
    const zMin = typeof caps.zoom.min === 'number' ? caps.zoom.min : 1
    advanced.push({ zoom: zMin })
  }
  if (advanced.length === 0) return
  try {
    await track.applyConstraints({ advanced })
  } catch {
    /* опционально */
  }
}

export async function openFaceCameraStream() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: FACE_CAMERA_VIDEO_CONSTRAINTS,
    audio: false,
  })
  const track = stream.getVideoTracks()[0]
  if (track) await applyFaceCameraTrackDefaults(track)
  return stream
}

/**
 * Подбор object-fit превью: при сильном расхождении aspect cover даёт «супер-зум».
 */
export function resolvePreviewObjectFit(videoEl, containerEl) {
  if (!videoEl || !containerEl) return 'contain'
  const vw = videoEl.videoWidth
  const vh = videoEl.videoHeight
  if (!vw || !vh) return 'contain'

  const rect = containerEl.getBoundingClientRect()
  const cw = rect.width
  const ch = rect.height
  if (!cw || !ch) return 'contain'

  const videoAspect = vw / vh
  const boxAspect = cw / ch
  const mismatch = Math.abs(videoAspect - boxAspect) / Math.max(videoAspect, boxAspect)
  return mismatch > 0.18 ? 'contain' : 'cover'
}

export function attachPreviewFitObserver(videoEl, containerEl, onFit) {
  const update = () => {
    const fit = resolvePreviewObjectFit(videoEl, containerEl)
    onFit(fit)
  }

  videoEl.addEventListener('loadedmetadata', update)
  videoEl.addEventListener('resize', update)
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
  ro?.observe(containerEl)

  update()

  return () => {
    videoEl.removeEventListener('loadedmetadata', update)
    videoEl.removeEventListener('resize', update)
    ro?.disconnect()
  }
}
