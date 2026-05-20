/** @returns {'green' | 'yellow' | 'red' | 'unknown'} */
export function healthScoreBand(score) {
  if (score == null || score === '') return 'unknown'
  const n = Number(score)
  if (!Number.isFinite(n)) return 'unknown'
  if (n >= 70) return 'green'
  if (n >= 40) return 'yellow'
  return 'red'
}

