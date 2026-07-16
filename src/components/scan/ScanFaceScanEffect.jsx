import { useEffect, useRef } from 'react'
import { DEFAULT_MASK_PROFILE } from '../../sdk/faceRoiLayout.js'
import './ScanFaceScanEffect.css'

const DOT_SPACING = 3.45
const DOT_RADIUS = 0.82
const MAX_DOT_RADIUS = 1.12

/**
 * @param {number} edge0
 * @param {number} edge1
 * @param {number} x
 */
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} period
 */
function phaseDist(a, b, period) {
  let d = ((a - b) % period + period) % period
  if (d > period / 2) d -= period
  return d
}

/**
 * @param {number} ex
 * @param {number} ey
 * @param {number} ox
 * @param {number} oy
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} roll
 */
function warpAroundNose(ex, ey, ox, oy, yaw, pitch, roll) {
  const dx = ex - ox
  const dy = ey - oy
  const cr = Math.cos(roll * 0.62)
  const sr = Math.sin(roll * 0.62)
  const rx = dx * cr - dy * sr
  const ry = dx * sr + dy * cr
  return {
    x: rx - yaw * 0.2 * (1 + Math.min(1, Math.abs(ry)) * 0.45) + ox,
    y: ry - pitch * 0.16 + oy,
  }
}

/**
 * @typedef {{ nx: number, ny: number, sx: number, sy: number, yaw: number, pitch: number, roll: number }} MaskProfile
 */

/**
 * «Дорисованное» лицо: равномерная заливка овала + штрихи лба / бровей / щёк / челюсти.
 * Нос — тонкая линия без яркого пятна.
 * @param {number} lx
 * @param {number} ly
 * @param {number} ovalDist
 */
function faceMaskShell(lx, ly, ovalDist) {
  const ax = Math.abs(lx)

  const ovalFill = 1 - smoothstep(0.92, 1.02, ovalDist)
  const edgeFade = 1 - smoothstep(0.84, 1.0, ovalDist) * 0.5

  // Ровная заливка всего овала (без гаусса от центра/носа)
  const basePlate = ovalFill * 0.72

  // Лоб — широкая горизонтальная полоса
  const forehead =
    Math.exp(-((ly + 0.38) ** 2) / 0.07) *
    (1 - smoothstep(0.55, 0.85, ax)) *
    1.35

  // Брови — две дуги
  const brow =
    Math.exp(-((ly + 0.16) ** 2) / 0.014) *
    Math.exp(-((ax - 0.28) ** 2) / 0.05) *
    1.15

  // Зона глаз / виски
  const temples =
    Math.exp(-((ly + 0.04) ** 2) / 0.04) *
    Math.exp(-((ax - 0.48) ** 2) / 0.04) *
    0.85

  // Щёки — главные акценты по бокам
  const leftCheek =
    Math.exp(-((lx + 0.42) ** 2) / 0.07 - ((ly - 0.06) ** 2) / 0.12) * 1.4
  const rightCheek =
    Math.exp(-((lx - 0.42) ** 2) / 0.07 - ((ly - 0.06) ** 2) / 0.12) * 1.4

  // Скулы
  const cheekbone =
    Math.exp(-((ax - 0.46) ** 2) / 0.04 - ((ly + 0.02) ** 2) / 0.055) * 1.0

  // Челюсть / подбородок
  const jaw =
    Math.exp(-((ax - 0.36) ** 2) / 0.06 - ((ly - 0.36) ** 2) / 0.06) *
    smoothstep(0.1, 0.4, ly) *
    0.95
  const chin =
    Math.exp(-(lx * lx) / 0.06 - ((ly - 0.42) ** 2) / 0.045) * 0.9

  // Нос — только тонкий штрих, без «пятна»
  const noseStroke =
    Math.exp(-(lx * lx) / 0.004) *
    smoothstep(-0.12, 0.22, ly) *
    (1 - smoothstep(0.22, 0.38, ly)) *
    0.28

  const strokes =
    forehead +
    brow +
    temples +
    leftCheek +
    rightCheek +
    cheekbone +
    jaw +
    chin +
    noseStroke

  const rim = smoothstep(0.88, 0.99, ovalDist) * 0.22
  const shell = Math.min(3.2, (basePlate + strokes * 0.85) * edgeFade + rim * 0.2)

  return { shell, insideMask: ovalFill, rim, strokes, edgeFade }
}

/**
 * Энергия по «нарисованным» линиям лица — горизонтальные пояса + щёки, не радиус от носа.
 * @param {number} lx
 * @param {number} ly
 * @param {number} strokes
 */
function surfaceEnergyPhase(lx, ly, strokes) {
  const ax = Math.abs(lx)
  // Вертикальные пояса лица: лоб → брови → щёки → челюсть
  const bandPhase = (ly + 0.45) * 2.8 + ax * 0.35 + strokes * 0.25
  // Обход по скулам (две половины)
  const cheekPhase = Math.atan2(ly - 0.02, ax - 0.05) * 1.4 + ly * 0.5

  return { bandPhase, cheekPhase }
}

/**
 * Футуристическая маска — «дорисованное» лицо по всему овалу.
 * @param {{
 *   active?: boolean,
 *   maskProfileRef?: import('react').RefObject<MaskProfile | null | undefined>,
 * }} props
 */
export function ScanFaceScanEffect({ active = false, maskProfileRef }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const dotsRef = useRef(
    /** @type {{ x: number, y: number, ex: number, ey: number, dist: number }[]} */ ([]),
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
      const rx = cx * 0.995
      const ry = cy * 0.995

      for (let y = DOT_SPACING * 0.35; y < h; y += DOT_SPACING) {
        for (let x = DOT_SPACING * 0.35; x < w; x += DOT_SPACING) {
          const ex = (x - cx) / rx
          const ey = (y - cy) / ry
          const dist2 = ex * ex + ey * ey
          if (dist2 > 1) continue
          dots.push({ x, y, ex, ey, dist: Math.sqrt(dist2) })
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

      const profile = maskProfileRef?.current ?? DEFAULT_MASK_PROFILE
      const t = (now - startAt) * 0.001
      const staticWave = reducedMotionRef.current

      ctx.clearRect(0, 0, w, h)

      const bandFront = staticWave ? 0.8 : t * 1.15
      const cheekFront = staticWave ? 0.3 : t * 0.9
      const shimmerPhase = staticWave ? 0 : t * 2.1
      const breathe = staticWave ? 0.55 : 0.5 + 0.5 * Math.sin(t * 1.25)

      for (const dot of dotsRef.current) {
        const warped = warpAroundNose(
          dot.ex,
          dot.ey,
          profile.nx,
          profile.ny,
          profile.yaw,
          profile.pitch,
          profile.roll,
        )

        const lx = (warped.x - profile.nx) / profile.sx
        const ly = (warped.y - profile.ny) / profile.sy
        const ax = Math.abs(lx)
        const { shell, insideMask, rim, strokes, edgeFade } = faceMaskShell(lx, ly, dot.dist)
        const { bandPhase, cheekPhase } = surfaceEnergyPhase(lx, ly, strokes)

        // 1) Ровная заливка всего овала
        const baseMask = insideMask * (0.34 + 0.08 * breathe) * edgeFade

        // 2) Волна по поясам лица (лоб → щёки → подбородок)
        const bandDelta = phaseDist(bandPhase, bandFront, Math.PI * 2.6)
        const bandWave =
          Math.exp(-(bandDelta * bandDelta) * 3.8) * (0.35 + strokes * 0.35)

        // 3) Волна по щекам / скулам
        const cheekDelta = phaseDist(cheekPhase, cheekFront, Math.PI * 2)
        const cheekWave =
          Math.exp(-(cheekDelta * cheekDelta) * 5.5) *
          (0.25 +
            Math.exp(-((ax - 0.4) ** 2) / 0.06 - ((ly - 0.04) ** 2) / 0.1) * 0.7)

        // 4) Лёгкое мерцание по всей маске
        const shimmer =
          (0.5 + 0.5 * Math.sin(shell * 4.2 - shimmerPhase + ly * 3.5 + ax * 2.2)) *
          shell *
          0.12 *
          insideMask

        // 5) Статичные акценты «нарисованного» лица
        const foreheadAccent =
          Math.exp(-((ly + 0.36) ** 2) / 0.08) *
          (1 - smoothstep(0.5, 0.8, ax)) *
          (0.45 + 0.25 * breathe)
        const cheekAccent =
          (Math.exp(-((lx + 0.4) ** 2) / 0.065 - ((ly - 0.05) ** 2) / 0.11) +
            Math.exp(-((lx - 0.4) ** 2) / 0.065 - ((ly - 0.05) ** 2) / 0.11)) *
          (0.4 + 0.2 * breathe)
        const browAccent =
          Math.exp(-((ly + 0.15) ** 2) / 0.016) *
          Math.exp(-((ax - 0.28) ** 2) / 0.055) *
          (0.35 + 0.2 * breathe)
        const chinAccent =
          Math.exp(-(lx * lx) / 0.055 - ((ly - 0.4) ** 2) / 0.05) *
          (0.3 + 0.15 * breathe)

        const seal = rim * 0.12

        const energy =
          (bandWave * 0.7 +
            cheekWave * 0.75 +
            shimmer +
            foreheadAccent * 0.9 +
            cheekAccent * 0.95 +
            browAccent * 0.8 +
            chinAccent * 0.7) *
            edgeFade +
          seal

        const visible = baseMask + energy
        if (visible < 0.04) continue

        const alpha = Math.min(0.88, (0.14 + visible * 0.42 + energy * 0.22) * edgeFade)
        const cyanMix = Math.min(1, baseMask * 0.5 + energy * 0.7)
        const r = Math.round(190 + cyanMix * 65)
        const g = Math.round(218 + cyanMix * 37)
        const b = 255

        const swell = Math.min(1, energy * 0.45 + baseMask * 0.4)
        const radius = Math.min(MAX_DOT_RADIUS, DOT_RADIUS * (0.92 + swell * 0.28))

        if (energy > 0.38 && edgeFade > 0.6) {
          ctx.fillStyle = `rgba(80, 240, 255, ${energy * 0.06 * edgeFade})`
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, radius + 0.55, 0, Math.PI * 2)
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
  }, [active, maskProfileRef])

  if (!active) return null

  return (
    <div ref={rootRef} className="scan-face-scan-effect" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  )
}
