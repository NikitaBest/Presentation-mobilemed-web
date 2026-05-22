/** Путь из src/assets/davlen.svg (viewBox 0 0 28 28). */
const DEFAULT_METRIC_PATH =
  'M5 11L9 7M9 7L13 11M9 7V21M23 17L19 21M19 21L15 17M19 21V7'

/**
 * Иконка по умолчанию для прочих показателей (src/assets/davlen.svg).
 */
export function DefaultMetricIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" focusable="false" aria-hidden>
      <path
        d={DEFAULT_METRIC_PATH}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
