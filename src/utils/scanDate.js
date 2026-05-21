/**
 * @param {string | undefined} iso
 * @param {'ru' | 'en'} locale
 */
export function formatScanWhen(iso, locale) {
  if (!iso) return { date: '—', time: '' }
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return { date: '—', time: '' }
    const loc = locale === 'en' ? 'en-GB' : 'ru-RU'
    return {
      date: d.toLocaleDateString(loc, { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' }),
    }
  } catch {
    return { date: '—', time: '' }
  }
}
