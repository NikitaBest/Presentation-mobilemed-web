import './ChoiceCard.css'

/**
 * Минималистичный выбор: иконка + подпись в одну линию.
 */
export function ChoiceCard({ label, icon, selected, onClick, value }) {
  return (
    <button
      type="button"
      className={`choice-card${selected ? ' choice-card--selected' : ''}`}
      aria-pressed={selected}
      aria-label={label}
      onClick={() => onClick(value)}
    >
      {icon ? (
        <span className="choice-card__icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="choice-card__label">{label}</span>
    </button>
  )
}
