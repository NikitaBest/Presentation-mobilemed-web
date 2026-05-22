import { useCallback, useRef, useState } from 'react'
import { getRppgScanLlmInterpretation, parseLlmInterpretationResponse } from '../api/scan.js'

const IDLE = {
  scanId: null,
  phase: 'idle',
  html: '',
  fromCache: false,
  error: '',
}

/** @typedef {'idle' | 'loading' | 'ready' | 'empty' | 'error'} InterpretationPhase */

/**
 * @param {InterpretationPhase} phase
 * @returns {boolean}
 */
function isInterpretationSettled(phase) {
  return phase === 'ready' || phase === 'empty' || phase === 'error'
}

/**
 * @param {(key: string, vars?: Record<string, string>) => string} t
 */
export function useScanLlmInterpretation(t) {
  const [state, setState] = useState(IDLE)
  const [regenerating, setRegenerating] = useState(false)
  const stateRef = useRef(state)
  const requestSeqRef = useRef(0)
  /** @type {import('react').RefObject<Map<string, typeof IDLE>>} */
  const cacheRef = useRef(new Map())
  /** @type {import('react').RefObject<Map<string, Promise<void>>>} */
  const inflightRef = useRef(new Map())
  stateRef.current = state

  const applyState = useCallback((entry) => {
    setState(entry)
    stateRef.current = entry
    if (entry.scanId) {
      cacheRef.current.set(entry.scanId, entry)
    }
  }, [])

  const load = useCallback(
    async (scanId, { regenerate = false } = {}) => {
      const id = String(scanId ?? '').trim()
      if (!id) return

      if (!regenerate) {
        const cached = cacheRef.current.get(id)
        if (cached && isInterpretationSettled(cached.phase)) {
          if (stateRef.current.scanId !== id || stateRef.current.phase !== cached.phase) {
            applyState({ ...cached, scanId: id })
          }
          return
        }

        const inflight = inflightRef.current.get(id)
        if (inflight) {
          return inflight
        }

        const cur = stateRef.current
        if (cur.scanId === id && (cur.phase === 'loading' || cur.phase === 'ready' || cur.phase === 'empty')) {
          return
        }
      } else {
        inflightRef.current.delete(id)
      }

      const seq = ++requestSeqRef.current

      const run = async () => {
        if (regenerate) {
          setRegenerating(true)
        } else {
          applyState({
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
            applyState({ scanId: id, phase: 'empty', html: '', fromCache: false, error: '' })
          } else {
            applyState({
              scanId: id,
              phase: 'ready',
              html: parsed.html,
              fromCache: parsed.fromCache,
              error: '',
            })
          }
        } catch (e) {
          if (seq !== requestSeqRef.current) return
          applyState({
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
      }

      const promise = run()
      if (!regenerate) {
        inflightRef.current.set(id, promise)
      }
      try {
        await promise
      } finally {
        inflightRef.current.delete(id)
      }
    },
    [applyState, t],
  )

  const prefetch = useCallback((scanId) => load(scanId, { regenerate: false }), [load])

  const regenerate = useCallback((scanId) => load(scanId, { regenerate: true }), [load])

  const reset = useCallback(() => {
    requestSeqRef.current += 1
    inflightRef.current.clear()
    cacheRef.current.clear()
    setRegenerating(false)
    setState(IDLE)
    stateRef.current = IDLE
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
