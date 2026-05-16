import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppLayout } from '../components/AppLayout.jsx'
import { HealthScoreCore } from '../components/HealthScoreCore.jsx'
import { MetricCardsGrid } from '../components/metrics/MetricCardsGrid.jsx'
import { MetricDetailSheet } from '../components/metrics/MetricDetailSheet.jsx'
import { getScansHistory } from '../api/scanHistory.js'
import { filterDisplayableTranscripts } from '../utils/metricTranscript.js'
import './ResultsPage.css'

function selectScanRow(response, preferredScanId) {
  const rows = response?.value?.data
  if (!Array.isArray(rows) || rows.length === 0) return { row: null, matchedPreferred: false }
  if (preferredScanId) {
    const hit = rows.find((r) => r?.scan?.id === preferredScanId)
    if (hit) return { row: hit, matchedPreferred: true }
    return { row: rows[0], matchedPreferred: false }
  }
  return { row: rows[0], matchedPreferred: true }
}

/**
 * Итог после сканирования: POST /scan/save-rppg + расшифровка из GET /scan/get.
 */
export function ResultsPage({ onGoHome, onMeasureAgain, scanSummary }) {
  const preferredScanId =
    scanSummary?.value?.scan?.id ?? scanSummary?.value?.rppgScanId ?? null
  const saveOk = scanSummary && scanSummary.isSuccess !== false

  const [phase, setPhase] = useState('loading')
  const [fetchError, setFetchError] = useState('')
  const [row, setRow] = useState(null)
  const [matchedPreferred, setMatchedPreferred] = useState(true)
  const [selectedTranscript, setSelectedTranscript] = useState(null)
  const [tapHintActive, setTapHintActive] = useState(false)
  const [tapHintExiting, setTapHintExiting] = useState(false)

  const load = useCallback(async () => {
    setPhase('loading')
    setFetchError('')
    try {
      const res = await getScansHistory({ pageNumber: 1, pageSize: 10 })
      const { row: next, matchedPreferred: mp } = selectScanRow(res, preferredScanId)
      setRow(next)
      setMatchedPreferred(mp)
      setPhase(next ? 'ready' : 'empty')
    } catch (e) {
      setPhase('error')
      setFetchError(e instanceof Error ? e.message : 'Не удалось загрузить результаты')
      setRow(null)
    }
  }, [preferredScanId])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- загрузка GET /scan/get при входе на экран результатов */
    void load()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [load])

  const healthScore = row?.healthScore

  const displayTranscripts = useMemo(
    () => filterDisplayableTranscripts(row?.transcripts),
    [row?.transcripts],
  )

  useEffect(() => {
    if (phase !== 'ready' || displayTranscripts.length === 0) {
      setTapHintActive(false)
      setTapHintExiting(false)
      return
    }

    setTapHintActive(true)
    setTapHintExiting(false)

    const exitTimer = window.setTimeout(() => setTapHintExiting(true), 2600)
    const hideTimer = window.setTimeout(() => {
      setTapHintActive(false)
      setTapHintExiting(false)
    }, 3200)

    return () => {
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
    }
  }, [phase, displayTranscripts.length])

  const dismissTapHint = useCallback(() => {
    setTapHintExiting(true)
    window.setTimeout(() => {
      setTapHintActive(false)
      setTapHintExiting(false)
    }, 450)
  }, [])

  const handleMetricSelect = useCallback((transcript) => {
    setSelectedTranscript(transcript)
    setTapHintActive(false)
    setTapHintExiting(false)
  }, [])

  return (
    <AppLayout>
      <div
        className={`results-page${tapHintActive ? ' results-page--tap-hint' : ''}${tapHintExiting ? ' results-page--tap-hint-exit' : ''}`}
      >
        <header className="results-page__header">
          <span className="results-page__brand">MobileMed</span>
          <div className="results-page__header-main">
            <h1 className="results-page__title">Результаты</h1>
            <p className="results-page__lead">
              {saveOk
                ? 'Сводка по последнему сканированию: общая оценка и детали по каждому показателю.'
                : 'Данные последнего скана не сохранены — при необходимости пройдите измерение заново.'}
            </p>
          </div>
        </header>

        <div className="results-page__scroll page-body">
        {phase === 'loading' ? (
          <p className="results-loading">Загружаем расшифровку…</p>
        ) : null}

        {phase === 'error' ? (
          <div className="results-error">
            <p className="results-error-text">{fetchError}</p>
            <button type="button" className="btn-secondary results-error-retry" onClick={load}>
              Повторить
            </button>
          </div>
        ) : null}

        {phase === 'empty' ? (
          <p className="results-empty">
            В истории пока нет сканов с расшифровкой. После успешного сохранения измерения данные
            появятся здесь.
          </p>
        ) : null}

        {phase === 'ready' && row ? (
          <>
            {preferredScanId && !matchedPreferred ? (
              <p className="page-text page-text--note results-id-mismatch">
                Расшифровка только что сохранённого скана ещё не в списке — показан последний доступный
                скан. Обновите страницу через несколько секунд или нажмите «Повторить».
              </p>
            ) : null}

            <section className="results-hero" aria-label="Общий показатель здоровья">
              <HealthScoreCore score={healthScore} layout="hero" />
            </section>

            {displayTranscripts.length > 0 ? (
              <section className="results-metrics" aria-label="Все показатели">
                <h2 className="results-section-title">Все показатели</h2>
                <MetricCardsGrid
                  transcripts={displayTranscripts}
                  onSelect={handleMetricSelect}
                  tapHintActive={tapHintActive}
                  tapHintExiting={tapHintExiting}
                  onTapHintDismiss={dismissTapHint}
                />
              </section>
            ) : (
              <p className="page-text page-text--note">
                Расшифровка показателей пока пуста. Данные могут появиться после обработки на сервере.
              </p>
            )}
          </>
        ) : null}
        </div>

        <MetricDetailSheet transcript={selectedTranscript} onClose={() => setSelectedTranscript(null)} />

        <footer className="page-dock results-page__dock" aria-label="Действия">
          <div className="results-page__dock-inner">
            <button
              type="button"
              className="results-page__btn results-page__btn--primary"
              onClick={onMeasureAgain}
            >
              Измерить снова
            </button>
            <button
              type="button"
              className="results-page__btn results-page__btn--outline"
              onClick={onGoHome}
            >
              На главную
            </button>
          </div>
          <p className="results-page__disclaimer">
            Данный анализ не заменяет медицинскую консультацию.
          </p>
        </footer>
      </div>
    </AppLayout>
  )
}
