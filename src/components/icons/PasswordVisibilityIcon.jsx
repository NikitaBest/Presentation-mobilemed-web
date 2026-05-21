import './PasswordVisibilityIcon.css'

/**
 * @param {{ visible: boolean, className?: string }} props
 */
export function PasswordVisibilityIcon({ visible, className = '' }) {
  const classes = ['password-visibility-icon', className].filter(Boolean).join(' ')

  if (visible) {
    return (
      <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3L21 21"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M10.58 10.58C10.21 10.95 10 11.45 10 12C10 13.1 10.9 14 12 14C12.55 14 13.05 13.79 13.42 13.42"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.88 5.1C10.6 4.96 11.29 4.88 12 4.88C16.48 4.88 20.22 7.76 21.5 12C20.93 13.87 19.73 15.49 18.13 16.63M14.12 17.78C13.45 17.92 12.73 18 12 18C7.52 18 3.78 15.12 2.5 11C3.07 9.13 4.27 7.51 5.87 6.37"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12C3.78 7.76 7.52 4.88 12 4.88C16.48 4.88 20.22 7.76 21.5 12C20.22 16.24 16.48 19.12 12 19.12C7.52 19.12 3.78 16.24 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  )
}
