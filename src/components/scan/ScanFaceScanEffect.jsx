import { useEffect, useRef } from 'react'
import './ScanFaceScanEffect.css'

const DOT_SPACING = 3.6
const DOT_RADIUS = 0.85
const MAX_DOT_RADIUS = 1.12
const WAVE_PERIOD = Math.PI * 2.4

/**
 * Расстояние по циклической фазе.
 * @param {number} a
 * @param {number} b
 * @param {number} period
 */
function phaseDist(a, b, period) {
  let d = a - b
  d = ((d % period) + period) % period
  if (d > period / 2) d -= period
  return d
}

/**
 * Условный «рельеф» лица в нормализованных координатах овала.
 * @param {number} ex
 * @param {number} ey
 */
function faceRelief(ex, ey) {
  const noseBridge = Math.exp(-(ex * ex) / 0.01 - ((ey - 0.04) ** 2) / 0.07) * 1.5
  const noseTip = Math.exp(-(ex * ex) / 0.02 - ((ey - 0.17) ** 2) / 0.035) * 1.2
  const leftCheek = Math.exp(-((ex + 0.36) ** 2) / 0.055 - ((ey - 0.02) ** 2) / 0.09) * 0.7
  const rightCheek = Math.exp(-((ex - 0.36) ** 2) / 0.055 - ((ey - 0.02) ** 2) / 0.09) * 0.7
  const forehead = Math.exp(-(ex * ex) / 0.07 - ((ey + 0.24) ** 2) / 0.045) * 0.4
  const chin = Math.exp(-(ex * ex) / 0.035 - ((ey - 0.36) ** 2) / 0.028) * 0.5

  return Math.min(2.8, 0.22 + noseBridge + noseTip + leftCheek + rightCheek + forehead + chin)
}

/**
 * Деформированная фаза волны — не равномерный круг, а огибание «анатомии».
 * @param {number} ex
 * @param {number} ey
 * @param {number} relief
 */
function contourPhase(ex, ey, relief) {
  const angle = Math.atan2(ey, ex)
  const noseBulge = Math.exp(-(ex * ex) / 0.018 - ((ey - 0.1) ** 2) / 0.06)
  const cheekPull = Math.sin(angle * 2) * 0.22 * (1 - noseBulge)
  const verticalSweep = ey * 1.35 + ex * ex * 0.4
  const reliefWarp = relief * 0.55 * Math.sin(angle * 1.5 + ey * 2.8)

  return angle * 0.48 + verticalSweep * 0.82 + cheekPull + reliefWarp
}

/**
 * Сетка точек с органической волной по форме лица — визуальный эффект сканирования (только UI).
 * @param {{ active?: boolean }} props
 */
export function ScanFaceScanEffect({ active = false }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const dotsRef = useRef(
    /** @type {{ x: number, y: number, ex: number, ey: number, relief: number, contourPhase: number }[]} */ ([]),
  )
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!active) return undefined

    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const startAt = performance.now()

    const rebuildDots = (w, h) => {
      const dots = []
      const cx = w / 2
      const cy = h / 2
      const rx = cx * 0.905
      const ry = cy * 0.905

      for (let y = DOT_SPACING * 0.5; y < h; y += DOT_SPACING) {
        for (let x = DOT_SPACING * 0.5; x < w; x += DOT_SPACING) {
          const ex = (x - cx) / rx
          const ey = (y - cy) / ry
          if (ex * ex + ey * ey > 1) continue

          const relief = faceRelief(ex, ey)
          dots.push({
            x,
            y,
            ex,
            ey,
            relief,
            contourPhase: contourPhase(ex, ey, relief),
          })
        }
      }
      dotsRef.current = dots
    }

    const resize = () => {
      const w = root.clientWidth
      const h = root.clientHeight
      if (w <= 0 || h <= 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = true
      rebuildDots(w, h)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(root)

    const draw = (now) => {
      const w = root.clientWidth
      const h = root.clientHeight
      if (w <= 0 || h <= 0) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }

      const t = (now - startAt) * 0.001
      const staticWave = reducedMotionRef.current

      ctx.clearRect(0, 0, w, h)

      const waveFront = staticWave ? 1.1 : (t * 0.95) % WAVE_PERIOD
      const ripplePhase = staticWave ? 0 : t * 2.2

      for (const dot of dotsRef.current) {
        const delta = phaseDist(dot.contourPhase, waveFront, WAVE_PERIOD)

        const lead = delta > 0 ? Math.exp(-(delta * delta) * 3.6) : 0
        const tail =
          delta < 0 ? Math.exp(-((delta + 0.55) * (delta + 0.55)) * 2.6) * 0.44 : 0
        const sweep = Math.min(1, lead + tail)

        const localRipple =
          0.5 +
          0.5 *
            Math.sin(
              dot.contourPhase * 2.1 - ripplePhase + dot.relief * 1.8 + dot.ex * 3.2,
            )

        const reliefBoost = 0.3 + dot.relief * 0.7
        const wave = sweep * reliefBoost * (0.5 + localRipple * 0.5)

        const alpha = Math.min(0.96, 0.16 + wave * 0.76 + sweep * reliefBoost * 0.1)

        const cyanMix = Math.min(1, wave * 1.15)
        const r = Math.round(200 + cyanMix * 55)
        const g = Math.round(222 + cyanMix * 33)
        const b = 255

        const swell = sweep * reliefBoost
        const radius = Math.min(
          MAX_DOT_RADIUS,
          DOT_RADIUS * (0.98 + swell * 0.34 + localRipple * swell * 0.1),
        )

        if (wave > 0.28) {
          ctx.fillStyle = `rgba(110, 245, 255, ${wave * 0.11})`
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, radius + 0.65, 0, Math.PI * 2)
          ctx.closePath()
          ctx.fill()
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [active])

  if (!active) return null

  return (
    <div ref={rootRef} className="scan-face-scan-effect" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  )
}
