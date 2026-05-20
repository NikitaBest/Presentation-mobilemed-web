import './LanguageSwitch.css'

/**
 * Переключатель ru/en (доступность: role="radiogroup").
 */
export function LanguageSwitch({
  value,
  onChange,
  disabled,
  labels,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}) {
  return (
    <div
      className="lang-switch"
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      {(['ru', 'en']).map((code) => (
        <button
          key={code}
          type="button"
          role="radio"
          aria-checked={value === code}
          className={`lang-switch__btn${value === code ? ' lang-switch__btn--active' : ''}`}
          disabled={disabled}
          onClick={() => onChange(code)}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  )
}
