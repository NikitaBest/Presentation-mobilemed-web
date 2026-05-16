const ICONS = {
  pulseRate: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  ),
  respirationRate: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3c-1.5 2.2-3.2 3.8-5 5.2-.9.7-1.8 1.4-2.5 2.2 1.4 1.2 3 2.2 4.8 2.8 1.2.4 2.4.6 3.7.6s2.5-.2 3.7-.6c1.8-.6 3.4-1.6 4.8-2.8-.7-.8-1.6-1.5-2.5-2.2C15.2 6.8 13.5 5.2 12 3zm0 18c1.5-2.2 3.2-3.8 5-5.2.9-.7 1.8-1.4 2.5-2.2-1.4-1.2-3-2.2-4.8-2.8-1.2-.4-2.4-.6-3.7-.6s-2.5.2-3.7.6c-1.8.6-3.4 1.6-4.8 2.8.7.8 1.6 1.5 2.5 2.2 1.8 1.4 3.5 3 5 5.2z"
      />
    </svg>
  ),
  bloodPressureSystolic: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
      <path fill="currentColor" d="M12 4l-6 8h4v8h4v-8h4l-6-8z" />
    </svg>
  ),
  bloodPressureDiastolic: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
      <path fill="currentColor" d="M12 20l6-8h-4V4h-4v8H6l6 8z" />
    </svg>
  ),
  hemoglobin: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2c-3.5 3.2-6 6.4-6 10a6 6 0 1012 0c0-3.6-2.5-6.8-6-10zm0 14a4 4 0 110-8 4 4 0 010 8z"
      />
    </svg>
  ),
  hemoglobinA1c: (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2c-3.5 3.2-6 6.4-6 10a6 6 0 1012 0c0-3.6-2.5-6.8-6-10zm0 14a4 4 0 110-8 4 4 0 010 8z"
      />
    </svg>
  ),
}

const DEFAULT_ICON = (
  <svg viewBox="0 0 24 24" focusable="false" aria-hidden>
    <path
      fill="currentColor"
      d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"
    />
  </svg>
)

export function MetricIcon({ metricKey }) {
  return ICONS[metricKey] ?? DEFAULT_ICON
}
