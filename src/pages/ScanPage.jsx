import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { postSaveRppgScan } from '../api/scan.js'
import { useI18n } from '../i18n/useI18n.js'
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

/** Камера — как Camera.jsx; портрет/ROI настраивает SDK после createFaceSession. */
const FACE_CAMERA_VIDEO_CONSTRAINTS = {
  facingMode: { ideal: 'user' },
}

async function acquireCameraStream() {
  return navigator.mediaDevices.getUserMedia({
    video: FACE_CAMERA_VIDEO_CONSTRAINTS,
    audio: false,
  })
}

async function bindStreamToVideo(video, stream) {
  video.srcObject = stream
  video.setAttribute('playsinline', '')
  video.muted = true
  await video.play()
  await waitForVideoReady(video)
}

function sessionStateLabel(state, t) {
  switch (state) {
    case SessionState.INIT:
      return t('scan.session.init')
    case SessionState.ACTIVE:
      return t('scan.session.active')
    case SessionState.MEASURING:
      return t('scan.session.measuring')
    case SessionState.STOPPING:
      return t('scan.session.stopping')
    case SessionState.TERMINATED:
      return t('scan.session.terminated')
    default:
      return t('scan.session.default')
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
function hintWhileMeasuring(imageValidity, t) {
  switch (imageValidity) {
    case ImageValidity.VALID:
      return t('scan.hintMeasuringValid')
    case ImageValidity.INVALID_ROI:
      return t('scan.hintMeasuringRoi')
    case ImageValidity.INVALID_DEVICE_ORIENTATION:
      return t('scan.hintMeasuringOrientation')
    case ImageValidity.TILTED_HEAD:
      return t('scan.hintMeasuringTilt')
    case ImageValidity.FACE_TOO_FAR:
      return t('scan.hintMeasuringFar')
    case ImageValidity.UNEVEN_LIGHT:
      return t('scan.hintMeasuringLight')
    default:
      return t('scan.hintMeasuringDefault')
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

/** Тон овала = плашка кадра: pending | ok | warn (docs/SDK.md ImageValidity). */
function getOvalFrameTone(validity) {
  if (validity === ImageValidity.VALID) return 'ok'
  if (validity == null) return 'pending'
  return 'warn'
}

/** Ждём размеры кадра и readyState — как в Camera.jsx перед createFaceSession (docs/SDK.md). */
async function waitForVideoReady(video, timeoutMs = 8000, noFrameMessage) {
  const msg =
    typeof noFrameMessage === 'string' && noFrameMessage
      ? noFrameMessage
      : 'Камера не передала кадр. Проверьте разрешения и попробуйте снова.'
  const ok = () =>
    video.videoWidth > 0 &&
    video.videoHeight > 0 &&
    video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA

  if (ok()) return

  await new Promise((resolve, reject) => {
    const to = window.setTimeout(() => {
      cleanup()
      reject(new Error(msg))
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
  const { t } = useI18n()
  const ecgCycleId = `scan-ecg-cycle-${useId().replace(/:/g, '')}`
  const videoRef = useRef(null)
  const sessionRef = useRef(null)
  const startedRef = useRef(false)
  const streamRef = useRef(null)
  /** true после «Начать» — до этого SDK-сессия в ACTIVE, но без session.start(). */
  const userStartRequestedRef = useRef(false)
  const scheduleBeginAfterActiveRef = useRef(null)

  const [phase, setPhase] = useState('preview-loading')
  const [sessionState, setSessionState] = useState(null)
  const [hint, setHint] = useState(() => t('scan.hintCameraOn'))
  const [hintTone, setHintTone] = useState('neutral')
  const [livePulse, setLivePulse] = useState(null)
  const [progress, setProgress] = useState(0)
  /** Последний ImageValidity из onImageData — плашка «кадр» (docs/SDK.md). */
  const [frameValidity, setFrameValidity] = useState(null)
  const [errorText, setErrorText] = useState('')
  const pendingStartTimerRef = useRef(null)
  /** Не обновлять подсказку без смены (состояние сессии, validity) — onImageData на каждый кадр. */
  const lastHintKeyRef = useRef('')
  /** Последний ImageValidity из onImageData (после session.start() — подсказки). */
  const lastImageValidityRef = useRef(null)
  /** Время входа SDK в MEASURING — прогресс овала = elapsed / processingTime (docs/SDK.md). */
  const measurementStartTimeRef = useRef(null)
  const [measurementProgressEpoch, setMeasurementProgressEpoch] = useState(0)
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
    measurementStartTimeRef.current = null
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

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    const prev = meta?.getAttribute('content') ?? ''
    meta?.setAttribute('content', '#0f172a')
    return () => {
      meta?.setAttribute('content', prev || '#f9fafb')
    }
  }, [])

  /** Прогресс овала = elapsed / processingTime (SDK); цвет — по ImageValidity (см. getOvalFrameTone). */
  useEffect(() => {
    if (phase !== 'measuring' || measurementStartTimeRef.current == null) return
    const durationMs = DEFAULT_PROCESSING_SECONDS * 1000
    const tick = () => {
      const start = measurementStartTimeRef.current
      if (start == null) return
      const elapsed = Date.now() - start
      setProgress(Math.min(1, elapsed / durationMs))
    }
    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [phase, measurementProgressEpoch])

  const runScanPipeline = useCallback(
    async ({ reuseStream = false, previewOnly = false } = {}) => {
      if (previewOnly) {
        userStartRequestedRef.current = false
      }
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
      if (!video) throw new Error(t('scan.errNoVideo'))

      let stream = streamRef.current
      if (!reuseStream) {
        setPhase('camera')
        setHint(t('scan.hintCameraRequest'))
        setHintTone('neutral')
        stream = await acquireCameraStream()
        streamRef.current = stream
        await bindStreamToVideo(video, stream)
      } else {
        if (!stream?.getVideoTracks().some((t) => t.readyState === 'live')) {
          throw new Error(t('scan.errCameraRetry'))
        }
        if (video.paused) await video.play()
      }

      await waitForVideoReady(video, 8000, t('scan.errVideoTimeout'))
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

      setHint(t('scan.hintSdkLoad'))
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
        lastHintKeyRef.current = ''
        setHint(t('scan.hintMeasuring'))
        setHintTone('neutral')
        try {
          scanSdkDebug('session.start()')
          session.start()
        } catch (e) {
          startedRef.current = false
          measurementStartTimeRef.current = null
          scanSdkDebug('session.start() ошибка', e)
          setErrorText(e instanceof Error ? e.message : t('scan.errStartMeasure'))
          setPhase('error')
        }
      }

      function scheduleBeginAfterActive() {
        if (!userStartRequestedRef.current) return
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
            ? hintWhileMeasuring(imageValidity, t)
            : imageValidityToUserMessage(imageValidity, t)
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
            if (startedRef.current) {
              measurementStartTimeRef.current = Date.now()
              setProgress(0)
              setMeasurementProgressEpoch((n) => n + 1)
            }
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
              measurementStartTimeRef.current = null
              setProgress(1)
              setHint(t('scan.hintProcessing'))
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

        if (state === SessionState.ACTIVE && userStartRequestedRef.current) {
          scheduleBeginAfterActive()
        }
      }

      scheduleBeginAfterActiveRef.current = scheduleBeginAfterActive

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
        measurementStartTimeRef.current = null
        setProgress(1)
        setPhase('saving')
        setHint(t('scan.hintSaving'))
        setHintTone('neutral')
        const scanResult = buildSaveRppgScanResult(vitalSignsResults)
        scanSdkDebug('save-rppg payload', {
          keysMetrics: Object.keys(scanResult.metrics ?? {}),
          sdkRawResultsKeys: Object.keys(scanResult.sdkRaw?.results ?? {}),
        })
        try {
          const apiResult = await postSaveRppgScan(scanResult, userForm)
          onSaved?.(apiResult)
          teardownStream()
          teardownSession()
          onContinue()
        } catch (e) {
          setErrorText(e instanceof Error ? e.message : t('scan.errSave'))
          setPhase('error')
          setHint(t('scan.hintSaveFail'))
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
        setErrorText(t('scan.errSdk', { code: String(code) }))
        setPhase('error')
        setHintTone('error')
        setHint(t('scan.hintSdkErr', { code: String(code) }))
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
        setHint(t('scan.hintSdkWarn', { code: String(code) }))
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

      /* Редкий случай: ACTIVE до onStateChange — start только если пользователь нажал «Начать» */
      if (userStartRequestedRef.current && session.getState?.() === SessionState.ACTIVE) {
        scheduleBeginAfterActive()
      }
      queueMicrotask(() => {
        if (
          userStartRequestedRef.current &&
          sessionRef.current === session &&
          session.getState?.() === SessionState.ACTIVE &&
          !startedRef.current
        ) {
          scheduleBeginAfterActive()
        }
      })

      if (previewOnly) {
        setPhase('preview')
        lastHintKeyRef.current = ''
        setHint(t('scan.hintPreview'))
        setHintTone('neutral')
        return
      }

      setPhase('running')
      lastHintKeyRef.current = ''
      setHint(t('scan.hintRunning'))
      setHintTone('neutral')
    },
    [onContinue, onSaved, teardownSession, teardownStream, userForm, t],
  )

  const preparePreview = useCallback(() => {
    setPhase('preview-loading')
    setHint(t('scan.hintPrepare'))
    setHintTone('neutral')
    setErrorText('')
    return runScanPipeline({ previewOnly: true })
  }, [runScanPipeline, t])

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async preparePreview при монтировании
    void preparePreview().catch((e) => {
      if (cancelled) return
      const msg = e instanceof Error ? e.message : t('scan.errPrepare')
      setErrorText(msg)
      setPhase('error')
      setHintTone('error')
      setHint(msg)
      teardownSession()
      teardownStream()
    })
    return () => {
      cancelled = true
    }
  }, [preparePreview, teardownSession, teardownStream, t])

  const handleStart = useCallback(() => {
    userStartRequestedRef.current = true
    const session = sessionRef.current
    if (session?.getState?.() === SessionState.ACTIVE && !startedRef.current) {
      scheduleBeginAfterActiveRef.current?.()
      return
    }
    setPhase('running')
    setHint(t('scan.hintPrepareRun'))
    setHintTone('neutral')
  }, [t])

  const handleRetry = useCallback(() => {
    userStartRequestedRef.current = false
    teardownSession()
    teardownStream()
    lastImageValidityLogRef.current = null
    lastImageLogAtRef.current = 0
    lastVitalLogAtRef.current = 0
    setErrorText('')
    setProgress(0)
    measurementStartTimeRef.current = null
    setMeasurementProgressEpoch(0)
    setLivePulse(null)
    setSessionState(null)
    setFrameValidity(null)
    lastHintKeyRef.current = ''
    void preparePreview().catch((e) => {
      const msg = e instanceof Error ? e.message : t('scan.errPrepare')
      setErrorText(msg)
      setPhase('error')
      setHintTone('error')
      setHint(msg)
      teardownStream()
    })
  }, [preparePreview, teardownSession, teardownStream, t])

  /** Отмена замера → экран «Подготовка» (шаг instruction в App). */
  const handleCancelScan = useCallback(() => {
    userStartRequestedRef.current = false
    teardownSession()
    teardownStream()
    onBack()
  }, [teardownSession, teardownStream, onBack])

  /* eslint-disable react-hooks/refs -- startedRef для синхронизации с SDK-сессией (кнопка «Начать») */
  const canStartScan =
    phase === 'preview' && sessionState === SessionState.ACTIVE && !startedRef.current
  const primaryDisabled = phase === 'preview-loading' || phase === 'saving'
  const cameraVisible =
    phase === 'preview' ||
    phase === 'running' ||
    phase === 'measuring' ||
    phase === 'saving'

  /** Единая вёрстка овала/шапки с первого кадра — без скачка при «Начать». */
  const scanLayoutLocked =
    phase === 'preview-loading' ||
    phase === 'preview' ||
    phase === 'running' ||
    phase === 'measuring' ||
    phase === 'saving'

  const ovalFrameTone = scanLayoutLocked ? getOvalFrameTone(frameValidity) : 'ok'

  return (
    <div
      className={[
        'scan-page',
        'scan-page--fullscreen',
        cameraVisible ? 'scan-page--camera-visible' : '',
        scanLayoutLocked ? 'scan-page--active-scan' : '',
        phase === 'measuring' ? 'scan-page--measuring' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="application"
      aria-label={t('scan.ariaApp')}
    >
      <div className="scan-viewport-wrap">
        <div className="scan-viewport">
          <video
              ref={videoRef}
              id="scan-face-preview"
              className="scan-video"
              playsInline
            muted
          />
          <div className="scan-mask-layer" aria-hidden>
            <div className="scan-dim" />
            <div className={`scan-oval-frame scan-oval-frame--${ovalFrameTone}`}>
              {phase === 'measuring' ? (
                <div
                  className="scan-oval-progress"
                  style={{ '--scan-turn': String(Math.max(0, Math.min(1, progress))) }}
                  aria-hidden
                />
              ) : null}
              <div className="scan-oval-ring" aria-hidden />
            </div>
          </div>

          <header className="scan-page-overlay scan-page-overlay--top">
            <h1 className="scan-page-title">{t('scan.title')}</h1>
            <p className="scan-page-lead">{t('scan.lead')}</p>
          </header>

          {sessionState !== null &&
          phase !== 'preview' &&
          phase !== 'preview-loading' &&
          phase !== 'running' &&
          phase !== 'measuring' ? (
            <div className="scan-hud scan-hud--top">
              <div className="scan-pill">{sessionStateLabel(sessionState, t)}</div>
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
                  ? t('scan.framePending')
                  : imageValidityShortPillLabel(frameValidity, t)}
              </div>
            </div>
          )}

          {phase === 'running' || phase === 'measuring' ? (
            <div className="scan-measuring-dock">
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
                      <span className="scan-pulse-unit">{t('scan.pulseBpmUnit')}</span>
                    </>
                  ) : (
                    <span className="scan-pulse-waiting">{t('scan.pulseWait')}</span>
                  )}
                </span>
              </div>
            </div>
              ) : null}
              <div
                className={`scan-hint scan-hint--in-dock scan-hint--${hintTone}`}
                role="status"
                aria-live="polite"
              >
                {hint}
              </div>
            </div>
          ) : (
            <div className={`scan-hint scan-hint--${hintTone}`} role="status" aria-live="polite">
              {hint}
            </div>
          )}
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
            {t('scan.btnCancel')}
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
            {t('common.back')}
          </button>
          {phase === 'error' ? (
            <button type="button" className="btn-primary" onClick={handleRetry}>
              {t('scan.btnRetry')}
            </button>
          ) : phase === 'preview' ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!canStartScan}
              onClick={handleStart}
            >
              {canStartScan ? t('scan.btnStart') : t('scan.btnPreparing')}
            </button>
          ) : (
            <button type="button" className="btn-primary" disabled={primaryDisabled}>
              {phase === 'preview-loading'
                ? t('scan.btnCamera')
                : phase === 'saving'
                  ? t('scan.btnSaving')
                  : t('scan.btnWait')}
            </button>
          )}
        </footer>
      )}
    </div>
  )
  /* eslint-enable react-hooks/refs */
}
