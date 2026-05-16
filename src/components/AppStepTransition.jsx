import { useEffect, useRef, useState } from 'react'
import './AppStepTransition.css'

const EXIT_MS = 280

/**
 * Плавная смена шагов: сначала fade-out текущего экрана, затем монтирование следующего.
 * Логика шагов не меняется — только задержка размонтирования на время анимации.
 */
export function AppStepTransition({ step, children }) {
  const [displayStep, setDisplayStep] = useState(step)
  const [motion, setMotion] = useState('idle')
  const timerRef = useRef(null)

  useEffect(() => {
    if (step === displayStep) return

    setMotion('exit')
    if (timerRef.current) window.clearTimeout(timerRef.current)

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      setDisplayStep(step)
      setMotion('enter')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setMotion('idle'))
      })
    }, EXIT_MS)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [step, displayStep])

  const motionClass =
    motion === 'exit' ? 'app-step--exit' : motion === 'enter' ? 'app-step--enter' : 'app-step--idle'

  return (
    <div className={`app-step ${motionClass}`} data-step={displayStep}>
      {typeof children === 'function' ? children(displayStep) : children}
    </div>
  )
}
