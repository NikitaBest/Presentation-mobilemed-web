import { useCallback, useRef, useState } from 'react'
import { getRppgScanLlmInterpretation, parseLlmInterpretationResponse } from '../api/scan.js'

const IDLE = {
  scanId: null,
  phase: 'idle',
  html: '',
  fromCache: false,
  error: '',
}

/**
 * @param {(key: string, vars?: Record<string, string>) => string} t
 */
export function useScanLlmInterpretation(t) {
  const [state, setState] = useState(IDLE)
  const [regenerating, setRegenerating] = useState(false)
  const stateRef = useRef(state)
  const requestSeqRef = useRef(0)
  stateRef.current = state

  const load = useCallback(
    async (scanId, { regenerate = false } = {}) => {
      const id = String(scanId ?? '').trim()
      if (!id) return

      const cur = stateRef.current
      if (
        !regenerate &&
        cur.scanId === id &&
        (cur.phase === 'loading' || cur.phase === 'ready' || cur.phase === 'empty')
      ) {
        return
      }

      const seq = ++requestSeqRef.current

      if (regenerate) {
        setRegenerating(true)
      } else {
        setState({
          scanId: id,
          phase: 'loading',
          html: '',
          fromCache: false,
          error: '',
        })
      }

      try {
        const res = await getRppgScanLlmInterpretation(id, { regenerate })
        if (seq !== requestSeqRef.current) return
        const parsed = parseLlmInterpretationResponse(res)
        if (!parsed.html.trim()) {
          setState({ scanId: id, phase: 'empty', html: '', fromCache: false, error: '' })
        } else {
          setState({
            scanId: id,
            phase: 'ready',
            html: parsed.html,
            fromCache: parsed.fromCache,
            error: '',
          })
        }
      } catch (e) {
        if (seq !== requestSeqRef.current) return
        setState({
          scanId: id,
          phase: 'error',
          html: '',
          fromCache: false,
          error: e instanceof Error ? e.message : t('scanInterpretation.error'),
        })
      } finally {
        if (seq === requestSeqRef.current) {
          setRegenerating(false)
        }
      }
    },
    [t],
  )

  const prefetch = useCallback((scanId) => load(scanId, { regenerate: false }), [load])

  const regenerate = useCallback((scanId) => load(scanId, { regenerate: true }), [load])

  const reset = useCallback(() => {
    requestSeqRef.current += 1
    setRegenerating(false)
    setState(IDLE)
  }, [])

  return {
    ...state,
    regenerating,
    prefetch,
    regenerate,
    load,
    reset,
  }
}
