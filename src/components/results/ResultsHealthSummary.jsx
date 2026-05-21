import { HealthScoreCore } from '../HealthScoreCore.jsx'
import { healthScoreBand } from '../healthScoreBand.js'
import { useI18n } from '../../i18n/useI18n.js'
import { countTranscriptsByColor } from '../../utils/metricTranscript.js'
import './ResultsHealthSummary.css'

/**
 * @param {{
 *   score: number | string | null | undefined,
 *   transcripts: unknown[],
 * }} props
 */
export function ResultsHealthSummary({ score, transcripts }) {
  const { t } = useI18n()
  const band = healthScoreBand(score)
  const caption = t(`healthScore.band.${band}`)
  const { total, green, yellow, red } = countTranscriptsByColor(transcripts)

  return (
    <div className={`results-health-summary health-core--${band}`}>
      <HealthScoreCore score={score} layout="compact" />
      <div className="results-health-summary__body">
        <p className="results-health-summary__title">{t('healthScore.label')}</p>
        <p className={`results-health-summary__pill results-health-summary__pill--${band}`}>
          {caption}
        </p>
        {total > 0 ? (
          <dl className="results-health-summary__stats">
            <div className="results-health-summary__stat results-health-summary__stat--total">
              <dt>{t('results.metricsTotalLabel')}</dt>
              <dd>{total}</dd>
            </div>
            <div className="results-health-summary__stat results-health-summary__stat--green">
              <dt>
                <span className="results-health-summary__dot" aria-hidden />
                {t('results.metricsGreenLabel')}
              </dt>
              <dd>{green}</dd>
            </div>
            <div className="results-health-summary__stat results-health-summary__stat--yellow">
              <dt>
                <span className="results-health-summary__dot" aria-hidden />
                {t('results.metricsYellowLabel')}
              </dt>
              <dd>{yellow}</dd>
            </div>
            <div className="results-health-summary__stat results-health-summary__stat--red">
              <dt>
                <span className="results-health-summary__dot" aria-hidden />
                {t('results.metricsRedLabel')}
              </dt>
              <dd>{red}</dd>
            </div>
          </dl>
        ) : (
          <p className="results-health-summary__no-metrics">{t('results.metricsBreakdownEmpty')}</p>
        )}
      </div>
    </div>
  )
}
