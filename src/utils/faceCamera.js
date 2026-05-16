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

/** На iPhone часто приходит landscape 1280×720 — пробуем запросить портрет без пересоздания UI. */
async function preferPortraitTrack(track) {
  if (!track?.applyConstraints || !track.getSettings) return
  const { width, height } = track.getSettings()
  if (!width || !height || height >= width) return
  try {
    await track.applyConstraints({
      aspectRatio: { ideal: 9 / 16 },
      width: { ideal: Math.min(width, height) },
      height: { ideal: Math.max(width, height) },
    })
  } catch {
    /* браузер мог отклонить — остаёмся на исходном потоке */
  }
}

export async function openFaceCameraStream() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: FACE_CAMERA_VIDEO_CONSTRAINTS,
    audio: false,
  })
  const track = stream.getVideoTracks()[0]
  if (track) {
    await applyFaceCameraTrackDefaults(track)
    await preferPortraitTrack(track)
  }
  return stream
}

/**
 * Масштаб превью при object-fit: cover (только CSS).
 * contain давал «прямоугольник» с полосами; cover без scale — «супер-зум» при landscape-потоке.
 */
export function resolvePreviewCoverScale(videoEl, containerEl) {
  if (!videoEl || !containerEl) return 1
  const vw = videoEl.videoWidth
  const vh = videoEl.videoHeight
  if (!vw || !vh) return 1

  const rect = containerEl.getBoundingClientRect()
  const cw = rect.width
  const ch = rect.height
  if (!cw || !ch) return 1

  const videoAspect = vw / vh
  const boxAspect = cw / ch
  if (videoAspect <= 0 || boxAspect <= 0) return 1

  const mismatch = Math.abs(videoAspect - boxAspect) / Math.max(videoAspect, boxAspect)
  if (mismatch < 0.12) return 1

  // Landscape-поток на портретном экране (типичный Safari): слегка отдаляем превью.
  if (videoAspect > boxAspect) {
    const ratio = videoAspect / boxAspect
    return Math.min(1, Math.max(0.84, 1 / Math.pow(ratio, 0.38)))
  }

  // Узкий портретный поток: умеренное отдаление.
  const ratio = boxAspect / videoAspect
  return Math.min(1, Math.max(0.9, 1 / Math.pow(ratio, 0.32)))
}

export function attachPreviewScaleObserver(videoEl, containerEl, onScale) {
  const update = () => {
    const scale = resolvePreviewCoverScale(videoEl, containerEl)
    onScale(scale)
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
