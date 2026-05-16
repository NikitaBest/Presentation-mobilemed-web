import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { postSaveRppgScan } from '../api/scan.js'
import { ImageValidity, SessionState } from '../sdk/biosenseEnums.js'
import { scanSdkDebug } from '../sdk/scanSdkDebug.js'
import {
  DEFAULT_PROCESSING_SECONDS,
  ensureSdkInitialized,
  getHealthMonitorManager,
  imageValidityShortPillLabel,
  imageValidityToUserMessage,
  mapFormToSdkUserInformation,
  resolveSdkDeviceOrientation,
  sdkDeviceOrientationLabel,
} from '../sdk/faceScan.js'
import { buildSaveRppgScanResult } from '../sdk/saveRppgPayload.js'
import './ScanPage.css'

/**
 * Рабочие ограничения камеры (см. docs/SCAN.md). Не подменять на 1280×720 landscape.
 * Превью на весь экран — только CSS object-fit: cover; SDK читает буфер video, не CSS.
 */
const FACE_CAMERA_VIDEO_CONSTRAINTS = {
  facingMode: 'user',
  aspectRatio: { ideal: 9 / 16 },
  width: { ideal: 720, max: 1920 },
  height: { ideal: 1280, max: 1920 },
}

function sessionStateLabel(state) {
  switch (state) {
    case SessionState.INIT:
      return 'Инициализация…'
    case SessionState.ACTIVE:
      return 'Готовность'
    case SessionState.MEASURING:
      return 'Измерение'
    case SessionState.STOPPING:
      return 'Обработка'
    case SessionState.TERMINATED:
      return 'Завершено'
    default:
      return 'Подготовка'
  }
}

function sessionStateName(state) {
  if (state == null) return 'null'
  const key = Object.keys(SessionState).find((k) => SessionState[k] === state)
  return key ?? String(state)
}

function imageValidityName(validity) {
  if (validity == null) return 'null'
  const key = Object.keys(ImageValidity).find((k) => ImageValidity[k] === validity)
  return key ?? `UNKNOWN(${validity})`
}

/** Во время MEASURING — подсказки по тем же ImageValidity, что в docs/SDK.md (onImageData). */
function hintWhileMeasuring(imageValidity) {
  switch (imageValidity) {
    case ImageValidity.VALID:
      return 'Кадр хороший — не двигайтесь. Пульс появится в плашке, когда алгоритм стабилизирует кадр.'
    case ImageValidity.INVALID_ROI:
      return 'Идёт измерение — SDK не видит лицо в кадре: ближе к камере, ровный свет, смотрите прямо'
    case ImageValidity.INVALID_DEVICE_ORIENTATION:
      return 'Идёт измерение — удержите ту же ориентацию устройства, что при «Начать»'
    case ImageValidity.TILTED_HEAD:
      return 'Идёт измерение — выпрямите голову, без резких движений'
    case ImageValidity.FACE_TOO_FAR:
      return 'Идёт измерение — подойдите чуть ближе к камере'
    case ImageValidity.UNEVEN_LIGHT:
      return 'Идёт измерение — сделайте свет на лице ровнее'
    default:
      return 'Идёт измерение — сохраняйте лицо в овале и не двигайтесь'
  }
}

async function pickCameraDeviceId(stream) {
  const track = stream.getVideoTracks()[0]
  const settings = track?.getSettings?.() ?? {}
  if (settings.deviceId) return settings.deviceId
  const list = await navigator.mediaDevices.enumerateDevices()
  const first = list.find((d) => d.kind === 'videoinput')
  return first?.deviceId ?? ''
}

/** Пульс из onVitalSign (см. docs/SDK.md — value в pulseRate). */
function extractPulseBpm(vs) {
  const pr = vs?.pulseRate
  if (pr == null) return null
  const v = pr.value
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.round(v)
  return null
}

/** Ждём размеры кадра и readyState — как в Camera.jsx перед createFaceSession (docs/SDK.md). */
async function waitForVideoReady(video, timeoutMs = 8000) {
  const ok = () =>
    video.videoWidth > 0 &&
    video.videoHeight > 0 &&
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA

  if (ok()) return

  await new Promise((resolve, reject) => {
    const to = window.setTimeout(() => {
      cleanup()
      reject(
        new Error('Камера не передала кадр. Проверьте разрешения и попробуйте снова.'),
      )
    }, timeoutMs)
    const cleanup = () => {
      window.clearTimeout(to)
      video.removeEventListener('loadeddata', tryOk)
      video.removeEventListener('canplay', tryOk)
      video.removeEventListener('loadedmetadata', tryOk)
    }
    const tryOk = () => {
      if (ok()) {
        cleanup()
        resolve()
      }
    }
    video.addEventListener('loadeddata', tryOk)
    video.addEventListener('canplay', tryOk)
    video.addEventListener('loadedmetadata', tryOk)
    tryOk()
  })
}

/**
 * Сканирование лица (BiosenseSignal Web SDK) + отправка результата на POST /scan/save-rppg.
 * Камера включается при входе на экран; полноэкранное превью с овалом и кнопками поверх кадра.
 */
export function ScanPage({ userForm, onBack, onContinue, onSaved }) {
  const ecgCycleId = `scan-ecg-cycle-${useId().replace(/:/g, '')}`
  const videoRef = useRef(null)
  const sessionRef = useRef(null)
  const startedRef = useRef(false)
  const streamRef = useRef(null)

  const [phase, setPhase] = useState('preview-loading')
  const [sessionState, setSessionState] = useState(null)
  const [hint, setHint] = useState('Включаем камеру…')
  const [hintTone, setHintTone] = useState('neutral')
  const [livePulse, setLivePulse] = useState(null)
  const [progress, setProgress] = useState(0)
  /** Последний ImageValidity из onImageData — плашка «кадр» (docs/SDK.md). */
  const [frameValidity, setFrameValidity] = useState(null)
  const [errorText, setErrorText] = useState('')
  const pendingStartTimerRef = useRef(null)
  /** Не обновлять подсказку без смены (состояние сессии, validity) — onImageData на каждый кадр. */
  const lastHintKeyRef = useRef('')
  /** Последний ImageValidity из onImageData (после session.start() — подсказки и прогресс). */
  const lastImageValidityRef = useRef(null)
  const lastImageValidityLogRef = useRef(null)
  const lastImageLogAtRef = useRef(0)
  const lastVitalLogAtRef = useRef(0)

  const teardownStream = useCallback(() => {
    const s = streamRef.current
    if (s) {
      s.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    const v = videoRef.current
    if (v) v.srcObject = null
  }, [])

  const teardownSession = useCallback(() => {
    if (pendingStartTimerRef.current != null) {
      window.clearTimeout(pendingStartTimerRef.current)
      window.clearInterval(pendingStartTimerRef.current)
      pendingStartTimerRef.current = null
    }
    const session = sessionRef.current
    sessionRef.current = null
    startedRef.current = false
    if (session) {
      try {
        session.terminate()
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      teardownSession()
      teardownStream()
    }
  }, [teardownSession, teardownStream])

  /**
   * Прогресс овала только пока кадр ImageValidity.VALID (docs/SDK.md — строгий режим,
   * при невалидном кадре SDK не обрабатывает изображение; иначе UI «едет» без лица).
   */
  useEffect(() => {
    if (phase !== 'measuring') return
    let accumulatedValidSec = 0
    let lastTs = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const valid = lastImageValidityRef.current === ImageValidity.VALID
      if (valid) {
        accumulatedValidSec += (now - lastTs) / 1000
      }
      lastTs = now
      const p = Math.min(1, accumulatedValidSec / DEFAULT_PROCESSING_SECONDS)
      setProgress(p)
    }, 200)
    return () => window.clearInterval(id)
  }, [phase])

  const openPreviewCamera = useCallback(async () => {
    const video = videoRef.current
    if (!video) throw new Error('Нет элемента видео')
    const stream = await navigator.mediaDevices.getUserMedia({
      video: FACE_CAMERA_VIDEO_CONSTRAINTS,
      audio: false,
    })
    streamRef.current = stream
    video.srcObject = stream
    video.setAttribute('playsinline', '')
    video.muted = true
    await video.play()
    await waitForVideoReady(video)
  }, [])

  useEffect(() => {
    let cancelled = false
    /* eslint-disable react-hooks/set-state-in-effect -- включение камеры при входе на экран сканирования */
    setPhase('preview-loading')
    setHint('Включаем камеру…')
    setHintTone('neutral')
    setErrorText('')
    ;(async () => {
      try {
        await openPreviewCamera()
        if (cancelled) {
          teardownStream()
          return
        }
        setPhase('preview')
        setHint('Поместите лицо в овал. Нажмите «Начать», когда будете готовы.')
        setHintTone('neutral')
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error ? e.message : 'Не удалось получить доступ к камере'
          setErrorText(msg)
          setPhase('error')
          setHintTone('error')
          setHint(msg)
          teardownStream()
        }
      }
    })()
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      cancelled = true
    }
  }, [openPreviewCamera, teardownStream])

  const runScanPipeline = useCallback(
    async ({ reuseStream = false } = {}) => {
      /* Одна сессия одновременно: перед createFaceSession завершаем предыдущую (док. «Быстрый старт»). */
      teardownSession()
      setErrorText('')
      lastHintKeyRef.current = ''
      setFrameValidity(null)
      lastImageValidityLogRef.current = null
      lastImageLogAtRef.current = 0
      lastVitalLogAtRef.current = 0
      lastImageValidityRef.current = null

      const video = videoRef.current
      if (!video) throw new Error('Нет элемента видео')

      let stream = streamRef.current
      if (!reuseStream) {
        setPhase('camera')
        setHint('Запрашиваем доступ к камере…')
        setHintTone('neutral')
        stream = await navigator.mediaDevices.getUserMedia({
          video: FACE_CAMERA_VIDEO_CONSTRAINTS,
          audio: false,
        })
        streamRef.current = stream
        video.srcObject = stream
        video.setAttribute('playsinline', '')
        video.muted = true
        await video.play()
      } else {
        if (!stream?.getVideoTracks().some((t) => t.readyState === 'live')) {
          throw new Error('Камера недоступна. Нажмите «Повторить».')
        }
        if (video.paused) await video.play()
      }

      await waitForVideoReady(video)
      scanSdkDebug('видео перед createFaceSession', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
      })

      const cameraDeviceId = await pickCameraDeviceId(stream)

      scanSdkDebug('контекст перед SDK', {
        crossOriginIsolated: typeof self !== 'undefined' ? self.crossOriginIsolated : undefined,
        href: typeof window !== 'undefined' ? window.location?.href : undefined,
      })

      setHint('Загрузка алгоритма…')
      await ensureSdkInitialized()
      scanSdkDebug('initialize завершён')

      const userInformation = mapFormToSdkUserInformation(userForm ?? {})
      if (userInformation != null) {
        scanSdkDebug('userInformation → сессия (полный набор для рисков / сердечного возраста)', userInformation)
      } else {
        scanSdkDebug(
          'userInformation не передан — анкета неполная; расчёты АССЗ и «сердечного возраста» по SDK не выполняются',
        )
      }

      const IMAGE_LOG_MS = 800
      /**
       * Web SDK (см. Camera.jsx): onImageData с ImageValidity в основном идёт уже после session.start(),
       * в состоянии MEASURING. В ACTIVE колбэк часто не вызывается — ждать здесь VALID = тупик.
       * После ACTIVE делаем паузу и start(); подсказки по ImageValidity — в MEASURING (docs/SDK.md).
       */
      const ACTIVE_TO_START_MS = 1000

      function beginMeasurement() {
        if (pendingStartTimerRef.current != null) {
          window.clearTimeout(pendingStartTimerRef.current)
          pendingStartTimerRef.current = null
        }
        const session = sessionRef.current
        if (!session) {
          scanSdkDebug('beginMeasurement: нет sessionRef (гонка?)')
          return
        }
        if (startedRef.current) return
        if (session.getState?.() !== SessionState.ACTIVE) {
          scanSdkDebug('beginMeasurement: пропуск — не ACTIVE', {
            getState: session.getState?.(),
            name: sessionStateName(session.getState?.()),
          })
          return
        }
        startedRef.current = true
        setLivePulse(null)
        setPhase('measuring')
        setProgress(0)
        lastHintKeyRef.current = ''
        setHint('Идёт замер — следуйте подсказкам по кадру (лицо, свет, овал)')
        setHintTone('neutral')
        try {
          scanSdkDebug('session.start()')
          session.start()
        } catch (e) {
          startedRef.current = false
          scanSdkDebug('session.start() ошибка', e)
          setErrorText(e instanceof Error ? e.message : 'Не удалось начать измерение')
          setPhase('error')
        }
      }

      function scheduleBeginAfterActive() {
        if (startedRef.current) return
        const session = sessionRef.current
        if (!session || session.getState?.() !== SessionState.ACTIVE) return
        if (pendingStartTimerRef.current != null) {
          window.clearTimeout(pendingStartTimerRef.current)
          pendingStartTimerRef.current = null
        }
        scanSdkDebug('планируем session.start() после ACTIVE', { delayMs: ACTIVE_TO_START_MS })
        pendingStartTimerRef.current = window.setTimeout(() => {
          pendingStartTimerRef.current = null
          if (startedRef.current) return
          if (sessionRef.current?.getState?.() !== SessionState.ACTIVE) return
          beginMeasurement()
        }, ACTIVE_TO_START_MS)
      }

      const onImageData = (imageValidity) => {
        lastImageValidityRef.current = imageValidity
        setFrameValidity(imageValidity)
        const ok = imageValidity === ImageValidity.VALID
        const session = sessionRef.current
        const sdkState = session?.getState?.()

        if (sdkState === SessionState.MEASURING && !ok) {
          /* SDK.md / код 3500: при проблемах с детекцией не показывать промежуточные ВП */
          setLivePulse(null)
        }

        const hintText =
          sdkState === SessionState.MEASURING
            ? hintWhileMeasuring(imageValidity)
            : imageValidityToUserMessage(imageValidity)
        const hintKey = `${sessionStateName(sdkState)}:${imageValidity}`
        if (lastHintKeyRef.current !== hintKey) {
          lastHintKeyRef.current = hintKey
          setHint(hintText)
          setHintTone(ok ? 'ok' : 'warn')
        }

        const now = Date.now()
        const changed = lastImageValidityLogRef.current !== imageValidity
        if (changed || now - lastImageLogAtRef.current >= IMAGE_LOG_MS) {
          lastImageValidityLogRef.current = imageValidity
          lastImageLogAtRef.current = now
          scanSdkDebug('onImageData — колбэк SDK (ImageValidity)', {
            imageValidity,
            name: imageValidityName(imageValidity),
            ok,
            sdkState: sessionStateName(sdkState),
            hint: hintText,
          })
        }
      }

      const onStateChange = (state) => {
        /* Диаграмма состояний SDK — docs/SDK.md «Состояние сессии» */
        switch (state) {
          case SessionState.INIT:
            scanSdkDebug('onStateChange: INIT — ждём ACTIVE перед start()')
            break
          case SessionState.ACTIVE:
            scanSdkDebug(
              'onStateChange: ACTIVE — через паузу session.start() (Camera.jsx; onImageData с ROI в основном в MEASURING)',
            )
            break
          case SessionState.MEASURING:
            scanSdkDebug('onStateChange: MEASURING — идёт замер')
            break
          case SessionState.STOPPING:
            scanSdkDebug(
              'onStateChange: STOPPING — переходное; не вызывать start/stop (док SDK)',
            )
            if (pendingStartTimerRef.current != null) {
              window.clearTimeout(pendingStartTimerRef.current)
              window.clearInterval(pendingStartTimerRef.current)
              pendingStartTimerRef.current = null
            }
            if (startedRef.current) {
              setHint('Обработка результатов…')
              setHintTone('neutral')
            }
            break
          case SessionState.TERMINATED:
            scanSdkDebug('onStateChange: TERMINATED — сессия закрыта, можно новый createFaceSession')
            break
          default:
            scanSdkDebug('onStateChange', { state, name: sessionStateName(state) })
        }

        if (state === SessionState.TERMINATED) {
          setSessionState(null)
        } else {
          setSessionState(state)
        }

        if (state === SessionState.ACTIVE) {
          scheduleBeginAfterActive()
        }
      }

      const onVitalSign = (vs) => {
        const pulse = extractPulseBpm(vs)
        const now = Date.now()
        if (now - lastVitalLogAtRef.current >= 2000) {
          lastVitalLogAtRef.current = now
          scanSdkDebug('onVitalSign', { pulseRate: pulse, raw: vs?.pulseRate })
        }
        if (
          pulse != null &&
          lastImageValidityRef.current === ImageValidity.VALID
        ) {
          setLivePulse(pulse)
        }
      }

      const onFinalResults = async (vitalSignsResults) => {
        scanSdkDebug('onFinalResults', { hasResults: !!vitalSignsResults?.results })
        setProgress(1)
        setPhase('saving')
        setHint('Сохраняем результат на сервер…')
        setHintTone('neutral')
        const scanResult = buildSaveRppgScanResult(vitalSignsResults)
        scanSdkDebug('save-rppg payload', {
          keysMetrics: Object.keys(scanResult.metrics ?? {}),
          sdkRawResultsKeys: Object.keys(scanResult.sdkRaw?.results ?? {}),
        })
        try {
          const apiResult = await postSaveRppgScan(scanResult)
          onSaved?.(apiResult)
          teardownStream()
          teardownSession()
          onContinue()
        } catch (e) {
          setErrorText(e instanceof Error ? e.message : 'Ошибка сохранения')
          setPhase('error')
          setHint('Не удалось отправить данные')
          setHintTone('error')
        }
      }

      const onError = (alertData) => {
        if (pendingStartTimerRef.current != null) {
          window.clearTimeout(pendingStartTimerRef.current)
          window.clearInterval(pendingStartTimerRef.current)
          pendingStartTimerRef.current = null
        }
        scanSdkDebug('onError', alertData)
        const code = alertData?.code ?? '?'
        setErrorText(`Ошибка SDK (код ${code}). Попробуйте ещё раз.`)
        setPhase('error')
        setHintTone('error')
        setHint(`Ошибка измерения (код ${code})`)
        setFrameValidity(null)
        lastHintKeyRef.current = ''
        try {
          sessionRef.current?.terminate()
        } catch {
          /* ignore */
        }
        sessionRef.current = null
        startedRef.current = false
      }

      const onWarning = (alertData) => {
        scanSdkDebug('onWarning', alertData)
        const code = alertData?.code ?? '?'
        setHint(`Предупреждение ${code}: при возможности улучшите кадр`)
        setHintTone('warn')
      }

      scanSdkDebug('createFaceSession…', {
        cameraDeviceId,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      })

      const sdkOrientation = resolveSdkDeviceOrientation()
      scanSdkDebug('createFaceSession orientation', {
        resolved: sdkDeviceOrientationLabel(sdkOrientation),
        screenOrientationType:
          typeof window !== 'undefined' ? window.screen?.orientation?.type : undefined,
      })

      const healthMonitorManager = await getHealthMonitorManager()
      const session = await healthMonitorManager.createFaceSession({
        input: video,
        cameraDeviceId,
        processingTime: DEFAULT_PROCESSING_SECONDS,
        ...(userInformation != null ? { userInformation } : {}),
        orientation: sdkOrientation,
        /* По умолчанию в SDK — false: при кратковременных сбоях валидности кадр всё ещё обрабатывается, если лицо найдено (docs/SDK.md). */
        strictMeasurementGuidance: false,
        onImageData,
        onStateChange,
        onVitalSign,
        onFinalResults,
        onError,
        onWarning,
      })

      sessionRef.current = session
      scanSdkDebug('createFaceSession готово', {
        getState: session.getState?.(),
        stateName: sessionStateName(session.getState?.()),
      })

      /* Редкий случай: ACTIVE до onStateChange — планируем start(); microtask — если колбэк шёл до присвоения ref */
      if (session.getState?.() === SessionState.ACTIVE) {
        scheduleBeginAfterActive()
      }
      queueMicrotask(() => {
        if (
          sessionRef.current === session &&
          session.getState?.() === SessionState.ACTIVE &&
          !startedRef.current
        ) {
          scheduleBeginAfterActive()
        }
      })

      setPhase('running')
      lastHintKeyRef.current = ''
      setHint(
        'Сессия готова. Через секунду начнётся замер — подсказки по кадру (ImageValidity) появятся в процессе измерения (Web SDK). Держите лицо в овале.',
      )
      setHintTone('neutral')
    },
    [onContinue, onSaved, teardownSession, teardownStream, userForm],
  )

  const handleStart = useCallback(() => {
    runScanPipeline({ reuseStream: true }).catch((e) => {
      const msg = e instanceof Error ? e.message : 'Не удалось запустить измерение'
      setErrorText(msg)
      setPhase('error')
      setHintTone('error')
      setHint(msg)
      setFrameValidity(null)
      lastHintKeyRef.current = ''
      teardownSession()
    })
  }, [runScanPipeline, teardownSession])

  const handleRetry = useCallback(() => {
    teardownSession()
    teardownStream()
    lastImageValidityLogRef.current = null
    lastImageLogAtRef.current = 0
    lastVitalLogAtRef.current = 0
    setPhase('preview-loading')
    setErrorText('')
    setProgress(0)
    setLivePulse(null)
    setSessionState(null)
    setFrameValidity(null)
    lastHintKeyRef.current = ''
    setHint('Включаем камеру…')
    setHintTone('neutral')
    void (async () => {
      try {
        await openPreviewCamera()
        setPhase('preview')
        setHint('Поместите лицо в овал. Нажмите «Начать», когда будете готовы.')
        setHintTone('neutral')
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : 'Не удалось получить доступ к камере'
        setErrorText(msg)
        setPhase('error')
        setHintTone('error')
        setHint(msg)
        teardownStream()
      }
    })()
  }, [openPreviewCamera, teardownSession, teardownStream])

  /** Отмена замера → экран «Подготовка» (шаг instruction в App). */
  const handleCancelScan = useCallback(() => {
    teardownSession()
    teardownStream()
    onBack()
  }, [teardownSession, teardownStream, onBack])

  const primaryDisabled = phase === 'preview-loading' || phase === 'saving'

  return (
    <div className="scan-page scan-page--fullscreen" role="application" aria-label="Сканирование лица">
      <div className="scan-viewport-wrap">
        <div className="scan-viewport">
          {/* Один video: превью как в Camera.css (scaleX); тот же узел — input в createFaceSession (docs/SDK.md). */}
          <video
            ref={videoRef}
            id="scan-face-preview"
            className="scan-video"
            playsInline
            muted
          />
          <div className="scan-mask-layer" aria-hidden>
            <div className="scan-dim" />
            <div className="scan-oval-frame">
              {phase === 'measuring' ? (
                <div
                  className="scan-oval-progress"
                  style={{ '--scan-turn': String(Math.max(0, Math.min(1, progress))) }}
                  aria-hidden
                />
              ) : null}
              <div className="scan-oval-ring" />
            </div>
          </div>

          <header className="scan-page-overlay scan-page-overlay--top">
            <h1 className="scan-page-title">Сканирование</h1>
            <p className="scan-page-lead">
              Анализ на телефоне. После замера откройте «Результаты» — там итог и расшифровка.
            </p>
          </header>

          {sessionState !== null && phase !== 'running' && phase !== 'measuring' ? (
            <div className="scan-hud scan-hud--top">
              <div className="scan-pill">{sessionStateLabel(sessionState)}</div>
            </div>
          ) : null}

          {(phase === 'running' || phase === 'measuring') && (
            <div className="scan-hud scan-hud--frame-status" aria-live="polite">
              <div
                className={`scan-pill scan-pill--frame ${
                  frameValidity === ImageValidity.VALID
                    ? 'scan-pill--frame-ok'
                    : frameValidity == null
                      ? 'scan-pill--frame-pending'
                      : 'scan-pill--frame-warn'
                }`}
              >
                {frameValidity == null
                  ? 'Кадр: ожидание…'
                  : imageValidityShortPillLabel(frameValidity)}
              </div>
            </div>
          )}

          {phase === 'measuring' ? (
            <div className="scan-hud-below-oval">
              <div
                className={`scan-pulse-card${livePulse != null ? ' scan-pulse-card--live' : ''}`}
                style={
                  livePulse != null
                    ? {
                        '--pulse-bpm': String(livePulse),
                        '--pulse-beat-duration': `${(60 / livePulse).toFixed(3)}s`,
                      }
                    : undefined
                }
                aria-live="polite"
              >
                <span className="scan-pulse-heart" aria-hidden>
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path
                      fill="currentColor"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                </span>
                <span className="scan-pulse-ecg" aria-hidden>
                  <svg viewBox="0 0 96 20" preserveAspectRatio="none" focusable="false">
                    <defs>
                      <path
                        id={ecgCycleId}
                        className="scan-pulse-ecg-path"
                        d="M0 10 H5 L6.5 4 L8 16 L9.5 10 H15 L16.5 12.5 L18 10 H24 L25.5 5 L27 15 L28.5 10 H36 H48"
                      />
                    </defs>
                    <use href={`#${ecgCycleId}`} className="scan-pulse-ecg-path" />
                    <use href={`#${ecgCycleId}`} x="48" className="scan-pulse-ecg-path" />
                  </svg>
                </span>
                <span className="scan-pulse-reading">
                  {livePulse != null ? (
                    <>
                      <span className="scan-pulse-value">{livePulse}</span>
                      <span className="scan-pulse-unit">уд/мин</span>
                    </>
                  ) : (
                    <span className="scan-pulse-waiting">Пульс…</span>
                  )}
                </span>
              </div>
            </div>
          ) : null}

          <div className={`scan-hint scan-hint--${hintTone}`} role="status" aria-live="polite">
            {hint}
          </div>
        </div>
      </div>

      {errorText ? (
        <p className="scan-error scan-error--overlay" role="alert">
          {errorText}
        </p>
      ) : null}

      {phase === 'running' || phase === 'measuring' ? (
        <footer className="scan-footer scan-footer--overlay scan-footer--single">
          <button type="button" className="btn-secondary scan-footer-cancel" onClick={handleCancelScan}>
            Отменить
          </button>
        </footer>
      ) : (
        <footer className="scan-footer scan-footer--overlay page-footer--row">
          <button
            type="button"
            className="btn-secondary"
            onClick={onBack}
            disabled={phase === 'saving'}
          >
            Назад
          </button>
          {phase === 'error' ? (
            <button type="button" className="btn-primary" onClick={handleRetry}>
              Повторить
            </button>
          ) : phase === 'preview' ? (
            <button type="button" className="btn-primary" onClick={handleStart}>
              Начать
            </button>
          ) : (
            <button type="button" className="btn-primary" disabled={primaryDisabled}>
              {phase === 'preview-loading' ? 'Камера…' : phase === 'saving' ? 'Сохранение…' : 'Подождите…'}
            </button>
          )}
        </footer>
      )}
    </div>
  )
}
