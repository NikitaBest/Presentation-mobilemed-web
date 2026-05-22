import { CardiacMetricIcon } from '../icons/CardiacMetricIcon.jsx'
import { DefaultMetricIcon } from '../icons/DefaultMetricIcon.jsx'
import { RespirationMetricIcon } from '../icons/RespirationMetricIcon.jsx'
import { usesCardiacMetricIcon, usesRespirationMetricIcon } from '../../utils/metricIconKey.js'

/**
 * @param {{ metricKey?: string | null, metricName?: string | null }} props
 */
export function MetricIcon({ metricKey, metricName }) {
  if (usesRespirationMetricIcon(metricKey, metricName)) {
    return <RespirationMetricIcon />
  }
  if (usesCardiacMetricIcon(metricKey, metricName)) {
    return <CardiacMetricIcon />
  }
  return <DefaultMetricIcon />
}
