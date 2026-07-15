import { useEffect, useRef } from 'react'
import './ScanFaceScanEffect.css'

const DOT_SPACING = 7
const DOT_RADIUS = 1.35

/**
 * Сетка мелких точек с бегущей волной внутри овала — визуальный эффект сканирования (только UI).
 * @param {{ active?: boolean }} props
 */
export function ScanFaceScanEffect({ active = false }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const dotsRef = useRef(/** @type {{ x: number, y: number, nx: number, ny: number }[]} */ ([]))
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
      for (let y = DOT_SPACING * 0.5; y < h; y += DOT_SPACING) {
        for (let x = DOT_SPACING * 0.5; x < w; x += DOT_SPACING) {
          const dx = (x - cx) / cx
          const dy = (y - cy) / cy
          if (dx * dx + dy * dy > 0.82) continue
          dots.push({ x, y, nx: x / w, ny: y / h })
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

      // Вертикальная «полоса сканирования» — сверху вниз по овалу
      const sweepNorm = staticWave ? 0.45 : (t * 0.28) % 1.25 - 0.12
      const sweepY = sweepNorm * h
      const bandHalf = h * 0.11

      for (const dot of dotsRef.current) {
        const distBand = Math.abs(dot.y - sweepY)
        const band = Math.max(0, 1 - distBand / bandHalf)
        const bandSmooth = band * band

        const ripple = staticWave
          ? 0.5
          : 0.5 + 0.5 * Math.sin(dot.nx * 14 - t * 3.2 + dot.ny * 6)

        const crossWave = staticWave
          ? 0.35
          : 0.5 + 0.5 * Math.sin(dot.ny * 10 - t * 2.6 + dot.nx * 3)

        const alpha = Math.min(
          0.92,
          0.2 + bandSmooth * 0.55 + ripple * bandSmooth * 0.28 + crossWave * 0.08,
        )

        const cyanMix = Math.min(1, bandSmooth * 0.9 + ripple * bandSmooth * 0.35)
        const r = Math.round(210 + cyanMix * 45)
        const g = Math.round(228 + cyanMix * 27)
        const b = 255

        const radius = DOT_RADIUS + bandSmooth * 0.55

        if (bandSmooth > 0.35) {
          ctx.shadowBlur = 5 * bandSmooth
          ctx.shadowColor = `rgba(100, 240, 255, ${alpha * 0.45})`
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
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
