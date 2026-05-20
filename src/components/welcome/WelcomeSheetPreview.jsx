import { MetricScaleBar } from '../metrics/MetricScaleBar.jsx'
import { metricStatusClass, transcriptColorKey } from '../../utils/metricTranscript.js'
import { useI18n } from '../../i18n/useI18n.js'
import './WelcomeSheetPreview.css'

/**
 * Статичное превью нижнего окна расшифровки на главной.
 * @param {{ detail: object }} props
 */
export function WelcomeSheetPreview({ detail }) {
  const { t } = useI18n()
  const color = transcriptColorKey(detail)

  return (
    <div className="welcome-sheet-preview" aria-hidden>
      <p className="welcome-sheet-preview__caption">{t('welcome.sheetCaption')}</p>
      <div className="welcome-sheet-preview__panel">
        <div className="welcome-sheet-preview__handle" />
        <h3 className="welcome-sheet-preview__title">{detail.name}</h3>
        <p className="welcome-sheet-preview__value-row">
          <span className="welcome-sheet-preview__value">{detail.value}</span>
          {detail.unit ? (
            <span className="welcome-sheet-preview__unit">{detail.unit}</span>
          ) : null}
        </p>
        {detail.status ? (
          <p className="welcome-sheet-preview__status">
            <span className={metricStatusClass(color)}>{detail.status}</span>
          </p>
        ) : null}
        {detail.commentUser ? (
          <p className="welcome-sheet-preview__comment">{detail.commentUser}</p>
        ) : null}
        {detail.scaleMetadata ? (
          <div className="welcome-sheet-preview__scale">
            <MetricScaleBar scaleMetadata={detail.scaleMetadata} />
          </div>
        ) : null}
        {detail.descriptionUser ? (
          <p className="welcome-sheet-preview__description">{detail.descriptionUser}</p>
        ) : null}
        <span className="welcome-sheet-preview__btn">{t('welcome.sheetOk')}</span>
      </div>
    </div>
  )
}
