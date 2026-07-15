import { postureAxisTone } from '../../sdk/captureGuidance.js'
import './ScanPostureIndicators.css'

/**
 * @param {{
 *   summary: { face: number, light: number, device: number | null, overall: number | null } | null,
 *   t: (key: string) => string,
 *   compact?: boolean,
 * }} props
 */
export function ScanPostureIndicators({ summary, t, compact = false }) {
  if (!summary) return null

  const axes = [
    { id: 'face', label: t('scan.pgs.axis.face'), status: summary.face },
    { id: 'light', label: t('scan.pgs.axis.light'), status: summary.light },
    {
      id: 'device',
      label: t('scan.pgs.axis.device'),
      status: summary.device,
      naLabel: t('scan.pgs.axis.deviceNa'),
    },
  ]

  return (
    <ul
      className={['scan-pgs-axes', compact ? 'scan-pgs-axes--compact' : ''].filter(Boolean).join(' ')}
      aria-label={t('scan.pgs.axesAria')}
    >
      {axes.map((axis) => {
        const tone = postureAxisTone(axis.status)
        const statusLabel =
          tone === 'na' ? axis.naLabel : t(`scan.pgs.axisStatus.${tone}`)
        return (
          <li key={axis.id} className={`scan-pgs-axis scan-pgs-axis--${tone}`}>
            <span className="scan-pgs-axis__dot" aria-hidden />
            <span className="scan-pgs-axis__label">{axis.label}</span>
            {!compact ? <span className="scan-pgs-axis__status">{statusLabel}</span> : null}
          </li>
        )
      })}
    </ul>
  )
}
